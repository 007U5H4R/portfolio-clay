# TASK-117 — `/about` hero redesign (Tushar's spec 2026-09-28)

Branch `m009/task-117`. The base `m-009-redesign` @ `347bc1f` is merged in. The spec is `docs/redesign-mockups/m-009/tushar-2026-09-28/about-hero-spec.md`. Screenshots are in `docs/screenshots/m-009/task-117/`: the hero at 390, 768, 1024 and 1440; mid-scroll parallax frames at 390 and 1440; and 390 with reduced motion.

## Spec §34 summary

1. **Files changed**
   - `components/about/AboutHero.tsx`, now a thin shell that re-exports the data.
   - New files under `components/about/hero/`: `about-hero-data.ts`, `AboutNarrative.tsx`, `AboutMetrics.tsx`, `AboutCollage.tsx`, `IntersectionSketch.tsx`.
   - `app/globals.css`: the new `/* TASK-117 … */` block sits right after `/* end TKT-86 */`. The superseded TKT-86 `.ahero-*` rules were **deleted** from the TKT-86 block, which is the only edit outside the new block.
   - `public/media/illustrations/polaroid-sunrise.webp`, plus the manifest, README and Design.md.
   - Tests: `tests/unit/{about,eval-021,paper}.test.tsx`, `tests/e2e/about.spec.ts`.
2. **Component structure** follows spec §28 exactly: `AboutHero` → `AboutNarrative` (Eyebrow, Headline, Subline, Metrics, PersonalNote) + `AboutCollage` (PhilosophyNote, JourneyPolaroid, IntersectionSketch, plus the "same curiosity, still here." line). All are server components except the shared `ContactEntrance` wrapper.
3. **Typography**
   - Eyebrow: Inter 600 at 14 px, navy, with a rust dot.
   - h1: Fraunces `clamp(38px, 4vw, 60px)` with line-height 1.08. The third line is rust. The three lines are forced only at 640 px and wider; at 1024 px and wider each line stays on one line.
   - Subline: Caveat 22–30 px.
   - Stats values: Fraunces 42–60 px. Labels: Inter 14–17 px in navy-2.
   - Footnote: Inter 14–15 px.
   - Quote: Caveat 21–26 px. Checklist: Caveat 18–20 px. Venn labels: Caveat 17 px.
4. **Paper and collage**
   - Stats card: ivory card with a tape strip at the top left and −0.2° rotation.
   - Quote: yellow lined index card with a rust pin, rotated +2° on its wrapper.
   - Polaroid: photo frame at −1.5° with a tape strip, sitting partly behind the note.
   - Notebook page: torn and ruled, with a rust margin line, at +0.9°. It holds an inline-SVG hand-sketched Venn with wobbly circles and a rust-tinted triple overlap, and a checklist with CSS tick boxes.
   - Sage sprig: the existing `collage-leaf-1.webp`, taped to the notebook's corner.
   - Colours are tokens and `color-mix()` only; `tokens:check` passes.
5. **Metrics** are derived and not typed in. `10+` is calculated as 2026 minus the earliest `data/experience.ts` start year (2016). The footnote reads "counted from 2016 — the “+” is because the American Express role is still open", and it takes both the year and the open role from the same data. This matches spec §30 exactly.
6. **Responsive behaviour**
   - 900 px and wider: two columns, 56fr / 44fr. Between 900 and 1199 the notebook gets the larger share of the collage.
   - Below 900: one column in the spec §24 order. The personal note moves to the end with CSS `order`; it is `aria-hidden`, so the reading order does not change.
   - 640 to 899: the polaroid and notebook sit side by side.
   - Below 640: everything is stacked and the sprig is hidden.
   - Hero height: 834 px at 1440 (target 750–900), 668 px at 1024, 1218 px at 768, 1711 px at 390.
   - No horizontal overflow at any width.
7. **Motion**
   - Entrance plays once, using the shared arm-then-reveal `ContactEntrance` wrapper and CSS transitions only.
   - Order: eyebrow → h1 (14 px rise) → rust line → subline → stats (12 px) → note (rotation settle) → polaroid (12 px) → notebook (rotation settle) and personal note. Total is about 1.15 s.
   - With reduced motion, everything is shown immediately.
   - There is no continuous motion.
8. **Accessibility**
   - There is one h1 and no duplicate headings.
   - The polaroid has a real alt and is lazy-loaded, so it is never the LCP.
   - The Venn is a `role="img"` with a `<title>`.
   - The Caveat checklist is `aria-hidden` and has an sr-only twin list.
   - The quote has an sr-only "Source:".
   - The decorations are `aria-hidden`, and the sprig has `alt=""`.
   - The ☕ uses a named emoji font stack, so no system font-fallback search is needed.
9. **Compromises**
   - Between 640 and 899 px the layout is one column rather than two narrow ones.
   - The polaroid caption is a content `figcaption` (in Caveat), not a counted annotation.
   - The notebook is +0.9° because of the sheet cap; the spec asks for +1°.
   - All of these are recorded in Dev-105 and Dev-106.

## Draft labels

Both hero `DraftTag`s are removed (the h1 one and the quote one). This follows Tushar's direction for this section only, and it supersedes D7 / S18 here. Other pages keep their tags; the e2e test asserts that `#journey` still has its tag. **The orchestrator still needs to record this in `decisions.md`.**

## Design.md

- §3.3: the `/about` hero decoration count goes from 2 to **4** at 390 and 1440. The four are the subline annotation, the personal-note annotation, the "same curiosity" annotation and the sprig `collage`. `eval-018-parked.json` stays `[]`.
- §6.3: new row for `polaroid-sunrise`.
- §7.4: the Hero bullet is rewritten, and the TKT-86 text is kept struck.
- §11 Dev-105 (layout, removed draft tags, the 640–899 single column), Dev-106 (decoration accounting, Venn/caption/checklist, rotations past the caps) and Dev-107 (new asset, spec §22 entrance). These are provisional numbers, allocated after the base's Dev-104. **Renumber them at merge if another branch has taken 105–107.**

## Asset record

| Field | Value |
|---|---|
| id | `polaroid-sunrise` |
| kind | `scene`, public-only |
| file | 560×700 WebP (q76, effort 6, no metadata), 61,298 bytes |
| sha256 | `227b44f9…062c` |
| master | `/Volumes/E Drive/Dev/.scratch/m009/task-117/polaroid-sunrise.png` (1792×2240) |
| generation | Higgsfield `gpt_image_2_5`, job `0d16b793-6b6f-47dc-a460-03e3eef3eb87`, style reference `c0e1ecc2-…`, 2.75 credits spent by the orchestrator |
| alt | "Illustration of a watercolour sunrise over snow-capped mountains, misty pine valleys and a hillside path." |

The alt starts with "Illustration of" because EVAL-021 requires that prefix. No credits were spent by this task.

## Gate (on the merge commit, base included)

| Check | Result |
|---|---|
| typecheck | 0 |
| lint | 0 |
| tokens:check | 0 (13/13) |
| unit tests | 0 |
| build | 0 (15 routes, all static) |
| bundle `/about` | 153.7 kB gz of 180 |
| `pnpm eval --only EVAL-021,EVAL-013 --skip-build` | 2 pass, 0 fail |

**e2e:** the first run had 4 failures, all caused by over-strict new assertions in my own tests:
- The "Same curiosity" locator also matched "same curiosity, still here."
- The global reduced-motion guard leaves a 1 ms transition.

Both assertions are fixed. **Re-run:** 670 passed, 0 failed across all 4 projects (the 670 skipped are the width-gated skips the specs declare). Specs: `about`, `about-part2`, `parallax-stacking`, `torn-parallax`, `scene-opener` and `eval-006/007/008/010/018`.

Also verified:
- Mid-scroll screenshots at 390 and 1440 show the journey sheet sliding over the lagging hero with no text drawn over text.
- The new e2e test "no overlapping text in the hero" passes at all four widths.
