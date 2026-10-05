/**
 * POST /api/tushky/speech (TASK-134, voice spec §11) — the site's first server function, and the only
 * dynamic route besides the dev-only audition route (`scripts/assert-static.ts`, Design.md §11
 * Dev-133). It speaks a real Tushky answer, recomputed on the server from the question; it never
 * takes text to speak. All logic lives in `lib/tushky-voice/speech-route.ts` (unit-tested).
 */
import { handleSpeechRequest } from "@/lib/tushky-voice/speech-route";
import { defaultSpeechDeps } from "@/lib/tushky-voice/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** The Gemini call has a 20 s deadline (config/tushky-voice.ts); leave headroom above it. */
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  return handleSpeechRequest(request, defaultSpeechDeps());
}
