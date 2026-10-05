/**
 * tushky-voice-audition.ts (TASK-134, voice spec §37, §61, §74–75) — render the audition samples in
 * the shortlisted prebuilt voices so Tushar can listen and pick one. MANUAL ONLY; spends TTS quota.
 *
 *   pnpm exec tsx scripts/tushky-voice-audition.ts [--voices Achird,Umbriel] [--samples A,B,C,D,E,P]
 *
 * Writes `.eval/tushky-voice-audition/<voice>/<sample>.wav` (git-ignored) and prints each clip's
 * generation time (ttsGenerationMs, §61) and length. Needs `GEMINI_API_KEY` (never printed). The same
 * samples play live on `/dev/tushky-voice` under `pnpm dev`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { AUDITION_VOICES, PREBUILT_VOICES, TUSHKY_VOICE, ttsModel } from "@/config/tushky-voice";
import { AUDITION_SAMPLES } from "@/lib/tushky-voice/audition";
import { toSpeechText } from "@/lib/tushky-voice/speech-text";
import { geminiClientFromEnv, TtsError, tushkyTtsRequest } from "@/lib/tushky-voice/tts-client";
import { wavDurationMs } from "@/lib/tushky-voice/wav";

const OUT = resolve(process.cwd(), ".eval/tushky-voice-audition");
const list = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1]?.split(",").map((s) => s.trim()).filter(Boolean);
};

async function main(): Promise<number> {
  const voices = list("--voices") ?? AUDITION_VOICES.map((v) => v.name);
  const unknown = voices.filter((v) => !(PREBUILT_VOICES as readonly string[]).includes(v));
  if (unknown.length) {
    console.error(`Unknown prebuilt voice(s): ${unknown.join(", ")}`);
    return 1;
  }
  const ids = list("--samples");
  const samples = AUDITION_SAMPLES.filter((s) => !ids || ids.includes(s.id));
  const client = geminiClientFromEnv();
  if (!client.configured) {
    console.error("GEMINI_API_KEY is not set in this shell. Nothing was generated.");
    return 1;
  }
  const model = ttsModel();
  console.log(`Audition · model ${model} · ${TUSHKY_VOICE.version} · ${voices.length} voices × ${samples.length} samples`);
  for (const voice of voices) {
    mkdirSync(join(OUT, voice), { recursive: true });
    for (const sample of samples) {
      const started = Date.now();
      try {
        const { audio } = await client.synthesize({
          ...tushkyTtsRequest(toSpeechText(sample.text).speechText, { voice, model, format: "wav" }),
          signal: AbortSignal.timeout(60_000),
        });
        const file = join(OUT, voice, `${sample.id}.wav`);
        writeFileSync(file, audio);
        console.log(`  ${voice} ${sample.id}: ${Date.now() - started} ms, ${((wavDurationMs(audio) ?? 0) / 1000).toFixed(1)} s → ${file}`);
      } catch (err) {
        const code = err instanceof TtsError ? err.code : "upstream";
        console.error(`  ${voice} ${sample.id}: failed (${code})`);
        if (code === "quota") return 2;
      }
    }
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : "audition failed");
    process.exit(1);
  },
);
