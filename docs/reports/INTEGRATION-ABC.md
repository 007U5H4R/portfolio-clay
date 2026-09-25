# Integration pass: Phase A/B/C fan-out (post-merge fixes + full gate)

Branch `m009/integration-ab` · worktree `Portfolio-m009-integration` · implementer Claude Opus 5.5 (1M context) · brief `docs/briefs/INTEGRATION-ABC.md` · authority EXE-20 (delegated; decisions recorded below). Nothing was pushed and `main` was not touched.

## 1 · Fixes applied

| # | Fix | Commit | Files |
|---|---|---|---|
| 1 | Shared `.hand-cite` changed from 13 px to 14 px in the TSK-34 content-paper block (EVAL-008 content floor). The TKT-84 essay override stays and its comment is updated | `4dce47f` | `app/globals.css` |
| 2 | `case-study.spec.ts`: after "Deep dive", the five deep-dive tests now call `expectChapterNav()`, which expects count 0 below 1024 and visible at 1024 and up (Dev-09 / TP14 `MediaGate`). The 1440-only toggle test is unchanged | `06aaed7` | `tests/e2e/case-study.spec.ts` |
| 3 | `app/page.tsx`: dropped the unused `tone:` field and replaced the stale TKT-12 comment above `<FeaturedWork/>`. `ProjectCard.tsx` no longer mentions `EditorialGrid`: TKT-75 had already rewritten it, so no edit was needed. `WorkIndex.tsx`'s "replaces the M-008 `EditorialGrid`" line is accurate history and stays | `52bd47b` | `app/page.tsx` |
| 4 | EVAL-015 view transitions: **already consistent, no code change.** No `icon-{slug}` view-transition name remains anywhere in `app/ components/ lib/ tests/`. `CaseStudyHeader`'s h1, `ProjectCard`, `WorkIndex` and `NextProject` all use `project-{slug}` only. `eval-015.spec.ts` passed in the targeted run and in both full runs | none | none |
| 5 | Design.md §11: rows Dev-25 to Dev-37 added, and §3.3 now shows actual counts (details below) | `86054cc` | `Design.md` |
| 6 | **Found by the full run.** EVAL-008 deep-dive overflow sweep (12 failures at w390/w768): the test waited for `nav[aria-label="Chapters"]`, which by design does not exist below 1024, so it timed out after 30 s. **It was not a real overflow.** The test now waits for `section#deep section.chapter`, plus the nav at 1024 and up. The overflow assertion itself is unchanged, and it passes on all six deep-dive studies at every width | `8ee1f87` | `tests/e2e/eval-008.spec.ts` |
| 7 | **Found by the full run.** EVAL-008 text floor on `/` and `/about` (8 failures, every width). Fixed by the floor rule, never by editing the test. **Content lines raised to 14 px:** `.ask-microcopy`, `.ask-pill`, `.work-metric-asof`, `.hit-pill`, `.xp-co small`, `.story-src`, `.proof-ids`, `.proof-doi`, `.proof-disclaimer`, `.acta-colophon`. **Labels given `data-micro-label` at 12 px** (≥ 4.5:1 contrast is still checked by the test): `.work-kicker` in `ProjectCard` (`WorkIndex` already had it), the `.proof-eyebrow` rows (Awards, Research, Education), the `.xp-eyebrow`, and the `StoryCard` `dt` and `.story-kind`. The last two were also raised from 11 px to 12 px | `d3665fb` | `app/globals.css`, `components/projects/ProjectCard.tsx`, `components/about/{Awards,Education,Research}.tsx`, `components/timeline/{ExperienceTimeline,StoryCard}.tsx` |
| 8 | **Found by run A, reproduced 1 in 3 at 1 worker.** `work.spec` "filter row scrolls horizontally at 390": the static Suspense fallback tablist (`FilterTabsFallback`, TP7) is sometimes swapped for the hydrated `FilterTabs` between locator resolution and `evaluate`. The detached node then measures 0 × 0 (probe: `sw 0 / cw 0`, and `424 / 342` once hydrated). The test now polls until the live row is measured. Same assertion; 10/10 green after the change | `a1e3e09` | `tests/e2e/work.spec.ts` |
| 9 | Workers trial, then workers kept at 1 (see §3) | `ff806f5` → `54940f7` | `playwright.config.ts` |

No test was skipped or deleted, and no threshold was changed.

## 2 · Design.md §11 rows added (all "Stage-7 default (delegated, EXE-20)")

- Dev-25: TKT-75 metric pick by §7.1 label (not "measured only"), with the kind and as-of shown.
- Dev-26: TKT-81 has no taped header photo or caption. The header unit is 1, not 2.
- Dev-27: type floors, from TKT-81/82/86, TSK-45 and this pass. Labels, kickers and eyebrows use 12 px micro labels; content text is 14 px.
- Dev-28 to Dev-32: the five TKT-83 rows. Long quotes are set in Fraunces. Contrast corrections (TKT-80/82/86 corrections are folded into the same row). Medallion numerals. 44 px chapter-nav rows. Pseudo-element label pin.
- Dev-33: TKT-84 has no scene photos on `/thinking` or essays (opener 2, essay 1), and the margin is a plain `div`.
- Dev-34: TKT-86 AC5 has no hero image or 4:3 photo. Also covers the `#journey` id and the hero padding.
- Dev-35: TKT-87 patent stamp reads "TP", and award years are terracotta.
- Dev-36: TSK-45 tilts are held to ±0.9°, the Tegaki numeral is navy-2, the poke arrow points right, and the caption chip is kept.
- Dev-37: TSK-46 has no taped portrait (the caption becomes the banner caption). The GitHub postcard row is kept (S5), the location flag is off, and the action numerals are `aria-hidden`.

§3.3 now shows the actuals: `/work/[slug]` header 2 → 1, `/thinking` opener 3 → 2, and `/thinking/[slug]` essay 2 → 1. The `/contact` opener stays at 3 without the portrait.

## 3 · Full gate at `ff806f5` (one locked run: `.scratch/m009/integ/full.sh`)

| Step | Result |
|---|---|
| typecheck · lint · tokens:check | exit 0 · exit 0 · 13/13 |
| unit (vitest) | 54 files passed, 1 skipped; **567 passed**, 2 skipped |
| build | exit 0, **all routes static (13)** |
| e2e run A (workers 2, fresh prod server) | **921 passed · 2 failed** · 1021 skipped (per-width `test.skip` by design) · 12.9 min (776 s wall). Failures: `work.spec:285` filter row at w390 (fix 8), and `contact.spec:164` CopyButton "Copied → idle" at w1440 (`data-state` was already `idle` after a `waitForTimeout(1500)` that ran behind slow polls under load) |
| e2e run B (workers 2) | **923 passed · 0 failed** · 1021 skipped · 11.3 min (682 s wall) |
| e2e inside `pnpm eval` (third full run) | `playwrightUnexpected: []` |
| **Workers decision** | **Default reverted to 1.** CopyButton failed at 2 workers and passed 3/3 at `PW_WORKERS=1` (targeted `--repeat-each 3`), which is exactly the brief's revert rule. The filter-row failure also reproduced at 1 worker, so it was a real race and is fixed (fix 8). `PW_WORKERS=2` stays available as an opt-in (≈ 11–13 min vs. ≈ 16 min for the pre-fix run 1) |
| Run 1 (before fixes 6 and 7, at `86054cc`, workers 2) | 903 passed · 20 failed · 16.4 min. These are the 12 deep-dive and 8 text-floor failures fixed above. The orchestrator's relayed report of the same 20 failures matches |
| ChapterNav click → no scroll at w1024 (TKT-83 note, TKT-94) | **Did not reproduce** in run 1, run A, run B or the eval run. Candidate root cause if it returns: Lenis's `limit` is cached behind a 250 ms debounced ResizeObserver, so right after "Deep dive" grows the page, `scrollTo` can clamp to the old limit. The fix would be to call `lenis.resize()` before `scrollTo` in `lib/smooth-scroll.ts`. **Not applied**, because nothing reproduced it |
| EVAL-007/010/015/018 | PASS on every route (eval run and both full runs) |
| `tests/e2e/eval-018-parked.json` | `[]` |

### Eval: `pnpm eval --label integration-abc-ff806f5` (full, 19 min)
`evals/results/integration-abc-ff806f5.json`: **16 pass · 2 fail · 0 skip · 4 manual (of 22)**, with no critical failures. Provenance: commit `ff806f5`, `dirty: true` (the untracked brief plus screenshot churn at the time).
- EVAL-004 FAIL (informational: local swiftshader Lighthouse). Mobile scores: `/` 74, `/work` 78, `/work/teachspark` 82. Desktop is 99. The recorded regression vs. baseline (`/` mobile 96 → 74) is the same swiftshader artifact. The preview is the real gate (EXE-17 / TKT-92).
- EVAL-005 FAIL (informational on local LCP 4070 ms). The bundle part passes: 158.6 kB gz ≤ 180, CLS 0.032.
- EVAL-008 went from FAIL to PASS against the previous result.

### Bundle budget (first-load JS, gz, budget 180 kB)
| Route | kB gz | Verdict |
|---|---|---|
| `/` | **158.6** | pass (this is the EVAL-005 gate route) |
| `/about` | **153.5** | pass |
| `/work` | **203.2** | **over by 23.2 kB**. `WorkIndex`'s `motion/react` (`LazyMotion` + `AnimatePresence` for the filter crossfade) adds 3 route-only chunks, about 51 kB gz. The M-008 `EditorialGrid` already used the same motion stack, so this is not introduced by this pass. EVAL-005 budgets `/` only, so no gate fails, but EV6's "≤ 180 kB" intent is not met on `/work` |

## 4 · Remaining issues

| Issue | Owner |
|---|---|
| `/work` first-load JS is 203.2 kB, over 180. Options: a CSS-only opacity crossfade for the filter (drop `motion` from `/work`), or lazy-load the crossfade after the first filter click | **TKT-89** (cleanup), gated in **TKT-90** |
| `contact.spec` CopyButton revert test is timing-fragile under load (`waitForTimeout(1500)` after slow polls). Harden it by asserting `copied` at ≤ ~1.5 s from the click timestamp, then `idle` by ~3 s. Once hardened, re-trial `workers: 2` | **TKT-90** (QA) |
| Intermittent ChapterNav click → no scroll (Lenis stale `limit`): not seen in 4 full runs. Candidate fix: `lenis.resize()` in `scrollToTarget` | **TKT-90** (watch), TKT-94 owner code |
| Case-study header still uses the legacy inline `MetricCard variant="inline"` (TKT-83 note d) | **TKT-89** |
| `about.spec` still covers legacy Awards/Research/Education/CTA ids (TKT-86 note); still green | **TKT-89** |
| Stage-8 visual items from the merge notes: TKT-76 torn edge overlapping Featured (z-index), TSK-45 plain-paper strip, TSK-46 arrow override < 900 and postcard email wrap at 390, TKT-84 vs TSK-46 caption alignment | **Stage 8** |
| Local perf (EVAL-004/005 LCP) is informational. The preview measurement is the gate | **TKT-85** (Phase B gate) / TKT-92 follow-up |
| Home assembly (Reveal stays **off** on home sections per orchestrator; TKT-79 measured Tab-order/axe breakage) | **TKT-79** |

**Lock note:** the brief said no other agents were running, but TKT-79, TKT-85, TKT-89, TKT-90a and TKT-92r2 held `heavy.sh` in turn during this pass. Nothing collided (the lock serialised everything). It only added wait time.

## Commits (on `m009/integration-ab`, after `2da9c1b`)
`4dce47f` · `06aaed7` · `52bd47b` · `86054cc` · `8ee1f87` · `d3665fb` · `ff806f5` · `a1e3e09` · `54940f7` · this report (with `evals/results/integration-abc-ff806f5.json`).
