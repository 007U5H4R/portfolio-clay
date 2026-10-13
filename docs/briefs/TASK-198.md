# TASK-198 brief: Gummy Lab paper-machine loading screen (cloud session)

You are working in a Claude cloud session on Tushar Pathak's portfolio. No one will answer questions during the run, so make the call that best serves his spec and record each call in your report.

## 1. Setup
- **Repo:** https://github.com/007U5H4R/portfolio-clay, branch `m013/lab-loader`. The branch is `main` (production) plus this brief, the spec and the reference.
- **Stack:** Next.js 16, Tailwind v4, React Three Fiber + `@react-three/rapier`, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Environment:** in every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Before the final push:** `git fetch origin && git merge origin/main`.

## 2. Read first
- `docs/specs/lab-loader-spec.md`: Tushar's spec, verbatim. It is the source of truth.
- `docs/redesign-mockups/m-013/lab-loader/reference.png`: light and dark. It shows a "TUSHAR'S SECRET LAB / Gummy Lab / Preparing the playground…" header, a paper conveyor with gears, a gummy riding the fill, a percentage plaque and 4 stages (Loading assets, Building world, Calibrating physics, Almost there…).
- `components/lab/` (LabApp, LabUi, the intro screen, the GLB asset loading, `data-lab-asset`), `lib/lab/`, `Design.md`, and `decisions.md` (EXE-55, EXE-57, EXE-66).
- `tests/e2e/eval-030*.spec.ts` and `tests/e2e/lab-helpers.ts`.

## 3. Facts that settle the spec
1. **Real progress only.** Drive the bar from the real loading lifecycle: the GLB and texture loading (e.g. drei/three `LoadingManager` or `useProgress`), Rapier WASM init, and first frame ready. Map those to the 4 stages honestly. If a stage isn't measurable, it is indeterminate, not faked. The bar must never move ahead of the real state, and on completion it hands off to the existing intro/game flow.
2. **Performance is a hard gate (TASK-143 scar, EXE-55).** The lab once failed to boot because infinite CSS animations starved WebGL.
   - The loader must not run infinite CSS animations while the canvas boots. Gear rotation is driven by progress, or by one rAF loop that stops at completion.
   - No per-frame allocation.
   - The loader is removed from the DOM after hand-off.
   - Under reduced motion there are no rotations and no travel animation; only the fill and percentage update.
3. **Fast loads:** if loading finishes in under about 300 ms, skip or minimise the loader so it never delays play.
4. **Tokens and fonts:** Design.md tokens win over the mockup's colours. Use the site faces, with Caveat only per Design.md §3.4 (e.g. "Preparing the playground…"). No glassmorphism and no neon.
5. **Art:** use the Higgsfield connector for the paper props (gears, lamp, jars, sketches, star, ring, stacked books), generated on a flat backdrop and keyed to transparency; or build them procedurally in SVG/CSS where that is crisper.
   - No text inside the art.
   - Small WebP files with explicit sizes, plus a provenance README.
   - Budget about 12 credits.
   - The gummy can reuse existing gummy art or the GLB render.
6. **Accessibility:** use `role="progressbar"` with `aria-valuenow` (or indeterminate) and a polite live-region update per stage. Escape and Back still exit.
7. **Light and dark** both match the reference. The layout works at 390 with no horizontal overflow.

## 4. Gates (all required)
- `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, `ALLOW_DEV_ROUTES=1 pnpm build`, then the full `pnpm test`.
- The **full** `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` at all 4 widths. Re-run any failure alone with `--workers=1` and explain every one that remains. Known pre-existing failures: EVAL-008 `/dev/artifacts` (TASK-178), EVAL-033 (TASK-173), and EVAL-039 flaky (TASK-191).
- **New tests:**
  - unit: the progress mapper is monotonic and never ahead of the inputs;
  - e2e: the loader shows, `aria-valuenow` rises, it hands off to the intro, it is gone from the DOM afterwards, there is no infinite animation, and reduced motion has no motion.
- **Screenshots:** `docs/screenshots/m-013/task-198/` at 1440 and 390, light and dark, at about 0%, about 68% (staged via the lab's `?debug` hooks if needed) and complete.

## 5. Commits, push, report
- **Commits:** imperative subjects with TASK-198. **No AI attribution** of any kind.
- **Push:** push only `m013/lab-loader`. Never touch `main` or `m-009-redesign`, never deploy, and don't edit `backlog/`.
- **Report:** commit `docs/reports/TASK-198.md` last. Include what changed, how progress is measured, the judgement calls, gate counts, the lab chunk size before and after, credits used, screenshots and limitations.
