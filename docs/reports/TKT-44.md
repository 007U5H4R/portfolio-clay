# TKT-44 — `/playground` hero + 4 tiles

## Files
- `components/playground/PlaygroundHero.tsx` — flat h1-only hero, verbatim headline "Small experiments. Big questions." (same convention as `ThinkingHero`/`WorkHero`).
- `components/playground/PlaygroundGrid.tsx` (+ inline `PlaygroundTile`) — 2×2 (≥md) / 1-col (<md) grid of the 4 sanctioned experiments.
- `app/playground/page.tsx` — `buildMetadata({ path: '/playground', ogFamily: 'Product Playground' })`, mounts `PlaygroundHero` + `PlaygroundGrid` in `Container`. Static.
- `app/playground/opengraph-image.tsx` — playground OG, copied from `app/work/opengraph-image.tsx`'s pattern, `tone: "butter"` (the one page where Design.md §3 explicitly tips the ratio toward playful, instead of the `lavender` every other page's OG uses).
- `app/sitemap.ts` — `STATIC_ROUTES` gets `"/playground"` (the file's own pre-existing comment already named this as TKT-44's job).
- `tests/e2e/routes.json` — `static` gets `"/playground"` so the shared EVAL-006/008/011 sweeps (which iterate this list, not the live sitemap) actually visit the route — see Flag 1 below.
- `tests/e2e/playground.spec.ts` — this ticket's Playwright suite.
- `docs/screenshots/playground/playground-{390,768,1024,1440}.png`.

## The 4 tiles shipped
| Project | Tone | Live URL | One-liner (= `project.tagline`) | §6 trace |
|---|---|---|---|---|
| Pratyasa | butter | `https://pratyasa.vercel.app` | "A static record of granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage." | CONTENT_INVENTORY §6 row 1 |
| Tegaki | peach | `https://tegaki-one.vercel.app` | "What your handwriting suggests about you — read and written by hand." | §6 row 2 |
| Dino Arcade (`dino-arcade-pwa`) | blush | `https://007u5h4r.github.io/dino-arcade-pwa/` | "A mobile PWA that turns your phone into an arcade cabinet — strictly BYO-ROM, no game data ships or uploads." | §6 row 3 |
| Cinematic Portfolio | mint | `https://tushar-pathak.vercel.app/` | "A scroll-driven film portfolio — AI-generated footage of me as the backdrop, Apple-product-page style, no build step." | §6 row 4 |

**Copy decision:** each tile's one-liner reuses `project.tagline` from `data/projects.ts` (the schema's own "one-sentence proposition" field), rather than retyping a fresh string from §6's denser "Content" column. Same facts, already-sourced, single source of truth — `/work`'s `ProjectCard` uses the same field for the same 4 projects. Names/URLs/tones are imported by name (`pratyasa`, `tegaki`, `dinoArcadePwa`, `cinematicPortfolio`) rather than looked up by slug string, so a typo can't silently resolve to `undefined`, and the 3 excluded projects (Slag City / Mock Interview / Game) have no export to import in the first place — not even an accidental path onto the page.

## External-link a11y
Each tile is one big `<a target="_blank" rel="noopener noreferrer">` wrapping a `ClayTile tier="card" interactive tone={…}` (the exact pattern `ClayTile.tsx`'s own doc comment describes: "a wrapping `<a>` owns focus"). Inside: a real `<h2>` title (not a styled `<span>` — the TKT-43 a11y scar guard), the tagline `<p>`, and a trailing `VisuallyHidden` "(opens in new tab)" note — the same content-based mechanism `ExternalLink` uses site-wide, so the link's computed accessible name always includes that phrase without an `aria-label` fighting the heading's own name. `.focus-ring` on the anchor gives the 3px accent focus ring. Cards are ~380–580px wide, well over the 44×44 floor.

Heading outline: `PlaygroundHero`'s `<h1>` → each tile's `<h2>` directly (no intermediate level, no skip) — verified by `playground.spec.ts`'s dedicated heading-navigation test (4 headings, level 2, no level-3 anywhere on the page).

## Crawler / HEAD results for the 4 live URLs
Both the shared EVAL-011 dead-control crawler (`.eval/dead-controls.json`, now sweeping `/playground` via the `routes.json` change above) and this ticket's own direct check (`playground.spec.ts` `@EVAL-011` test) hit all 4 URLs:

| URL | Crawler verdict | Direct HEAD check |
|---|---|---|
| `https://pratyasa.vercel.app/` | ok — HTTP 200 | 200 |
| `https://tegaki-one.vercel.app/` | ok — HTTP 200 | 200 |
| `https://007u5h4r.github.io/dino-arcade-pwa/` | ok — HTTP 200 | 200 |
| `https://tushar-pathak.vercel.app/` | ok — HTTP 200 | 200 |

None were transiently down — nothing to flag here, no crawler weakening needed. The crawler's only WARN across the whole run is the pre-existing, unrelated LinkedIn 999 bot-block (recorded, not FAIL) that every route with a LinkedIn link already carries.

## ALL gate results

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass, 0 errors |
| `pnpm lint` | pass, 0 errors/warnings |
| `pnpm exec vitest run` | pass — **40 test files (1 skipped), 226 tests passed, 1 pre-existing skip** (unrelated `resume-pii.test.ts`) |
| `pnpm prebuild` | pass: `content OK (projects:14 experience:4 skills:4 writing:5 knowledge:11 thinking:6)` |
| `pnpm build` | pass. `all routes static (13)`; `/playground` and `/playground/opengraph-image` present as static (`○`) routes; `/playground` confirmed in the generated `sitemap.xml` |
| `tests/e2e/playground.spec.ts` (production build, `pnpm test:e2e --grep playground`) | **25 passed, 0 failed, 19 skipped** (viewport-guard skips — content/axe/a11y checks run once at their designated width). One red→green fix mid-build: the first external-link a11y test used an unscoped `page.locator`, which hit a strict-mode collision with the Footer's "Previous portfolio" link (same URL as Cinematic Portfolio's tile — it *is* the same site). Scoped the locator to `#main`, reran green. **No OOM, no retries needed.** |
| Full `pnpm test:e2e` (whole suite, all files, all 4 viewports) | pass — **340 passed, 0 failed, 524 skipped** (4.3 min). Confirms nothing else regressed. Ran in the background after exceeding the 120s foreground window; **no OOM, no retries needed.** |
| `pnpm eval --only EVAL-008,EVAL-009,EVAL-011 --skip-build --label tkt-44-playground` | pass — `evals/results/tkt-44-playground.json`: **totals 2 pass · 0 fail · 14 skip · 1 manual (of 17)**, `"regressions": []`. EVAL-008 PASS (96 specs incl. `/playground`'s no-overflow + 44px-target rows), EVAL-011 PASS (217 controls · 207 ok · 10 warn · 0 dead — the 4 live URLs all `ok`/`HTTP 200`), EVAL-009 MANUAL (design rubric — not automated, by design). **No OOM, no retries needed.** |

## Screenshots
`docs/screenshots/playground/playground-{390,768,1024,1440}.png` — no horizontal overflow at any width (`noOverflow` fixture, all 4 viewports, green). 1440 shows the 2×2 tone-keyed grid; 390 shows the clean 1-column stack.

## Commit
`feat(m006): TKT-44 /playground hero + tiles` — SHA recorded after commit (see `git log` on `m-006-pages`).

## Flags for Tushar's eye (not blocking)
1. **Pre-existing gap in the eval-harness route list, found and worked around, not fixed beyond this ticket's own route.** `tests/e2e/routes.json`'s `static` array (which `eval-008.spec.ts`/`eval-011-dead-controls.spec.ts` iterate directly, not the live sitemap) was still the M-002 list — `["/", "/work", "/work/teachspark", "/contact"]` — missing `/thinking` (TKT-43) and `/about` (TKT-40/42), even though both ship and are in `app/sitemap.ts`. I added `/playground` (required for this ticket's AC3 to mean anything real), but did **not** add `/thinking` or `/about` — that's outside TKT-44's scope and not mine to silently fix. Worth a follow-up ticket so those two routes actually get the EVAL-008/011 sweep they're currently missing.
2. **`app/sitemap.ts`'s own `STATIC_ROUTES` is also still missing `/about`** (its comment already anticipated `/about` landing with "TKT-40"), so `/about` doesn't appear in `sitemap.xml` today. Same pre-existing gap as above, same reasoning for not touching it here.
3. **OG tone choice for `/playground` (`butter`)** is my own call, not dictated verbatim anywhere — every other page's OG uses `lavender`; I picked `butter` (the first of the 4 tile tones) because Design.md §3 explicitly says this is the one page where the ratio tips toward playful. Trivial one-line change if you'd rather keep it `lavender` for OG consistency.
4. **Tile one-liners reuse `project.tagline`** rather than retyping CONTENT_INVENTORY §6's denser "Content" column verbatim — see the "Copy decision" note above. Same facts, same source chain, just the field `/work` already uses for the same 4 projects instead of a second hand-typed copy of the same description.
