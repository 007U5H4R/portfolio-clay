# Brief — TKT-48 · Accessibility sweep (QA-tester) · TASK-44

**You are a fresh QA-tester subagent. Self-contained brief — no prior chat context.** Separate role from implementers: verify honestly, fix small a11y defects in scope, log the rest as `QA-###`. No scope creep. Read cited files yourself.

## Repo / environment
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — **everything on E Drive**. Branch `m-007-quality` (checked out). Commit here, not `main`.
- Stack: Next.js 16.3.5 (App Router, static), React 19, Tailwind 4, `motion` 13, pnpm 11.25.0, node 26.7.0.
- **Host memory-tight (~100 MB free). Playwright FOREGROUND only, one at a time, `workers:1` (already pinned), `:3000` reuseExistingServer. Check `uptime` first; NEVER a background Monitor (deadlocks on OOM). If a run stalls/OOMs: reap, wait for calm, retry once, else report the environmental block — don't loop.**
- Landed just before you: TKT-49 perf levers + TKT-47 (EVAL-008 broadened to all 22 routes; essay CTA 44px fix). You sweep the CURRENT code.

## Objective
Prove the site is accessible: axe clean, fully keyboard-operable with visible focus, reduced-motion honoured, adequate contrast — across all public routes.

## Acceptance criteria (from `tickets.md` TKT-48)
1. **axe 0 critical/serious** on every route at **390 & 1440**.
2. **100% of these flows keyboard-completable with visible focus:** header nav, MobileMenu, FilterTabs (/work), ExperienceTimeline (/about), AskPanel (open/answer/close, focus-trap), ShowTheThinking (case study), OverviewToggle (case study), CopyButton (/contact).
3. Reduced-motion assertion green on all routes (no transform animations).
4. VoiceOver notes in `docs/a11y-pass.md`.
5. Fixes applied (small commits) or `QA-###` logged with reason.

## What exists already (reuse, don't rebuild)
- `tests/e2e/eval-006.spec.ts` (axe / EVAL-006), `tests/e2e/eval-007.spec.ts` (keyboard + focus-trap / EVAL-007), `tests/e2e/eval-010.spec.ts` (reduced-motion / EVAL-010). Read all three first.
- **IMPORTANT coverage check (TKT-47 precedent):** TKT-47 found `eval-008.spec.ts` was silently under-covering (7 of 22 routes; one check ran only on `/`). **Check whether `eval-006`/`eval-007`/`eval-010` have the same gap.** If axe (EVAL-006) or reduced-motion (EVAL-010) run against only a subset of routes, broaden them to the full public-route set **derived the same way `app/sitemap.ts` / the fixed `eval-008.spec.ts` do it** (`STATIC_ROUTES` from `@/app/sitemap` + `projects` filtered `category:"personal"` + `writing`) — never hard-code, never touch shared `tests/e2e/routes.json` (EVAL-011/017 consume it). Same thresholds, just broader iteration (no EV2 weakening).
- `pnpm eval --only EVAL-006,EVAL-007,EVAL-010` is your gate command.

## Procedure
1. `uptime` (calm?) → `pnpm build` → run `pnpm eval --only EVAL-006,EVAL-007,EVAL-010` foreground. Read the three specs to know exact coverage.
2. Broaden axe/reduced-motion route coverage if under-covering (per above). Re-run.
3. **Keyboard flows (AC2):** verify each listed flow is fully operable by keyboard with a visible focus ring, and focus order is logical. eval-007 covers AskPanel focus-trap + timeline keyboard already — confirm, and cover any listed flow not yet scripted (FilterTabs, MobileMenu, OverviewToggle, ShowTheThinking, CopyButton) with a small e2e assertion or a documented manual keyboard walk in the report if a spec would be heavy. Note the `/contact` CopyButton keyboard-e2e follow-up flagged in M-006 — close it here if cheap.
4. **Contrast:** check every token pairing actually used resolves to WCAG AA (≥4.5:1 body, ≥3:1 large/UI). eval-008's micro-label check already does contrast for `data-micro-label`; extend a spot-check to the main text/bg/accent pairings if not already covered. Prior milestones fixed real contrast bugs (Footer bg, eyebrow ink) — verify none regressed.
5. **VoiceOver (AC4) — do NOT fake it.** A real VoiceOver pass needs a human on macOS. Do the automatable substitute thoroughly: dump/inspect the accessibility tree (roles, names, landmarks, heading outline h1→h2→h3 with no skips, aria-current, aria-expanded/controls, live regions, alt text) for `/`, `/work/teachspark`, `/about`, and record it in `docs/a11y-pass.md` as the semantic-structure evidence. Explicitly flag "a human VoiceOver spot-check on these 3 routes is a turnkey item for Tushar" — state clearly what was verified programmatically vs what needs his ears.
6. For each real defect: small in-scope fix (commit) or `QA-###` (id/route/description/why deferred). Keep typecheck/lint/build green.

## Constraints
- No threshold weakening (EV2). Don't relax axe rules, the focus/keyboard requirements, or contrast floors to pass — fix the DOM or log QA-###.
- Don't touch content/data truth, the cinematic site, or `portfolio/index.html`.
- Commits on `m-007-quality`; trailer `Co-Authored-By: <your actual session model> <noreply@anthropic.com>`.

## Report to `docs/reports/TKT-48.md`
axe result per route @390/1440 (0 critical/serious?); whether you broadened EVAL-006/010 coverage and how; keyboard-flow pass/fail per listed flow (with how verified); reduced-motion result; contrast spot-check result; `docs/a11y-pass.md` created with the semantic/AT-tree evidence + the VoiceOver-human turnkey flag; defects fixed (SHAs) vs QA-### logged; final `pnpm eval --only EVAL-006,EVAL-007,EVAL-010` result; gate status; files changed.
