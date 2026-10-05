# HANDOFF — Portfolio (M-010 · Paper-cut system, dark mode and delight features)

Updated 2026-10-05 evening. Main worktree `Portfolio-clay-redesign`, branch `m-009-redesign`. **Production is frozen: preview only** (S26, Tushar: "dont touch the production now"). Production = `main` @ deploy `ad77119` (still Next 16.3.5, critical GHSA-vcvr-r3jv-pc5j — Tushar knows; do not deploy).

## 0. Two jobs were running when this session ended — check both first
1. **Full e2e on `m-009-redesign` (local commits, NOT pushed).** HEAD has: Next 16.3.6 + audit overrides, EVAL-019 intro-poster fix, macOS glyph font fix (TASK-138); real Bhakti Vilas screens (TASK-137); M-010 T0 docs (TASK-139); board updates; TASK-147; TP15 + this file. Rebased on PR #8 (TASK-134 voice). Earlier gates on this exact code: typecheck ✓, lint 0 errors, unit 874 ✓, build ✓, audit 0 unignored high; targeted e2e 522/0 + glyph 92/0. **Do:** `pnpm build` then `PW_BASE_URL=http://127.0.0.1:3316 pnpm test:e2e` (≈ 45 min, background). Green → `git diff --stat origin/m-009-redesign..HEAD` (only intended files) → `git push origin m-009-redesign` → check the Vercel preview (`gh pr checks` style: `gh run list --branch m-009-redesign`) → move TASK-137 and TASK-138 to Done. Do not commit the regenerated `docs/screenshots/**` churn (stash it; two stashes already hold earlier churn).
2. **Stage 3 agent in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m010-planning` (branch `m010/planning`).** If `git -C <that path> log --oneline -3` shows a Stage 3 commit "(TASK-147)", review it. If not, rerun Stage 3 there with the saved brief `/Volumes/E Drive/Dev/.scratch/m010-stage3-brief.md` (Agent, model fable). Then merge `m010/planning` into `m-009-redesign` (expect append conflicts in `decisions.md`; keep both sides).

## 1. Then
- **Merge TASK-136 (About page)** from `origin/cloud/task-136` into `m-009-redesign` (Tushar: "whatever is done, just merge"), run the full gate, push, check the preview, move TASK-136 → Done. TASK-121 is NOT done (stalled on Higgsfield's daily limit) — do not merge.
- **Stage 4 · UI/UX Design (TP15 slim version)** in a fresh session: Design.md addendum with paper-cut tokens + the dark palette taken from `docs/specs/m-010/dark-mode.md` §3–8 and `toggle.md` + `toggle-reference.png`; Dev-id ranges per track; **T1 pilot = the Home hero as a paper-cut still** (S24) generated with Higgsfield (show credit estimate first; ≤ 2 regenerations per asset), shown to Tushar side by side with the locked character sheet. **Stop for Tushar's style approval** before any other art.
- Stages 5–6 are folded into each track's kickoff (TP15).

## 2. Board (Campfire http://127.0.0.1:6480, project `portfolio-clay`)
In Progress: TASK-137, TASK-138, TASK-147, TASK-121 (stalled). In Review: TASK-136. M-010 milestone `m-9`: TASK-139 Done; TASK-140…146 To Do. 48 legacy Blocked tickets archived 2026-10-05.

## 3. Key decisions
S22–S30 (Solution-PRD §13, approved): dark mode added, paper-cut art, hero = paper-cut still with no clip, one theme system, one production release at the end, card without Wallet, dividers replace torn edges, cursor desktop-only + lazy, gummy on lazy `/lab`. TP15: plan from the prompts.

## 4. Open for Tushar
- Production still runs Next 16.3.5 (critical advisory); he chose preview-only for now.
- 9 merged worktrees still hold uncommitted files (integration, task-112/114/116/118/129, tkt-101/110/86).
- `GEMINI_API_KEY` in Vercel for the TASK-134 voice.

## 5. Machine
8 GB RAM: one heavy job at a time. Playwright on its own port per run. Blender MCP (open Blender first) + threejs-devtools (launches Chrome) installed. Higgsfield 608+ cr. Claude weekly limit resets Oct 12 02:30 IST.
