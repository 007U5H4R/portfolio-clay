# HANDOFF — Portfolio (M-010 · Paper-cut system, dark mode and delight features)

Updated 2026-10-05. Branch `m-009-redesign` (M-010 builds on it; preview-first); Stages 3–6 are authored on `m010/planning` (worktree `Portfolio-m010-planning`, TASK-147). **Stage 2 (Solution Design) addendum APPROVED 2026-10-05; Stage 3 (Evaluation Design) DRAFTED 2026-10-05 — awaiting Tushar's sign-off; Stage 4 next.** Production is frozen: preview only (S26). The M-009 baton this replaces is `git show 4b14059:HANDOFF.md`.

## 0. State
- **Production is live** since 2026-10-05: PR #7 merged `m-009-redesign` → `main` (deploy `ad77119`). PB4 now checks YouTube IDs (PR #6).
- **Fixed after that release, on the branch (not yet in production):** Next 16.3.5 → 16.3.6 (critical RCE GHSA-vcvr-r3jv-pc5j in `next/og`), brace-expansion and basic-ftp overrides, braces ignore (dev-only, unpatched), EVAL-019 test narrowed for the intro-video poster (TASK-138); real Bhakti Vilas screens in its case study (TASK-137). PR #6's CI failures at w390 (/certifications, /about axe, EVAL-011) were load timeouts: they pass locally.
- **TASK-134 merged to the branch (PR #8, 2026-10-05 18:05, preview only):** Ask Tushky voice playback (Listen/Pause/Replay strip, Gemini TTS) through the site's first server function `POST /api/tushky/speech`; silent until Tushar adds `GEMINI_API_KEY` in Vercel (`docs/reports/TASK-134.md`).
- **M-010 plan:** `~/.claude/plans/i-want-to-add-immutable-raccoon.md`. Specs: `docs/specs/m-010/` (+ `toggle-reference.png`). Campfire milestone `m-9`, tickets TASK-139 (T0, In Progress) … TASK-146.

## 1. Stage 2 output (approved)
- `Solution-PRD.md` §13 (PROPOSED) and `decisions.md` S22–S30.
- Tushar's answers: the hero becomes a **paper-cut still, no clip** (S24); **one production release at the end of M-010** (S26); Apple Wallet deferred (S27).

## 2. Stage 3 output (drafted 2026-10-05, TASK-147 — Tushar to sign off)
- `evaluation-plan.md` §9 (M-010 addendum): EVAL-019 rewritten in place for the still hero (clip criteria superseded, history kept); nine new rows EVAL-023…031 (theme resolution/no-flash · toggle a11y · dark-art pairing · theme-switch stability/no CSS-filter art · bundle isolation · cursor gating + mobile both themes · `/card` · `/lab` · Tushar's five style gates); EVAL-001/004/005/006/008/009/010/018/020/021/022 reworded (theme dimension, divider-for-torn-edge, 13 tokens × 2 blocks); §4/§6 extended; baseline `baseline-m010-t0`.
- `evals/eval-cases.json` v1.2.0 (31 cases) · `scripts/eval-cases.ts` `CASE_COUNT` 31 + `DEFERRED_SPECS` (023/024/026/028/029/030 until their track) · `scripts/eval.ts` id lists · `docs/eval.md` table · `decisions.md` EV7–EV11.
- Verified: `tsx scripts/eval-cases.ts --check-specs` → `31 cases OK · 26 automated · 5 manual`, spec coverage OK with six deferred.

## 2a. Next: Stage 4 · UI/UX Design (skill `bw-ui-ux-design`)
Read first: `Design.md` §3/§6/§8, `evaluation-plan.md` §9 (the rows name the selector/attribute contracts Stage 4 must author: `data-theme`, `portfolio-theme`, `role="switch"` toggle, `data-decor="divider"`, `[data-paper-cursor]`, `[data-no-trail]`, `[data-scene]`, per-theme manifest `src`), `docs/specs/m-010/*.md`.
Do: Design.md §3 token table with the dark block (same 13 names, S25) · §6 paper-cut illustration system + per-theme manifest shape + shared-asset list · nav/divider/ocean/toggle/card components with their a11y contracts · Dev-id ranges per track · the OG decision (EVAL-017: stays light unless Stage 4 records otherwise) · mobile and reduced-motion states for every new surface (web-deliverables gates).

## 3. Open for Tushar
- **Stage 3 sign-off** (`evaluation-plan.md` §9, EV7–EV11). Two calls inside it that are his: the vCard carries **no phone number** (EVAL-029, the EVAL-013 PII rule) — confirm, or name a field to add; `/card` joins the Lighthouse route set (EVAL-004) at T5.
- Production is frozen until Tushar says otherwise (S26); the Next 16.3.6 security patch waits on the branch with everything else. Remind him that production still runs 16.3.5.
- Nine merged worktrees still hold uncommitted files (integration, task-112/114/116/118/129, tkt-101/110/86): review before removal.

## 4. Machine notes
8 GB RAM: one heavy local session. Blender + Blender MCP and threejs-devtools MCP (launches Chrome) are installed (memory: blender-mcp-setup). Higgsfield 608 cr.
