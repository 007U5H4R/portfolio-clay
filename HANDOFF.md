# HANDOFF — Portfolio (M-010 · Paper-cut system, dark mode and delight features)

Updated 2026-10-06 ~14:30 IST. Main worktree `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign`, branch `m-009-redesign`. **Production FROZEN: preview only — never touch `main`, never deploy production** (S26; Tushar: "Dont touch the Production now"). **Tushar delegated all M-010 decisions, stage sign-offs and style gates to Claude (EXE-26)**: decide, record each call as an `EXE-` decision in `decisions.md` with evidence, keep going. The production release is NOT delegated. **Agents run on Sonnet (builds) / Opus (reviews, gates). Never use Fable.** Tushar's latest asks: "complete all the tickets"; "once everything is done, commit, merge, push and deploy to Preview".

## 0. Where things are (read first)
- **Preview is current at `08a9a99`** (code = `9126870`; deploy `dpl_Eu59WjRJjUKSR8eD9uQjKVvPbTTP` READY, verified live: `/card`, `/card/vcard` text/vcard with no TEL/BDAY, T3 scene twins, T4 header paper + footer ocean). Alias `portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app`.
- **Done (Campfire):** TASK-136…148 except **TASK-143** — T1 hero (140), T2 dark mode + toggle (141), T2b cursor (142), T3 scenes (144; 144.4 closed without case-study scenes, EXE-34), T4 chrome (145), T5 `/card` (146), Stage docs (147), Bhakti screens (148, renumbered from a duplicate 137, EXE-29).
- **Open: TASK-143 Gummy Lab `/lab`** — on preview (reachable only via 5 rapid clicks on the name/monogram) but **not done**. See §1.
- **Open, outside M-010: TASK-149** — every page view preloads all tabs' hero scenes via route prefetch (`ecad101`, M-009; likely on production too). Fix after the release.
- **Last full gate (#2, quiet machine, `9126870`):** typecheck ✓, lint 0 errors, `pnpm tsx scripts/eval-cases.ts --check-specs` 31 OK (nothing deferred), `pnpm tokens:check` 55/55 AA, build ✓ (20 static routes), unit 1051 ✓, **e2e 1643 passed / 26 failed** = 25 × `tests/e2e/eval-030.spec.ts` (w768/w1024/w1440, + 1 w390 touch drag) + 1 × `tests/e2e/lenis.spec.ts:78` (PageDown/Space at w1440, not yet investigated; may share the cause).
- **Security review** (Opus; `/Volumes/E Drive/Dev/.scratch/m010-security-review.md`): no Critical/High/Medium; 3 Lows fixed (`0afba63` `.env*` ignore, `dda3da9` lab return path rejects tab/CR/LF, `dd1df3a` vCard RFC 6350 escaping) — EXE-37. Before any production release: set `NEXT_PUBLIC_SITE_URL` on Vercel production (else the card QR/vCard point at the preview URL).

- **⚠ Parallel work in this worktree:** another session opened **TASK-150** "Keep the footer sailboat fully visible above the ocean strip" (In Progress, created 2026-10-06 14:25 IST) and has **uncommitted edits to `app/globals.css` `.band-ocean`** (plus `next-env.d.ts` churn) here. Don't overwrite or commit them; coordinate (ask Tushar / check the board) before Bug A's fix touches the same ocean CSS — do Bug A in the `lab-debug` worktree and merge after TASK-150 is committed.

## 1. TASK-143 (`/lab`): DONE 2026-10-06 ~20:15 IST
Fixed, gated, pushed and verified on preview. Root cause and evidence in **EXE-55** (`decisions.md`): the band footer's infinite animations ran under the opaque lab and starved its WebGL boot; `HideOnLab` keeps the footer off `/lab`. EVAL-030 test-harness fixes: non-WebGL blocks in `tests/e2e/eval-030-entry.spec.ts`, the leak check counts live rAF loops, the lab-page budget = its step waits. Quiet full gate on `3d4f334`: e2e 1678/3 → test-side fixes → w1440 29/0, lab-page ×2 on all projects 64/0. Pushed `m-009-redesign` `0f2e2ef → 9eb416e` (fast-forward); preview `dpl_89ihL6mqVVLZM3shpUgkGUN9AHXX` READY and checked live with a GPU. TASK-143 and 143.1–.5 Done. Screenshot churn from the gate is stashed in the lab-debug worktree as `task143-screenshot-churn-2026-10-06` (safe to drop).
Follow-ups for TASK-155 (perf lane): `/lab` intro takes ~12 s over the network; Lenis `autoRaf` runs every frame on every page; a cold home under software GL renders at ~1 fps (test env only).

## 2. After TASK-143
Write the release summary for Tushar: what shipped per track; style-gate decisions EXE-28/32/34/35; known nits (dark back wave slightly violet, faint olive line on the dark ridge top, intro-video poster + About mini-collage still watercolour); pre-existing "Draft — pending sign-off" labels (DraftTag) need Tushar's sign-off; TASK-149; `NEXT_PUBLIC_SITE_URL`. **Do not deploy production.** Persist to Obsidian (`~/Documents/Documents - Tushar's Macbook/Obsidian Vault/Portfolio-illustration/Progress.md`) + memory.

## 3. Machine rules (scars — keep them)
- 8 GB RAM. **Every** `next build`, Playwright run, full `pnpm test` and `pnpm typecheck` goes through `/Volumes/E Drive/Dev/.scratch/heavy-gate.sh <label> zsh -c '<cmd>'` (busy-check anchored on `^node`; regression test `heavy-gate.test.sh`). Single-file `pnpm vitest run <file>` is fine outside. A gate run while other heavy work runs is not evidence (EXE-38).
- Playwright needs `.env.tooling` (browsers on the E Drive): run ad-hoc scripts via `pnpm exec dotenv -e .env.tooling -- node …`; keep probes in the repo's git-ignored `.eval/` and import from `@playwright/test`.
- e2e runs rewrite tracked `docs/screenshots/**`: `git stash push -- docs/screenshots` before committing (never `git checkout --` them; a hook blocks destructive commands — move/stash instead of rm).
- Lane agents can hang silently while showing "running": judge by commits and lock activity; give briefs anti-hang rules (≤ 5 min per external wait; commands > 2 min via run_in_background + timeout ≤ 7200000; no long-lived dev servers; commit per subtask). Bash background tasks cap at 2 h. Cloud sessions can't download Higgsfield output (make raster art locally first) and are started via claude.ai/code in Chrome (memory `cloud-session-launch`).
- Campfire CLI `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/dist/backlog"` from this worktree; board http://127.0.0.1:6480 (project `portfolio-clay`); `backlog doctor` repairs duplicate ids.

## 4. Key decisions
S22–S30 (Solution-PRD §13), TP15, EV7–EV11, D13, T2-D1, EXE-26 … EXE-38 in `decisions.md`. Dev ids per track in Design.md §13.5 (T1 136–139, T2 140–149, T2b 150–154, T2c 155–159, T3 160–169, T4 170–184, T5 185–189).

## 5. Worktrees (M-010)
`Portfolio-m010-{planning,t2-dark,t2b-cursor,t3-scenes,t4-chrome,t4-specs,t5-card,t2c-gummy,t2c-fix,lab-debug}` — all merged except `lab-debug` (scratch). Clean them up after TASK-143 lands (verify each is merged and clean first; `git worktree remove`, never `rm -rf`).
