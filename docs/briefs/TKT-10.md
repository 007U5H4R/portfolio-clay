# Implementer brief — TKT-10 · Ask inline UI (AskProvider + AskPortfolio + AnswerView) (M-003)

Fresh implementer. Execute **TKT-10** (steps per the plan). Model tier: most-capable. Branch `m-003-home`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` unstaged (don't `git checkout`).

## Read first
- `technical-plan.md` §B M-003 → **TKT-10 steps** (M-003 section) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` §A4 (Ask adapter) + §A1 (client boundaries). `lib/ask/*` + `data/knowledge.ts` (TKT-09, DONE) — this ticket is the UI over that deterministic engine. `Design.md` §3 Ask (inline answer, suggested prompts, evidence links).
- Decisions: **S7** deterministic (no live LLM); **PB3** 5 home prompts / 6 panel (this ticket = the HOME inline surface, `surface:'home'` → 5 prompts); answers render DRAFT-labelled where `draft:true`; every answer shows resolving EvidenceLinks (EVAL-013). Never render the user query as HTML (XSS — answers come from data only).

## Scope (inline Ask UI + the AnswerProvider wiring; the slide-over PANEL is TKT-11)
- `components/ai/{AskProvider,AskPortfolio,AnswerView,SuggestedPrompts,EvidenceLinks}.tsx` — `AskProvider` wraps `lib/ask` local provider; `AskPortfolio` inline input + 5 home suggested prompts; `AnswerView` renders the deterministic answer + DRAFT badge + EvidenceLinks; graceful no-match + error states (Design.md four states). `app/dev/ask/page.tsx` (dev-only harness board), `tests/unit/use-ask.test.tsx`, `tests/e2e/ask-inline.spec.ts`, `docs/screenshots/ask/`.
- Accessibility (EVAL-007): keyboard-operable, focus-visible ring, the expand uses the `motion` layout spring (A6 askExpand) reduced-motion-safe; targets ≥44 (EVAL-008); no console errors.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes. Never a live LLM/network. Do NOT build the AskPanel slide-over (TKT-11) or wire it into the header (TKT-11 removes the tracer AskAIButton disabled state). Every step has a hard Gate; if a Design/A4 contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m003): TKT-10 Ask inline UI (provider + portfolio + answer view)` + Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green; `pnpm test:e2e --grep ask-inline` green; `pnpm eval --only EVAL-007,EVAL-008,EVAL-010,EVAL-012` no regression vs baseline. Write `docs/reports/TKT-10.md` (per-step gates, the 4 states verified, EVAL results, `git diff --stat`). Final 5-line summary: steps, gates, a11y/EVAL-007 result, blockers, deviations, commit SHA.
