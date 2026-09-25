# Shared brief — M-009 Phase A + B fan-out (9 parallel implementers)

Tushar asked to fan out Phase A + B now (2026-09-25, "time matters"). You are ONE of nine implementers working **in parallel, each in your own git worktree and branch**. Your dispatch message names your ticket, worktree and model. The orchestrator merges all branches afterwards.

## Your worktree (non-negotiable)
- Work only in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-tkt-<NN>/` on branch `m009/tkt-<NN>` (verify with `git branch --show-current` and `pwd`). **Never** touch `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` (another agent is working there) or another ticket's worktree. Never push, never merge, never rebase.
- Planning docs are identical in your worktree (`technical-plan.md`, `tickets.md`, `test-cases.md`, `Design.md`, `decisions.md`) — read them there.

## The heavy-step lock (8 GB host — required)
Every memory-heavy command MUST go through the lock script, or nine builds will OOM the machine and every agent's tests will flake:
`"/Volumes/E Drive/Dev/.scratch/m009/heavy.sh" pnpm <cmd>` for: `typecheck`, `lint`, `build`, `test` (full vitest), `test:e2e`, `eval`, `start`, bundle-budget, screenshots. The script waits for the lock (other agents are queued — waiting is expected), kills any stale `:3000` server, runs your command, releases. To run a build **and** tests against it, chain them inside ONE lock call: `heavy.sh zsh -c 'pnpm build && pnpm test:e2e --project=w1440 --project=w390 tests/e2e/<your>.spec.ts'` (Playwright starts `pnpm start` itself via `webServer`). Outside the lock you may only read/edit files and run `pnpm exec vitest run <single test file>`.
- Keep lock holds short and batched: develop against single-file unit tests, then do **one** locked gate run near the end (typecheck + lint + tokens + full unit + build + your e2e specs + your `pnpm eval --only …`), plus at most one fix re-run. The orchestrator runs the FULL e2e suite once on the merged branch — you run your ticket's specs plus any spec your change could affect.

## What changed since the plan was written (read these decisions first)
- `decisions.md` **EXE-15** (home hero is now a full-bleed banner), **EXE-18 + Design §11 Dev-24** (every page already opens with its scene as a full-bleed `SceneOpener` banner + torn edge — built in TKT-95; **do not rebuild or re-place the page scene**: where your plan says "scene bleed opener" (TKT-80) or "taped photo" header (TKT-81), the opener already exists above your content — build the rest beneath it and delete only the legacy markup your plan replaces), **EXE-16** (Lenis smooth scroll — in-page anchors go through the scroll helper TKT-94 added in `lib/focus.ts`; don't add `scroll-behavior`), **EXE-17** (a perf ticket is changing image/font loading in parallel — don't touch `next.config.ts`, `app/layout.tsx` font loaders or `components/paper/SceneBanner.tsx`), **EXE-19**, Design §11 **Dev-19…24**.
- Scene openers sit on `/work`, `/work/[slug]`, `/thinking`, `/thinking/[slug]`, `/about`, `/playground`, `/contact`; the opener's torn edge counts 1 decoration in its own `<section>`.

## File ownership (to keep the merge clean)
| Ticket | Owns (may edit freely) |
|---|---|
| TKT-75 | `components/projects/{FeaturedWork,ProjectCard}.tsx`, `tests/unit/ProjectCard.test.tsx`, `tests/e2e/featured.spec.ts` |
| TKT-76 | `components/home/HowIThink.tsx`, `lib/stages.ts`, `tests/unit/how-i-think.test.tsx`, `tests/e2e/how-i-think.spec.ts` |
| TKT-77 | `components/ai/*`, `app/dev/ask/**`, `tests/e2e/{ask-inline,ask-panel}.spec.ts` |
| TKT-78 | `lib/og.tsx`, `assets/fonts/*`, `app/**/opengraph-image.tsx`, `tests/unit/seo.test.ts`, `tests/e2e/eval-017.spec.ts`, `docs/og/m-009/` |
| TKT-80 | `components/projects/{WorkHero,FilterTabs,WorkIndex,WorkGrid,EmptyState,ExperienceStrip,EditorialGrid}.tsx`, `app/work/page.tsx`, `tests/unit/{filters,work-grid}.test.tsx`, `tests/e2e/work.spec.ts` |
| TKT-81 | `components/case-study/{CaseStudyHeader,MetricStrip,OverviewToggle,NextProject}.tsx`, `app/work/[slug]/page.tsx` (structure), `tests/e2e/{case-study,eval-014}.spec.ts` |
| TKT-82 | `components/case-study/{Learnings,Sources}.tsx`, `lib/sources.ts`, `tests/unit/case-study-{learnings,sources}.test.ts(x)` — in `app/work/[slug]/page.tsx` only mount your two sections in their §7.3 slots (minimal, clearly commented lines) |
| TKT-83 | `components/case-study/{Chapter,ChapterNav}.tsx`, `components/case-study/artifacts/*`, `components/interactions/{ShowTheThinking,ThinkingNode}.tsx`, `app/dev/{artifacts,thinking}/**`, `tests/unit/{artifacts,thinking-motion}.test.ts(x)`, `tests/e2e/artifacts.spec.ts` — in `app/work/[slug]/page.tsx` only minimal, commented changes |
| TKT-84 | `components/thinking/*`, `app/thinking/**`, `tests/unit/writing.test.ts`, `tests/e2e/{thinking,thinking-page}.spec.ts` |

**Shared files — append-only, minimal:** `app/globals.css` (add CSS **only** inside a `/* TKT-<NN> · <name> */ … /* end TKT-<NN> */` block appended at the end of the file; never edit another block or the tokens), `tests/e2e/eval-007.spec.ts` / `eval-010.spec.ts` (add your own `describe` block; don't edit others), `tests/e2e/eval-018-parked.json` (don't touch — the only parked entry is `/about`, outside this fan-out), `content/media/illustrations/manifest.ts` and `docs/eval.md` (don't touch). If you believe you must edit a file another ticket owns, **don't** — note it in your report; the orchestrator resolves it at merge.

## Rules that still apply
Plan of record: `technical-plan.md` §F3 section for your ticket (steps, contracts, gates), `tickets.md` ticket AC + DoD (Paper DoD), `test-cases.md` Related TCs, `Design.md` §7.x for your route + §3 decoration counting + §3.3 planned counts. Copy verbatim from `data/*.ts` (D7). Tokens only (EVAL-020). Decorations ≤ 4 per section (EVAL-018 — your routes must pass). S18 regression tests (TC-157 learnings, TC-164 single DRAFT prefix) are mandatory where your ticket owns them. Never lower a threshold, skip or delete a test. GateGuard asks for facts on the first Edit/Write per file — state them and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`; restore churned `docs/screenshots/**` you didn't produce. Everything on `/Volumes/E Drive`. Commits on your branch with the Co-Authored-By trailer naming your actual model, ticket id in the subject.

## Output
`docs/reports/TKT-<NN>.md` in your worktree (committed): AC checklist with evidence, files changed, shared-file edits (exact blocks), gate outputs (numbers), screenshots you took (Read them), merge notes (files you needed but don't own). Final chat reply ≤ 10 lines: branch + SHAs, gate summary, merge notes.
