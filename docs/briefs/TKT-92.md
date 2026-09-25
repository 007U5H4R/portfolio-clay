# Brief — TKT-92 · Perf: mobile LCP ≤ 2.5 s and Lighthouse perf ≥ 90 (EXE-17, EV6)

**Ticket:** TKT-92 (Backlog `TASK-88`) · M-009 · Bug · P0 · sp:3 · **Depends on:** TKT-93, TKT-94, TKT-95 (all done).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, **never push** — the orchestrator pushes after Tushar's OK and re-measures on the preview).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
The Phase-0 preview failed the performance gate (TC-145): Lighthouse mobile on `/` perf 85–86, LCP 3.8–4.0 s (LCP element = the hero image — correct element, too slow); `/work/teachspark` perf 87–89, LCP 3.2–3.5 s on a text `<p>` (font/render path suspected). Since then the hero became a 3168×1344 banner (TKT-93) and every page got a priority scene opener (TKT-95), so the numbers have moved. Get **LCP ≤ 2500 ms and perf ≥ 90 on mobile** for `/` and `/work/teachspark`, by approach — **thresholds and budgets are never edited** (EV2/EV6; first-load JS stays ≤ 180 kB, now 159.9).

## Read first
1. `decisions.md` **EXE-17**, **EV6**, **TP9** (CSP), **S13** (fonts), **TP13** (hero clip — don't change its behaviour); `Design.md` §2.2 (fonts), §5, §11 Dev-21/24.
2. Preview evidence: `evals/results/lighthouse-m009-tracer/mobile/lhr-*.json` (before; read `largest-contentful-paint`, `largest-contentful-paint-element`, the LCP breakdown / `lcp-*` insights, `render-blocking-*`, `font-display`, `uses-responsive-images`, `total-byte-weight`, network requests).
3. `lighthouserc.mobile.json`, `.env.tooling` (LHCI_DIR), `components/paper/SceneBanner.tsx`, `components/hero/{Hero,HeroClip}.tsx`, `app/layout.tsx` (fonts), `next.config.ts` (images config), `app/globals.css`.

## Method (measure → hypothesise → fix → re-measure; one change at a time)
1. **Baseline locally** on a prod build (`pnpm build` then a fresh `pnpm start`): `dotenv -e .env.tooling -- pnpm exec lhci collect --config lighthouserc.mobile.json --url=http://127.0.0.1:3000/ --url=http://127.0.0.1:3000/work/teachspark` (3 runs each), and read the LCP **breakdown** (TTFB · resource load delay · resource load duration · element render delay) for both pages. Local Lighthouse runs under swiftshader and is **informational** — use it for relative before/after, not as the gate.
2. Diagnose by phase. Likely candidates, verify before acting:
   - Hero/opener image: `sizes` that request far more pixels than the displayed box on a 412 px mobile viewport; sources too large for mobile (`deviceSizes`/`imageSizes` in `next.config.ts`); AVIF encode quality; missing preload / wrong `fetchPriority`; several `priority` images competing on one route (e.g. hero banner + polaroids + poster all eager).
   - Fonts: the Fraunces variable file with `opsz`/`SOFT` axes (size?), three families preloaded, weight/subset count; text LCP delayed by the font swap (`/work/teachspark`). Options: preload only what the first paint needs, `adjustFontFallback`, fewer weights, `display: "optional"` for non-critical faces — **without** changing the approved typefaces (S13).
   - Render-blocking CSS size; hydration/JS main-thread work (TBT) from client components mounted above the fold.
3. Fix one hypothesis at a time and re-measure; keep what moves the metric, revert what doesn't. Record each experiment (change · LCP before/after · kept?).

## Gates
Local mobile LCP and perf trend clearly toward the gate on both pages (report the median of 3, before/after). `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; **FULL** `pnpm test:e2e` on a freshly restarted prod server (baseline 820 passed / 0 failed); `pnpm eval --only EVAL-004,EVAL-005,EVAL-018,EVAL-019,EVAL-021 --skip-build`; bundle `/` ≤ 180 kB. No visual regression: Read before/after screenshots of `/` and `/work/teachspark` at 390 and 1440 (image sharpness must stay acceptable on 2× screens — say what you checked).

## Constraints
Everything on `/Volumes/E Drive` (`.lighthouseci` via LHCI_DIR). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`; restore churned `docs/screenshots/**` you didn't produce (≈ 35 PNGs are churned in the tree right now — `git checkout -- docs/screenshots/about docs/screenshots/contact docs/screenshots/not-found docs/screenshots/playground docs/screenshots/thinking docs/screenshots/tracer` first). Restart `pnpm start` after every build. Never lower a threshold, skip a test, or remove the clip/fonts to win the metric. Commit(s) + trailer, e.g. `perf(images): right-size hero + opener sources for mobile LCP (TKT-92)`.

## Output — `docs/reports/TKT-92.md` (commit it) + local LHR JSONs under `evals/results/lighthouse-m009-tracer/local-tkt92/{before,after}/`
LCP breakdown before/after per page; experiment table; what you changed and why; gate outputs; what you expect on the preview and what might still fail there. Final chat reply ≤ 10 lines.
