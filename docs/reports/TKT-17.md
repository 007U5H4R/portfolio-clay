# TKT-17 · `ExperienceStrip` — professional experience on `/work` — implementer report

**Milestone:** M-004 · **Type:** Feature · **Priority:** P2 · **Branch:** `m-004-work`
**Scope:** `components/projects/ExperienceStrip.tsx` (new) + `app/work/page.tsx` (wire below the personal grid) + `tests/e2e/work.spec.ts` (TKT-17 coverage). Depends on TKT-16 (grid, merged) and the professional-entry data from TKT-15 (`data/projects.ts`).

## Result

Below the personal `/work` grid, a flat, non-clay, bordered strip renders the three `category:'professional'` entries as **employment**, deliberately the visual opposite of `ProjectCard`: no `ClayCard`/`ClayIcon` surface, no `StatusBadge`, no `DemoVideo`, no external/live link, no `ViewTransition`. Each row shows role + name (which carries the employer) + dates + tags, sourced verbatim from `data/projects.ts` (CONTENT_INVENTORY §2.3), with an inline expand-on-click revealing the one-paragraph resume-sourced summary (`overview.thirtySecond[0]`). Only one row is open at a time (mirrors `HowIThink`'s disclosure pattern and its `grid-template-rows` CSS-transition technique — collapses to instant under `motion-reduce`). The strip is filter-aware: it reads the same `?filter=` as `WorkGrid` via the shared `lib/filters.ts` `applyFilter`/`parseFilter`, so Enterprise/Cloud/AI narrow the rows exactly like the grid; a filter with no professional match (Experiments) leaves no heading/rows/CTA behind. A "See my experience" link (`ClayPill variant="link"`) points at `/about#experience` (SITEMAP.md / decisions §S8) — a real, resolving-once-built internal link, currently a documented WARN in the dead-control crawler (`/about` is `TKT-40`, not yet built), never a FAIL.

## Deviation (documented, not a breaker)

technical-plan.md's row spec names columns "title · company · dates · tags", but the `Project` schema (shared with personal builds, TKT-15) has no discrete `company` field for a professional entry — the employer is already folded into `name` (e.g. "Accounts Receivable Modernization — American Express"). Rather than parsing a company out of that string, the row shows `role` (the S8 title: "Senior Product Manager" / "Technical Project Manager" / "Assistant Product Manager") as the primary line and `name` as the secondary line — every word rendered is verbatim from the data, nothing fabricated or split. Judged not to rise to a STOP-and-report breaker: no data/design contract is actually violated, just a column-label mismatch against a schema decision already locked in TKT-15.

The "See my experience" CTA renders via `ClayPill variant="link"`, which appends its own trailing arrow icon — the ticket's literal copy "See my experience →" is therefore rendered without a second, redundant arrow glyph in the text, consistent with every other `ClayPill variant="link"` usage in the codebase (`EmptyState`, `HowIThink`).

## Verification

- `pnpm typecheck && pnpm lint && pnpm test`: all green (34 test files / 178 passed / 1 skipped, unchanged from before this ticket).
- `pnpm build`: green; `assert-static.ts` reports **all routes static (6)** — `/work` stays `○` (static) with the strip wired in.
- `pnpm test:e2e --grep 'work|experience'`: **50 passed, 0 failed** (74 skipped by the existing viewport-gating pattern — each content/behaviour check runs once at its designed width). New TKT-17 tests added to `tests/e2e/work.spec.ts`:
  - `@EVAL-013` — all 3 professional entries render verbatim (role/name/dates), no `<a>` inside a row, no separate status-badge text, CTA href is exactly `/about#experience`.
  - `@EVAL-011 @EVAL-007` — a row trigger is keyboard-operable (`Enter` toggles `aria-expanded`), reveals its sourced summary, and opening a second row closes the first.
  - `@EVAL-011` ×5 — per-filter row sets (`all`/`ai`/`enterprise`/`cloud`/`experiments`) match the data-derived expectation; the `experiments` case additionally asserts the heading/CTA disappear rather than leaving an empty labelled box.
- `pnpm test:e2e --grep '@EVAL-011 no dead controls'` (run directly, not just via the `work|experience` grep, since the crawler spec's own title doesn't match that pattern): **0 dead controls** across all routes/widths (176 controls checked); the new "See my experience" link and both expand buttons register as live controls. The only new WARN is the expected not-yet-built `/about` route (owner TKT-40).
- `pnpm eval --only EVAL-007,EVAL-011,EVAL-013`: **3 pass · 0 fail** → no regression. Result written to `evals/results/eval-run-0.2.0-0239ed7.json` (left unstaged per guardrails).

## Reads as employment, not product — confirmed

- No `ClayCard`, `ClayIcon`, `StatusBadge`, `DemoVideo`, live/external link, or `ViewTransition` anywhere in `ExperienceStrip.tsx` — rows are plain flat `<li>`s separated by a hairline border, not clay surfaces.
- The section is explicitly labelled "Professional experience — corporate work, not a public product." (visible `<h2>`, read by screen readers).
- Rows carry no "live"/uptime signal — `project.statusLabel` ("Professional experience") is never rendered as a badge in this component, satisfying the brief's "no live/uptime/status-badge product framing on jobs."
- The expand affordance is a plain chevron (rotate on open), not the product-card's arrow-right — visually and semantically distinct from "go to a product."

## Also changed

- `app/work/page.tsx`: added `professionalProjects` derivation + a second `<Container as="section" aria-label="Professional experience">` wrapping `ExperienceStrip`/`ExperienceStripFallback` in their own `<Suspense>` boundary (same TP7 pattern `WorkGrid` already uses — the fallback renders the unfiltered set so a deep link only flashes the full strip for one frame). Docstring updated to describe the three-piece assembly (`WorkHero` → `FilterTabs`/`WorkGrid` → `ExperienceStrip`).

## Blockers / open items

None. `/about#experience` is a documented not-yet-built target (TKT-40, M-006) — expected WARN, not a blocker for this ticket.

## Commit

`feat(m004): TKT-17 ExperienceStrip (professional experience on /work)` — see repo log for SHA (explicit-path staging: `components/projects/ExperienceStrip.tsx`, `app/work/page.tsx`, `tests/e2e/work.spec.ts`, `docs/reports/TKT-17.md`; `evals/results/*.json` left unstaged).
