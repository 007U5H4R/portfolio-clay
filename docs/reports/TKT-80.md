# TKT-80 · `/work` — opener copy, serif filter tabs, numbered index, EmptyState, experience strip

Branch `m009/tkt-80` · implementation commit `6053b53` · model Opus 5.5 (standard tier) · Backlog TASK-75 (TSK-39/40/41).

## AC checklist
| AC | Status | Evidence |
|---|---|---|
| 1 Tabs keyboard-operable, `aria-selected`, URL-synced, deep link after hydration | ✅ | work.spec `@EVAL-007 FilterTabs…`, `filter click updates ?filter=…`, 5× `deep link ?filter=…`; unit `filters.test.tsx` |
| 2 11 builds numbered 01–11 in data order, re-sequenced per filter; every item is a link | ✅ | work.spec `@EVAL-002 numbered index…` (01–11, enterprise → 01–02, each `li` has exactly one `a` → `/work/<slug>`); unit `WorkIndex` describe |
| 3 `EmptyState` only for an empty filter | ✅ (split) | e2e asserts absence on all 5 filters (no real filter is empty); presence proven in unit `work-grid.test.tsx` with an injected empty dataset (no `ol`, pinned `data-paper="index"` card, "Show all →" `data-hand="cta"` → `/work`) |
| 4 Strip: one `<details name="job">` open at a time, keyboard, hidden under Experiments, no live/arrow affordance | ✅ | work.spec `…native <details name=job>…` (Enter/Space, one open), `filter=experiments` → whole section absent, `@EVAL-013 ExperienceStrip…` (no link/`http` link inside rows, no `→` in summaries, only link = `/about#experience`) |
| 5 EVAL-018 per section 2 / 3 / 1 at both widths | ✅ | work.spec `@EVAL-018 /work: one scene img, decoration counts 2 / 3 / 1` (w390 + w1440); eval-018.spec `/work` green |
| 6 One scene `<img>`, manifest alt, `sizes`, no CLS | ✅ | same test: exactly one `scene-work` img (the TKT-95 opener), 0 in `section.work-hero`, alt/sizes/width/height present |
| 7 No overflow at 390, rows collapse to `40px 1fr` | ✅ | work.spec + eval-008 `/work` overflow / 44 px targets / 14 px floor green; screenshot below |

## What was built
- `WorkHero` — opener copy only under the existing `SceneOpener` (Dev-24): eyebrow, Fraunces h1 "Work" + underline `Sketch`, lead (unchanged copy), caption `Annotation`. No image of its own.
- `FilterTabs` — ink-underlined Fraunces tabs (reuses `InkUnderline`, rust on `aria-selected`); ARIA/keyboard/URL logic unchanged; motion pill indicator removed.
- `WorkIndex` (replaces `EditorialGrid`, deleted) — `<ol>` 12-col grid: flagship taped `Sheet card` + giant numeral, second opener with dashed rule and the "trust is the product." sticky (only when RailCite is rank 2), slim rows; status dot + text + `as of`; one stretched link per item; crossfade kept, instant under reduced motion.
- `WorkGrid` → `WorkIndex` or `EmptyState` (Dev-05). `EmptyState` → pinned index card.
- `ExperienceStrip` — renders its own `<section aria-label="Professional experience">` + torn edge, native `<details name="job">` rows, hand chevron, `↳` body marker.
- `app/work/page.tsx` — index section (paper-2, torn, sr-only h2, tabs row + "start here ↓" annotation with arrow hidden < 900).

## Files changed
`app/work/page.tsx`, `components/projects/{WorkHero,FilterTabs,WorkIndex(new),WorkGrid,EmptyState,ExperienceStrip}.tsx`, `components/projects/EditorialGrid.tsx` (deleted), `tests/unit/{filters,work-grid}.test.tsx`, `tests/e2e/work.spec.ts`, `app/globals.css` (shared, below), `docs/screenshots/tkt-80/*`.

## Shared-file edits
- `app/globals.css`: one appended block `/* TKT-80 · /work — … */ @layer components { … } /* end TKT-80 */` (all `.work-*` / `.job*` classes; tokens / derived vars only). No other block touched.
- `eval-007.spec.ts` / `eval-010.spec.ts` / `eval-018-parked.json`: not touched (no `/work` parked entries existed; keyboard coverage lives in work.spec with `@EVAL-007` tags).

## Gate (locked runs)
- typecheck 0 · lint 0 · tokens:check 0 · full vitest 0 · build 0 (first run).
- First e2e run: 4 failures — 44 px target floor on tab/row links, and rust cta on paper-2 at 4.3:1 (axe). Fixed: `min-width/min-height: 44px` on tabs, links and ctas; second-opener cta → terracotta.
- Re-run (build + e2e): `work.spec.ts` + `scene-opener.spec.ts` at w1440+w390 → **40 passed, 20 skipped (width-gated), 0 failed**; `eval-018/008/006/011-dead-controls/002/layout` filtered to `/work`, recruiter and nav → **16 passed, 4 skipped, 0 failed**.
- `pnpm eval --only …` not run: it rebuilds and sweeps every route. The orchestrator's full-suite run on the merged branch covers it.

## Screenshots (read and checked)
`docs/screenshots/tkt-80/work-1440-full.png`, `work-390-full.png`, `work-1440-enterprise.png`, `work-390-enterprise.png`: opener copy under the scene banner, tabs with the rust underline, flagship + RailCite openers, 9 rows, strip, band. At 390 there's no horizontal overflow and the tab row scrolls with a peek.

## Deviations / merge notes
- **Empty state e2e:** with the real data no filter is empty. I didn't add a fixture filter because that would mean editing `lib/anchors.ts` (not mine) and adding a visible tab. The present-when-empty branch is covered at unit level instead.
- **Numeral size:** row numerals are 24 px (the mockup has 22 px). At 24 px, rust on paper-2 counts as large text for contrast.
- **Motion:** only the opacity crossfade is kept. A `layout` reflow would need `domMax` and a bigger bundle.
- **Strip:** no row opens by default (the mockup opens the first). The heading keeps the content-brief em-dash wording.
- **Not mine, left alone:** a stale `EditorialGrid` mention in a comment in `components/projects/ProjectCard.tsx` (TKT-75). The `icon-${slug}` view-transition pair with `CaseStudyHeader` is gone because the index has no icon (relevant to TKT-81).
