# TKT-92 · Perf: mobile LCP ≤ 2.5 s and perf ≥ 90. Implementer report

Branch `m-009-redesign` · TASK-88 · EXE-17 / EV6 · implementer: Opus 5.5 (standard tier). Not pushed.
Thresholds and budgets were not changed. First-load JS for `/` is 159.9 kB gz (budget 180).

## TL;DR

- **Change (two lines of config plus comments):** `experimental.inlineCss: true` in `next.config.ts`, and `preload: false` on the three `next/font` families in `app/layout.tsx`. Typefaces, axes, weights, subsets and `display: swap` are unchanged (S13). CSP needs no change: TP9 already allows inline styles.
- **Why:** preview LCP was high because the page's **first frame was held back**, not because of image size. Lighthouse's simulated LCP (Lantern) charges every request that finishes before the *observed* LCP. When the first frame is late, all fonts (241 kB) and all JS (170 kB) finish first, so all of them count toward LCP. Two things held the first frame:
  1. A render-blocking resource (external CSS, or preloaded fonts) was still in flight when Chrome first tried to render.
  2. This machine's headless Chrome drives frames on a **~1 Hz clock**: frames land at ~0.23 s, ~1.23 s, ~2.25 s. A page that misses the first tick waits about a second.
- **Result (preview-like harness, see Method):** `/` perf 93 → **95**, LCP 3207 → **1712** ms. `/work/teachspark` perf 87 → **96**, LCP 3955 → **1856** ms.
- **Caveat 1:** the brief's reference measurement (local `lhci` against a zero-latency `next start`) moves the **other way**: `/` 88 → 80, LCP 3915 → 4104; teachspark 87 → 82, LCP 4065 → 4215. The section "Why the two local measurements disagree" explains this. Per Tushar's change of plan the preview is the gate, and the preview has real network latency, so the preview-like harness is the better predictor. **This is unverified until the orchestrator re-measures on the preview.**
- **Caveat 2:** the ~1 Hz frame clock is an artifact of this measuring machine. If the preview is measured from this Mac with plain `lhci`, some runs can still hit the ~1 s stall. Recommendation below.

## Measurements

Every figure is the median of 3 runs, mobile preset, Lighthouse 12.6.1, `throttlingMethod: simulate` (the gate's method).

| Page | Where | Before perf / LCP / FCP | After perf / LCP / FCP | After CLS |
|---|---|---|---|---|
| `/` | preview `1941383` (EXE-17, pre-TKT-93) | 85 / 3922 / 1179 | not measured (re-measure on preview) | n/a |
| `/work/teachspark` | preview `1941383` | 89 / 3360 / 1114 | not measured | n/a |
| `/` | **preview-like harness** (Brotli, realistic network, frame clock unthrottled) | 93 / 3207 / 1107 | **95 / 1712 / 993** | 0.029 |
| `/work/teachspark` | preview-like harness | 87 / 3955 / 1105 | **96 / 1856 / 889** | 0 |
| `/` | local `lhci` (brief's method; zero-latency server) | 88 / 3915 / 915 | 80 / 4104 / 2562 | 0.017–0.028 |
| `/work/teachspark` | local `lhci` | 87 / 4065 / 915 | 82 / 4215 / 2585 | 0 |

The local `lhci` "before" set is from a fresh server. A stale `next-server` from an earlier session held :3000, and my first two runs hit it and were discarded (fonts returned 500, CSS was served as text/plain).

LHR JSONs:
- `evals/results/lighthouse-m009-tracer/local-tkt92/{before,after}/`: local `lhci`
- `.../local-tkt92/preview-like/{before,after}/`: preview-like harness

### LCP breakdown (observed phases, median run)

| Page / set | TTFB | load delay | load duration | render delay | Simulated LCP |
|---|---|---|---|---|---|
| `/` preview (before) | 322 | 45 | 338 | **1823** | 3922 |
| `/` harness before | 2 | 115 | 181 | 198 (first frame at ~1.2 s in throttled-clock runs) | 3207 |
| `/` harness after | 3 | 125 | 181 | **25** | 1712 |
| teachspark harness before | 2 | 118 | 260 | 218 | 3955 |
| teachspark harness after | 3 | 120 | 169 | **24** | 1856 |
| `/` local lhci before | 9 | 8 | 17 | 83 | 3915 |

Two things stand out:
- On the preview, the observed image load was only ~0.4 s, yet the render delay was 1.8 s. That preview trace (re-captured, `lhr-preview`) shows the main thread idle from 0.73 s to 2.46 s, the first paint at 1.42 s, and presentation at 3.46 s after a 1 s `GPUTask`.
- Locally the observed phases are tiny. The whole simulated LCP comes from bytes that finished before the observed paint: fonts 241 kB, JS 170 kB, image 21–30 kB, CSS 19 kB, document ~20 kB.

## Experiments (one change at a time)

| # | Change | Result | Kept? |
|---|---|---|---|
| E1 | `preload: false` on all three fonts only | local lhci: LCP 3915 → 3921; FCP 915 → 2420 (fonts found via CSS get VeryHigh priority, which Lantern treats as render-blocking); CLS 0.032. Harness (Brotli, unthrottled clock): `/` LCP 3207 → 2757, teachspark 3955 → 2736 | Only as part of E3 |
| E2 | `experimental.inlineCss` only | local lhci: LCP 3915 → 4215, FCP 915 → 1189. HTML 18 → 75 kB gz (CSS duplicated into the RSC payload; **30 kB with Brotli**, which Vercel serves). Harness: `/` LCP 3661, teachspark 2312; first frame still held by the font preloads | Only as part of E3 |
| D1 | Diagnostic: no web fonts at all (not shippable) | local lhci: LCP 2686 / 2839. **Even with zero fonts, the local zero-latency method stays above 2.5 s**, because the React/Next runtime (~115 kB gz) plus image plus CSS all finish before the observed paint | Diagnostic only |
| — | Font subsetting / axis instancing, sized offline with fontTools | Ceiling ≈ −80 kB (Fraunces 121 → ~73, Inter 48 → ~25, Caveat 75 → ~60). Worth ≈ −0.5 s simulated. Requires leaving `next/font/google` (S13) | Rejected (cost vs. gain) |
| E3 | E1 + E2 together | Harness: `/` 93 / 3207 → **95 / 1712**; teachspark 87 / 3955 → **96 / 1856**. First frame lands at ~130–190 ms instead of ~1.23 s. Local lhci regresses (table above) | **Kept** |

### How the render deferral was pinned down

I bisected with a proxy that served variants of the built HTML. Each variant was traced with the realistic network, and I read the `pagereveal` time: the page's first rendering opportunity.

| Variant | First frame |
|---|---|
| Trivial control page | 115–157 ms |
| Full page | ~1.23 s (6/6 runs) |
| Script-stripped page | ~1.24 s (not JS) |
| No CSS | still late |
| Minimal head + full body | ~0.12 s |
| Full head + trivial body | 1.21–1.25 s (4/4) |
| Only the font preloads | ~1.22 s (3/3) |
| Only the stylesheet | ~1.24 s (3/3) |
| Only the image preload | 0.12 s |

Inside the stalled window the main thread was idle and the renderer's paints were spaced exactly ~1 s apart. With `--disable-frame-rate-limit --disable-gpu-vsync`, frames were continuous and FCP landed at 209–372 ms in 4/4 runs. Conclusion: this Mac's headless Chrome renders at ~1 Hz. Any render-blocking request still in flight at the first frame opportunity pushes the first frame to the next tick. That makes the observed LCP late, which makes Lantern charge every byte.

Even with the frame clock unthrottled, the original code still holds its first frame to ~390 ms (CSS plus font preloads) and fails `/` (LCP 3207). E3 is therefore a real improvement, not only a workaround for the measuring machine.

## Why the two local measurements disagree

Local `lhci` runs against `next start` on loopback: every request finishes within ~100 ms, before any paint.
- With font preloads (before), the fonts have High priority, which Lantern does not treat as render-blocking, so FCP is fine.
- With E3, the fonts are discovered from the inline `@font-face` rules at VeryHigh priority. They still finish before the (instant) first paint, so Lantern adds them to FCP.

On the preview the network has real latency. The inline-CSS page paints before the fonts and JS arrive, so Lantern leaves them out. The preview-like harness models this: it records with devtools throttling calibrated from the preview waterfall (~12 Mbps, 100 ms latency, CPU 1×, Brotli), then audits the same trace with the gate's default simulate settings. It reproduced the preview baseline (harness `/` 86 / 4108 with the default clock vs preview 85 / 3922), so I trust it more for the preview. It is still a model: **the preview re-measure is the verdict.**

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ |
| `pnpm lint` | ✓ |
| `pnpm tokens:check` | ✓ 13/13 |
| `pnpm test` | ✓ 469 passed, 2 skipped |
| `pnpm build` | ✓ all 13 routes static |
| **FULL** `pnpm test:e2e` (fresh prod server) | **820 passed / 0 failed** (916 skipped); matches the 820/0 baseline |
| EVAL-018 | PASS |
| EVAL-019 | PASS |
| EVAL-021 | PASS |
| EVAL-004 | FAIL (informational; local swiftshader Lighthouse, same method as the local-lhci row) |
| EVAL-005 | FAIL (informational on local LCP 4066 ms). The bundle part passes: 159.9 kB gz ≤ 180 |
| `bundle-budget --json` | `ok: true`, 159.9 kB gz. JS is unchanged by this ticket |

The eval run file is `evals/results/eval-run-0.2.0-6366c7b.json`.

### Visual check

After-screenshots were taken at 390 and 1440, DPR 2, reduced motion (scratch `.../tkt92/shots/`).
- Home and teachspark render identically to the TKT-93/95 design: banner, polaroids at 1440, postmark, openers.
- All three faces load (Fraunces / Inter / Caveat, checked via `document.fonts`).
- Image `srcset` and `sizes` were not touched. The same sources are served (390 × DPR 2 → `w=1024`; 1440 × DPR 2 → `w=1920`), so sharpness on 2× screens is unchanged.
- The committed teachspark before-screenshot matches. The committed home before-screenshot predates TKT-93, so it isn't a like-for-like comparison.

## Tradeoffs accepted

- **HTML is heavier:** +17 kB with Brotli on Vercel (+57 kB with gzip), because Next duplicates the inline CSS into the RSC payload. There is also no shared CSS cache on the first visit. Later client-side navigations use `<link>`, so they aren't affected.
- **Fonts start ~0.1–0.2 s later** (found at first layout rather than by preload), and swap in over the fallback. Measured CLS is 0.017–0.029 on `/` (gate 0.05), up from 0.
- **Experimental flag:** `inlineCss` is marked experimental in Next 16.3.5. It's global and has no per-page setting.

## Expected on the preview, and what might still fail

- **Expected:** `/` and `/work/teachspark` at perf ≥ 90 with LCP well under 2.5 s, **if** the preview is measured without the 1 Hz stall.
- **Risk 1: the measuring machine.** Measuring from this Mac with plain `lhci` can reproduce the ~1 s frame stall in some runs. In the E3 Brotli harness with the default clock, teachspark was bimodal: good runs 99–100 / ~1.45 s, stalled runs 78–81 / ~4.1 s. `/` had one stalled run in three. The median can land either side.
  - Recommendation: measure the preview with PageSpeed Insights, or add `--disable-frame-rate-limit` to the Lighthouse Chrome flags. That changes the measurement environment only, not any threshold, so it's the orchestrator's call.
- **Risk 2: CLS.** CLS on `/` rises to ~0.03 from the font swap. That is within the 0.05 gate but has less headroom than before.
- **Risk 3: other routes.** `/work` and `/about` in the four-route `lhci` sweep were not measured by me after the no-more-local-Lighthouse instruction. The mechanism is global, so the same direction is expected.
- **If the preview still fails:** read `observedFirstContentfulPaint` and `pagereveal` in the preview LHR/trace first. A late first frame with an idle main thread means the measuring environment, not the page.
