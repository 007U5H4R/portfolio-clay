# Brief — TKT-46 · 404 page (`app/not-found.tsx`)

**Ticket:** TKT-46 (Backlog `TASK-42`) · Milestone **M-006** · Type Feature · P3 · sp:1
**Branch:** `m-006-pages` (or your assigned worktree off it — verify `git branch --show-current`; commit ONLY on the m-006 line, never `main`).
**Model tier:** standard (sonnet). **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TKT-05 (layout/Footer) — done. Smallest ticket; disjoint file.

## Objective
A friendly, on-brand 404 that returns the correct HTTP status, keeps the header/footer chrome, and offers clear ways back.

## Read first (in order)
1. `tickets.md` → **TKT-46** (~922–928) — authoritative ACs.
2. `Design.md` → §3 (flat page / one clay tile pattern) and the reduced-motion a11y row.
3. `app/layout.tsx` — confirm header/footer come from the root layout so `not-found.tsx` inherits them (Next App Router renders `not-found.tsx` inside the root layout). If chrome is NOT in the root layout, mirror how the other pages get it.
4. Pattern references: `components/clay/ClayTile`/`ClayCard`, any existing headline/`Container` usage; `app/work/[slug]/page.tsx`'s `notFound()` calls (the 404 this page serves).

## Scope — files
- **Create** `app/not-found.tsx` — a flat page: one clay tile/card, a headline (e.g. "This page wandered off." — your call, on-brand, no invented facts), short supporting line, and links to **`/`**, **`/work`**, **`/contact`**. Header/footer present (via layout). Reduced-motion safe (no autoplaying transform motion; any `Reveal` use must degrade to opacity/snap). Keep it static/server-rendered.

## Acceptance criteria (TKT-46, verbatim)
1. Visiting an unknown path (e.g. `/nope`) returns **HTTP 404** AND renders this page. 2. The three links resolve (`/`, `/work`, `/contact`). 3. axe clean at 390 and 1440.

## TDD / gates (ALL pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. `tests/e2e/not-found.spec.ts` (Playwright, **workers:1**, retry once on OOM): `/nope` responds 404 (assert `response.status() === 404`) and shows the page; the 3 links exist and resolve; header + footer present; axe @390/1440; no-overflow @390/1440. (There may already be a 404 assertion in `tracer`/other specs — extend rather than contradict.)
3. `pnpm exec vitest run` green.
4. `pnpm prebuild` `content OK` unchanged.
5. `pnpm build` — build succeeds; confirm the 404 is emitted (Next `/_not-found`); `assert-static` still green for the real routes.
6. `pnpm eval` (EVAL-011/015) no regression — leave eval-run json untracked.
7. Screenshots the 404 at 390/1440 → `docs/screenshots/not-found/`.

## Constraints
- Everything on `/Volumes/E Drive`. Stage EXPLICIT paths only — never `git add -A`.
- One commit: `feat(m006): TKT-46 404 not-found page`. Co-Authored-By = your model.
- Keep it minimal — this is sp:1. No new data, no OG image required by the ticket.

## Output — `docs/reports/TKT-46.md`
Files; how the 404 status is produced + verified; how chrome is inherited; the copy shipped; ALL gate results with counts + OOM retries; eval-run path + regression; screenshot paths; commit SHA; any flags — flag, don't block.
