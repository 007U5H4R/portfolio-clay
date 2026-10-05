# TKT-74 (local part) · Phase-0 tracer QA — report

**Ticket:** TKT-74 (`TASK-69`) · M-009 · **Role:** independent QA-tester (Opus 5.5, standard tier). I did not implement any Phase-0 ticket.
**Branch:** `m-009-redesign` (not pushed). **Date:** 2026-09-25.
**Commits:** `47f2338` home order (S74.01) · `7e00192` parked list + tracer screenshots (S74.02) · `7bb6c2b` baseline (S74.03) · this report.

Every number below comes from command output captured in this session. Logs are in `/Volumes/E Drive/Dev/.scratch/m009/`.

---

## S74.01 — Assembly + screenshots

**The home order was wrong, so I changed it.** `app/page.tsx` still rendered the M-00x order, hero → Ask → Featured → How I think. Design.md §7.1 and technical-plan S74.01 both require **hero → Featured → How I think → Ask → band**. I moved the Ask `Section` after `HowIThink`; nothing else in the page changed. `tests/e2e/home.spec.ts` asserted the old order in two places: the `#main > section` order test and the 390 mobile reading-order test. I updated both to the spec order. No test was removed and no assertion was weakened (commit `47f2338`).

Screenshots come from a plain `pnpm build` and a fresh `pnpm start`, captured with the Playwright CLI (`--full-page --wait-for-timeout=4500`, E-Drive env). I read every PNG.

| File | Notes |
|---|---|
| `home-390.png` (390×4950) | The hero copy comes first: eyebrow, h1 with "AI-native products", rust underline, hand-sub, both CTAs, then the poster and its caption. Below that come Featured (3 cards stacked), How I think (vertical rail, 6 stages), Ask and the band. No overlap and no horizontal overflow. The legacy card and Ask styling in paper colours is expected. |
| `home-768.png` | Same order. Cards are full width and the stage rail is vertical. Nothing broken. |
| `home-1024.png` | Content is fine, but **the header is broken: the "Let's connect" pill covers the last letter of the "Playground" nav link** ("Playgroun▌"). Measured with fonts loaded: the Playground link's right edge is at x=766 (text ends at 768) and the pill's left edge is at 754, a **12 px overlap**. There's no overlap at 1100 (−38 px), 1180 or 1280. See finding **QA-010** below. |
| `home-1440.png` | Two-column hero: copy on the left, the illustrated desk on the right, the caption "the desk where most of it happens". Then Featured (1 large + 2 medium cards), the How I think horizontal journey, the Ask notebook card and the band (the tagline is in the © bar). Nothing broken. |
| `case-390.png` … `case-1440.png` (`/work/teachspark`) | This is the legacy case page in paper colours, which is expected until Phase B: metrics with Measured/Self-reported badges, the "Hero media coming" placeholder card, the 30-sec/Deep-dive toggle, Next → RailCite, then the band. `case-1024.png` shows the same **QA-010** header overlap. Nothing else is broken. |

## S74.02 — Parked list

`tests/e2e/eval-018-parked.json`:
```json
[{ "route": "/about", "unit": "section[aria-labelledby=\"about-hero-heading\"]", "rule": "caveat",
   "reason": "legacy clay section — rebuilt in TKT-86", "ticket": "TKT-86" }]
```
The `unit` string is the exact one the spec reports (from TSK-35 §4). `/` and `/dev/primitives` have no entries.

`pnpm test:e2e --project=w390 --project=w1440 tests/e2e/eval-018.spec.ts` gave **47 passed · 0 failed · 7 skipped**. The skips are the dev-route tests, because `/dev/primitives` returns 404 in a plain build; the `ALLOW_DEV_ROUTES=1` run below covers them. The JSON reporter for `/about` shows annotation `PARKED: /about · section[aria-labelledby="about-hero-heading"] · caveat → TKT-86 (legacy clay section — rebuilt in TKT-86)`, with the test `passed` at both w390 and w1440. The "parked list is well-formed" test passes, and the stale-park guard is proven below (TC-129 step 4).

## S74.03 — Baseline `evals/results/baseline-m009-tracer.json`

`node -e` read-out:
```
{"commit":"7e00192a72fcac04db66ba29154d701e3cc8e4c9","len":40,"branch":"m-009-redesign","dirty":false,"ts":"2026-09-25T04:11:40.572Z"}
EVAL-018=PASS EVAL-019=PASS EVAL-020=PASS EVAL-021=PASS jsKbGzip=158.2 critical=[] pwUnexpected=[]
totals {"cases":22,"passed":16,"failed":2,"skipped":0,"manual":4}
EVAL-018 details: 23 routes × 2 widths · 168 units · max 3/4 per unit · 0 unparked hit(s) · 2 parked · 0 stale park(s)
```
The 2 FAILs are EVAL-004 and EVAL-005, both `informational` locally (swiftshader Lighthouse). EVAL-005 fails on local mobile LCP (4379 ms), not on JS. Neither is a critical failure (`criticalFailures: []`).

**How the `dirty:false` run was produced:**
1. The first `pnpm eval --label baseline-m009-tracer` started from a clean tree (0 porcelain lines) but wrote `dirty: true`. That run's own Playwright layer rewrites 35 tracked PNGs under `docs/screenshots/**`, and `scripts/eval.ts:738` computes `dirty` after that. So a full local run can never report `dirty:false` (tooling observation **QA-011**).
2. I restored the churned PNGs and moved the dirty-flagged file to scratch (`baseline-m009-tracer.dirty-run.json`, kept as evidence).
3. I ran `pnpm eval --label baseline-m009-tracer --reuse`, which assembles the same run from its layer artifacts (`.eval/vitest.json`, `.eval/playwright.json`, `.lighthouseci/*`) on the same commit `7e00192`, now with a clean tree. The totals and statuses are identical to the first write.

`git check-ignore -v evals/results/baseline-m009-tracer.json` exited 1 (not ignored). The file is committed in `7bb6c2b`.

**Bundle:** `pnpm exec tsx scripts/bundle-budget.ts --route / --json` gave `"firstLoadJsGzipKb":158.2,"budgetKb":180,"overBudget":false` (9 chunks). That is **≤ 180 kB, so no TKT-92 perf ticket is needed**, and the budget was not touched (EV6).

**Regression diff vs `baseline-v1.json`** (`pnpm eval --baseline baseline-v1.json --reuse` wrote `eval-run-0.2.0-7e00192.json`, which is gitignored):

| Kind | Item | Classification |
|---|---|---|
| REGRESSION | EVAL-004 `/` mobile perf 96 → 84 (−12), informational | **Real risk, not proven by design.** The local mobile LCP element *is* the hero poster `img` (`fetchpriority="high"`), which is correct. But local LCP is 4739 / 3916 / 4379 ms (median run 4379, perf 73/88/84) under swiftshader throttling. The illustrated hero (poster + clip + 3 self-hosted fonts) is the likely cause. The binding measurement is the preview Lighthouse run (TC-145: LCP ≤ 2500 ms, perf ≥ 90), so this only decides nothing locally. It is **a risk for the hero gate**. |
| improvement | EVAL-004 `/` desktop 96 → 100 | — |
| improvement | EVAL-005 first-load JS 218.7 → 158.2 kB gz (−60.5) | expected: the M-008 motion system was removed (TSK-38) and `motion` left the shared chrome (TKT-71) |
| improvement | EVAL-008 FAIL → PASS | — |

There are no status regressions, and no M-008 feature removal shows up as a regression.

## Phase-0 QA gate

Regression chain on HEAD `7bb6c2b`: `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm tokens:check` `13/13 tokens round-trip OK` · `pnpm test` **49 files passed, 1 skipped · 461 passed, 2 skipped** · `pnpm build` `all routes static (13)`.

**Full `pnpm test:e2e`** (4 projects, :3000 killed first, fresh server started by Playwright): **781 passed · 0 failed · 883 skipped** (exit 0, 8.5 min). The ledger's last baseline was 779 passed / 2 failed (`eval-018 /about` × 2). Both are now PASSED-with-PARKED, so the count is 781 + 0.

Dev-route controls (`ALLOW_DEV_ROUTES=1 pnpm build` + fresh start; `/dev/primitives` returns 200): `pnpm test:e2e --project=w390 --project=w1440 tests/e2e/eval-018.spec.ts tests/e2e/paper-drawin.spec.ts tests/e2e/primitives.spec.ts` gave **60 passed · 0 failed · 4 skipped** (the draw-in tests are w1440-only by design).

| TC | Verdict | Evidence |
|---|---|---|
| TC-122 | PASS | step 1 `13/13 tokens round-trip OK`; step 2 `@theme` names = forest, green-2, ink-soft, ivory, kraft, navy, navy-2, note, paper, paper-2, rust, steel, terracotta (13 `--color-*:`); step 3 `--write` then `git diff --stat app/globals.css` is empty; step 4 `#F7F1E7→#F7F1E8` gives `12/13 …` and exit 1 (restored) |
| TC-123 | PASS | `tests/unit/eval-020.test.ts` green in the unit run and EVAL-020 PASS in the baseline. The fixture 5/5, decoys unmatched and the mutation control were re-verified from TSK-32 / ledger (orchestrator re-ran them) |
| TC-124 | PASS | step 1: 3 distinct `/_next/static/media/*.woff2` in the `/` HTML; steps 2–3: `smoke.spec.ts` "fonts are self-hosted and the h1 is Fraunces with opsz" ✓ (Fraunces axes accepted, Dev-18 unused, TSK-31); step 4: `manrope` appears only in `lib/og.tsx` + `assets/fonts/Manrope-*.ttf` (the OG card until TKT-78) plus the `eval-017.spec.ts` OG-licence test that guards those OG assets; step 5 positive control re-verified from TSK-31 (injection detected) |
| TC-125 | PASS (with accepted deviation) | step 2–3 chain + full e2e green (above); step 4 codemod commit `a08d2ff` deleted 0 test files (the 2 test deletions on the branch, `avatar-edge.spec.ts` and `Parallax.test.tsx`, are TSK-38's planned S73.09 deletions in `f5e4149`); steps 1/5 from TSK-30 / ledger: **368 rewrites, below the planned ≈428 ± 30**, accepted by the orchestrator (tone enum words correctly untouched); bundle 194.1 → 194.1 kB |
| TC-126 | PASS | paper unit suites green in the 461-test run; limit mutations and `keyof` proof re-verified from TSK-33/34 reports (paper 94 pass, 5 mutation failures bite) |
| TC-127 | PASS | dev build: "violating fixture fails all four rules (positive control)" ✓ w390 + w1440; "nearest-ancestor ownership … quote inside a flat zone is allowed (steps 3–4)" ✓ both widths; `/dev/primitives` clean-board EVAL-018 ✓; per-unit table in annotations (step 5, baseline `details`) |
| TC-128 | PASS (step 3 NA until TKT-79) | `paper-drawin.spec.ts` default 400px→0px ✓, reduced motion 0px + `none` ✓ (w1440); step 4 `scale(0` in `.reveal` rules = 0; step 3 (Reveal on home) is TKT-79 scope |
| TC-129 | PASS (step 6 NA until TKT-90) | step 1 `22 cases OK · 18 automated · 4 manual` / `spec coverage OK … deferred: ` (empty); step 2 baseline EVAL-018 `PASS` with real `details`; step 3 with all `@EVAL-018` stripped: `missing @EVAL spec tags for: EVAL-018`, exit 1; step 4 a stale entry `/contact section#nothing` gives ✘ "stale parked entries (matched nothing; remove them)"; step 5 `/about` PARKED + passed (S74.02). Both files restored |
| TC-130 | PASS | full e2e: header height / `data-scrolled` tests ✓ (0 fail); grep `useScrollY\|NavPill\|data-compact` over app components lib tests = 0 (`hooks/` no longer exists) |
| TC-131 | PASS | full e2e: `aria-current` underline, annotation gating and crawler tests ✓ (0 fail); header EVAL-018 unit ≤ 1 in the baseline table. **See QA-010: the nav collides with the pill at 1024**, a visual defect none of TC-131's steps measure |
| TC-132 | PASS | full e2e: MobileMenu sheet keyboard / focus-return / axe tests ✓ (7 matching, 0 fail) |
| TC-133 | PASS | full e2e progress-bar tests ✓; `git diff --stat main..HEAD -- tests/unit/motion.test.tsx` = `15 insertions(+)` (edit, not deletion); NavPill grep 0 |
| TC-134 | PASS | full e2e `layout.spec` "band footer: one <footer> per route, landmark → h2#band-h, torn unit 1, tagline once" ✓; grep `FinalCTA\|layout/Footer` = 0 |
| TC-135 | PASS | unit `band-footer.test.tsx` (count 1, `data-hand="quote"`, sr-only sibling, negative control) green; e2e tagline once per route ✓. The attribution now reads "Source: Tushar Pathak" (Dev-20, `d4526e1`, confirm at the gate) |
| TC-136 | PASS | unit contrast-pairs + band-footer conditionals green; e2e band axe / circle geometry ✓ |
| TC-137 | PASS | `forbidden-strings --bundle`: `0 hits in 213 files (incl. .next bundle)`. Note: `SKIP: forbidden.local.json missing — sandbox join code not scanned` (local-only list, pre-existing) |
| TC-138 | PASS | EVAL-021 PASS (vitest eval-021, one-sided fixtures included) |
| TC-139 | PASS | `curl /`: 0 `<video`; poster `img` `fetchPriority="high" loading="eager" width="1280" height="684"`, alt byte-equal to the manifest `hero-desk` alt; `FloatingTiles` count 0; e2e "static HTML carries the poster … and no <video>" ✓ and the first-viewport tests ✓ |
| TC-140 | PASS | e2e `@EVAL-019` default / reduced-motion / touch (w390) / Save-Data / rejected-play all ✓; EVAL-019 PASS in the baseline |
| TC-141 | PASS (step 4 visual compare = orchestrator) | e2e "default mode mounts the once-and-hold clip: exact attributes, ended ≤ 4 s, 0 restarts" ✓, rejected play() gives the poster ✓; step 6: the only grep matches in `HeroClip.tsx` are doc comments and the file-scoped lint-rule selectors, with no code use |
| TC-142 | PASS | e2e "shipped hero renditions stay inside their caps" ✓; sha byte-exactness re-verified from TSK-36 (orchestrator-checked, run-once by design) |
| TC-143 | PASS | motion-system grep = 0; the 8 deleted paths are all absent; chain green; `firstLoadJsGzipKb` 158.2 |
| TC-144 | PASS | baseline read-outs above: 40-char commit, branch, `dirty:false`, EVAL-018…021 PASS, `criticalFailures` empty; vs baseline-v1 there is no critical/gating regression (the one regression, EVAL-004 `/` mobile, is informational) |
| TC-145 | BLOCKED: needs preview | step 1 PASS locally (158.2 ≤ 180); step 5 PASS (8 tracer PNGs committed); steps 2–4 (preview Lighthouse, LCP element / ≤ 2500 ms / perf ≥ 90, `eval --base-url`) need the push |
| TC-146 | NA (pending human gate) | Tushar's hero gate on the preview (S74.05) |

**Totals:** PASS 23 · FAIL 0 · BLOCKED 1 · NA 1 (of 25: TC-122 … TC-146).

## Findings

- **QA-010 · Header nav collides with the "Let's connect" pill at 1024 px** (TKT-71 · `components/navigation/Header.tsx`; P2, visual). *Repro:* prod build, viewport 1024×768, `/` or any route, wait for fonts. *Expected:* nav links and pill don't overlap (Design.md header). *Actual:* Playground link right edge 766 px (text 768) vs pill left edge 754 px, a 12 px overlap that hides the "d". Fine at 1100 and above. It's invisible to EVAL-008 (no page overflow) and to TC-131 (no geometry check between links). Not fixed (QA role). A regression check could be: at each width ≥ the desktop-nav breakpoint, the last nav link's `right` must be ≤ the CTA's `left`.
- **QA-011 · `pnpm eval` can't report `dirty:false` after a full run** (tooling, `scripts/eval.ts:738`). The run's own Playwright layer churns 35 tracked `docs/screenshots/**` PNGs before provenance is computed. The workaround used here was restore + `--reuse` on the same commit (above). Suggested fix, not applied: compute `dirty` before the layers run, or ignore `docs/screenshots/**` in the check.
- Observation: `eval-cases --check-specs` counts an `@EVAL-0xx` string anywhere in a spec file, including comments. Removing only the test tags (the header comment still says `@EVAL-018`) left the gate green; removing every occurrence failed it as designed.

## For the hero gate

1. **Preview LCP risk:** local mobile LCP is 3.9–4.7 s (swiftshader) against the 2.5 s preview threshold, and `/` mobile perf fell 96 → 84 locally. The LCP element is the poster, which is correct. Measure on the preview before presenting.
2. **QA-010** header overlap at 1024: visible on every route at that width. Decide whether it blocks the gate or goes to a fix ticket.
3. The **home order changed** in this ticket (`47f2338`) to Design §7.1; Tushar will see Ask after How I think.
4. Dev-20 tagline attribution and the D8 five-item nav are still Tushar's calls (ledger).

Churned `docs/screenshots/**` PNGs were restored after every run. :3000 is killed at the end.
