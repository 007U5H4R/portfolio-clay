# TASK-202 brief: 3D paper-cut art for the carousel and Featured Work cards (cloud session)
Repo github.com/007U5H4R/portfolio-clay, branch `m013/card-art`. It is based on `m013/carousel`, which holds the new Home Featured Work (TASK-186), the carousel (TASK-197) and P3, and is being released now. Before you push, merge origin/main **and** origin/m013/carousel. No one answers questions during the run; make the best call and record it.

## Read
- the Home and Carousel V2 specs (search `docs/` and `docs/briefs`);
- `public/media` and the SVG project covers;
- the Featured Work layered-art split (`featured-*` layers) and its manifest test;
- `Design.md`.

## Work
1. **Generate art with the Higgsfield MCP connector.** Check the balance first; the budget is about 25 credits. Make one 3D paper-cut diorama per project that matches the existing palette and each project's story:
   - all 13 carousel covers;
   - the three Featured Work cards (RailCite, Slag City, Campfire).

   Rules:
   - no text inside the art;
   - consistent upper-left light;
   - flat backdrop, then key to transparency where layered.
2. **Featured Work keeps its depth layers.** Each card needs back, mid and front layers so the existing 2/4/6 px parallax still works; update the layer manifest and its test honestly. Keep the RailCite signature overlays aligned.
3. **Ship WebP/AVIF** with explicit sizes, lazy-loading offscreen, and keep the LCP, CLS and bundle budgets. Report the total bytes before and after.
4. **Provenance:** add a README beside the assets with the model, prompt, job id and credits for each.
5. **Fallback:** if an asset is off-style after two tries, keep the existing cover for that project and note it.

Commit with TASK-202. Screenshots of `/` and `/projects` at 1440 and 390, light and dark, go to `docs/screenshots/m-013/task-202/`.
## Setup
- **Stack:** Next.js 16, Tailwind v4, pnpm 11 (`corepack enable`), Vitest and Playwright.
- **Environment:** in every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Do not edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`. If the download is blocked, link the preinstalled Chromium, as earlier cloud runs did.
- **Before your final push:** run `git fetch origin && git merge origin/main`.

## Rules
- Follow the site's P1 interaction contract (decisions.md EXE-59..65; Design.md §14.10):
  - hover only under `(hover: hover) and (pointer: fine)`, each with a `:focus-visible` twin and a touch `:active` state;
  - shadows swap or crossfade by opacity;
  - no scale hovers and no infinite animations (TASK-143 scar);
  - reduced motion means no movement.
- Design.md tokens win. Every claim must exist in `data/`.
- Commits: imperative, with your TASK id, and **NO AI attribution**. Set the repo-local git identity to the one in recent history (`007U5H4R`), never `Claude <noreply@anthropic.com>`.
- Push only your branch. Never touch main or m-009-redesign, never deploy, and do not edit `backlog/`.
- Gates:
  - `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, then `ALLOW_DEV_ROUTES=1 pnpm build`, then the full `pnpm test`;
  - the full `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` at all 4 widths.
  - Re-run any failure alone with `--workers=1`; if it still fails, compare it against main in the same container and explain it.
  - Known pre-existing failures: EVAL-008 `/dev/artifacts` (TASK-178), EVAL-033 (TASK-173), EVAL-039 (flaky, TASK-191), and network or font failures specific to this container.
- Commit `docs/reports/<TASK>.md` last. Include what changed, the judgement calls, the gate counts, the screenshots and the limitations.
