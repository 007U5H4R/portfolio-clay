# Ask Tushky voice output (Tushar, 2026-09-29; content complete, lists lightly condensed; spec 1 of 2)

Ticket: TASK-134. The companion UI spec is `tushky-voice-ui-spec.md`; the mockup is `tushky-voice-ui-reference.jpg`.

---

I want you to add VOICE OUTPUT to the existing **Ask Tushky** portfolio assistant.

Tushky is Tushar's Golden Retriever portfolio assistant.

Current architecture already includes:

- Gemini-generated professional answers
- grounded portfolio/profile context
- suggested questions / FAQ caching
- a right-side chatbot drawer
- Tushky personality
- occasional "woof woof 🐾"

Now I want users to be able to LISTEN to Tushky's answers.

Use the Google Gemini Text-to-Speech API for speech generation.

## 1. PRIMARY EXPERIENCE

```
User asks Tushky
↓
FAQ cache check
↓
cached answer OR Gemini text generation
↓
text answer appears immediately
↓
user can press "Listen"
↓
Gemini TTS generates / retrieves audio
↓
Tushky speaks the exact answer
```

Do NOT block the text response while audio is being generated. Text should always appear first. Speech is an optional enhancement.

## 2. IMPORTANT VOICE-DIRECTION RULE

Do NOT imitate, clone, or reference a specific copyrighted cartoon character voice. Do NOT ask for "Goofy's exact voice."

Instead, create an ORIGINAL voice with these qualities:

- friendly cartoon-dog personality
- warm
- slightly goofy
- slightly lanky / loose delivery
- gentle baritone
- expressive but not exaggerated
- cheerful
- curious
- a little clumsy/charming
- soft rounded consonants
- relaxed pace
- slight playful pauses
- warm smile in the voice
- intelligent enough for recruiter-facing content
- never childish
- never squeaky
- never slapstick
- never unintelligible

Think: "a lovable Golden Retriever who somehow became a professional portfolio guide."

It should feel memorable but still appropriate for recruiters, hiring managers, product leaders and collaborators.

## 3. VOICE PERSONALITY

"Golden Retriever energy + professional intelligence."

The voice should sound:

- warm
- approachable
- confident
- slightly playful
- curious
- good-natured
- trustworthy

Avoid:

- mascot-announcer voice
- exaggerated cartoon voice
- baby voice
- robotic TTS
- radio host
- deep movie-trailer voice
- overly theatrical acting

## 4. WOOF WOOF DELIVERY

Tushky sometimes includes "woof woof 🐾" in the text answer.

- Do NOT speak the emoji. Convert "woof woof 🐾" to "woof woof" for TTS.
- Delivery: light, playful, short, subtle. Then immediately return to normal professional speech.
- Do not bark realistically. Do not use loud animal sound effects.

## 5. TEXT VS SPEECH TRANSCRIPT

Maintain two forms: displayText and speechText.

- displayText: "Woof woof 🐾 — RailCite is a trust-first RAG assistant…"
- speechText: "Woof woof — RailCite is a trust-first RAG assistant…"

Do not alter factual content. speechText may only normalize:

- emojis
- URLs
- markdown
- bullet symbols
- abbreviations that sound awkward
- visual source labels

## 6. SPEECH CLEANUP

Before sending text to TTS, normalize presentation-only markup: markdown, **bold**, [links], bullet characters, headings, code fences. Do NOT drop the actual semantic content.

Display:

```
**RailCite**
- 5,760 documents indexed
- 0 invented citations
```

Speech: "RailCite. Five thousand seven hundred and sixty documents indexed, with zero invented citations by construction."

## 7. DO NOT READ SOURCE CHIPS ALOUD

UI source chips such as [RailCite], [Experience] or [Certifications] are NOT appended to speech. The spoken answer focuses on the response itself.

## 8. NUMBERS AND ACRONYMS

Normalize for natural speech only when necessary:

- "5,760": speak naturally
- "47%": forty-seven percent
- "RAG": preserve natural expected pronunciation
- "GCP": speak letters individually if needed
- "PRD": P-R-D

Do not alter displayed text.

## 9. GOOGLE GEMINI TTS

Use the current official Gemini TTS API. Preferred model for production-first implementation: gemini-3.8-flash-lite-tts (low latency, conversational speech, cost efficient, currently supports free-tier usage).

Keep the model configurable (`GEMINI_TTS_MODEL=gemini-3.8-flash-lite-tts`). Do not hardcode it throughout the codebase.

## 10. GOOGLE AI STUDIO

AI Studio is for testing voice directions, comparing voices and experimenting with speech prompts. The production portfolio calls the Gemini Developer API. Do NOT automate or embed the AI Studio website.

## 11. SERVER-SIDE ONLY

TTS runs server-side. Never expose GEMINI_API_KEY to the browser.

Create a route such as `POST /api/tushky/speech`.

- Input: `{ text: string, messageId: string, voiceProfile?: string }`
- Output: an audio stream, or an audio URL / binary response

Use the existing backend architecture.

## 12. SECURITY

Use the same server-side Gemini credential as text generation if appropriate (env `GEMINI_API_KEY`).

Do NOT create NEXT_PUBLIC_GEMINI_API_KEY. Do NOT commit keys, put credentials in source, or expose provider responses to the client.

## 13. TTS PROMPT

Use a stable speech style instruction. Conceptually:

> Speak as Tushky, a friendly Golden Retriever-inspired professional portfolio assistant.
>
> Voice qualities: warm, relaxed, slightly goofy, charming, approachable, intelligent.
>
> Use a gentle medium-low pitch, conversational baritone, natural pacing, soft rounded delivery and occasional playful pauses.
>
> Sound like a friendly companion explaining someone's professional work, not like a commercial narrator.
>
> Keep technical terminology clear and precise.
>
> Do not exaggerate the cartoon quality.
>
> When saying "woof woof," make it quick, playful and understated.
>
> Never imitate a specific existing fictional character or actor.

## 14. SPEECH SPEED

Default: slightly slower than ordinary conversation (target feel 0.92x–0.98x). Don't time-stretch audio client-side unless necessary; prefer controlling pacing through TTS style instructions.

## 15. INTONATION

- Slightly lift tone for curiosity, product discoveries and playful transitions.
- Use a firmer tone for metrics, factual achievements and technical explanations.
- Use softer delivery for limitations, caveats, "not measured" and uncertainty.

## 16. TECHNICAL ANSWERS

For "What is RailCite's architecture?", Tushky must remain clear. Do NOT overdo dog personality, and don't interrupt with dog jokes.

Desired cadence: "RailCite has a fairly deliberate trust pipeline. The query is classified first, then retrieval runs against the relevant railway circulars…"

## 17. SHORT ANSWERS

For answers below ~40 words, allow speech generation normally. Keep delivery natural and don't add speech padding.

## 18. LONG ANSWERS

Don't automatically synthesize a very long response. Recommended max: ~500–700 spoken words.

If longer, create a shorter `speechSummary`, and the UI says "Listen to summary" rather than "Listen". Do not silently truncate the text.

## 19. VOICE UI

Under each Tushky response: [ 🔊 Listen ]. After play starts: [ ⏸ Pause ] [ ↻ Replay ]. Optional small duration indicator (0:18). No giant audio player.

## 20. PAPER UI STYLE

Match Ask Tushky's visual language: a small torn-paper chip, navy icon, cream fill, subtle paper shadow, and a tiny paw icon if tasteful.

Do not use a default browser `<audio>` player visually. Use HTML audio underneath with custom controls.

## 21. PLAYBACK STATES

Support idle, loading, playing, paused, ended and error:

- IDLE: 🔊 Listen
- LOADING: small subtle indicator, "Finding my voice…"
- PLAYING: ⏸ Pause
- PAUSED: ▶ Resume
- ENDED: ↻ Replay

## 22. LOADING COPY

Subtle dog personality, from a fixed set: "Finding my voice…", "Warming up the woof…", "Almost ready…". Do not use random text generated by Gemini.

## 23. NO AUTO-PLAY

Do NOT automatically play speech, for accessibility, user control, browser autoplay restrictions and API cost. The user must click Listen.

## 24. ONE AUDIO AT A TIME

If one response is playing and the user plays another, stop or pause the previous audio. Only one active player at any time.

## 25. TEXT RESPONSE MUST NOT WAIT

```
Gemini text generation completes
↓
display answer
↓
speech remains optional
```

Do NOT generate TTS before showing the answer.

## 26. FAQ TEXT CACHE

The existing suggested-question FAQ cache remains. Suggested questions continue returning cached text instantly.

## 27. PRE-GENERATED FAQ AUDIO CACHE

For the most common suggested questions, pre-generate Tushky audio, for example:

- Who is Tushar?
- What products has Tushar built?
- What AI experience does he have?
- What are his strongest product skills?
- Tell me about RailCite.
- What enterprise experience does he have?
- What is his research background?
- What certifications does he have?

For these: cached question → cached text + cached audio. No live TTS call is necessary.

## 28. AUDIO CACHE STRUCTURE

Possibly `/public/tushky/audio/faq/` or object storage, e.g. `who-is-tushar-v3.wav`, `products-built-v2.wav`, `railcite-v4.wav`. If files become large, use object storage instead of bloating the frontend bundle.

## 29. AUDIO CACHE METADATA

A FAQ entry may become:

```
{
  id: "who-is-tushar",
  question: "Who is Tushar?",
  answer: "...",
  audio: {
    url: "...",
    voiceVersion: "tushky-v1",
    profileVersion: "2026-09"
  }
}
```

## 30. AUDIO CACHE INVALIDATION

Cached speech becomes stale whenever text changes. Use profileVersion, answerVersion and voiceVersion. Example cache identity:

```
tushky:
voice-v1:
profile-2026-09:
answerHash
```

If text changes, old audio must not be reused.

## 31. RUNTIME AUDIO CACHE

For generated answers, cache reusable TTS results if infrastructure allows. Key: `hash(speechText + voiceVersion + ttsModel)`.

Do NOT cache:

- errors
- malformed text
- sensitive user-specific content
- conversation-specific speech when inappropriate

## 32. CACHE FIRST

```
speech cache?
↓
YES → play cached audio
↓
NO → call Gemini TTS
↓
cache result if eligible
↓
play
```

Do not call Gemini TTS if identical audio already exists.

## 33. CLIENT CACHE

During the current browser session, reuse generated audio for the same message. Don't re-request speech on every Replay; Replay reuses the same audio blob or URL.

## 34. RESPONSE FORMAT

Prefer returning audio/wav or another natively supported audio MIME type returned by Gemini. Do not unnecessarily transcode unless required.

## 35. WAV FILE SIZE

If WAV becomes too heavy for cached FAQ audio, evaluate whether the current API/output supports another practical format. Do not add FFmpeg server-side unless necessary. First optimize speech length, cache strategy and storage.

## 36. VOICE CONFIGURATION

Keep voice settings centralized in `/config/tushky-voice.ts`. Conceptually:

```
export const TUSHKY_VOICE = {
  model: process.env.GEMINI_TTS_MODEL,
  voice: "...",
  version: "tushky-v1",
  style: "...",
};
```

Do not scatter style prompts across route handlers.

## 37. VOICE SELECTION

Use Google AI Studio first to audition available voices. Select one that naturally supports warm baritone, friendly, relaxed, expressive and slightly goofy/charming delivery. Do NOT choose a voice solely because it sounds cartoonish: speech clarity is more important.

## 38. OPTIONAL VOICE DESIGN

The Gemini Voices API supports custom voice design using natural-language prompts. If available and practical, consider creating a dedicated ORIGINAL Tushky voice. The prompt must describe qualities, not imitate an existing copyrighted character.

Example direction: "Warm male cartoon-dog-inspired baritone with gentle comic timing, rounded delivery, cheerful curiosity, friendly Golden Retriever energy, relaxed rhythm, expressive but professional."

If Voice Design creates unnecessary complexity, use a suitable prebuilt voice. Do not block the feature on it.

## 39. NO VOICE REPLICATION

Do NOT clone an actor, a celebrity, a cartoon voice actor, a fictional-character recording, or another person's voice. Tushky should have an original voice identity.

## 40. SPEECH METADATA / STYLE CONTROLS

If the model/SDK supports structured speech metadata and inline vocal styling, use it instead of stuffing every detail into the transcript. Separate WHAT TO SAY from HOW TO SAY IT. Do not expose style tags in the visible response.

## 41. TTS SHOULD RECITE GROUNDED TEXT

The speech service must NEVER independently regenerate facts.

Pipeline:

```
Gemini text answer
↓
final grounded answer
↓
speech-normalization
↓
Gemini TTS
```

NOT:

```
User question
↓
Gemini TTS improvises answer
```

TTS speaks the already-approved answer.

## 42. DO NOT LET TTS MODIFY CONTENT

TTS may change prosody, pace and tone. It must not:

- add claims
- summarize without instruction
- invent jokes
- alter metrics
- change dates
- change employers
- change project names

## 43. PERSONA CONSISTENCY

Text Tushky and Voice Tushky feel like the same character: warm, intelligent, a subtle Golden Retriever personality. Not professional text with extreme cartoon speech.

## 44. SPECIAL PRONUNCIATION MAP

Create an optional, editable pronunciation dictionary for portfolio-specific terms, e.g. `/data/tushky/pronunciations.json`. Possible entries: Tushar, Tushky, RailCite, Quantiphi, GenAI, RAG, GCP, FHIR, MARS, SAFe. Do NOT guess pronunciation where uncertain.

## 45. LINKS IN SPEECH

Do not read long URLs. Display "GitHub: github.com/..." becomes speech "You can also open the GitHub link below."

## 46. MARKDOWN TABLES

Do NOT read raw table syntax. Generate a natural speech representation ("His experience spans three main areas…") instead of reading pipe, dash, pipe.

## 47. BULLET LISTS

Read bullets with natural pauses. Do not say "bullet one", unless numbering is semantically important.

## 48. CITATION / SOURCE REFERENCES

Do not read raw internal references or source metadata. Speech may say "You can verify that in the RailCite case study." only if that language is already supported by the answer structure.

## 49. USER SETTINGS

Optional, on-demand only. No persistent global autoplay setting needed initially. If you add preferences, remember them only in localStorage; no account state.

## 50. MUTE

Provide a clear way to stop audio. When the drawer closes, pause/stop active audio. Tushky must not keep speaking after the drawer disappears.

## 51. PAGE NAVIGATION

If the user navigates to another route while audio plays, pause it. Avoid surprising background speech.

## 52. AUDIO CLEANUP

For generated Blob URLs, revokeObjectURL when the message is removed, the component unmounts, or the audio is replaced. Avoid memory leaks.

## 53. RATE LIMITING

The TTS endpoint is public-facing, so apply rate limiting, reusing existing Ask Tushky rate limiting if available. Suggested rules: per-IP/session limits, burst protection, a request length limit, a timeout. Do not permit unbounded public speech generation.

## 54. INPUT VALIDATION

Only synthesize answers generated by Tushky. Preferred: the client sends a messageId and the server resolves the stored/current message text, rather than trusting arbitrary huge client-supplied text. If the architecture can't do this, strictly validate provided text.

## 55. MAX SPEECH LENGTH

Set a practical maximum, e.g. ~4,000 characters, or another limit justified by Gemini TTS constraints and UX. For longer responses, generate or use a speech summary.

## 56. ABUSE PREVENTION

Do not turn `/api/tushky/speech` into a public arbitrary TTS endpoint. Depending on the architecture, require valid Tushky message context, a signed message payload, or a server-issued message ID.

## 57. ERROR STATE

If TTS fails, don't affect the text answer. Show "Couldn't find my voice this time 🐾" with [ Try again ]. Do not show the raw API error.

## 58. FREE-TIER LIMIT HANDLING

Handle quota/rate exhaustion gracefully. If Google TTS quota is unavailable:

- text chat continues working
- Listen may show an unavailable state
- do not repeatedly retry automatically

Example: "Voice is resting for a bit. The text answer is still here."

## 59. OBSERVABILITY

Track server-side: TTS request count, cache hit/miss, generation latency, response size, failures, quota errors. Do not log API keys.

## 60. MIXPANEL

If Mixpanel exists, track `Tushky Voice Played` with:

```
{
  answer_type: "faq" | "generated",
  audio_source: "cache" | "gemini",
  question_category
}
```

Also track `Tushky Voice Paused` and `Tushky Voice Replayed`. Do not send the entire answer text.

## 61. LATENCY METRICS

Measure listenClickToAudioStartMs, faqAudioCacheHit and ttsGenerationMs, to optimize later.

## 62. PERFORMANCE TARGET

Cached FAQ speech should feel near-instant. Uncached speech shows immediate loading feedback. Do not freeze the UI.

## 63. OPTIONAL PREFETCH

For suggested FAQ answers only, after the initial page load becomes idle, optionally preload metadata/audio for the most likely 1–2 suggestions. Do NOT preload every large audio file. Respect bandwidth.

## 64. MOBILE

Voice controls stay compact ([ 🔊 Listen ], not a full-width player), with touch targets ≥44px where practical.

## 65. ACCESSIBILITY

Buttons require labels: aria-label="Listen to Tushky's answer", Pause: "Pause Tushky", Replay: "Replay Tushky's answer". Do not rely on icons alone.

## 66. SCREEN READERS

Controls must not duplicate the whole answer in accessibility labels; the text already exists in the DOM. Use concise labels.

## 67. REDUCED MOTION

Don't tie speech to animation. With reduced motion enabled, audio still works.

## 68. OPTIONAL TUSHKY AVATAR MICRO-ANIMATION

While Tushky speaks, allow only a tiny cue: an ear tilt, tiny tail movement, subtle mouth movement or small sound-wave lines. Nothing aggressive; no realistic lip sync needed initially.

## 69. NO SOUND EFFECTS

No barking sound, bell, clicker, jingle or background music. The TTS voice is enough.

## 70. SPEECH BUTTON PLACEMENT

Listen goes under each assistant answer:

```
Tushky avatar
answer bubble

[ 🔊 Listen ] [ source chips ]
```

Hierarchy: answer first, sources second, voice control subtle.

## 71. FAQ AUDIO GENERATION SCRIPT

Create a script such as `scripts/generate-tushky-faq-audio.ts` that:

1. loads FAQ entries
2. normalizes the speech transcript
3. requests Gemini TTS
4. saves audio
5. updates FAQ metadata
6. records the voice version
7. skips unchanged answers
8. outputs a generation report

## 72. FAQ AUDIO BUILD SAFETY

Do not regenerate FAQ audio on every production build. Only regenerate manually, when an answer changed, or when the voice version changed.

## 73. VOICE VERSIONING

Use `TUSHKY_VOICE_VERSION=tushky-v1`. When the voice, tone, style or pronunciation dictionary changes, increment to `tushky-v2`, which cleanly invalidates the old cache.

## 74. DEVELOPMENT TOOL

Create a small dev-only route or script to audition the Tushky voice with samples:

- A. introduction
- B. technical answer
- C. metrics-heavy answer
- D. playful "woof woof" answer
- E. limitation/error answer

Do NOT expose this tool publicly in production.

## 75. VOICE QA SCRIPT

Test at least:

- "Who is Tushar?"
- "Tell me about RailCite."
- "What makes Tushar a product manager?"
- "What AI products has he built?"
- "What is RAG?"
- "What certifications does he have?"
- A response containing 5,760, 47%, GCP, FHIR, PRD and RAG.

Verify pronunciation quality.

## 76. ACCEPTANCE CRITERIA

Complete only if:

- text answers still appear immediately
- Listen is opt-in
- the API key stays server-side
- TTS uses the grounded final answer
- cached FAQs can use cached audio
- replay does not call the API again
- only one response plays at once
- closing the drawer stops speech
- an error or quota failure doesn't break text chat
- the voice is warm and memorable
- the voice remains professional
- "woof woof" is subtle
- no exact fictional-character imitation is requested or implemented
- mobile works
- accessibility works

## 77. BEFORE IMPLEMENTATION

Before writing code:

1. inspect the Ask Tushky components
2. inspect the chat response structure
3. inspect the FAQ cache implementation
4. inspect the Gemini server integration
5. inspect rate limiting
6. inspect storage options
7. inspect analytics
8. inspect the deployment platform
9. verify current Gemini TTS SDK/API syntax from current official documentation
10. identify candidate prebuilt voices
11. present an implementation plan

Then implement.

## 78. IMPLEMENTATION ORDER

1. speech transcript normalizer
2. centralized Tushky voice config
3. server-side TTS endpoint
4. Listen/Pause/Replay UI
5. one-audio-at-a-time manager
6. runtime/session cache
7. FAQ pre-generated audio
8. quota/error handling
9. analytics
10. voice QA

## 79. FINAL REPORT

Report:

1. files added/changed
2. TTS model selected
3. selected voice / voice ID
4. exact voice direction
5. server endpoint
6. cache strategy
7. FAQ audio strategy
8. cache invalidation strategy
9. speech normalization rules
10. playback UI
11. rate limiting
12. latency observed
13. quota/error behavior
14. accessibility changes
15. voice QA findings
16. known limitations
