# TKT-97 (`TASK-92`) · CopyButton timing test + legacy header metric / about ids — report

Implementer: Claude Opus 5.5 · branch `m009/tkt-97` from `f121e25` · commit `986e77d` · logs: `/Volumes/E Drive/Dev/.scratch/m009/tkt97/`.

## 1 · CopyButton "copied then idle" test (`tests/e2e/contact.spec.ts`, TC-170.1)

**Root cause.** The test clicked, then ran several slow checks (text, live region, a border-colour `expect.poll`, a `page.evaluate`), then slept a **fixed 1500 ms on the test side** before asserting `data-state="copied"`. The component's 2 s revert timer starts at the click, so any test-side latency above ~500 ms between the click and the sleep pushed the "still copied" read past 2 s, and it read `idle`. At 2 workers the host's CPU contention stretched those polls. The component was fine; the test measured the window on the wrong clock.

**Proof by fault injection** (`inject-{old,new}.log`). I added a 600 ms test-side delay before the wait in both versions. The old test failed 3/3 with `Expected: "copied" / Received: "idle"`, the same signature as INTEGRATION-ABC run A. The new test passed 3/3. Plain repeats of the old test did not reproduce the failure in isolation: 10× at 2 workers, and 20× at 2 workers with every core busy running `yes`, all passed. The original failure needed full-suite load.

**Fix.** Before the click, the test installs a capture click listener and a `MutationObserver` on `data-state`. Both log `performance.now()` inside the page. The test then waits for `idle` (timeout 5 s) and asserts against the page clock:
- the sequence is exactly `click → copied → idle` (no flicker, no skipped state)
- `copied` appears < 1500 ms after the click
- `copied` stays up for **1500–3000 ms**

This keeps the old "not before ~1.5 s, not after ~3 s" window and tightens it: the old test never bounded the upper end from the click and never checked the sequence. I rejected `page.clock`: it fakes rAF/timers page-wide (Lenis, motion), and the forest-border poll relies on a real CSS transition.

**Result:** `PW_WORKERS=2 pnpm test:e2e tests/e2e/contact.spec.ts --repeat-each=20` gave **300 passed, 0 failed** (the test ran 20/20 at w1440; `new-r20.log`). Under full CPU stress with `-g "then reverts" --repeat-each=20` at 2 workers: 20/20 (`stress-new.log`). `playwright.config.ts` is untouched (default workers stays 1). Re-trialling `workers: 2` for the whole suite is still open (the Lenis ChapterNav watch item is separate).

## 2 · Legacy case-study header metric cards + about.spec ids

| Item | Grep evidence | Action |
|---|---|---|
| `MetricCard variant="inline"` (`.metric-inline` branch) | `CaseStudyHeader.tsx` no longer imports `MetricCard` (TKT-81 moved header metrics to `MetricStrip`, `app/work/[slug]/page.tsx:163`). The only `variant="inline"` caller was `tests/unit/artifacts.test.tsx`. `ArtifactRenderer` and `Impact` use the default card. `.metric-inline` has **no CSS rule**. Design.md §7 has no inline/mini metric. The remaining hits are history in `tickets.md`/`technical-plan.md`/`decisions.md`/`backlog/` | **Removed** the prop, the branch and the doc comment. `MetricCard` now renders only the pinned index card |
| `about.spec` ids `#awards` `#research` `#education` `#about-cta` + the SITEMAP-order test | All four are **rendered**: `components/about/{Awards,Research,Education,AboutCta}.tsx` (TKT-87 paper rebuild kept the ids), mounted in `app/about/page.tsx`. They are in Design.md §7.4 ("Awards · Research · Education", "`section#about-cta`") and §3.3 rows | **Kept, unchanged.** They are live paper sections, not legacy. The tests assert current content and order and pass in the full run |

**Regression guard.** In `tests/unit/artifacts.test.tsx`, the old "inline variant" test became "renders only the pinned index card". It passes `variant="inline"` under `// @ts-expect-error`, so `pnpm typecheck` fails if someone brings the prop back without deliberately removing the guard. At runtime it asserts `[data-paper='index']` is present, `.metric-inline` is absent, and every sourced field still renders (EVAL-013).

## Gates (all under `heavy.sh`)
- `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`: exit 0. Unit: **579 passed / 2 skipped (51 files)**. Tokens: 13/13. All routes static.
- Bundle `/` first-load **158.5 kB gz** ≤ 180.
- **FULL `pnpm test:e2e` (workers 1): 1050 passed, 0 failed, 1274 skipped (17.3 m)**, exit 0 (`e2e-full.log`).
- `tests/e2e/eval-018-parked.json` = `[]`.
- Churned `docs/screenshots/**` restored. Temporary `tests/e2e/zz*.spec.ts` baseline and injection copies were deleted and never committed.

## Files
`tests/e2e/contact.spec.ts`, `components/case-study/artifacts/MetricCard.tsx`, `tests/unit/artifacts.test.tsx`, this report. No shared files (globals.css, layout, config, hero, docs/HANDOFF) touched.

## Not done / notes
- Campfire `TASK-92` status was not moved from this worktree, because backlog files belong to TKT-91 (docs owner). The orchestrator should move it to Done at merge.
