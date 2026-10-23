# HANDOFF — Portfolio · 2026-10-23 SHIPPED

- **TASK-359 Awards redesign:** shipped (PR #181 → d0b33454).
- **TASK-170 guided tour:** shipped (PR #182).
- **TASK-360 Origami Bloom** phone splash: shipped (PR #183 → f040de93).
- **TASK-361 tour glass restyle:** shipped (PR #184 → cdc1e460); blurred spotlight + frosted-glass notes; verified on prod w1440/w390, light/dark.
- **Offered, unanswered follow-ups:** tour polish nits, splash gaps, `next dev` crash, analytics.spec.ts:88 at w390 (fails on prod too).
- **CI/CD autonomy re-granted 2026-10-23:** ship each gated change to prod without asking. See [[cicd-autonomy-2026-10-18]].

---

# HANDOFF — Portfolio (tusharpathak.com) · Stage 12 continuous loop · wave 3 (2026-10-22) SHIPPED

Updated 2026-10-22. Production = main `92d08750`. Previous batons follow below.

## Wave 3 — 2026-10-22 — shipped (all squash-merged, prod verified)
| PR | Tickets | What |
|---|---|---|
| #173 | TASK-350 | Home EVAL-018 header-decoration count now waits for MediaGate hydration before counting (fixed the flake) |
| #174 | TASK-353/354 | Velora product description rewritten to say what it does; every product card switches 2-line ↔ 3-line description by available space (`@container pcard`, 445 px breakpoint) |
| #175 | TASK-351 | CSS pass 2: removed 128 unused rules + 1 keyframe, moved 58 more route-only rules out of `globals.css` into `app/styles/*.css`; 0 visual diff across 10 routes × 3 widths × 2 themes |

Each gated on its merged head (build, tsc, eslint, full vitest 1691 passed/2 skipped, touched Playwright specs) before merging, not trusted from a pre-merge report. #174's new Velora copy staled 5 Tushky FAQ answers (who-is-tushar, products-built, product-thinking, velora, assumption-failed) — verified against the new wording and re-stamped, not dismissed as pre-existing. #175 was authored before #174 merged and both touched `app/styles/projects.css`; merged `origin/main` into the PR branch and re-ran the full gate on the merged head before merging.

**TASK-206 closed as obsolete** (no PR): the EVAL-033 real-site tilt test's suspected 0-px flake at w390 doesn't reproduce — it passed cleanly at both widths in the last completed main CI run (2026-10-21). TASK-173's poll-for-end-state fix already covers it. The drafted (never-committed) fix is saved at `/Volumes/E Drive/Dev/.scratch/task-206-eval033-uncommitted.patch` if the race resurfaces.

**Worktree cleanup:** removed 15 merged lane worktrees + branches (casestudy, deps, design, logo, ogalert, paint, selector, taborder, tests, flake, velora, css2, selector-tile, campfire, tilt-test) plus the old non-git `portfolio/` folder. E Drive 98% → 77% full (27 GB free). **Only `Portfolio-clay` (main) and `Portfolio-clay-redesign` (Campfire board) remain as worktrees** — the stale cleanup list below (§3) is superseded.

**New lesson:** `git merge-base --is-ancestor <branch> origin/main` reports "not merged" for a squash-merged branch — it checks real ancestry, which squash merges deliberately break. Confirm merge status with `gh pr view <n> --json state,mergedAt` instead.

## Open (carried into next session)
- CI signal is currently unreliable: the eval workflow's last *completed* run on main (2026-10-21) had 184 failures, mostly at the 390 px width across unrelated specs; every run since has been cancelled by a newer push. Evals are already skipped as a ship gate, but a 184-failure baseline means CI itself isn't a usable safety net right now — worth its own investigation ticket.
- Human items (LinkedIn unfurl, Vercel error-notification settings) and most of the design-call backlog (DES-020…029 etc.) were already resolved per the previous baton below; TASK-350/351 (listed as open in the previous baton) are now shipped via #173/#175 above.

## Wave 2026-10-21/22 — shipped (all squash-merged, prod verified 200 on / /projects /about /work/teachspark)
| PR | Tickets | What |
|---|---|---|
| #158–#166 | 319, 321–325, 329, 331–341 | test debt, next 16.3.8/sharp, /projects OG + prod-watch, design wave (DES-020…029), Slag City one-line logo, tab order, origami selector |
| #167 | 320 | route CSS split (`app/styles/*.css` imported per page); home CSS 92→56 kB gz. Production LH 13.5.0 mobile devtools-throttling, 3 runs: `/` LCP 2382 [2368–2636] ms, TBT 227; `/projects` 2429 [2352–2440] ms, TBT 660 — under 2.5 s median |
| #168 | 345 | About decor right-sized, paper-fibers rastered; raster time ~½ |
| #171 | 343, 344 | enterprise card hover held while scrolling; ridge drift on `<g class="torn-drift">` wrappers |
| #169 | 346–349 | arrow nudges, card gaps (actions anchored 15 px from bottom), selector fade, focus ring |
| #170 | 342 | WebKit filters → box-shadows / `.torn-shade` copies (inside `torn-drift-back`) / baked map shadow; WebKit scroll p50 38–130 → 33–35 ms. /about card shadows now follow a rectangle (0.3–0.5 % px) |

## Open (superseded — kept for history; see "Open (carried into next session)" above for the current list)
- ~~TASK-350 (P3): home EVAL-018 header count races MediaGate hydration (2/15 in mixed runs).~~ Shipped via #173.
- ~~CSS pass 2 (not ticketed): ~153 rules (~19 kB) with no source usage; ~110 kB shared primitives left in globals.css.~~ Shipped via #175 (TASK-351).
- ~~Human: LinkedIn unfurl of /projects; Vercel error-notification settings.~~ Done 2026-10-22 per memory.
- ~~Lane worktrees `Portfolio-lane-{csssplit,safari,chromescroll,aboutimg,polish}` are merged — remove after checking clean.~~ Removed, along with every other lane worktree — see wave 3 above.
- Lessons: Playwright wipes `test-results/` (keep evidence elsewhere); lanes that share a component (TornEdge) must merge in sequence and re-verify the combination.

## 12. Stage 12 — what was done
- **RCA1 · QA-013** (narrow-card query fired at 1440): permanent case `stage8-des.spec.ts` "RCA1" at 1440/1512/1920 × light/dark — secondary labels + category visible, CTA reads "Watch demo video".
- **RCA2 · TASK-320 reclassified P1 → P2.** The 5.4 / 6.4 s mobile LCP was Lighthouse's *simulated* throttling on a contended host. Idle host, applied throttling: `/` 2.76 s, `/projects` 2.65 s, **LCP = FCP** (the hero paints in the first frame); Chrome trace at 4× CPU: bg image loaded ≈ 0.9 s, LCP 1.5–1.7 s. Remaining miss ≈ 0.2 s, set by first paint (94 kB render-blocking stylesheet + two woff2 fonts). Guard `tests/e2e/lcp-hero.spec.ts` (20/20 on production, negative control fails as intended). Addendum `evals/reports/eval-report-2026-10-21-stage12-lcp.md`. **Rule from now on:** EVAL-005 numbers name their throttling method; act on a miss only after an applied-throttling idle-host run.
- **RCA3 · Tushky coverage:** `tests/unit/tushky-product-coverage.test.ts` — every listed product must answer "Tell me about <name>." (10/10).
- **#147 prod-spec watch item:** no recurrence in any production run today (89, 71, 149, 71 and the Stage 12 runs) — closed.
- **CI on main:** first non-cancelled runs are 6245ac1d (in progress at writing) and 3c94774b (queued) — record their outcome at the next session start (`gh run list --workflow eval.yml --branch main`).
- `decisions.md` RCA1–RCA3; `lesson-learnt.md` L-09 (simulated vs applied throttling), L-10 (negative controls for regression cases); `QA-report.md` U2-14 updated.

## Next — the open backlog (Campfire, project portfolio-clay)
| Ticket | What | Priority |
|---|---|---|
| TASK-320 | mobile first paint ≈ 0.2 s over the 2.5 s budget: render-blocking CSS split / critical CSS, font subsetting or `font-display`; measure with applied throttling | P2 |
| TASK-325 | `next` 16.3.6 → ≥ 16.3.8, `sharp` ≥ 0.35.5 (advisories; exposure mitigated) | P2 |
| TASK-329 | production alerting (Tushar's Vercel notification settings) | P2 |
| TASK-321 | `case-study-system.spec` vs the six paper case-study layouts (24 tests) | P2 |
| TASK-319 / 322 / 323 / 324 | EVAL-020 named colours · scene-opener phone expectation · contact stamp nudge · About fingerprint snapshot | P3 |
| — | DES-020, 022–029 design calls; DES-021 focus order; DES-030 Design.md §7.2; live OG unfurl (human); Tushky option 2 (RAG, deferred) | Tushar |
- Read first next time: global `~/.claude/CLAUDE.md`, this file, `lesson-learnt.md`, `QA-report.md` (top section); open Campfire.

## 0. Where things are
- **Production = `main` of 007U5H4R/portfolio-clay, auto-deploys to Vercel → https://tusharpathak.com.** Stage 8 fixes are in **PR #152** (https://github.com/007U5H4R/portfolio-clay/pull/152, branch `m023/stage8-critique`, worktree `/Volumes/E Drive/Dev/Code/Claude/Portfolio-selector-tile`), **squash-merged 2026-10-21 → production `19e23389`**, prod specs 89 passed (stage8-des, paper-selector, paper-card, vertical-carousel, hover-stability, paper-player, projects-mobile, projects-carousel). TASK-309…316 Done. Campfire's Workflow view now follows the HANDOFF title (fork commit 42c8c4c1, pushed). Follow-up content ticket **TASK-317** (Tushky FAQ entries for the products without one) is in progress on `m024/tushky-products`.
- **Standing autonomy:** CI/CD — ship each gated change to prod without asking (memory `cicd-autonomy-2026-10-18`); evals skipped (`skip-evals-2026-10-14`). Ship gate = build → tsc → eslint → **full unit suite** → touched Playwright specs → PR → Vercel pass → squash-merge → prod status success → prod specs.
- Heavy jobs go through `/Volumes/E Drive/Dev/.scratch/heavy-gate.sh <label> <cmd…>`. Stage 8 ship script: `/Volumes/E Drive/Dev/.scratch/stage8/ship.sh`.
- **Disk:** the E Drive was at 2.4 GB free when Stage 8 started (98 %); as of wave 3 (2026-10-22), after removing 15 merged worktrees + the old `portfolio/` folder, it's at **27 GB free (77 % used)**. `.scratch` film renders (`urja-films`, `bhakti-vilas-films`, etc.) weren't touched — Tushar decides what goes there.

## 8. Stage 8 — what was done (previous stage)
- Two Opus reviewers drove **production** 236fb4ef: desktop 1280/1440/1512/1920 light + dark; tablet 768, phone 375/390, the 1024 edge, link-preview tags. Reports + ~130 screenshots: `/Volumes/E Drive/Dev/.scratch/stage8/{desktop,mobile}/REPORT.md`.
- Findings **DES-012 … DES-030** are recorded in `docs/reports/DES-findings.md` (round-2 section) with evidence; decision **EXE-81** in `decisions.md`.
- **Fixed, one Campfire ticket + one commit each (all on `m023/stage8-critique`, regression spec `tests/e2e/stage8-des.spec.ts`):**

| Ticket | DES | Fix |
|---|---|---|
| TASK-309 | 012 | selector arrow keeps only its base on the tile border; tile right padding 10→6; <1280 name 11.5 px + art floor 52 px — no name truncates, arrow never touches the name |
| TASK-310 | 013 | `--pc-accent-ink`, `--pc-cta`, `--pc-cta-hover`, darker `--ps2-accent` — every flagged text ≥ 4.5:1 both themes |
| TASK-311 | 014 | `@container pcard (max-width: 300px)`: icon-row secondaries (labels sr-only), wrapping pills, no kicker category, CTA " video" tail dropped, poster cap 26 % — nothing leaves the card at 1024–1279 |
| TASK-312 | 015 | phone "Watch demo" scrolls the stage below the fixed header |
| TASK-313 | 016 | poster kept over the iframe while loading + "Loading video…" cue |
| TASK-314 | 017 | paper card kicker shows one tag |
| TASK-315 | 018 | `.pp-watch` invisible 44 px hit ring |
| TASK-316 | 019 | tablet tile names/categories wrap to 2 lines |

- **Parked for Tushar (not fixed, reasons in DES-findings):** DES-020 micro-label sizes below 14 px (pills 9–11.5, counter 9.5–12.5, kicker 10.5–13); DES-022 description hidden at 1280×800 by the height query; DES-023 auto-play on arrow keys / under reduced motion; DES-024 three navigation systems; DES-025 selector origami fidelity vs the reference; DES-026 1920 scale; DES-027 tile art width (EXE-58); DES-028 poster title chip over painted titles at 1024–1180; DES-029 OG small line.
- **PR #147 prod-spec failure:** not reproducible — the same three specs pass 34/34 on prod today, no artifact survived. Watch item for Stage 9 (capture the spec name before rerunning if it recurs).
- **Web-deliverables gates:** responsive PASS (no horizontal scroll 375–1920, both themes; phone nav usable; targets ≥ 44 px); screen states PASS after DES-016; link preview PASS on tags + asset (1200×630, 164 kB), **live unfurl BLOCKED** (LinkedIn Post Inspector / opengraph.xyz need a human) — Stage 11 carry.

## 8b. (superseded) Stage 9 brief as written at the Stage 8 handoff
- Invoke `bw-code-review-test-eval` (Fable 5.1 / Low per the stage table; memory `fable-reserved` says reviews run on Opus — Opus 5.5 is the practical choice). Scope: the squash commit of the Stage 8 PR (TASK-309…316) plus the Stage 7 PRs #147–#151 if not yet reviewed; run `/code-review`, execute the touched specs + full unit suite from real output, record CR-/QA- findings; evals stay skipped unless Tushar reverses `skip-evals-2026-10-14`.
- Carry-ins: DES-021 (move the selector before `#pf-panel` in the DOM / Enter → tabpanel focus — WCAG 2.4.3), DES-030 (rewrite `Design.md` §7.2 showcase paragraph against the shipped paper selector/card/player), the #147 watch item.
- Read first: global `~/.claude/CLAUDE.md`, `~/.claude/workflow/build-workflow.md`, this file, `docs/reports/DES-findings.md` (round 2), `decisions.md` EXE-57, 58 and 81, `tests/e2e/stage8-des.spec.ts`; open Campfire (`campfire` → http://127.0.0.1:6480, project portfolio-clay; board files live uncommitted in the `Portfolio-clay-redesign` worktree — memory `campfire-board-fragile`).

## 3. Rules / scars to keep
- Everything on the E Drive; `export TMPDIR="/Volumes/E Drive/Dev/.scratch/tmp" PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright"`. Plain `node` scripts that import Playwright must run with `node --input-type=module < script.mjs` from the worktree (ESM resolves from the script's folder, not cwd).
- Subagents cannot write report files under `.scratch` (hook); they hand the report back and the orchestrator saves it.
- Never regenerate/recolour/crop product logos or posters; experiments desktop-only (≥1024) behind kill-switch flags; use the ID `task create` prints; `git worktree add` with absolute paths; hooks block `rm`, force-push, `commit --amend`, `checkout --`.
- ~~Merged worktrees awaiting cleanup...~~ Superseded 2026-10-22: all of those plus every later lane worktree (casestudy, deps, design, logo, ogalert, paint, selector, taborder, tests, flake, velora, css2, selector-tile, campfire, tilt-test) were removed in wave 3. Only `Portfolio-clay` (main) and `Portfolio-clay-redesign` (Campfire board worktree) remain.
