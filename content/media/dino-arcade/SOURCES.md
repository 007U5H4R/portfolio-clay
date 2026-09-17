# Media sources — Dino Arcade (TKT-54 / TSK-28)

**No media files have landed in this repo yet.** CONTENT_INVENTORY §8.10 records the screenshot as
**MISSING** in the source repo (`DN/assets/icon-512.png` 512×512 is the only existing asset — an app
icon, not a UI screenshot). A cabinet-UI recording + one screenshot is planned in technical-plan.md
§B TKT-26 ("record cabinet UI, **no ROM**, + screenshot") — explicitly with no ROM or BIOS ever
loaded during capture, and no reference to the `Game/` planning folder or its `neogeo/` BIOS/ROM
files (forbidden per the global CLAUDE.md and this project's cross-cutting rules). Landing these
files into `public/media/dino-arcade/` and `public/video/dino-arcade.mp4` (+poster) is TKT-26's
scope (soft dependency, PB4), not this content ticket's. Until TKT-26 lands, `hero: {}` and no
`links.demoVideo` are set, so `/work/dino-arcade-pwa` renders the standard "Hero media coming"
placeholder.

## When TKT-26 lands

- `public/media/dino-arcade/screenshot.webp` → set `hero.image`.
- `public/video/dino-arcade.mp4` (+ `dino-arcade-poster.webp`) → set `links.demoVideo`.
- `SOURCES.md` frame check must confirm: "no ROM/BIOS loaded" and no `Game/`/`neogeo` reference
  visible in any frame.

## Provenance of the written content (for cross-reference; see `docs/trace/dino-arcade-pwa.md` for the full table)

| Source id | Ref | Inventory |
|---|---|---|
| `DN-README` | `DN/README.md` | §8.10 |
