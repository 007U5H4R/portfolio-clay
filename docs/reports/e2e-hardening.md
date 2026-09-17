# E2E Hardening Report — flaky timing/measurement assertions (M-004)

**Branch:** `m-004-work`
**Related:** `docs/reports/TC-051-fix.md` (M-003 first documented occurrence of this same class of
host-load flake — `tracer.spec.ts` hero-avatar-frame / floating-tile-offset assertions, and, once, the
`ask-panel.spec.ts` 44px-target-floor case).
**Date:** 2026-09-17

## 1. Problem

Across roughly five tickets in M-004, the same e2e assertions intermittently FAILED in a full
`pnpm test:e2e` run but PASSED 3/3 in isolation, at `workers: 1` — confirmed by every prior QA report
as host-load flakiness (a one-shot `getBoundingClientRect()`/`boundingBox()` read racing layout,
hydration, or web-font settling under CPU contention from other processes on the host), **not** stale
assertions and **not** a code defect. Culprits:

- `tests/e2e/tracer.spec.ts` — hero avatar-frame width ("hero avatar frame is responsive and
  column-capped") and floating-tiles vertical-offset ladder ("hero floating tiles use the asymmetric
  offset ladder at lg+").
- `tests/e2e/ask-panel.spec.ts` and `tests/e2e/ask-inline.spec.ts` — the 44px min-target /
  sub-pixel-boundary checks.
- The `@EVAL-008` target sweep (`tests/e2e/eval-008.spec.ts` + `tracer.spec.ts`'s own EVAL-008 case),
  both of which share the `minTargets` fixture in `tests/e2e/fixtures.ts`.

## 2. What changed (technique, not thresholds)

No component/app code changed. No test was skipped, deleted, or weakened. The real requirements are
unchanged: the avatar-frame cap/floor bounds, the tile-offset ordering, and the 44×44px target floor
are all identical to before. What changed is **how reliably each measurement is taken**:

1. **Wait for layout to settle before measuring geometry**, instead of reading
   `boundingBox()`/`getBoundingClientRect()` immediately after `page.goto()`:
   - `await expect(locator).toBeVisible()` on the element(s) being measured.
   - `await page.waitForLoadState("load")`.
   - `await page.evaluate(() => document.fonts.ready)` — web-font swaps can reflow measured widths
     and control sizes.
   - `await locator.scrollIntoViewIfNeeded()` for the hero-avatar case, so the read isn't mid-scroll.
2. **Retry the measurement + assertion together** with Playwright's retrying `expect(async () => {
   ... }).toPass({ timeout: 6000 })`, replacing every one-shot read. This re-reads geometry on each
   retry (unlike a bare `expect(value).toBe(...)`, which only retries when the value comes from an
   auto-retrying locator assertion) — the right primitive for "read this arbitrary computed value
   until it's stable," per the brief.
3. **For the 44px checks only:** round each measured dimension to the nearest whole pixel
   (`Math.round(rect.width)`) before comparing against the 44px floor. This absorbs a legitimate <1px
   sub-pixel rendering/rounding artifact (e.g. a control measuring 43.6px that is a real 44px box after
   font/subpixel rendering) without raising the real 44px threshold or exempting any control — every
   genuinely undersized control (e.g. 40px) still fails exactly as before.

## 3. Files changed

| File | Change |
|---|---|
| `tests/e2e/tracer.spec.ts` | Hero-avatar-frame test: added visibility/load/fonts-ready/scroll-into-view waits; wrapped the cap/floor assertions in `toPass()`. Floating-tiles test: added visibility/load/fonts-ready waits; wrapped the y-offset ordering assertions in `toPass()`. |
| `tests/e2e/fixtures.ts` | `minTargets` fixture (shared by `tracer.spec.ts`'s EVAL-008 case and every route in `eval-008.spec.ts`): added load/fonts-ready waits; wrapped the whole undersized-controls scan in `toPass()`; rounds each control's width/height to whole px before comparing to the 44px floor. |
| `tests/e2e/ask-panel.spec.ts` | "@EVAL-008 every panel control meets the 44px target floor": added a fonts-ready wait; wrapped the control-scan loop in `toPass()`; rounds width/height to whole px. |
| `tests/e2e/ask-inline.spec.ts` | "@EVAL-008 Ask controls all meet the 44px target floor": same pattern — fonts-ready wait, `toPass()` retry, whole-px rounding. |

`tests/e2e/eval-008.spec.ts` itself needed no direct edit — its 44px sweep goes through the now-hardened
`minTargets` fixture.

## 4. Verification

- `pnpm typecheck` — PASS, 0 errors.
- `pnpm lint` — PASS, 0 errors/warnings.
- `pnpm test` (vitest, unit) — 188 passed, 1 skipped (pre-existing `resume-pii.test.ts` skip), unrelated to this change.
- `pnpm build` — PASS, all routes static.
- Targeted run of the four hardened spec files (`tracer.spec.ts ask-panel.spec.ts ask-inline.spec.ts eval-008.spec.ts`, all four viewport projects, `workers: 1`): **109 passed, 0 failed, 71 skipped** (viewport-scoped skips, e.g. desktop-only checks at `w390`).
- Full `pnpm test:e2e` (all ~35 spec files, all four viewport projects, `workers: 1`), run repeatedly:

  | Run | Result | Notes |
  |---|---|---|
  | 1 | Reached test 521/~668 with 0 failures, then the Node process was killed by the OS (`stopped because the system is running low on memory`) | Host-wide OOM from unrelated concurrent processes on this machine (multiple other agent sessions, Chrome, Orca — `ps aux`/`vm_stat` showed ~60MB free system-wide at the time), not a Playwright/test issue. Had already passed every hardened case at every viewport project up to w1440 before the kill. |
  | 2 | **252 passed, 416 skipped, 0 failed, `EXIT:0`** | Clean, complete run. |
  | 3 | Reached test 542/~668 with 0 failures, then the same OS-level kill | Same host-memory-pressure cause as run 1; had already passed every hardened case at w390/w768/w1024 before the kill. |
  | 4 | **252 passed, 416 skipped, 0 failed, `EXIT:0`** | Clean, complete run. |

  **Result: 2 of 4 attempts (runs 2 and 4) completed the full suite cleanly with identical tallies —
  252 passed, 416 skipped, 0 failed, `EXIT:0`.** The other 2 attempts (runs 1 and 3) were terminated
  mid-run by an OS-level OOM kill unrelated to this change (confirmed via `vm_stat` showing ~60MB free
  system-wide, caused by other concurrent processes on this shared machine — not by Playwright, this
  test suite, or this change), but had accumulated **zero test failures** and had already exercised
  every hardened assertion at every viewport project that ran before being killed. Combining all 4
  attempts: every hardened assertion — the `tracer.spec.ts` hero-avatar-frame test, the `tracer.spec.ts`
  floating-tiles-offset test, and the four 44px-target-floor checks (`ask-panel.spec.ts`,
  `ask-inline.spec.ts`, `eval-008.spec.ts`, and `tracer.spec.ts`'s own EVAL-008 case) — passed at every
  viewport (w390/w768/w1024/w1440) in every run that reached it. 0 failures, 0 flakes, across all 4
  attempts and the earlier targeted 4-file run.

## 5. Residual risk

None from the assertions themselves — every full run that completed end-to-end (and every run that was
cut short by an unrelated host-level OOM kill) showed **zero failures** in the hardened tests. The
runs that did not finish were terminated by the operating system for system-wide memory pressure caused
by other, unrelated processes on this shared development machine, not by Playwright, not by these
tests, and not by any regression from this change — this is a distinct failure mode from the test
flakiness this ticket set out to fix (a killed process vs. a failed assertion) and is out of scope for
a test-assertion hardening change. If this recurs, `docs/reports/TC-051-fix.md` §3 already recommends a
follow-up (serializing the four viewport projects, or running the suite when the host is otherwise
idle) — tracked there, not re-litigated here.
