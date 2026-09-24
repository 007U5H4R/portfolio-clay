# Report — TSK-31 (`TASK-64.2`) · Fonts: Fraunces + Inter + Caveat via `next/font/google`; Manrope removed

**Ticket:** TKT-69 (`TASK-64`) · M-009 · S69.05–S69.06 · TC-124 · Implementer: Claude Opus 5.5 (standard tier) · Branch `m-009-redesign` (not pushed).

## 1. Outcome
- **Fraunces `axes: ["opsz","SOFT"]` accepted — no fallback, no Dev-18.** `next build` (Next 16.3.5) compiled with no font warning or error: `✓ Compiled successfully in 3.3s` → `✓ Generating static pages using 7 workers (49/49)` → `all routes static (13)`. The built CSS carries `font-family:Fraunces,Fraunces Fallback` and `font-variation-settings:"opsz" 144, "SOFT" 30` on `h1`. Nothing to record in `decisions.md`.
- **woff2 preloads on `/` (built, `pnpm start`):** **3** distinct `/_next/static/media/*.woff2` (one per family); 0 references to `fonts.googleapis/gstatic` in the HTML. 14 woff2 files are emitted in `.next/static/media` in total (the subset files per family and weight).
- **Manrope grep** (`grep -rn -i manrope app components lib --include='*.ts' --include='*.tsx' --include='*.css'`): **only `lib/og.tsx`** (6 lines; TKT-78 owns the OG fonts). `assets/fonts/Manrope-*.ttf` and `tests/e2e/eval-017.spec.ts` (OG licence check) are untouched on purpose.

## 2. Changes
- `app/layout.tsx`: the `Manrope` loader is replaced by `Fraunces` (`weight:"variable"`, `axes:["opsz","SOFT"]`, `--font-fraunces`) and `Inter` (400/500/600, `--font-inter`); Caveat now loads 400/600 (it was 500/600). `<html className>` is the three `.variable`s. The self-hosting comment was rewritten and names the TP9 CSP.
- `app/globals.css` (all under `TSK-31 · fonts` banners; no colour token touched):
  - `@theme`: `--font-display / --font-body / --font-hand` copied verbatim from Design.md §2.2.
  - `html` `font-family` → `var(--font-body)`. It was `--font-display`, which would have made all running text Fraunces.
  - `@layer base`: `body` is Inter 1rem/1.6, navy (`@apply text-navy`), antialiased. `h1–h4` are Fraunces 500 with line-height 1.02, letter-spacing −.015em and `text-wrap: balance`. Default `font-variation-settings` per the role table: h1 `"opsz" 144, "SOFT" 30` · h2 `120, 30` · h3 `96, 20` · h4 `72, 20`.
  - `.font-hand`: `@source inline("font-hand")` makes Tailwind always emit the utility from `--font-hand` (built CSS: `.font-hand{font-family:var(--font-hand)}`). No hand-written duplicate rule.
- No component referenced `font-manrope` / `var(--font-manrope)`, so no component was repointed. `Annotation` and `AboutHero` already use `var(--font-hand)`.
- `tests/e2e/smoke.spec.ts` (appended, S69.06): `fonts are self-hosted and the h1 is Fraunces with opsz @smoke` (w1440). A `page.on("request")` over `/` must see 0 hosts matching `fonts\.(googleapis|gstatic)\.com`; the h1's computed `fontFamily` must contain `Fraunces` and its `fontVariationSettings` must contain `"opsz"`.

## 3. Gates
| Gate | Result |
|---|---|
| `pnpm typecheck` | exit 0 |
| `pnpm lint` | exit 0, no findings |
| `pnpm tokens:check` | `13/13 tokens round-trip OK` |
| `pnpm test` | 316 passed · 2 skipped · exit 0 |
| `pnpm build` | exit 0 · all routes static (13) |
| woff2 on `/` | **3** |
| Manrope grep | only `lib/og.tsx` |
| `pnpm test:e2e --project=w1440 tests/e2e/smoke.spec.ts` | **3/3 passed** (incl. the new test) |
| TC-124 step 5 positive control (throwaway spec, deleted, not committed) | injecting a `<link href="https://fonts.googleapis.com/…">` into `/` → the same listener records the request → **passed** (the guard can fail) |
| `pnpm test:e2e` (full, 4 projects, fresh `webServer`; the stale `:3000` server was stopped first) | **691 passed · 19 failed · 802 skipped** (9.9 min) |

**The 19 failures predate this change.** After stripping run index and line:col, the sorted failure titles match TSK-30's `cur-fails.txt` exactly: `comm` is empty in both directions (0 new, 0 gone). They are the known M-008 debris (`.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a). Totals versus TSK-30: +1 passed and +3 skipped, which is the new smoke test at w1440 plus its skips at the other three widths. The e2e run's `docs/screenshots/**` churn was restored with `git checkout -- docs/screenshots`.

## 4. Bundle (`scripts/bundle-budget.ts --route / --json`)
`firstLoadJsGzipKb` **194.1** (TSK-30 after: 194.1) · raw 625.7 (625.7) — **unchanged**; fonts are CSS/woff2. `overBudget: true` was already true before this change and is gated at TKT-74.

## 5. Notes for the orchestrator
1. **Visible change on legacy pages (expected):** running text moves from Manrope to Inter and every h1–h4 becomes Fraunces 500 with line-height 1.02. The clay components still set their own weights and tracking in utility classes (e.g. `font-extrabold`), which override the base rules until each page ticket restyles it. The e2e failure set did not change.
2. **Caveat weights are now 400/600 (were 500/600).** Any legacy Caveat text styled at 500 now renders at the nearest loaded weight. Design.md §2.2 does not use 500.
3. h2/h3/h4 got default `opsz`/`SOFT` values from the role table (the brief allowed this); per-role sizes and overrides stay with the page tickets.

Evidence (scratch, E Drive): `/Volumes/E Drive/Dev/.scratch/m009/tsk31/` — `gate-{test,build,smoke,e2e}.log`, `woff2.txt`, `budget-after.json`, `tsk30-fails.norm`, `tsk31-fails.norm`.

**Commit:** see `git log` — `feat(fonts): Fraunces + Inter + Caveat via next/font, Manrope removed (S13)`.
