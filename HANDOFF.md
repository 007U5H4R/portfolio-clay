# HANDOFF — Portfolio (M-010 · Paper-cut system, dark mode and delight features)

Updated 2026-10-05. Branch `m-009-redesign` (M-010 builds on it; preview-first). **Stage 2 (Solution Design) addendum APPROVED 2026-10-05; Stage 3 approved to start.** Production is frozen: preview only (S26). The M-009 baton this replaces is `git show 4b14059:HANDOFF.md`.

## 0. State
- **Production is live** since 2026-10-05: PR #7 merged `m-009-redesign` → `main` (deploy `ad77119`). PB4 now checks YouTube IDs (PR #6).
- **Fixed after that release, on the branch (not yet in production):** Next 16.3.5 → 16.3.6 (critical RCE GHSA-vcvr-r3jv-pc5j in `next/og`), brace-expansion and basic-ftp overrides, braces ignore (dev-only, unpatched), EVAL-019 test narrowed for the intro-video poster (TASK-138); real Bhakti Vilas screens in its case study (TASK-137). PR #6's CI failures at w390 (/certifications, /about axe, EVAL-011) were load timeouts: they pass locally.
- **TASK-134 merged to the branch (PR #8, 2026-10-05 18:05, preview only):** Ask Tushky voice playback (Listen/Pause/Replay strip, Gemini TTS) through the site's first server function `POST /api/tushky/speech`; silent until Tushar adds `GEMINI_API_KEY` in Vercel (`docs/reports/TASK-134.md`).
- **M-010 plan:** `~/.claude/plans/i-want-to-add-immutable-raccoon.md`. Specs: `docs/specs/m-010/` (+ `toggle-reference.png`). Campfire milestone `m-9`, tickets TASK-139 (T0, In Progress) … TASK-146.

## 1. Stage 2 output (approved)
- `Solution-PRD.md` §13 (PROPOSED) and `decisions.md` S22–S30.
- Tushar's answers: the hero becomes a **paper-cut still, no clip** (S24); **one production release at the end of M-010** (S26); Apple Wallet deferred (S27).

## 2. Next: Stage 3 · Evaluation Design (skill `bw-evaluation-design`, Fable 5.1 / High)
Read first: `Solution-PRD.md` §13, `decisions.md` S22–S30, `evaluation-plan.md` §8, `evals/eval-cases.json`, `docs/specs/m-010/*.md` (QA/acceptance sections only).
Do:
1. Rewrite EVAL-019 for a still hero (S24): banner `<img fetchpriority=high>` is the LCP element, no `<video>`, poster caps.
2. Add theme evals: no-flash on reload with a saved choice, system preference on first visit, toggle keyboard/screen-reader, axe AA in **both** themes (EVAL-006 × 2), CLS on theme switch.
3. Art evals: light/dark pairing per scene, provenance (EVAL-021 extended to dark files), likeness check of the paper-cut hero against the character sheet (EV4).
4. Budget evals: EVAL-005 180 kB with the cursor lazy; `/lab` excluded from the home bundle; EVAL-018 with dividers replacing torn edges (S28).
5. Update `evals/eval-cases.json` + loader count; add EV# decisions.
Then Stage 4 (`bw-ui-ux-design`): Design.md §3/§6 for paper-cut + theme tokens; Dev-id ranges per track.

## 3. Open for Tushar
- Production is frozen until Tushar says otherwise (S26); the Next 16.3.6 security patch waits on the branch with everything else. Remind him that production still runs 16.3.5.
- Nine merged worktrees still hold uncommitted files (integration, task-112/114/116/118/129, tkt-101/110/86): review before removal.

## 4. Machine notes
8 GB RAM: one heavy local session. Blender + Blender MCP and threejs-devtools MCP (launches Chrome) are installed (memory: blender-mcp-setup). Higgsfield 608 cr.
