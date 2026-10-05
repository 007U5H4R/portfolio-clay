# TKT-96 · Whole home scene + paper-over-image parallax

Branch `m009/tkt-96` (from integration `f121e25`), worktree `Portfolio-m009-tkt-96`. Campfire TASK-91. Tushar direction 2026-09-26 (overrides the TKT-92r2 height cap and EVAL-001's first-viewport rule at ≥ 768). Design.md §11 **Dev-39**.

## What changed

- **Whole scene on `/` at ≥ 768** (`app/globals.css` "TKT-96" block): `.hero-banner` is an inline-size container, and the banner box is `--banner-h: calc(100cqw / (3168 / 1344))`, with no cap. The box therefore equals the canvas, and nothing is cropped (desk, laptop, mug, books, the sleeping dog). Using `cqw` instead of `vw` means a classic scrollbar can't make the box taller than the canvas. It is still one box cropping one canvas, so the TKT-93 clip stays registered (the EVAL-019 registration test at 1024/1440/1920 passes). I removed the TKT-92r2 `≥ 1024` cap and the reduced copy top padding, and rewrote the TKT-92r2 comment so it is accurate. `Hero` no longer passes `focalY`, which had no effect once nothing crops vertically.
- **< 768 keeps the 4:3 art-directed crop** (my call, recorded in Dev-39). A whole 21:9 scene at 390 px would be about 165 px tall. The first-viewport 5-second rule stays enforced at 390.
- **Parallax, paper over image.** The image layer is the home `.hero-banner` (banner, polaroids, postmark) or the openers' `.scene-banner`. It gets `animation: scene-parallax` (`translate` 0 → 50vh) on `animation-timeline: scroll(root block)` over `animation-range: 0 100vh`, so it moves at half speed. It is CSS only: no JS listeners, it works under Lenis (native scroll underneath), and it sits behind `@supports (animation-timeline: scroll())`.
  - **Home:** the torn edge moved from the banner bottom to the top of a new `.hero-sheet` (z 4, `margin-top: -44px`, full-bleed paper gradient below the tear). The sheet slides over the image, torn edge first.
  - **Openers:** `.scene-opener` clips its own bottom (`overflow-y: clip`), so the slower banner disappears under its torn edge. The DOM is unchanged and so are the opener heights. This applies to all seven routes.
  - **Reduced motion:** the animation lives only inside `@media (prefers-reduced-motion: no-preference)`. Under `reduce` there is no animation, no translate and no sticky layer, just plain scroll. The paper still overlaps the banner at rest.
- **Polaroids:** they are on the image layer, so the paper covers them on scroll. Widths now scale with the uncapped banner: `max(136px, 18vw)` for the upper two, so they still reach the corkboard's bottom edge (about 19.1 vw) at every width ≥ 768. The third is `max(120px, 11vw)` at `bottom: 0`, tucked under the tear and clear of the books. `sizes` changed to `18vw`. The corkboard is covered at 768, 1024, 1440 and 1920 (see the screenshots).
- **Measured (w1440):** the parallax test's paper-to-image distance goes from 566.9 to 466.9 px on `/`, and from 418.0 to 318.0 px on `/work`, after 200 px of scroll. The paper gains 100 px on the image.

## Tests

- `tests/e2e/hero-scene.ts` (new, a shared helper that is not a spec file) has three checks:
  - `expectWholeScene`: box height = width × 1344/3168 ± 2 px, and the canvas is flush with the box on all four edges.
  - `expectCopyWithinOneScroll`: the scroll needed to bring the CTAs into view is ≤ 1 viewport, and after that scroll the h1 clears the header and both CTAs are fully in view.
  - `scrollToY`.
- `tests/e2e/hero-fold.spec.ts` has five tests:
  - The w390 first-viewport test, unchanged in substance.
  - A ≥ 768 whole-scene + copy-within-one-scroll test (w768, w1024, w1440, plus 1920 inside the w1440 run).
  - Parallax on `/` and on `/work`: after 200 px the paper has gained 80 to 120 px on the image, and `animation-name` is `scene-parallax`.
  - Reduced motion on `/` and on `/work`: no animation, `translate`/`transform` are `none`, 0 animations, and the layers scroll together (±1 px).
- `tests/e2e/home.spec.ts` EVAL-001: w390 keeps the first-viewport assertion; w1440 now asserts the whole scene, then the copy within one scroll.
- No other test was edited or weakened.

## Gates (all run through `heavy.sh`)

```
pnpm typecheck      clean
pnpm lint           clean
pnpm tokens:check   13/13 tokens round-trip OK
pnpm test           51 files passed (1 skipped) — 579 passed, 2 skipped
pnpm build          all routes static (13)
pnpm test:e2e       2344 tests, workers 1 — 1055 passed, 1289 skipped (viewport-scoped), 0 failed (16.3 m)
eval-018-parked     []
bundle /            first-load JS 158.5 kB gz (budget 180)
Lighthouse desktop / (local, informational): perf 0.99 · CLS 0.0304 · LCP 852 ms
```

## Screenshots (`docs/screenshots/m-009/tkt-96/`)

- `home-{390,1024,1440,1920}-scroll{0,300}.png`
- `home-768-scroll0.png` (corkboard check at 768)
- `work-1440-scroll{0,300}.png`

## Notes / open

- Browsers without scroll-driven animations (Firefox without the flag, older Safari) get plain scroll. The paper still overlaps the banner at rest, so the effect degrades gracefully.
- The TKT-92r2 CLS work on the hero h1 font swap (TKT-92r3, running in parallel) is untouched; I did not edit `app/layout.tsx`.
- At rest, the torn edge covers the bottom 44 px of the banner (desk edge only). The dog is fully visible at every width ≥ 768.
