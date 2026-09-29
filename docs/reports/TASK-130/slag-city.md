# TASK-130 · Slag City: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`slag-city`; SC-README, SC-DISCOVERY, SC-DEPLOY), CONTENT_INVENTORY §8.13, `docs/trace/slag-city.md`, `docs/case-study-sources/slag-city/` (critique captures of the live game), and the YouTube pitch (`1xvj8j79Svs`) and demo (`tc4QDVl8NJM`). Merged from TASK-129 during this task.

| # | Question | Answer |
|---|---|---|
| 1 | Problem / why | Dino Arcade "cannot be published", so the aim is a publishable original beat-'em-up with wholly original IP (Discovery PRD §1) |
| 2 | Decisions | A pure deterministic core with seeded RNG and hashed replay goldens; one input frame for keyboard, gamepad and touch; Web Audio synthesis |
| 3–4 | Evidence | Live since 2026-09-16 with a public repo. No users, sessions or metrics recorded |
| 5 | System | inputs → one InputFrame → pure core → Phaser 3 scene → Web Audio |
| 6 | Learning | None recorded, so no learnings section |
| 7 | Screens | Coin/controls, combat, continue, phone portrait |

- **Excluded screens:** the intro slides, because they name story characters and the site names none (Tushar, 2026-09-29).
- **Stated plainly:** the art is AI-generated (Higgsfield); the game has no AI features.
- **Not shown:** the title-clearance owner gate is not a site claim.
- **Sections:**
  1. Why (01–03).
  2. Game (05; the demo video plus three screens).
  3. Decisions (04).
  4. System.
  5. Evidence (06–08).
- **Metaphor:** a coin-op cabinet at night:
  - CRT scanlines;
  - neon HUD frames;
  - coin-slot numerals;
  - molten-orange accents.
- **Accents:** rust, steel, note.
- **Kept distinct:** Slag City and Dino Arcade are separate products, so each has its own cabinet styling.
