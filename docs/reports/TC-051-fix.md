# TC-051 Fix Report — AskPanel full-bleed mobile sheet + worker-cap flakiness

**Branch:** `m-003-home`
**Related:** `docs/reports/M003-qa.md` (M-003 phase QA gate, verdict FAIL on TC-051)
**Date:** 2026-09-17

## 1. Fix 1 — TC-051 (P1): AskPanel bottom sheet 38px narrower than viewport at <768

**Root cause.** `components/ai/AskPanel.tsx`'s `<dialog>` className relied on `max-md:w-auto` to size
the <768 bottom sheet, but never overrode Chromium's native `dialog:modal` UA default
`max-width: calc(100% - 38px)`. At a 390px viewport the sheet rendered 352px wide, leaving a 38px
gap on the right edge showing the page/`MobileMenu` behind it. The sibling `components/navigation/
MobileMenu.tsx` (same native-`<dialog>` pattern) already handles this with an explicit `max-w-none`.

**Fix.** Added `max-md:max-w-none` to `AskPanel.tsx`'s dialog className, alongside the existing
`max-md:w-auto`, matching `MobileMenu`'s approach exactly.

**Verification (measured, not assumed):**

| Width | Expected | Measured after fix |
|---|---|---|
| 390 | full viewport width (no right-edge gap) | 390px — full-bleed, matches viewport |
| 768 | 400px right drawer, 16px insets | 400px |
| 1024 | 400px right drawer, 16px insets | 400px |
| 1440 | 480px right drawer, 16px insets | 480px |

Confirmed via the new automated test (Fix 2) run standalone across all four Playwright viewport
projects — see §2.

## 2. Fix 2 — Regression test for AskPanel geometry

AskPanel geometry previously had **zero automated coverage** (the QA gate's own finding — TC-051 was
caught only by a throwaway one-off script). Added a permanent case to `tests/e2e/ask-panel.spec.ts`:

> `@TC-051 panel geometry: full-bleed bottom sheet at <768, fixed-width drawer at >=768`

It opens the panel and asserts `getBoundingClientRect()`-equivalent (`boundingBox()`) width:
- `< 768`: width === the live viewport width (full-bleed, no gap)
- `>= 768` and `< 1440`: width === 400
- `>= 1440`: width === 480 (aligned to `app/globals.css`'s `--breakpoint-2xl: 1440px` override)

Runs across all four Playwright projects (w390/w768/w1024/w1440) with no skip, so any regression
back to the native `dialog:modal` max-width default — at any breakpoint — fails the suite.

## 3. Fix 3 — Playwright worker cap (flakiness)

**QA gate finding:** full 4-project parallel `pnpm test:e2e` produced 23 `[w1440]`-only failures
(`browserContext.close: ENOENT …trace.zip`), diagnosed as host resource contention from
`fullyParallel: true` with no worker cap; the gate reported 0 failures at `--workers=1`.

**Change.** `playwright.config.ts`: `workers` is now capped unconditionally (previously only capped
to 1 in CI, unbounded locally). Tried `workers: 2` first per the brief's suggestion, but on **this**
host it still reproduced failures across two full runs (5 and 3 failures respectively, different
tests each time). Moved to `workers: 1` to match the QA gate's own verified-clean configuration.

**Result — important caveat, reported honestly rather than declared clean:**

At `workers: 1`, the specific failure signature the QA gate diagnosed
(`browserContext.close: ENOENT …trace.zip`, a trace-file write race under 4x parallelism) **did not
recur in any of three full-suite reruns** performed during this fix — the worker cap resolved that
exact root cause.

However, all three `workers: 1` full runs still showed a small number (2–3) of **different**,
pre-existing, unrelated test failures each time (`tracer.spec.ts` hero-avatar-frame /
floating-tile-offset assertions, and — once — the pre-existing `ask-panel.spec.ts` 44px-target-floor
case). Every single one of these was rerun standalone (`--workers=1`, targeted `-g`) and **passed
100% on every retry** (3/3 each). Host `uptime` during this work showed load averages of 6–23 on an
8-core machine, with concurrent unrelated `gh api` calls and other agent/editor processes visible in
`ps aux` — i.e. **host-level CPU contention from processes outside this Playwright run**, not a
regression introduced by these changes, not caused by Playwright's own parallelism (already at
`workers: 1`), and not specific to the AskPanel fix (the flaking tests are all pre-existing and
untouched by this change). This is a broader/noisier version of the same class of finding the QA gate
already documented for EVAL-007/008, using the same evidentiary bar (isolated rerun passes ⇒ false
negative, not a code defect).

**New `@TC-051` geometry test itself never flaked** across any of the runs in this fix.

Recommendation for a future ticket (not fixed here, out of scope for TC-051): CI/local full-suite
runs on shared/loaded hosts would benefit from `retries` beyond `0` locally, or serializing the four
viewport projects, to absorb host-level noise — tracked as a follow-up, not silently rolled into this
fix.

## 4. Verification summary

| Check | Result |
|---|---|
| `pnpm typecheck` | PASS — 0 errors |
| `pnpm lint` | PASS — 0 errors/warnings |
| `pnpm test` (unit) | 167 passed, 1 skipped (pre-existing `resume-pii.test.ts` skip, TKT-08 BLOCKED) |
| `pnpm build` | PASS — all routes static |
| `pnpm test:e2e` (workers:1, 3 full reruns) | 175–176 passed, 266 skipped, 2–3 unrelated pre-existing flakes per run (0/3 reproduced in isolation); new TC-051 test passed every run |
| `pnpm eval --only EVAL-006,EVAL-007,EVAL-008,EVAL-010,EVAL-011` | 4 pass, 1 fail (EVAL-008, same 44px-floor flake — passed 3/3 in isolated rerun, treated as false negative per QA gate's own precedent), 12 skip; result in `evals/results/eval-run-0.2.0-7f9558c.json` |

No regression against the M-003 QA gate baseline. TC-051 is fixed and now has permanent automated
coverage.
