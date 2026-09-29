/**
 * The dev-only voice audition endpoint (TASK-134, voice spec §74). SERVER ONLY.
 * `GET /api/dev/tushky-voice?sample=A&voice=Achird` → WAV of one fixed audition sample in one prebuilt
 * voice. It 404s unless `NODE_ENV === "development"` (`pnpm dev`): a production or preview build —
 * even one with `ALLOW_DEV_ROUTES` — never exposes it, because each call spends TTS quota. It takes
 * only a sample id and a voice NAME from fixed lists, never text.
 */
import { AUDITION_VOICES, PREBUILT_VOICES, TUSHKY_VOICE } from "@/config/tushky-voice";
import { auditionSample } from "./audition";
import { toSpeechText } from "./speech-text";
import { TtsError, tushkyTtsRequest, type TtsClient } from "./tts-client";

export interface AuditionDeps {
  tts: TtsClient;
  nodeEnv: string | undefined;
  model: string;
}

const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

export async function handleAuditionRequest(request: Request, deps: AuditionDeps): Promise<Response> {
  if (deps.nodeEnv !== "development") return notFound();
  const url = new URL(request.url);
  const sample = auditionSample(url.searchParams.get("sample") ?? "");
  const voice = url.searchParams.get("voice") ?? AUDITION_VOICES[0].name;
  if (!sample || !(PREBUILT_VOICES as readonly string[]).includes(voice)) {
    return new Response(JSON.stringify({ code: "invalid-request" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  try {
    const { speechText } = toSpeechText(sample.text);
    const result = await deps.tts.synthesize({
      ...tushkyTtsRequest(speechText, { voice, model: deps.model }),
      signal: AbortSignal.timeout(TUSHKY_VOICE.limits.timeoutMs),
    });
    return new Response(result.audio as unknown as BodyInit, {
      headers: { "content-type": result.mimeType, "cache-control": "no-store" },
    });
  } catch (err) {
    const code = err instanceof TtsError ? err.code : "upstream";
    return new Response(JSON.stringify({ code }), { status: code === "quota" ? 503 : 502, headers: { "content-type": "application/json" } });
  }
}
