# TASK-146.1 — /card art provenance

Model `gpt_image_2_5`, quality medium, 2k, via Higgsfield. Originals and references live in `Portfolio-illustration/illustrations/paper-cut/card/`.

## Dev-185 (orchestrator decision)
The card front landscape is built in code as independent SVG paper layers (sun/moon, 3 mountain ranges, shoreline, water, foreground) so the spec section 45 z-stack and parallax are real. Raster art is limited to what code cannot fake well: paper-fiber textures (overlaid on the SVG layers), the sailboat cut-out, and style-gate references.

## Assets
| Asset | Shipped file | Job id | QA |
|---|---|---|---|
| Paper texture, light | `public/card/paper-light.webp` (1024 sq, 78 kB) | 0e13611a-6744-46a4-9dfd-81f6f7acd985 | Pass: ivory, matte, flat light, no objects/text. |
| Paper texture, dark | `public/card/paper-dark.webp` (1024 sq, 63 kB) | 1a02a3ff-caa5-4618-b8ba-71d561f4bd41 | Pass: navy (~#17223B mean), never black, matte, no text. |
| Sailboat source | (not shipped) `sailboat-original.png` | 77c2705c-fbdc-442c-9b0b-aabb73081322 | Pass: cream sails, terracotta/navy hull, matte, no text. |
| Sailboat cut-out | `public/card/sailboat.webp` (600x767 RGBA, 29 kB) | bg removal 4097723f-fe8f-4a06-b3b9-678fd8f48f3e | Pass on ivory and navy; the remover dropped the soft contact shadow (code draws it); grey halo pixels between sails removed. |
| Reference, light | `.../card/reference-light.png` (style gate only) | 2c7912e8-2e14-4faf-a5d0-72bccd80e2e7 | Pass: matte paper, matches about-light style. |
| Reference, dark | `.../card/reference-dark.png` (style gate only) | 41afd87b-ddbf-47e2-ac48-67632df65144 | Pass: no neon/gloss; charcoal surround, navy card. |

## Prompts
- Light paper: "Flat top-down macro texture of warm ivory handmade cotton paper, visible soft fibers and subtle speckles, matte, perfectly even flat lighting with no shadows, no vignette, no gradient, no folds, no objects, no text, no letters, uniform tone across the whole frame, edge to edge texture, seamless tileable pattern"
- Dark paper: same, with "deep navy-charcoal handmade cotton paper (colour around #172646, never pure black)" and "lighter speckles".
- Sailboat: "A single tiny minimalist sailboat handcrafted from layered paper cut-outs: one cream-ivory triangular main sail, a small smaller jib sail, a small muted terracotta-and-navy paper hull, crisp hand-cut paper edges ... soft contact shadow beneath, ... plain flat solid light grey background ... no water, no gloss, no plastic, no text, no letters" (1:1).
- References: spec section 36 light and dark prompts verbatim, plus "No text, no letters." (2:3).

## Post-processing
Textures: downscaled 2048 to 1024, made seamless by half-offset cosine blend (edge-pair difference equals neighbouring-pixel difference), mean colour restored, cwebp q70. Sailboat: trimmed to alpha bbox, 600 px wide, grey-halo pixels zeroed, cwebp q72.

## Credits
Balance 571.4 to 565.4 = 6.0 credits total (5 generations + 1 background removal; per-job split not reported). Regenerations used: 0. No 429s.
