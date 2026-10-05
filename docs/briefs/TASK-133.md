# TASK-133 brief: Home Featured Work → three-product editorial showcase (cloud session)

You're working in a Claude cloud session on Tushar Pathak's portfolio. No one can answer questions during the run. Where this brief leaves a choice open, make the call that best serves his spec and record it in your report.

## 1. Setup
- **Repo:** https://github.com/007U5H4R/portfolio-clay
- **Branch:** `cloud/task-133`. It is `m-009-redesign` @ `35bcdac` plus one commit that adds the spec, the reference image and this brief.
- **Stack:** Next.js 16 (static), Tailwind v4, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Environment:** `.env.tooling` points `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR` at Tushar's Mac. In every shell, export working values first: `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Playwright** starts its own server on `PW_BASE_URL`'s port and never reuses one (TASK-128).
- **Sync:** before your final push, run `git fetch origin && git merge origin/m-009-redesign`. Resolve conflicts keeping both sides' intent.
- **Parallel work:** another cloud session, TASK-130 on `cloud/task-130`, is rebuilding the `/work/<slug>` case studies. It will also add `target=_blank` to every link that points to `/work/<slug>`.
  - Your Explore links go to `/projects?product=…`, never to `/work/`. They must NOT open a new tab (spec §26), so there is no conflict with TASK-130's rule.
  - If you stop using `components/projects/ProjectCard.tsx` on the home page, leave the file itself alone. TASK-130 may be editing it.

## 2. Read first
- **The spec, all 28 sections:** `docs/redesign-mockups/m-009/tushar-2026-09-29/featured-work-spec.md`
- **The reference:** `featured-work-reference.jpg`, in the same folder.
- **Current code:**
  - `components/home/` (find the Featured Work component)
  - `data/projects.ts` (the `featured: 1|2|3` fields)
  - `data/portfolio.ts`
  - `lib/portfolio.ts` (`/projects?product=<id>` deep link, line ~114)
  - `components/portfolio/IndependentProductsShowcase.tsx` (reads `?product=` on mount)
- **Design rules:** `Design.md` (tokens, the decoration contract `data-decor` / `data-paper`, §11 deviations) and `HANDOFF.md`.
- **Existing art:** `public/media/illustrations/covers/cover-{railcite,slag-city,campfire-board}.svg` and their sources in `scripts/portfolio-art/` (TASK-127 and TASK-129 hand-authored SVG).

## 3. Verified copy: the mockup is not the source of truth
Use ONLY facts already in the repo.

**RailCite**
- Name: RailCite.
- Tagline: "Research on track." This is its `coverLine` in `data/portfolio.ts` ("Research on track"), so a trailing period is fine.
- Description: Tushar's one-liner, "A trust-first assistant for citing the right railway rule without inventing authority." It paraphrases the record's tagline and is acceptable.
- **Proof points** (from RailCite's `metrics` in `data/projects.ts`):
  - **5,760 documents indexed**: `kind: "measured"`, `asOf: 2026-09-15`.
  - **0 invented citations**: `kind: "structural"`. It is enforced by the code, not measured.
  - Show each one's kind honestly. Follow the site's existing metric-kind convention (look at how the case study and MetricStrip label kinds, or TASK-130's badge system if it has merged): at minimum a small "structural" / "by construction" marker on the 0, and an as-of date for the 5,760, if the existing convention shows dates.

**Slag City**
- Its real `coverLine` is **"Coin-op brawler, in the browser"**. Its tagline is "An original arcade beat-'em-up that runs in your browser — one complete stage, on a desktop cabinet or a phone."
- The mockup's "Industrial intelligence, organized for action." is WRONG. Slag City is a browser arcade game. Never use that line.
- The industrial, foundry visual direction is fine: it matches the game's ruined foundry city.

**Campfire Board**
- Its real `coverLine` is **"One dashboard, every project"**. Its tagline is "A local-first, multi-project management dashboard for the AI build workflow — a personal fork of Backlog.md."
- The mockup's "A shared space for ideas, planning, and momentum." and the sticky notes' words ("Better Ideas", "Brighter People", "Real Progress") are NOT supported. Don't use them.
- The visual may carry a campfire, a kanban or planning board and paper notes, but any note text must be empty or illegible scribble, never invented claims.
- It is a solo, local tool: don't imply a team of users.

**General**
- No metrics for Slag City or Campfire Board: none are recorded.
- No logos or trademarks. Don't copy real railway emblems or the mockup's "Great Northern Railway".
- No readable invented document text in the art. Use stamp shapes and ruled lines instead.
- No personal data.

## 4. Implementation notes
- **Data:** use one data source: a `featuredProducts = ["railcite", "slag-city", "campfire-board"]` list, or reassign the existing `featured` ranks, whichever fits the schema and its content gate.
  - Explain the choice in the report.
  - TeachSpark and Nuptis → Velora stay on the Portfolio page and in `/work`. Check what else reads `featured` (sitemap, OG, Ask Tushky, tests) and keep those correct.
- **Links:** every Explore link goes to the existing `/projects?product=<id>` deep link, built with `lib/portfolio.ts`.
  - Same tab: no `target`.
  - Aria labels: "Explore RailCite in Portfolio", "Explore Slag City in Portfolio" and "Explore Campfire Board in Portfolio".
- **E2E test:** from `/`, click each Explore, land on `/projects?product=<id>`, and check that the product is the active tab/cover and the stage shows it. Also check an invalid `?product=` falls back to the default product.
- **Art:** compose hand-authored SVG collages, static files in `public/`, built with the TASK-127 kit, so they add no JavaScript.
  - Give RailCite the richest collage: train, viaduct and tracks, a circular-document fragment with stamp shapes, a station-map line, and a rust circle. Slag City and Campfire each get their own composition.
  - Reuse or extend the existing cover scenes where they fit.
  - No image generation is available.
- **Colour:** EVAL-020 forbids colour literals in `app/`, `components/` and `lib/` `.ts`, `.tsx` and `.css` files (except `app/globals.css`, which must keep exactly 13 `--color-*` tokens). Derive colours from tokens, or keep them inside static SVGs.
- **Layout and sizing:** follow spec §3 and §16–§18. The desktop section should be about 700–850 px including the heading. At 390 px the cards stack, with no horizontal overflow and no cropped CTA.
- **Motion:** spec §25, one-time only, and reduced motion must be respected.
- **Only this section changes.** No other home section, and no nav changes.

## 5. Gates (all required)
- `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, the full `pnpm test` and `pnpm build`.
- The FULL `pnpm test:e2e` suite (w390, w768, w1024, w1440).
  - The existing home specs (e.g. `home.spec.ts`, `hero-fold`, `eval-018`, `eval-006`, `layout`, `sweep`, `eval-011`) will need updates for the new section. Change them to assert the new contract; don't delete coverage.
  - If a test fails only under load, re-run it alone before calling it flaky.
- The bundle budget for `/` and `/projects`: `pnpm exec tsx scripts/bundle-budget.ts --route / --json`. The budget is 180 kB gz; `/` is about 161 kB.
- Screenshots of the section at 390, 768 and 1440, before and after, in `docs/screenshots/m-009/task-133/`. Compare your 1440 screenshot with the reference and refine up to twice.

## 6. Commits, push, report
- **Commits:** imperative subjects that include TASK-133. End each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or your own model name).
- **Push:** only `cloud/task-133`. Never push to or merge into `m-009-redesign` or `main`. Never deploy. Don't edit `backlog/`.
- **Report:** your last commit is `docs/reports/TASK-133.md`, covering:
  - the spec's §28 checklist (verified vs judgement) and its eight summary points;
  - gate counts;
  - the commit list;
  - open questions for Tushar.
