# TKT-02 · Tracer Visual-Direction Gate — scored 2026-09-16

**Decided by:** orchestrator, on Tushar's behalf (AFK, "take decisions on my behalf"). Screenshots are captured evidence for Tushar's later review. Verdict: **APPROVED — accepted with minor follow-ups.**

Evidence: `docs/screenshots/tracer/{home,case}-{390,768,1024,1440}.png` + `avatar-edge@2x.png` (post-fix, commit c865690+). Baseline: `evals/results/baseline-v1.json` (pre-fix) + `tracer-postfix.json`/`tracer-postfix2.json` (post-fix).

## EVAL-001 — 5-second test (6 items × {390, 1440}); scored ✓ / ~ / ✗
| # | Item | 390 | 1440 | Note |
|---|---|---|---|---|
| 1 | Immediately clear who this is + what they do | ✓ | ✓ | Name + "Senior Product Manager" + eyebrow triad + headline |
| 2 | Primary action obvious | ✓ | ✓ | "View My Work →" violet primary, unambiguous |
| 3 | Reads premium / professional | ✓ | ✓ | Clay tokens, soft shadows, Manrope, cohesive ink+accent palette |
| 4 | Visual hierarchy lands in the right order | ✓ | ✓ | Headline → avatar → tiles → featured card |
| 5 | On-brand (claymorphism) + cohesive | ✓ | ✓ | Clay avatar, clay cards/tiles, consistent radii/shadows |
| 6 | No obvious breakage / awkwardness | ✓ | ~ | 390 clean; 1440 left column below the avatar is sparse — but that gap is the *placeholder* FeaturedWork (real grid = TKT-12/M-003). No overflow, no cramping. |
**EVAL-001 result: 11.5 / 12 → PASS.** The single `~` is placeholder-driven and re-judged at M-003.

## EVAL-009 — hero rubric (6 items × 0–2)
| Item | Score | Note |
|---|---|---|
| Composition / balance | 2 | Strong at 390; good at 1440 (avatar ~400px focal, headline dominant) |
| Typography | 2 | Fluid hero scale, accent word, good tracking/leading |
| Colour / brand | 2 | ink + accent + clay pastels, cohesive |
| Avatar integration | 2 | Clean-edged clay portrait on sky→lavender frame, no halo |
| CTA clarity | 2 | Primary/secondary distinct; resume placeholder honest |
| Motion affordance (static capture) | 1 | Parallax/wash not visible in static shots; verified present + reduced-motion-gated in e2e |
**EVAL-009 result: 11 / 12 → PASS.**

## Avatar likeness (hard gate)
`avatar-edge@2x.png`: clean edges over the gradient, no light halo, no clipped beard; professional clay portrait consistent with the Stage-4-approved asset (D5 `standing-D`). **PASS** (integration/quality judged here; photographic likeness was signed off at Stage 4).

## DRAFT copy rendered (needs Tushar's eventual sign-off — shipped DRAFT-labelled per plan default)
- Hero **eyebrow triad**, **headline**, **support line** — DRAFT (rendered; sourced rows carry status in `data/hero.ts`).
- VERIFIED (no sign-off needed): tagline + all 3 floating-tile one-liners.

## Follow-ups (not gate blockers)
1. **F3 / hero balance:** avatar accepted responsive (column-capped, ~400px @1440). Revisit grid balance at the **M-003 5-second test** with real FeaturedWork content. Width-ladder tests updated to the responsive contract (EXE-6).
2. **F5 / perf (informational):** first-load JS 218.7 kB (budget 180) + LCP mobile 2858 ms (budget 2500). Expected per A14; perf levers land at **TKT-14 / TKT-49**. Not a visual-gate blocker.
3. **DRAFT copy** above → Tushar to confirm or revise when back.

## Gate outcome
EVAL-006/008/010/015 PASS on the tracer; EVAL-001 + EVAL-009 PASS; avatar likeness PASS; F6 nav-loop fixed with a regression scar. **Visual direction APPROVED.** M-002 (and its Lane B visual tickets TKT-04/05/06) unblocked. Decision recorded as EXE-6 in `decisions.md`.
