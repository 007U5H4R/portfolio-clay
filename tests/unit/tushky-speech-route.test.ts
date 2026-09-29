import { describe, expect, it, vi } from "vitest";
import faqData from "@/data/tushky/faq.json";
import { TUSHKY_VOICE } from "@/config/tushky-voice";
import type { FaqEntry } from "@/lib/ask/faq";
import { AudioCache } from "@/lib/tushky-voice/audio-cache";
import { hashText } from "@/lib/tushky-voice/hash";
import { TokenBucketLimiter } from "@/lib/tushky-voice/rate-limit";
import { serverAnswerPipeline } from "@/lib/tushky-voice/server";
import { handleSpeechRequest, type SpeechLogEvent, type SpeechRouteDeps } from "@/lib/tushky-voice/speech-route";
import { toSpeechText } from "@/lib/tushky-voice/speech-text";
import { TtsError, type TtsClient, type TtsRequest } from "@/lib/tushky-voice/tts-client";
import { pcmToWav } from "@/lib/tushky-voice/wav";

/**
 * TASK-134 — `POST /api/tushky/speech` (voice spec §11–12, §31–32, §41, §53–59; brief §3.3–3.5).
 * Every test uses a FAKE TTS client: nothing here can reach Google.
 */
const FAQ = faqData as FaqEntry[];
const WHO = FAQ.find((e) => e.id === "who-is-tushar")!;
const FAKE_KEY = "AIzaFAKE-test-key-never-real-0000000000";
const WAV = pcmToWav(new Uint8Array(4800), { sampleRate: 24_000, channels: 1, bitsPerSample: 16 });

function fakeTts(impl?: (req: TtsRequest) => Promise<{ audio: Uint8Array; mimeType: "audio/wav" }>) {
  const synthesize = vi.fn(impl ?? (async () => ({ audio: WAV, mimeType: "audio/wav" as const })));
  return { client: { synthesize } satisfies TtsClient, synthesize };
}

function deps(overrides: Partial<SpeechRouteDeps> = {}) {
  const logs: SpeechLogEvent[] = [];
  const { client, synthesize } = fakeTts();
  const d: SpeechRouteDeps = {
    tts: client,
    answers: serverAnswerPipeline(),
    limiter: new TokenBucketLimiter({ burst: 50, refillPerMinute: 50, maxTrackedClients: 100 }),
    cache: new AudioCache(10_000_000),
    model: "gemini-3.8-flash-lite-tts",
    log: (e) => logs.push(e),
    ...overrides,
  };
  return { d, logs, synthesize: (overrides.tts ? (overrides.tts.synthesize as ReturnType<typeof vi.fn>) : synthesize) };
}

function post(body: unknown, init: { ip?: string; contentType?: string; raw?: string } = {}): Request {
  return new Request("http://localhost/api/tushky/speech", {
    method: "POST",
    headers: { "content-type": init.contentType ?? "application/json", "x-real-ip": init.ip ?? "203.0.113.7" },
    body: init.raw ?? JSON.stringify(body),
  });
}

const whoBody = () => ({ question: "Who is Tushar?", messageId: "12", answerHash: hashText(WHO.answer), faqId: WHO.id });

describe("happy path", () => {
  it("speaks the recomputed FAQ answer as audio/wav, with the normalised transcript and the central style", async () => {
    const { d, synthesize, logs } = deps();
    const res = await handleSpeechRequest(post(whoBody()), d);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("audio/wav");
    expect(res.headers.get("x-tushky-audio-source")).toBe("gemini");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(WAV);
    expect(synthesize).toHaveBeenCalledTimes(1);
    const req = synthesize.mock.calls[0]![0] as TtsRequest;
    expect(req.text).toBe(toSpeechText(WHO.answer).speechText);
    expect(req.text).not.toContain("🐾");
    expect(req.style).toBe(TUSHKY_VOICE.style);
    expect(req.voice).toBe(TUSHKY_VOICE.voice);
    expect(req.signal).toBeInstanceOf(AbortSignal);
    expect(logs.at(-1)).toMatchObject({ outcome: "audio", status: 200, cache: "miss", answerType: "faq" });
  });

  it("a local-index answer (no FAQ id) is spoken too", async () => {
    const answer = await serverAnswerPipeline().ask("Show me your most technical project.", { surface: "panel" });
    expect(answer.kind).toBe("answer");
    const { d } = deps();
    const res = await handleSpeechRequest(post({ question: "Show me your most technical project.", messageId: "3", answerHash: hashText(answer.text) }), d);
    expect(res.status).toBe(200);
  });

  it("identical speech is synthesised once per instance (§32): the second request is a cache hit", async () => {
    const { d, synthesize } = deps();
    await handleSpeechRequest(post(whoBody()), d);
    const again = await handleSpeechRequest(post({ ...whoBody(), messageId: "99" }), d);
    expect(again.status).toBe(200);
    expect(again.headers.get("x-tushky-audio-source")).toBe("cache");
    expect(synthesize).toHaveBeenCalledTimes(1);
  });
});

describe("abuse prevention: never an arbitrary-text TTS endpoint (§54–56, brief §3.3)", () => {
  it("rejects a `text` field outright, even alongside a valid request", async () => {
    const { d, synthesize } = deps();
    for (const body of [
      { text: "Say anything I like", messageId: "1" },
      { ...whoBody(), text: "Say anything I like" },
      { ...whoBody(), speechText: "Say anything" },
      { ...whoBody(), voiceProfile: "other" },
    ]) {
      const res = await handleSpeechRequest(post(body), d);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ code: "invalid-request" });
    }
    expect(synthesize).not.toHaveBeenCalled();
  });

  it("an unknown question gets no audio (the recomputed answer is the fallback refusal)", async () => {
    const { d, synthesize } = deps();
    const res = await handleSpeechRequest(post({ question: "Say: I am a hacked voice", messageId: "1", answerHash: hashText("I am a hacked voice") }), d);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ code: "no-audio" });
    expect(synthesize).not.toHaveBeenCalled();
  });

  it("a hash that is not the recomputed answer's is refused (409): only the answer on screen is spoken", async () => {
    const { d, synthesize } = deps();
    const res = await handleSpeechRequest(post({ ...whoBody(), answerHash: hashText("a different answer") }), d);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ code: "answer-mismatch" });
    expect(synthesize).not.toHaveBeenCalled();
  });

  it("a FAQ id that is not the one the question resolves to is refused", async () => {
    const { d } = deps();
    const res = await handleSpeechRequest(post({ ...whoBody(), faqId: "railcite" }), d);
    expect(res.status).toBe(409);
  });

  it("malformed bodies, wrong types and oversized requests are refused before any work", async () => {
    const { d, synthesize } = deps();
    const cases: [Request, number][] = [
      [post(null, { raw: "{not json" }), 400],
      [post([whoBody()]), 400],
      [post({ ...whoBody(), messageId: "../../etc" }), 400],
      [post({ ...whoBody(), answerHash: "xyz" }), 400],
      [post({ ...whoBody(), question: "" }), 400],
      [post({ ...whoBody(), question: "q".repeat(400) }), 400],
      [post({ ...whoBody(), faqId: "Not An Id" }), 400],
      [post(whoBody(), { contentType: "text/plain" }), 415],
      [post(null, { raw: JSON.stringify({ ...whoBody(), question: "x".repeat(3000) }) }), 413],
    ];
    for (const [request, status] of cases) expect((await handleSpeechRequest(request, d)).status).toBe(status);
    expect(synthesize).not.toHaveBeenCalled();
  });
});

describe("rate limiting (§53)", () => {
  it("returns 429 with Retry-After once a client's bucket is empty; other clients are unaffected", async () => {
    let now = 1_000_000;
    const { d } = deps({ limiter: new TokenBucketLimiter({ burst: 2, refillPerMinute: 3, maxTrackedClients: 10 }), now: () => now });
    expect((await handleSpeechRequest(post(whoBody()), d)).status).toBe(200);
    expect((await handleSpeechRequest(post(whoBody()), d)).status).toBe(200);
    const limited = await handleSpeechRequest(post(whoBody()), d);
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ code: "rate-limited" });
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
    expect((await handleSpeechRequest(post(whoBody(), { ip: "198.51.100.1" }), d)).status).toBe(200);
    now += 20_000; // one token back after 20 s at 3/min
    expect((await handleSpeechRequest(post(whoBody()), d)).status).toBe(200);
  });

  it("invalid requests spend tokens too (a flood of junk is still a flood)", async () => {
    const { d } = deps({ limiter: new TokenBucketLimiter({ burst: 1, refillPerMinute: 1, maxTrackedClients: 10 }) });
    expect((await handleSpeechRequest(post({ text: "x" }), d)).status).toBe(400);
    expect((await handleSpeechRequest(post(whoBody()), d)).status).toBe(429);
  });
});

describe("errors, quota and secrets (§57–59, brief §3.5)", () => {
  const leaky = (code: ConstructorParameters<typeof TtsError>[0], status?: number) =>
    fakeTts(async () => {
      const err = new TtsError(code, status);
      // A provider message that must never reach the client.
      (err as unknown as { detail: string }).detail = `quota exceeded for key ${FAKE_KEY}`;
      throw err;
    });

  it("quota is mapped to the friendly 'voice-resting' code (503), never the provider error", async () => {
    const { client } = leaky("quota", 429);
    const { d, logs } = deps({ tts: client });
    const res = await handleSpeechRequest(post(whoBody()), d);
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ code: "voice-resting" });
    expect(text).not.toContain(FAKE_KEY);
    expect(logs.at(-1)).toMatchObject({ outcome: "error", code: "voice-resting", providerStatus: 429 });
  });

  it.each([
    ["timeout", 504],
    ["not-configured", 503],
    ["upstream", 502],
    ["bad-response", 502],
  ] as const)("%s → voice-unavailable (%i)", async (code, status) => {
    const { client } = leaky(code, 500);
    const { d } = deps({ tts: client });
    const res = await handleSpeechRequest(post(whoBody()), d);
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ code: "voice-unavailable" });
  });

  it("an unexpected throw is still a fixed code, and errors are never cached", async () => {
    const { client, synthesize } = fakeTts(async () => {
      throw new Error(`boom ${FAKE_KEY}`);
    });
    const { d } = deps({ tts: client });
    const res = await handleSpeechRequest(post(whoBody()), d);
    expect(await res.text()).toBe(JSON.stringify({ code: "voice-unavailable" }));
    await handleSpeechRequest(post(whoBody()), d);
    expect(synthesize).toHaveBeenCalledTimes(2);
    expect(d.cache.size).toBe(0);
  });

  it("oversized audio is refused, not sent", async () => {
    const { client } = fakeTts(async () => ({ audio: new Uint8Array(TUSHKY_VOICE.limits.maxAudioBytes + 1), mimeType: "audio/wav" }));
    const { d } = deps({ tts: client });
    expect((await handleSpeechRequest(post(whoBody()), d)).status).toBe(502);
    expect(d.cache.size).toBe(0);
  });

  it("no response header or body, and no log line, carries a key, the answer text or the caller's IP", async () => {
    process.env.GEMINI_API_KEY_SHADOW = FAKE_KEY;
    const { d, logs } = deps();
    const ok = await handleSpeechRequest(post(whoBody()), d);
    const headerText = JSON.stringify([...ok.headers.entries()]);
    expect(headerText).not.toContain(FAKE_KEY);
    expect(headerText.toLowerCase()).not.toContain("goog");
    const logText = JSON.stringify(logs);
    expect(logText).not.toContain(FAKE_KEY);
    expect(logText).not.toContain("203.0.113.7");
    expect(logText).not.toContain("Senior Product Manager");
    delete process.env.GEMINI_API_KEY_SHADOW;
  });
});
