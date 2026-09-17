# Implementer brief — TKT-21 · ShowTheThinking interactive reveal + dev board (M-004)

Fresh implementer. Execute **TKT-21** (per §B M-004 TKT-21 + tickets.md TKT-21 ACs). Model tier: standard. Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-004 → **TKT-21** + `tickets.md` TKT-21 ACs + `Design.md` §3/§4 ShowTheThinking (per Design §4: the thinking nodes reveal — "all 8 appear at once, opacity only", CSS transition `cubic-bezier(.2,.7,.2,1)`/`--ease-reveal`, 220ms, 120ms/node stagger) + `data/thinking-framework.ts`/`lib/stages.ts` (TKT-13, reuse). `Reveal` (TKT-05).

## Scope
- `components/interactions/{ShowTheThinking,ThinkingNode}.tsx` — the interactive "show the thinking" reveal used within case studies (a toggle that reveals the reasoning nodes; per Design all nodes appear together, opacity-only, reduced-motion → instant). Accessible: the toggle is a real button (aria-expanded), keyboard-operable, focus-visible; revealed content is in the DOM (not display:none-gated in a way that hides it from JS-off/AT — follow the Reveal pattern: content present, animation is enhancement).
- `app/dev/thinking/page.tsx` — dev-only board (guard: 404 prod). `tests/e2e/thinking.spec.ts`.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes (any node copy sourced/DRAFT-labelled — reuse TKT-13's framework data, no fabrication). Reduced-motion safe (EVAL-010), keyboard (EVAL-007), ≥44 targets (EVAL-008), axe-clean (EVAL-006), no dead controls. Every step gated; if a Design/§4 motion contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m004): TKT-21 ShowTheThinking reveal + dev board` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green; `/dev/thinking` 200 dev / 404 prod; `pnpm test:e2e --grep thinking` green; `pnpm eval --only EVAL-003,EVAL-006,EVAL-007,EVAL-008,EVAL-010` no regression. Write `docs/reports/TKT-21.md`. Final 5-line summary: steps, gates (reveal behaviour + reduced-motion + keyboard), dev-board 200/404, blockers, deviations, commit SHA.
