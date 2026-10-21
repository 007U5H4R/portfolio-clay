# Lessons learnt — Portfolio (tusharpathak.com)

Written at Stage 11 of the build workflow. Each entry: **Situation → Decision → Outcome → Lesson → Future rule.** Evidence lives in the linked reports; this file keeps only what should change how the next round is run.

---

## Round 2026-10-21 · M-011 product showcase + Tushky FAQ (PRs #147–#155, production `6245ac1d`)

Stages 7–11 ran in one day, Stages 9–11 with Tushar AFK under an explicit straight-through authorisation. Reports: `docs/reports/DES-findings.md` (round 2), `docs/reports/stage9-review.md` (round 2), `QA-report.md` (top section), `evals/reports/eval-report-2026-10-21-m011-showcase.md`.

### L-01 · A size-container query measures the content box, not the card
- **Situation.** Stage 8 fixed the paper card overflowing at 1024–1279 px with `@container pcard (max-width: 300px)`, sized from the card's outer width (~250 px at 1024, 327 px at 1440).
- **Decision.** Ship it behind the Stage 8 spec, which checked 1024–1280 only.
- **Outcome.** The query evaluates the card's *content* box — 299 px at a 1440 viewport — so the icon-only action row and hidden category also applied at 1440. The approved 1440 card lost its secondary labels in production for ~4 hours. Stage 9's scoped e2e caught it (portfolio-video, paper-showcase, stage8-des); fixed at 280 px (QA-013, PR #154).
- **Lesson.** A threshold chosen from outer widths silently moves when the container has padding; a spec that only covers the band you meant to change cannot see the band you broke.
- **Future rule.** For any container or media query, measure the container's content box at the edge widths *and* at the next wider named width (1440), and add an assertion at that wider width that the unchanged layout is unchanged.

### L-02 · Hunk-splitting commits with `-U0` corrupts the index
- **Situation.** One ticket per commit was required, but the eight Stage 8 fixes shared files, so commits were split hunk by hunk with `git apply --cached --unidiff-zero` from a `-U0` diff.
- **Outcome.** Moved blocks re-applied at the wrong offsets; the tree no longer matched the verified build. Caught only because the script ended with `git status`.
- **Lesson.** Zero-context patches have no anchor for moved code.
- **Future rule.** Split with `-U3` + `git apply --cached --recount`, and make the script assert *working tree == HEAD* after the last commit before anything is pushed.

### L-03 · The full e2e suite is a ten-hour run on this host
- **Situation.** Stage 9 asked for the planned suite; the full Playwright run is 6,404 tests over four viewport projects and ran at ~10 tests/min at one worker.
- **Decision.** Stop it; run w1440 + w390 at two workers without eval/screenshot specs; re-run every failure at one worker; run the same specs against production main to separate pre-existing failures from branch regressions.
- **Outcome.** 41 failures classified in ~1 hour: 1 real regression (L-01), spec debt, 31 failures identical on main (TASK-321…324), and host contention.
- **Future rule.** The Stage 9 run is *scoped + failure re-run at 1 worker + same specs on production main*; never declare a failure a regression until it is absent on main.

### L-04 · CI never produced a green signal on main for this round
- **Situation.** `.github/workflows/eval.yml` runs on every push to main with `concurrency: cancel-in-progress: true`; a run takes ~25–30 min.
- **Outcome.** Releases landed faster than CI finished: every main run from #149 to #154 was **cancelled** by the next push (the three before that failed on the 22 unit tests TASK-307 fixed). Production was verified by the local ship gate and production specs, but the repo's own CI said nothing for a day.
- **Lesson.** `cancel-in-progress` on the default branch trades the release record for speed; a fast release cadence turns CI into noise nobody reads.
- **Future rule.** On `main`, don't cancel in-progress runs (keep it for PR refs), or require the previous main run to finish before the next merge; treat "no completed run on the release commit" as a failed gate.

### L-05 · Stage 8 evidence must come from the place it ships
- **Situation.** The loading-poster fix (DES-016) was verified on `/projects` only.
- **Outcome.** `ProductMediaPlayer` mounts in seven places; the new wrapper broke the case-study cover sizing on `/work/teachspark` (158 px wide in a 528 px screen). The code review flagged the blast radius, a production probe confirmed it, Stage 9 fixed it (CR-011).
- **Future rule.** Before shipping a change to a shared component, `grep` its mount points and verify each distinct one, not just the screen that asked for it.

### L-06 · Tests that read pixels need a settled page
- **Situation.** The hover-stability guard sampled `getBoundingClientRect()` right after `scrollIntoViewIfNeeded()`; the phone scroll measured the stage with a bounding rect during its entrance transform.
- **Outcome.** Intermittent failures with no product defect (CR-014) and a scroll that landed above the stage (TASK-312's first cut).
- **Future rule.** Wait for transforms and smooth scroll to settle (poll a stable rect) before any geometric assertion; measure layout position via the offset chain, never a rect read mid-animation.

### L-07 · A deterministic assistant only knows what was written for it
- **Situation.** "Tell me about Slag City" hit Tushky's fallback; only three of ten products had their own FAQ entry.
- **Decision.** Option 1 — six sourced entries from each project's own facts, reviewed by Tushar (TASK-317). Option 2 (wire the RAG provider) deferred.
- **Outcome.** Fixed in production in one cycle; the review then found the added synonym rows were inert because the FAQ path never consults them (CR-010).
- **Future rule.** Every product added to `data/projects.ts` gets a "Tell me about X" FAQ entry in the same change; a coverage test should list products without one.

### L-08 · Tooling facts for this machine (cost a round-trip each)
- `/security-review` needs a git repo as the session cwd; this session's cwd is not one — delegate the review to an agent with the diff.
- Subagents cannot write files under `.scratch` (a hook blocks it); ask them to hand the report back.
- `node script.mjs` in `.scratch` cannot resolve `@playwright/test`; run `node --input-type=module < script.mjs` from the worktree.
- Lighthouse's `--user-data-dir` on the E Drive path broke the Chrome launch; the default temp profile works.
- The keyless PageSpeed Insights API hits its daily quota quickly; use Vercel Speed Insights for field data.
- zsh passes `$VAR` holding several paths as one word — inline spec lists or use arrays.

### L-09 · Lighthouse's simulated throttling can report a page 2–3× slower than it is
- **Situation.** Stage 9 recorded mobile LCP 5.4 s / 6.4 s (Lighthouse default `simulate`, contended host) and filed it as a P1.
- **Decision (Stage 12).** Re-measure on an idle host with applied throttling and a real Chrome trace before touching the hero.
- **Outcome.** 2.65–2.76 s with LCP = FCP; the hero paints in the first frame (RCA2). The P1 became a P2 first-paint optimization; no visual identity was sacrificed for a modelled number.
- **Lesson.** The simulated model schedules a heavy render-blocking stylesheet and style work ahead of the paint; on CSS-heavy pages it is pessimistic, and on a busy host it is noise on top of that.
- **Future rule.** Report Lighthouse numbers with their throttling method; act on a budget miss only after an applied-throttling run on an idle host (3+ runs) and a trace that names the phase (TTFB / load delay / load / render delay).

### L-10 · A regression guard must fail when the bug is put back
- **Situation.** The first negative control for the LCP guard injected the "gate" at DOMContentLoaded — after the image had already painted — and the guard passed.
- **Outcome.** Re-injected into the served HTML, the gated hero painted 2.6 s after FCP and the guard failed as intended.
- **Future rule.** Every new regression case gets a negative control that reintroduces the defect at the layer it lives in (HTML/CSS before first paint, not a late script), and the control must fail before the case is trusted.

---

## Reusable Rules for Future Projects

1. **Container/media queries:** measure the content box at the boundary widths and assert the next wider named width is unchanged (L-01).
2. **Shared components:** verify every distinct mount point of a changed component before shipping (L-05).
3. **Per-ticket commits:** split with context diffs and assert tree == HEAD afterwards (L-02).
4. **Stage 9 on large suites:** scoped run → 1-worker re-run of failures → same specs on production main → classify (L-03).
5. **CI on the release branch:** never cancel in-progress main runs; a release commit without a completed CI run is a failed gate (L-04).
6. **Geometry in tests:** settle before measuring (L-06).
7. **Content-backed assistants:** coverage test from the source-of-truth list (L-07).
8. **Performance numbers:** name the throttling method; confirm a miss with applied throttling on an idle host and a phase trace before fixing (L-09).
9. **Regression cases:** prove each one with a negative control that reintroduces the defect where it lives (L-10).

## Candidate Global CLAUDE.md Improvements

| Suggestion | Evidence | Scope | Recommendation |
|---|---|---|---|
| Add to "Prove it against reality": *"When a change touches a shared component, verify each place it mounts, not only the screen that asked for it."* | L-05: the loading wrapper broke case-study players while the showcase looked right | Generalizable | Adopt |
| Add to "Machine Constraints": *"`/security-review` and `/code-review` need the repo as the session cwd; delegate with the diff when it isn't."* | L-08: Stage 10 could not run the command | Generalizable to multi-worktree setups | Adopt |
| Add to "Every bug ends in a scar": *"A CI pipeline whose runs on main are all cancelled or failing is not a gate; check the last completed main run before calling a release verified."* | L-04: a day of releases with no completed CI run | Generalizable | Adopt |
| A rule about container-query thresholds | L-01 | Project/front-end specific | Keep in this file and in the t-design/web skills, not the global file |

Not applied — the global `CLAUDE.md` is Tushar's to edit.
