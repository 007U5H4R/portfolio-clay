# TASK-203 — What I Bring: seven interactive paper-craft scenes

Branch `m013/wib-scenes` (from main 026da48b). Spec: `/Volumes/E Drive/Dev/.scratch/wib-scenes/spec.md`. Decisions: `decisions.md` EXE-73, `Design.md` Dev-170.

## What was built, per scene

Every stage is a stack of cut-paper part sprites (`components/experience/WibScene.tsx`, config in `lib/wib/scenes.ts`) plus hand-drawn SVG strokes.
Hover, `:focus-visible` and a tap only LIFT (the primary object 2 to 4 px and a few degrees, a contact-shade crossfade, pointer parallax <= 6 px).
A click, Enter or tap plays the stage's one signature sequence to a settled end state.

| Stage | Hover / focus | Activation sequence (about 1.5 to 2.0 s, once) |
| --- | --- | --- |
| 01 Ambiguity | tag lifts and tilts, notes drift by different amounts | crumple settles, tag rises, notes square up, three hand-drawn connectors draw |
| 02 Discovery | lens shifts, notebook lifts, a card lifts | notebook page opens, lens moves to a passage, highlight and underline draw, two research cards slide in |
| 03 Product | blueprint rises, compass turns, bulb faintly lit | blueprint rises, a line is drawn with node rings, a note tab is pinned, compass swings and settles, paper bulb is lit (separate lit sprite plus a warm glow, opacity only) |
| 04 AI + GenAI | chip rises, blocks respond, one connector firms up | input moves in, connector 1; context moves in, connector 2; chip lit; connector 3 to the validation badge, which reappears; the output document unfolds. The existing flow labels are underlined in order |
| 05 Technology | cloud lifts, layers shift by different amounts, a connector firms up | lower layer settles, upper layers and cloud rise, two connectors draw, a node ring appears, layers settle into alignment |
| 06 Execution | foreground notes lift, arrow nudges, gear turns a few degrees | three note groups align in sequence, gear turns, arrow pulls back and settles into the target; the existing Discover to Iterate labels are underlined in order |
| 07 Impact | foreground lifts, flag tilts, chart lifts, a chart-line stub shows | road draws to the summit, flag dips and rises, chart rises, chart line climbs; the two existing self-reported figures rise in (no count-up) |

Shared model: `lib/wib/scene-machine.ts` (rest, playing, settled, resetting; per stage; unit-tested). A replay eases the scene back first. A stage left mid-sequence finishes, then rests. Reduced motion settles at once with no travel (connectors, lit sprites, underlines show by opacity). Mobile: the trail's art cell is 112 px (was 84), parallax is a fine-pointer feature only.

## Art, credits and bytes

- Light: the approved TASK-187 masters (reused, 0 credits). Night: Higgsfield GPT Image 2.5 relit each master (`gpt_image_2_5`, 1:1, reference image = the light master on flat magenta; quoted 0.25 credit each). 8 generations (one Ambiguity retry: the first pass dropped the question mark and scribbles; the prompt then named them as drawings to keep). **Credits spent by this lane: 2.0** (8 x 0.25; confirmed in the account transactions; the balance fell further because another lane was generating card art on the same account). Budget was 60. Two submissions were rate-limited (429) and not charged.
- Registration: every night master matches its light master at IoU 0.993 to 0.997, so one set of cut masks serves both themes.
- Parts are cut top to bottom from each master and each hole is filled (normalised convolution), so a part that moves exposes paper, not a copy of itself. Tooling (scratch, not shipped): `/Volumes/E Drive/Dev/.scratch/wib-scenes/tools/`. The road path was traced from the road pixels.
- Shipped: `public/media/what-i-bring/scenes/<stage>/<light|dark>/<part>.webp`, 512 px RGBA WebP, 36 files per theme. **Light 504,506 bytes, dark 494,768 bytes** for all seven scenes; only the active theme's set is requested. Per stage (light/dark bytes): ambiguity 73,766/68,146; discovery 69,646/66,270; product 78,100/78,396; ai-genai 104,936/112,024; technology 57,810/54,112; execution 81,032/75,982; impact 39,216/39,838.
- Removed: the 21 retired `<stage>/{back,mid,front}.webp` layers (about 1 MB). `landscape/strip.webp` stays.
- No text, letters or numerals are in any art. All headings, copy, labels and flow labels are existing HTML.

## Decisions and deviations from the spec (repo wins)

- The reference board's glossy 3D look is not copied: Design.md's cut-paper cardstock language and the approved TASK-187 art stay (same call as EXE-71).
- No new asset folder layout per scene with `frames/`: parts replace frame sequences (the spec itself says not to export near-identical frames).
- Spec asks the activation "validation marker appears": the badge is visible at rest (no essential content depends on animation), fades out for the first moments of the sequence and reappears at the validation step.
- Impact figures do not count up (self-reported values; a counter implies live measurement).
- The page's light landscape strip behind the dark night art is unchanged (out of scope: the strip has no dark variant). Night scenes read fine on it but it is the weakest light/dark seam.
- Below 1100 px a second tap collapses the stage (the TASK-187 trail contract), so replay there is collapse and re-open; on the landscape a second press replays.
- Desktop: a click no longer pins the stage against hovering the others (the old pin blocked hover on the other stages until another click).
- Part sprites are cut from masks, not generated separately, so some parts (output document, cards) show a soft filled edge where they have moved. At the shipped travel distances (<= 5% of the art) this reads as a shadow.
- EVAL-040 scope extended to the new scene classes; a shared `wib-scenes.spec.ts` covers them.

## Gate results

See the "Final gate" section appended below.

## Final gate

Everything went through `/Volumes/E Drive/Dev/.scratch/heavy-gate.sh` (the lock was held by other lanes for hours at a time; two of my runs queued 2 to 3 hours each).

| Gate | Result |
| --- | --- |
| typecheck (`pnpm typecheck`) | pass |
| lint | pass, 0 errors; 2 warnings, both pre-existing (`scripts/lcp-probe.ts`, `tests/e2e/eval-037.spec.ts`) |
| tokens (`pnpm tokens:check`) | pass, 73/73 contrast pairs AA, light and dark |
| build | pass (`next build` + `assert-static`) |
| unit | first run 1599 pass, 1 fail: `what-i-bring.test.ts` still checked the retired layer files I had just deleted (fixed in the next commit to check every scene part in both themes; single file re-run 9/9 green; the full unit suite was not re-run after that fix) |
| `wib-scenes.spec.ts` (all 4 widths: hover and focus lift without playing, Enter / click plays to a settled end state per stage, tap, replay x3 plus a click storm, stage change mid-sequence, no infinite animation and transform / opacity / stroke-dashoffset only, reduced motion, overflow, flow labels, no added figure, night art served and the light set never requested, live theme swap) | after one reduced-motion fix (the CSS minifier turns a bare `translate: none` into a transform, so reduced motion now neutralises hover and parallax through custom properties): all pass at w390 / w768 / w1024 / w1440 (the last run: 560 passed, 127 skipped across wib-scenes, what-i-bring, eval-040, eval-042, eval-023, eval-008) |
| existing what-i-bring, eval-042 (tool chip hover labels), eval-040 (extended scope) | pass |
| full e2e suite (4420 tests, 1.8 h), run on the build BEFORE the reduced-motion fix | 2210 passed, 2201 skipped, 9 failed: the 4 reduced-motion `wib-scenes` cases (fixed, see above, re-verified green), EVAL-008 `/dev/artifacts` x4 (pre-existing, known), EVAL-023 system flip at w1440 (see below) |

Not re-run in full after the fix: the full e2e suite (the only change since is the reduced-motion CSS inside the TASK-203 block, the test files and the removal of the unreferenced art). EVAL-023 "a runtime system flip is followed with no saved choice" failed once in the full run (w1440) and once in the final targeted run (w390) and passed on the other widths; it exercises the home page and the theme store, which this ticket does not touch (the scenes only READ the theme). It is not in the known-failure list, so treat it as an intermittent, unreproduced-on-main item until someone runs it on main.

Screenshots: `docs/screenshots/m-013/task-203/` (light and dark; 1440 rest and settled per scene, journey overview, and 390 settled per scene plus the 390 journey).
