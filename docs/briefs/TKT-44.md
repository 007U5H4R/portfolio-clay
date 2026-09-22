# Brief — TKT-44 · `/playground` — hero + 4 tiles

**Ticket:** TKT-44 (Backlog `TASK-40`) · Milestone **M-006** · Type Feature · P2 · sp:2
**Branch:** `m-006-pages` (or your assigned worktree off it — verify `git branch --show-current`; commit ONLY on the m-006 line, never `main`).
**Model tier:** standard (sonnet). **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TKT-04 (primitives/ClayTile), TKT-05 (layout), TKT-06 (SEO/OG), TKT-15 (project data) — all done. Disjoint route.

## Objective
Build `/playground`: a flat hero + a 2×2 grid of clickable `ClayTile`s for the 4 shipped experiments, each linking out to its live URL. Stronger/deeper clay hover is permitted here (it's the playful page). Only the 4 sanctioned experiments — never Slag City / Mock Interview / Game (the last contains ROM/BIOS that must never surface).

## Read first (in order)
1. `tickets.md` → **TKT-44** (~902–910) — authoritative ACs.
2. `Design.md` → **§3 Playground** and the ClayTile/hover spec; a11y/motion tables.
3. `SITEMAP.md` line 15 (`/playground` = "Small experiments. Big questions." · PlaygroundHero · tiles Pratyasa · Tegaki · dino-arcade · cinematic portfolio).
4. `CONTENT_INVENTORY.md` → **§6** (~261–269) — the 4 tiles' one-line descriptions + live URLs + the exclusion note (do NOT render the ROM detail). Every string traces here.
5. `data/projects.ts` — the 4 projects already exist: slugs `pratyasa` (~2644), `tegaki` (~2689), `dino-arcade-pwa` (~2731), `cinematic-portfolio` (~2773). Read the shape for the live/external URL field name and reuse it (do NOT hard-code URLs that already live in the data). Tones per ticket: Pratyasa=butter, Tegaki=peach, dino-arcade=blush, cinematic-portfolio=mint.
6. Pattern references: `components/clay/ClayTile` + tiers, `components/common/ExternalLink.tsx`, `app/work/page.tsx` (route discipline), `app/work/opengraph-image.tsx` (OG pattern to copy for playground OG).

## Scope — files
- **Create** `components/playground/PlaygroundHero.tsx` — flat hero, headline **"Small experiments. Big questions."** (verbatim).
- **Create** `components/playground/PlaygroundGrid.tsx` (+ a `PlaygroundTile` if cleaner) — 2×2 (≥md) / 1-col (<md) grid of `ClayTile`s reading the 4 projects from `data/projects.ts`; each tile fully clickable to its live URL with `target="_blank" rel="noopener noreferrer"`; `aria-label` includes **"(opens in new tab)"**; ≥44×44 hit area; deeper hover shadow allowed; one-line description per §6; keyed to the tile's tone.
- **Create** `app/playground/page.tsx` — `buildMetadata({ title, description, path:'/playground', ogFamily:'Product Playground' })`; mount hero + grid in `Container`; static.
- **Create** `app/playground/opengraph-image.tsx` — playground OG (1200×630), copying the corrected `app/work/opengraph-image.tsx` pattern.

## Acceptance criteria (TKT-44, verbatim)
1. Four tiles, copy from §6 (NO Slag City / Mock Interview / Game). 2. Each control ≥44×44, focus ring, `aria-label` includes "opens in new tab". 3. Crawler treats the external targets as resolved (HEAD 200–399) — the 4 live URLs must be reachable; if one is transiently down, note it (do not weaken the crawler). 4. axe clean; no overflow at 390/768/1024/1440.

## TDD / gates (ALL pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. `tests/e2e/playground.spec.ts` (Playwright, **workers:1**, retry once on OOM): 4 tiles render with §6 copy; each is an external link with `rel="noopener"` + "opens in new tab" aria; ≥44×44; no Slag City/Mock Interview/Game text present; no-overflow @390/768/1024/1440; axe @390/1440.
3. `pnpm exec vitest run` green.
4. `pnpm prebuild` `content OK` unchanged.
5. `pnpm build` — `/playground` static; `assert-static` green; route in sitemap.
6. `pnpm eval` (EVAL-008/009/011) no regression — leave eval-run json untracked.
7. Screenshots `/playground` at 390/768/1024/1440 → `docs/screenshots/playground/`.

## Constraints
- Everything on `/Volumes/E Drive`. Stage EXPLICIT paths only — never `git add -A`.
- One commit: `feat(m006): TKT-44 /playground hero + tiles`. Co-Authored-By = your model.
- NEVER surface the excluded projects or the ROM/BIOS detail. Reuse live URLs from the data, don't invent.

## Output — `docs/reports/TKT-44.md`
Files; the 4 tiles shipped (name/tone/URL/one-liner/§6 trace); external-link a11y approach; crawler/HEAD results for the 4 live URLs; ALL gate results with counts + OOM retries; eval-run path + regression summary; screenshot paths; commit SHA; flags — flag, don't block.
