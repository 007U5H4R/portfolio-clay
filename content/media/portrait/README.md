# Portrait — provenance (TASK-111)

Tushar's direction (2026-09-27): "replace contact postcard stamp with my original image and put post
card stamp border as my image border." His own headshot, not a generated illustration (so outside the
EVAL-021 illustration manifest); rendered on `/contact` as the contact card's postage stamp
(`PortraitStamp` in `components/contact/ContactCard.tsx`, alt "Photo of Tushar Pathak"; Design.md §11
Dev-102).

| file | source | processing | bytes | sha256 (first 16) |
|---|---|---|---|---|
| `tushar-stamp.webp` | `/Volumes/E Drive/Dev/Code/Claude/portfolio/photo.jpg` (397×397 JPEG, sha256 `333e909178570b9f…`; byte-identical to `Graphology/public/tushar.jpg`) | `sharp` 0.35: resize 256×256, WebP q82. Re-encoded without metadata — the source carried an XMP block and no EXIF/GPS; the output has no EXIF, XMP or ICC | 8,590 | `d5ae78f645f75a04` |
