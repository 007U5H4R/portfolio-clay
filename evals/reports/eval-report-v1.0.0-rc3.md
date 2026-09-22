# Evaluation Report — v1.0.0-rc3

**Generated from real execution output** — `evals/results/eval-run-v1.0.0-rc3.json` (`runId eval-run-0.2.0-36bf783`, `pnpm eval --label eval-run-v1.0.0-rc3`, 13 min). Nothing below is hand-entered.

**Provenance:** commit `36bf783` · branch `m-007-quality` · Node 26.7.0 · pnpm 11.25.0 · Next 16.3.5 · darwin 27.0.0 · 2026-09-22T16:15:52Z · base URL `http://127.0.0.1:3000` (local production build) · eval-cases sha256 `94d6055f…5336` · viewports 390/768/1024/1440 · Lighthouse median of 3 · thresholds **unchanged from Stage 3** (Lighthouse [90,95,95,95] · LCP ≤ 2500 ms · CLS < 0.05 · first-load JS ≤ 180 kB gz · axe 0 critical/serious) · `dirty: true` = the run's own screenshot/report byproducts (same as every prior gate).
**Baseline:** `evals/results/baseline-v1.json` (M-001 tracer). **Companion live-preview record:** `eval-run-preview-0e1a052.json` (12 pass / 0 fail / 2 skip-by-design / 3 manual; all 6 TP9 headers served).

## Summary table

| Evaluation area | ID | Priority | Baseline (v1 tracer) | Current (rc3) | Target | Status |
|---|---|---|---|---|---|---|
| 5-second test (hero) | EVAL-001 | critical | MANUAL | MANUAL | human review | MANUAL — Tushar's spot-check pending (DES-003 hero-fold note) |
| Recruiter path ≤ 6 clicks | EVAL-002 | critical | SKIP (not built) | **PASS** — 20 specs / 9 runs | all hops 200 | PASS |
| Content truth audit | EVAL-003 | high | MANUAL | MANUAL | human review | MANUAL (8/8 TKT-39 table verified at M-005) |
| Lighthouse (4 routes × mobile+desktop) | EVAL-004 | critical | PASS (informational) | **PASS** (informational) — desktop `/` perf 96→**100** | ≥ 90/95/95/95 | PASS · informational: local swiftshader/no-GPU host, real gate = production |
| Bundle / LCP / CLS | EVAL-005 | high | FAIL — 218.7 kB gz | **FAIL** — **191.1 kB gz** (−27.6) · LCP(mobile) 3316 ms · CLS 0 | JS ≤ 180 kB · LCP ≤ 2500 · CLS < 0.05 | **FAIL (informational, accepted risk EXE-11)** — over budget by 11.1 kB; LCP is the swiftshader figure |
| axe WCAG 2.1 AA + heading-order | EVAL-006 | critical | PASS — 12 specs | **PASS** — 276 specs / 115 runs | 0 critical/serious | PASS |
| Keyboard paths + focus ring | EVAL-007 | critical | SKIP | **PASS** — 80 specs / 22 runs | 100 % completable | PASS |
| Responsive: overflow · 44 px · 14 px floor (+ **Deep-dive** since rc3) | EVAL-008 | high | FAIL — 8 failing | **PASS** — **344 specs / 333 runs** | 0 overflow / 0 sub-44 / 0 sub-14 | PASS — FAIL→PASS vs baseline; QA-007 closed |
| Premium rubric | EVAL-009 | high | MANUAL | MANUAL | human review | MANUAL (Stage-8 `impeccable` critique done: DES-findings.md) |
| Reduced-motion | EVAL-010 | high | PASS — 4 specs | **PASS** — 212 specs / 51 runs | no disallowed motion | PASS |
| Dead controls / crawler | EVAL-011 | critical | SKIP | **PASS** — 84 specs / 21 runs | 0 dead | PASS |
| Deterministic Ask | EVAL-012 | critical | SKIP | **PASS** — vitest (incl. DC5 pin) | 11/11, 0 fabrication | PASS |
| Content gate (forbidden/PII) | EVAL-013 | critical | SKIP | **PASS** — validate-content OK · 0 hits / 194 files incl. `.next` · fixture proof | 0 hits | PASS |
| Screen states | EVAL-014 | medium | SKIP | **PASS** — 28 specs | all four states | PASS |
| Graceful degradation | EVAL-015 | medium | PASS — 8 specs | **PASS** — 44 specs / 19 runs | JS-off / missing asset | PASS |
| Security hygiene | EVAL-016 | high | SKIP | **PASS** — 0 forbidden strings · 0 high/critical deps (audit-level high, EXE-2 allowlist) · headers verified on the live preview (6/6) | clean | PASS |
| OG / link preview | EVAL-017 | high | MANUAL | **PASS** — unit + 40 specs / 10 runs; **live inspector: opengraph.xyz 0 errors / 10 passes on `76da616`** | tags + 1200×630 render | PASS (LinkedIn Post Inspector → Tushar) |

**Totals:** 17 cases · **13 PASS · 1 FAIL (informational) · 0 SKIP · 3 MANUAL** · **criticalFailures: []** · **playwrightUnexpected: []** (every Playwright test, tagged or not — DC6) · **regressions vs baseline: none** · improvements: EVAL-004 desktop `/` 96→100 · EVAL-005 −27.6 kB · EVAL-008 FAIL→PASS.

## Overall: **PASS** (with accepted risks)

**Release recommendation (for `QA-report.md`): READY WITH ACCEPTED RISKS — for the preview; production remains gated by content, not by quality.**

- **Critical blockers:** none. No critical evaluation fails; no unresolved regression.
- **Failed evaluation IDs:** EVAL-005 only — informational by design; first-load JS 191.1 kB gz vs the 180 kB budget (+11.1 kB), the residual being the *approved* cursor-spring (`motion` core). Accepted risk **EXE-11** (provisional B2; the real product question — Lighthouse *score* — is 100 on desktop here and must be read on real Vercel infrastructure, where `--base-url` runs skip Lighthouse by design). The budget itself was **not** weakened (EV2).
- **Regression summary:** none vs baseline. The Stage-9 harness (DC6) now also fails the run on any untagged Playwright failure — rc3 is the first full-suite run through it and is clean (rc2, on the pre-fix HEAD, had 5 hidden failures = QA-007, fixed in `285adbd`).
- **Baseline comparison:** every gate that was SKIP/FAIL on the tracer is now PASS except the informational bundle budget; the two gates that regressed intermittently on prior runs (EVAL-004 mobile scores under swiftshader) show no regression this run.

## Known limitations (honest)

1. **Lighthouse figures are local** (swiftshader, no GPU): informational only; mobile LCP 3316 ms is an artefact of that host. Production/preview Lighthouse must be run against Vercel (a dedicated `lhci autorun --collect.url=<preview>`; the harness's `--base-url` mode skips Lighthouse).
2. **Three MANUAL cases** (EVAL-001/003/009) are human reviews by design — Stage 8's critique covers EVAL-009; EVAL-001's hero-fold spot-check (DES-003) and the VoiceOver pass (TC-109) are Tushar's.
3. **Production-only gates were not exercised** because no production deployment may exist yet: PB4 (featured demo videos) and PB5 (sanitised résumé) fail closed at `prebuild` under `VERCEL_ENV=production` — proven by the first (accidental) production deploy, which errored exactly there.
4. `EVAL-016` headers were verified on the **preview** origin; the production origin/custom domain (HSTS `preload` implications) is a Stage-11 check.
