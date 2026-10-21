# Evaluation addendum — 2026-10-21 · Stage 12 · EVAL-005 mobile LCP re-measured (RCA2)

**Provenance:** production tusharpathak.com at `3c94774b` · Lighthouse 12.6.1 (repo `@lhci/cli`) · headless Chrome, fresh temp profile · idle host (orphaned headless Chrome from the Stage 9 run stopped first) · 2026-10-21 ~13:15 IST. Supersedes nothing: the Stage 9 numbers in `eval-report-2026-10-21-m011-showcase.md` stay as recorded, with their method now named.

| Route | Throttling method | Runs | LCP ms | FCP ms (median) | Notes |
|---|---|---|---|---|---|
| `/` | simulate (Lighthouse default), Stage 9, contended host | 3 | 5299 / 5449 / 7338 | 2745 | render delay 2.6–5.8 s (modelled) |
| `/` | simulate, idle host | 3 | 3514 / 3781 / 6537 | — | render delay 0.75–4.8 s (modelled, unstable) |
| `/` | **devtools (applied)**, idle host | 3 | **2693 / 2760 / 2860** | 2760 | **LCP = FCP**; TBT 217; CLS 0 |
| `/projects` | simulate, Stage 9 | 3 | 6273 / 6410 / 6975 | 2911 | — |
| `/projects` | simulate, idle host | 3 | 4892 / 5544 / 6134 | — | — |
| `/projects` | **devtools (applied)**, idle host | 3 | **2600 / 2646 / 2724** | 2646 | **LCP = FCP**; TBT 767; CLS 0 |

**Chrome trace** (Playwright + CDP, 412×823 @1.75, 4× CPU, 1.6 Mbps / 150 ms, `/`, 3 runs): bg image `hero-home-bg-mobile.webp` responseEnd 0.89–1.01 s; single LCP candidate = that image at 1.49 / 1.52 / 1.68 s; long tasks > 100 ms only from 4.9 s (hydration era).

**Verdict (EVAL-005, mobile LCP ≤ 2.5 s):** FAIL by ≈ 0.15–0.26 s with applied throttling — bounded by first contentful paint, not by the hero image. Accepted as TASK-320 (P2, first-paint optimization). Regression guard: `tests/e2e/lcp-hero.spec.ts` (20/20 on production; negative control fails as intended).

## After (TASK-320, lane m034/mobile-paint) — diagnosis only, no code change shipped

**Provenance:** local `pnpm build` + `next start -p 3116` at `f98ad78c` · `lighthouse@13.5.0 --throttling-method=devtools --form-factor=mobile --only-categories=performance` · 3 runs per route · **host load average 84-124 (other lanes building)**, so absolute numbers run well above the idle-host production numbers above and are only usable for like-with-like comparison.

| Route | Runs | FCP ms (median, range) | LCP ms (median, range) | CLS | TBT ms |
|---|---|---|---|---|---|
| `/` baseline | 3 | 3081 (2524-3527) | 3264 (3263-3763) | 0.001 | 1843-2061 |
| `/projects` baseline | 3 | 3523 (3236-3878) | 4094 (3742-4102) | 0.001 | 1908-2472 |

Run-to-run range (about 1 s on FCP) is larger than any effect a font or inlining change could plausibly produce, so none could be validated here.

**What gates first paint (run `/` #2, FCP 2524):** document response 0.73 s (contended local server; Vercel CDN differs), then the one 486 kB (90 kB gzip, 94 kB br on Vercel) minified stylesheet ends at 1.84 s, then a 446 ms and a 650 ms main-thread task (1.97-3.08 s, attributed to the document: style recalc and layout over that stylesheet at 4x CPU) straddle FCP. Fonts are requested at 2.42 s, after the first paint, so they are not on the critical path.

**Candidates, and why none was shipped:**
- `experimental.inlineCss`: already tried and reversed (TASK-155, see `next.config.ts`). The stylesheet is now 486 kB raw (was 322 kB), and inlining writes it twice (style plus RSC payload), turning a 28 kB gz document into roughly 1 MB raw. Predicted worse; not rebuilt.
- Fonts: already `preload: false`, `display: "swap"`, latin subset, metric-adjusted fallbacks. Requested after FCP, so no lever for first paint.
- Deferring non-critical CSS: Next emits `app/globals.css` as one chunk for every route, so this means splitting that file by route or section. Out of scope for this lane (another lane is editing it); stopped here.

**Remaining gap / recommendation:** the only lever left is cutting the bytes and style-recalc cost of the shared 486 kB stylesheet (route-scoped CSS, or `content-visibility: auto` on below-the-fold sections after a scroll-choreography review). Re-measure on an idle host before and after; a host with load under 2 is needed to resolve effects under 200 ms.
