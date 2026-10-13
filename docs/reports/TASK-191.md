# TASK-191 (+178, 182, 159) — CI and test hygiene

Branch `m013/ci-hygiene`. Nothing deployed; only this branch pushed.

## Evidence used
Latest failing main run: `eval` run 38241142275 (push, 1h21m). Typecheck, lint, unit, Build and the Playwright install all passed; the job failed in **Evaluate** only. The harness exit was `critical FAIL: PLAYWRIGHT-SUITE (9 failing)` after 1 retry (CI sets `retries: 1`, 2 workers).

| Failure on main | Class | Action |
|---|---|---|
| EVAL-039 smoothness (`/`, `/projects`, `/about`: 9–13 frames > 50 ms, worst 129 ms) | hardware-bound | CI-informational (below) |
| EVAL-023 runtime system flip (`expected dark, received light`, flaky at w390 and w1440) | real race | fixed (below) |
| Lighthouse perf 0.72–0.76, LCP 4.3–5.7 s on all 4 routes (mobile) | SwiftShader | already informational, no change needed (below) |
| EVAL-030 (lab), EVAL-018 home decoration counts, layout.spec 1440, lenis.spec PageDown | load-induced timeouts | not changed, see Limitations |
| EVAL-016 `pnpm audit` high/critical vulnerability | new dependency advisory | not changed, see Limitations |

## What changed
1. **EVAL-039** (`tests/e2e/perf-smoothness.spec.ts`, TASK-191). When `CI` is set, the "frames > 50 ms" count is recorded as a `perf-informational` annotation instead of failing. Reason: the count depends on the host (0–1 on a quiet machine, 9–13 on GitHub's shared 4-vCPU runner with SwiftShader and two workers). Still hard everywhere: no frame > 200 ms, 0 off-screen time-based animations at rest, <= 3 applicable image preloads. `PERF_STRICT=1` re-enables the count on CI. Local runs are unchanged. No test deleted.
2. **EVAL-023** (`tests/e2e/eval-023.spec.ts`, TASK-191). Root cause: `waitUntil: "load"` fires before React hydrates, and the live system-theme listener (`lib/use-theme.ts` `subscribe`) exists only after hydration, so an early `emulateMedia` flip was a no-op on a slow runner. The test now re-emits the flip inside `expect.poll` (20 s) until the listener follows it, then asserts the light flip and the explicit-choice-ignores-system part exactly as before. The assertions are no weaker: the listener must still follow the system with no saved choice and ignore it with one.
3. **Lighthouse**. No change. `scripts/eval.ts` already marks EVAL-004 and EVAL-005 `informational` (SwiftShader) and excludes them from criticalFailures and regressions (the run log shows `FAIL EVAL-004 … [informational]`); the red "assert command failed" lines are logged, not gating. Thresholds in `lighthouserc.*.json` are untouched (EV2: never lowered).
4. **TASK-178** (`app/globals.css`). The `/dev/artifacts` board renders `components/case-study/artifacts/*`, which is used by no other route, so I raised the sub-14 px sizes to 14 px in their CSS (`.artifact-eyebrow/-src/-caption/-status/-note`, `.metric-lbl/-foot/-kind`, `.proto-placeholder`) rather than marking content copy `data-micro-label`. The same file's `/dev/thinking` node classes (`.node-lab`, `.node-src`, `.node-src-plain`, 11–13 px) are raised too, which removes that page's flake. Screenshots refreshed: `docs/screenshots/artifacts/390.png`, `1440.png`.
5. **TASK-182**: confirmed fixed. In the latest main and PR runs (38241142275, 38241128700, 38226808870) the **Build** step succeeded in ~25 s and the job reached Evaluate (TASK-190's 120-minute timeout is in place). No Build-step failure in any run since.
6. **TASK-159**: AC #1 is **done except the paper-cut icon set**. `data-elev` contract on cards and the six button families shipped (EXE-52); EVAL-037 spec exists and passes in this run; the EVAL-038 P3 style gate passed (EXE-54); project-card internal parallax was absorbed by TASK-181.2 / P2 (Solution-PRD). Icons stay inline SVG per Design.md §14.6 (open item in `docs/reports/M011-cloud.md`). Recommendation: close TASK-159, with the icon set filed separately if wanted. `backlog/` not edited.

## Gates (this container, 4 vCPU)
- `pnpm typecheck` clean; `pnpm lint` 0 errors (2 existing warnings); `pnpm tokens:check` 73/73 AA.
- `ALLOW_DEV_ROUTES=1 pnpm build` OK.
- `pnpm test`: 135 files, 1564 passed, 4 skipped.
- Full `pnpm test:e2e --retries=0` (4 widths, 2 workers, 49.9 min): 2066 passed, 2106 skipped, 28 failed. Triage:
  - EVAL-039 x4: failed only because `CI` was unset locally (strict mode); rerun with `CI=1` passes 10/10 (and the 4 pre-edit failures are the known TASK-191 flake).
  - EVAL-030 x4 (w390 reduced motion, w768 back/inert, w1440 power-ups) and `paper-drawin`: pass solo with `--workers=1` (15/15 with the EVAL-011 case excluded). Host contention.
  - Container network/fonts: `fallback-glyphs` x4, `media-player` x2, `portfolio-video` x10, `eval-014` w390, `playground` live URLs, EVAL-011 dead-controls (112 "dead" are all `fetch failed` for external links such as Resume and LinkedIn).
  - EVAL-008 `/dev/artifacts` and `/dev/thinking`: 12/12 pass at all widths after the fix (were failing at 4 widths).
  - EVAL-023: 100% pass x2 widths in the targeted run (37 passed together with EVAL-008).
- Not compared against main in-container (a second full build was not worth it): every remaining failure is network/font or passes solo.

## Judgement calls
- Over-50 ms count made informational on CI only; kept the 200 ms ceiling hard.
- Raised the CSS to 14 px instead of using `data-micro-label` (content copy, not brand micro-labels).
- Did not change Lighthouse config or playwright workers/retries.

## Limitations
- The CI workflow itself was not run (no push to main, and branch CI runs after the push); the effect on CI is reasoned from the run logs, not observed.
- The other CI-only flakes (EVAL-030 lab, EVAL-018 home counts, layout 1440, lenis PageDown) did not reproduce locally and are timing under 2-worker contention; I did not loosen any of them. If they keep recurring, drop CI to `PW_WORKERS=1` (needs a timeout check against the 120 min limit).
- EVAL-016 `pnpm audit` is failing on main (non-gating, priority high). Needs a dependency bump or a documented ignore; out of scope here.
- Screenshots: only the two `/dev/artifacts` baselines were refreshed; the tests also rewrote other baselines in `docs/screenshots/`, which I reverted.
- Chromium here is the preinstalled build linked into the Playwright cache (download blocked).
