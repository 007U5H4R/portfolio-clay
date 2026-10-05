import { devOnly } from "@/lib/dev-only";
import { AUDITION_VOICES, TUSHKY_VOICE } from "@/config/tushky-voice";
import { AUDITION_SAMPLES } from "@/lib/tushky-voice/audition";
import { toSpeechText } from "@/lib/tushky-voice/speech-text";

/**
 * /dev/tushky-voice (TASK-134, voice spec §74) — the voice audition board: each fixed sample (A–E are
 * real answers, P is a pronunciation fixture) in each shortlisted prebuilt voice. Every clip is fetched
 * on demand from `/api/dev/tushky-voice`, which only answers under `pnpm dev`. The page itself follows
 * the `/dev/*` rule (`devOnly()`, static, out of the sitemap). Native `<audio controls>` is fine here:
 * this is a QA tool, not the drawer (UI spec §44 applies to visitors).
 */
export default function TushkyVoiceAuditionPage() {
  devOnly();
  return (
    <main id="main" className="mx-auto max-w-5xl px-6 py-12 text-navy">
      <h1 className="text-3xl font-semibold">Tushky voice audition</h1>
      <p className="mt-2 text-base text-ink-soft">
        Voice version <code>{TUSHKY_VOICE.version}</code>, current voice <strong>{TUSHKY_VOICE.voice}</strong>. Clips are generated
        live under <code>pnpm dev</code> with <code>GEMINI_API_KEY</code> set; each play spends quota.
      </p>
      {AUDITION_SAMPLES.map((sample) => (
        <section key={sample.id} className="mt-10">
          <h2 className="text-xl font-semibold">
            {sample.id}. {sample.label}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Source: {sample.source}</p>
          <p className="mt-2 text-base">
            <strong>Spoken:</strong> {toSpeechText(sample.text).speechText}
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {AUDITION_VOICES.map((voice) => (
              <li key={voice.name}>
                <p className="text-sm font-semibold">
                  {voice.name} <span className="font-normal text-ink-soft">({voice.character})</span>
                </p>
                <audio controls preload="none" src={`/api/dev/tushky-voice?sample=${sample.id}&voice=${voice.name}`} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
