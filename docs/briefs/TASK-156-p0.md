# Brief — M-011 P0 (TASK-156): `paperMotion` + `PaperParallaxScene` + gyro chip + specs

**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m011-p0`, branch `m011/p0` (off `m-009-redesign` @ `aa92a99`). Work ONLY here. Never touch `main`, never push, never deploy.

## Objective
Build the shared Paper World motion primitive so every scene gets the same depth and physics (spec `docs/specs/m-011/paper-world.md` §06–07, §25–30). Subtasks in order; **one commit per subtask**, message ends with `(TASK-156.N)`:
- **156.2** `lib/paper-world/motion.ts` — `paperMotion` singleton. TDD with Vitest (`tests/unit/paper-motion.test.ts`).
- **156.3** `components/paper-world/PaperParallaxScene.tsx` (+ `SceneMotion.tsx` client island, `paper-world.module.css`), typed layer manifest `content/media/illustrations/layers.ts` with the `hero-home` entry, and the EVAL-034 unit test `tests/unit/eval-034.test.ts`.
- **156.4** `components/paper-world/GyroChip.tsx` + `tests/e2e/eval-033.spec.ts` (tag `@EVAL-033`).
- **156.5** a fixture scene on `app/dev/primitives/page.tsx` using `hero-home` + `tests/e2e/eval-032.spec.ts` (tag `@EVAL-032`); bundle delta: the primitive + island add ≤ 3 kB gz to `/`'s first-load JS — measure with `scripts/bundle-budget.ts` before/after (both numbers in the commit body). When a spec lands, remove its id from `DEFERRED_SPECS` in `scripts/eval-cases.ts` and confirm `pnpm tsx scripts/eval-cases.ts --check-specs` passes.
(156.1 — tokens in `globals.css` — is NOT yours; other sessions are editing that file.)

## Read first (targeted — do not read whole large files)
- `Design.md` §14 only (`grep -n '^## 14' Design.md`, read to EOF): §14.3 elevations + `--par-*`, **§14.4 motion contract (normative)**, §14.5 asset standard, §14.6 component contracts.
- `technical-plan.md` §G (end of file), `evaluation-plan.md` §10 (end of file).
- `evals/eval-cases.json` entries EVAL-032, 033, 034, 035 (thresholds are binding).
- Existing patterns: `components/paper/SceneBanner.tsx` (scene `<picture>` + theme sources today), `components/interactions/SmoothScroll.tsx` (mount-once gating), `lib/cursor/gate.ts` (fine-pointer/RM checks), `content/media/illustrations/manifest.ts` (entry shape), `public/media/paper-world/README.md` (the 16 layer WebPs already encoded under `public/media/paper-world/hero-home/`).

## Hard requirements (Design.md §14.4 + TASK-155 latency budget — all binding)
1. **One** passive `pointermove` listener on `window` (fine pointer only), **one** rAF loop for the page. Spring: stiffness 120, damping 20, mass 1; low-pass α 0.15 on sensor input; clamp tilt ±25°.
2. The loop **stops** when settled (|Δ| < 0.001 and |v| < 0.01), when no registered scene intersects (IntersectionObserver), and on `visibilitychange` → hidden; restarts only on new input.
3. Writes only `--pp-x` / `--pp-y` (unitless −1…1) on **intersecting** scene roots. Layers move via CSS `translate: calc(var(--pp-x) * var(--range) * var(--par)) …` — transform/translate only; never top/left/width/height/filter/box-shadow.
4. Ranges: fine pointer ≥ 1024 px → ±12 px normal, layers with `par ≥ .40` ±25 px; 768–1023 → × 0.5; orientation → bg 2, distant 5, mid/subject 9, fg 14, details 18 px max.
5. `prefers-reduced-motion: reduce` → attach **no** listeners; layers at rest. Decide at init and react to the media query changing (remove listeners if it turns on).
6. Scroll depth: CSS only (`animation-timeline: view()` on a per-layer wrapper, inside `@supports` and `prefers-reduced-motion: no-preference`), composed on a wrapper so it never overwrites the pointer translate. No scroll listeners, no `preventDefault` anywhere.
7. Gyro: if `DeviceOrientationEvent.requestPermission` exists, render the chip (`<button>` "Move your phone to explore", ≥ 44 px) and call `requestPermission` **only** synchronously in its click handler; denied/error → hide chip, no console error, scroll still works. Without `requestPermission` (Android) attach `deviceorientation` (passive) only while a scene intersects. Never on fine-pointer desktops.
8. `PaperParallaxScene` is a **server component**: each layer a `<picture>` with the active-theme source (follow SceneBanner's theme mechanism; the inactive theme must not be fetched), mobile source `< 768px`, explicit width/height, `alt=""` + `aria-hidden` on layers, `role="img"` + the scene alt on the root. `priority` scenes: `bg` (and `subject` when flagged) eager, `fetchpriority="high"` only on bg; all others `loading="lazy" decoding="async"`. Each layer box inset by −(its max shift + 4 px) (bleed). The client island only registers the root with `paperMotion` (≤ 1 kB gz).
9. Do NOT edit `app/globals.css`, header/footer components, `components/cursor/*`, `components/hero/*` (P1 owns Hero). Styles go in `components/paper-world/paper-world.module.css` with local fallbacks for `--par-*` (156.1 adds the global tokens later).
10. Static prerender must keep working (no `window` at module top level on server paths).

## Gates before you report (paste the tail of each output)
- `pnpm lint`; `pnpm tsx scripts/eval-cases.ts --check-specs`.
- Single-file Vitest outside the lock is fine: `pnpm vitest run tests/unit/paper-motion.test.ts tests/unit/eval-034.test.ts`.
- **Heavy work through the lock only:** `"/Volumes/E Drive/Dev/.scratch/heavy-gate.sh" m011p0 zsh -c 'pnpm typecheck'`; build + your specs: `"/Volumes/E Drive/Dev/.scratch/heavy-gate.sh" m011p0 zsh -c 'pnpm build && PW_BASE_URL=http://127.0.0.1:3341 pnpm test:e2e tests/e2e/eval-032.spec.ts tests/e2e/eval-033.spec.ts --reporter=line'` (check `package.json` / `playwright.config.ts` for how the base URL and server start work; Playwright needs `.env.tooling`). Then the bundle budget per 156.5.
- First run `pnpm install --frozen-lockfile` here if `node_modules` is missing.

## Anti-hang rules (scars)
- No external wait over 5 minutes. Commands > 2 min: run in background with a timeout ≤ 7200000 ms and check on them; never leave a dev server running when you finish.
- 8 GB RAM: never two heavy commands at once; if `heavy-gate.sh` reports busy, wait — don't bypass.
- e2e may rewrite tracked `docs/screenshots/**`: before each commit `git stash push -m m011p0-shots -- docs/screenshots` (never `git checkout --` them); don't commit them.
- A design question the docs don't answer: make the smallest reasonable call, note it in the commit body as `Dev-19x:` (P0 owns Dev-190…194), continue.

## Report (final message, ≤ 300 words)
Commits (sha + subject) · gate outputs (pass/fail counts) · `/` first-load gz before → after · Dev-19x decisions · anything undone and why.
