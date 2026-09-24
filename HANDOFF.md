# HANDOFF — Portfolio (M-009 · Illustrated editorial redesign)

Updated 2026-09-24 · **Stage 6 (Technical Planning) for M-009 COMPLETE — awaiting Tushar's sign-off on `technical-plan.md` §F + `test-cases.md` TC-122…177 + the Campfire onboarding.** Next = **Stage 7 Execution, Phase 0 tracer** (`bw-execution-orchestration`, Opus 4.8 / Standard by default; per-task tiers in technical-plan §F0) — not yet started; nothing past Phase 0 without the hero gate.

**Where things live.** Build worktree: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` (branch `m-009-redesign`, forked from `m-008-visual-wow` @ `7a8b60c`; `main` = M-001–M-007 merged, prod still gated). Commits: `b0f6f8d` Stages 2–4 · `9ad1ded` Stage 5 · **Stage 6 edits committed in this session (see `git log -1`)**. Design reference of record: `docs/redesign-mockups/m-009/` (frozen; changes = `Design.md` §11 rows). On-disk build inputs until TKT-73: paths in that folder's `README.md`. Obsidian: `Obsidian Vault/Portfolio-illustration/Progress.md` (log) + `Obsidian Vault/Portfolio-clay/` (artifact mirrors). Auto-memory: `illustrated-redesign-direction.md`. **PWA: Campfire (`campfire`), project `portfolio-clay` now points at this worktree (TP11); milestone `m-8` = M-009; TKT-69…91 = `TASK-64…86`, sub-tasks `TASK-<parent>.1–3`** (`backlog/id-map.json`, `tickets.md` §0.4).

> Start the next session by reading the global `~/.claude/CLAUDE.md`, this file, `technical-plan.md` §F (F0–F7), `tickets.md` M-009 section (Phase 0: TKT-69…74) + Appendix D, `test-cases.md` TC-122…146, `Design.md` §2–§6, `decisions.md` TP11–TP14, then continue at "NEXT".

---

## 1. What M-009 is (one paragraph)
Same product, new skin. Routes, `data/*.ts`, zod truth gate, `pnpm eval`, tests, SEO and headers carry forward untouched. The presentation is replaced wholesale: 13 paper tokens (1:1 for the 13 clay tokens, gate stays 13/13), Fraunces + Inter + Caveat, paper primitives under the `data-decor`/`data-paper`/`data-fastener`/`data-flat`/`data-hand` contract, an illustrated desk-scene hero with a 2.5 s clip that plays once and holds, and a terracotta band footer on every page. M-008's visual layer is **removed**, not restyled (S11).

## 2. Stage 6 outputs (this session, 2026-09-24)
- **Stage 5 approved as-is** (all five granularity defaults stand: strict phase gates · repo-wide token codemod · TKT-82 separate · TKT-88 one ticket · D8/D9/Bengaluru/AskPanel carried as variants). No `PB6+` decision was needed (nothing changed). Committed as `9ad1ded`.
- **`technical-plan.md` §F** (M-009 addendum): F1 codebase facts (15 rows, incl. the two live S18 bugs at `EssayBody.tsx:65` and `ExperienceTimeline.tsx:136`, the unused `hero.tagline`, the real `eval.ts` flags, `DraftTag` not existing, `Prose` 60ch vs 68ch, Vercel branch-preview pattern); F2 technical deltas (module map, codemod design, fonts + Fraunces fallback, primitives, the **EVAL-018 counting algorithm**, the **`HeroClip` lifecycle**, illustrations/manifest, band, OG, motion, tests, rollback, failure modes); **F3 atomic plans for TKT-69…91** (`S69.01…S91.03`, files · contract · gate, model tier per task); F4 phase table + **Phase-0 orchestration playbook**; **F5 Vercel preview procedure**; F6 traceability (ticket → `TASK` → files → EVAL → TC); F7 conflicts E-15…E-21.
- **`test-cases.md`** M-009 section **TC-122…177** (56 cases; 40 P0) incl. the four **S18 regression tests** — TC-135 band tagline · TC-157 learnings · TC-164 single DRAFT prefix · TC-167 timeline lead/order — plus the EVAL-018 violating fixture (TC-127), EVAL-019 four-mode matrix (TC-140/141), EVAL-020 greps with control (TC-122/123), EVAL-021 both-ways provenance (TC-138); Appendices A/B/C extended; every M-009 ticket's `Related TC` back-filled.
- **`tickets.md`**: `Backlog ID` filled on TKT-69…91; §0.4 M-009 table + sub-task mapping; `Related TC` per ticket.
- **`decisions.md`** TP11 (Campfire repoint + onboarding mapping) · TP12 (EVAL-018 parked list) · TP13 (`HeroClip` state machine) · TP14 (`MediaGate` for "removed from the DOM below N px").
- **Campfire**: `m-8` created; 23 tickets + 18 sub-tasks created via `backlog task create` (deps, priorities, types, `sp:`, phase labels, ACs); verified loaded in Chrome (Kanban, Milestones, Gantt show M-009 rows). Manifest `projects.json` repointed (backup `projects.json.bak-2026-09-24`).
- **Verified:** `pnpm test` 316 passed / 2 skipped after the doc edits (`eval-docs` consistency included); no `TC-TBD` or `_Stage 6_` left in the M-009 section; 41 new task files under `backlog/`.

## 3. Gate for Tushar (Stage 6 → 7)
1. Approve `technical-plan.md` §F as the plan of record (or name changes — the plan is living, §0.3).
2. Confirm the **model/effort routing** for Stage 7: Opus 4.8 / Standard default; most-capable for TSK-30 (codemod), TSK-35 (EVAL-018 spec), TSK-37 (`HeroClip`), TKT-71, TKT-83, TKT-90; cheap for delete-only/asset-copy steps (F0).
3. Still-open defaults (applied unless you say otherwise at dispatch): D8 five-item nav (TKT-71) · D9 quiet-closes dropped (TKT-84/88) · "Bengaluru, India" flag **off** (TKT-72) · `AskPanel` kept (TKT-77) · hiring-line copy DRAFT-tagged.
4. **First branch push** (`git push -u origin m-009-redesign`) happens at TKT-74 for the Vercel preview — it is externally visible (public repo, EXE-13); the orchestrator will ask before pushing.

## 4. Reference assets
- In repo: `docs/redesign-mockups/m-009/` (see its `README.md`).
- On disk until TKT-73: character sheet `Portfolio-illustration/illustrations/character-sheet/character-ref-LOCKED.png`; scene masters `illustrations/scenes/*.png`; hero exports `animation/export/hero-animation.{webm,mp4}` (176 / 312 kB), `hero-poster.webp` (87 kB), `hero-end.webp`, 1280×684, 2.5 s. Higgsfield balance 69 credits; no further spend approved (§12.4).

## 5. NEXT — Stage 7 · Execution, Phase 0 (`bw-execution-orchestration`) — only after §3 approval
Follow **technical-plan §F4 "Phase-0 orchestration playbook"** exactly:
1. Preflight: worktree clean, `pnpm install --frozen-lockfile`, `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build` green; `df -h /` recorded; `campfire` open and **verified loaded**; `backlog task edit TASK-64 -s "In Progress"`; `docs/ledger.md` M-009 section.
2. TKT-69 (`TASK-64`): TSK-30 codemod (most-capable, brief from S69.01–S69.04 + F1-11 hotspots; orchestrator reviews the printed rewrite list before accepting the commit) → TSK-31 fonts ∥ TSK-32 `eval-020.test.ts`. Gate: `TOKENS` 13/13, greps 0, trio + build + `pnpm test:e2e` green, `BUDGET` recorded.
3. TKT-70 (`TASK-65`): TSK-33 → TSK-34 → TSK-35 (most-capable; F2's EVAL-018 algorithm + the violating fixture proof; EVAL-018 leaves `DEFERRED_SPECS`).
4. Lanes TKT-71 (`TASK-66`) ∥ TKT-72 (`TASK-67`) ∥ TKT-73 (`TASK-68`; TSK-36 may start right after TKT-69) — disjoint files except `globals.css` (per-ticket comment banners).
5. TKT-74 (`TASK-69`): assemble `/`, park legacy EVAL-018 hits (TP12), `pnpm eval --label baseline-m009-tracer`, **ask Tushar, then push** → Vercel preview → `pnpm eval --base-url` + LHCI on the preview (F5) → hero gate → `decisions.md` EXE-n. **Stop; Session-Clearing block; Phase A only in a fresh session after EXE-n exists.**
Per-task: brief file `docs/briefs/<id>.md`, report `docs/reports/<id>.md`, two-stage review, ≤ 2 fix rounds, `pnpm eval --only …` per ticket, `git diff --stat` reviewed against the ticket's files, Campfire status via `backlog task edit`.

## 6. Guardrails (carry forward)
13-token gate (paper palette, S12; EVAL-020) · content truth + **never publish PII** (real contact = email/LinkedIn per EXE-8; no phone/DOB/address; "Bengaluru, India" behind `site.showLocation` until confirmed) · reduced-motion + touch + Save-Data → poster-only hero (EVAL-019; D10/TP13) · poster is the LCP `priority` image · all routes statically prerendered (TP1; `MediaGate` for width-gated decorations — TP14) · don't break the build (`pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`) · commit attribution per the session reminder · cinematic site + `portfolio/index.html` untouchable · decoration budget ≤ 4 per section under the **D6 definitions** (S15/EV5/EVAL-018), planned counts in `Design.md` §3.3, legacy hits parked per TP12 (empty by TKT-90) · Caveat only via `data-decor`/`aria-hidden`/`data-hand` · illustrations decorative with provenance, alts exactly as `Design.md` §6.3 (S20/EVAL-021) · **thresholds are never lowered** (EV2/EV6; ≤ 180 kB gz binding — a perf ticket, never a budget edit) · mockups frozen; changes are `Design.md` §11 rows · stable IDs: M-, TKT-, TSK-, TC-, EVAL-, `TASK-` never renumbered; M-008's TKT-55…68 / TASK-50…63 never reused · everything on `/Volumes/E Drive` (scratch `/Volumes/E Drive/Dev/.scratch`).

## 7. Tooling notes
- Campfire CLI: `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/dist/backlog" task edit TASK-64 -s "In Progress"` run from the worktree root (the CLI reads `./backlog`); `backlog task list -m m-8 --plain` lists M-009; `backlog` is **not** on PATH. Server: `campfire` shell function (or `./dist/backlog browser --projects ./projects.json --port 6480 --no-open` from the fork root); log `/Volumes/E Drive/Dev/.scratch/campfire.log`.
- Playwright screenshots: `PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright" TMPDIR="/Volumes/E Drive/Dev/.scratch" pnpm exec playwright screenshot --browser=chromium --viewport-size=1440,900 --full-page --wait-for-timeout=2500 <url> out.png`.
- Verify hero/poster against a **prod build (`pnpm build && pnpm start`) or the Vercel preview**, not `next dev` (image-cache scar, M-008).
- `scripts/eval.ts` flags: `--label`, `--only`, `--baseline`, `--base-url`, `--skip-build`, `--reuse` (there is **no** `--informational`). Vitest cases match by file name (`tests/unit/eval-0xx.test.ts`), Playwright cases by `@EVAL-0xx` tag; `scripts/eval-cases.ts --check-specs` enforces tags once an id leaves `DEFERRED_SPECS`.
- GateGuard "Fact-Forcing Gate" denies the first Edit/Write per file — state importers/API/schemas/verbatim instruction, retry. Plain `tsc --noEmit` reports a missing `LayoutProps`; use `pnpm typecheck`.
- `pnpm eval --check-specs` starts a full Playwright run; for a quick loader check use `pnpm exec tsx -e 'import("./scripts/eval-cases.ts").then(m=>console.log(m.loadCases().length))'`.
- OKLCH for the paper tokens: `Design.md` §2.1 (culori-exact); `pnpm tokens:check --write` regenerates once `AUTHORITATIVE` is swapped (S69.01–S69.02).
- Vercel: project `portfolio-clay` ↔ GitHub `007U5H4R/portfolio-clay`; branch previews at `https://portfolio-clay-git-<branch>-tushar-49a6.vercel.app`; `vercel` CLI not installed; F5 has the full procedure.

## 8. Persistence
Mirror `technical-plan.md`, `test-cases.md`, `tickets.md`, `milestones.md`, `decisions.md`, `HANDOFF.md`, `backlog/id-map.json` to `Obsidian Vault/Portfolio-clay/`; log progress in `Obsidian Vault/Portfolio-illustration/Progress.md`; keep memory in sync (Obsidian wins on conflict). Rewrite this baton in place at each stage boundary.
