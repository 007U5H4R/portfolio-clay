# Implementer brief — TKT-04 · Clay primitive system complete + common primitives (M-002)

Fresh implementer. Execute **TKT-04 only** (steps S04.01–S04.09). Model tier: most-capable for S04.01–05 (the tier/prop system), standard for S04.06–09. The tracer (TSK-03) built MINIMAL versions of these primitives — this ticket EXTENDS them to the full contract; do not rebuild from scratch, evolve what exists. Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-002-foundations`. Standard guardrails (E-Drive only; don't touch main/backlog/docs ledger+briefs/sibling portfolio; explicit-path staging, never `git add -A`).

## Read first
- `technical-plan.md` §B M-002 → **TKT-04 steps S04.01–S04.09** (lines ~556–564) — authoritative.
- `Design.md` §3 (full primitive anatomy, tones, states) + §2 tokens. Existing tracer primitives in `components/clay/` and `components/common/` (extend these).
- Conflicts/decisions in play: **E-7** ClayButton primary = `bg` text on `accent`; **D1** discriminated `ClayProps` (flat+tone / flat+interactive / utility+interactive(non-filter) are type errors); **EXE-3** motion easing tokens exist in `globals.css` (`--ease-*`); **EXE-4** `--breakpoint-2xl:1440`.

## Steps (each has a hard Gate)
- **S04.01** Finalise `components/clay/tiers.ts` (hero r34 / card r28 / utility r14 + utility has no press state / flat none; `headerGlassClass` exported separately — glass is NOT a tier; `interactive` disallowed on utility unless `variant:'filter'`). Gate: TYPECHECK with `@ts-expect-error` for flat+tone, flat+interactive, utility+interactive(non-filter).
- **S04.02** `ClayCard` full (tone × tier × interactive × `as` × padding; tone gradient overlay via `after:` + `--gradient-clay-volume`; 6% darker bottom inset). Gate: jsdom matrix 7 tones × 4 tiers; flat has zero shadow/bg-image classes.
- **S04.03** `ClayButton` full (add `size:'md'|'lg'`, `trailingIcon`, `loading` (spinner + `aria-busy`), `download`, `external` → `target=_blank rel=noopener` + VisuallyHidden "opens in new tab"). Gate: jsdom external renders hidden note; LINT.
- **S04.04** `ClayPill` (`variant:'filter'` button-tab hover/active states 40–44px; `variant:'tag'` static span no hover; `variant:'link'` anchor pill + trailing arrow). Gate: Playwright (S04.08) — filter bg changes on hover, tag identical.
- **S04.05** `ClayTile`/`ClayFrame`/`ClayIcon` complete + `.glass` utility in globals.css (`backdrop-filter blur(12px); background: color-mix(in oklch, var(--color-bg) 80%, transparent)`). Gate: `grep -n "glass" components/clay/*.tsx` → 0 (glass never combined with clay; Header uses `.glass` only in compact state); keep `--color-` DEFINITIONS at 13 (`pnpm tokens:check`).
- **S04.06** Common primitives: `Icon` (final), `Tag` (→ ClayPill tag), `ExternalLink`, `CopyButton` (skeleton, states idle|copied|error — behaviour in TKT-14), `VisuallyHidden`, `Prose` (flat, `max-w-[60ch]`, no clay props). Gate: TYPECHECK; Prose type has no tier prop.
- **S04.07** `/dev/primitives` board — every primitive × tier × tone, states via `data-state`, labelled sections; `lib/dev-only.ts` guard. Gate: `ALLOW_DEV_ROUTES=1 pnpm start` renders; production start → 404.
- **S04.08** `tests/unit/clay.test.tsx` + `tests/e2e/primitives.spec.ts` (hover assertions, axe @390/1440, minTargets, screenshots → `docs/screenshots/primitives/{390,1440}.png`). Gate: UNIT + `pnpm test:e2e --grep primitives` green; 2 PNGs.
- **S04.09** Regression + wrap: `pnpm eval --only EVAL-006,EVAL-007,EVAL-008,EVAL-010` no regression vs baseline-v1.

## Rules
- Everything on E Drive. Extend the tracer primitives; no new primitives beyond the S04 list. Do NOT install Chromium (already on E-Drive from M-001); use `.env.tooling` for e2e.
- Commit: `feat(m002): TKT-04 complete clay primitive system + /dev/primitives board` + Co-Authored-By trailer. Explicit paths only.
- If a Design.md primitive contract conflicts with a token/D1 rule, STOP and report the breaker.

## Finish
`pnpm typecheck && lint && test && build` green; e2e primitives green; 2 screenshots. Write `docs/reports/TKT-04.md` (per-step gates, the `@ts-expect-error` proofs, screenshot paths, `git diff --stat`). Final 5-line summary: steps, gates, screenshots, blockers, deviations, SHA.
