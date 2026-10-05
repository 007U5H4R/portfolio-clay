# TASK-130 · Nuptis: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`nuptis`), CONTENT_INVENTORY §8.4, `docs/trace/nuptis.md`, and `docs/case-study-sources/nuptis/` (eight real screens of the live mock-data app; fictional agencies, couples and vendors).

## 1. Audit (spec §40)

| # | Question | Answer from the records |
|---|---|---|
| 1 | Strongest problem | "15–30+ vendors across 5–7 ceremonies… spreadsheets and WhatsApp threads… a single no-show or scope change turns into a scramble" (NUP-PRD) |
| 2 | Strongest decision | Risk-tier verification: "three weeks vetting a card printer and two days vetting a fireworks vendor is backwards" (NUP-PROCUREMENT); an explicit reasoned cut list (NUP-PM-PLAN) |
| 3 | Strongest evidence | Design rigour: 168 Figma frames, 283 reactions, 62 tokens, AA audit (NUP-DESIGN); a mobile sweep, 9 routes, 1 bug (NUP-LEDGER) |
| 4 | Strongest measured outcome | None: "All three success metrics in §11 are defined but unmeasured" |
| 5 | Most interesting system | A local-first React app where "the reducer is the API surface", with an optional Supabase mirror (4 RPCs, 9 tables) |
| 6 | Most memorable learning | Name intuition as intuition; a North Star can stay unmeasured |
| 7 | Screenshots / videos | Eight real screens (dashboard, onboarding, procurement, stage, contingency, drawer, payments, settings); four used. No video |
| 8 | PRDs / research / evals | PRD, procurement notes, PM plan, DESIGN.md, README, ledger note, self-feedback, launch post. No tests, no pilot |

## 2. Narrative

- **Problem:** one no-show becomes a scramble.
- **Insight:** vet by risk, not habit; the North Star is backup coverage on high-risk orders.
- **Product:** onboard by risk, run the event, swap in a pre-vetted backup.
- **Decisions:** risk tiers; a visible cut list; no AI.
- **Evidence:** design and build signals only, then retired on day seven.
- **Learning:** honesty about intuition, dark North Stars, the craft.

The pivot itself is Velora's page (linked from the next band). Dominant story: **risk-tiered vendor ops, the bet that lost.**

## 3. Metaphor

A wedding planner's run-sheet:
- a marigold garland edge on the hero (hand-authored SVG);
- rosette ribbon numerals;
- decisions on a checklist clipboard.

Accents: terracotta, forest, note (marigold). Distinct from Velora's kraft dossier.

## 4. Sections

1. Hero (stacked): proofs 168 Figma frames ○ and Day 7 retired ◇, with the live dashboard.
2. Problem (anchors 01–02).
3. Insight (anchor 03).
4. Product: three screens.
5. Decisions (anchor 04).
6. System (anchor 05).
7. Evidence (anchors 06–07).
8. Learnings (anchor 08).

## 5. Cut

- the 30-second overview and the chapters;
- the stack versions;
- the Liquid Glass pass;
- the Vercel/OG process lessons;
- the four personas list;
- the fourth learning.
