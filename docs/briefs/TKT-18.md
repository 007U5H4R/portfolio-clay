# Implementer brief — TKT-18 · DemoVideo component + dev board (M-004)

Fresh implementer. Execute **TKT-18** (per §B M-004 TKT-18 + tickets.md TKT-18 ACs). Model tier: standard. Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-004 → **TKT-18** + `tickets.md` TKT-18 ACs + `Design.md` §3 DemoVideo + §A13 (failure modes: video 404/network → "View live →" or "Demo coming"; missing video → `no-video` state, never a broken `<video>`). `data/schema.ts` (the `Media`/video fields — video is OPTIONAL).

## Scope
- `components/projects/DemoVideo.tsx` — reusable player with the **four states (EVAL-014)**: loading (poster + spinner), playing, **error** (network/404 → visible fallback "View live →" link or "Demo coming"), and **no-video** (missing video in data → labelled placeholder, NEVER a broken `<video>`). `[video]` console.warn on error (A12, no silent failure); poster/lazy; reduced-motion safe; accessible controls (keyboard, labels, ≥44 targets).
- `app/dev/video/page.tsx` — dev-only board exercising all four states (dev-route guard; 404 in prod). `tests/e2e/eval-014.spec.ts` (@EVAL-014 — asserts all four states render correctly).
- NOTE: real demo videos are NOT in scope (they're the M-005 media tickets TKT-22–27). This ticket builds the COMPONENT + its graceful states; it will render `no-video`/placeholder for projects until M-005 supplies files.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes. NEVER a broken `<video>` or silent failure — every failure path has a visible state + console.warn. Do NOT commit any video binaries (M-005). Keyboard-accessible, ≥44 targets, no dead controls. Every step gated; if a Design/A13 contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m004): TKT-18 DemoVideo component + four states + dev board` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green; `pnpm test:e2e --grep 'eval-014|video'` green (four states); `/dev/video` renders in dev, 404 in prod; `pnpm eval --only EVAL-014,EVAL-011,EVAL-015` no regression. Write `docs/reports/TKT-18.md`. Final 5-line summary: steps, the four states verified, gates, blockers, deviations, commit SHA.
