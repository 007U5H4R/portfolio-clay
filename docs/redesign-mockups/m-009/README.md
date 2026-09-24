# M-009 design reference of record (S17)

Copied at Stage 4 (2026-09-24) from `/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/mockups/` so a fresh session needs no chat context. **These files are frozen** — later notes from Tushar are change requests handled in `Design.md` §11 (Deviations), never edits here. Open any `*.html` directly in a browser (they load Google Fonts at runtime; the real site self-hosts, S13).

| Route family | Mockup | Scene asset | Published artifact |
|---|---|---|---|
| `/` | `home.html` | `assets/hero-scene.jpg` (1112×625; the shipped hero uses the 1280×684 poster + clip, see below) | https://claude.ai/artifact/Vp8jB6atzBTSZHtvrBHmXo |
| `/work` | `work.html` | `assets/scene-work.jpg` (2048×1360) | https://claude.ai/artifact/PpN1pt7kHMkFD7bAYk9NVY |
| `/work/[slug]` (TeachSpark as the rich example) | `case-study.html` | `assets/scene-casestudy.jpg` (2048×1360) | https://claude.ai/artifact/2TFWufv2N8jLUJFf9zHvYh |
| `/about` | `about.html` | `assets/scene-about.jpg` (2048×1360) | https://claude.ai/artifact/7K6ypAC9e4WHXu7RmdNxxX |
| `/thinking` | `thinking.html` | `assets/scene-thinking.jpg` (2336×1744) | https://claude.ai/artifact/Uq7FDQ6Zq3PW5PLUW4Pjrd |
| `/thinking/[slug]` | `essay.html` | `assets/scene-thinking.jpg` (pinned crop) | https://claude.ai/artifact/LpzrHiMMXLhJ79wjGdLq8F |
| `/playground` | `playground.html` | `assets/scene-playground.jpg` (2048×1360) | https://claude.ai/artifact/5CtBniANDzgAxNEnzpxtd3 |
| `/contact` | `contact.html` | `assets/scene-contact.jpg` (1792×2240) | https://claude.ai/artifact/UDuXRUT6ZrR52UiZrAPhQW |

`MOCKUP-BRIEF.md` is the contract the mockups were written to; `content-brief.md` is the verbatim extraction of `data/*.ts` (2026-09-23) they were built from. **Where a mockup's copy differs from `data/*.ts`, the data wins** (Solution-PRD §12.3, decision D7); `Design.md` §11 lists the known differences.

## Assets that stay on disk until Stage 7 (build inputs, not design reference)

Not copied here (size, or they belong under `content/media/illustrations/` with provenance per S20/EVAL-021):

- Locked character sheet (Variant B, EV4 gate): `Portfolio-illustration/illustrations/character-sheet/character-ref-LOCKED.png` (6.5 MB). `assets/reference-full.png` in the source folder is the same reference page.
- Scene masters (PNG, 4–7 MB each): `Portfolio-illustration/illustrations/scenes/scene-*.png`; the JPEGs here are the mockup renditions.
- Hero clip and posters (final, S14): `Portfolio-illustration/animation/export/hero-animation.webm` (176 kB), `hero-animation.mp4` (312 kB), `hero-poster.webp` (87 kB, first frame), `hero-end.webp` (86 kB, last frame), all 1280×684, 2.5 s. Review artifact https://claude.ai/artifact/XpfE9FLoRs6WLbuio68A4X. Rejected cuts: `export/v1/`, `export/v2-multiclip/`; the 4 s source take: `export/clipA-4s/`.
- Scene gallery artifact: https://claude.ai/artifact/RkGuTpbooHwHMJY4GjgYe6.

Stage 7 copies the shipped renditions into `content/media/illustrations/` with the manifest + `README.md` provenance rows that `Design.md` §6 specifies. No further Higgsfield spend is approved (Solution-PRD §12.4).

`../mockups-8panel-2026-09-23.png` is the eight-panel overview screenshot from the mockup review.
