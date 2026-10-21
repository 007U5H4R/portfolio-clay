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
