# Implementer brief — TKT-09 · Ask knowledge base + deterministic Ask adapter (M-003)

Fresh implementer. Execute **TKT-09** (steps per the plan). Model tier: most-capable (the Ask matching algorithm is design-judgment). Branch `m-003-home` (from main; M-001+M-002 merged). Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging, never `git add -A`; leave re-rendered `docs/screenshots/**` unstaged (don't `git checkout` them).

## Read first
- `technical-plan.md` §B M-003 → **TKT-09 steps (S09.xx)** (in the M-003 section, ~lines 621–680) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` **§A4 (Ask adapter, decision TP3)** — the adapter/provider architecture, the matching/normalise/synonyms design, `local-provider` vs the reserved `rag-provider`.
- Decisions in play: **S7** the Ask is DETERMINISTIC behind an `AnswerProvider` (no live LLM in v1); **PB3** 11 Ask prompts total split by `surface` (5 home + 6 panel), EVAL-012 unchanged; **E-10** suggested-prompt counts split 5/6 validated at build; **EVAL-012** (the Ask must answer the 11 canned prompts correctly, 5/5 home + …, 0 fabricated) and **EVAL-013** (every answer's evidence links resolve; no unsourced claims).
- Content: the Ask knowledge + the 8 DRAFT + 3 canned answers live in `CONTENT_INVENTORY.md` (§1.3 prompts, §9 evidence links) — take verbatim; DRAFT answers ship DRAFT-labelled (plan default; Tushar signs off later). Reuse `lib/anchors.ts` `routes()` so evidence hrefs resolve.

## Scope (this ticket = the DATA + LOGIC layer only; the UI is TKT-10/11)
- `data/knowledge.ts` — the typed knowledge entries + the 11 prompts (with `surface: 'home'|'panel'`), each answer with sourced evidence links (validated by the TKT-03 schema / `validateAll`).
- `lib/ask/{adapter,normalise,synonyms,local-provider,rag-provider,index}.ts` — deterministic matcher (normalise query → synonym expand → score against knowledge → return the best answer + evidence, or a graceful "no match" state); `rag-provider` is a reserved stub (documented, unused in v1 — the `AnswerProvider` interface both implement); `index` exports the wired local provider.
- Tests: `tests/unit/{ask-*,eval-012,rag-provider}.test.ts` — the matcher returns the correct answer for all 11 canned prompts (EVAL-012), synonym/normalise unit coverage, no-match fallback, and **no fabricated claims** (every returned fact traces to a knowledge entry with evidence).

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content passes the build gate (`validateAll`). Do NOT build any Ask UI/component here (that's TKT-10 inline + TKT-11 panel). No live LLM, no network in the local provider.
- Every step has a hard Gate; if the plan/§A4 is ambiguous on the matching algorithm, STOP and report the breaker rather than inventing scoring that could fabricate answers.
- Commit: `feat(m003): TKT-09 Ask knowledge base + deterministic adapter` + Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (prebuild content-gate passes with the new knowledge data); EVAL-012 unit proof (11/11 prompts answered, 0 fabricated). Write `docs/reports/TKT-09.md` (per-step gates, the 11-prompt EVAL-012 result, evidence-link resolution, `git diff --stat`). Final 5-line summary: steps done, EVAL-012 result (prompts answered/fabricated), DRAFT answers flagged, blockers, deviations, commit SHA.
