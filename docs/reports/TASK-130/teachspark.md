# TASK-130 · TeachSpark: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`teachspark`), CONTENT_INVENTORY §8.1, `docs/trace/teachspark.md`, and `docs/case-study-sources/teachspark/` (18 images).

## 1. Audit (spec §40)

| # | Question | Answer from the records |
|---|---|---|
| 1 | Strongest problem | Time-poor K–12 teachers want AI to save time, but resources are "generic, fragmented, and disconnected from their classroom context" (TS-DISCOVERY-PRD) |
| 2 | Strongest decision | "Capability, not dependency", with WhatsApp as distribution (TS-SOLUTION-PRD); the mentor's "a teacher buys a worksheet…" re-led the landing (Wave 1, 2026-08-29, TS-MENTOR) |
| 3 | Strongest evidence | The first-week pilot funnel, Final-PRD snapshot 2026-08-24, test handsets excluded (CS4-FINAL-PRD) |
| 4 | Strongest measured outcome | 17 joined → 12 onboarded (71 %) → 8 activated (47 %); median 37.5 min saved (self-reported) |
| 5 | Most interesting system | WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX → back to WhatsApp (TS-RUNBOOK); structured outputs, vision and a QC pass on the paper path (TS-ANTHROPIC-PAPER) |
| 6 | Most memorable learning | "A teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow." |
| 7 | Screenshots / videos | **Real:** `demo-poster.jpg` is the live landing on a phone. **Illustrative:** the Final-PRD slides (`p2-*.jpg`) are illustrative diagrams; `p2-whatsapp-loop.jpg` holds a drawn chat of the 2-minute loop. `mixpanel-funnel.jpg` is a real analytics capture (a different dataset: 24 Aug only). No YouTube video; the 42.85 MB `TeachSpark.mp4` isn't web-ready |
| 8 | PRDs / research / evals | Discovery, Solution-Space and Final PRDs, pitch deck, runbook, QA phase-6 gate, 9-day build series, mentor feedback, Mixpanel. **None:** teacher interviews (8–12 planned) and LLM output-quality evals |

## 2. Narrative

- **Problem:** generic AI doesn't transfer into a teacher's actual week. It started with one teacher, Tushar's mother, who teaches Sanskrit.
- **Product:** one roughly two-minute WhatsApp chat from grade, subject and board to a ready worksheet (PDF), plus the reusable prompt.
- **Decision:** capability, not dependency; WhatsApp, not a new app; lead with the worksheet.
- **Evidence:** the pilot funnel on one snapshot date, under its own targets, stated as such.
- **Learning:** sell the worksheet; green tests are not correctness; smaller honest numbers.

Dominant story (spec §41): **getting useful AI into real classroom work.**

## 3. Metaphor

A teacher's desk and classroom workbook (spec §8):
- ruled notebook paper with a red margin in the hero;
- section numbers as coloured notebook tabs that slide in;
- chat bubbles for the product loop and the architecture hops;
- a red-pen "checked" stamp that settles once;
- one "Capability, not dependency." sticky.

Accents: forest, rust, note. No rail vocabulary.

## 4. Sections

1. Hero: tagline "Ready-to-use worksheets, on WhatsApp." (the product's own OG line), proposition, three proofs (17 ● · 47 % ● · 37.5 min ◐, one date), and the live landing in a phone frame.
2. Teacher problem (anchors 01–03): headline, one context line, and the "Meera" job-to-be-done quote.
3. WhatsApp experience: the seven-step loop and the PRD's chat, captioned as illustrative.
4. Decisions (anchor 04): three trade-off cards.
5. System (anchor 05): seven hops and three rules.
6. Activation funnel (anchors 06–07): a six-step funnel, two proofs, and the gaps (under target; D1 not measurable; no quality evals or interviews).
7. Learnings (anchor 08): three.

## 5. Cut or shortened

- **Cut:**
  - the 30-second overview;
  - the eight-chapter deep dive and the thinking chain;
  - the whitespace 2×2 discussion;
  - the A1–A8 assumptions list;
  - the 17-manual / 0-Google split;
  - the 32 event types detail, and the Clarity and Mixpanel mention;
  - the fourth learning.
- **Removed as a rule violation:** the is_test story's numbers ("activation 10 → 8, median 37.5 → 30"). They mix two snapshot dates (brief §4). The decision to exclude test handsets stays, without numbers.
- **Not used:** the pitch's "625 tests"; the pitch snapshot (2026-08-26); the Mixpanel 27 → 7 → 4 funnel (a different dataset); the sandbox join code.

## Claims → sources

| Claim | Source id |
|---|---|
| Proposition; WhatsApp bot for time-poor K–12 teachers | TS-README-3 |
| "about two minutes" | TS-SOLUTION-PRD |
| Tagline "Ready-to-use worksheets, on WhatsApp." | TS-OG (extra source: `TS/web/public/og-cover.png`, §8.1 artifacts) |
| 17 joined, 8 activated (47 %), 12 onboarded (71 %), funnel 72 → 17 → 17 → 12 → 8 → 5, 3 referrals, nudge 1 of 4, targets | CS4-FINAL-PRD (2026-08-24, test handsets excluded) |
| 37.5 min median (self-reported) | CS4-FINAL-PRD |
| Mother who teaches Sanskrit | TS-PITCH |
| Meera JTBD quote; problem line | TS-DISCOVERY-PRD |
| Seven-step loop | TS-LOOP (extra source: `CS4/docs/assets/p2-whatsapp-loop.jpg`, §8.1 artifacts) |
| Capability, not dependency; WhatsApp distribution | TS-SOLUTION-PRD |
| Lead with the worksheet (Wave 1) | TS-MENTOR |
| Architecture hops, ports/adapters, ≈ $0.01 per generation | TS-RUNBOOK |
| Structured outputs, vision, QC pass | TS-ANTHROPIC-PAPER |
| D1 "structurally impossible"; the Bangalore lookup; excluded handsets | TS-LINKEDIN-BUILD |
| 335 passed / 2 skipped | TS-QA-PHASE6 |
