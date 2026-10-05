# TASK-130 · Dino Arcade: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`dino-arcade-pwa`, one README source), CONTENT_INVENTORY §8.10, and `docs/trace/dino-arcade-pwa.md`. The only image is the app icon (§8.10: screenshot MISSING), so the hero uses the TASK-127 cover (manifest alt; `usedOn` updated).

| # | Question | Answer |
|---|---|---|
| 1 | Problem / story | Turn a phone into an arcade cabinet, without shipping any game |
| 2 | Decision | BYO-ROM, "the load-bearing product decision"; offline-first, with no backend, accounts or analytics |
| 3–4 | Evidence / outcome | None measured; test results exist but weren't reviewed. The honest outcome is that it's fine for private play and can't be published, which is why Slag City exists (SC Discovery PRD, extra source) |
| 5 | System | Service worker → IndexedDB file → vendored EmulatorJS core → cabinet shell → on-screen controller |
| 6 | Learning | None recorded, so no learnings section |
| 7–8 | Screens / docs | App icon only; README |

- **Page length:** a short page by design (269 words).
- **Sections:**
  1. Product (anchors 01–03, 05).
  2. Decisions (04).
  3. System.
  4. Outcome (06–08).
- **Metaphor:** a backlit cabinet:
  - marquee stripes;
  - scanlines;
  - coin-slot numerals.
- **Accents:** steel, rust, note.
- **Cut:** no game names, no ROM or BIOS mentions, no Chrome T-rex (a generic pixel sauropod on the cover).

## Follow-up: real screens from the product repo (2026-09-29)

The product section now shows the real cabinet start screen, served locally from `dino-arcade-pwa@0bd1368` (landscape phone). The marquee (a licensed game title) is cropped off; no game file was loaded. Provenance: `docs/case-study-sources/INDEX.md`.

## Follow-up: journal redesign (2026-09-29)

Rebuilt as a retro arcade poster on a desert road-trip postcard: the real cabinet screen sits in a hand-authored phone, and the real icon is the stamp. Chapters: product → decision (bring your own ROM) → system (the cabinet's parts) → outcome (a road from the limit to Slag City, whose link opens in a new tab) → learnings. The learnings come from Tushar's brief, each traced to the README or the Slag City Discovery PRD. There is no licensed title or trademarked character in any asset. Full comparison: `docs/reports/TASK-130.md` → "Journal redesign".
