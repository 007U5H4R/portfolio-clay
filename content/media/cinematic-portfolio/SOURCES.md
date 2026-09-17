# Media sources — Cinematic Portfolio (TKT-54 / TSK-29)

**No media files have landed in this repo yet.** Real assets exist in the source project
(`CN/assets/stills/hero-still.png` 2752×1536; posters `CN/assets/posters/{hero,work,close}.jpg`
1280×720; `CN/assets/og-cover.png` 1200×630; clips `CN/assets/film/{hero-orbit,work-desk,close-walk}.mp4`),
per CONTENT_INVENTORY §8.11. A fresh 20–30 s scroll-recording of the live site is planned in
technical-plan.md §B TKT-26. Copying/recording these into `public/media/cinematic-portfolio/` and
`public/video/cinematic-portfolio.mp4` (+poster) is TKT-26's scope (soft dependency, PB4), not this
content ticket's. Until TKT-26 lands, `hero: {}` and no `links.demoVideo` are set, so
`/work/cinematic-portfolio` renders the standard "Hero media coming" placeholder — this is
deliberately conservative even though the site itself is live and public, since no still or clip has
actually been copied into this repo's `public/` tree.

## When TKT-26 lands

- `public/media/cinematic-portfolio/hero.webp` (from `hero-still.png`) → set `hero.image`.
- `public/video/cinematic-portfolio.mp4` (+ poster) → set `links.demoVideo`.

## Provenance of the written content (for cross-reference; see `docs/trace/cinematic-portfolio.md` for the full table)

| Source id | Ref | Inventory |
|---|---|---|
| `CN-PRD` | `CN/PRD.md` | §8.11 |
| `CN-LEDGER` | `CN/ledger.md` (2026-08-26) | §8.11 |
