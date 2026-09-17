# Implementer brief — TKT-11 · AskPanel slide-over + focus trap + wire real AskAIButton (M-003)

Fresh implementer. Execute **TKT-11** (steps per the plan). Model tier: most-capable (focus-trap + global panel state). Branch `m-003-home`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` unstaged (don't `git checkout`).

## Read first
- `technical-plan.md` §B M-003 → **TKT-11 steps** — *Files / Contract / Gate* authoritative.
- `Design.md` §3 AskPanel + **E-8** (AskPanel width 400px right drawer at 768–1023 too), §A4/§A6 (Ask + panel-slide easing = `--ease-panel`). `components/ai/*` (TKT-10, DONE) + `lib/ask` (TKT-09).
- Decisions: **PB3** panel surface = the 6 `surface:'panel'` prompts; **S7** deterministic; AskPanel is a **lazy chunk** (`AskPanelLazy`) so it doesn't inflate `/` first-load (perf-sensitive — bundle already 239.7kB).
- **Carry-forward from TKT-10:** `AskProvider` is currently scoped in `app/page.tsx` — **hoist it to `app/layout.tsx`** so the panel is a shared global (available on every route), and remove the page-scoped provider.

## Scope
- `components/ai/{AskPanel,AskPanelLazy}.tsx` — right slide-over drawer (400px ≥768; full-screen <768), the 6 panel prompts + reused AnswerView/EvidenceLinks; open/close via a global state (context or store) toggled by the header AskAIButton + MobileMenu row; `--ease-panel` slide, reduced-motion instant; scrim fades 150ms.
- `lib/focus.ts` — focus trap (focus moves into the panel on open, cycles within, `Esc`/scrim closes, focus RETURNS to the trigger; `overflow:hidden` on `html` while open).
- Wire the REAL Ask: `components/navigation/AskAIButton.tsx` (remove the tracer `aria-disabled`/"coming in this build" state → opens the panel) + `components/navigation/MobileMenu.tsx` (its Ask row opens the panel). **Remove the `ask-ai-disabled` entry from `tests/e2e/crawler-allowlist.json`** (the control is now live, not disabled).
- `app/layout.tsx` (hoist AskProvider + mount AskPanelLazy), tests `tests/e2e/{ask-panel,eval-007}.spec.ts`.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes. AskPanel MUST be a lazy chunk (verify it's not in `/` first-load). No live LLM/network; query never rendered as HTML. Focus-trap is EVAL-007-critical (keyboard: trap, Esc, focus-return; axe 0 critical/serious with panel open at 390 & 1440). Every step has a hard Gate; if a Design/A4/E-8 contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m003): TKT-11 AskPanel + focus trap + live AskAIButton` + Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green; `pnpm test:e2e --grep 'ask-panel|eval-007'` green; `pnpm eval --only EVAL-005,EVAL-006,EVAL-007,EVAL-010,EVAL-011` no regression (EVAL-011: the live AskAIButton is no longer allowlisted-disabled → must pass as a real control; EVAL-005 bundle: confirm AskPanel is NOT in `/` first-load). Write `docs/reports/TKT-11.md`. Final 5-line summary: steps, gates (focus-trap/EVAL-007 + panel lazy-chunk confirmation + EVAL-011 live button), blockers, deviations, commit SHA.
