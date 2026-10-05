# TASK-134 report: Ask Tushky voice playback

Branch `cloud/task-134`. Brief: `docs/briefs/TASK-134.md`. Specs:

- `docs/redesign-mockups/m-009/tushar-2026-09-29/tushky-voice-spec.md` (the voice spec, "V§")
- `tushky-voice-ui-spec.md` (the UI spec, "UI§")
- `tushky-voice-ui-reference.jpg` (the mockup)

Tushar's steps are in `docs/reports/TASK-134-setup.md`.

## Summary

- Each Ask Tushky answer in the drawer now has an opt-in **Listen** paper strip:

  | State | What the strip shows |
  |---|---|
  | Idle | ▶ Listen to this answer |
  | Loading | Finding my voice… |
  | Playing | ⏸ Pause · waveform · 0:08 / 0:18 · ↻ |
  | Paused | ▶ Resume |
  | Ended | ↻ Replay |
  | Error | "Couldn't find my voice this time 🐾" + Try again |
  | Quota | "Voice is resting for a bit. The text answer is still here." |

- The audio comes from Gemini TTS through the site's first server function, `POST /api/tushky/speech`.
- **The route never takes text to speak.** The browser sends the question, the FAQ id (on a cache hit), the message id and a hash of the answer it shows. The server re-runs the same FAQ-cache → local-index pipeline and checks that the result is the answer on screen. Only then does it normalise the text to speech and synthesise it. Empty answers and refusals get no audio.
- **This session had no `GEMINI_API_KEY`** (checked with `test -n`; the value was never printed). So:
  - no real audio was generated;
  - no voice was auditioned by ear;
  - no FAQ audio was made.
- Everything runs against a `TtsClient` interface: a fake in the unit tests, and `page.route` mocks in e2e. No test calls the real API.
- The audition and FAQ-audio scripts are ready to run (setup doc steps 2–3).

## Gates

Run in this cloud container. Playwright's browser CDN (`cdn.playwright.dev`) is blocked by the network policy, so `playwright install` failed. The e2e suite ran on the pre-installed Chromium 141 (`/opt/pw-browsers`), linked into the path Playwright 1.63 expects. No repo file was changed for this.

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass (0 problems) |
| `pnpm tokens:check` | 13/13 tokens round-trip OK |
| `pnpm test` (Vitest) | **859 passed**, 4 skipped (pre-existing), 72 files (71 passed, 1 skipped) |
| `pnpm build` (incl. prebuild + updated assert-static) | pass: `all routes static (18); allow-listed server functions: /api/dev/tushky-voice, /api/tushky/speech` |
| `pnpm test:e2e` (FULL suite, w390 / w768 / w1024 / w1440, `PW_WORKERS=2`) | **1,390 passed, 8 failed, 1,582 skipped** (width-gated) in 24.8 min. **None of the 8 is caused by this change; all are this container's limits** (see "E2E failures" below) |
| `tests/e2e/ask-voice.spec.ts` (new, all four widths) | **36 passed**, 4 skipped (the axe and screenshot tests run at 390/1440 only), 0 failed. The same in the full run |
| Bundle budget `/` (`bundle-budget.ts --route / --json`) | **161.2 kB gz** / 180 (`overBudget: false`). The player lives in the lazy drawer chunk only: none of `/`'s 10 first-load chunks contains voice code. No client chunk contains `GEMINI`, `x-goog-api-key` or `generativelanguage` |
| Screenshots | `docs/screenshots/m-009/task-134/{idle,loading,playing,paused,ended,error,resting,drawer}-{390,1440}.png` |

New tests:

- **Unit (6 new files + `csp.test.ts`, 153 tests):**
  - `tushky-speech-text` (64): every rule in V§4–8 and V§45–48, the summary rule, and every real FAQ/index answer;
  - `tushky-speech-route` (21);
  - `tushky-tts-client` (17);
  - `tushky-voice-infra` (25): WAV, limiter, caches, FAQ-audio invalidation, the audition route's 404, key boundaries;
  - `tushky-voice-player` (20, jsdom): manager and player;
  - `assert-static` (4);
  - `csp` (+2).
- **E2E:** `ask-voice.spec.ts`, 10 tests × 4 widths.

The route tests cover the brief's list:

- arbitrary text is rejected: `text`, `speechText` and `voiceProfile` → 400;
- an unknown question gets no audio: 422;
- the rate limit returns 429 with `Retry-After`;
- quota is mapped to `voice-resting` (503);
- no response, header or log carries the key, the answer or the IP.

## Voice spec §79 final report

1. **Files added/changed:** see "Files" below.
2. **TTS model:** `gemini-3.8-flash-lite-tts` by default, overridable with `GEMINI_TTS_MODEL` (read only in `config/tushky-voice.ts#ttsModel`). The client picks the API by model family:
   - **3.8 TTS** uses the Interactions API: `POST https://generativelanguage.googleapis.com/v1beta/interactions` with `x-goog-api-key`, the transcript as `input[].text`, the style as a `speech_metadata` annotation, `response_format: {type:"audio"}`, `generation_config.speech_config: [{voice}]` and `store: false`.
   - **`gemini-2.5-*-preview-tts` / `gemini-3.1-flash-tts-preview`** use `models/{model}:generateContent` with `responseModalities: ["AUDIO"]` and `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`.

   Sources:
   - https://ai.google.dev/gemini-api/docs/speech-generation (cited; the host is blocked by this container's egress policy, so I couldn't open it);
   - Google's official cookbook, Gemini 3.8 edition: https://github.com/google-gemini/cookbook/blob/main/quickstarts/Get_started_TTS.ipynb and `Get_Started_Voices.ipynb`;
   - the `@google/genai` 2.24.0 type definitions (`interactions.create`, `AudioResponseFormat`, `SpeechAnnotation`, `AudioContent`) from the npm registry.

   **Correction to brief §3.7:** for 3.8 TTS a unary call already returns **WAV** (RIFF header, 24 kHz mono 16-bit), not raw PCM. The older models return raw `audio/L16;rate=24000`. `lib/tushky-voice/wav.ts#toWav` handles both: WAV passes through, and PCM gets a 44-byte header. No ffmpeg.
3. **Voice:** **Achird**, a prebuilt voice (Google's label: "Friendly").
   - Chosen from the documented character descriptions, **not by listening** (no key).
   - The audition shortlist is Achird, Umbriel (Easy-going), Algieba (Smooth), Sadachbia (Lively), Sulafat (Warm) and Charon (Informative). The character words are Google's voice-table labels as I know them: the docs page itself was blocked here, so confirm them in AI Studio.
   - The voice is original. There is no cloning, and Voice Design was not used (V§38 allows skipping it).
4. **Exact voice direction:** `TUSHKY_STYLE` in `config/tushky-voice.ts`. It is sent as `speech_metadata.style`, so it is never spoken. It covers:
   - Tushky persona, warm/relaxed/slightly goofy/intelligent, a smile in the voice;
   - medium-low conversational baritone, soft rounded delivery, occasional playful pauses, about 0.95x pace (V§14);
   - lift for curiosity, firmer for metrics, softer for caveats (V§15);
   - never childish, squeaky, theatrical or slapstick;
   - a quick, understated "woof woof", no barking;
   - "say exactly the words given… change no number, name or date" (V§42);
   - never imitate an existing character, actor or person.
5. **Server endpoint:** `app/api/tushky/speech/route.ts` (Node runtime, `maxDuration` 30 s). The logic is in `lib/tushky-voice/speech-route.ts`.
   - **Request:** `{question, messageId, answerHash, faqId?}`. Any other field is refused.
   - **Responses:** 200 `audio/wav`, with `x-tushky-audio-source: cache|gemini`, `x-tushky-speech: full|summary`, `server-timing: tts;dur=…` and `cache-control: no-store`. Errors are `{code}` JSON only.
6. **Cache strategy:** client, then server, then Gemini.
   - **Client session cache:** Blob URL per answer hash. Replay and a repeated question never re-request (V§33).
   - **Server runtime cache:** in-memory LRU, 32 MB, per instance, keyed by `hash(version|model|voice|speechText)`. Only successes are stored (V§31–32).
   - **FAQ audio:** static files.
7. **FAQ audio strategy:** the 8 V§27 questions (`FAQ_AUDIO_IDS`). `scripts/generate-tushky-faq-audio.ts` asks Gemini 3.8 for **native MP3 at 48 kb/s**, so no encoder dependency ships (V§34–35) and no transcoding is needed. That is an estimated 150–300 kB per answer, about 2 MB total. It refuses to go over 5 MB and recommends object storage if it would. **Sizes today: 0 files, 0 bytes (not generated: no key).** It skips unchanged answers and never runs in `pnpm build` (V§72).
8. **Cache invalidation:** `data/tushky/faq-audio.json` records `voiceVersion`, `voice`, `model`, `profileVersion` and `speechHash` per clip. A clip plays only if all of these hold (`isFaqAudioFresh`):
   - the version and voice match `TUSHKY_VOICE`;
   - the entry's `profileVersion` matches;
   - the entry is fresh against the site data (TASK-123);
   - the hash of today's speech transcript matches, so an answer edit or a pronunciation-map edit invalidates the clip without a version bump.

   A stale clip falls through to the live route, which speaks the current text (V§30).
9. **Speech normalisation rules** (`lib/tushky-voice/speech-text.ts`, in order):
   1. code fences → a pointer sentence;
   2. tables → one sentence per row;
   3. headings → sentences;
   4. bullets and numbers → sentences without markers;
   5. "Sources:" lines and bracket chips dropped;
   6. links → their label;
   7. "Label: url" → "You can also open the Label link below.", other URLs → "the link below";
   8. e-mail spoken;
   9. emphasis and code markers dropped;
   10. emoji dropped, keeping the sentence break;
   11. certain pronunciations applied;
   12. `47%` → "forty-seven percent", `5,760` → words, `7+` → "7-plus", ranges → "to", month abbreviations → full names, `k=8` → "k equals 8";
   13. tidy;
   14. a summary if over 1,200 characters / 190 words.

   Every real answer today is spoken in full.
10. **Playback UI:** see the UI §52 list below.
11. **Rate limiting:** a per-IP token bucket (burst 6, then 3/min), bounded to 5,000 tracked clients, plus a 2 kB request cap, a 300-character question cap, a 1,200-character speech cap, a 4.2 MB audio cap and a 20 s Gemini timeout.
   - **Per instance only.** On Vercel every function instance has its own buckets, and a cold start resets them. It stops one client hammering a warm instance; it is not a global quota.
   - **Why the exposure is bounded anyway:** the route can only speak the site's own answers. That is 21 FAQ entries plus 11 index answers, so at most 32 distinct transcripts. A warm instance's cache (32 MB, about 12 clips) absorbs repeats, and the worst case is re-synthesising those few texts per instance, not arbitrary text.
   - **Proposed upgrade (not added):** a Vercel Firewall rate-limit rule on `/api/tushky/speech` (no code change), or Upstash Redis / Vercel KV for a shared bucket.
12. **Latency observed:** none against Gemini (no key).
   - Locally, `next start` with no key: a refused request completes in 1–2 ms. The FAQ recompute plus a failed (unconfigured) TTS call takes 17 ms (`[tushky-voice]` log lines).
   - Metrics wired for later: `listen_to_start` bucket on "Tushky Voice Started" (V§61 `listenClickToAudioStartMs`), `faq_audio_cache_hit`, and `server-timing: tts;dur` plus `ttsMs` in the server log (`ttsGenerationMs`).
   - The audition script prints per-clip generation time.
13. **Quota/error behaviour:** see the table below.
14. **Accessibility:**
   - native buttons named "Listen to Tushky's answer" / "Pause Tushky" / "Resume Tushky" / "Replay Tushky's answer" (V§65, UI§35);
   - the loading line in `role="status"`;
   - waveform and clock `aria-hidden`, so the conversation's live log never reads progress ticks;
   - the main control is the same element across states, so focus survives Listen → Pause → Resume → Replay;
   - when an error/quota state removes the focused control, focus moves to Try again / the strip, but it is never stolen back if the visitor has moved on (unit-tested);
   - 44 px targets and the rust focus ring;
   - axe clean at 390/1440 with the strip idle and playing;
   - reduced motion stops the spinner, the playhead bar and the avatar cue, and audio still plays.
15. **Voice QA findings:** no audio could be produced, so pronunciation and voice quality are **unverified**. Textual QA of what would be spoken, for the V§75 set:
   - "Who is Tushar?" → "…with 7-plus years… Woof woof." (the 🐾 is gone);
   - RailCite → "…in August to September 2026… (five thousand seven hundred and sixty documents as of 15 September 2026)…";
   - certifications → "…A W S Solutions Architect – Associate…; Scrum.org's P S M one and P S P O one; … skill badges on rag and Vertex AI.";
   - the fixture → "Pronunciation check: five thousand seven hundred and sixty documents, a forty-seven percent cut, G C P, fire, a P R D and a rag pipeline.";
   - "What is RAG?" gets the fallback refusal from the index, so **no voice is offered** (by design).

   Listening is Tushar's step 2.
16. **Known limitations:** see the section below.

## UI spec §52 final report

1. **Files changed:** see "Files".
2. **VoicePlayer component:** `components/ai/voice/TushkyVoicePlayer.tsx`: `TushkyVoicePlayer`, `TushkyVoiceProvider` and `useVoiceEntry`.
   - Props are `{messageId, question, answerText, faqId?, cachedAudioUrl?, cachedDurationMs?}`, not UI§37's `speechText`, because the server recomputes the speech (brief §3.3; Dev-134).
   - It renders inside the answer bubble between the text and the sources (UI§1, §20).
3. **Playback states:** `idle`, `loading` (shown as "pending", the pressed idle look, for its first 150 ms, UI§21), `playing`, `paused`, `ended`, `error`, and `resting` (quota).
4. **Visual styling:** one block in `app/globals.css` (TASK-134), using paper tokens and `color-mix` only (EVAL-020 passes).
   - a cream strip (note-tinted ivory with a faint kraft fibre hatch), a kraft hairline border and a softly irregular edge (unequal radii, not a clip, so controls stay clear, UI§17);
   - a paper-on-paper shadow with a warm terracotta under-glow;
   - a 44 px terracotta disc with an ivory icon, hover −1 px, pressed +1 px with an inset shadow;
   - navy label, muted ink-soft clock, terracotta secondary Replay behind a kraft divider;
   - one height (60 px) in every state, so there is no layout jump (UI§46);
   - the avatar cue: two small rust sound-wave marks beside Tushky's avatar while that answer speaks (UI§14).
5. **Waveform:** 26 CSS bars whose heights are seeded from the answer hash (each answer has its own quiet shape). They fill terracotta with real playback progress from `timeupdate`, with re-renders stepped at 0.25 s (UI§12). The bar under the playhead is navy and breathes. It is fully complete when ended. Only the playing strip animates (UI§45). No library, no canvas. No seeking (UI§13 optional; not faked).
6. **Audio manager:** `components/ai/voice/audio-manager.ts`, plain TypeScript. It uses one hidden `HTMLAudioElement` (no `controls`, never in the DOM), so only one answer can sound at once:
   - starting another answer pauses the current one and keeps its position;
   - drawer close → `releaseAll()`: stop, forget, revoke every Blob URL (V§52). Reopening never resumes;
   - route change → `pauseActive()` (V§51);
   - `dispose()` on unmount;
   - on the first Listen it plays a 50 ms silent Blob clip inside the click, so iOS Safari allows playback once the fetch returns. If a browser still refuses, the strip lands in Paused (press to play), not Error.
7. **Cached FAQ audio:** a fresh clip plays from its static URL with no request. Its known duration shows in the idle strip ("0:18"), and it goes straight to Playing under 150 ms. If the file fails, Try again asks the route instead.
8. **Gemini-generated audio:** `POST` → Blob → Blob URL, stored per answer hash for the session. The loading copy is a fixed set rotated per listen ("Finding my voice…", "Warming up the woof…", "Almost ready…"), never generated (V§22). No duration is shown until metadata arrives (UI§22).
9. **Mobile:**
   - the strip is 100% of the bubble;
   - at ≤ 300 px of strip (390 viewport): "Listen" / icon-only Pause, Resume and Replay, `[⏸] ▮▮▮▯▯ 0:08 / 0:30 [↻]` on one row (UI§32);
   - at ≤ 380 px (the drawer at 1440 too, where the bubble is ≈ 340 px) Replay is icon-only;
   - 44 px targets, no overflow (e2e at 390).
10. **Accessibility:** as V§79.14 above.
11. **Analytics:** Vercel Analytics (the site has no Mixpanel), following TASK-123's pattern.
   - **Events:** `Tushky Voice Listen Clicked / Started / Paused / Completed / Replayed / Failed`.
   - **Properties:** `message_type` (faq|generated), `audio_source` (cached|generated), `answer_length_bucket`; plus `listen_to_start` and `faq_audio_cache_hit` on Started, and `error_code` on Failed.
   - Never answer text (unit-tested). V§60's "Tushky Voice Played" is "Started" here.
12. **Compromises:** see "Judgement calls" and "Known limitations".

## Error and quota mapping

| Situation | Route | Strip |
|---|---|---|
| Missing/extra field (`text`…), bad JSON/values | 400 `invalid-request` | Error + Try again |
| Wrong content type / body > 2 kB | 415 / 413 | Error + Try again |
| This IP's bucket empty | 429 `rate-limited` + `Retry-After` | **Resting** (no retry button, no auto-retry) |
| Question resolves to the fallback / an empty answer | 422 `no-audio` | Error (the UI never offers a strip for those, so only a forged request sees it) |
| Recomputed answer ≠ the one shown (hash / FAQ id) | 409 `answer-mismatch` | Error |
| Google quota / 429 / `RESOURCE_EXHAUSTED` | 503 `voice-resting` | **Resting** |
| No key / key refused | 503 `voice-unavailable` | Error |
| Timeout (20 s) | 504 `voice-unavailable` | Error |
| Other provider failure / no audio / audio > 4.2 MB | 502 `voice-unavailable` | Error |

The text answer is never touched. Errors are never cached. No provider message reaches the client.

## Brief §3: what was corrected, and how

1. **No live Gemini text:** "Gemini text answer" = the answer the site already produces (FAQ cache → local index). No text-generation path was built.
2. **Static site:** the route is the first server function. `scripts/assert-static.ts` is now a tested pure `checkStatic()`: pages must be prerendered, and only `/api/tushky/speech` and `/api/dev/tushky-voice` may be dynamic. **Design.md §11 Dev-133.**
3. **Abuse prevention:** the pipeline was lifted into `lib/ask/pipeline.ts#createTushkyPipeline`, which the drawer and the route both import. It needs no browser-only code. The answer depends only on the question: history only affects follow-up chips. So nothing but the ≤ 300-character question is sent.
4. **Rate limiting:** in-memory token bucket, per instance, documented as such. The upgrade is proposed, not added.
5. **Key:** read from `GEMINI_API_KEY` in exactly one module (`lib/tushky-voice/tts-client.ts`; TASK-123's offline refresh script also reads it). No `NEXT_PUBLIC_` variant anywhere (unit-tested). Not in logs, errors or responses (unit-tested).
6. **Model:** configurable; request shapes from Google's official sources (above).
7. **Audio format:** WAV on the live route. FAQ files are native MP3 (smaller than the WAV + pure-JS encoder the brief suggested, with no devDependency). 0 bytes today.
8. **CSP:** `media-src 'self' blob:`. `connect-src 'self'` and the youtube-nocookie `frame-src` are unchanged (`csp.test.ts` pins all three).
9. **Analytics:** Vercel Analytics, names and buckets only.
10. **Mockup text:** not copied. Samples and tests use real FAQ answers. The one exception is the audition's labelled pronunciation fixture (V§75 asks for "a response containing 5,760, 47%, GCP, FHIR, PRD and RAG"), which is never shown or served.
11. **Voice identity and pronunciations:**
   - `data/tushky/pronunciations.json` holds only certain terms: GCP, PRD(s), AWS, GenAI, RAG ("rag"), FHIR, SAFe, HIPAA, PSM I, PSPO I, M.Tech, B.E. and K–12.
   - `unconfirmed` lists Tushar, Tushky, Quantiphi, Shellkode, RailCite, MARS, Pratyasa, Tegaki, Nuptis, Velora, Devin and the patent number. These are **not applied**; Tushar confirms them.

## E2E failures in the full run (not caused by TASK-134)

| Test | Why it failed here |
|---|---|
| `eval-014` valid src (w390) | the test shells out to `ffmpeg` to make a fixture MP4; `ffmpeg` is not installed in this container (`spawnSync ffmpeg ENOENT`) |
| `portfolio-video` Campfire + Slag City (w390, w1440; 4 tests) | the YouTube player and the product/GitHub popups need `www.youtube-nocookie.com` and the external sites; the container's egress proxy refuses them (`curl` → 403). The voice change touches only `media-src`; `frame-src` is unchanged and pinned by `csp.test.ts` |
| `eval-011` dead controls; `playground` live URLs (w1440) | they HEAD external sites (Credly, `*.vercel.app`, GitHub Pages), and every one returns **403 from the egress proxy** |
| `lenis` PageDown/Space scroll (w1440) | a timing flake under `PW_WORKERS=2`: re-run alone it **passed 3/3** (`--repeat-each 3`) |

**Re-run after the sync merge (2026-10-05, merged build, `PW_WORKERS=2`):**

- **Totals:** 1,352 passed, 8 failed, 1,688 skipped in 25.8 min. The voice spec passed 36/36 again.
- **Same seven as before:** `eval-014` ×1, `portfolio-video` ×4, `eval-011` dead controls ×1 and `playground` live URLs ×1, all needing ffmpeg or blocked external hosts. Lenis passed this time.
- **One new failure, `eval-019` "static HTML carries the banner `<img fetchpriority=high>` and no `<video>`" (w1440).** The test finds a `pf-stage-poster` image where it expects none. It **fails identically on a clean `origin/m-009-redesign` (`e6c6e1a`) build**, checked in a separate worktree. So it is a base-branch failure, most likely from PR #6's hero intro video, and not caused by this branch.

All eight need a re-run on Tushar's Mac (network + ffmpeg) before merge. No voice or drawer test failed: `ask-voice` 36/36 and `ask-panel` 0 failures.

## Independent review

A separate review pass (read-only, after the first full implementation) found five real defects. All five are fixed in `66c4cf1`, and each has a test that fails on the code before the fix:

1. **Listen did nothing under `pnpm dev`.** React Strict Mode's dev effect cleanup disposed the audio manager kept in state. The provider now re-arms it on every effect setup (`activate()`).
2. **Focus fell to `<body>` after Try again** while the new request loaded. Focus now lands on the main control, which is `aria-disabled` but still focusable, and the strip carries `tabIndex -1` as a fallback.
3. **Other sites could trigger requests without a CORS preflight.** The route accepted any content type containing `application/json`, which includes a "simple" type such as `text/plain; x="application/json"`. Any page could then have its visitors' browsers POST real questions and spend quota. The route now requires exactly `application/json` and also refuses `Sec-Fetch-Site: cross-site`.
4. **A chunked body was buffered whole before the 2 kB check,** and a client disconnect returned a 500. The body is now read with a byte cap, and a broken read is a 400.
5. **A broken FAQ clip counted as two failures** (two "Failed" analytics events). `fail()` is now idempotent.

## Verified vs judgement

**Verified** (by a test or a command in this session):

- the normaliser rules;
- the route's validation, recompute, mismatch, limits, error mapping, cache and secrecy;
- the TTS client's request shapes against the SDK/cookbook contract (mocked fetch);
- WAV wrapping;
- FAQ-audio invalidation and the generator's skip logic;
- the audition route's 404 outside dev;
- assert-static;
- CSP;
- the player/manager state machine;
- the whole e2e flow in a real Chromium on the production build with a mocked route: one request per answer, one-at-a-time, drawer close, error, quota, keyboard, axe, 44 px targets, overflow, reduced motion;
- the bundle budget;
- no Gemini strings in client chunks;
- `next start` smoke: 400 for `text`, 422 for an off-topic question, 503 without a key, 405 on GET, 404 on the audition route.

**Judgement, not verified:**

- how Achird (or any voice) sounds;
- the style prompt's effect;
- whether the pronunciation respellings ("G C P", "P R D", "rag", "fire", "hippa") land well with this model;
- real latency and file sizes;
- Safari/iOS playback (the unlock clip follows the standard pattern; only Chromium was run);
- that Google's 3.8 Interactions reply for TTS carries audio under `steps[].content[]`, per the SDK types. The client also accepts an SDK-style `output_audio`.

## Judgement calls (recorded in Design.md §11 Dev-133 / Dev-134 where visual)

- **FHIR → "fire", not letters.** The brief's example said letters. HL7, the standard's owner, says it is pronounced "fire", and recruiters in healthcare would hear letters as a mistake. It's one line in `pronunciations.json` if Tushar prefers letters.
- **FAQ audio metadata in a separate `faq-audio.json`,** not inside `faq.json` entries (V§29). It carries the same fields, and TASK-123's refresh script and the audio script never rewrite each other's file.
- **Replay** is icon-only whenever the strip is narrower than 380 px. The drawer bubble is only ≈ 340 px even at 1440, and the full text made the strip overflow in the first screenshots.
- **Idle label vs accessible name:** the visible text is "Listen to this answer" (UI§4) and the name is "Listen to Tushky's answer" (V§65, UI§35), as the two specs require. Both start with "Listen", so voice control ("click Listen") works. Ended shows "Replay", so its name contains its text.
- **Left out (optional in the UI spec):**
  - the one-time "Tap to hear Tushky →" annotation (UI§48);
  - the "Tushky can talk too 🔊" note (UI§47; the brief says the empty state stays unchanged);
  - seeking (UI§13);
  - FAQ prefetch (V§63; there are no clips yet, and a click on a cached clip is already near-instant);
  - Voice Design (V§38).
- **The route answers 422 for refusals** instead of speaking the fallback. The audition still includes the fallback as sample E so Tushar can hear the "limitation" tone.

## Known limitations

- **Silent until the key is added** in Vercel (setup doc). No real audio, voice choice or latency was verified here.
- **The rate limit and runtime cache are per server instance** (no KV). A distributed client can exceed the nominal rate across instances. Upgrade: Vercel Firewall rule or Upstash/Vercel KV.
- **Live answers are sent as 24 kHz WAV** (≈ 48 kB/s, roughly 2–3 MB for today's longer answers). The 1,200-character speech cap keeps audio under Vercel's 4.5 MB response limit. Switching the route to Gemini's native MP3 would cut it by about 8x (`format: "mp3"` in `speech-route.ts`), but the brief asked for WAV.
- **No streaming:** the first sound waits for the whole clip (a unary call).
- **Sync merge:** at first the brief's `git merge origin/m-009-redesign` was blocked by this session's permission policy. It was done on 2026-10-05 at Tushar's request (`e6c6e1a`, including TASK-133, the case-study journal and the hero intro video). `m-009-redesign` had used Dev-127…132 in the meantime, so this task's rows are **Dev-133 and Dev-134**. The commits below that mention Dev-128/129 predate the renumbering.
- **Browser version:** e2e ran on Chromium 141 rather than Playwright 1.63's pinned Chromium 153 (CDN blocked). Worth one local re-run on the Mac.

## Files

**Added:**

- **Config and data:**
  - `config/tushky-voice.ts`
  - `data/tushky/pronunciations.json`
  - `data/tushky/faq-audio.json` (empty until generated)
- **`lib/tushky-voice/`:**
  - `speech-text.ts`, `hash.ts`, `wav.ts`
  - `tts-client.ts`, `rate-limit.ts`, `audio-cache.ts`
  - `contract.ts`, `speech-route.ts`, `server.ts`
  - `faq-audio.ts`, `audition.ts`, `audition-route.ts`
- **Pipeline:** `lib/ask/pipeline.ts`
- **Routes and pages:**
  - `app/api/tushky/speech/route.ts`
  - `app/api/dev/tushky-voice/route.ts`
  - `app/dev/tushky-voice/page.tsx`
- **Components:**
  - `components/ai/voice/audio-manager.ts`
  - `components/ai/voice/TushkyVoicePlayer.tsx`
- **Scripts:**
  - `scripts/generate-tushky-faq-audio.ts`
  - `scripts/tushky-voice-audition.ts`
- **Unit tests** (`tests/unit/`):
  - `tushky-speech-text.test.ts`, `tushky-speech-route.test.ts`, `tushky-tts-client.test.ts`
  - `tushky-voice-infra.test.ts`, `tushky-voice-player.test.tsx`, `assert-static.test.ts`
- **E2E:** `tests/e2e/ask-voice.spec.ts`
- **Screenshots:** `docs/screenshots/m-009/task-134/*.png` (16)
- **Reports:** `docs/reports/TASK-134-setup.md`, this report

**Changed:**

- `components/ai/AskPanel.tsx`: the shared pipeline, FAQ-audio map, voice provider
- `components/ai/AskTushky.tsx`: the strip in each answer, the avatar speaking cue
- `app/globals.css`: the TASK-134 block
- `lib/csp.ts`: `media-src … blob:`
- `next.config.ts`: comment only
- `scripts/assert-static.ts`: the allow-list and a tested `checkStatic()`
- `tests/unit/csp.test.ts`
- `tests/e2e/routes.json`: `/dev/tushky-voice` in the dev list
- `Design.md` §11: Dev-133, Dev-134
- `HANDOFF.md`: shipped-table row

## Commits

- `f762d7c` Add Tushky speech normaliser, pronunciation map and voice config (TASK-134)
- `9ece35f` Add POST /api/tushky/speech that recomputes the real answer (TASK-134)
- `05fc3bc` Allow exactly the speech and audition routes as dynamic; media-src blob: (TASK-134)
- `372b79e` Add the Listen/Pause/Replay paper strip to Ask Tushky answers (TASK-134)
- `0754706` Add FAQ audio metadata, generation and dev-only audition tools (TASK-134)
- `7dfda48` Add ask-voice e2e with a mocked speech route, and state screenshots (TASK-134)
- `4df9353` Never steal focus back into the voice strip; renumber to Dev-128/129 (TASK-134)
- `e861684` Record Dev-128/129 and Tushar's voice setup steps (TASK-134)
- `66c4cf1` Harden the speech route and fix dev Strict Mode, retry focus and double failures (TASK-134)
- `89106a8` Refresh the voice strip screenshots from the final build (TASK-134)
- (this commit) Add the TASK-134 report
