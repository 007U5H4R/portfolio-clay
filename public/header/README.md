# Header art (TASK-192, origami paper tabs)

Approved art from the brief at `/Volumes/E Drive/Dev/.scratch/origami-header/art/` (generation details, Higgsfield job ids, prompts and
known limitations are in that folder's `README.md`). Nothing here is regenerated; the files below are the approved WebPs, only
down-sampled (sharp, WebP q80) to roughly 2x of the size they are drawn at:

| File | Source | Size | Used for |
| --- | --- | --- | --- |
| terrain-{light,dark}-left.webp | terrain-*-left.webp, 800 wide | 480 wide | left corner hills + trees (`.ht-left`) |
| terrain-{light,dark}-right.webp | terrain-*-right.webp, 800 wide | 480 wide | right corner hills + trees (`.ht-right`) |
| terrain-{light,dark}-mid.webp | terrain-*-mid.webp, 1600 wide | 840 wide | seamless low centre band, repeat-x (`.ht-mid`) |
| tp-tile-{light,dark}.webp | tp-tile-*.webp, 384 square | 192 square | paper tile behind the TP monogram (the monogram is the live SVG) |
| paper-grain-{light,dark}.webp | paper-grain-*.webp, 640 square | 640 square, drawn at 320 css px | the header sheet's paper texture |

Unused source assets (the full 2400 px `terrain-*.webp` strips) are deliberately not shipped. Each theme loads only its own files
(`background-image` under `[data-theme]`).
