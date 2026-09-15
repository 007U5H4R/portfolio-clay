# Execution Ledger — Clay Portfolio · Stage 7

Committed, survives context resets. The orchestrator updates this after every task/step. Source-of-truth order: implementation code > PWA (Campfire) > this ledger / Markdown artifacts. Native Backlog IDs (id-map.json): TKT-01→TASK-1 … TKT-53→TASK-49.

## Environment (verified 2026-09-15, session start)
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — everything (repo, node_modules, pnpm store, Playwright browsers, Next cache, scratch) stays on E Drive (global scar).
- Internal disk: 22 GiB free / 35% used at start — recheck before installs.
- Node **v26.7.0** (matches A9 pin "Node 26.7"), pnpm **11.25.0** (matches). pnpm store: `/Volumes/E Drive/Dev/.pnpm-store/v11`. E-Drive `.cache` / `.scratch` / `.pnpm-store` present.
- PWA: Campfire, project `portfolio-clay`, onboarded Stage 6.2. Move statuses with `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/scripts/orchestrator/move-ticket.sh" "<root>" <TASK-id> "<status>"` (To Do / In Progress / In Review / Blocked / Done). Never hand-edit `backlog/`.

## SESSION AUTHORIZATION (2026-09-15) — autonomous mandate
Tushar is AFK and authorized: "complete all the stages of workflow and take decisions on my behalf." Therefore:
- **Every human-in-the-loop gate becomes a recorded decision, not a stop.** The TKT-02 visual gate is decided by the orchestrator (screenshots still captured as evidence; rubric scored; call logged as EXE-1). All open content/product questions take the plan's §E defaults, each logged EXE-n.
- **Hard stops NOT crossed autonomously (build up to them, leave turnkey):** (1) production deployment (external/irreversible); (2) creating a GitHub repo or Vercel project under Tushar's account, or buying a domain (account-scoped/cost; domain unknown); (3) publishing the resume/any PII — `resumeAvailable` stays false (PB5), which itself hard-blocks prod; (4) publishing unverified claims — build-time schema gate stays enforced, no threshold weakening.
- Net: drive code (M-001…M-007) + Stages 8–10 + `QA-report.md` to a deploy-ready branch; stop before external resource creation / prod promotion. Leave a turnkey checklist for Tushar.
- GateGuard hook left ON (safety); orchestrator self-answers its fact-check per file.
- **Reporting cadence (Tushar's request):** post a self-contained summary to Tushar at each MILESTONE boundary (M-001…M-007) and each major stage gate (8 Design Critique, 9 Code/Test, 10 Security, 11 Deploy), plus any hard blocker or decision awaiting him. Not per-task.

## Orchestration decisions (execution mechanics; not formal EXE entries)
- **Isolation = in-place branch `m-001-tracer`** (main stays at the planning commit), NOT the sibling worktree §A10 suggests. Reason: every concrete S01.xx gate and §0.2 path target `Portfolio-clay/` directly (S01.03 scaffolds *into the existing folder*; S01.01 gate is `git -C .../Portfolio-clay`); a sibling worktree would break those paths. HANDOFF rule 2 and the Stage-7 prompt both authorize "branch `m-001-tracer`". `EXE-1` is reserved for the TKT-02 visual-gate decision per S02g.03.
- **Subagent model tiers:** most-capable → `opus`, standard → `sonnet`, cheap → `haiku` (this harness's Agent tool takes a per-call `model`, so mixing tiers per dispatch is supported here). One fresh implementer per TSK; brief = `docs/briefs/<TSK>.md`, report = `docs/reports/<TSK>.md`.

## Phase 1 = M-001 · Tracer bullet + visual gate
DAG: **TSK-01 → {TSK-02, TSK-03} → {TSK-04, TSK-05, TSK-06} → TSK-07 → [TKT-02 human visual gate]**. Per PB1, after TKT-01 the M-002 non-visual tickets TKT-03 (schema) & TKT-07 (harness) may proceed in parallel with the TKT-02 wait; NO further visual work before TKT-02 approval.

| Task | Native | Tier | Status | Report | Notes |
|---|---|---|---|---|---|
| Repo setup / S01.01 | — | orchestrator | ✅ done | this ledger | git init, .gitignore, README, planning commit, branch m-001-tracer |
| TSK-01 scaffold + tokens | TASK-1 | opus | ✅ done | TSK-01.md | commit db5f7be; all gates green (build "all routes static (1)", tokens 13/13, fonts self-hosted). Reviewed+accepted. |
| TSK-02 avatar pipeline | TASK-1 | sonnet | ✅ done | TSK-02.md | commit 68bbb51; avatar.webp 94.7kB, alpha ok, 1450×1800. S02.02 spec authored, edge-shot deferred to TSK-07. Accepted. |
| TSK-03 clay primitives | TASK-1 | sonnet | ✅ done | TSK-03.md | commit 61ab50d; 35 tests, D1 proof ×2, /dev/primitives 200-dev/404-prod. Accepted. Surfaced ease-token gap → orchestrator fix EXE-3. ClayTileSize widened +40 (additive). |
| TSK-04 Header/Nav/Mobile | TASK-1 | sonnet | ✅ done | TSK-04.md | commit 43927c0; 39 tests; easings synced to EXE-3; nav=Home·Work·Thinking·About. Accepted. Devs: useSyncExternalStore hooks, matchMedia-direct reduced-motion, TP mark=ClayTile40. |
| TSK-05 Hero/Avatar/Tiles | TASK-1 | opus | ✅ done | TSK-05.md | commit 486f677; build static(4), 41 tests. Accepted. Fixed breakpoint (EXE-4). DRAFT copy: eyebrow/headline/support (ship DRAFT-labelled, list for Tushar). |
| TSK-06 ProjectCard/VT | TASK-1 | opus | ✅ done | TSK-06.md | commit 3bb9540; A14 fallback (EXE-5); 48 tests, static(5), /work/teachspark 200 /nope 404, tokens 13/13. VT hooks dormant (plain nav — browser won't fire morph without React VT). Accepted. |
| TSK-07 shots + eval + baseline | TASK-1 | opus | ✅ done | TSK-07.md | commits 212cae4+8ac938b; Chromium on E-Drive (df unchanged), baseline-v1.json (schema 1, 17 cases). EVAL-006/010/015 PASS, 004 PASS(info). **EVAL-008 FAIL** (F1 overflow@1024, F2 logo 40px), F3/F4 design deviations, F5 perf info. Avatar edge: no halo. |
| TKT-01 fix wave (F1/F2/F4) | TASK-1 | sonnet | ✅ done | TKT-01-fix | commit a477b03; EVAL-008 FAIL→PASS (0 overflow, 0 sub-44), header 96/68 exact, avatar responsive caps. Screenshots regenerated. But surfaced F6. |
| TKT-01 fix wave 2 (F6) | TASK-1 | opus | 🔄 in progress | F6-debug | **F6 (P1):** prod-only React #185 infinite-loop on nav /→/work/teachspark @w768 reduced-motion; suspect useScrollY↔header-compaction layout-feedback oscillation. Debugging w/ systematic-debugging + regression test. Visual gate BLOCKED until fixed. |
| TKT-02 visual gate | TASK-2 | Tushar | ⬜ pending | gate-tracer.md | STOP: screenshots 390/768/1024/1440 + 6-item checklist |

## Conflicts already resolved (§E — read before TKT-01)
E-1 footer "Built with curiosity." · E-6 split card-padding tokens · E-7 ClayButton primary = bg text on accent · E-9 nav = Home·Work·Thinking·About · E-11 featured cards use ClayIcon not imagery · E-12 verify VT export name at S06.01 · E-13 resume both states covered. Full table: technical-plan.md §E.

## Open items (defaults applied; Tushar's calls) — do not block execution
TeachSpark metric date (08-24) · RailCite figure policy (live-with-date) · Cubicle deploy (N/A) · domain name · sanitised resume PDF (hard-blocks TKT-53 only) · GitHub repo creation · years wording ("7+"). Full list: §E "Open items carried".

## Carry-forwards (read before the named task)
- **TSK-07 gates:** (a) LCP hint check must be `grep -ic 'fetchpriority="high"'` (≥2: img + preload) — React 19 serialises `fetchPriority` camelCase, so the plan's `grep -c` returns 0 (false negative). (b) Colour-token invariant = `pnpm tokens:check` (13/13) or `grep -cE '^\s*--color-[a-z0-9-]+:'` (13); the crude `grep -c '--color-'` is polluted by var() refs (EXE-4 note). (c) At w1440 the hero frame is now 520 (EXE-4 breakpoint fix).
- **DRAFT copy for Tushar (M-001 gate):** hero eyebrow triad, headline, support line are DRAFT (shipped DRAFT-labelled per plan default). Tagline + 3 tile one-liners are VERIFIED.
- **TSK-04 / S04.01:** `lib/motion.ts` `easings` object MUST equal the CSS `--ease-*` values just added to globals.css (EXE-3): hover=`cubic-bezier(0.23,1,0.32,1)`, reveal=`cubic-bezier(.2,.7,.2,1)`, panel=`cubic-bezier(0.32,0.72,0,1)`, vt=`cubic-bezier(.77,0,.175,1)`. JS/CSS duplication kept in sync.
- **TSK-06 / S06.01:** `experimental.viewTransition` is GONE in Next 16.3.5 (EXE-1). VT is built into the App Router. S06.01 must still verify the React `<ViewTransition>` export name and behaviour before writing VT code (E-12), using the built-in App Router mechanism (`<Link transitionTypes>` / app-router-context), NOT the removed config flag.
- **Stage 10 / QA-report:** accepted-risk EXE-2 (two dev-only `extract-zip` highs via `ignoreGhsas`) must appear in the accepted-risks register.
- **Minor TSK-01 choices (report, not decisions.md):** `agentRules:false` (stops Next auto-writing AGENTS.md/CLAUDE.md), `allowBuilds.esbuild:true` (tsx/vitest), base-layer colours via `@apply`, explicit-path git staging, `*.tsbuildinfo` added to .gitignore by orchestrator.

## Log
- 2026-09-15 — Stage 7 opened. Read HANDOFF + technical-plan §0/A9/A10/B(M-001)/C/E, verified env. Reconciled stale memory (Solution-PRD was Approved 2026-09-15; memory was pre-sign-off). Setup done. Next: dispatch TSK-01 (opus).
