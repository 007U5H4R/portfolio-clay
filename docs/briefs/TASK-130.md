# TASK-130 brief: product case-study system + new-tab case-study links

This brief is for the session running TASK-130 on Tushar Pathak's portfolio, ideally a Claude cloud session. Tushar asked for this to run there. No one can answer questions during the run. Where this brief leaves a choice open, make the call that best serves his spec, and record it in your report.

## 1. Setup
- **Repo and branch:** https://github.com/007U5H4R/portfolio-clay. Run `git fetch origin cloud/task-130 && git checkout cloud/task-130`. The branch is `m-009-redesign` @ `1bc078f`, plus one commit with the spec, the reference, the source images and this brief.
- **Stack:** Next.js 16 static prerender, Tailwind v4, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **If this is a cloud machine** (there is no `/Volumes/E Drive`):
  - `.env.tooling` points `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR` at Tushar's Mac. Export working values in every shell: `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
  - Then run `pnpm install` and `pnpm exec playwright install --with-deps chromium`.
- **If you find `/Volumes/E Drive`, you are LOCAL on Tushar's 8 GB Mac.**
  - Keep everything on `/Volumes/E Drive`: no `/tmp` and no browser install. Use `/Volumes/E Drive/Dev/.scratch/m009/task-130/` for scratch.
  - Run every heavy command through `"/Volumes/E Drive/Dev/.scratch/m009/heavy-ownport.sh" <cmd>`.
  - Use `PW_BASE_URL=http://127.0.0.1:3130` and `PW_WORKERS=1`.
- **Playwright** starts its own server on `PW_BASE_URL`'s port and never reuses one (TASK-128). Pick a free port.
- **Sync often.** Before starting each new product, and before your final push, run `git fetch origin && git merge origin/m-009-redesign`.
  - Other work lands there, notably TASK-129, which adds Slag City. Resolve conflicts keeping both intents.
  - Once Slag City is in `data/projects.ts`, it needs a case study too.

## 2. Read first
- **Tushar's spec:** `docs/redesign-mockups/m-009/tushar-2026-09-29/case-study-system-spec.md` (53 sections, verbatim).
- **The quality benchmark:** `railcite-case-study-reference.jpg` in the same folder. It is an AI mockup, so its UI screenshot and its numbers are illustrative; use only the facts below.
- **Current system:**
  - `app/work/[slug]/page.tsx` and `components/case-study/*` (chapters, ChapterNav, artifacts, MetricStrip, Learnings, Sources, NextProject)
  - `data/projects.ts` (the facts: overview, chapters, thinking, learnings, metrics, sources) and `data/schema.ts`
  - `lib/portfolio.ts`
- **Where facts live:**
  - `CONTENT_INVENTORY.md` §8 is the verified source pack per product, with quotes, dated metrics, conflicts to avoid, and MISSING lists.
  - `docs/trace/*.md` holds the per-product traces.
  - `docs/case-study-sources/<slug>/` holds the source images (see `INDEX.md` there for provenance). I copied them from Tushar's local project folders because you can't read those folders.
- **Design rules:** `Design.md` (tokens, the decoration contract, the §11 deviations, highest Dev-id about 126), `HANDOFF.md`, and `docs/reports/TASK-127*.md`, which shows how the Portfolio art was hand-authored in SVG.

## 3. Scope
- **Every personal build gets the new system:** all of `ALL_PROJECT_SLUGS`, which is currently 12 (TeachSpark, RailCite, Nuptis → Velora, Cubicle, Nuptis, Bhakti Vilas, Token Toli, Pratyasa, Tegaki, Dino Arcade, Cinematic Portfolio, Campfire Board), plus Slag City once it's merged. Tushar: "create this type of case study page for all old and new onboarding products."
- **Pages with thin sources get a shorter page,** never padding. For example, Token Toli is discovery-only, and Campfire has no metrics. Spec §4's 350–600 words is a ceiling, not a quota.
- **Order:**
  1. RailCite, which sets the benchmark.
  2. TeachSpark.
  3. Velora (the Nuptis → Velora pivot).
  4. Cubicle.
  5. Tegaki.
  6. Everything else.
- **Per product, follow spec §51.** Write the audit and narrative (steps 1–5) to `docs/reports/TASK-130/<slug>.md`. Keep it short: story, metaphor, sections, what gets cut, and which facts back which claims. Then implement, then compare with the benchmark.
- **New-tab rule (Tushar's explicit ask):** every link to a case-study page (`/work/<slug>`) must open in a new tab.
  - Use `target="_blank" rel="noopener noreferrer"` plus a visually hidden "(opens in a new tab)".
  - This covers:
    - the Portfolio info-sheet "Read the case study" strip;
    - the home Featured cards (`components/projects/ProjectCard.tsx`);
    - NextProject;
    - Ask Tushky answer sources that point to `/work/<slug>`;
    - essays and thinking links;
    - anything else found with `git grep "/work/"`.
  - `/work` itself, the Experience page, is NOT a case study: leave it alone.
  - Add an e2e test that crawls every public route and asserts every `a[href^="/work/"]` (except exactly `/work`) has `target=_blank` and `rel` containing `noopener`.

## 4. Content rules (the hardest constraint)
- **Every claim must trace** to `data/projects.ts`, `CONTENT_INVENTORY.md` §8, or `docs/trace/`.
- **Invent nothing.** No metrics, users, dates, research, architecture or outcomes that aren't recorded. Respect the inventory's warnings:
  - use one TeachSpark snapshot date and never mix it with another;
  - don't use the "625 tests" or "148 tests" figures;
  - RailCite's citation validity is structural, not measured.
- **Evidence badges:** every metric and outcome carries one of the spec §19 badges: ● Measured / ◐ Self-reported / ◇ Structural / ○ Prototype.
- **No development copy on public pages** (spec §31): no "Draft", "Pending sign-off", "coming soon" or placeholder text.
  - This overrides the old DRAFT-tag convention (Dev-10) for case-study pages. Record that as a Dev-id and update the affected tests to the new contract, rather than deleting coverage.
  - If a fact isn't signed off, leave it out.
- **"Vendor Passport" is not a product in this repo.** Spec §45 pairs it with "apparel onboarding" and §49 describes the Nuptis → Velora pivot.
  - Read Velora's record, its trace, the source screenshots (for example `docs/case-study-sources/velora/trust-profile.jpg`) and CONTENT_INVENTORY §8.4–8.5.
  - If the recorded Velora story supports a portable vendor identity or trust profile, tell it inside Velora's page as its bet. Don't create a separate "Vendor Passport" page and don't invent one.
  - Velora is apparel sourcing and vendor onboarding, not beauty or lifestyle. Don't follow the spec's lifestyle art direction for it (§8); give it the pivot story (§49) with a sourcing and onboarding visual language.
  - Nuptis keeps its own page. The pivot page may reference it.
- **Real product UI:**
  - Use the screenshots in `docs/case-study-sources/`, copied as optimized WebP into `public/media/case-studies/<slug>/` with proper alt text.
  - Where a product is live and public (e.g. https://slag-city.vercel.app, https://railcite.vercel.app, and the TeachSpark landing page), you may capture fresh screenshots with Playwright. Only capture public pages; never log in, and include no personal data.
  - Record the provenance of every image.
- **Videos:** use the existing YouTube pitch and demo IDs in `data/portfolio.ts` (RailCite, Campfire Board, Slag City) through the existing `ProductMediaPlayer` (click-to-load youtube-nocookie). Don't touch `lib/csp.ts`.
- **Links only point to public things:** live product URLs, public GitHub repos (the schema's `repoPublic`), and YouTube.
  - Evidence-drawer items for private docs (PRDs, ledgers) are listed with title, type, date and what they support (spec §23), without a link.
- **No logos or trademarks** (a generic chat bubble, not WhatsApp's logo), and no personal data (no location or phone).

## 5. Visual system
- **Shared:** typography, spacing, evidence UI, nav behaviour and a11y.
- **Per product:** the metaphor, motif, 1–3 accents, hero composition, diagram types and section order (spec §7–§9, §39). RailCite's railway vocabulary stays on RailCite only.
- **Art:** hand-authored SVG, like TASK-127's `scripts/portfolio-art/`. Image generation is not available. Ship art as static files in `public/` so it adds no JavaScript.
- **Colour:** EVAL-020 (`tests/unit/eval-020.test.ts`) forbids colour literals in `app/`, `components/` and `lib/` `.ts`/`.tsx`/`.css`, except in `app/globals.css`. There must be exactly 13 `--color-*` tokens. Derive product accents from the tokens (with `color-mix`, as TASK-121/127 did) or keep them inside the static SVGs.
- **Motion:** viewport-triggered, one-time and product-specific (spec §26–§27). Respect reduced motion.
- **Performance:** keep the first-load JS for `/work/[slug]` within the 180 kB gz budget (`pnpm exec tsx scripts/bundle-budget.ts --route /work/railcite --json`). Lazy-load screenshots and videos.
- **Mobile at 390 px:** a real stacked case study with no horizontal overflow.

## 6. Tests and gates (all required)
- **Checks:** `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, the full `pnpm test`, `pnpm build`, and the FULL `pnpm test:e2e` (w390, w768, w1024, w1440).
- **Bundle budget:** run it for `/`, `/projects` and at least three `/work/<slug>` pages.
- **Existing case-study specs** (e.g. `case-study.spec.ts`, `case-study-learned.spec.ts`, `artifacts.spec.ts` EVAL-018/EVAL-007, `sweep`, `layout`, `eval-011`) will need updating to the new design.
  - Update them to assert the new contract: one h1, section landmarks, an accessible evidence drawer (focus trap, Esc, focus return), the badge legend, and no dev copy.
  - Keep EVAL-006 axe coverage on every case study.
- **Failures:** if a test fails only under load, re-run it alone before calling it flaky, and say so.
- **Screenshots:** save before and after shots at 1440 and 390 for every case study, in `docs/screenshots/m-009/task-130/`.

## 7. Review loop and stop rule
- Run spec §50's checklist on each page. Refine at most twice per page, then move on and list what's still short.
- The whole task is done when every personal build has a new page, the new-tab rule is enforced by a test, and all gates pass.

## 8. Commits, push and report
- **Commits:** one product per commit where possible, with imperative subjects that include TASK-130.
- **Trailer:** end every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, or your own model name if different.
- **Push:** push `cloud/task-130` after each product. If that branch name is refused, use `claude/task-130` and say so.
- **Never:**
  - push to or merge into `m-009-redesign` or `main`;
  - deploy;
  - change GitHub or Vercel settings;
  - edit `backlog/`.
- **Report:** the orchestrator can't message you. Commit `docs/reports/TASK-130.md` as your last step. It must cover:
  - the spec's §53 ten points;
  - per-product narrative choices;
  - verified vs judgement;
  - gate counts;
  - a list of remaining products or sections that need source information from Tushar;
  - the commit list.
