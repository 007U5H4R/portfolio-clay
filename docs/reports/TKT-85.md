# TKT-85 (`TASK-80`) · Phase B evidence — report

Implementer: Claude Opus 5.5 · branch `m009/tkt-85` (from integration head `86054cc`) · scope per `docs/briefs/FANOUT-D.md` row 85 (390 + 1440; sweep spec + screenshot pack + one rich / one thin case-study pair). Findings only — no product code touched.

## AC checklist (TC-165)

| AC | Status | Evidence |
|---|---|---|
| 1 · 0 overflow, 0 sub-44 controls, axe 0 critical/serious across the sweep | **PASS** at 390 + 1440 | `tests/e2e/sweep.spec.ts` — 18 routes × 2 widths (default state) + 6 rich slugs × 2 widths with "Deep dive" open; `noOverflow`, `minTargets`, `axe` fixtures; console clean (`consoleErrors`). 768/1024 not in this ticket's scope (FANOUT-D row: 390/1440; TKT-90 sweeps 4 widths). |
| 2 · EVAL-018 green on every Phase B route | **PASS** | same spec: `collectDecorations` → 0 violations, 0 parked on every route/state; per-unit counts in the `sweep-eval-018` annotations (`.eval/playwright.json`). `eval-018-parked.json` untouched, still `[]`. |
| 3 · no Critical regression vs baseline (`pnpm eval --baseline …`) | **not run here** | FANOUT-D row 85 scopes this ticket to the sweep + packs; the orchestrator / integration QA runs the full suite and `pnpm eval` on the merged branch. Recorded as a merge note. |
| 4 · EVAL-005 on `/work/teachspark` recorded | **not run here** | same — belongs to the orchestrator's preview Lighthouse pass (EXE-17, TKT-92r2). |
| 5 · Phase-B approval recorded | **pending Tushar** | pairs below are the approval input; `HANDOFF.md` not edited (orchestrator records the approval at merge). |

## Sweep results

Final locked run (gate 3): see "Gate outputs". Route list: `/work`, `/work/{teachspark, railcite, cubicle, nuptis, velora, bhakti-vilas, token-toli, pratyasa, tegaki, dino-arcade-pwa, cinematic-portfolio}`, `/thinking`, `/thinking/{green-tests-prove-it-runs, worse-numbers-before-submitting, refusal-is-a-feature, killing-nuptis, staleness-is-a-correctness-bug}`.
Deep-dive state swept for the 6 slugs that have one (teachspark, railcite, cubicle, nuptis, velora, bhakti-vilas); the 5 thin slugs (token-toli, pratyasa, tegaki, dino-arcade-pwa, cinematic-portfolio) skip it with the reason "thin case study — no deep dive to open".

Screenshot pack: `docs/screenshots/m-009/phase-b/<route>/{390,1440}.png` (36) + `phase-b/work/<slug>/deep-{390,1440}.png` (12).
Pairs: `docs/screenshots/m-009/pairs/case-study-{teachspark,tegaki}-{1440,390}.png` — mockup `case-study.html` | route default (30-sec) | route with Deep dive open (rich only). Columns scaled to ≤ 720 px.

Decision (EXE-20 delegated): thin slug = `tegaki` (FANOUT-D row names it; TC-165 names `token-toli` — both are thin, the newer brief wins). The mockups have no `<meta name="viewport">`, so under the w390 mobile emulation they lay out at 980 px; the pair test renders the mockup in a non-mobile 390 context so the mockup's own `@media` rules apply (mockup files not edited).

## Stage-8 findings (DES- inputs — mockup vs route; not fixed)

1. **Mockups have no viewport meta** (all 8 `docs/redesign-mockups/m-009/*.html`) — on a real phone they render as shrunk desktop. Only matters for anyone reviewing mockups on a device; pairs work around it.
2. **Header composition differs by design** — mockup: title left + taped polaroid right; route: full-bleed `SceneOpener` banner then title (EXE-18 / Dev-24). Consequence: the "Hero media coming" tag moves from the photo to a pill under the meta row, and the "evenings, mostly reading" caption is gone.
3. **Every case study uses the same opener scene** (the reading-chair illustration shows on teachspark and tegaki alike) — the opener doesn't tell the projects apart.
4. **Default view hides the chapters** — the mockup draws the chapters + ChapterNav directly below the 30-sec card; the route mounts them only after "Deep dive" is clicked. That was intended (OverviewToggle), but at 1440 the default page drops straight from the 30-sec card to "What I learned", leaving a ~200 px empty paper band.
5. **ChapterNav active marker looks stale at the top of the page** — in the deep-dive capture (scrolled through, then back to top) the nav underlines "08 What I learned", not "01 Context". Possibly a scroll-spy that doesn't re-evaluate after an instant jump to the top. Needs a repro in Stage 8 — confidence is low.
6. **"Show the thinking" is collapsed** on the route (click to open); the mockup shows the 8-node chain open. Intended per interaction design, but it's a visible density difference.
7. **Hypothesis sticky note body uses Inter** on the route; the mockup uses Caveat. Consistent with the §3.4 Caveat rule — confirm this was intended.
8. **Learnings is missing the kraft sticky** "not on the live site yet — sits in the data file".
9. **Sources**: the mockup has 12 labels including one live link ("TeachSpark live pilot (Railway) ↗") and the hand annotation "twelve labels, one live link"; the route has 10 labels, no live link and no annotation.
10. **Next-project band**: mockup shows the next project's tagline in hand ("a trust-first assistant that would rather refuse than invent a citation"); route shows only "next up".
11. **Band footer**: the route has an extra "DRAFT — PENDING SIGN-OFF" tag (intended); "Bengaluru, India" is absent (flag off per the F7 open items); the h2 second line is kraft on the route vs navy in the mockup.
12. **Thin case study (tegaki)**: 30-sec card + "Deep dive coming" note + next + band. No metric strip, learnings or sources, so the page is mostly the opener and one card. Honest, but sparse against the mockup — Stage 8 should judge whether thin pages need a filler.
13. **Metric strip value typography**: the route sets the qualifier at full display size ("8 (47%)"); the mockup keeps the qualifier small ("8 ₍47%₎", "37.5 min" with a small unit). At 390 the value line reads heavier than the mockup.
14. **/work at 390**: the filter tab row is cut mid-word ("Exp…") with no scroll affordance. There is no page overflow (the row scrolls on its own), but the clipped label reads like a bug.

## Files changed
- `tests/e2e/sweep.spec.ts` (new)
- `docs/screenshots/m-009/phase-b/**` (new, 48 PNG)
- `docs/screenshots/m-009/pairs/case-study-{teachspark,tegaki}-{1440,390}.png` (new)
- `docs/reports/TKT-85.md` (this file)

Shared-file edits: none (`globals.css`, `eval-018-parked.json`, `eval-007/010` untouched).

## Gate outputs
- Gate 1 (locked): `typecheck` ✓ · `lint` ✓ · `tokens:check` 13/13 ✓ · `test` 54 files, 567 passed / 2 skipped ✓ · `build` ✓ (all routes static, 13) · sweep e2e 40/40 ✓ (first version, no deep-dive state).
- Gate 2 (locked, deep-dive state added): typecheck ✓ · lint ✓ · sweep 52 passed / 10 skipped (thin slugs' deep-dive state).
- Gate 3 (locked, mockup rendered at a real 390 width): typecheck ✓ · lint ✓ · sweep **52 passed / 10 skipped** (2.7 min); pairs re-captured (390 mockup now at its real mobile layout)

## Merge notes
- No file owned by another ticket was needed.
- `pnpm eval --baseline baseline-m009-tracer.json --label eval-run-m009-phase-b-<sha>` (AC 3) and EVAL-005 on `/work/teachspark` (AC 4) are left for the orchestrator's merged-branch run. Phase-B approval (AC 5) → `HANDOFF.md` at merge.
- `sweep.spec.ts` screenshots write into `docs/screenshots/m-009/phase-b/**` and `pairs/**` on every run of the full e2e suite. Expect churn there; restore it unless the pack is meant to be refreshed.
- TKT-90 S90.01 will extend this same file (all routes × 4 widths, ≥ 12 px text, img dimensions); the `sweepChecks` helper is ready for that.
