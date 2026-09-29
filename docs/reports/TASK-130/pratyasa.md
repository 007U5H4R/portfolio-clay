# TASK-130 · Pratyasa: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`pratyasa`), CONTENT_INVENTORY §8.8, `docs/trace/pratyasa.md`, and `docs/case-study-sources/pratyasa/` (the real device photo and the framed case). A record page, not a product.

## 1. Audit

| # | Question | Answer |
|---|---|---|
| 1 | Problem | "The invention is real, the prototype exists, the science is published… What is missing is any presentable record of it" (§1) |
| 2 | Decision | A general credibility page, not a sales page (rev 2); "contributor, not owner"; "research prototype, not an approved or regulated diagnostic device" |
| 3 | Evidence | The fact-locked PRD, and `verify-facts.py` with its required-facts list |
| 4 | Measured outcome | None for the page. The device results are paper science and stay prose, never proof cards (trace) |
| 5 | System | A small fact-lock pipeline, recorded in §8.8: PRD → required-facts list → `verify-facts.py` → static page → live at pratyasa.vercel.app (5 steps; the brief's 5–8 minimum) |
| 6 | Learning | Only the ffmpeg/drawtext tooling note, which is too slight for a section, so there is no learnings section |
| 7 | Screens | Device photo (hero) and framed case |
| 8 | Docs | discoveryPRD (FACT-LOCK), Global Constraints, the site and its checker |

## 2–5. Narrative, metaphor, sections, cuts

- **Dominant story:** a true record of real work.
- **Metaphor:** a lab notebook and a certificate:
  - a graph-paper ground;
  - a gold certificate frame on the device;
  - readout-dial numerals.
- **Accents:** forest, kraft, steel.
- **Sections:**
  1. Problem (01–02).
  2. The page (03, 05).
  3. Decisions (04).
  4. System.
  5. Evidence (06–08).
- **Cut:**
  - LOD, linear range, RSD and signal retention as cards;
  - the SL-number conflict (only "IN 429867" is used);
  - the ffmpeg learning.

## Follow-up: real screens from the product repo (2026-09-29)

"The page" section now shows the top of the live page, from the repo's README screenshots (`pratyasa@f1ca4d5`). The evidence capture is not used because it lists the co-inventors' names. Provenance: `docs/case-study-sources/INDEX.md`.
