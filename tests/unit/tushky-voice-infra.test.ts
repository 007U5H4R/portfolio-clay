import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import faqData from "@/data/tushky/faq.json";
import faqAudioData from "@/data/tushky/faq-audio.json";
import { FAQ_AUDIO_IDS, TUSHKY_VOICE } from "@/config/tushky-voice";
import type { FaqEntry } from "@/lib/ask/faq";
import { freshFaqIds } from "@/lib/ask/faq-versions";
import { AudioCache, speechCacheKey } from "@/lib/tushky-voice/audio-cache";
import { handleAuditionRequest } from "@/lib/tushky-voice/audition-route";
import { AUDITION_SAMPLES } from "@/lib/tushky-voice/audition";
import {
  FAQ_AUDIO_BUDGET_BYTES,
  freshFaqAudio,
  isFaqAudioFresh,
  planFaqAudio,
  speechHashFor,
  type FaqAudioManifest,
  type FaqAudioRecord,
} from "@/lib/tushky-voice/faq-audio";
import { hashText, HASH_PATTERN } from "@/lib/tushky-voice/hash";
import { clientKey, TokenBucketLimiter } from "@/lib/tushky-voice/rate-limit";
import type { TtsClient } from "@/lib/tushky-voice/tts-client";
import { isWav, pcmToWav, rateFromMime, toWav, wavDurationMs } from "@/lib/tushky-voice/wav";

/** TASK-134 — the voice feature's supporting pieces: WAV, limiter, caches, FAQ audio, audition, boundaries. */
const ROOT = process.cwd();
const FAQ = faqData as FaqEntry[];
const FRESH = freshFaqIds(FAQ);

describe("WAV (§34–35: wrap PCM, never transcode)", () => {
  const format = { sampleRate: 24_000, channels: 1, bitsPerSample: 16 };
  it("pcmToWav writes a canonical 44-byte RIFF header", () => {
    const wav = pcmToWav(new Uint8Array(48_000), format);
    const b = Buffer.from(wav);
    expect(b.toString("ascii", 0, 4)).toBe("RIFF");
    expect(b.toString("ascii", 8, 16)).toBe("WAVEfmt ");
    expect(b.readUInt32LE(4)).toBe(36 + 48_000);
    expect(b.readUInt16LE(20)).toBe(1);
    expect(b.readUInt16LE(22)).toBe(1);
    expect(b.readUInt32LE(24)).toBe(24_000);
    expect(b.readUInt32LE(28)).toBe(48_000);
    expect(b.readUInt16LE(34)).toBe(16);
    expect(b.toString("ascii", 36, 40)).toBe("data");
    expect(b.readUInt32LE(40)).toBe(48_000);
    expect(wavDurationMs(wav)).toBe(1000);
  });
  it("toWav passes an existing WAV through untouched", () => {
    const wav = pcmToWav(new Uint8Array(10), format);
    expect(toWav(wav, format)).toBe(wav);
    expect(isWav(new Uint8Array([1, 2, 3]))).toBe(false);
  });
  it("reads the sample rate from an L16 MIME type", () => {
    expect(rateFromMime("audio/L16;codec=pcm;rate=24000")).toBe(24_000);
    expect(rateFromMime("audio/wav")).toBeUndefined();
  });
});

describe("token bucket (§53; per instance only)", () => {
  it("allows a burst, then refills at the sustained rate", () => {
    const limiter = new TokenBucketLimiter({ burst: 3, refillPerMinute: 6, maxTrackedClients: 10 });
    const t = 0;
    expect([1, 2, 3].map(() => limiter.take("a", t).ok)).toEqual([true, true, true]);
    const refused = limiter.take("a", t);
    expect(refused.ok).toBe(false);
    expect(refused.retryAfterMs).toBe(10_000);
    expect(limiter.take("a", t + 10_000).ok).toBe(true);
    expect(limiter.take("b", t).ok).toBe(true);
  });
  it("tracks a bounded number of clients (a spray of addresses cannot grow memory)", () => {
    const limiter = new TokenBucketLimiter({ burst: 1, refillPerMinute: 1, maxTrackedClients: 100 });
    for (let i = 0; i < 1000; i++) limiter.take(`10.0.${i >> 8}.${i & 255}`, 0);
    expect(limiter.size).toBe(100);
  });
  it("keys on the platform's client address header", () => {
    expect(clientKey(new Headers({ "x-real-ip": "1.2.3.4" }))).toBe("1.2.3.4");
    expect(clientKey(new Headers({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" }))).toBe("5.6.7.8");
    expect(clientKey(new Headers())).toBe("unknown");
  });
});

describe("runtime audio cache (§31–32)", () => {
  it("is keyed by version + model + voice + speech text", () => {
    const base = { version: "tushky-v1", model: "m", voice: "Achird", speechText: "Hello." };
    const key = speechCacheKey(base);
    expect(speechCacheKey({ ...base, version: "tushky-v2" })).not.toBe(key);
    expect(speechCacheKey({ ...base, model: "m2" })).not.toBe(key);
    expect(speechCacheKey({ ...base, voice: "Umbriel" })).not.toBe(key);
    expect(speechCacheKey({ ...base, speechText: "Hello!" })).not.toBe(key);
  });
  it("evicts least-recently-used entries beyond its byte budget", () => {
    const cache = new AudioCache(25);
    const item = (n: number) => ({ audio: new Uint8Array(n), mimeType: "audio/wav" as const });
    cache.set("a", item(10));
    cache.set("b", item(10));
    cache.get("a");
    cache.set("c", item(10));
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBeDefined();
    expect(cache.totalBytes).toBeLessThanOrEqual(25);
    cache.set("huge", item(100));
    expect(cache.get("huge")).toBeUndefined();
  });
  it("hashText is stable 14-hex", () => {
    expect(hashText("abc")).toMatch(HASH_PATTERN);
    expect(hashText("abc")).toBe(hashText("abc"));
    expect(hashText("abc")).not.toBe(hashText("abd"));
  });
});

describe("pre-generated FAQ audio: metadata and invalidation (§27–30, §71–73)", () => {
  const entry = FAQ.find((e) => e.id === "who-is-tushar")!;
  const fresh = new Set(FRESH);
  const record = (patch: Partial<FaqAudioRecord> = {}): FaqAudioRecord => ({
    url: "/tushky/audio/faq/who-is-tushar-tushky-v1-00000000.mp3",
    mimeType: "audio/mpeg",
    voiceVersion: TUSHKY_VOICE.version,
    voice: TUSHKY_VOICE.voice,
    model: "gemini-3.8-flash-lite-tts",
    profileVersion: entry.profileVersion,
    speechHash: speechHashFor(entry),
    durationMs: 30_000,
    bytes: 180_000,
    generatedAt: "2026-09-29",
    ...patch,
  });

  it("a record made from the current answer, voice and version is fresh", () => {
    expect(isFaqAudioFresh(entry, record(), fresh)).toBe(true);
  });
  it.each([
    ["the voice version changed (§73)", { voiceVersion: "tushky-v0" }],
    ["the voice changed", { voice: "Puck" }],
    ["the answer text changed (§30)", { speechHash: hashText("an older answer") }],
    ["the profile version changed", { profileVersion: "v1-000000000000" }],
  ])("is stale when %s", (_why, patch) => {
    expect(isFaqAudioFresh(entry, record(patch), fresh)).toBe(false);
  });
  it("is stale when the answer itself is stale against the site data", () => {
    expect(isFaqAudioFresh(entry, record(), new Set())).toBe(false);
  });
  it("a pronunciation-map change makes old audio stale without a version bump (the speech hash moves)", () => {
    const edited = { ...entry, answer: entry.answer.replace("AI", "GCP") };
    expect(speechHashFor(edited)).not.toBe(speechHashFor(entry));
  });
  it("freshFaqAudio returns only playable records", () => {
    const manifest: FaqAudioManifest = { "who-is-tushar": record(), railcite: record({ speechHash: "00000000000000" }) };
    expect([...freshFaqAudio(FAQ, manifest, FRESH).keys()]).toEqual(["who-is-tushar"]);
  });
  it("planFaqAudio skips unchanged answers and regenerates everything else (§71 step 7, §72)", () => {
    const manifest: FaqAudioManifest = { "who-is-tushar": record(), railcite: record({ speechHash: "00000000000000" }) };
    const plan = planFaqAudio(FAQ, manifest, FRESH, ["who-is-tushar", "railcite", "impact", "nope"], () => true);
    expect(plan.map((p) => [p.id, p.action, p.reason])).toEqual([
      ["who-is-tushar", "skip", "unchanged"],
      ["railcite", "generate", "stale"],
      ["impact", "generate", "missing"],
      ["nope", "skip", "unknown-id"],
    ]);
    expect(planFaqAudio(FAQ, manifest, FRESH, ["who-is-tushar"], () => false)[0]).toMatchObject({ action: "generate", reason: "file-missing" });
    expect(planFaqAudio(FAQ, manifest, FRESH, ["who-is-tushar"], () => true, true)[0]).toMatchObject({ action: "generate", reason: "forced" });
    expect(planFaqAudio(FAQ, manifest, [], ["who-is-tushar"], () => true)[0]).toMatchObject({ action: "skip", reason: "answer-stale" });
  });
  it("the committed manifest only names real FAQ ids, files that exist, and stays under 5 MB", () => {
    const manifest = faqAudioData as FaqAudioManifest;
    const ids = new Set(FAQ.map((e) => e.id));
    let total = 0;
    for (const [id, r] of Object.entries(manifest)) {
      expect(ids.has(id)).toBe(true);
      expect(existsSync(join(ROOT, "public", r.url))).toBe(true);
      total += statSync(join(ROOT, "public", r.url)).size;
    }
    expect(total).toBeLessThanOrEqual(FAQ_AUDIO_BUDGET_BYTES);
  });
  it("the pre-generated set is the spec's common questions, all real FAQ entries", () => {
    for (const id of FAQ_AUDIO_IDS) expect(FAQ.some((e) => e.id === id)).toBe(true);
  });
});

describe("audition tool (§74): dev only, fixed samples", () => {
  const tts: TtsClient = { synthesize: async () => ({ audio: pcmToWav(new Uint8Array(8), { sampleRate: 24_000, channels: 1, bitsPerSample: 16 }), mimeType: "audio/wav" }) };
  const get = (q: string) => new Request(`http://localhost/api/dev/tushky-voice?${q}`);
  it("404s in production (and in tests), whatever the query", async () => {
    for (const env of ["production", "test", undefined]) {
      expect((await handleAuditionRequest(get("sample=A&voice=Achird"), { tts, nodeEnv: env, model: "m" })).status).toBe(404);
    }
  });
  it("in development it speaks only a fixed sample in a known prebuilt voice", async () => {
    const dev = { tts, nodeEnv: "development", model: "m" };
    expect((await handleAuditionRequest(get("sample=A&voice=Achird"), dev)).status).toBe(200);
    expect((await handleAuditionRequest(get("sample=Z&voice=Achird"), dev)).status).toBe(400);
    expect((await handleAuditionRequest(get("sample=A&voice=../../x"), dev)).status).toBe(400);
    expect((await handleAuditionRequest(get("text=hello"), dev)).status).toBe(400);
  });
  it("samples A–E are real answers (brief §3.10); only P is a fixture", () => {
    const answers = new Set(FAQ.map((e) => e.answer));
    for (const s of AUDITION_SAMPLES.filter((s) => /^[A-DQ]/.test(s.id))) expect(answers.has(s.text)).toBe(true);
    expect(AUDITION_SAMPLES.map((s) => s.id).slice(0, 5)).toEqual(["A", "B", "C", "D", "E"]);
  });
});

describe("key and server-code boundaries (§11–12, brief §3.5)", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (name === "node_modules" || name.startsWith(".")) return [];
      return statSync(path).isDirectory() ? walk(path) : /\.(tsx?|mjs|json)$/.test(name) ? [path] : [];
    });
  const files = ["app", "components", "lib", "config", "scripts", "data"].flatMap((d) => walk(resolve(ROOT, d)));

  it("there is no NEXT_PUBLIC_ Gemini variable anywhere", () => {
    const offenders = files.filter((f) => /NEXT_PUBLIC_GEMINI/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });
  it("GEMINI_API_KEY is read only by the voice's TTS client (and TASK-123's offline refresh script); no client code imports it", () => {
    const readers = files.filter((f) => /env\.GEMINI_API_KEY|process\.env\.GEMINI_API_KEY/.test(readFileSync(f, "utf8")));
    expect(readers.map((f) => relative(ROOT, f)).sort()).toEqual(["lib/tushky-voice/tts-client.ts", "scripts/tushky-faq-refresh.ts"]);
    const clientFiles = files.filter((f) => /^\s*["']use client["']/m.test(readFileSync(f, "utf8")) || relative(ROOT, f).startsWith("components/"));
    for (const f of clientFiles) {
      const imports = readFileSync(f, "utf8").match(/from\s+["'][^"']+["']/g) ?? [];
      for (const spec of imports) expect(spec, relative(ROOT, f)).not.toMatch(/tushky-voice\/(tts-client|server|speech-route|audition-route)|faq-versions/);
    }
  });
});
