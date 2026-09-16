# Implementer brief — TSK-01 · Scaffold Next 16 + token file (M-001 / TKT-01)

You are a fresh implementer subagent. Execute **TSK-01 only**. Model tier: most-capable. Do exactly what the plan says — no extra features, no files outside the step list. This is the tracer bullet's foundation; correctness and fidelity to the plan matter more than speed.

## Working context
- Repo root (cwd for everything): `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/`
- Git: already initialised; you are on branch **`m-001-tracer`** (do NOT run `git init`, do NOT switch/create branches, do NOT touch `main`). **S01.01 is already done by the orchestrator** — start at **S01.02**.
- EVERYTHING stays on `/Volumes/E Drive` (repo, node_modules, pnpm store, Next cache, scratch). Never write build/cache/temp to the Mac internal disk. Record `df -h /` before and after `pnpm install` in your report (global scar guard).
- Node v26.7.0, pnpm 11.25.0 are the intended runtime (A9). pnpm store is already at `/Volumes/E Drive/Dev/.pnpm-store/v11`.

## What to read first (do not rely on this brief alone for exact contracts)
1. `technical-plan.md` §B → **TSK-01 steps S01.02–S01.08** (lines ~472–478) — each step's *Files / Contract / Gate* is authoritative; follow verbatim.
2. `technical-plan.md` §A9 (tooling — the full `package.json` scripts table, Vitest/Playwright/LHCI config intent), §A10 (git/.gitignore — already applied), §A1 (architecture — `next.config.ts` SSG, images), §A7 (media pipeline — `images` config for `next.config.ts`).
3. `Design.md` §2 (design tokens — the authoritative token list for S01.05) and `DESIGN_DIRECTION.md` §2 (the 13 authoritative hex colour values for the S01.06 `tokens-check` round-trip).
4. Conflicts you MUST honour (technical-plan §E): **E-5** SSG on the default Next build (NOT `output:'export'`); **E-6** split `--card-padding` (40px) and `--card-padding-hero` (56px) — the Design.md `40px to 56px` range is invalid CSS; **E-12** do NOT write any View-Transition code in this task (that is verified in TSK-06). **E-9** nav copy is Home·Work·Thinking·About (relevant only to later tasks; ignore here).

## Steps (in order) — each has a hard Gate in the plan
- **S01.02** Pin tooling to E Drive: `.env.tooling`, `scripts/env.sh`, `.npmrc`. Gate: env vars resolve to E-Drive paths; `pnpm store path` is the E-Drive store.
- **S01.03** Scaffold Next **16.3.5** into this existing folder via the `create-next-app` → scratch → `rsync` route the plan specifies (create-next-app refuses a non-empty dir). App Router, no `src/`, import alias `@/*`. Gate: `pnpm install` ok; `pnpm dev` then `curl` localhost:3000 → 200; `pnpm typecheck` exits 0.
- **S01.04** Pin the exact dependency set + minimal Vitest (versions per the plan). Gate: the 4 pinned versions present; `pnpm audit --audit-level high` → 0 high/critical; `pnpm test` → 1 passed.
- **S01.05** Token file `app/globals.css` — `@theme` verbatim from Design.md §2 (13 colour tokens as `oklch()`, fonts, fluid text, spacing, radii, shadows, gradient, the two card-padding tokens per E-6), base layer, `.focus-ring`, reduced-motion global, VT timing rules. Gate: `grep -c -- '--color-' → 13`; `--shadow-clay- → 3`; `pnpm build` exits 0.
- **S01.06** OKLCH regeneration guard `scripts/tokens-check.ts` (culori round-trip, `--write` mode). Gate: `pnpm tokens:check --write && pnpm tokens:check → 13/13 tokens round-trip OK`; diff touches only colour lines.
- **S01.07** `app/layout.tsx` (Manrope + Caveat via `next/font/google`, self-hosted, metadata), `lib/site.ts` (site constants + `resumeAction()` — PB5, the ONLY source of truth for resume controls, `resumeAvailable:false`), `.env.example`, `next.config.ts` (images per A7, `experimental.viewTransition:true`, strict mode, no poweredBy). Gate: TYPECHECK, LINT; HTML self-hosts fonts (no `fonts.googleapis.com` in output); `tests/unit/site.test.ts` asserts both `resumeAction()` shapes.
- **S01.08** `scripts/assert-static.ts` + wire the `build` script (TP1). Gate: `pnpm build` → `all routes static (1)`.

## Dispatch rules (from §B.0)
- TDD where a runner exists (write the unit test for `resumeAction()` and the Vitest smoke test as specified). Every step's Gate command must pass with the expected output before you move on. A step that fails its gate is not done — fix it, or if it is a genuine blocker you cannot resolve (e.g. a version pin is unresolvable, create-next-app refuses, VT flag rejected), STOP and report the breaker precisely (command + full error) rather than improvising a different approach.
- Copy/text is taken verbatim from `CONTENT_INVENTORY.md` where a step references a row; flag any DRAFT rows you render.
- Do NOT touch: the cinematic portfolio, `/Volumes/E Drive/Dev/Code/Claude/portfolio/index.html`, `main` branch, `backlog/`, any `.env*.local`, or create a `public/resume.pdf`.

## Finish (required)
1. Run the full trio + build: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — all green (paste outputs in the report).
2. `git add -A` then commit on `m-001-tracer` with message `feat(tracer): TSK-01 scaffold Next 16 + design tokens` and the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. One commit for the whole task.
3. Write **`docs/reports/TSK-01.md`** containing: per-step done/blocked with the actual gate output; the exact pinned versions installed; `df -h /` before/after install; the chosen VT export name IF you happened to discover it (else "deferred to TSK-06"); every DRAFT copy row you rendered; any deviation from the plan (with reason) so the orchestrator can record an `EXE-n`; and `git diff --stat` for your commit (must list only files named in S01.02–S01.08).
4. End your final message to the orchestrator with a 5-line summary: steps completed, gates passed, blockers (if any), deviations, and the commit SHA.
