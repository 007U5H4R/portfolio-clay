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

---

## Round 2 (branch `m009/tkt-92r2`, from `86054cc`) · Opus 5.5 · TASK-88

Commits: `c3f415e` (hero height cap, 5-second test), `ecad101` (mobile banner rendition). No threshold, budget, `next.config.ts`, font or `lighthouserc` change.

### What the preview LCP breakdown showed

The source was the committed preview LHRs (`preview-tkt92/mobile/`) plus 5 fresh `/` and 3 teachspark runs I took on the same preview with traces (scratch `92r2/lh/`).

- **The image is not the bottleneck.** The LCP `<img>` is `hero-banner … w=768` AVIF, **20.6 kB**, and a CDN `HIT`. It is preloaded at byte 309 of the HTML, exactly like teachspark's opener.
- **What decides the simulated LCP is *when* the observed paint lands.**
  - Lantern charges every request that finished before the observed LCP to both of its graphs.
  - Teachspark paints at 462–549 ms, before the fonts (~580 ms, 240 kB) and the JS (~680 ms, 170 kB) finish, so they are left out. Result: LCP 1548–2131.
  - `/` paints at 593–813 ms, after they finish, so they are charged. Result: LCP 2369–3311, median 2712.
- **Why `/` paints late: a render-delay collision.** The observed render delay on `/` is 52–185 ms (teachspark: 7–43 ms).
  - The traces show the banner decoding at 499–752 ms. The paint then waits behind the hydration script evaluation (`EvaluateScript` 53–118 ms) and a relayout.
  - On `/`, the image lands about 50–150 ms later than teachspark's and falls into that window. Server wait for the two images is identical (84–107 ms each over one H2 connection). The difference is run-to-run network timing, not the asset.
- **What-if re-simulations of the gathered traces** (image or document bytes scaled, same trace):

  | Change simulated | Effect on LCP |
  |---|---|
  | Image bytes ×0.55, ×0.3 or ×0.1 | −150 ms at most (the floor is reached at ×0.55) |
  | Fonts ×0.5 | −0 to −220 ms |
  | HTML ×0.6 | −150 ms |

  No single asset lever in my files clears the 212 ms gap.
- **Experiment `decoding="sync"` on the LCP img: rejected.** In the delay-proxy harness (the image delayed 350 ms so it collides with hydration, as on the preview) the median LCP was 4709 vs 4271 with `async`.

### What changed

1. **5-second test (orchestrator requirement, from TKT-79's EVAL-001 at 1440).**
   - At ≥ 1024 the banner box is `clamp(240px, min(42vw, 100svh − 480px − 6vw), 620px)` and the copy's top padding is `clamp(28px, 2.5vw, 40px)`. This is in a new `/* TKT-92r2 */` block appended to `globals.css`.
   - `focalY` 0.36 keeps the face in the wider crop.
   - It is still one box cropping one canvas. The clip registration e2e is green at 1024, 1440 and 1920.
   - 768–1023 and < 768 are unchanged.
2. **Mobile art direction.**
   - `SceneBanner` gained an optional `narrow` prop that renders `<picture><source media="(max-width: 767px)">` via `getImageProps`, with media-split `ReactDOM.preload`s.
   - On `/` it serves `public/media/illustrations/hero-banner-mobile.webp`: a 1824×1344 crop of the same master (provenance row in the illustrations README), placed on the canvas at its own x, so the canvas grid is unchanged.
   - Moto G (412 @ 1.75): one request, `hero-banner-mobile … w=390`, **11.2 kB** (was 20.6 kB), at the same effective density.
   - 390 @ 3 takes the crop at `w=768`. 768 and 1440 take the unchanged full scene (verified: one banner request per viewport).
   - Other routes' openers don't pass `narrow` and are unchanged.

### 5-second test (EVAL-001 first-viewport geometry, `next start`)

| Viewport | Before: h1 / hand / CTA bottom | After: h1 / hand / CTA bottom | Result |
|---|---|---|---|
| 1440×900 | 836–983 / 994–1041 / **1210** | 507–654 / 665–712 / **881** | 3/6 → **6/6** |
| 1024×768 | 634–739 / 751–788 / **958** | 406–510 / 522–559 / **729** | fail → **pass** |
| 390×844 | CTAs end 800 | unchanged, 800 | 6/6 → 6/6 |

`tests/e2e/hero-fold.spec.ts` copies TKT-79's assertion (from `m009/tkt-79` `home.spec.ts`), adds w1024 and the hand line, and checks the banner *box* (the canvas overflows it by design). It passes at w390, w1024 and w1440. The orchestrator can dedupe it against TKT-79's copy at merge.

### Gates (one locked run)

- typecheck ✓, lint ✓, tokens 13/13 ✓, `pnpm test` ✓, build ✓.
- Bundle `/`: **158.6 kB gz** ≤ 180, `ok: true`.
- e2e: `hero-fold`, `eval-019`, `home`, `tracer`, `scene-opener`, `eval-018`, `eval-007`, `eval-010` on all four projects: **191 passed, 0 failed** (285 skipped by design).
- Churned tracer screenshots were restored.

### Expected preview effect (honest)

- **Desktop / 5-second test:** fixed. Verified locally.
- **Mobile LCP:** a small gain, not a guaranteed pass.
  - The rendition removes about 9 kB from the LCP request. That is worth roughly −150 ms of simulated LCP on runs where the image lands in the hydration window.
  - The local delay-proxy harness could not resolve a difference: median 4562 vs 4271 before. Its run-to-run spread (±600 ms) is larger than the effect, and its absolute values run high because the proxy adds 350 ms.
  - The remaining cause is timing: whether the observed paint beats the fonts and JS. That is decided by fonts (`app/layout.tsx`) and the hydration JS, both outside my ownership.
- **If the preview median stays above 2500, the levers with the largest simulated effect are outside my files:**
  - Subset or trim the Fraunces axes (−220 ms simulated at ×0.5, rejected in round 1 under S13).
  - Defer the non-critical client chunks so the hydration evaluation doesn't sit on the LCP frame.

### Notes for merge / Stage 8

- The shorter banner at ≥ 1024 leaves the TKT-93 polaroids (sized for a ~605 px banner) overhanging more: the third crosses well below the torn edge at 1440. It's the TKT-93 CSS block, so I didn't touch it. **Stage-8 input.**
- In the 1440 screenshot taken at `load`, the polaroid images were still blank (lazy `next/image`, `sizes="224px"`). That behaviour predates this branch.
- `hero-fold.spec.ts` duplicates TKT-79's EVAL-001 test. Keep one.

## Round 3 — hero font-swap CLS (TASK-88)

Desktop `/` CLS was **0.0543**, over the 0.05 gate. Lighthouse blamed `h1#hero-h` ("Web font loaded"). Round 2's banner cap didn't cause the shift. It moved the h1 into the first viewport, where the shift now counts.

### What moved (measured)

I used Playwright at six widths, once with the woff2 files blocked (the fallback frame) and once with them loaded:

- **h1:** 3 lines × 740 px under `Fraunces Fallback`, 2 lines × 771 px under Fraunces, at 1350×940. On swap it lost a line (206 → 138 px tall), and its centred box moved 16 px sideways.
- **Eyebrow:** 500 → 554 px wide (a 27 px sideways move) on desktop. At 412 px it wrapped to 3 lines vs 2, which pushed the h1 down 22 px on mobile.

The copy block has no fixed heights, so nothing else above the h1 moves.

### Root cause

There are two font-dependent causes, each present on both elements:

1. **The fallback doesn't match the real font's width.** next/font's fallbacks are fitted to each font's default instance. At the hero's `opsz 144`, Fraunces is about 17 % narrower, so the fallback headline ran 1690 px vs 1386 px. The uppercase, tracked Inter eyebrow runs about 8 % narrower than its Arial fallback.
2. **The `ch` max-widths depend on the font.** `19ch` and `60ch` resolve against the current font's "0", so the wrap box itself changed width on swap.

### Fix (`app/globals.css`, block `TKT-92r3`, hero only)

- **Hero h1:** new `@font-face "Fraunces Hero Fallback"` (Times New Roman / Liberation Serif) with `size-adjust: 95.34%`. That's 115.45 % × 1442/1746 glyph advances, with letter-spacing excluded. The ascent/descent overrides are scaled to keep the vertical metrics. `max-width: 19ch` becomes `11.43em` (19 × Fraunces' 0.6015em "0"), so it's still 771 px under Fraunces.
- **Hero eyebrow:** new `@font-face "Inter Eyebrow Fallback"` (Arial / Liberation Sans) with `size-adjust: 98.72%` (107.12 % × 570.1/618.6). `max-width: 60ch` becomes `39.58em`, still 554 px under Inter.
- **What didn't change:** no `display: optional`, no change to the banner cap, the copy, the lhci assertions or `app/layout.tsx`.
- **Why the literal family name:** the stacks name `"Fraunces"` / `"Inter"` directly (next/font's family names), because the next/font variable already has its own fallback in it.

The loaded layout is pixel-identical to before (same boxes at every width). Under the fallback, the eyebrow and h1 boxes now match the loaded ones to 0.2 px at 1350, 1440, 1024, 768, 412 and 375. The Caveat hand line still differs by about 5 px in width (0.4 px in height); Lighthouse scores it 0.0002–0.0003 on mobile.

### Lighthouse, `/` only, 3 runs each (local `lhci`, same machine and configs)

| | before (`809e326`) | after |
|---|---|---|
| desktop CLS | 0.0477 · 0.0543 · 0.0477 (h1 0.0456–0.0539) | **0.0019 · 0.0019 · 0.0019** (header nav only) |
| desktop perf / LCP | 0.98–0.99 / 822–1062 ms | 0.99 / 821–917 ms |
| mobile CLS | 0.0284 · 0.0284 · 0.0317 (CTA row / h1) | **0.0003 · 0.0003 · 0.0003** |
| mobile perf / LCP | 0.72–0.77 / 3980–4318 ms | 0.63–0.78 / 3814–4932 ms |

- **Desktop:** the assertion passes (exit 0).
- **Mobile:** the assertion still fails, on perf/LCP only. It failed the same way on `809e326`. CLS isn't the cause, and nothing in this round changes JS or requests.

### Scar

A new `tests/e2e/hero-fold.spec.ts` test checks the font swap. It renders `/` with the woff2 files blocked and again with them loaded, then asserts that the eyebrow and h1 boxes match within 1 px. It also asserts that `document.fonts.check(… Fraunces)` is true, which guards the literal family name. It **fails on all 4 projects at `809e326`** and passes after the fix.

### Gates

- typecheck ✓, lint ✓, tokens 13/13 ✓, build ✓.
- `pnpm test`: 579 passed. `band-footer.test.tsx` hit a 5 s cold-import timeout once, then passed alone and in a full rerun.
- Bundle `/`: **158.5 kB gz** ≤ 180, `ok: true`.
- e2e: `hero-fold`, `home`, `eval-019`, `eval-008`, `eval-010`, `eval-020` on all 4 projects: **418 passed, 1 failed** (337 skipped by design).
  - The failure is `@EVAL-019 … stays registered … 1024, 1440 and 1920` [w1440]. It's a `page.goto` load timeout at the 30 s test limit, not an assertion. It **fails the same way on the untouched `809e326` build**, so it predates this round (round 2 recorded it passing, so an integration merge probably broke it). **Orchestrator follow-up.**
- The churned `docs/screenshots/**` were restored.
