/**
 * Pre-generated FAQ audio: metadata and invalidation (TASK-134, voice spec §27–30, §72–73).
 *
 * `data/tushky/faq-audio.json` maps a FAQ id to the file `scripts/generate-tushky-faq-audio.ts` made
 * for it, with everything the file was made from. The file is kept apart from `faq.json` so the
 * TASK-123 refresh script and the audio script never rewrite each other's data (the spec's §29 shape,
 * `entry.audio`, is the same record held next to the entry instead of inside it).
 *
 * A file is played only when ALL of these still hold (`isFaqAudioFresh`):
 *   - `voiceVersion` is the current `TUSHKY_VOICE_VERSION` (voice/tone/style changes, §73);
 *   - `voice` is the configured prebuilt voice;
 *   - `speechHash` equals the hash of the CURRENT answer's speech transcript, so any change to the
 *     answer text or to the pronunciation map makes it stale (§30: "if text changes, old audio must
 *     not be reused");
 *   - `profileVersion` equals the entry's current `profileVersion`, and the entry is still fresh
 *     against the site data (TASK-123), i.e. the answer itself is still servable.
 * Anything else falls through to the live route, which speaks the current text. Client-safe.
 */
import { TUSHKY_VOICE } from "@/config/tushky-voice";
import type { FaqEntry } from "@/lib/ask/faq";
import { hashText } from "./hash";
import { toSpeechText } from "./speech-text";

export interface FaqAudioRecord {
  /** Public URL, e.g. `/tushky/audio/faq/who-is-tushar-tushky-v1-3f2a….mp3`. */
  url: string;
  mimeType: "audio/mpeg" | "audio/wav";
  voiceVersion: string;
  voice: string;
  model: string;
  profileVersion: string;
  /** `hashText(speechText)` of the transcript that was synthesised. */
  speechHash: string;
  durationMs: number;
  bytes: number;
  generatedAt: string;
}

export type FaqAudioManifest = Record<string, FaqAudioRecord>;

/** The speech hash an entry's audio must carry today. */
export function speechHashFor(entry: Pick<FaqEntry, "answer">): string {
  return hashText(toSpeechText(entry.answer).speechText);
}

export function isFaqAudioFresh(entry: FaqEntry, record: FaqAudioRecord | undefined, fresh: ReadonlySet<string>): record is FaqAudioRecord {
  return (
    record !== undefined &&
    fresh.has(entry.id) &&
    record.voiceVersion === TUSHKY_VOICE.version &&
    record.voice === TUSHKY_VOICE.voice &&
    record.profileVersion === entry.profileVersion &&
    record.speechHash === speechHashFor(entry)
  );
}

/** id → the audio the drawer may play for that FAQ answer. Stale or missing records are left out. */
export function freshFaqAudio(entries: readonly FaqEntry[], manifest: FaqAudioManifest, freshIds: readonly string[]): Map<string, FaqAudioRecord> {
  const fresh = new Set(freshIds);
  const out = new Map<string, FaqAudioRecord>();
  for (const entry of entries) {
    const record = manifest[entry.id];
    if (isFaqAudioFresh(entry, record, fresh)) out.set(entry.id, record);
  }
  return out;
}

/** The file name for a generated FAQ clip: id, voice version and the speech hash, so a new text is a new file. */
export function faqAudioFileName(id: string, speechHash: string, ext: "mp3" | "wav"): string {
  return `${id}-${TUSHKY_VOICE.version}-${speechHash.slice(0, 8)}.${ext}`;
}

export type FaqAudioAction =
  | { id: string; action: "generate"; reason: "missing" | "stale" | "forced" | "file-missing"; speechText: string; speechHash: string }
  | { id: string; action: "skip"; reason: "unchanged" | "answer-stale" | "unknown-id" };

/**
 * What the generation script should do for each requested id (§71–72): skip unchanged audio, skip
 * answers that are themselves stale (refresh the FAQ first), and generate everything else. Pure, so
 * the "skips unchanged answers" rule is unit-tested without touching Google or the disk.
 */
export function planFaqAudio(
  entries: readonly FaqEntry[],
  manifest: FaqAudioManifest,
  freshIds: readonly string[],
  ids: readonly string[],
  fileExists: (url: string) => boolean,
  force = false,
): FaqAudioAction[] {
  const fresh = new Set(freshIds);
  return ids.map((id): FaqAudioAction => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return { id, action: "skip", reason: "unknown-id" };
    if (!fresh.has(id)) return { id, action: "skip", reason: "answer-stale" };
    const { speechText } = toSpeechText(entry.answer);
    const speechHash = hashText(speechText);
    const record = manifest[id];
    if (!force && isFaqAudioFresh(entry, record, fresh)) {
      return fileExists(record.url) ? { id, action: "skip", reason: "unchanged" } : { id, action: "generate", reason: "file-missing", speechText, speechHash };
    }
    return { id, action: "generate", reason: force ? "forced" : record ? "stale" : "missing", speechText, speechHash };
  });
}

/** §28 / brief §3.7: above this, FAQ audio belongs in object storage, not `public/`. */
export const FAQ_AUDIO_BUDGET_BYTES = 5 * 1024 * 1024;
