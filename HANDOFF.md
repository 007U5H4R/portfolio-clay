# HANDOFF — Clay Portfolio

Updated 2026-09-15 (end of Stage 6) · baton for **Stage 7 — Execution**. Project root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` (capital P). Obsidian mirror: `~/Documents/Documents - Tushar's Macbook/Obsidian Vault/Portfolio-clay/`. Auto-memory: `clay-portfolio-build.md`. PWA: Campfire Board, project id `portfolio-clay` at `http://127.0.0.1:6480` (start/reopen with the `campfire` shell function).

## Stages completed
| Stage | Output | Status |
|---|---|---|
| 1 Discovery (compressed) + Research/Content audit | `Discovery-PRD.md` (reconstructed), `AUDIT.md`, `CONTENT_INVENTORY.md` | Done |
| 2 Solution Design | `Solution-PRD.md`, `SITEMAP.md`, `DESIGN_DIRECTION.md`, `COMPONENT_ARCHITECTURE.md`, decisions S1–S10 | **Approved 2026-09-15** |
| 3 Evaluation Design | `evaluation-plan.md` (EVAL-001…017), EV1–EV2 | Done |
| 4 UI/UX Design | `Design.md` (t-design, Mobbin-cited, 6 deviations), avatar `standing-D` → `content/media/avatar/avatar-source.png` + `avatar-cutout.png`, D1–D5 | **Approved 2026-09-15** |
| 5 Problem Breakdown | `milestones.md` (M-001…M-007), `tickets.md` (49 tickets / 29 sub-tasks / 162 sp, DAG, critical path, §0.4 native-ID map), PB1–PB5 | **Approved 2026-09-15** |
| 6 Technical Planning | 6.0 entry gate met (Campfire verified in Chrome) · 6.1 `technical-plan.md` (A approach · B 132 atomic steps for M-001–M-003, ticket-level for M-004–M-007 · C phases · D traceability · E conflicts) · 6.2 onboarded: 7 milestones (M-001…007 → m-0…m-6), 49 tickets (TASK-1…49), 29 sub-tasks, 345 ACs, `backlog/id-map.json`, `projects.json` extended (backup `projects.json.bak-2026-09-15`) · 6.3 Gantt verified (TKT-01 8 h → TKT-02 ∥ TKT-03) · 6.4 `test-cases.md` (TC-001…121, all tickets covered, appendices A–D) · 6.5 `evals/eval-cases.json` (17), `evals/results|reports/.gitkeep` · TP0–TP10 | **Complete — awaiting Tushar's checkpoint approval** |

## Binding decisions (decisions.md — never reopen without new evidence)
S1 separate site, new domain · S2 Next.js 16 + TS + Tailwind 4 + `motion` 13 + lucide + pnpm, static generation · S3 3 featured (TeachSpark, RailCite, Nuptis→Velora; Cubicle only if deployed), all 11 on `/work` with live URL + video · S4/D5 avatar = standing-D · S5 GitHub links hidden until public · S6 videos screen-recorded (PB4: soft for content, TeachSpark/RailCite/Velora hard-block deploy) · S7 deterministic Ask behind `AnswerProvider` · S8 "Senior Product Manager" · S9 no dark mode · S10 no contact form · PB1 schema+harness run parallel to the visual gate · PB2 thin case studies merged into TKT-54 · PB3 11 Ask prompts, EVAL-012 unchanged · PB5 resume CTA = labelled "Resume — updating" placeholder until a sanitised PDF exists; the current PDF is never committed/published · TP0 PWA conventions (Pn labels + `high/medium/low`, `sp:` = 1 Gantt hour, hard deps only) · TP1–TP9 architecture (SSG not export, View Transitions w/ fallback, Ask matching algorithm, media pipeline, tooling, motion budget, client-side `?filter=`, chapter↔anchor map, headers/CSP) · **TP10 footer says "Built with curiosity."; authorship colophon on `/about`.**

## Open items for Tushar (Execution proceeds around them)
- **TeachSpark canonical metric date** — recommend 08-24 Final PRD; blocks TeachSpark content (TKT-28) data entry only.
- Cubicle: deploy by 09-16 or it ships "built, not launched" (conditional media ticket P3).
- **Domain name** for the new Vercel project (needed at TKT-50/53).
- **Sanitised resume PDF** (strip DOB/phones/address; patent no. → 429867; title) — hard-blocks production deploy (TKT-08 → TKT-53).
- Flip repo visibility when ready; sign off 5 DRAFT essay titles + 8 Ask answers (`CONTENT_INVENTORY.md`).
- Private GitHub repo `007U5H4R/portfolio-clay` to be created at TKT-50 (confirm scope first).

## STAGE 7 EXECUTION IN PROGRESS (updated 2026-09-16) — live tracker is `docs/ledger.md`
Tushar is AFK; authorized "complete all the stages of workflow and take decisions on my behalf" (2026-09-15). Every human gate becomes a recorded decision; hard stops NOT crossed autonomously: production deploy, GitHub/Vercel account resource creation, domain purchase, publishing the resume/any PII. Report to Tushar at each MILESTONE boundary + major stage gates. Full mandate + boundaries: `docs/ledger.md` "SESSION AUTHORIZATION".

**Phase 1 = M-001 (tracer + visual direction): COMPLETE & MERGED to `main`.** TKT-01 (TASK-1) + TKT-02 gate (TASK-2) Done in Campfire. Visual direction APPROVED (EXE-6). Suite green (typecheck/lint/test 48, build 5 static routes, e2e 39-0). Baseline `evals/results/baseline-v1.json`. Decisions logged EXE-1..6 (VT flag removed, dev-audit accept, ease tokens, 2xl=1440, VT fallback, visual gate). Fix scars: EVAL-008 (overflow/target/header) + F6 (nav update-loop, hysteresis + regression test).

**NEXT: Phase 2 = M-002 (Foundations & quality harness).** Branch from `main` as `m-002-foundations`. Per §C Phase 2 + PB1: Lane A (on TKT-01 merge — done) TKT-03 (schema+zod gate) → TKT-07 (full eval harness); Lane B (on TKT-02 approval — done) TKT-04→{TKT-05,TKT-06} are already built in the tracer — M-002 Lane B is their promotion to the full primitive board (TKT-04 `/dev/primitives`) + layout/SEO tickets. Read §C Phase 2 row for the exact ticket list + QA gate (EVAL-013/016/006/007/008/010/017 + first full eval-run vs baseline). Carry-forwards (avatar balance→M-003, perf→TKT-14/49, DRAFT copy→Tushar): see `docs/ledger.md`.
Read, in order for M-002: `docs/ledger.md` → `technical-plan.md` §B M-002 (S08–S12 area) + §C Phase 2 + §A3 (schema) + §A16 (eval) → `tickets.md` TKT-03..08 → `test-cases.md` M-002 cases → `evaluation-plan.md` → `decisions.md` (EXE-1..6). Then build-workflow Stage 7 + `orchestration-playbook`.

### (historical) Stage-6 baton — superseded by the above
Read, in order: this file → `technical-plan.md` (§0, A, B for M-001, C, E) → `tickets.md` §0.4 map + TKT-01/02/03/07 → `test-cases.md` M-001 cases → `Design.md` §2 tokens + §3 Header/Hero/FeaturedWork/Footer → `evaluation-plan.md` → `decisions.md` (skim all). Then `/Users/tushar/dotfiles/claude/rules/build-workflow.md` **Stage 7** + the `orchestration-playbook` skill.

Execution rules for this project:
1. **Phase 1 = M-001 (TASK-1 tracer bullet, then TASK-2 human visual gate).** Per PB1, TASK-3 (schema + zod gate + failing fixture) and TASK-7 (eval harness) may start after TASK-1 while TASK-2 awaits Tushar. Nothing visual beyond TASK-1 before TASK-2 is approved.
2. Isolation: `Portfolio-clay/` is not yet a git repo — atomic step S01.01 does `git init` on `main`; execute on a branch/worktree per milestone (`m-001-tracer`), never on `main` directly. Keep `backlog/`, `evals/`, `content/media/avatar/candidates/` in the repo; the resume PDF stays git-ignored until sanitised.
3. One fresh implementer subagent per atomic task (brief + report as files under `docs/handoff/`), TDD where a runner exists (Vitest/Playwright), documented browser checks otherwise; two-stage review (spec, then quality) with the bounded fix loop; a **separate QA-tester subagent at each phase boundary** runs the phase's TC + EVAL cases and reports PASS/FAIL per ID.
4. Keep the PWA current: move tickets with `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/scripts/orchestrator/move-ticket.sh"` (statuses To Do / In Progress / In Review / Blocked / Done); never hand-edit `backlog/`; append `EXE-n` decisions as they are made; keep `tickets.md` status column in sync.
5. Baseline: the first full `pnpm eval` on the tracer bullet writes `evals/results/baseline-v1.json`; rerun on every behaviour-changing ticket.
6. Everything on E Drive (pnpm store already, set `PLAYWRIGHT_BROWSERS_PATH` + `TMPDIR` under `/Volumes/E Drive/Dev/.scratch/portfolio-clay/`, Next cache in-repo).
7. Human-in-the-loop points: TASK-2 visual gate (screenshots at 390/768/1024/1440 + the 6-item 5-second checklist), avatar in situ, 5-second test at M-003, deploy approval at TKT-53. Never fake them.

## Guardrails carried forward
Every claim traces to `CONTENT_INVENTORY.md` (zod fails the build otherwise) · never publish PII, PMP/SAFe claims, TeachSpark sandbox code, `.env`, ROMs · the cinematic site and `portfolio/index.html` are untouchable · footer = "Built with curiosity." · no dark mode, no contact form, no live LLM · all thresholds in `evaluation-plan.md` are fixed.
