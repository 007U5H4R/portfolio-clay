# TKT-04 — Clay primitive system complete + common primitives + /dev/primitives board

**Milestone:** M-002 · **Branch:** `m-002-foundations` · **Stage:** 7 (Execution)
**Status:** Complete. All step gates pass; `pnpm typecheck && lint && test && build` green; `pnpm test:e2e --grep primitives` green; 2 screenshots captured; regression eval shows no regression vs baseline.

Extended the tracer's minimal primitives (TSK-03) to the full contract — no rebuilds. Honoured E-7 (ClayButton primary = `bg` on `accent`), D1 (discriminated `ClayProps`), EXE-3 (`--ease-*` tokens), EXE-4 (2xl=1440).

## Per-step gates

| Step | What shipped | Gate | Result |
|---|---|---|---|
| S04.01 | `tiers.ts`: 3-way discriminated `ClayProps`; `headerGlassClass` exported (glass ≠ tier) | TYPECHECK with `@ts-expect-error` for flat+tone, flat+interactive, utility+interactive(non-filter) | **PASS** — `tsc --noEmit` exit 0 (all 3 directives are genuine errors) |
| S04.02 | `ClayCard` full: tone × tier × interactive × `as` × padding; tone-gradient `after:` overlay (isolate + `-z-10`, painted between bg and content); 6% darker bottom in `--shadow-clay-rest` | jsdom matrix (7 tones × hero/card/utility + flat); flat has zero shadow/bg-image | **PASS** — `clay.test.tsx` |
| S04.03 | `ClayButton` full: `size:md/lg`, `trailingIcon`, `loading` (spinner + `aria-busy` + disabled), `download`, `external` → `target=_blank rel="noopener noreferrer"` + VisuallyHidden note | jsdom external renders hidden note; LINT | **PASS** |
| S04.04 | `ClayPill`: `filter` (button, hover `bg-lavender/40`, active `bg-lavender text-ink`, 44px), `tag` (static span, no hover), `link` (anchor + trailing arrow) | Playwright: filter bg changes on hover, tag identical | **PASS** (S04.08 e2e) |
| S04.05 | `ClayTile` (+ interactive on card tier only, D1), `ClayFrame` (opt-in `bezel` token), `ClayIcon`; `.glass` utility in globals.css | `grep "glass" components/clay/*.tsx` → 0; tokens 13/13 | **PASS** — grep 0 matches; `pnpm tokens:check` → 13/13 |
| S04.06 | Common: `Tag`→ClayPill tag, `ExternalLink`, `CopyButton` (skeleton idle/copied/error), `VisuallyHidden`, `Prose` (flat, `max-w-[60ch]`, no clay props); `Icon` unchanged (already final) | TYPECHECK; Prose has no tier prop | **PASS** |
| S04.07 | `/dev/primitives` board — every primitive × tier × tone, states via `data-state`, labelled `<section>`s; `lib/dev-only.ts` guard (unchanged) | ALLOW_DEV_ROUTES build renders; production build → 404 | **PASS** — see dev-route gate below |
| S04.08 | `tests/unit/clay.test.tsx` + `tests/e2e/primitives.spec.ts` (hover, axe @390/1440, minTargets, screenshots) | UNIT + `pnpm test:e2e --grep primitives` green; 2 PNGs | **PASS** — 7 passed / 5 skipped; `docs/screenshots/primitives/{390,1440}.png` |
| S04.09 | Regression | `pnpm eval --only EVAL-006,EVAL-007,EVAL-008,EVAL-010` no regression | **PASS** — see below |

## D1 `@ts-expect-error` proofs (S04.01)

In `tests/unit/tiers.test.ts`, all three compile-time errors are proven (if any stopped being an error, `tsc` would fail on the unused directive):

- `{ tier: "flat", tone: "lavender" }` — flat permits only `tone:'neutral'`.
- `{ tier: "flat", interactive: true }` — flat forbids `interactive`.
- `{ tier: "utility", interactive: true }` — utility has no press state; the only interactive utility-radius control is `ClayPill variant="filter"`, which does not flow through `ClayProps.interactive`.

`ClayProps` is now a 3-branch union (`flat` | `utility` | `hero`/`card`), so `interactive` is structurally impossible on flat/utility. `ClayTile` mirrors the same discrimination (interactive on card tier only).

## Dev-route gate (S04.07) — build-time gated, runtime-static (preserves TP1 SSG)

Next 16 statically prerenders `/dev/primitives`, so the `ALLOW_DEV_ROUTES` guard resolves at **build** time (making the page dynamic would break `assert-static`/TP1). Both halves verified:

- `ALLOW_DEV_ROUTES=1 pnpm build` → page renders (200) — proven by the green `primitives.spec.ts` run (its first assertion is the `<h1>` "Clay primitive system").
- plain `pnpm build` → `pnpm start` → `/dev/primitives` = **404**, `/` = 200.

## Tokens & glass (S04.05)

- `pnpm tokens:check` → **13/13 tokens round-trip OK** (colour DEFINITIONS unchanged; `.glass` uses `color-mix(... var(--color-bg) ...)`, adds no `--color-*`).
- `grep -n "glass" components/clay/*.tsx` → **0** (glass is `headerGlassClass` in `tiers.ts` only; never combined with clay).

## Regression (S04.09) — `evals/results/tkt04-regression.json`

Generated from real execution (plain build + Playwright). No regression vs effective baseline (tracer-postfix2: 006 PASS / 007 SKIP / 008 PASS / 010 PASS):

| EVAL | Baseline | TKT-04 | Δ |
|---|---|---|---|
| EVAL-006 (axe) | PASS | **PASS** (12 specs, w390/768/1024/1440) | none |
| EVAL-007 (keyboard) | SKIP (not built) | **SKIP** (not built) | none |
| EVAL-008 (responsive/targets) | PASS | **PASS** (8 specs) | none |
| EVAL-010 (reduced-motion) | PASS | **PASS** | none |

`primitives.spec.ts` is deliberately tagged `@primitives` (not `@EVAL-*`) so the QA-only `/dev` board is not pulled into the eval harness's site-route grep (it plain-builds, where `/dev` 404s); the board is folded into EVAL-006 formally at TKT-07 (TSK-09 `routes.json` already lists it "QA job only").

## Final gate chain

`pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm test` ✓ (88 tests, 18 files) · `pnpm build` ✓ (`all routes static (5)`).

## Deviations / notes

- **S04.02 volume overlay:** the base clay volume stays on `tierClass` (shared, already tested); `ClayCard`'s `after:` overlay adds the tone sheen and Design §3's hover intensification ("+8% opacity"), layered between background and content via `isolate` + `after:-z-10` so content stays legible. Chosen over rewriting the shared `tierClass` (extend, not rebuild).
- **`tests/e2e/fixtures.ts` (shared):** added one `minTargets` allowlist entry, `a[data-inline-link]`, for `ExternalLink` — running-text inline links are the documented WCAG 2.5.8 exception to the 44px floor. Only elements explicitly marked `data-inline-link` are exempt; zero effect on existing tracer routes.
- **Dev-route gate reading:** `ALLOW_DEV_ROUTES` is a build-time flag (Next static prerender + TP1); the gate's "`pnpm start`" halves are satisfied by flag-build vs plain-build, not a runtime toggle.
- **Working tree:** the S04.09 eval re-rendered `docs/screenshots/tracer/*.png`; those are incidental and intentionally excluded from the commit (explicit-path staging). Left unstaged (a restore kept hitting the destructive-command gate; harmless — deterministic re-renders).

## `git diff --stat` (committed files)

See commit `feat(m002): TKT-04 complete clay primitive system + /dev/primitives board`.
