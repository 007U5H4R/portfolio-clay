# TASK-130 · Campfire Board: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`campfire-board`; CF-README, CF-PILOT), CONTENT_INVENTORY §8.12, `docs/trace/campfire-board.md`, `docs/case-study-sources/campfire-board/` (the local app's screens), and the portfolio's YouTube pitch (`K_-510L6e7g`) and demo (`DkxDQji3dz8`).

| # | Question | Answer |
|---|---|---|
| 1 | Problem | Every project is a self-contained Markdown backlog, but there was no one view across them |
| 2 | Decision | Fork Backlog.md with credit (Alex Gavrilescu and contributors, MIT); one local binary, nothing to deploy |
| 3–4 | Evidence | The pilot checklist (2026-09-06) validated switching, scripted ticket moves and isolation on two throwaway projects: prototype-level. No users |
| 5 | System | projects.json → backlog/ folders → Bun-compiled CLI → embedded React UI → views |
| 6 | Learning | None recorded, so no learnings section |
| 7 | Screens / video | Kanban, Gantt, Workflow, Statistics; pitch and demo videos |

- **Sections:**
  1. Problem (01–03).
  2. Product (05; the demo video on the Gantt poster, plus the Workflow screen).
  3. Decisions (04).
  4. System.
  5. Evidence (06–08).
- **Metaphor:** a night campsite planning wall:
  - dark ground;
  - index-card columns;
  - ember numerals.
- **Accents:** terracotta, note, navy-2.
- **Credit:** the page never implies Tushar wrote Backlog.md.
