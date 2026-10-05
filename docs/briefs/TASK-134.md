# TASK-134 brief: Ask Tushky voice playback (cloud session)

You are working in a Claude cloud session on Tushar Pathak's portfolio. No one can answer questions during the run. Make the call that best serves his specs and record it in your report.

## 1. Setup
- **Repo and branch:** https://github.com/007U5H4R/portfolio-clay, branch `cloud/task-134`. It is `m-009-redesign` plus one commit that adds the two specs, the mockup and this brief.
- **Stack:** Next.js 16, Tailwind v4, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Environment:** `.env.tooling` points `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR` at Tushar's Mac. In every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Playwright** starts its own server on the port in `PW_BASE_URL` (TASK-128).
- **Sync before the final push:** `git fetch origin && git merge origin/m-009-redesign`.
- **Other open branches:** TASK-130 (case studies, PR #2) and TASK-133 (home Featured Work) are also open. They don't touch Ask Tushky's voice, but they may touch shared tests.

## 2. Read first
- `docs/redesign-mockups/m-009/tushar-2026-09-29/tushky-voice-spec.md` (79 sections), `tushky-voice-ui-spec.md` (52 sections) and `tushky-voice-ui-reference.jpg`.
- The Ask Tushky code:
  - `components/ai/` (AskPanel, AskTushky, AskProvider / `useAskChat`, tushky-questions)
  - `lib/ask/` (adapter, local-provider, faq, faq-schema, faq-versions, normalise, answer-schema)
  - `data/tushky/faq.json`
  - `scripts/tushky-faq-refresh.ts`
  - `lib/csp.ts`, `next.config.ts`, `scripts/assert-static.ts`
- `Design.md` (tokens, decoration contract, §11 deviations) and `HANDOFF.md`.

## 3. Facts that correct the spec's assumptions
1. **No live Gemini text generation exists.** Ask Tushky answers come from the curated FAQ cache (`data/tushky/faq.json`, TASK-123) or the deterministic local provider (`lib/ask/local-provider.ts`). Both run in the browser from static data.
   - Tushar has NOT approved a live Gemini text path. Don't build one.
   - Treat "Gemini text answer" in the spec as "the Tushky answer the site already produces". The voice speaks exactly that answer.
2. **The site is fully static today.** `scripts/assert-static.ts` fails the build if any page route is dynamic. The TTS route is the site's first server function (a Vercel Node function).
   - Change `assert-static.ts` to allow exactly `/api/tushky/speech`, plus a dev-only audition route if you add one. Every page route must still be static.
   - Add a test for that rule, and record the decision as a Design.md §11 Dev-id.
3. **Abuse prevention (spec §54/§56):** the route must NOT accept arbitrary text to speak.
   - The client sends the question (and the FAQ id when it was a FAQ hit), plus the messageId.
   - The server re-runs the SAME deterministic answer pipeline (FAQ lookup → local provider) to get the display text, then normalizes it to speech text and synthesizes. So only a real Tushky answer can be spoken.
   - If the answer depends on conversation context, include only what the pipeline needs, bounded in size.
   - If parts of the pipeline are browser-only, refactor them into a pure module that both sides import.
   - A request whose recomputed answer is empty or a refusal gets no audio.
4. **Rate limiting:** there is no KV, Redis or Upstash today, and Tushar hasn't approved new infrastructure.
   - Implement a per-instance in-memory token bucket (per IP, with burst plus a sustained rate), request-size and speech-length limits, and a timeout on the Gemini call.
   - Document plainly that on serverless it limits per instance only. Propose Upstash or Vercel KV (or Vercel Firewall rate-limit rules) in the report as the upgrade. Do not add them.
5. **Key handling:** the server reads `GEMINI_API_KEY` from its environment only. There is never a `NEXT_PUBLIC_` variant. Keys never go in logs, errors or responses.
   - This cloud session most likely does NOT have the key. Check with `test -n "$GEMINI_API_KEY"` and never print it.
   - **Without the key:** build everything against a TTS client interface with a fake implementation for tests, and leave the real FAQ-audio generation and the voice audition as scripts ready to run.
   - **With the key:** use it sparingly for the audition samples (§74) and to generate the FAQ audio.
   - Either way, no unit or e2e test may call the real API. Mock the route in Playwright with `page.route`.
6. **Model:** `gemini-3.8-flash-lite-tts` is available on Tushar's key (verified 2026-09-29 via the models list). The key's list also shows `gemini-3.8-flash-tts`, `gemini-3.1-flash-tts-preview`, `gemini-2.5-flash-preview-tts` and `gemini-2.5-pro-preview-tts`.
   - Look up the current request and response shape, prebuilt voice names and style controls in Google's official Gemini TTS docs (web), and cite the URL in the report.
   - Configure through `GEMINI_TTS_MODEL` and `config/tushky-voice.ts`.
7. **Audio format:** Gemini TTS returns raw PCM (check the docs for sample rate and bit depth). Wrap it in a WAV header server-side. That needs no ffmpeg.
   - Pre-generated FAQ audio: consider encoding to a compressed format in the generation script with a small pure-JS encoder (a devDependency only, never shipped to the browser), so `public/tushky/audio/faq/` stays small.
   - Report the sizes. If the files total more than about 5 MB, stop and recommend object storage instead.
8. **CSP:** playing Blob URLs and same-origin audio needs `media-src 'self' blob:` (and `connect-src 'self'` for the POST).
   - Change `lib/csp.ts` minimally and extend its unit test.
   - Keep youtube-nocookie `frame-src` as it is.
9. **Analytics:** the site uses Vercel Analytics (see how TASK-123 tracks FAQ cache hits), not Mixpanel. Use it for the voice events: event names and bucketed properties only, never answer text.
10. **The mockup's sample answer text is illustrative.** Don't copy it into data. Voice samples and tests use real FAQ answers.
11. **Voice identity:** original only (spec §2, §38–39). Pick a prebuilt voice by listening, if you have the key, or by the documented character descriptions if you don't; say which in the report.
    - The pronunciation map (`data/tushky/pronunciations.json`) holds only terms whose pronunciation is certain (e.g. GCP, PRD and FHIR as letters, SAFe). For anything uncertain, such as "Tushar" or "Quantiphi", leave the entry out and list it for Tushar to confirm.

## 4. Scope
- Implement both specs in the specs' implementation order. The priorities are:
  - the normalizer, with unit tests for every rule in spec §5–8 and §45–48;
  - `config/tushky-voice.ts`;
  - the route, with validation, recompute, limits, error and quota mapping, and the WAV response;
  - the `TushkyVoicePlayer` with all states;
  - the audio manager (one at a time, stop on drawer close and on route change, Blob URL revocation);
  - the session cache (Replay makes no new request);
  - FAQ audio metadata and invalidation (voiceVersion + answer hash + profileVersion);
  - the generation script (skips unchanged answers);
  - the dev-only audition tool, which must 404 in production.
- Leave the empty state and everything outside Ask Tushky unchanged.
- **Tushar's manual steps:** write them to `docs/reports/TASK-134-setup.md`:
  1. add `GEMINI_API_KEY` and `GEMINI_TTS_MODEL` in Vercel (Preview first, then Production at release);
  2. run the audition script and pick a voice;
  3. run the FAQ-audio generation script.

  Tushar adds the key in Vercel himself. Never ask for it or handle it.

## 5. Gates (all required)
- `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, the full `pnpm test`, and `pnpm build`, including the updated assert-static.
- The FULL `pnpm test:e2e` suite at w390, w768, w1024 and w1440. The voice e2e tests mock the route and cover:
  - idle → loading → playing → paused → resumed → ended → replay, with no second request;
  - two answers, where starting the second pauses the first;
  - closing the drawer stops audio;
  - the error state and the quota state;
  - keyboard operation and aria labels;
  - axe (eval-006) on the drawer with a voice strip;
  - reduced motion.
- Route unit tests (with a mocked TTS client):
  - arbitrary text is rejected;
  - an unknown question gets no audio;
  - the rate limit returns 429;
  - quota is mapped to a friendly code;
  - the response carries no key and no raw provider error.
- The bundle budget for `/`, 180 kB gz: `pnpm exec tsx scripts/bundle-budget.ts --route / --json`. The voice player lazy-loads with the drawer chunk.
- Screenshots of the drawer's voice strip in each state at 390 and 1440, in `docs/screenshots/m-009/task-134/`.

## 6. Commits, push, report
- Commit messages: imperative subjects that include TASK-134, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or your own model name).
- Push only `cloud/task-134`. Never push to or merge `m-009-redesign` or `main`. Never deploy. Don't edit `backlog/`.
- Commit `docs/reports/TASK-134.md` last. It covers both specs' final-report lists (voice spec §79 and UI spec §52), what's verified vs judgement, the gate counts, known limitations and the commit list.
