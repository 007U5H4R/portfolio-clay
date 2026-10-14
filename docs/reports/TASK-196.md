# TASK-196 · About body redesign (origami layered research notebook) — finish report

Branch `TASK-196` (worktree `Portfolio-about-page`). Brief: `/Volumes/E Drive/Dev/.scratch/about-page/spec.md`; art provenance `docs/about-paper-art.md`.
This report covers the finishing pass: merge of main, the hero/footer fingerprint failure, the full gate.

## Merge

`origin/main` at `026da48b` merged into the branch. The only conflict was `app/globals.css` (two delimited append blocks:
the TASK-196 block and main's `TASK-181.4` block). Both kept. `git diff 026da48b -- . ':!docs' ':!public'` lists only About files
(`app/about/page.tsx`, `app/globals.css`, `components/about/*`, About tests). main has since moved to `dc40c669` (TASK-204 Enterprise
Field Journal); that is not merged here — see "Before shipping".

## Root cause of the `about-paper.spec.ts:83` fingerprint failure

The branch does **not** change the hero, opener or footer. The test was broken by two defects in the fingerprint itself, plus a stale
frozen baseline:

1. **Non-deterministic hash.** `getComputedStyle(el)` lists custom properties (`--*`) in an order that changes from one page load to the
   next. The style row was built in enumeration order, so two loads of the *same* build hashed differently (proved: capturing the
   baseline twice from the same untouched `origin/main` build gave different `style` hashes for 11 of 12 region/width cells; `html`
   hashes were stable). Fix: properties are sorted by name before hashing.
2. **Server origin baked in.** Computed `url(...)` values (the hero note's `background-image: url(.../paper-fibers.svg)`) are absolute, so
   `http://127.0.0.1:3196` (main build) vs `:3197` (branch build) differed. Found by diffing every computed property of every hero/footer/
   opener element between a main build and the branch build: the *only* difference was `background-image` (6 elements) and only in the
   origin. Fix: the page origin is stripped from style values.
3. **Stale baseline.** The frozen JSON came from main at `ef4c36c` and was never committed (`??` in git status). main's hero/footer have
   changed in later releases.

After fixes, main captured twice is byte-identical, and the branch matches it at all four widths.

## Baseline, now computed rather than frozen

- `tests/e2e/about-paper-lib.ts`: sorted props, origin-free, `fingerprint(page, origin?)`.
- `tests/e2e/about-paper.spec.ts`: if `ABOUT_BASELINE_URL` is set (a running build of `origin/main`) the spec fingerprints that origin live
  and compares; otherwise it uses the committed snapshot `tests/e2e/about-paper-baseline.json`, which now records
  `_capturedFrom: 026da48b`. Verified both modes pass (live mode: `ABOUT_BASELINE_URL=http://127.0.0.1:3196`, w390/768/1024/1440).
- `tests/e2e/about-paper-capture.spec.ts`: writes `_capturedFrom` from `ABOUT_BASELINE_FROM`. Recapture recipe is in the lib header comment
  (run inside an `origin/main` checkout; capture twice and `cmp` to prove determinism).
- Honest limit: the committed JSON is still a snapshot and goes stale when main's hero/footer change again. Use `ABOUT_BASELINE_URL` at
  merge time, or recapture. It no longer fails for spurious reasons.

## Other gate findings fixed

- `tests/e2e/a11y-90d.spec.ts` "/about Three Chapters" (new on main, fails on the branch): it counted every `- listitem:` in the chapters
  list; the redesign adds keyword chips (`ul.chx-tags > li`) inside each card, so 3 chapters + 7 chips = 10. Now counts only first-level
  items (`/^ {2}- listitem:/gm`) so it still asserts exactly three chapters. Not a product change.

## Gate results (all through `heavy-gate.sh about`)

| Gate | Result |
|---|---|
| typecheck | pass |
| lint | pass |
| tokens:check | pass |
| next build (`ALLOW_DEV_ROUTES=1`) | pass |
| pnpm test (unit) | pass |
| full Playwright (4 viewports, 4388 tests, `--retries=0`) | 2173 passed, 2200 skipped, 15 failed (list below) |
| re-run of the failures alone, after the fixes | all About-related pass; remaining are pre-existing / flaky |

Full-run failures and disposition:

- 4x `about-paper.spec.ts:83` fingerprint: fixed above; pass at w390/768/1024/1440 in the re-run, and in live-baseline mode.
- 2x `a11y-90d.spec.ts:42` (w390, w1440): fixed above; pass in re-run.
- 4x `eval-008.spec.ts:93` `/dev/artifacts` micro-label floor: pre-existing on main (known).
- 3x `eval-033.spec.ts:164` real-site iOS tilt chip (w390, w768 in full run; w390 in re-run): pre-existing; fails identically on the origin/main build.
- `eval-030.spec.ts:640` w390 reduced-motion lights (re-run + main): pre-existing; fails identically on the origin/main build.
- `eval-030.spec.ts:602` w390 Nudge (full run, 150 s timeout, "element detached"): flaky; passes in the re-run.
- `home.spec.ts:213` w1440 EVAL-018 decoration counts (full run: header 0 vs 1, how-i-think 2 vs 3): flaky; the branch touches no home file, and it passes in the re-run. (On the main build in the same re-run, `home.spec.ts:131` EVAL-006/008 failed at w390/768/1024 — a different flake on main, unrelated to this branch.)

No single full run was fully green: the evidence is the full run plus targeted re-runs of every failure. The full suite also rewrites ~100
tracked screenshot PNGs in other folders as a side effect; those were restored and are not part of the branch.

## Visual check

`/about` at 390 and 1440, light and dark, no horizontal overflow (`scrollWidth == clientWidth`: 1440/1440 light and dark, 390/390 light and
dark). Screenshots (hero, footer, opener, six sections, full page, per theme/width) in `docs/screenshots/m-013/task-196/`.

## Before shipping

- main has moved to `dc40c669` since this merge. Merge it again (expected conflict: another append block in `app/globals.css`, keep all
  blocks), then run the fingerprint with `ABOUT_BASELINE_URL` pointed at an `origin/main` build, or recapture the JSON.
- The gate queue (other lanes holding `heavy-gate.sh`) was the dominant cost of this pass; the full suite itself is ~1.7 h.
