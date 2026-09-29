import { describe, expect, it, vi } from "vitest";
import { DEFAULT_TTS_MODEL, TUSHKY_VOICE, ttsModel } from "@/config/tushky-voice";
import {
  GeminiTtsClient,
  geminiClientFromEnv,
  TtsError,
  tushkyTtsRequest,
  usesInteractionsApi,
  type TtsRequest,
} from "@/lib/tushky-voice/tts-client";
import { isWav, pcmToWav } from "@/lib/tushky-voice/wav";

/**
 * TASK-134 — the Gemini TTS client, against a MOCKED fetch only (no network). Pins the request shape
 * Google documents for Gemini 3.8 TTS (Interactions API) and the earlier previews (generateContent),
 * the WAV handling, the error mapping, and key hygiene.
 */
const KEY = "AIzaFAKE-client-test-key-000000000000";
const PCM = new Uint8Array([1, 0, 2, 0, 3, 0, 4, 0]);
const b64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const request = (model: string): TtsRequest => ({ text: "Woof woof. Hello.", style: "warm", voice: "Achird", model, format: "wav" });

describe("request shape", () => {
  it("Gemini 3.8 TTS: POST /v1beta/interactions, key in x-goog-api-key, style as speech_metadata, store:false", async () => {
    const wav = pcmToWav(PCM, { sampleRate: 24_000, channels: 1, bitsPerSample: 16 });
    const fetchMock = vi.fn(async () => json({ id: "i1", status: "completed", steps: [{ type: "model_output", content: [{ type: "audio", data: b64(wav), mime_type: "audio/wav" }] }] }));
    const client = new GeminiTtsClient({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    const result = await client.synthesize(request("gemini-3.8-flash-lite-tts"));
    const [url, init] = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(url).not.toContain(KEY);
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe(KEY);
    expect(JSON.parse(String(init.body))).toEqual({
      model: "gemini-3.8-flash-lite-tts",
      input: [{ type: "text", text: "Woof woof. Hello.", annotations: [{ type: "speech_metadata", style: "warm" }] }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: "Achird" }] },
      store: false,
    });
    expect(result.mimeType).toBe("audio/wav");
    expect(result.audio).toEqual(wav); // a WAV reply passes through, not double-wrapped
  });

  it("MP3 is requested natively for FAQ files (no encoder, no ffmpeg)", async () => {
    const fetchMock = vi.fn(async () => json({ output_audio: { data: b64(new Uint8Array([0xff, 0xfb, 0x90])), mime_type: "audio/mp3" } }));
    const client = new GeminiTtsClient({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    const result = await client.synthesize({ ...request("gemini-3.8-flash-tts"), format: "mp3" });
    const body = JSON.parse(String((fetchMock.mock.calls[0]! as unknown as [string, RequestInit])[1].body));
    expect(body.response_format).toEqual({ type: "audio", mime_type: "audio/mp3", bit_rate: 48_000 });
    expect(result.mimeType).toBe("audio/mpeg");
  });

  it("earlier previews: generateContent with responseModalities AUDIO; raw L16 PCM is wrapped as WAV", async () => {
    const fetchMock = vi.fn(async () => json({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "audio/L16;codec=pcm;rate=24000", data: b64(PCM) } }] } }] }));
    const client = new GeminiTtsClient({ apiKey: KEY, fetch: fetchMock as unknown as typeof fetch });
    const result = await client.synthesize(request("gemini-2.5-flash-preview-tts"));
    const [url, init] = fetchMock.mock.calls[0]! as unknown as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent");
    expect(JSON.parse(String(init.body)).generationConfig).toEqual({
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Achird" } } },
    });
    expect(isWav(result.audio)).toBe(true);
    expect(result.audio.length).toBe(44 + PCM.length);
    expect(Buffer.from(result.audio.subarray(24, 28)).readUInt32LE(0)).toBe(24_000);
  });

  it("model family detection", () => {
    expect(usesInteractionsApi("gemini-3.8-flash-lite-tts")).toBe(true);
    expect(usesInteractionsApi("gemini-3.8-flash-tts")).toBe(true);
    expect(usesInteractionsApi("gemini-3.1-flash-tts-preview")).toBe(false);
    expect(usesInteractionsApi("gemini-2.5-pro-preview-tts")).toBe(false);
  });
});

describe("errors (§57–58) and key hygiene (§11–12)", () => {
  const withReply = (reply: Response | (() => never)) =>
    new GeminiTtsClient({ apiKey: KEY, fetch: vi.fn(async () => (typeof reply === "function" ? reply() : reply)) as unknown as typeof fetch });

  it("no key → not-configured, and fetch is never called", async () => {
    const fetchMock = vi.fn();
    const client = new GeminiTtsClient({ apiKey: "  ", fetch: fetchMock as unknown as typeof fetch });
    await expect(client.synthesize(request(DEFAULT_TTS_MODEL))).rejects.toMatchObject({ code: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.configured).toBe(false);
  });

  it.each([
    [json({ error: { code: 429, status: "RESOURCE_EXHAUSTED", message: `Quota exceeded for ${KEY}` } }, 429), "quota"],
    [json({ error: { status: "RESOURCE_EXHAUSTED" } }, 400), "quota"],
    [json({ error: { status: "PERMISSION_DENIED", message: "API key not valid" } }, 403), "not-configured"],
    [json({ error: { status: "INTERNAL" } }, 500), "upstream"],
    [new Response("<html>gateway</html>", { status: 502 }), "upstream"],
    [json({ candidates: [] }), "bad-response"],
    [json({ steps: [{ type: "model_output", content: [{ type: "text", text: "no audio" }] }] }), "bad-response"],
  ] as const)("%# → %s, and the thrown error carries no provider text or key", async (reply, code) => {
    const err = await withReply(reply).synthesize(request(DEFAULT_TTS_MODEL)).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TtsError);
    expect((err as TtsError).code).toBe(code);
    expect(String((err as Error).message)).not.toMatch(/Quota exceeded|API key|AIza/);
    expect(JSON.stringify(err)).not.toContain(KEY);
  });

  it("an aborted request (our deadline) → timeout", async () => {
    const client = withReply(() => {
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });
    await expect(client.synthesize(request(DEFAULT_TTS_MODEL))).rejects.toMatchObject({ code: "timeout" });
  });

  it("the key comes from GEMINI_API_KEY only; there is no NEXT_PUBLIC_ variant", () => {
    expect(geminiClientFromEnv({ GEMINI_API_KEY: KEY }).configured).toBe(true);
    expect(geminiClientFromEnv({ NEXT_PUBLIC_GEMINI_API_KEY: KEY }).configured).toBe(false);
  });
});

describe("config (§9, §36)", () => {
  it("the model is configurable through GEMINI_TTS_MODEL, defaulting to gemini-3.8-flash-lite-tts", () => {
    expect(ttsModel({})).toBe("gemini-3.8-flash-lite-tts");
    expect(ttsModel({ GEMINI_TTS_MODEL: "gemini-3.8-flash-tts" })).toBe("gemini-3.8-flash-tts");
    expect(ttsModel({ GEMINI_TTS_MODEL: "../../evil path" })).toBe(DEFAULT_TTS_MODEL);
  });
  it("tushkyTtsRequest takes the voice and the style from the one config", () => {
    const req = tushkyTtsRequest("Hello.", { model: "m" });
    expect(req).toMatchObject({ text: "Hello.", voice: TUSHKY_VOICE.voice, style: TUSHKY_VOICE.style, model: "m", format: "wav" });
  });
  it("the style direction describes qualities and never names a character or asks for imitation (§2, §38–39)", () => {
    expect(TUSHKY_VOICE.style).toMatch(/Never imitate a specific existing fictional character/);
    expect(TUSHKY_VOICE.style).not.toMatch(/goofy'?s voice|disney|pluto|scooby/i);
  });
});
