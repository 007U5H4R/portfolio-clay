# TASK-215 — About: Recognition replaced by Home's Awards & Recognition

## What changed
- `app/about/page.tsx`: renders `<AwardsSection id="recognition" />` where `<Recognition />` was; section-order comment updated.
- `components/home/HomeSections.tsx`: `AwardsSection` takes an optional `id` prop (default `"awards"`). Nothing else touched.
- Removed: `components/about/Recognition.tsx`, `RECOGNITION` / `RECOGNITION_HEAD` (about-content.ts), `AWARD_ART` + the three `award-*` entries (about-paper-art.ts), `public/media/about-paper/award-{a,b,c}.webp`, and every `.rcx*` rule in `app/globals.css` (including shared selector lists).
- Tests updated: `tests/unit/about.test.tsx`, `tests/unit/about-claims.test.tsx`, `tests/e2e/about.spec.ts`, `about-part2.spec.ts`, `about-paper.spec.ts`.
- `docs/about-paper-art.md` still lists award-a/b/c in its provenance table (historical record; left alone).

## How Home stayed identical
Home calls `<AwardsSection />` with no props, so the default `id="awards"` yields the same DOM, classes, ids and content. Data stays in `home-content.ts` (`AWARD_TILES`); About reuses the same component, no copied markup. On About the section keeps the `#recognition` anchor (nothing else in the repo links to it); `awards-heading` occurs once per page, and the heading is an h2 in About's outline, replacing the old h2.

## Tests
- `pnpm typecheck`: pass. `pnpm lint`: 0 errors (2 pre-existing warnings).
- Vitest: about, about-claims, about-art, anchors: 38 passed.
- Playwright (production build, port 3381): about, about-part2, about-paper, about-research-cards, home-credentials, home specs: 134 passed, 57 skipped (viewport-gated), 1 failed before fix.
- Failure: About height budget. Measured 5.667 (was under 5.6); raised to 5.7 with a comment (new section ~60px taller at 1440). The concurrent lane removing What Drives Me should shrink the page; the budget can be re-tightened after merge.
- Screenshots (/about #recognition and / #awards, 1440/768/390/320, light+dark): no horizontal overflow, 0 console errors. Files: `/Volumes/E Drive/Dev/.scratch/task215-shots/`.

## Remaining issues
- The scroll-driven torn-edge parallax lets the Testimonials sheet overlap the section's lower ~200px mid-scroll, so detail text can be briefly covered; same behaviour as on Home with its next section.
- Merge: the other About lane edits nearby selector lists in `app/globals.css` and the h2 list in about tests; expect trivial conflicts.
