# TASK-134 setup: Ask Tushky's voice (Tushar's manual steps)

The voice feature is built and tested, but it stays silent until these steps are done. Every test mocks Google, so nothing here has spent any quota yet. Never paste the key into a chat, a commit or a log. It only goes into Vercel and your own shell.

## 1. Add the two variables in Vercel (Preview first, then Production at release)

Vercel → the `portfolio-clay` project → Settings → Environment Variables:

| Name | Value | Environments |
|---|---|---|
| `GEMINI_API_KEY` | your Gemini Developer API key | **Preview** now; **Production** at release |
| `GEMINI_TTS_MODEL` | `gemini-3.8-flash-lite-tts` | the same |

- There is deliberately **no** `NEXT_PUBLIC_` variant. Adding one would ship the key to every visitor.
- `GEMINI_TTS_MODEL` is optional. When it is unset the server uses `gemini-3.8-flash-lite-tts`. Other models on your key also work: `gemini-3.8-flash-tts` (higher quality, same API), and the older `gemini-3.1-flash-tts-preview` / `gemini-2.5-*-preview-tts`, which use a different API that the client picks automatically.
- Redeploy the Preview after you add them. Then open the drawer on the Preview, ask "Who is Tushar?" and press **Listen**.
- Without the key, Listen shows "Couldn't find my voice this time 🐾". The text chat is unaffected.
- In Vercel → Logs, each listen writes one line: `[tushky-voice] {"outcome":…,"cache":…,"ttsMs":…,"bytes":…}`. The line never contains the key, the answer or the visitor's IP.

## 2. Audition the voice and pick one

The default voice is **Achird** (Google's label: "Friendly"). I picked it from Google's descriptions because I couldn't listen: this session had no key.

**Option A, the script** (writes WAVs you can play in Finder):

```sh
export GEMINI_API_KEY=…   # in your shell only
pnpm exec tsx scripts/tushky-voice-audition.ts
# or narrower: --voices Achird,Umbriel --samples A,B,C,D,E,P
```

Files land in `.eval/tushky-voice-audition/<voice>/<sample>.wav` (git-ignored). The shortlist is Achird (Friendly), Umbriel (Easy-going), Algieba (Smooth), Sadachbia (Lively), Sulafat (Warm) and Charon (Informative).

That is 6 voices × 9 samples = 54 short calls. Use `--voices`/`--samples` to stay inside the free tier.

**Option B, the dev page:** run `pnpm dev` with the key exported, then open http://localhost:3000/dev/tushky-voice. Each `<audio>` fetches its clip only when you press play. `/api/dev/tushky-voice` returns 404 in every non-dev build, including production.

The samples:

| Sample | Content |
|---|---|
| A | the real "Who is Tushar?" answer |
| B | the real RailCite walkthrough (technical) |
| C | the real impact answer (metrics) |
| D | the real contact answer ("woof woof") |
| E | the real "I only answer from the sourced facts…" fallback (limitation) |
| Q1–Q3 | RailCite, why-PM and certifications (spec §75) |
| P | a pronunciation fixture: 5,760 · 47% · GCP · FHIR · PRD · RAG |

Listen for:

- a warm, relaxed, slightly goofy delivery that is never childish;
- a subtle "woof woof";
- clear technical terms.

**To change the voice:**

1. Set `voice` in `config/tushky-voice.ts` (`TUSHKY_VOICE.voice`).
2. Bump `TUSHKY_VOICE_VERSION` to `tushky-v2`.
3. Commit.

Old FAQ audio is then ignored automatically.

**Also confirm the pronunciations:** `data/tushky/pronunciations.json` → `unconfirmed` lists the names I did not guess: Tushar, Tushky, Quantiphi, Shellkode, RailCite, MARS, Pratyasa, Tegaki, Nuptis, Velora, Devin and the patent number. For each one you care about, move it into `terms` with a respelling (e.g. `{ "term": "Quantiphi", "say": "Kwanti-fy" }`). Please also confirm **FHIR**: I used "fire" (HL7's own pronunciation), not letters. A pronunciation change re-hashes the affected speech, so the matching FAQ audio goes stale by itself.

## 3. Generate the FAQ audio

After you've picked the voice (and committed the change, if any):

```sh
export GEMINI_API_KEY=…
pnpm exec tsx scripts/generate-tushky-faq-audio.ts --dry-run   # shows what would be generated
pnpm exec tsx scripts/generate-tushky-faq-audio.ts             # the 8 common questions (spec §27)
```

- It writes 48 kb/s MP3 to `public/tushky/audio/faq/<id>-tushky-v1-<hash>.mp3`, updates `data/tushky/faq-audio.json`, and prints a size/latency report (also saved to `.eval/tushky-faq-audio-report.json`).
- Expect about 150–300 kB per answer, so about 2 MB for the eight.
- If the total would pass 5 MB, the script records nothing and exits 2. That means it's time for object storage (Vercel Blob).
- Re-running skips every unchanged answer. Use `--force` to regenerate anyway, `--ids a,b` for specific entries, `--all` for all 21 (check the size first), and `--format wav` to keep WAV.
- It never runs during `pnpm build` (spec §72). Re-run it after you edit an FAQ answer, the pronunciation map or the voice.
- Then commit `public/tushky/audio/faq/*.mp3` and `data/tushky/faq-audio.json`. `pnpm test` checks that every file in the manifest exists and that the total stays at or under 5 MB.

## Optional, later

- **Global rate limit.** The route's limit is per server instance: a burst of 6 plays, then 3 per minute per IP. On Vercel each instance has its own counter. For a real global limit, add a Vercel Firewall rate-limit rule on `/api/tushky/speech` (no code change), or Upstash Redis / Vercel KV. Neither is added: no new infrastructure was approved.
- **Custom voice.** Gemini 3.8's Voice Design (`client.voices.create`, `type: "prompted"`) could make a dedicated original Tushky voice from a description (spec §38). Not built: it adds a stored voice resource to manage, and the spec says not to block on it.
