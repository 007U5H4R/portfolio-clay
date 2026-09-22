# TKT-49 — Performance pass (perf/bundle) · TASK-45

**Branch:** `m-007-quality` · **Date:** 2026-09-22 · **Model:** Claude Opus 4.8

## TL;DR

- **Baseline (gate metric):** `/` first-load JS = **244.4 kB gz** (budget 180) — 12 chunks, 773.9 kB raw.
- **After levers (gate metric):** **227.7 kB gz** — 11 chunks, 720.0 kB raw. **Δ −16.7 kB gz.**
- **AC2 (≤180 kB gz): NOT MET** on either metric — flagged below with the specific tradeoff. No threshold was lowered and `bundle-budget.ts` was **not** edited (EV2 honoured).
- **Two decisions are escalated to Tushar** (see §5): (1) a genuine **measurement over-count** in the gate script, and (2) the **cursor-parallax spring** cost that is the only remaining reducible item.

## 1. Chunk analysis — what the 244.4 kB actually contains

`bundle-budget.ts` (method: `technical-plan.md` line ~354) reads the prerendered `.next/server/app/index.html`, collects every `/_next/static/**.js` it references, gzips each and sums. Production chunks are fully minified (no path comments), so I attributed them by distinctive surviving strings (`Minified React error`, scheduler `MessageChannel`, `next` router tokens, motion `stiffness/damping/visualElement`, lucide `stroke-linejoin`, core-js markers).

| chunk (baseline) | gz kB | raw kB | contents | reducible? |
|---|---:|---:|---|---|
| `3wvmqzu9ww-ye` | 69.7 | 223.5 | **React + ReactDOM + scheduler** | No — framework floor |
| `0cdu1j2-yjsq_` | 42.6 | 156.9 | **Next.js App Router client runtime** (81 router hits) | No — framework floor |
| `0cz1d0mv5g_q7` | **38.5** | 110.0 | **core-js + whatwg-fetch/URL polyfills** — see §2 | **Not actually loaded** |
| `41ro_0116fzkt` | 29.2 | 83.8 | `motion` **domAnimation feature bundle** (render/gesture/animation) | Yes → removed |
| `0xpvar-cx3hml` | 17.3 | 56.8 | `motion` **core** (m proxy, MotionValue, useSpring) | Partly — kept for parallax |
| `0izh_is523009` | 15.3 | 42.4 | app: Ask state machine + lucide icons + clay | No — feature/design |
| `15uj-k8s2b4al` | 13.0 | 36.8 | app: Ask/clay | No — feature/design |
| `023hl6bogil-e` | 7.5 | 26.2 | Next runtime bit | No — framework |
| turbopack + 3 small | ~15 | ~50 | Turbopack runtime + flight/router shims | No — framework |

**Framework floor is ~131 kB gz** (React 69.7 + Next App-Router runtime 42.6 + 7.5 + turbopack 4.2 + shims ~7). Irreducible app code (Ask + clay + icons) ≈ 28 kB. That floor alone — **before any motion** — is ~159 kB gz of *real* code, plus the 38.5 kB nomodule chunk the gate also counts.

Verified clean (no accidental heavy imports on home): **zod is NOT in `/` first-load** (stayed split per M-003), **`@vercel/analytics`/`speed-insights` are NOT in the bundle** (added at TKT-50, not yet), **lucide icons are tree-shaken** (named imports only — ArrowUp, ArrowRight, Copy, Check, Menu, X, Mail, Sparkles, Linkedin…).

## 2. Primary finding — the gate over-counts a `<script nomodule>` polyfill (38.5 kB gz)

The 38.5 kB `0cz1d0…` chunk is **core-js + whatwg-fetch/URL** — Turbopack's **legacy polyfill bundle** (core-js is not even a declared dependency or present in `node_modules`; Turbopack injects it). In the prerendered HTML it is referenced as:

```html
<script src="/_next/static/chunks/0cz1d0mv5g_q7.js" noModule="">
```

`nomodule` scripts are **only** executed by browsers that do **not** understand ES modules (IE11-era). Every module-capable browser — i.e. every browser this clay/glassmorphism site targets (`backdrop-filter`, view-transitions) — **ignores `nomodule` scripts entirely and never downloads them.** The main app chunks are `<script async>`, loaded by all browsers.

So `bundle-budget.ts` counts 38.5 kB that no targeted browser ever fetches. Its own header comment claims it measures "the source of truth for what the browser downloads on first load" — which this contradicts. **Real modern-browser first-load:**

| | inclusive (gate) | nomodule | **real (modern)** |
|---|---:|---:|---:|
| Baseline | 244.4 | 38.5 | **205.9** |
| After levers | 227.7 | 38.5 | **189.2** |

**Consequence:** on the gate's raw metric, **180 kB is mathematically unreachable** — floor (~131) + nomodule (38.5) + irreducible app (~28) = **~197.6 kB minimum even with zero motion**. The 180 budget can only be meaningful if the measurement excludes the nomodule polyfill. This is escalated (not self-applied) — see §5, decision A.

## 3. Levers applied (all design-preserving)

All three remove `motion`'s `domAnimation` feature bundle from the home critical path. They are one logical group — the feature chunk only leaves once the **last** `m.*` consumer on home is gone — so the −16.7 kB is attributed to the group, measured before/after.

**L1 — NavPill `m.span(layoutId)` → plain `<span>`** (`components/navigation/NavPill.tsx`).
`domAnimation` = `features-animation` = **animations + gestures only; NO layout feature** (that lives in `domMax`, verified in `framer-motion/dist/es/render/dom/features-*.mjs`). NavPill's only motion prop was `layoutId`/`layout="position"` — so **the pill slide never actually ran**; it just re-rendered at the active link. A plain `<span>` is byte-for-byte the same visible result. Confirmed by `tracer.spec.ts` ("active nav link … shows the NavPill" ✓).

**L2 — AskPortfolio `m.div` reveal → CSS `ask-reveal` keyframe** (`components/ai/AskPortfolio.tsx`, `app/globals.css`).
The answer body's spring fade-up (opacity + y) was a one-shot mount entrance — no JS spring needed. Replaced with an `@keyframes ask-reveal` (opacity 0→1, translateY 8px→0, `--ease-panel`), replayed on each state change via React `key={status}` exactly as the keyed `m.div` did. The card `min-height` transition is unchanged. Reduced motion handled by the existing global rule. Confirmed by `ask-inline.spec.ts` @w1440 (7/7, incl **EVAL-010** "answer appears, content not transform-animated" ✓).

**L3 — Parallax `m.div style={{x,y}}` → manual `MotionValue` binding** (`components/interactions/Parallax.tsx`).
`useSpring`/`useMotionValue` are standalone hooks (driven by motion's own frameloop) that need **no** `LazyMotion`/`domAnimation` feature bundle. The spring output is now written to a plain `<div>`'s `transform` via a ref + `springX/springY.on("change", …)` subscription — identical `translate3d` output, identical spring config (`springs.parallax`), identical `will-change:transform`. The inactive (touch / reduced-motion / SSR) branch is unchanged, so the **avatar LCP path renders identically server-side**. Unit tests (`Parallax.test.tsx`) + tracer hero/tiles specs ✓.

**Net:** motion on home went from 46.5 kB gz (features 29.2 + core 17.3, 2 chunks) → **29.8 kB gz (core only, 1 chunk)**. The `domAnimation` feature bundle is gone from `/` first-load. `useSpring`'s spring-animation core (29.8 kB) remains because the approved cursor-parallax uses it.

**Non-lever (reverted):** adding a modern `browserslist` to `package.json` — **zero effect** (byte-identical build); Turbopack does not use it for the nomodule polyfill target. Reverted.

## 4. CLS / LCP handling

Verified **in code + build** (Lighthouse-score verification deferred to preview — see §6):
- **LCP** — the hero avatar (`components/hero/AvatarStage.tsx`) is `next/image` with explicit `width={1800} height={2250}`, `priority`, `fetchPriority="high"`, `placeholder="blur"` + build-time blurDataURL, and correct `sizes`. It renders in the same SSR DOM regardless of the Parallax active/inactive branch, so **L3 does not touch the LCP path**.
- **CLS** — `ClayFrame ratio="4/5"` reserves the avatar's aspect box; corner tiles are fixed-size `ClayIcon`s. All three levers move only `transform`/`opacity` (no layout properties) and the Parallax transform starts at identity, so **no layout shift is introduced**. `noOverflow` tracer checks pass at w1024/w1440.

## 5. Accepted-risk flags for Tushar (decisions, not self-applied)

**Decision A — correct the gate's nomodule over-count (recommended, necessary).**
`bundle-budget.ts` counts the `<script nomodule>` polyfill (38.5 kB gz) that no targeted browser downloads, making the 180 budget unreachable by construction. Recommended one-line correctness fix (keeps 180 intact): exclude any `.js` referenced only inside a `<script … nomodule …>` tag, and surface `nomoduleGzipKb` separately for audit. I did **not** apply this myself because it touches the EV2-protected gate script and, on its own, still does not pass (189.2 > 180). It needs your ratification.

**Decision B — the cursor-parallax spring (the only remaining reducible item).**
After the levers, real first-load is **189.2 kB gz**, 9.2 over 180. The residual 29.8 kB is `motion`'s spring core powering the **approved Apple-inspired cursor-tilt** (`Design.md` §4). Two paths:
- **B1 (hit budget):** replace `useSpring` in `Parallax` with a hand-rolled rAF exponential smoother → removes `motion` from home entirely → **real ≈ 159 kB gz** (well under 180). Tradeoff: reimplements the approved spring (fidelity risk — negligible in practice at ±6 px, ζ≈0.91, but it *is* touching the approved interaction). Per the brief's "STOP, don't force it" rule I did not do this unilaterally.
- **B2 (accept):** keep the proven `motion` spring; accept **189.2 real / 227.7 raw** as an honest result. Per the brief: "a 200 kB honest result with a clear tradeoff beats a 180 kB result that guts the design."

**Recommendation:** A + B2 — correct the measurement (so the budget is meaningful) and accept 189.2 real with the spring, unless you want the parallax reimplemented (B1). Either way the framework floor makes ≤180 on the *raw* metric impossible.

## 6. Lighthouse-score deferral

Per the brief and M-002/M-003/M-006 scars, LHCI **scores** are unreliable on this host (swiftshader / no-GPU makes mobile perf non-deterministic). **AC1 Lighthouse scores [90,95,95,95] and the LCP/CLS numeric assertions are deferred to the Vercel preview / CI at TKT-50.** Code-level LCP/CLS levers are done and verified in code (§4).

## 7. Gate status

| gate | status |
|---|---|
| `pnpm typecheck` | **pass** (0) |
| `pnpm lint` | **pass** (0) |
| `pnpm build` | **pass** — all routes static (13) |
| `pnpm test` (unit) | **pass** — 226 pass / 1 skip |
| e2e (ask-inline @w1440, tracer/NavPill/hero @w1024, workers:1) | **pass** — 16 executed, incl EVAL-010 |
| `bundle-budget.ts` (AC2) | **FAIL 227.7 > 180** — intentional: this failure *is* the AC2 flag signal (§5) |

## 8. Files changed

- `components/navigation/NavPill.tsx` — L1 (m.span → plain span)
- `components/ai/AskPortfolio.tsx` — L2 (m.div reveal → CSS class; dropped motion imports)
- `app/globals.css` — L2 (`@keyframes ask-reveal` + `.ask-reveal`)
- `components/interactions/Parallax.tsx` — L3 (manual MotionValue binding)
- `docs/reports/TKT-49.md` — this report
- `evals/results/tkt-49-perf.json` — before/after record (git-ignored per `.gitignore`)

`lib/motion.ts`, `next.config.ts`, `scripts/bundle-budget.ts`, `evaluation-plan.md` — **unchanged** (no threshold touched; no gate edited).
