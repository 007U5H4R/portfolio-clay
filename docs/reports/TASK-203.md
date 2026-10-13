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
