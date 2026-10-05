# TASK-130 · Cinematic Portfolio: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`cinematic-portfolio`; CN-PRD, CN-LEDGER), CONTENT_INVENTORY §8.11, `docs/trace/cinematic-portfolio.md`, and `docs/case-study-sources/cinematic-portfolio/` (the film's poster frames).

| # | Question | Answer |
|---|---|---|
| 1 | Problem | Recruiters ask "who is Tushar Pathak?" |
| 2 | Decision | Film as backdrop; a `prefers-reduced-motion` static fallback; static files with no build step |
| 3–4 | Evidence | QA-A 8/8, QA-B 11/11, QA-C 12/12; scrub benchmark mean 0.04 ms/frame, 0 frames over 16 ms; the final review's 1 Critical + 2 Important fixed; 197 credits as pre-flighted (CN-LEDGER) |
| 5 | System | Generate (Higgsfield) → post-process (ffmpeg, headless Chrome) → 289 scrub frames → Lenis scroll → static fallback |
| 6 | Learning | Higgsfield plan gating, refunds, start-image vs reference; pre-flighting the spend |
| 7 | Screens | Poster frames (hero, work, close) |

- **Sections:**
  1. Problem (01–03).
  2. Film (05).
  3. Decisions (04).
  4. System.
  5. Learnings (06–08).
- **Metaphor:** a screening room:
  - a dark letterboxed ground;
  - sprocket rules;
  - frame-counter numerals.
- **Accents:** forest, note, kraft.
- **Cut:** the site's résumé stats (7+ · 40+ · 180+ · 30 %) are not repeated; the 197 credits appear only as a build rule, never a proof card.
