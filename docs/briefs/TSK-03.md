# Implementer brief — TSK-03 · Minimal clay primitives for the slice (M-001 / TKT-01)

Fresh implementer. Execute **TSK-03 only** (steps S03.01–S03.06). Model tier: standard. TSK-01 is done (tokens in `app/globals.css`, `lib/site.ts`, scaffold). Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-001-tracer`.

## Read first
- `technical-plan.md` §B → **TSK-03 steps S03.01–S03.06** (lines ~489–494) — *Files / Contract / Gate* authoritative.
- `Design.md` §2 (tokens, already in `globals.css`) and §3 primitives/anatomy for ClayCard/ClayButton/Tile/Frame/Icon visual contracts.
- Conflicts you MUST honour (§E): **E-7** ClayButton **primary = `bg` (#FAF9FF) text on `accent`** (4.9:1 AA), `accent-deep` on hover — NOT ink on accent (fails AA). **D1** the `ClayProps` discriminated union must make `{tier:'flat', tone:'lavender'}` a **type error**.

## Steps (each has a hard Gate)
- **S03.01** `components/clay/tiers.ts` — `Tier = 'hero'|'card'|'utility'|'flat'`; `tierClass`, `toneClass` (Tailwind classes reading only allowed tokens); discriminated `ClayProps` per D1. Gate: `tests/unit/tiers.test.ts` — flat class string contains no `shadow`/`gradient`; a `// @ts-expect-error` line for `{tier:'flat', tone:'lavender'}`; TYPECHECK passes (the expect-error compiles only because it errors).
- **S03.02** `components/clay/ClayCard.tsx` — polymorphic `as` (default div), `ClayProps` + `padding?:'card'|'hero'`, `interactive` hover-lift/active-press/focus-ring classes with `motion-reduce` guards. Gate: TYPECHECK; jsdom test renders 4 tiers, asserts class presence/absence.
- **S03.03** `components/clay/ClayButton.tsx` — `variant:'primary'|'secondary'|'ghost'`; renders `<a>` when `href` else `<button type="button">`; `min-h-11 min-w-11 px-6 rounded-[var(--radius-clay-sm)]`; primary per E-7; `iconOnly` requires `aria-label` (type error otherwise); press/hover motion removed under reduced motion; `.focus-ring`; `download` passthrough. Gate: jsdom test — iconOnly without aria-label is a type error; classes present.
- **S03.04** `components/clay/{ClayTile,ClayFrame,ClayIcon}.tsx` per the plan contracts (ClayFrame forwards `style` for VT names later; ClayIcon wraps a lucide icon in a utility ClayTile). Gate: TYPECHECK; jsdom snapshot each at default props.
- **S03.05** `components/common/Icon.tsx` (lucide wrapper, aria-hidden unless label), `components/common/Tag.tsx` (static pill, **no hover**), `components/projects/StatusBadge.tsx` (status→{tone,icon} map for live/pilot/prototype/research/archived; icon + text always). Gate: jsdom — StatusBadge renders svg + label for all 5 statuses; Tag className has no `hover:`.
- **S03.06** `app/dev/primitives/page.tsx` (minimal grid of the above) + `lib/dev-only.ts` (`if (process.env.NODE_ENV==='production' && !process.env.ALLOW_DEV_ROUTES) notFound()` at top of every dev page; sitemap excludes dev routes). Gate: `pnpm dev` → `/dev/primitives` renders; `NODE_ENV=production pnpm start` → `/dev/primitives` returns 404 (`curl -o /dev/null -w '%{http_code}'`). (Requires a `pnpm build` first for `pnpm start`.)

## Rules
- Everything on E Drive. Follow the plan verbatim; no extra primitives/props/pages beyond the step list (this is the minimal tracer set; the full primitive board is TKT-04, not now).
- **Commit staging: explicit paths only** (`git add components/clay components/common components/projects/StatusBadge.tsx app/dev/primitives lib/dev-only.ts tests/unit docs/reports/TSK-03.md` and any test files). NEVER `git add -A` — uncommitted orchestrator files must not be swept in.
- If a gate cannot pass without changing a token or a Design.md contract, STOP and report the breaker (do not silently redefine tokens or invent classes).

## Finish
1. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (build needed for the S03.06 production 404 check).
2. Commit: `feat(tracer): TSK-03 minimal clay primitives` + Co-Authored-By trailer. One commit.
3. Write `docs/reports/TSK-03.md`: per-step done with gate output; the D1 type-error proof; the /dev/primitives 200(dev)/404(prod) results; `git diff --stat`.
4. Final 5-line summary: steps done, gates passed, blockers, deviations, commit SHA.
