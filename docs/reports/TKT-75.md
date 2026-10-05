# TKT-75 · Featured Work (TASK-70) — implementer report

Branch `m009/tkt-75` · Opus 5.5 (standard tier) · 2026-09-25

## AC checklist (TC-147)
| AC | Status | Evidence |
|---|---|---|
| 1 copy/metrics/status/tags byte-equal to `data/projects.ts` | ✅ | `tests/unit/ProjectCard.test.tsx`: kicker tags = `tags.join(" · ")`, status = `statusLabel`, h3 = `name`, tagline, and each metric's value/label/kind/`asOf`, all compared with the record (`toContainEqual` against `project.metrics`); the RailCite quote is read from artifact `rc-a-trust` |
| 2 3 cards, whole-card links to `/work/<slug>` | ✅ | exactly one `a` per card, `aria-label` = name, VT name `project-{slug}` (unit + `featured.spec.ts` @EVAL-002/011/015; `eval-015`, `eval-010`, `tracer` specs green) |
| 3 ≤ 1024 two columns (large spans), ≤ 640 one column, no overflow at 390 | ✅ | `featured.spec.ts` "featured grid…" at w390/w768/w1024/w1440 + `noOverflow` |
| 4 EVAL-018: section = 4, fasteners ≤ 2/card | ✅ | decor = torn · annotation · sketch · sticky (unit + e2e at every width); `eval-018.spec.ts` green at 390/1440 |
| 5 reduced motion: hover shadow only | ✅ | `featured.spec.ts` @EVAL-010: hover changes `transform` + `box-shadow`; under reduced motion `transform` stays the same and `box-shadow` still changes |
| 6 specs updated, `eval-015` green | ✅ | see gates |

## Files changed
- `components/projects/ProjectCard.tsx`: rewritten as a paper card (`Sheet card` + `Tape` + one `ViewTransitionLink` + `Hand cta` + optional `aside`). The unused clay `grid` mode and the `ClayIcon` / `icon-{slug}` VT name are gone (the card has no icon in Design §7.1).
- `components/projects/FeaturedWork.tsx`: `section#work-featured`, `TornEdge paper-2`, head (eyebrow, h2 "Real problems.<br>Real products.", lead, RailCite quote `Annotation arrow="dashed"`), `1.35fr 1fr` grid, TeachSpark flow `Sketch` + `Sticky`.
- `tests/unit/ProjectCard.test.tsx`, `tests/e2e/featured.spec.ts`: rewritten for the paper anatomy.
- `docs/screenshots/m-009/home/featured-{390,1440}.png`

## Shared-file edits
- `app/globals.css`: one appended block `/* TKT-75 · featured work … */ … /* end TKT-75 */` (layer components). Classes: `.featured*`, `.work-grid`, `.work-card*`, `.work-kicker*`, `.work-metric*`. Tokens only.

## Deviation: needs orchestrator review
Plan S75.01 says to filter metrics to `kind === "measured"`. Against today's data that contradicts Design §7.1 on every card: it drops TeachSpark's 37.5 min (self-reported) and RailCite's "0 invented citations" (structural), and it keeps Velora's "10/10 unit tests", which Dev-01 drops. Design is the record, so I followed it. `FeaturedWork.FEATURED_METRICS` picks rows **by label** from the data (it throws at build time if a label is missing): TeachSpark 17 · 8 (47%) · 37.5 min; RailCite 5,760 · 0; Velora "2 products in nine days". For honesty, each non-measured row shows its kind ("· self-reported" / "· structural"), and a caption line gives `as of …`.

## Gates (locked run 1, then featured re-runs)
- typecheck ✅ · lint ✅ · tokens 13/13 ✅ · unit 50 files / 474 passed (2 skipped) ✅ · build ✅ (13 routes static)
- e2e run 1 (featured, home, eval-018, eval-015, eval-010, tracer, eval-002, eval-006 × w390/768/1024/1440): 228 passed, 1 failed. The failure was my own hover-test locator (`filter({has})` with a page-rooted locator); fixed.
- Re-run after the CSS fix (sticky overlapped the TeachSpark cta at ≤ 1024): featured + eval-018 × 4 widths: 64 passed, 0 failed.
- `pnpm eval --only …` not run separately (the EVAL-018/015/011/002 specs it wraps ran directly).

## Screenshots
`docs/screenshots/m-009/home/featured-{390,1440}.png` (both reviewed). The site's sticky header appears over the top of each element screenshot; that's an artefact of the capture, not a layout bug.

## Merge notes
- `app/page.tsx` still has a stale "(TKT-12) three-card editorial row" comment above `<FeaturedWork />`. I didn't touch it because the file isn't in my ownership list.
- `CaseStudyHeader` (TKT-81) still carries `icon-{slug}`. The card no longer does, so only the `project-{slug}` morph remains.
