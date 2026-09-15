# Execution Ledger — Clay Portfolio · Stage 7

Committed, survives context resets. The orchestrator updates this after every task/step. Source-of-truth order: implementation code > PWA (Campfire) > this ledger / Markdown artifacts. Native Backlog IDs (id-map.json): TKT-01→TASK-1 … TKT-53→TASK-49.

## Environment (verified 2026-09-15, session start)
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — everything (repo, node_modules, pnpm store, Playwright browsers, Next cache, scratch) stays on E Drive (global scar).
- Internal disk: 22 GiB free / 35% used at start — recheck before installs.
- Node **v26.7.0** (matches A9 pin "Node 26.7"), pnpm **11.25.0** (matches). pnpm store: `/Volumes/E Drive/Dev/.pnpm-store/v11`. E-Drive `.cache` / `.scratch` / `.pnpm-store` present.
- PWA: Campfire, project `portfolio-clay`, onboarded Stage 6.2. Move statuses with `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/scripts/orchestrator/move-ticket.sh" "<root>" <TASK-id> "<status>"` (To Do / In Progress / In Review / Blocked / Done). Never hand-edit `backlog/`.

## Orchestration decisions (execution mechanics; not formal EXE entries)
- **Isolation = in-place branch `m-001-tracer`** (main stays at the planning commit), NOT the sibling worktree §A10 suggests. Reason: every concrete S01.xx gate and §0.2 path target `Portfolio-clay/` directly (S01.03 scaffolds *into the existing folder*; S01.01 gate is `git -C .../Portfolio-clay`); a sibling worktree would break those paths. HANDOFF rule 2 and the Stage-7 prompt both authorize "branch `m-001-tracer`". `EXE-1` is reserved for the TKT-02 visual-gate decision per S02g.03.
- **Subagent model tiers:** most-capable → `opus`, standard → `sonnet`, cheap → `haiku` (this harness's Agent tool takes a per-call `model`, so mixing tiers per dispatch is supported here). One fresh implementer per TSK; brief = `docs/briefs/<TSK>.md`, report = `docs/reports/<TSK>.md`.

## Phase 1 = M-001 · Tracer bullet + visual gate
DAG: **TSK-01 → {TSK-02, TSK-03} → {TSK-04, TSK-05, TSK-06} → TSK-07 → [TKT-02 human visual gate]**. Per PB1, after TKT-01 the M-002 non-visual tickets TKT-03 (schema) & TKT-07 (harness) may proceed in parallel with the TKT-02 wait; NO further visual work before TKT-02 approval.

| Task | Native | Tier | Status | Report | Notes |
|---|---|---|---|---|---|
| Repo setup / S01.01 | — | orchestrator | ✅ done | this ledger | git init, .gitignore, README, planning commit, branch m-001-tracer |
| TSK-01 scaffold + tokens | TASK-1 | opus | ⬜ pending | — | S01.02–S01.08 (S01.01 done by orchestrator) |
| TSK-02 avatar pipeline | TASK-1 | sonnet | ⬜ pending | — | S02.01–S02.04 |
| TSK-03 clay primitives | TASK-1 | sonnet | ⬜ pending | — | S03.01–S03.06 |
| TSK-04 Header/Nav/Mobile | TASK-1 | sonnet | ⬜ pending | — | S04.01–S04.06 |
| TSK-05 Hero/Avatar/Tiles | TASK-1 | opus | ⬜ pending | — | S05.01–S05.06 |
| TSK-06 ProjectCard/VT | TASK-1 | opus | ⬜ pending | — | S06.01–S06.05 (S06.01 = VT export breaker check) |
| TSK-07 shots + eval + baseline | TASK-1 | opus | ⬜ pending | — | S07.01–S07.07 → baseline-v1.json |
| TKT-02 visual gate | TASK-2 | Tushar | ⬜ pending | gate-tracer.md | STOP: screenshots 390/768/1024/1440 + 6-item checklist |

## Conflicts already resolved (§E — read before TKT-01)
E-1 footer "Built with curiosity." · E-6 split card-padding tokens · E-7 ClayButton primary = bg text on accent · E-9 nav = Home·Work·Thinking·About · E-11 featured cards use ClayIcon not imagery · E-12 verify VT export name at S06.01 · E-13 resume both states covered. Full table: technical-plan.md §E.

## Open items (defaults applied; Tushar's calls) — do not block execution
TeachSpark metric date (08-24) · RailCite figure policy (live-with-date) · Cubicle deploy (N/A) · domain name · sanitised resume PDF (hard-blocks TKT-53 only) · GitHub repo creation · years wording ("7+"). Full list: §E "Open items carried".

## Log
- 2026-09-15 — Stage 7 opened. Read HANDOFF + technical-plan §0/A9/A10/B(M-001)/C/E, verified env. Reconciled stale memory (Solution-PRD was Approved 2026-09-15; memory was pre-sign-off). Setup done. Next: dispatch TSK-01 (opus).
