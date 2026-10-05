# HANDOFF — Portfolio (M-010 · Paper-cut system, dark mode and delight features)

Updated 2026-10-05 night. Main worktree `Portfolio-clay-redesign`, branch `m-009-redesign`. **Production FROZEN: preview only** (S26). **Tushar delegated all M-010 decisions, stage sign-offs and style gates to Claude (EXE-26)**: decide, record each call as an `EXE-` decision with evidence, keep going. The production release is NOT delegated. **Agents run on Sonnet (builds) / Opus (reviews, gates). Never use Fable** (Tushar reserves it; memory `fable-reserved`).

## 0. State at 2026-10-05 ~22:30 IST (check these first)
- **Preview is current:** `m-009-redesign` pushed at `0cfe3f2` (T1 paper-cut hero merged, Tushar's PR #12 testimonials + #13 merged in, EXE-28…31). Done: TASK-136/137/138/140/147/148. Bhakti screens ticket renumbered TASK-137 → **TASK-148** (duplicate id; EXE-29).
- **Heavy jobs:** every `next build` / Playwright run goes through `/Volumes/E Drive/Dev/.scratch/heavy-gate.sh <label> zsh -c '<cmd>'` (EXE-30; regression test `heavy-gate.test.sh`).
- **T2 (TASK-141.1–.7)** local Sonnet agent in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m010-t2-dark` (branch `m010/t2-dark`, port 3321; brief `/Volumes/E Drive/Dev/.scratch/m010-t2-brief.md`). If the agent is gone, check `git log`/subtask states and re-dispatch from the brief.
- **T2b (TASK-142.1–.5)** runs as claude.ai cloud session "Paper Trail cursor" on `m010/t2b-cursor` (brief `docs/briefs/TASK-142.md`). Done when `docs/reports/TASK-142.md` appears on that branch (`git fetch`).
- **T3 art done** (TASK-144.1–.3): 8 tabs light + dark in `Portfolio-illustration/illustrations/paper-cut/<tab>/`, provenance in `PLAN.md` + `prompts/`; contact sheets `.scratch/t3-compare-batch2.png`, `t3-experience-dark.png`. 144.4 case-study scenes deferred. Higgsfield: one job at a time (burst 429).

## 1. Then (orchestrator loop, decisions delegated)
- **T1 style gate (EVAL-031 T1):** look at `t1-compare.png`. Judge likeness to the locked sheet, paper-cut quality, and light/dark pairing. Record `EXE-28` with the verdict. Fail → one targeted regeneration round, then decide. Pass → merge `m010/planning` into `m-009-redesign`, full gate, push to preview, TASK-140 Done.
- **Next:** T2 report → T2 style gate (EXE) → merge → push; then T3 integration (144.5–.6) locally and T5 `/card` as a cloud session; T4 after T3. Merge T2b when its report lands.
- **Tracks in order (TP15: at each kickoff, turn that spec's implementation-order section into Campfire subtasks + test cases; briefs name exact spec section ranges, never read paper-cut-2.md whole):** T2 TASK-141 dark mode + toggle (dark-mode.md, toggle.md §24, `docs/specs/m-010/toggle-reference.png`; EVAL-023/024/026) → T3 TASK-144 scenes light + dark (paper-cut-2 §1–64, §123–168) → T4 TASK-145 chrome (paper-cut-2 §65–122 footer, §169–210 nav, second §170–232 dividers, §233–265 depth) → T5 TASK-146 `/card` (card-updated.md, no Wallet, no phone in vCard; EVAL-029). Side lanes: T2b TASK-142 cursor (cursor.md; EVAL-028) alongside T2–T3; T2c TASK-143 gummy `/lab` (gummy-bear.md; Blender MCP, open Blender first; EVAL-030) once RAM allows.
- One heavy job at a time (8 GB). Each track: agent builds in its own worktree/branch off `m-009-redesign` → full gate → merge → push to preview → ticket Done → EXE decision for its style gate.
- After T5: write the release summary for Tushar. **Do not deploy production.**

## 2. Board (Campfire http://127.0.0.1:6480, project `portfolio-clay`; start with the `campfire` shell function)
In Progress: TASK-137, 138, 140, 147, 121 (stalled; Higgsfield daily limit, not done; don't merge). In Review: TASK-136 (merged locally). To Do: TASK-141…146. 48 legacy tickets archived.

## 3. Key decisions
S22–S30 (Solution-PRD §13), TP15 (plan from prompts), EV7–EV11 (Stage 3), D13 (Stage 4), EXE-26 (delegation; production frozen), EXE-27 (Stage 3 signed off; vCard without phone).

## 4. Quota and machine
At 21:00 IST on Oct 5: week 33% used (resets Oct 12 02:30), Fable 2% (reserved). 8 GB RAM; Playwright on its own port per run; Higgsfield 608 cr before T1. Production still runs whatever `main` has (PR #10 may have put Next 16.3.6 there; not our concern while frozen).
