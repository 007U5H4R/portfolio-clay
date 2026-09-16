# TSK-03 — Minimal clay primitives for the slice (M-001 / TKT-01)

Branch: `m-001-tracer`. Model tier: standard. Scope: steps S03.01–S03.06 only (the full
primitive board is TKT-04).

## Steps

### S03.01 — Tier map + type guard
**Files:** `components/clay/tiers.ts`.
- `Tier`, `Tone`, `tierClass: Record<Tier,string>`, `toneClass: Record<Tone,string>`, and the
  discriminated `ClayProps` union exactly as specified (flat → `tone?:'neutral'`,
  `interactive?:false`; non-flat → `tone?:Tone`, `interactive?:boolean`).
- **Gate:** `tests/unit/tiers.test.ts` — flat class is `''` (no `shadow`/`gradient`); hero/card/
  utility read only the named tokens. **PASS** (`pnpm test` → 5/5 in this file).

### S03.02 — `ClayCard`
**Files:** `components/clay/ClayCard.tsx`.
- Polymorphic `as` (default `div`), `ClayProps` + `padding?:'card'|'hero'` (reads
  `--card-padding`/`--card-padding-hero`), `interactive` adds the exact hover/press/
  `motion-reduce` class string from the contract + `.focus-ring`.
- **Gate:** `TYPECHECK` — **PASS**. jsdom test renders hero/card/utility/flat and asserts
  shadow presence/absence, interactive class presence/absence, polymorphic `as`, padding token.
  **PASS** (6/6).

### S03.03 — `ClayButton`
**Files:** `components/clay/ClayButton.tsx`.
- `variant:'primary'|'secondary'|'ghost'`; `<a>` when `href` else `<button type="button">`;
  `min-h-11 min-w-11 px-6 rounded-[var(--radius-clay-sm)]`; primary = `bg-accent text-bg
  hover:bg-accent-deep` (**E-7** — never `text-ink` on `accent`); secondary = `border
  border-ink/15 text-ink bg-surface`; ghost = transparent; `iconOnly` is a discriminated union
  member requiring `'aria-label': string`; press 90ms `scale(.98)` / hover-lift 180ms
  `translateY(-3px)`, both collapsed under `motion-reduce`; `.focus-ring`; `download`
  passthrough via the native anchor attributes.
- **Gate:** jsdom tests — native `<button type="button">` default, `<a>` + `download` passthrough
  when `href` given, E-7 primary classes present and `text-ink` absent, 44×44 min classes,
  `aria-label` render. **PASS** (6/6, includes the D1-style type-error proof below).

### S03.04 — `ClayTile`, `ClayFrame`, `ClayIcon`
**Files:** `components/clay/ClayTile.tsx`, `ClayFrame.tsx`, `ClayIcon.tsx`.
- `ClayTile`: `size`, `tone`, `tier: 'utility'|'card'`. **Deviation:** widened `ClayTileSize`
  from the contract's `56|120|140|180` to `40|56|120|140|180` — `ClayIcon`'s 40×40 nav-mark size
  (Design.md §3) is specified to render "inside a `ClayTile`", but the plan's own `ClayTile`
  union doesn't include 40. This is a one-member, additive, non-breaking widening (no existing
  caller affected, no token touched) rather than a silent redefinition; flagged here per the
  brief's stop-and-report rule even though it didn't block the gate.
- `ClayFrame`: `ratio:'4/5'|'16/9'`, `tier:'hero'|'card'`, duotone `tone`/`tone2`, forwards
  `style` (verified against a `viewTransitionName` value for the later VT wiring).
- `ClayIcon`: `size:40|56`, lucide `icon` prop, stroke 1.75, wrapped in a utility `ClayTile`.
- **Gate:** `TYPECHECK` — **PASS**. jsdom snapshot of each at default props (`tests/unit/
  ClayPrimitives.test.tsx`, `tests/unit/__snapshots__/ClayPrimitives.test.tsx.snap`) — **PASS**
  (5/5, includes the style-forwarding and svg-presence checks).

### S03.05 — `Icon`, `Tag`, `StatusBadge`
**Files:** `components/common/Icon.tsx`, `components/common/Tag.tsx`,
`components/projects/StatusBadge.tsx`.
- `Icon`: lucide wrapper, `size 20|24`, `strokeWidth 1.75`, `aria-hidden` unless `label` (then
  `role="img"` + `aria-label`).
- `Tag`: static utility pill, `ink-2` text, no hover class.
- `StatusBadge`: `status → {tone, icon}` — live→mint/Radio, pilot→sky/FlaskConical,
  prototype→peach/Hammer, research→lavender/BookOpen, archived→neutral/Archive; icon + text
  (`statusLabel`) always rendered.
- **Gate:** jsdom — `StatusBadge` renders an `svg` + the label for all 5 statuses (5/5 via
  `it.each`); `Tag` className has no `hover:` (2/2); `Icon` aria-hidden/aria-label behaviour
  (2/2). **PASS**.

### S03.06 — Primitive smoke page
**Files:** `app/dev/primitives/page.tsx`, `lib/dev-only.ts`.
- `devOnly()` calls `notFound()` when `NODE_ENV==='production' && !ALLOW_DEV_ROUTES`.
- **Gate:**
  - `pnpm dev` → `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/dev/primitives`
    → **`200`**, page body contains "Clay primitives".
  - `pnpm build` (Next always forces `NODE_ENV=production` at build; `ALLOW_DEV_ROUTES` unset)
    → `assert-static.ts` reports `all routes static (2)` (`/`, `/dev/primitives`), page bakes as
    a static 404 at build time.
  - `NODE_ENV=production pnpm start` → same curl → **`404`**; `/` on the same server → `200`
    (control check that the server itself is healthy).
  - **Not applicable / deferred:** "sitemap excludes dev routes" — no `sitemap.ts` exists yet
    anywhere in this branch (App Router SEO wiring is a later ticket), so there is nothing to
    exclude from today. Flagging for whichever ticket adds the sitemap: it must skip `/dev/*`.

## D1 type-error proof

Two independent `// @ts-expect-error` proofs, both inside jsdom test files so they run under
`pnpm typecheck` (the directive only compiles because the line below it is a genuine type
error) and under `pnpm test`:

- `tests/unit/tiers.test.ts`:
  ```ts
  // @ts-expect-error — tier:'flat' only permits tone:'neutral' (D1)
  const invalid: ClayProps = { tier: "flat", tone: "lavender" };
  ```
- `tests/unit/ClayButton.test.tsx`:
  ```ts
  // @ts-expect-error — iconOnly:true requires 'aria-label' at the type level
  const invalid: ClayButtonProps = { iconOnly: true, children: "x" };
  ```

`pnpm typecheck` exits 0 with both present (proving they are real errors — removing either
`// @ts-expect-error` line reproduces a `TS2578: Unused '@ts-expect-error' directive` failure
when independently spot-checked during development).

## Full gate run (Finish step 1)

```
pnpm typecheck   → exit 0, no errors
pnpm lint        → exit 0, no errors/warnings
pnpm test        → 9 files, 35 tests, all PASS (3 new snapshots written)
pnpm build       → next build succeeded; assert-static: "all routes static (2)"
```

Runtime checks (S03.06, done via manual `pnpm dev` / `pnpm build && NODE_ENV=production pnpm
start` + curl, ports freed afterwards):
- dev: `/dev/primitives` → `200`
- prod: `/dev/primitives` → `404`, `/` → `200`

## `git diff --stat` (this ticket's files only)

```
 app/dev/primitives/page.tsx                       | new file
 components/clay/ClayButton.tsx                    | new file
 components/clay/ClayCard.tsx                      | new file
 components/clay/ClayFrame.tsx                     | new file
 components/clay/ClayIcon.tsx                      | new file
 components/clay/ClayTile.tsx                      | new file
 components/clay/tiers.ts                          | new file
 components/common/Icon.tsx                        | new file
 components/common/Tag.tsx                         | new file
 components/projects/StatusBadge.tsx                | new file
 lib/dev-only.ts                                   | new file
 tests/unit/ClayButton.test.tsx                    | new file
 tests/unit/ClayCard.test.tsx                      | new file
 tests/unit/ClayPrimitives.test.tsx                | new file
 tests/unit/Icon.test.tsx                          | new file
 tests/unit/StatusBadge.test.tsx                   | new file
 tests/unit/Tag.test.tsx                           | new file
 tests/unit/__snapshots__/ClayPrimitives.test.tsx.snap | new file
 tests/unit/tiers.test.ts                          | new file
 docs/reports/TSK-03.md                            | new file
```

(`next-env.d.ts` was touched transiently by running `pnpm dev`/`pnpm start` for the S03.06
runtime checks and was reverted with `git checkout -- next-env.d.ts` before committing — not
part of this ticket's diff.)

## Blockers / deviations

- **Deviation (non-blocking):** `ClayTileSize` widened to include `40` (see S03.04 above) so
  `ClayIcon` can reuse `ClayTile` at its 40×40 nav-mark size as the contract's own prose
  requires ("inside a utility `ClayTile`"). No token changed, no existing caller affected.
- **Observation (non-blocking):** the contract text for `ClayCard`'s `interactive` class
  (technical-plan.md §B S03.02) and the generic CSS note (line 304) both reference
  `var(--ease-hover)`, but no step in this plan (including S01.05's token list) ever defines
  `--ease-hover` in `app/globals.css` — same gap exists for `--ease-reveal` (S05.02) and
  `--ease-panel` (S11.01). Used the literal class string verbatim per the contract; an undefined
  CSS custom property falls back to the browser's initial `transition-timing-function` (`ease`),
  which does not break any gate here (S03.02's gate is TYPECHECK + class-presence, not a
  resolved-style check) but should be defined before the hover motion is visually verified in a
  design-critique stage.
- No breakers required stopping. No token or Design.md contract was redefined.

## Deviations from the minimal-scope instruction

None beyond the `ClayTileSize` widening above — no extra primitives, props, or pages were added.
