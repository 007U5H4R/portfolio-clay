# TASK-130 · Cubicle: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`cubicle`), CONTENT_INVENTORY §8.3, `docs/trace/cubicle.md`. There are no product screenshots (§8.3 "No screenshots"), no video and no live URL. This is the site's highest overclaim-risk record: **built, not launched.**

## 1. Audit (spec §40)

| # | Question | Answer from the records |
|---|---|---|
| 1 | Strongest problem | "Solo builders have no team, so ideas die in the gap between thought and first artifact… AI tools either speak in one generic voice or hide their work" (CUB-DISCOVERY-PRD) |
| 2 | Strongest decision | "Trust first, ownership second, autonomy last" (CUB-DISCOVERY-PRD); four fixed artifacts after a bounded debate (CUB-TECHNICAL-PLAN) |
| 3 | Strongest evidence | QA report: 326 tests pass (3 skipped); 97 TC rows (29 pass · 17 blocked · 48 planned); "CONDITIONALLY READY — STEPS REQUIRED" (CUB-QA-REPORT) |
| 4 | Strongest measured outcome | None on the product side: there has been no live run. Build quality only |
| 5 | Most interesting system | One streaming route: an orchestrated debate with speech acts and stop rules, then four parallel artifact calls. "The database is the truth; the stream is a convenience." (CUB-TECHNICAL-PLAN) |
| 6 | Most memorable learning | "Never skip the human-style read-the-diff review just because the gate is green" (L8) |
| 7 | Screenshots / videos | None. The hero uses the TASK-127 cover (manifest alt, `usedOn` updated) in a monitor frame. No UI is redrawn |
| 8 | PRDs / research / evals | Discovery PRD (46-source secondary research, no interviews), technical plan, decisions, QA report, HANDOFF, lesson-learnt, buildathon brief |

## 2. Narrative

- **Problem:** solo builders stall before the first artifact, and AI hides its reasoning.
- **Insight:** "Nobody makes the collaboration visible."
- **Product:** type an idea; four teammates debate in the open; four artifacts come out.
- **Decisions:** trust before autonomy; fixed deliverables; grounded search only where it matters, with a disclosed fallback.
- **Evidence:** a rigorously tested offline build, never run live.
- **Learning:** jsdom lies about layout; dev harnesses on fixtures; read the diff.

Dominant story: **visible collaboration (built, not launched).**

## 3. Metaphor

An office operating system and workbench (spec §8):
- a beige retro monitor bezel framing the hero art;
- section numbers as system-state pills with a status LED that lights once;
- decisions as pinned task cards;
- the architecture as a state line of process pills;
- a desk note saying "Built, not launched."

Accents: navy-2, green-2, note.

## 4. Sections

1. Hero: "Your first team fits in a cubicle." Proofs: 4 teammates ○, 4 artifacts per run ○, 326 tests ●.
2. Problem (anchors 01–02): with the Aarav persona line.
3. Insight (anchor 03): the "nobody makes the collaboration visible" quote; secondary research only.
4. Product: a six-step flow and the output contract (speech acts; four fixed artifacts).
5. Decisions (anchor 04): three trade-offs.
6. System (anchor 05): seven steps, three rules.
7. Evidence (anchors 06–07): build proofs and the gaps.
8. Learnings (anchor 08): three.

## 5. Cut

- **Cut:**
  - the 30-second overview and the eight chapters;
  - the thinking chain;
  - the contrast metric (it stays in the drawer only as QA evidence);
  - the eight pre-launch targets, which appear only as "never tracked" in the gaps;
  - the decks mention;
  - the three secondary personas.
- **Kept as prose, never a proof card:** cost ≈ $0.04 and latency 50–75 s, which are estimates.

## Follow-up: real screens from the product repo (2026-09-29)

The product section now shows the real UI, run locally from `cubicle@6779998` with placeholder env values (no keys, no database): the idle home, and `/dev/office` replaying the repo's hand-built test fixture, captioned "not a live run". No claim changed: there is still no live run. Provenance: `docs/case-study-sources/INDEX.md`.

## Follow-up: journal redesign (2026-09-29)

Rebuilt to the RailCite grammar as a 1990s startup cubicle at golden hour: the real finished-run screen sits inside a hand-authored CRT scene, with four speech-act bubbles. Five chapters: problem → product → trust system (trust → ownership → autonomy) → learnings → evidence. Model names and artifact-heading sources moved to the evidence drawer. "Visible reasoning creates trust" is the product's bet, untested with users. Totals and the full comparison are in `docs/reports/TASK-130.md` → "Journal redesign".
