# TASK-127 brief: Portfolio page fidelity pass (cloud session)

You are working in a cloud session on Tushar Pathak's portfolio site. Tushar asked for this to run on Fable 5.1 at maximum effort. His bar is reference-quality fidelity, not "acceptable". No one can answer questions during the run: where this brief leaves a choice open, make the call that best serves the spec and record it in your report.

## 1. Setup

- **Repo:** https://github.com/007U5H4R/portfolio-clay
- **Branch:** `git fetch origin cloud/task-127 && git checkout cloud/task-127`. This is `m-009-redesign` @ `c448cc5` plus one commit carrying the spec, images and this brief.
- **Stack:** Next.js 16 static prerender, Tailwind v4, pnpm 11 (`corepack enable`), Vitest and Playwright.
- **Local paths:** the committed `.env.tooling` points `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR` at the owner's local disk (`/Volumes/E Drive/...`), which doesn't exist here. `dotenv` never overrides variables that are already set, so export working paths in every shell before building or testing:
  `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`
  Do not edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Workers:** Playwright defaults to 1 worker (`PW_WORKERS`, tuned for an 8 GB laptop). Use `PW_WORKERS=2`–`4` if this machine holds up. If tests time out erratically, drop back to 1 before concluding anything is broken.
- **Syncing:** before Phase 2, and again before your final push, run `git fetch origin && git merge origin/m-009-redesign`. The orchestrator may land fixes there. Resolve conflicts keeping both sides' intent.

## 2. Read first

- **The spec, all 32 sections:** `docs/redesign-mockups/m-009/tushar-2026-09-28/portfolio-fidelity-spec.md`
- **Images in the same folder:**
  - `portfolio-current-railcite.png`: the current page, which is what needs fixing.
  - `portfolio-reference-1.png` and `portfolio-reference-2.png`: the targets. Reference 2 is the primary full-page target.
- **Last round, for context:** `portfolio-rectify-spec.md` and `docs/reports/TASK-121-plan.md`, which show what TASK-121 already tried.
- **`Design.md`:** especially its token rules and the §11 deviations (the highest id is Dev-120). Also `HANDOFF.md`.
- **The code:**
  - `app/projects/page.tsx` and `components/portfolio/*`
  - `data/portfolio.ts` (cover and carousel data), `data/projects.ts` (the product facts), `data/enterprise.ts`, `data/schema.ts`
  - `lib/portfolio.ts`, `lib/video-providers.ts`, `lib/csp.ts`
  - the TASK-121 block in `app/globals.css`

## 3. Phase 1: audit only

1. Build and run the site (`pnpm build && pnpm start`).
2. Screenshot `/projects` at 1440, 768 and 390, with TeachSpark selected and with RailCite selected (`?product=railcite`). Include the enterprise section.
3. Write `docs/reports/TASK-127-audit.md`. Cover all 15 dimensions, each as CURRENT / REFERENCE / CORRECTION at the specificity the spec demands, then sections A–D.
4. Commit and push it before any code change.

The spec's "Then STOP" means "finish the audit before touching code". Tushar asked for the whole task to run in this session, so continue to Phase 2 once the audit is pushed.

## 4. Phase 2: implement

Follow the spec and your audit. Keep the macro structure and every behaviour.

### Artwork: the heart of this task

- **No image generation:** no image-generation service is available here. Create the art yourself as hand-authored SVG illustrations.
  - Make real compositions: foreground, midground and background layers, scene storytelling, and print texture (halftone and grain via SVG patterns or filters).
  - A gradient plus one icon is exactly what Tushar is rejecting.
  - Style: a warm, printed 1990s-cover look, with bold simplified shapes, a limited palette per product, soft lighting and halftone/grain. It must sit with the site's warm paper palette: no neon and no dark arcade chrome (§28).
- **One artwork per product:** it serves as both the carousel cover and the large stage poster, reframed if needed. Keep titles and taglines in HTML/CSS, not baked into the art, so they stay crisp and accessible.
- **Ship the art as static files,** e.g. `public/media/portfolio/<slug>.svg`, loaded with `<img>` or `next/image`.
  - This adds no JavaScript.
  - EVAL-020 (`tests/unit/eval-020.test.ts`) forbids colour literals in `.ts`, `.tsx` and `.css` under `app/`, `components/` and `lib/`. Static SVG files in `public/` aren't scanned, but inline React SVG components with colours would fail.
  - Keep each file lean: aim for under 40 kB, and run svgo if it's available.
  - Register the files the way the illustration pipeline requires (`content/media/illustrations/`, `lib/illustrations.ts`, the eval-021 unit tests) and follow its alt-text rules. Decorative images get `alt=""`.
- **Consistency:** give every cover one shared packaging grammar and illustration style. TeachSpark's painted cover (`public/media/illustrations/covers/cover-teachspark.webp`) may stay if it sits well beside the new set; otherwise give it an SVG counterpart. Decide, and say why.
- **Subjects:** follow spec §4 and §12, with these corrections. The repo's records are the source of truth.
  - **Velora:** `data/projects.ts` says Nuptis → Velora is vendor onboarding for apparel sourcing, with no AI. Don't depict beauty routines. Keep the spec's mood (elegant, editorial, soft violet/sunset) but with true subject matter: garments, fabric swatches, sourcing.
  - **Vendor Passport** isn't in the repo. Don't add it or invent it.
  - **Products the spec doesn't mention** (e.g. Token Toli, Pratyasa, Dino Arcade, Cinematic Portfolio, Campfire Board): derive each subject from its record.
  - **No robot or AI imagery** on a product whose record says it has no AI.
  - **No real logos or trademarks.** WhatsApp is a generic green chat bubble. Don't copy real game packaging or famous artworks.

### Content honesty

- **Every word on the page must trace to the repo's data.** Don't import copy from the reference images: no "standards aligned", "Less prep time. More teaching.", "REAL IMPACT IN HEALTHCARE", "Watch the overview", etc., unless the data says it.
- **Decorative stamps** say nothing factual.
- **"Open case file →"** appears only where a real destination exists.
- **No client logos** unless they're already in the repo.
- **Operational caveats** stay true but tiny, as the existing `meta` field does ("LIVE PILOT · TWILIO SANDBOX"). The full caveat stays on the case study.
- **Privacy:** never show Tushar's location or phone number.
- **Enterprise:** keep the six case files exactly as spec §24 lists them.

### Must not break

- **`ProductMediaPlayer` (TASK-122):**
  - It is click-to-load, uses youtube-nocookie only, and mounts one iframe at a time.
  - A product change resets it to the pitch poster.
  - The blocked-embed fallback must keep working.
  - RailCite and Campfire Board have real YouTube IDs, covered by `tests/e2e/portfolio-video.spec.ts` and related tests.
  - Don't touch `lib/csp.ts`.
- **Product selection,** i.e. the tabs pattern and the `?product=` deep link. Also keyboard navigation, visible focus, aria semantics, reduced motion, the mobile swipe carousel, and analytics.
- **Paper tokens:** `pnpm tokens:check` and `tests/unit/eval-020.test.ts` must pass. TASK-121 derived its strip accents with `color-mix` from tokens.
- **The text-size floor:** text under the floor must be marked as a micro-label, the way TASK-126 did (`git show 6d2dadc`). A text-size regression slipped through last round because only a subset of tests ran.
- **Budget:** `/projects` first-load JS is 167.2 kB gz against a 180 kB budget. Check it with `pnpm exec tsx scripts/bundle-budget.ts --route /projects --json`.

## 5. Gates (all required)

- Run `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, `pnpm test` and `pnpm build`.
- Run the FULL Playwright suite: `pnpm test:e2e`, all four projects (w390, w768, w1024, w1440). Not a subset: the full suite catches cross-page regressions.
- Run the bundle budget for `/`, `/work`, `/projects`, `/about` and `/certifications`.
- Record the counts for every gate.
- If a test fails, fix the cause. If you believe a test is wrong, say why in the report; don't weaken it.

## 6. Review loop (spec §31) and stop rule

- Put your 1440 screenshot beside reference 2 and answer the ten §31 questions honestly.
- If question 1 ("does this still look like standard UI with paper styling?") is still yes, refine and review again.
- Stop after at most four review rounds, or when all ten answers are satisfactory, whichever comes first. List what is still short.

## 7. Records, commits, push

- **Deviations:** record any deviation from Design.md as a new §11 row.
- **Screenshots:** save before and after shots in `docs/screenshots/m-009/task-127/`: 390, 768 and 1440, with TeachSpark and with RailCite selected, plus the enterprise section.
- **Commits:** small logical steps with imperative subjects that contain TASK-127. End each commit message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- **Push:** push `cloud/task-127` after each phase. If the environment refuses that branch name, push the same commits to `claude/task-127` and say so in the report.
- **Hard limits:**
  - Never push to or merge into `m-009-redesign` or `main`.
  - Never deploy.
  - Don't change GitHub or Vercel settings.
  - Don't edit `backlog/`.

## 8. Final report (your last commit)

You can't message the orchestrator. Write the report to `docs/reports/TASK-127.md`, and commit and push it as your LAST step; the orchestrator watches for that file. It must cover:

- the spec's §32 ten points
- your §31 answers
- what you verified versus what is your judgement
- gate counts
- remaining limitations
- open questions for Tushar: at least Velora's category, Vendor Passport, and whether he wants painted art later
- the commit list
