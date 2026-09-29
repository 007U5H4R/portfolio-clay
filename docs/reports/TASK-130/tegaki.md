# TASK-130 · Tegaki: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`tegaki`; two SourceRefs), CONTENT_INVENTORY §8.9 (Discovery and Solution PRD, README, stack, eight-stage chain), `docs/trace/tegaki.md`, and `docs/case-study-sources/tegaki/` (six real screens of the live pilot). The page adds three extra sources, each from §8.9: `GR-DISCOVERY-PRD`, `GR-BUILD` (package.json, migrations, tests) and `GR-SITE` (the live pages).

## 1. Audit (spec §40)

| # | Question | Answer from the records |
|---|---|---|
| 1 | Strongest problem | Productize "a fully manual practice (analysis → … → polished report docx/PDF)" and answer: "would a stranger trust and pay for this experience?" (Discovery PRD §1; Solution PRD §1) |
| 2 | Strongest decision | The pilot reframe: gateway, domain and email deferred, and the checkout confirms without charging. "Readings are indicative and growth-oriented, never a diagnosis", enforced in CI (README) |
| 3 | Strongest evidence | Sample guardrails enforced "in the browser, the server action, *and* the database CHECK constraints" (README); 18 migrations with RLS; 31 test files |
| 4 | Strongest measured outcome | None: no pilot users or orders are recorded (§8.9 MISSING) |
| 5 | Most interesting system | Google sign-in → buyer-scoped storage under row-level security → a human reads → signed-URL delivery → a Vercel Cron retention job |
| 6 | Most memorable learning | **None recorded** (§8.9: "no lesson-learnt file seen"), so the page has no learnings section |
| 7 | Screenshots / videos | Six real screens. Uses the landing, "three things on a page" and the fictional-sample report excerpt. No video |
| 8 | PRDs / research / evals | Discovery PRD, Solution PRD, README, package.json and tests. No interviews, no pilot data |

The internal analysis prompt is never named (trace rule).

## 2. Narrative

- **Problem:** a handwriting reading that lives in one person's hands; would a stranger trust it and pay for it?
- **Product:** send two pages, a human reads them, get a personal report.
- **Insight:** "the operator half" (turnaround, admin) is the biggest gap.
- **Decisions:** keep the reading human (no AI in the product); pilot before payments; indicative, never diagnostic, with CI guarding that copy.
- **System:** privacy by construction.
- **Evidence:** live, structural guarantees, no users yet.

Dominant story: **a human craft, carefully productized.**

## 3. Metaphor

A Japanese stationery and handwriting studio (spec §8):
- a genkō-yōshi square-grid ground;
- ink brush underlines that draw once per section;
- a vermilion hanko seal;
- section numerals in brush-ink circles;
- quiet ivory paper cards.

Accents: rust (vermilion), navy-2 (ink), forest (the product's own button green). No AI imagery.

## 4. Sections

1. Hero: "Two pages. One human reader." (the product's own line), proposition, proofs (2 pages ○ · 1 human reader ◇ · 3 depths ○), and the live landing.
2. Problem (anchors 01–02): the manual practice as a three-step flow, plus the pilot question.
3. Product (anchor 03): send → read → receive, with the anatomy and report screens.
4. Insight (research): the operator-half quote.
5. Decisions (anchor 04): three trade-offs.
6. System (anchor 05): six steps, three rules.
7. Evidence (anchors 06–08): structural proofs and the gaps.

## 5. Cut

- **Cut:**
  - the two-paragraph overview;
  - the pricing screen and the sign-in screen;
  - the ₹ tiers as copy (only "three depths" stays);
  - the internal prompt name;
  - the 31-test-files figure, which moved to the drawer.
- **No learnings section:** none are recorded.
