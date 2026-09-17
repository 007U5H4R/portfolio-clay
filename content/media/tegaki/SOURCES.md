# Media sources — Tegaki (TKT-54 / TSK-27)

**No media files have landed in this repo yet.** Six screenshots exist in the source project
(`GR/docs/screenshots/{hero,how-it-works,anatomy,report-excerpt,pricing,sign-in}.jpg`, 1568×661) plus
a wordmark and OG/hero-poster images, per CONTENT_INVENTORY §8.9. A landing → how-it-works → pricing
→ sign-in-screen recording is planned but **explicitly stops before sign-in** (technical-plan.md §B
TKT-26: "record landing → how → pricing → sign-in screen (stop)") — no personal Google account is
ever used in the recording. Copying/recording these into `public/media/tegaki/` and
`public/video/tegaki.mp4` (+poster) is TKT-26's scope (soft dependency, PB4), not this content
ticket's. Until TKT-26 lands, `hero: {}` and no `links.demoVideo` are set, so `/work/tegaki` renders
the standard "Hero media coming" placeholder.

## When TKT-26 lands

- `public/media/tegaki/hero.webp` (or equivalent) → set `hero.image`.
- `public/video/tegaki.mp4` (+ `tegaki-poster.webp`) → set `links.demoVideo`.
- `SOURCES.md` frame check must confirm: no checkout/payment step, no personal Google account, no
  sample report content beyond what's already public in the screenshots.

## Provenance of the written content (for cross-reference; see `docs/trace/tegaki.md` for the full table)

| Source id | Ref | Inventory |
|---|---|---|
| `GR-README` | `GR/README.md` | §8.9 |
| `GR-SOLUTION-PRD` | `GR/Solution-PRD.md` §1 | §8.9 |
