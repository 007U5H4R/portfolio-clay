# TKT-92 round 4 · mobile TBT / LCP after the TKT-96…113 wave (TASK-88)

Branch `m009/tkt-92r4`, from integration `db8f782`. Implementer: Opus 5.5. Not merged, pushed or deployed.
No threshold, budget, `lighthouserc`, `next.config.ts` or font-config change.

## TL;DR

- **`/` TBT: root cause found and fixed.**
  - Two decorative glyphs sat outside every web font's `latin` subset: "✦" in the hero "Ask Tushky" CTA (TKT-108) and "↳" in the featured card's flow sketch.
  - For each, Chrome ran a **whole-system font-fallback search** at first layout, and again after the web-font swap.
  - Those searches turned the page's two full-document layouts into 56–87 ms tasks, which Lighthouse's 4× mobile CPU model scores as 210–325 ms long tasks. That is most of the preview's ~600 ms TBT.
  - The fix names the family that already supplies each glyph (Zapf Dingbats / Lucida Grande on macOS/iOS). It goes *second* in the same font stack, so the web font still sets the line metrics.
  - Result: **pixel-identical** (screenshot diff = 0 on all five crops), and cold layout on `/` drops **83 → 28 ms**.
- **Guard:** `tests/e2e/fallback-glyphs.spec.ts`. It fails on `db8f782` (reports "✦" → Zapf Dingbats and "↳" → Lucida Grande) and passes after the fix.
- **`/work/teachspark` LCP: no code change.** The LCP image is already right: eager, `fetchpriority="high"`, preloaded first, 10 kB WebP at `w=390` through the mobile `<source>`. It is also already guarded by `scene-opener.spec.ts`.
  - The miss comes from how Lantern prices the page. The observed paint (~630–700 ms on the preview) lands just after the fonts (245 kB) and JS (~185 kB) finish, so all of those bytes are charged to LCP.
  - The baseline was the same coin-flip: at `2bd4949` teachspark ran 98 / 99 / **89** (LCP 2274 / 1696 / **3487**).
  - The page-side lever left is the CSS size. See "What I could not fix".

## Root cause 1: `/` TBT, system font-fallback search (fixed)

Evidence, in the order found:

1. **RC LHRs** (`rc-dbc047c-r2/mobile`):
   - `/` main thread: Style & Layout **1789 ms**, Other 1802 ms. Teachspark's Style & Layout is 262 ms.
   - The largest long tasks are attributed to the *document*, not to JS: 325 ms, 230 ms, 121 ms.
   - The `3_dc05…` chunk is react-dom plus the Next runtime (71 kB gz). Its 490 ms of "scripting" is hydration, about the same as on teachspark. It is not new app code: there is no motion/react or Lenis in the initial load, and Lenis is a dynamic import.
2. **Lighthouse trace, local build `db8f782`:** two *full-document* `Layout` events (≈ 673 of 675 layout objects dirty), measured unthrottled:

   | Page | 1st layout | 2nd (after the font swap) |
   |---|---|---|
   | `/` | 56–87 ms | 76–77 ms |
   | teachspark (321 objects) | 10 ms | 12 ms |

   A forced *warm* relayout of `/` costs < 1 ms, so the cost is cold, one-off work, not box complexity.
3. **Cold-layout bisection:** inject `display:none` CSS into the served HTML, block JS, read CDP `LayoutDuration`, median of 5 per variant (`.scratch/m009/tkt-92r4/cold.mjs`).

   | Variant | Cold layout |
   |---|---|
   | control | 81–87 ms |
   | hide `.hero-copy` | 43 ms |
   | hide `.hero-cta-row` | 45 ms |
   | hide `.hero-btn-spark` (the "✦" span) | **45 ms** |
   | + hide `.flow-arr[data-indent]` (the "↳") | **26 ms** |
   | hide `main` entirely | 8 ms |

   Hiding every image, SVG or animation, or setting `text-wrap: wrap`, did not move layout.
4. **`CSS.getPlatformFontsForNode`:**
   - "✦" renders in *Zapf Dingbats* and "↳" in *Lucida Grande*. Neither family is in the element's stack (`Fraunces, Iowan Old Style, Georgia, serif` / `Caveat, Segoe Print, Bradley Hand, cursive`), so both were found by the system search.
   - "→" resolves to the generic default (Times New Roman), which is cheap because it is tried before any search. Hiding "View my work →" moved nothing.
5. **Fix check:** with the families named, the same bisection gives **28 ms** (= glyphs hidden).
   - Across three Lighthouse traces the full-document layouts are 13–21 ms.
   - The largest document-attributed long task in the local LHRs is 92–98 ms (base: 174–267).
   - Style & Layout is 846–865 ms (base: 1107–1628). One of the three "after" runs was host-noisy: load average ≈ 7.4 and observed LCP 797 ms.

**First attempt, rejected:** putting the named family *first* made the glyph's own font the span's primary font. That changed the strut, and the glyph moved about 1 CSS px (diffs on 4 of 5 crops). The shipped version keeps the web font first (`var(--font-fraunces), "Zapf Dingbats", …`), and all 5 crops diff to zero against `db8f782` (412 wide, DPR 2).

## Root cause 2: `/work/teachspark` LCP (diagnosed, not fixed)

- **LCP element:** `scene-casestudy` opener `<img>`, `loading="eager"`. The `<picture>` mobile source is preloaded with `fetchPriority="high"` and is the first request after the document. It is 10.3 kB and served at `w=390` to the Moto G profile. TKT-96/103 did not make it lazy or change which image is LCP.
- **Preview traces** (3 fresh runs, `.scratch/m009/tkt-92r4/trace/preview`):
  - The image finishes at 410–574 ms and the first frame is rasterised by ~527 ms.
  - Presentation (FCP = LCP) is at 637–698 ms, after ~80 ms of GPU tasks, with hydration (65–72 ms) in between.
  - Fonts finish at 545–614 ms and JS at 555–603 ms, both before that paint.
  - Lantern therefore charges all ~520 kB (document + fonts + JS + image) at 1.6 Mbps, plus the pre-paint CPU at ×4.
  - One of the three runs hit the 1 Hz frame stall anyway (observed FCP 2130 ms; see round 1).
- **What grew since `2bd4949`:**
  - `app/globals.css` went from 158 kB to 286 kB of source (236 kB minified), and it is inlined **three times** in every HTML: the `<style>`, the layout's flight row, and the global-error flight row.
  - Teachspark HTML is 850 kB raw, 80 kB transferred with Vercel's Brotli (was 58 kB).
  - On the preview, before FCP, the main thread spends ~62 ms in `ParseHTML` plus 60–71 ms compiling inline flight scripts, two of which are the 237 kB CSS strings.
  - Only ~16 % of the rule bytes match anything on teachspark.
- **Tried and rejected: a user-land `app/global-error.tsx`** re-exporting Next's built-in, to drop the third copy. Turbopack still attaches the root CSS to it: three copies before and after. Reverted.

## Changes

- `app/globals.css`, two declarations with comments:
  - `.hero-btn-spark { font-family: var(--font-fraunces), "Zapf Dingbats", "Iowan Old Style", Georgia, serif; }`
  - `.sketch-flow .flow-arr[data-indent] { font-family: var(--font-caveat), "Lucida Grande", "Segoe Print", "Bradley Hand", cursive; }`

  These are the existing `--font-display` / `--font-hand` stacks with one family inserted second. Where that family is not installed, the stack behaves exactly as before.
- `tests/e2e/fallback-glyphs.spec.ts` (new): on `/` and `/work/teachspark` at w390 and w1440, every system font used for text must be named in the element's (or a descendant's) `font-family`, or be a generic default face.

## Measurements

**Local `lhci`** (brief's method: 3 runs, mobile preset, `--disable-frame-rate-limit --disable-gpu-vsync`, same host), medians:

| Page | Before perf / LCP / TBT | After perf / LCP / TBT |
|---|---|---|
| `/` | 77 / 4895 / 45 | 76 / 4968 / 49 |
| `/work/teachspark` | 81 / 4216 / 68 | 81 / 4075 / 51 |

This method **cannot see either problem.** Loopback delivers every font and JS byte before the first paint, so Lantern charges them all and simulated FCP is ~3.0 s (round 1 found the same). The early layout tasks then fall *before* simulated FCP, and TBT only counts tasks after FCP. On the preview, simulated FCP is ~1.5 s and the same tasks count. The table is recorded for completeness. The trace metrics in "Root cause 1" are the evidence for the fix.

**Expected on the preview (unverified):**
- `/`: the three document long tasks (≈ 325 / 230 / 121 ms simulated) shrink to about 60–100 ms each. TBT should drop from ~600 to roughly 200–300, which puts perf around 90 or above. LCP is unchanged (~2.2 s, already passing).
- `/work/teachspark`: no change expected; it stays a coin-flip around 2.5–3.5 s.

## Gates (one locked run, after the final edit)

| Gate | Result |
|---|---|
| typecheck | ✓ |
| lint | ✓ |
| tokens:check | ✓ 13/13 |
| unit | ✓ 625 passed, 2 skipped |
| build | ✓ 15 routes static |
| bundle budget | ✓ `/` 160.1 kB gz ≤ 180 (unchanged) |

e2e (`PW_WORKERS=2`, all four widths) covered home, tracer, hero-fold, torn-parallax, scene-openers, scene-opener, home-ask-tushky, ask-panel, eval-010, lenis, featured and fallback-glyphs: **336 passed, 0 failed** (488 skipped by design). The churned tracer and ask screenshots were restored.

## What I could not fix, and the next levers

1. **Teachspark LCP.** The biggest page-side lever is route-splitting `app/globals.css`, so each route inlines only its own blocks:
   - Page-exclusive blocks go into route-imported CSS files (home, /work, /about, /certifications, /playground, /thinking, contact).
   - That cuts the three inline copies, the `ParseHTML` time and the flight-script compile time roughly in proportion.
   - It is a sizeable refactor with cascade-order risk, and 7 test/script files read `globals.css` directly. It deserves its own ticket and a visual-diff pass, not a tail-end change here.
   - Estimated effect: −100 to −300 ms of simulated LCP. That helps, but it does not guarantee the bar while the measuring host decides whether the paint beats the fonts.
2. **Other glyphs** in source outside the latin subset that the guard does not yet cover. These are unmeasured; they would need the guard extended to their routes:
   - "∞" on /about
   - "↗" on /certifications
   - "≈ ≤ ≥ ↔ ₹ ←" in project data and essays
   - the `::before` "↳" on /about's `.job-body` (the guard does not see pseudo-element content)
3. **Home hydration** (react-dom chunk, 130–260 ms simulated) is the remaining home long task. It is at parity with teachspark and was not changed here.

Scratch (scripts, LHRs, traces, screenshots): `/Volumes/E Drive/Dev/.scratch/m009/tkt-92r4/`.
