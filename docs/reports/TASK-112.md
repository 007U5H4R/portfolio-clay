# TASK-112 — Top-nav tabs at every width (no hamburger)

Branch `m009/task-112` (from `m-009-redesign` @ `93c5da2`). Tushar, 2026-09-27: "I dont want hamburger menu, I want tabs should be there in top nav bar."

## What changed
- **`MobileMenu` deleted** (component, trigger, `.header-menu-btn` / `.menu-sheet` / `.sheet-*` CSS). `AskAIButton`'s `row` variant (only the sheet used it) removed.
- **`PrimaryNav`** now renders at every width inside a `.header-tabs` wrapper (`display: contents` ≥ 1440, so the desktop row is structurally the same). Client logic: on load / route change the active tab is scrolled into view by setting the strip's own `scrollLeft` (never `scrollIntoView`, so the page never scrolls vertically); a focused tab is revealed the same way (smooth, instant under reduced motion); `data-more` toggles the right-edge fade while tabs lie beyond.
- **Header layout (`app/globals.css`, TASK-112 block, unlayered, last):**
  - **≥ 1440:** the same single TKT-71 row as before (73 px). The existing 1440–1599 fit rules are kept.
  - **< 1440:** two rows. Row 1 = brand · pill + Ask. Row 2 = the seven Fraunces-18 tabs as a full-width strip: `overflow-x: auto`, hidden scrollbar, `scroll-snap-type: x proximity`, `scroll-padding-inline: 6px 40px`, a 32 px `--color-paper` fade on the right, 6 px strip padding so the 2 px rust focus ring is not clipped, and 20 px gaps. At 1024–1439 the strip fits and is centred.
  - The old 1024–1439 "Menu below 1440" (Dev-94) rule is replaced. The TKT-101 / Dev-46 nav spacing rules for 1024–1439 are now overridden (left in place, inert).
- **Pill at every width.** Below 640 it is compact ("Connect →", Caveat 18). "Let's" stays in the accessible name (`max-sm:sr-only`), so the name never changes.
- **`--header-h` is 108 px below 1440** (used by the reading-progress bar). The `.xp-role` scroll-margin is now `--header-h + 24px` below 1440: the `/work#experience-*` deep links had 96 px of clearance, which is less than the new header.
- **Résumé:** the menu's résumé row is dropped. I confirmed that `BandFooter` (rendered on every route by `app/layout.tsx`) carries the `resumeAction()` circle; `tracer.spec` asserts it on `/`.
- Stale MobileMenu mentions were removed from comments (`lib/nav.ts`, `app/layout.tsx`, `AskPanel`, `AskProvider`, `COMPONENT_ARCHITECTURE.md`).

## Header heights (measured, production build, Chromium)
| Width | Height | Strip scroll (scrollWidth / clientWidth) |
|---|---|---|
| 390 | 109 px (≤ 112 budget) | 725 / 354 — scrolls; `/certifications` loads scrolled to 371, page `scrollY` 0 |
| 768 | 109 px | 725 / 700 — scrolls by 25 px |
| 1024 | 109 px | fits (centred) |
| 1280 | 109 px | fits (centred) |
| 1440 | 73 px (unchanged single row) | fits |

No horizontal page overflow at any width. Tabs are 44 px tall, with at least 20 px between adjacent tabs.

## Tests
- **New:** `tests/e2e/header-tabs.spec.ts`, all 4 projects:
  - no menu button or dialog; pill and Ask present
  - all 7 tabs visible or reachable by scrolling the strip, ≥ 44 px tall, ≥ 16 px apart
  - active tab has `aria-current` and is scrolled into view at 390 on `/certifications`, with no vertical page scroll
  - the fade shows only while more tabs lie beyond
  - no horizontal overflow
  - header height ≤ 112 below 1440, 70–74 at 1440
- **Updated:**
  - `eval-007`: the header ring sweep now runs at every width; there is a new 390 keyboard test (Tab walks every tab in order, each off-screen tab scrolls into view with a 2 px solid ring); AskPanel focus return at 390 now goes through the header ghost.
  - `layout.spec`: nav visible at every width; the QA-010 min-gap is measured per header row.
  - `tracer.spec`: the S04.05 menu test becomes "no menu button + axe-clean header at 390"; the active-underline test runs at every width.
  - `ask-panel.spec`: the trigger is the header ghost everywhere.
  - `eval-011`: the menu crawl pass is removed (the tabs are crawled as page controls).
  - `not-found`, `eval-006`: comments only.
- **Deleted:** the lenis MobileMenu test and the MobileMenu backdrop test (the component no longer exists).

## Gate
- `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm tokens:check` ✓
- `pnpm test`: 58 files / 625 tests passed (2 skipped)
- `pnpm build` ✓ — all 15 routes static
- **Full `pnpm test:e2e`:** 1259 passed, 0 failed, 1481 skipped (project-scoped skips), 26.5 min
- Bundle `/`: 159.8 kB gzip (budget 180) ✓
- Screenshots in `docs/screenshots/m-009/task-112/`: `header-{390,768,1024,1440}-{home,certifications}.png`

The full e2e run rewrote many tracked `docs/screenshots/**` files. They are not staged and not committed. A local Fact-Forcing hook blocked `git checkout -- docs/screenshots`, so that churn is still sitting unstaged in the worktree and needs a manual restore.

## Design.md
- §2 breakpoints note and §4.1 rewritten (tabs at every width; the two-row < 1440 spec; the pill; no menu).
- §11: **Dev-97** added — disposition "Tushar, 2026-09-27 (TASK-112)". Dev-14 (D12 "nav collapses at 1024") and Dev-94 ("Menu below 1440") are marked superseded.
- §3.3 is unchanged: the header decoration count is still 1 (the subline).

## Notes / open questions
- The brief assumed the nav was visible from 1024, but on the base branch it collapsed below 1440 (Dev-94). "No hamburger at every width" therefore puts the two-row header on 1024–1439 too. The ≥ 1440 row is the part kept unchanged.
- At 390 the wordmark "TUSHAR PATHAK" wraps onto two lines to fit beside "Connect →" and Ask.
- Dev-97 is the next free number on this branch. A parallel TASK-113 may take the same number, so check at merge.
