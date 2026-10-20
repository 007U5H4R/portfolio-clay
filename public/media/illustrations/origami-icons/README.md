# Origami action-button icons provenance (TASK-301)

Five sculpted 3D origami paper-craft icons for the product card's action buttons on `/projects` (Watch demo, Watch pitch, Live product, GitHub, Case study). Generated with the Higgsfield connector, model `gpt_image_2_5`, quality `medium`, resolution `1k`, 1:1, 5 generations in total (no retries). Play was generated first and approved as the material, lighting, camera and scale reference; camera, rocket, cat and document were each generated as their own image with the Play job passed as `image_references`. The generator drew a flat white studio backdrop, so every render was cut out with Higgsfield `image_background_remover` (a real matte, no colour key). Masters (512x512 transparent PNG, trimmed and fitted to a 448 px box) are kept outside the repo in `/Volumes/E Drive/Dev/.scratch/origami-icons/masters/`; `scripts/origami-icons/encode.mjs` erodes the alpha about 1 px, drops near-neutral near-white matte residue in the 3 px edge band, and writes transparent WebP at 256 px (`origami-<name>.webp`) and 128 px (`origami-<name>-128.webp`). No text in any art.

| icon | button | generation job | cutout job |
|---|---|---|---|
| `origami-play` | Watch demo (primary) | `5c43acbf-c10c-4ead-8d87-b1db875f35e1` | `ddc94809-cfbb-4d5b-b1a3-12f003f63967` |
| `origami-camera` | Watch pitch | `6432fec0-b49b-44e7-b499-6ad6061958cc` | `303792ad-8351-47da-9322-c4ac13cf0dca` |
| `origami-rocket` | Live product | `640e7702-fc63-4d88-b090-e99330078a89` | `73dd5775-896b-4f0d-97e7-573fc994578a` |
| `origami-cat` | GitHub | `459e0c31-80d5-49ea-83e5-ef27ce864039` | `e1bc606e-c3d3-455b-8368-8a66d57bcdd7` |
| `origami-document` | Case study | `7aa27d68-9883-4eb5-9613-0fd902296128` | `0b32c97b-b52e-45e6-80c4-4151684cf409` |

## Prompts

Each prompt is the master style prompt verbatim, then the subject, then the shared tail. Camera, rocket, cat and document add the sentence 'Same material, lighting, camera angle and scale as the reference image (the origami play-button)...'. The saved text files carry a trailing 'no face' that was only sent for the rocket; camera, cat and document were sent without it.

### play

```text
Premium physically sculpted 3D origami paper-craft icon, meticulously handcrafted from individually folded and interlocking sheets of matte luxury cardstock. Genuine three-dimensional folded geometry with distinct mountain folds, valley folds, angular polygonal facets, overlapping paper layers, tucked flaps, physically believable paper thickness, exposed paper edges, recessed folds, and natural contact points. Sculptural form must be created by actual geometry rather than texture overlays, extrusion, or decorative outlines.

Refined editorial art direction, architectural miniature craftsmanship, premium contemporary product design, tactile paper fibers, subtle natural cardstock grain, crisp but slightly softened paper edges, controlled asymmetry, sophisticated warm ivory and burnt terracotta palette with restrained deep navy accents.

Three-quarter orthographic camera, approximately 30 degrees above the object, consistent object scale, centered isolated composition, generous negative space. Large soft studio key light from the upper-left, subtle frontal fill, gentle rim illumination, physically plausible ambient occlusion, soft contact shadow, warm neutral color temperature. High-quality physically based rendering, detailed fold intersections, natural surface transitions, sharp silhouette, understated luxury, realistic miniature

SUBJECT: a play-button sculpture, a right-pointing triangle built from interlocking triangular sheets of cardstock: a raised burnt terracotta (#B94727) front plane, a recessed interior plane in ivory with a restrained deep navy recess, and a folded side plane clearly showing paper thickness. Terracotta exterior, warm ivory (#F5EBDD) inner facets. Only 2-3 cardstock colours. Object fills about 70 percent of the frame, centred, on a plain uniform flat pure white background with only a soft contact shadow. No text, no logos, no gradients, no glow.
```

### camera

```text
Premium physically sculpted 3D origami paper-craft icon, meticulously handcrafted from individually folded and interlocking sheets of matte luxury cardstock. Genuine three-dimensional folded geometry with distinct mountain folds, valley folds, angular polygonal facets, overlapping paper layers, tucked flaps, physically believable paper thickness, exposed paper edges, recessed folds, and natural contact points. Sculptural form must be created by actual geometry rather than texture overlays, extrusion, or decorative outlines.

Refined editorial art direction, architectural miniature craftsmanship, premium contemporary product design, tactile paper fibers, subtle natural cardstock grain, crisp but slightly softened paper edges, controlled asymmetry, sophisticated warm ivory and burnt terracotta palette with restrained deep navy accents.

Three-quarter orthographic camera, approximately 30 degrees above the object, consistent object scale, centered isolated composition, generous negative space. Large soft studio key light from the upper-left, subtle frontal fill, gentle rim illumination, physically plausible ambient occlusion, soft contact shadow, warm neutral color temperature. High-quality physically based rendering, detailed fold intersections, natural surface transitions, sharp silhouette, understated luxury, realistic miniature

SUBJECT: a video camera sculpture: a body of overlapping folded rectangular and polygonal planes, a faceted folded lens tube projecting from the front with a darker recessed deep-navy opening, a folded top plane and angular side panels. Ivory body, terracotta lens housing, navy recess. Same material, lighting, camera angle and scale as the reference image (the origami play-button): same terracotta, ivory and navy cardstock, same soft contact shadow. Object fills about 70 percent of the frame, centred, on a plain uniform flat pure white background. Only 2-3 cardstock colours. No text, no logos, no gradients, no glow, no face.
```

### rocket

```text
Premium physically sculpted 3D origami paper-craft icon, meticulously handcrafted from individually folded and interlocking sheets of matte luxury cardstock. Genuine three-dimensional folded geometry with distinct mountain folds, valley folds, angular polygonal facets, overlapping paper layers, tucked flaps, physically believable paper thickness, exposed paper edges, recessed folds, and natural contact points. Sculptural form must be created by actual geometry rather than texture overlays, extrusion, or decorative outlines.

Refined editorial art direction, architectural miniature craftsmanship, premium contemporary product design, tactile paper fibers, subtle natural cardstock grain, crisp but slightly softened paper edges, controlled asymmetry, sophisticated warm ivory and burnt terracotta palette with restrained deep navy accents.

Three-quarter orthographic camera, approximately 30 degrees above the object, consistent object scale, centered isolated composition, generous negative space. Large soft studio key light from the upper-left, subtle frontal fill, gentle rim illumination, physically plausible ambient occlusion, soft contact shadow, warm neutral color temperature. High-quality physically based rendering, detailed fold intersections, natural surface transitions, sharp silhouette, understated luxury, realistic miniature

SUBJECT: a rocket sculpture oriented slightly diagonally pointing up-right: a tapered folded fuselage, a sharp folded nose cone, separate interlocking folded fins, and a subtle deep-navy recessed engine opening. Terracotta and vermilion (#D85B32) exterior, ivory panels. Same material, lighting, camera angle and scale as the reference image (the origami play-button): same terracotta, ivory and navy cardstock, same soft contact shadow. Object fills about 70 percent of the frame, centred, on a plain uniform flat pure white background. Only 2-3 cardstock colours. No text, no logos, no gradients, no glow, no face.
```

### cat

```text
Premium physically sculpted 3D origami paper-craft icon, meticulously handcrafted from individually folded and interlocking sheets of matte luxury cardstock. Genuine three-dimensional folded geometry with distinct mountain folds, valley folds, angular polygonal facets, overlapping paper layers, tucked flaps, physically believable paper thickness, exposed paper edges, recessed folds, and natural contact points. Sculptural form must be created by actual geometry rather than texture overlays, extrusion, or decorative outlines.

Refined editorial art direction, architectural miniature craftsmanship, premium contemporary product design, tactile paper fibers, subtle natural cardstock grain, crisp but slightly softened paper edges, controlled asymmetry, sophisticated warm ivory and burnt terracotta palette with restrained deep navy accents.

Three-quarter orthographic camera, approximately 30 degrees above the object, consistent object scale, centered isolated composition, generous negative space. Large soft studio key light from the upper-left, subtle frontal fill, gentle rim illumination, physically plausible ambient occlusion, soft contact shadow, warm neutral color temperature. High-quality physically based rendering, detailed fold intersections, natural surface transitions, sharp silhouette, understated luxury, realistic miniature

SUBJECT: a cat-head sculpture, original angular folded-paper silhouette: two angular ears from separate folded pieces, the head built from overlapping polygonal planes, a few recessed folds for the face. Terracotta with ivory and navy facets. Not an extruded or printed logo, no eyes, no whiskers. Same material, lighting, camera angle and scale as the reference image (the origami play-button): same terracotta, ivory and navy cardstock, same soft contact shadow. Object fills about 70 percent of the frame, centred, on a plain uniform flat pure white background. Only 2-3 cardstock colours. No text, no logos, no gradients, no glow, no face.
```

### document

```text
Premium physically sculpted 3D origami paper-craft icon, meticulously handcrafted from individually folded and interlocking sheets of matte luxury cardstock. Genuine three-dimensional folded geometry with distinct mountain folds, valley folds, angular polygonal facets, overlapping paper layers, tucked flaps, physically believable paper thickness, exposed paper edges, recessed folds, and natural contact points. Sculptural form must be created by actual geometry rather than texture overlays, extrusion, or decorative outlines.

Refined editorial art direction, architectural miniature craftsmanship, premium contemporary product design, tactile paper fibers, subtle natural cardstock grain, crisp but slightly softened paper edges, controlled asymmetry, sophisticated warm ivory and burnt terracotta palette with restrained deep navy accents.

Three-quarter orthographic camera, approximately 30 degrees above the object, consistent object scale, centered isolated composition, generous negative space. Large soft studio key light from the upper-left, subtle frontal fill, gentle rim illumination, physically plausible ambient occlusion, soft contact shadow, warm neutral color temperature. High-quality physically based rendering, detailed fold intersections, natural surface transitions, sharp silhouette, understated luxury, realistic miniature

SUBJECT: a document sculpture: a thick ivory cardstock main sheet with an inward-folded terracotta upper corner, two or three raised deep-navy paper strips physically standing on the sheet for content (never printed), and a second ivory sheet partly visible behind it. Same material, lighting, camera angle and scale as the reference image (the origami play-button): same terracotta, ivory and navy cardstock, same soft contact shadow. Object fills about 70 percent of the frame, centred, on a plain uniform flat pure white background. Only 2-3 cardstock colours. No text, no logos, no gradients, no glow, no face.
```

