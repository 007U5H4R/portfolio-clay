# Ask Tushky voice playback UI (Tushar, 2026-09-29; content complete, lists lightly condensed; spec 2 of 2)

Visual reference: `tushky-voice-ui-reference.jpg` (Tushar's mockup; its sample answer text is illustrative only; real answers come from the FAQ cache and local index).

I want the Ask Tushky chat UI to support a compact, beautifully styled voice playback experience directly inside each Tushky answer bubble. Use the supplied mockup as the VISUAL REFERENCE. Do NOT use a browser-default audio player. The playback UI should feel like it belongs naturally inside the existing paper-cutout / notebook / Tushky design system.

Visible states: (1) idle / ready to listen, (2) loading / generating speech, (3) playing, (4) paused, (5) ended / replay.

## 1. Message bubble structure
Tushky answer bubble: [Tushky avatar] answer text, then the VOICE CONTROL STRIP, then optional source chips and follow-up suggestions. Conceptually: `<TushkyMessage><Avatar /><AnswerText /><VoicePlayer /><SourceChips /><FollowUps /></TushkyMessage>`. Do not put the audio controls outside the response bubble.

## 2. Idle / ready state
Compact torn-paper / rounded-paper strip: `[ ▶ ] Listen to this answer   [ waveform preview ]   0:18`. Duration only if already known; otherwise omit it. Use: terracotta circular play button; navy text; cream / warm-white paper background; very subtle paper texture; soft natural shadow; compact waveform graphic; optional duration on the far right. Not a full-width media player unless the bubble is already wide.

## 3. Play button
Circular terracotta, white play triangle. ~40–46px desktop, 42–48px touch/mobile. Hover: slightly stronger paper shadow, translateY(-1px), no scale >1.03. Pressed: subtle inward press.

## 4. Listen label
Default "Listen to this answer"; shorter "Listen" on narrow widths. Never "Generate audio", "Text-to-speech" or "TTS". The interface should feel human.

## 5. Waveform
Subtle stylized waveform; no giant animated waveform. Idle: muted pale terracotta/beige bars. Playing: active bars in terracotta/navy. Decorative or progress-aware (prefer actual playback progress if practical). No large visualization library.

## 6. Loading state
On Listen with uncached audio, immediately switch to `[ spinner/paw indicator ] Finding my voice… [ faint waveform ]`. Optional fixed alternates: "Warming up the woof…", "Finding my voice…", "Almost ready…" (small deterministic rotation allowed). Never ask Gemini to generate loading copy. Do not block the rest of the chat.

## 7. Loading visual
Small circular spinner of dots, small paw marks or terracotta segments; subtle. No large skeleton loaders, full-message shimmer or big progress bars.

## 8. Playing state
`[ ⏸ Pause ]  [ ACTIVE WAVEFORM ]  0:08 / 0:18  [ ↻ Replay ]` as one compact paper strip. Pause: terracotta emphasis. Waveform: active section darker. Elapsed/total: small muted navy. Replay: secondary terracotta outline/text.

## 9. Pause state
Replace Pause with `[ ▶ Resume ]`; keep progress, waveform and Replay. Do not restart audio.

## 10. Replay
Restarts from 0, reuses existing cached/generated audio, makes NO new Gemini request. `↻ Replay`, visually secondary to Pause/Resume.

## 11. Ended state
Show `[ ▶ Play again ]` or `[ ↻ Replay ]`; waveform returns to its complete state; no automatic replay.

## 12. Progress
If practical show `currentTime / duration` (e.g. 0:08 / 0:18), updated smoothly but efficiently: no re-render every few milliseconds; use a reasonable interval or the audio `timeupdate` event.

## 13. Seeking
Optional for v1. If implemented, click/tap the waveform or progress line. If not, don't fake it. No complex slider unless useful.

## 14. Tushky avatar while speaking
ONE subtle cue: tiny mouth movement, slight ear wiggle, tiny tail bounce, or two small sound-wave marks near the avatar. Don't animate the whole dog; no barking animation.

## 15. Active speaker state
Optional tiny "Tushky is speaking" label or small sound-wave icon near the avatar. No large status banner.

## 16. Material style
Background warm paper (#FBF6ED-like), subtle beige border, soft paper-on-paper shadow, terracotta accent, deep navy primary text, muted slate/navy secondary. Avoid glassmorphism, dark media controls, metallic UI, a Spotify-like player, neon waveform effects.

## 17. Paper shape
Softly irregular paper edge or light torn-paper silhouette, kept subtle. Controls must stay easy to scan: function over decorative edges.

## 18. Width
Desktop: fits naturally under the answer text, ~70–90% of message width; no forced full width. Mobile: 100% of the available bubble width.

## 19. Internal spacing
Padding 10–14px; gap 10–14px; play/pause button 44px; waveform flex: 1; duration a small fixed-width label; Replay compact.

## 20. Source chips relationship
Order: answer → voice player → sources → follow-up questions.

## 21. FAQ cached audio state
Pre-generated FAQ audio should feel nearly instant. Don't show "Finding my voice…" if cached audio loads immediately; under ~150ms go directly to Playing.

## 22. Uncached audio state
Gemini-generated speech shows Loading. No fake duration until audio metadata is available.

## 23. Error state
Replace the strip with "Couldn't find my voice this time 🐾" and [ Try again ]. Keep the answer text untouched. Subtle red/terracotta warning state. No stack trace or provider error.

## 24. Quota state
If TTS quota/free-tier limit is exhausted: "Voice is resting for a bit. The text answer is still here." Do not repeatedly retry.

## 25. One active audio rule
Only one Tushky answer plays at once. Playing another pauses/stops the current one first. Managed globally within the Ask Tushky drawer.

## 26. Drawer close
Pause all speech immediately when the drawer closes. On reopen, do not auto-resume.

## 27. Route change
Pause active speech on page navigation. No unexpected continued voice.

## 28. User message styling
User questions stay visually distinct (right-aligned or full-width clean bubble); Tushky left-aligned with avatar. No voice controls on user messages.

## 29. Tushky answer style
Keep cream paper, navy text, rounded/softly torn form, dog avatar on the left, readable typography, strong spacing. Voice controls must not make the message visually heavy.

## 30. Long answer behavior
For long answers using a speech summary, label "Listen to summary", not "Listen to this answer". If the full answer is speakable, use the normal label.

## 31. Tooltip
Optional desktop tooltip "Listen to Tushky"; not required for usability.

## 32. Mobile
Compact: `[ ▶ ] Listen   0:18`; while playing `[ ⏸ ] ━━━━━━━ 0:08 / 0:18 [↻]`. If tight, hide the "Replay" text and use the icon with an accessible label. Avoid awkward multi-row wrapping.

## 33. Touch targets
Play, pause, resume and replay: minimum ~44px where possible.

## 34. Keyboard
Enter/Space plays/pauses the focused control; all controls tab-accessible; visible navy/terracotta focus ring.

## 35. ARIA
aria-label "Listen to Tushky's answer", "Pause Tushky", "Resume Tushky", "Replay Tushky's answer". Loading state aria-live="polite". Don't announce every progress tick.

## 36. HTML audio
Underlying HTMLAudioElement, no native controls; manage via play(), pause(), currentTime, ended, loadedmetadata, timeupdate.

## 37. Component architecture
Reusable `<TushkyVoicePlayer />` with props `{ messageId: string; speechText: string; cachedAudioUrl?: string; isSummary?: boolean }`, internal status `'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'`.

## 38. Global audio manager
Small shared AskTushkyAudioContext / hook: current playing message ID; pause previous; stop on drawer close; stop on route change; reuse cached blobs; prevent multiple audio sources playing. Keep it lightweight.

## 39. Audio fetch flow
Listen click: if audio is cached in the client, play; else if a FAQ audio URL exists, load + play; else POST /api/tushky/speech → receive audio → create Blob URL → store in the session cache → play.

## 40. Button feedback
Immediate visual feedback on Listen click; never wait silently for the API.

## 41. Animation
Tiny motion only: waveform activation, play→pause morph if convenient, 1px button press, subtle avatar sound marks. No large spring animations.

## 42. Reduced motion
With prefers-reduced-motion: no waveform animation, no avatar movement, no button morph. Playback still works.

## 43. Visual mockup target
Match the mockup: response bubble with an integrated voice strip. Idle: play circle, "Listen to this answer", waveform, duration. Playing: pause, live waveform, elapsed/total, replay. Loading: "Finding my voice…", subtle loader.

## 44. Do not add
No large standalone audio player, download button, volume mixer, playback speed selector (v1), background music, bark SFX, transcript toggle, voice picker, waveform editor or audio attachment file UI. Keep it delightful and simple.

## 45. Performance
No heavy waveform libraries per message; use lightweight CSS/SVG (or simple canvas/SVG only if truly needed). Only animate the currently playing message.

## 46. Chat scroll
No large layout jumps between states; keep the strip height mostly consistent; don't force auto-scroll while audio plays.

## 47. Empty state
The Ask Tushky empty state stays mostly unchanged. No voice player before a response exists. Optional tiny note near the input, "Tushky can talk too 🔊", only if it doesn't clutter.

## 48. First response delight
Optional: on the first Tushky response only, a tiny handwritten annotation "Tap to hear Tushky →" pointing at Listen, once per session, never on every answer.

## 49. Analytics
If Mixpanel exists, track Tushky Voice Listen Clicked / Started / Paused / Completed / Replayed / Failed, with properties `{ message_type: "faq" | "generated", audio_source: "cached" | "generated", answer_length_bucket }`. Never log answer content.

## 50. Final acceptance criteria
Complete only if:

- Listen appears under Tushky answers
- cached responses can play instantly
- uncached responses show loading
- playback state is clear
- Pause works
- Resume works
- Replay works without an API call
- one audio at a time
- drawer close stops speech
- route change stops speech
- the error state is graceful
- the UI matches the Tushky paper aesthetic
- mobile works
- keyboard works
- accessibility labels exist
- no browser-default audio UI appears
- no layout jump during playback

## 51. Implementation order
1. VoicePlayer visual component
2. idle state
3. loading state
4. playing/paused state
5. replay
6. duration/progress
7. global audio manager
8. FAQ cached audio
9. error handling
10. responsive polish
11. accessibility
12. analytics

## 52. Final report
Report:

1. files changed
2. VoicePlayer component created
3. playback states
4. visual styling approach
5. waveform implementation
6. audio manager
7. cached FAQ audio behavior
8. Gemini-generated audio behavior
9. mobile behavior
10. accessibility
11. analytics
12. any compromises
