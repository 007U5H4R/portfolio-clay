# TASK-216 — What I Bring: continuous paper-cut journey

Brief: `/Volumes/E Drive/Dev/.scratch/experience-journey/brief.md`. Branch `m013/experience-journey`.

## What changed
- `components/experience/WhatIBringJourney.tsx` rewritten. One `selected` state drives the landscape markers, the bottom track and prev/next (wraps 07 to 01). The track is the tablist (roving tabindex, Arrow/Home/End select and focus), each stage panel is a `tabpanel`, markers are pointer/touch buttons (`aria-pressed`, `tabIndex=-1`), one polite `role=status` region announces the stage. No route change.
- `app/globals.css`: the TASK-187 and TASK-203 `.wib-*` blocks (about 800 lines) replaced by one `TASK-216` block. `.wib-chip`, `.wib-chip-note`, `.wib-caps`, `.wib-flow`, `.wib-evidence`, `.wib-proof` keep their names and behaviour (TASK-201 chip hover, focus and tap label preserved).
- `data/what-i-bring.ts`: each stage gains `art: { src, alt }`; `wibHint` reworded (the old text said "hover").
- Removed (nothing else referenced them): `components/experience/WibScene.tsx`, `lib/wib/*`, `public/media/what-i-bring/*`, `tests/e2e/wib-scenes.spec.ts`, `tests/unit/wib-scene-machine.test.ts`.
- Layout: at 960 px and up, landscape about 68% / panel about 32%, track under the landscape (stacked number+name below 1240, row above). Below 960: heading, cropped landscape (map is 2.4x frame width, 1.6x at 600-959, panned with one CSS transform transition to keep the selected landmark centred), horizontally scrolling track, panel, prev/next in the panel header. Reduced motion removes every transition and the panel fade. The landscape never animates and there is no parallax.
- Dark: two landscape images, swapped by CSS on `[data-theme=dark]` (display none, lazy, so only the visible theme's image is fetched). The panel and track use the theme tokens. The stage illustrations are cream-ground renders shown in a rounded frame in both themes.

## Assets (`public/media/experience/`)
`journey-landscape-light.webp`, `journey-landscape-dark.webp` (2048x1360, 3:2, ~205 KB / ~154 KB; replaced the first 21:9 strip in the follow-up below), `stage-{ambiguity,discovery,product,ai-genai,technology,execution,impact}.webp` (880x663, 27-73 KB). Sources (PNG) in `/Volumes/E Drive/Dev/.scratch/experience-journey/art/`.

## Generated artwork
Higgsfield `gpt_image_2_5`, brief prompts used essentially verbatim (a "no letters or text" clause added). Landscape 21:9; stages 4:3. All first-pass accepted, no regenerations. Four batch submissions hit a 429 and were resubmitted (no charge for failed ones).
- Landscape light (follow-up, 3:2, `resolution: 2k`, native 2048x1360): the brief's optional landscape prompt reworded for a taller composition with depth. The first 21:9 strip and a 1024x688 3:2 draft were discarded. Higgsfield `upscale_image` failed five times (bytedance backend, no charge), so the 2k render uses the model's own `resolution` parameter.
- Landscape dark: image-edit (2k, reference = the light 2k job) of the light landscape (uploaded as reference) "night version, keep every object and framing identical"; framing matched exactly, so the same marker percentages serve both themes.
- 7 stage images from the brief's stage prompts 01-07.
Credits: 367.4 to 363.65 = about 3.75 in total (2.25 first pass, 1.5 follow-up incl. two discarded 1024 drafts; budget 45). No background removals (illustrations are framed, not cut out).
Known art notes: the Ambiguity note sheet carries a tiny pie-chart glyph (no letters); Discovery is a full scene rather than an object on a cream ground; Product/AI have wide cream margins that the panel crops.

## Content: brief vs site
Site wording kept throughout. Not applied: the brief's page intro (eyebrow, "A journey from curiosity to real-world impact.", supporting copy) because the site's `What I Bring` h2 and statement are asserted by tests and the page already has an H1/Experience header. Brief headlines (e.g. "I ask the right questions.") match the site's `heading`. Brief "core" lines differ from the site's `principle` lines; the site's are shown as the explanatory paragraph. The brief's three points per stage are replaced by the site's 5-7 capabilities, plus tools, flow (AI, Execution), examples (AI) and the two self-reported proof figures (Impact). No metric or claim added; the stage names in the track are the site's titles.

## Tests
- Unit (changed files): `what-i-bring.test.ts` 9, `experience-page.test.tsx` 9: 18 pass. Asset check rewritten for the new files.
- New e2e `tests/e2e/what-i-bring.spec.ts`: 9 tests x 4 viewports: marker/tab/prev-next sync and wrap, aria-live text, roving-tabindex keyboard (arrows/Home/End), 44 px targets for tabs/markers/steps, no horizontal overflow at 390/768/1024/1440, every stage's content visible, mobile track scroll, reduced motion, dark landscape. Run with the TASK-201 chip specs in `eval-042.spec.ts` (selectors updated to open the stage from the track): 37 passed, 11 viewport-skipped, 0 failed. Also ran `a11y-90d`, `overflow-375-768`, `parallax-stacking`: 42 passed, 0 failed.
- typecheck clean; lint 0 errors (2 existing warnings in `scripts/lcp-probe.ts` and `eval-037.spec.ts`); production build OK. Evals and full suite skipped as instructed.
- Screenshots at 1440/1024/768/390/320, light and dark, plus stages 01/04/06/07 at 1440 light: `/Volumes/E Drive/Dev/.scratch/experience-journey/shots/`. No console errors or page overflow at any size.

## Follow-up: taller landscape and column alignment
- Landscape is now 3:2 (2048x1360, covers 2x at 1440). Markers re-placed on the new art (`ANCHOR` in `WhatIBringJourney.tsx`, fractions of a 2000x1328 grid; dark is the same framing so one set serves both). Mobile map is 1.8x the frame (1.25x at 600-959) and panned per stage; checked per stage at 390/320 light and dark.
- Layout: 1280 and up is side by side; the card stretches to the left column and the stage art grows into the free height (min 110 px), so both columns end together (1440: every stage within 20 px, asserted <= 60 px in `what-i-bring.spec.ts`). The hint moved under the track. 960-1279 (incl. 1024) stacks the panel under the full-width landscape (art as a 4:1 banner) because a ~280 px panel beside a ~600 px landscape is always much taller than the landscape there; 1024 therefore does not have side-by-side columns.
- Stale-cache note: `next start` served the old landscape from `.next/cache/images` until that directory was cleared; same file names were reused for the new art.
- Tests: what-i-bring.spec (10 x 4 viewports) + eval-042 chip spec + overflow-375-768 + a11y-90d: 53 passed, 23 viewport-skipped, 0 failed. Unit 18 passed. typecheck clean, lint 0 errors, build OK.
- Screenshots: `/Volumes/E Drive/Dev/.scratch/experience-journey/shots2/`.

## Remaining issues
- On the AI stage the art is cropped to a 110 px strip at 1440 (the card is long).
- Marker labels cover small parts of some landmarks at 1024; below 1240 only the active label shows.
- eval-042 chip hover tests skipped at w1024 in my run (they run at 1440).
- Campfire: `backlog task` could not find TASK-216 in this worktree (the board is uncommitted in another worktree), so the ticket status was not moved here.
- Process slips: I ran a bare `pkill -f "3391"` and a bare `pkill -f "next-server"` once each; the first may have killed Chrome helper processes of the threejs-devtools profile, the second any other lane's next-server. Nothing was listed afterwards.
