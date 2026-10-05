# TASK-136 brief: About page redesign (cloud session)

You are working in a Claude cloud session on Tushar Pathak's portfolio. No one can answer questions during the run. Make the call that best serves his spec and record it in your report.

## 1. Setup
- **Repo:** https://github.com/007U5H4R/portfolio-clay, branch `cloud/task-136`. The branch is `m-009-redesign` @ `7631448` plus one commit with the spec, the reference and this brief.
- **Stack:** Next.js 16 (static), Tailwind v4, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Paths:** `.env.tooling` points `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR` at Tushar's Mac. Export working paths in every shell: `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Playwright** starts its own server on `PW_BASE_URL`'s port (TASK-128).
- **Sync before the final push:** `git fetch origin && git merge origin/m-009-redesign`. Other open work (TASK-130 case studies, TASK-134 voice) may land meanwhile.

## 2. Read first
- **The spec:** `docs/redesign-mockups/m-009/tushar-2026-09-29/about-redesign-spec.md`, all sections.
- **The reference:** `about-redesign-reference.jpg`. It is the visual target, NOT the facts.
- **Current About:** `app/about/page.tsx` and `components/about/*`:
  - AboutHero (TASK-117's "machines → systems → people → intelligent products" hero; this rebuild supersedes it)
  - ProductJourney, CapabilityClusters, Impact, ExperienceTimeline
  - Awards, Research, Education, AboutCta
  - `components/timeline/*`
- **Experience:** `app/work/page.tsx` (the collage timeline) and `components/experience/*` (real company logos, approved 2026-09-26).
- **Certifications:** `app/certifications/page.tsx`.
- **Design rules:** `Design.md` (tokens, the decoration contract, §11 deviations), `HANDOFF.md`, `CONTENT_INVENTORY.md` §4 (About).

## 3. Facts
Use ONLY the repo's data. Never use the reference's placeholders.

- **Employers:**
  - Godrej Infotech (Godrej & Boyce)
  - Quantiphi
  - Shellkode
  - American Express (via IntraEdge; the current Accounts Receivable modernization)

  Take names and dates from `data/experience.ts`, `data/projects.ts` (professional entries) and the Experience components. There is NO IIT, Google (as an employer), AIG or HSBC.
- **Recognition:** `data/credentials.ts` records exactly these:
  - "Google Cloud Partner All-Star: Delivery Excellence", 2024
  - "Annual Unsung Hero Award, Quantiphi Analytics Solutions", 2024
  - "12 in 11 Award, Godrej Infotech", 2018

  Use only these, unless another record in the data says otherwise. "Best AI Operator" and "Buildathon recognition" from the spec's examples appear only if the data records them; the Cubicle buildathon is a team build, not an award. NEVER use Nvidia Research Award, Star of the Month or Spot Award.
- **Patent:** a GRANTED Indian patent, IN 429867, co-inventor, for the portable point-of-care device (see `data/credentials.ts` for the exact title). The reference's "1 patent filed" is wrong: it's granted.
- **Publications:** count and titles come from `data/credentials.ts` publications (e.g. the 2025 aptasensor paper, 2023, etc.). The Soft Matter DOI is recorded as MISSING, so don't invent it. Name journals only if the data names them.
- **Education:** B.E. and M.Tech. details live in the data (`campus-bit`, `campus-nitc` media exist). Per the spec, About shows research roots only. If detailed education is currently only on About, move it to Experience; if Experience already covers it, just drop it from About.
- **Research dates:** use only recorded dates. The reference's "2010–2013" is a placeholder.
- **Privacy:** no location (`site.showLocation=false`) and no phone number.

## 4. Implementation notes
- **Nav:** TASK-135 just hid the Thinking and Playground tabs via `hidden: true` in `lib/nav.ts`. Spec §53 predates that. Keep them hidden and don't touch `lib/nav.ts`.
- **Art:** the collage, chapter art, research artifacts and mountains are hand-authored SVG, as static files in `public/about/`, the way TASK-127 did its covers in `scripts/portfolio-art/`. No image generation is available. The book spines may read AI / Systems / Products / Impact, as the spec asks; all other art is text-free.
- **Company logos in the career strip:** only the real ones already in the repo, and only where accurate.
- **Colour:** EVAL-020 forbids colour literals in `app/`, `components/` and `lib/` .ts/.tsx/.css, except `app/globals.css`, which must keep exactly 13 `--color-*` tokens. Derive colours from tokens or keep them inside the static SVGs.
- **Tests that assert the old About** (`about.spec.ts`, `about-part2.spec.ts`, `a11y-90d`, `eval-018`, the unit tests under `tests/unit/about*`): update them to the new contract, and keep axe (eval-006) and reduced-motion coverage.
- **The Experience page** must still hold everything that leaves About. Check it with a before/after diff of what each page shows.

## 5. Gates (all required)
- `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, the full `pnpm test` and `pnpm build`.
- The FULL `pnpm test:e2e` suite at w390, w768, w1024 and w1440. If a test fails only under load, re-run it alone before calling it flaky.
- The bundle budget for `/about` and `/`: `pnpm exec tsx scripts/bundle-budget.ts --route /about --json`. The budget is 180 kB gz.
- Before and after screenshots of `/about` (and of `/work` if it changes) at 390, 768 and 1440, in `docs/screenshots/m-009/task-136/`. Compare your 1440 shot with the reference and refine up to twice.

## 6. Commits, push and report
- **Commits:** imperative subjects that include TASK-136, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or your own model).
- **Push:** only `cloud/task-136`. Never push to or merge into `m-009-redesign` or `main`. Never deploy. Don't edit `backlog/`.
- **Report:** your last commit is `docs/reports/TASK-136.md`, covering:
  - the spec's §70 list and §69 checklist;
  - the KEEP / SHORTEN / MOVE / REMOVE table;
  - the gate counts;
  - open content questions for Tushar;
  - the commit list.
