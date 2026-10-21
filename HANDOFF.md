# HANDOFF — Portfolio (tusharpathak.com) · Stage 8 Design Critique COMPLETE → next: Stage 9 Code Review + Test & Eval Execution

Updated 2026-10-21 (evening). Previous batons (Stage 7 complete, same day; M-010 2026-10-06) are in git history of this file and in the `Portfolio-clay-redesign` worktree copy.

## 0. Where things are
- **Production = `main` of 007U5H4R/portfolio-clay, auto-deploys to Vercel → https://tusharpathak.com.** Stage 8 fixes are in **PR #152** (https://github.com/007U5H4R/portfolio-clay/pull/152, branch `m023/stage8-critique`, worktree `/Volumes/E Drive/Dev/Code/Claude/Portfolio-selector-tile`), gate green (build, tsc, eslint, unit 1670, specs), **merge pending Tushar** — the auto-mode classifier declined the squash-merge. After the merge: run the prod specs (`/Volumes/E Drive/Dev/.scratch/stage8/ship.sh`'s last two lines), move TASK-309…316 to Done, record the prod SHA here.
- **Standing autonomy:** CI/CD — ship each gated change to prod without asking (memory `cicd-autonomy-2026-10-18`); evals skipped (`skip-evals-2026-10-14`). Ship gate = build → tsc → eslint → **full unit suite** → touched Playwright specs → PR → Vercel pass → squash-merge → prod status success → prod specs.
- Heavy jobs go through `/Volumes/E Drive/Dev/.scratch/heavy-gate.sh <label> <cmd…>`. Stage 8 ship script: `/Volumes/E Drive/Dev/.scratch/stage8/ship.sh`.
- **Disk:** the E Drive was at 2.4 GB free when Stage 8 started (98 %); `.scratch` holds ~19 GB, mostly film renders (`urja-films` 4.6 GB, `bhakti-vilas-films`, `about-page`, `threejs-devtools-tmp`, `velora-films`, `nuptis-films*`, `shravan-films`). Not deleted — Tushar decides what goes. A `next build` needs ~2 GB headroom.

## 1. Stage 8 — what was done
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

## 2. Next stage — Stage 9 Code Review + Test & Eval Execution
- Invoke `bw-code-review-test-eval` (Fable 5.1 / Low per the stage table; memory `fable-reserved` says reviews run on Opus — Opus 5.5 is the practical choice). Scope: the squash commit of the Stage 8 PR (TASK-309…316) plus the Stage 7 PRs #147–#151 if not yet reviewed; run `/code-review`, execute the touched specs + full unit suite from real output, record CR-/QA- findings; evals stay skipped unless Tushar reverses `skip-evals-2026-10-14`.
- Carry-ins: DES-021 (move the selector before `#pf-panel` in the DOM / Enter → tabpanel focus — WCAG 2.4.3), DES-030 (rewrite `Design.md` §7.2 showcase paragraph against the shipped paper selector/card/player), the #147 watch item.
- Read first: global `~/.claude/CLAUDE.md`, `~/.claude/workflow/build-workflow.md`, this file, `docs/reports/DES-findings.md` (round 2), `decisions.md` EXE-57, 58 and 81, `tests/e2e/stage8-des.spec.ts`; open Campfire (`campfire` → http://127.0.0.1:6480, project portfolio-clay; board files live uncommitted in the `Portfolio-clay-redesign` worktree — memory `campfire-board-fragile`).

## 3. Rules / scars to keep
- Everything on the E Drive; `export TMPDIR="/Volumes/E Drive/Dev/.scratch/tmp" PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright"`. Plain `node` scripts that import Playwright must run with `node --input-type=module < script.mjs` from the worktree (ESM resolves from the script's folder, not cwd).
- Subagents cannot write report files under `.scratch` (hook); they hand the report back and the orchestrator saves it.
- Never regenerate/recolour/crop product logos or posters; experiments desktop-only (≥1024) behind kill-switch flags; use the ID `task create` prints; `git worktree add` with absolute paths; hooks block `rm`, force-push, `commit --amend`, `checkout --`.
- Merged worktrees awaiting cleanup (verify merged + clean, then `git worktree remove`): Portfolio-hover-jitter (m021), Portfolio-origami-off (m020), Portfolio-card-back (m019), Portfolio-bv (m017), older m013/m014 ones; `Portfolio-selector-tile` now carries `m023/stage8-critique`.
