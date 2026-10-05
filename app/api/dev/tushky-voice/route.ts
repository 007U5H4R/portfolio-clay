/**
 * GET /api/dev/tushky-voice (TASK-134, voice spec §74) — the dev-only audition endpoint behind
 * `/dev/tushky-voice`. 404 outside `pnpm dev`; logic in `lib/tushky-voice/audition-route.ts`.
 */
import { ttsModel } from "@/config/tushky-voice";
import { handleAuditionRequest } from "@/lib/tushky-voice/audition-route";
import { geminiClientFromEnv } from "@/lib/tushky-voice/tts-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleAuditionRequest(request, { tts: geminiClientFromEnv(), nodeEnv: process.env.NODE_ENV, model: ttsModel() });
}
