# TKT-19 report — Case-study page template + chapters + nav (M-004, last ticket)

**Ticket:** TKT-19 · full `/work/[slug]` case-study template · **Branch:** `m-004-work`
**Model tier:** most-capable (full assembly + anchors + VT + graceful thin content).
**Contracts honoured:** E-3 (chapter ids are schema values; `NN-slug` anchors from `lib/anchors.ts` `CHAPTER_ANCHORS`), A5/EXE-5 (VT via CSS `view-transition-name`, plain-nav fallback), TP1 (all case routes static), EVAL-013 (render only sourced data — empty → labelled placeholder, no fabrication), Design.md §3 (60/40 header, OverviewToggle, Chapter, ChapterNav Deviation §4, NextProject).

## Result summary
- `pnpm typecheck` ✅ · `pnpm lint` ✅ (0/0) · `pnpm test` ✅ (188 passed, 1 skipped) · `pnpm build` ✅ → **all routes static (9)**; the 11 `/work/<slug>` pages prerender as SSG.
- `pnpm test:e2e --grep 'case-study'` ✅ — **47 passed, 49 skipped, 0 failed** (skips are viewport gates at 768/1024).
- `pnpm eval --only EVAL-002,EVAL-004,EVAL-006,EVAL-007,EVAL-008,EVAL-010,EVAL-015,EVAL-017` → **exit 0 (clean gate, no regression)** · `evals/results/eval-run-0.2.0-a2df2a2.json` (left unstaged).
  - EVAL-002 (hop 3) PASS · EVAL-006 PASS · EVAL-007 PASS · EVAL-008 PASS (**improved FAIL→PASS**) · EVAL-010 PASS · EVAL-015 PASS · EVAL-017 PASS.
  - EVAL-004 FAIL is `[informational]` only (Lighthouse under swiftshader/software-rendering — the documented non-gating local caveat, EV2/A14/F5); it does not gate and the runner exits 0. The `/ mobile 96→89` note is likewise informational.

## What changed
- **`app/work/[slug]/page.tsx`** — replaced the stub with the full template: `ProgressBar` → `CaseStudyHeader` → overview region → `NextProject`. `generateStaticParams` (11 personal slugs) + `dynamicParams=false` unchanged (TP1). Computes the rendered-chapter set (chapters with body **or** artifacts), the `showToggle` gate (`overview.deepDive && hasChapters`), and the wrap-around next project (`/work` grid order). Thin path renders the 30-sec overview + a labelled "Deep dive coming — documented as {statusLabel}" note; deep path renders the `OverviewToggle`.
- **`components/case-study/CaseStudyHeader.tsx`** — extended to take the whole `project` + resolved `icon`. Adds 2–3 inline `MetricCard`s (resolved against `project.sources`, EVAL-013 backstop throws on a missing id) and hero media = `hero.image` / `DemoVideo` (TKT-18) / labelled "Hero media coming" placeholder — never a broken `<img>` (A13). VT names (`project-{slug}`, `icon-{slug}`) preserved.
- **`components/case-study/artifacts/MetricCard.tsx`** — added a `variant: "card" | "inline"` prop (default `card`, unchanged for existing consumers). `inline` drops the clay shell for the header row but keeps all five sourced fields + the mandatory `SourceCaption`.
- **`components/case-study/Chapter.tsx`** (new) — one non-empty chapter: numbered `h3` + `Prose` (≤600px) + artifacts 1/2/3-up inside the column. `<section id={anchor}>` carries the E-3 anchor with `scroll-mt` for the sticky header.
- **`components/case-study/ChapterNav.tsx`** (new, client) — sticky vertical rail ≥1024 (active = bold + accent underline) / sticky horizontal pill row <1024 (Deviation §4), one shared `IntersectionObserver` for the active chapter; renders **only the chapters that exist** so no anchor link is ever dead (EVAL-011).
- **`components/case-study/OverviewToggle.tsx`** (new, client) — WAI-ARIA `radiogroup` (roving tabindex, arrow keys, 30-sec default), 200ms `.overview-panel` crossfade collapsed to instant under reduced motion; only the active view is mounted so height tracks content.
- **`components/case-study/NextProject.tsx`** (new) — flat full-bleed "Next: {name} →" band linking the next personal project in `/work` order (cycles), carrying its `project-{slug}` VT name; icon thumbnail slides in on hover (desktop only, `aria-hidden`).
- **`app/globals.css`** — `@keyframes overview-fade` + `.overview-panel` (the OverviewToggle crossfade; reduced-motion handled by the existing global rule).
- **`docs/anchors.md`** — finalized: documents that `Chapter.tsx` emits the anchor ids and `ChapterNav.tsx` links them, empty chapters omitted.
- **`tests/e2e/case-study.spec.ts`** (new) — all 11 slugs: header/thin-note/NextProject + noOverflow + minTargets + axe (390 & 1440); VT-off card→study identical end state; JS-off static content.

## Graceful thin content (the live state today)
Every project ships with `chapters:[]`-equivalent empty bodies, `metrics:[]`, `thinking:[]`. The page therefore renders: header (placeholder hero media, no metrics) + 30-second overview + "Deep dive coming — this project is documented as {statusLabel}" note + NextProject. No `ChapterNav`, no `OverviewToggle` (deepDive:false), no `ShowTheThinking` (empty chain → returns null), no empty/broken sections. When M-005 fills chapters, the same template lights up the toggle, nav, chapters, artifacts and thinking chain with no further template work.

## Gates (AC map)
| AC | Gate | Status |
|---|---|---|
| 1 | 11 slugs build static; thin slugs render header + 30-sec + note + NextProject; axe | ✅ build SSG ×11; e2e render + axe pass ×11 |
| 2 | Header metrics: five fields + kind badge + "as of {date}" | ✅ `MetricCard variant="inline"` (empty today; guard + source resolution in place) |
| 3 | VT card→header media; icon transitions; plain-nav fallback | ✅ VT names on `ClayFrame`/icon; `@EVAL-015` VT-off lands identical |
| 4 | `OverviewToggle` keyboard `role=radiogroup`, crossfade, reduced-motion instant, 30-sec default | ✅ built to spec (not rendered today — deepDive:false everywhere) |
| 5 | `ChapterNav` IO active; anchors `#01…#08` match How-I-Think/Ask ids; prose ≤600px | ✅ anchors from `CHAPTER_ANCHORS`; nav lists only existing chapters |
| 6 | `NextProject` cycles `/work` order; hover thumbnail | ✅ wrap-around; `@EVAL-015` next-link asserted |
| 7 | Lighthouse `/work/teachspark` ≥90/95/95/95 | ⚠️ informational locally (EVAL-004 swiftshader caveat); real perf gate is production/TKT-49 |

## Deviations / notes
- **ChapterNav renders both rail + pill variants**, hidden per breakpoint and sharing one IO — cleaner than two IOs; only the visible variant is ever counted/crawled.
- **Chapter bodies render as plain paragraphs.** The schema notes bodies may carry inline markdown links; a link renderer is deferred to M-005 (which first supplies real bodies) — no body ships today, so nothing mis-renders.
- **EVAL-004** left as the documented informational Lighthouse caveat; not weakened, not gated.
- Re-rendered `docs/screenshots/**` and `evals/results/*.json` left **unstaged** per the brief.
