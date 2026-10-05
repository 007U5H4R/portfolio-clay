/**
 * generate-tushky-faq-audio.ts (TASK-134, voice spec §27–30, §71–73) — pre-generate Tushky's audio for
 * the most-asked FAQ answers. MANUAL ONLY: never part of `pnpm build` (§72).
 *
 *   pnpm exec tsx scripts/generate-tushky-faq-audio.ts [--ids a,b] [--all] [--force] [--dry-run] [--format mp3|wav]
 *
 * 1. loads `data/tushky/faq.json` and the audio manifest `data/tushky/faq-audio.json`
 * 2. normalises each answer's speech transcript (lib/tushky-voice/speech-text.ts)
 * 3. skips unchanged answers (same voice version, voice, profile version and speech hash, file on disk)
 *    and answers that are themselves stale against the site data (refresh the FAQ first)
 * 4. requests Gemini TTS — MP3 at 48 kb/s by default, which Gemini 3.8 TTS returns natively, so no
 *    encoder or ffmpeg is needed (§34–35); `--format wav` keeps the raw 24 kHz WAV
 * 5. saves `public/tushky/audio/faq/<id>-<voiceVersion>-<hash>.mp3` and deletes the id's old file
 * 6–7. updates the manifest with the voice version, voice, model, profile version and speech hash
 * 8. prints a generation report (and writes `.eval/tushky-faq-audio-report.json`)
 *
 * Size guard: if the FAQ audio would exceed 5 MB in total, nothing is recorded, the new files are
 * removed and the script exits 2 recommending object storage (brief §3.7).
 *
 * Needs `GEMINI_API_KEY` in the environment (never printed). `--dry-run` works without it.
 */
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { FAQ_AUDIO_DIR, FAQ_AUDIO_IDS, FAQ_AUDIO_URL_BASE, TUSHKY_VOICE, ttsModel } from "@/config/tushky-voice";
import type { FaqEntry } from "@/lib/ask/faq";
import { freshFaqIds } from "@/lib/ask/faq-versions";
import { FAQ_AUDIO_BUDGET_BYTES, faqAudioFileName, planFaqAudio, type FaqAudioManifest, type FaqAudioRecord } from "@/lib/tushky-voice/faq-audio";
import { geminiClientFromEnv, TtsError, tushkyTtsRequest } from "@/lib/tushky-voice/tts-client";
import { wavDurationMs } from "@/lib/tushky-voice/wav";

const ROOT = process.cwd();
const FAQ_PATH = resolve(ROOT, "data/tushky/faq.json");
const MANIFEST_PATH = resolve(ROOT, "data/tushky/faq-audio.json");
const REPORT_PATH = resolve(ROOT, ".eval/tushky-faq-audio-report.json");
const MP3_BIT_RATE = 48_000;

const arg = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
};
const has = (flag: string) => process.argv.includes(flag);

const publicPath = (url: string) => join(ROOT, "public", url.replace(/^\//, ""));

async function main(): Promise<number> {
  const faq = JSON.parse(readFileSync(FAQ_PATH, "utf8")) as FaqEntry[];
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as FaqAudioManifest;
  const fresh = freshFaqIds(faq);
  const ids = has("--all") ? faq.map((e) => e.id) : (arg("--ids")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [...FAQ_AUDIO_IDS]);
  const format = arg("--format") === "wav" ? "wav" : "mp3";
  const model = ttsModel();
  const plan = planFaqAudio(faq, manifest, fresh, ids, (url) => existsSync(publicPath(url)), has("--force"));

  console.log(`Tushky FAQ audio · voice ${TUSHKY_VOICE.voice} · ${TUSHKY_VOICE.version} · model ${model} · ${format}`);
  for (const p of plan) console.log(`  ${p.action === "generate" ? "GENERATE" : "skip    "} ${p.id} (${p.reason})`);
  const todo = plan.filter((p) => p.action === "generate");
  if (todo.length === 0) {
    console.log("Nothing to generate.");
    return 0;
  }
  if (has("--dry-run")) return 0;

  const client = geminiClientFromEnv();
  if (!client.configured) {
    console.error("GEMINI_API_KEY is not set in this shell. Nothing was generated.");
    return 1;
  }

  mkdirSync(resolve(ROOT, FAQ_AUDIO_DIR), { recursive: true });
  const next: FaqAudioManifest = { ...manifest };
  const written: string[] = [];
  const replaced: string[] = [];
  const report: { id: string; ms: number; bytes: number; durationMs: number; file: string }[] = [];
  for (const item of todo) {
    if (item.action !== "generate") continue;
    const started = Date.now();
    let result;
    try {
      result = await client.synthesize({ ...tushkyTtsRequest(item.speechText, { format, model }), signal: AbortSignal.timeout(60_000) });
    } catch (err) {
      const code = err instanceof TtsError ? err.code : "upstream";
      console.error(`  ${item.id}: TTS failed (${code})${code === "quota" ? " — quota reached, stopping" : ""}`);
      if (code === "quota") break;
      continue;
    }
    const ms = Date.now() - started;
    const ext = result.mimeType === "audio/mpeg" ? "mp3" : "wav";
    const file = faqAudioFileName(item.id, item.speechHash, ext);
    const url = `${FAQ_AUDIO_URL_BASE}/${file}`;
    writeFileSync(publicPath(url), result.audio);
    written.push(publicPath(url));
    const durationMs = ext === "wav" ? (wavDurationMs(result.audio) ?? 0) : Math.round((result.audio.byteLength * 8 * 1000) / MP3_BIT_RATE);
    const entry = faq.find((e) => e.id === item.id)!;
    const previous = manifest[item.id];
    if (previous && previous.url !== url) replaced.push(publicPath(previous.url));
    const record: FaqAudioRecord = {
      url,
      mimeType: result.mimeType,
      voiceVersion: TUSHKY_VOICE.version,
      voice: TUSHKY_VOICE.voice,
      model,
      profileVersion: entry.profileVersion,
      speechHash: item.speechHash,
      durationMs,
      bytes: result.audio.byteLength,
      generatedAt: new Date().toISOString().slice(0, 10),
    };
    next[item.id] = record;
    report.push({ id: item.id, ms, bytes: record.bytes, durationMs, file });
    console.log(`  ${item.id}: ${(record.bytes / 1024).toFixed(0)} kB, ${(durationMs / 1000).toFixed(1)} s audio, ${ms} ms to generate`);
  }

  const total = Object.values(next).reduce((sum, r) => sum + r.bytes, 0);
  if (total > FAQ_AUDIO_BUDGET_BYTES) {
    for (const path of written) if (existsSync(path)) unlinkSync(path);
    console.error(`FAQ audio would total ${(total / 1024 / 1024).toFixed(2)} MB (> 5 MB). Nothing recorded; move FAQ audio to object storage (e.g. Vercel Blob) instead of public/.`);
    return 2;
  }
  for (const path of replaced) if (existsSync(path) && !written.includes(path)) unlinkSync(path);
  const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  mkdirSync(resolve(ROOT, ".eval"), { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify({ model, voice: TUSHKY_VOICE.voice, version: TUSHKY_VOICE.version, format, totalBytes: total, generated: report }, null, 2)}\n`);
  const onDisk = Object.values(next).filter((r) => existsSync(publicPath(r.url)));
  console.log(`Done: ${report.length} generated, ${onDisk.length} files, ${(total / 1024).toFixed(0)} kB in total (${basename(REPORT_PATH)}).`);
  for (const r of onDisk) console.log(`  ${r.url} ${(statSync(publicPath(r.url)).size / 1024).toFixed(0)} kB`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : "generate-tushky-faq-audio failed");
    process.exit(1);
  },
);
