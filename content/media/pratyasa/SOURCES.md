# Media sources — Pratyasa (TKT-54 / TSK-26)

**No media files have landed in this repo yet.** Real assets exist in the source project
(`PT/pratyasa-site/assets/`: `device-photo.jpg` 1600×900, `case-framed.webp` 1000×856,
`device-cutout.webp` 1400×631, `certificate.jpg` 848×1200, `langmuir-cover.jpg` 421×560,
`demo-poster.jpg` 1280×720, `og-cover.png` 1200×630, `wordmark.webp` 786×75) and a device-footage
clip (`PT/pratyasa-site/assets/demo.mp4`), per CONTENT_INVENTORY §8.8. Copying and optimising them
into `public/media/pratyasa/` and `public/video/pratyasa.mp4` (+poster) is TKT-26's scope (Chore,
sp:3, soft dependency — PB4), not this content ticket's. Until TKT-26 lands, `hero: {}` and no
`links.demoVideo` are set on the `pratyasa` record, so `/work/pratyasa` renders the standard "Hero
media coming" placeholder — never a broken `<img>` or a fabricated file reference.

## When TKT-26 lands

- `public/media/pratyasa/device-photo.webp` (or equivalent) → set `hero.image`.
- `public/video/pratyasa.mp4` (+ `pratyasa-poster.webp`) → set `links.demoVideo` (durationSec per the
  re-encoded clip).
- No sign-in, checkout, or PII is present in the source footage (device footage only).

## Provenance of the written content (for cross-reference; see `docs/trace/pratyasa.md` for the full table)

| Source id | Ref | Inventory |
|---|---|---|
| `PT-DISCOVERY-PRD` | `PT/discoveryPRD.md` Goal, §4 | §8.8 |
| `PT-GLOBAL-CONSTRAINTS` | `PT/discoveryPRD.md` Global Constraints L199 | §8.8 |
