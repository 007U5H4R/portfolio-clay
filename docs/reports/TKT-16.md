# TKT-16 report — `/work` page: WorkHero · FilterTabs · EditorialGrid · EmptyState (M-004)

**Ticket:** TKT-16 · `/work` page (WorkHero + URL-synced FilterTabs + editorial grid + ProjectCard grid mode + empty state) · **Branch:** `m-004-work`
**Scope:** the full `/work` page for the **personal builds** only. Professional-experience entries render in the `ExperienceStrip` (TKT-17, not touched here); the `DemoVideo` card slot is TKT-18 (grid mode renders featured anatomy today).
**Decisions honoured:** TP1 (`/work` stays statically prerendered — `assert-static` green), E-4/TP7 (client-side filtering via `useSearchParams` in `<Suspense>`; one-frame flash on deep links accepted), E-2 (`?filter=` is the only query key; `lib/filters.ts` is the single parser; `all` → bare `/work`, never `?filter=all`), AC2 default-Experiments buckets (already in the TKT-15 data).

## Result summary
- `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 errors, 0 warnings) · `pnpm test` ✅ (178 passed, 1 skipped) · `pnpm build` ✅ (**`all routes static (6)`** — `/work` is `○ Static`).
- `pnpm test:e2e --grep work` ✅ — **43 passed, 49 skipped** (viewport-gated) across w390/768/1024/1440.
- `pnpm eval --only EVAL-002,EVAL-004,EVAL-007,EVAL-008,EVAL-010,EVAL-011` → **exit 0, no regression** (`evals/results/eval-run-0.2.0-4911043.json`): 5 pass · 1 fail · 11 skip. The one FAIL is **EVAL-004 (`informational:true`, swiftshader software-render caveat)** on `/contact` + `/work/teachspark` mobile LCP — pre-existing pages, not `/work`; the runner does not gate on it (exit 0). `/work` itself scored mobile **[93,98,100,100]** / desktop **[100,98,96,100]** (≥ the 90/95/95/95 gate). **EVAL-008 improved FAIL → PASS.** Real perf gate is production/TKT-49 per EV2/A14/F5.

## Acceptance criteria
| AC | Verified |
|---|---|
| 1 — editorial spans, personal-only | `work.spec.ts` measures hero card[0] ≈8/12 at 1440 (`0.6 < ratio < 0.72`, hero > medium×1.6) and full-width at 768; grid holds only the 11 personal builds. Never nine identical rectangles (positional hero, not `gridSize`-tied). |
| 2 — `?filter=` sync, back/forward, deep link, tab a11y, arrow keys | `router.push` per activation → each filter is a history entry; goBack/goForward restore the grid; deep link `/work?filter=ai` filters after hydration; `role=tablist/tab` + `aria-selected` + roving `tabindex` + Arrow/Home/End with automatic activation. |
| 3 — SITEMAP/data filter sets | Per-filter deep-link tests assert exact data-derived slug sets (ai:3, enterprise:2, cloud:1, experiments:7, all:11) — see Deviation 2. |
| 4 — <768 peeking scroll, no page overflow | `tablist` `overflow-x-auto` + `pr-6` peek; test asserts the row itself scrolls while `documentElement` does not. |
| 5 — EmptyState on no-match + "Show all" | `EmptyState` (honest copy + live `/work` link). Empty branch injected via `work-grid.test.tsx` (mock `useSearchParams`, empty dataset) since real data never narrows to 0. |
| 6 — hover/press/focus + ViewTransition | grid cards reuse `ProjectCard` (VT `project-{slug}`); reduced-motion test confirms no lift. |
| 7 — axe clean 390/1440, Lighthouse `/work`, eval no regression | `@EVAL-006` axe clean both widths; Lighthouse `/work` ≥ gate; eval exit 0. |

## Architecture (static-safe filtering, TP7)
`app/work/page.tsx` (server) → `WorkHero` + two `<Suspense>` boundaries: `FilterTabs` (fallback `FilterTabsFallback`) and `WorkGrid` (fallback = unfiltered `EditorialGrid`). Both interactive components read the filter via `useSearchParams`, which client-renders the boundary; the **fallbacks prerender the full default state into the static HTML**, so every card is present for SEO + the dead-control crawler, `assert-static` stays green, and a deep link only flashes the full grid for one frame before the client narrows it.

## Deviations (documented)
1. **FilterTabs are `role="tab"` LINKS, not `ClayPill` buttons.** Three reasons: (a) progressive enhancement — without JS a tab navigates to `/work?filter=<f>` and the client filters on load; (b) the EVAL-011 dead-control crawler GET-checks a link (200) instead of click-testing it — a *default-active* tab rendered as a button produces no observable click effect and would be a false DEAD; (c) correct `aria-selected` tab semantics vs `ClayPill`'s hardcoded `aria-pressed`. `role="tab"` is valid on `a[href]` per ARIA-in-HTML (axe clean). Pill visual tokens (`--radius-pill`, `text-caption`, lavender active fill) are reused, so it reads identically. The sliding indicator follows the working `NavPill` `layoutId` pattern under `domAnimation`.
2. **Filter sets are data-derived (personal-only), diverging from `SITEMAP.md` §"Filter → project mapping".** SITEMAP lists professional entries (mars/cloud-modernization/godrej) under AI/Enterprise/Cloud, but those are not cards on `/work` (they're the TKT-17 strip). Per the brief ("filter set derived from the data's `filters` field"), the grid filters by `data/projects.ts` `filters`, personal-only. Note: SITEMAP also parks `nuptis` under Experiments and omits `velora` from Experiments, whereas the merged TKT-15 data has `nuptis:[enterprise]` and `velora:[enterprise,experiments]`; the data (implementation truth) wins.
3. **EditorialGrid uses opacity-only `AnimatePresence` (no `layout`).** `layout`/`popLayout` need `domMax`; the shared `LazyMotionRoot` loads `domAnimation` (A6 budget). Cards crossfade (fade-out 150 / fade-in 200) and reflow instantly via CSS grid — matching Design.md §4's "Filter change" opacity spec. `initial={false}` keeps first paint at full opacity (present in static HTML). Reduced motion → instant.
4. **`router.push` (not `replace`) on activation** so back/forward restores prior filters (AC2). Arrow-key automatic activation therefore adds history entries — acceptable (each filter is a real state).

## Files
`lib/filters.ts` · `components/projects/{WorkHero,FilterTabs,EditorialGrid,WorkGrid,EmptyState}.tsx` · `components/projects/ProjectCard.tsx` (grid mode enabled) · `app/work/page.tsx` · `tests/e2e/work.spec.ts` · `tests/unit/{filters.test.tsx,work-grid.test.tsx}` · `tests/unit/ProjectCard.test.tsx` (grid-mode expectation updated). `app/work/opengraph-image.tsx` unchanged (already present).
