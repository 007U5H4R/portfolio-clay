# TASK-127 · Portfolio fidelity pass: Phase 1 visual audit

Spec: `docs/redesign-mockups/m-009/tushar-2026-09-28/portfolio-fidelity-spec.md` (the Phase 1 brief, 15 dimensions, then A–D). No code was changed in this phase.

**Inputs compared**
- **Current:** the `cloud/task-127` build (`c448cc5` plus the spec commit), `pnpm build && pnpm start`. Screenshots are in `docs/screenshots/m-009/task-127/before/`: `products-{teachspark,railcite}-{1440,768,390}.png`, `enterprise-{1440,768,390}.png` and `full-teachspark-{1440,768,390}.png`. `portfolio-current-railcite.png` in the spec folder shows the same state.
- **Reference 1** (`portfolio-reference-1.png`): the scrapbook product-review composition.
- **Reference 2** (`portfolio-reference-2.png`): the full-page target. Where the two differ, reference 2 wins; reference 1 supplies the material vocabulary.
- **Measurements:** taken in Chromium at 1440 × 900 with TeachSpark selected (`getBoundingClientRect` and computed styles). Reference sizes are read off the 1586 px wide reference 2 and scaled to a 1440 page.

**Why it still reads as "a web page with paper styling"**

Every object on the current page is a rectangle carrying paper *decoration*. The torn edges are 30-point `clip-path` polygons with about 1 % amplitude, so they read as ruler-straight edges with a slight wobble. The papers behind the objects peek out by 10–18 px as flat strips. The cover art is a gradient, a disc and a line icon. The page therefore keeps the web's grammar (a two-box feature row, a toolbar row, a scroll row, a card grid), with paper textures applied on top.

In the references, the objects themselves are made of paper:
- fibrous torn edges with lighter fibre rims;
- papers stacked three or four deep, each at its own angle;
- painted cover art;
- a kraft band with its own crumple texture and torn ends.

The objects also overlap one another, so the top of the page reads as one spread.

---

## The 15 dimensions

### 1. Composition
- **CURRENT:** The layout is three stacked web blocks.
  - **Intro block:** 704 × 202 px, spanning the top.
  - **Feature row:** the stage (714 × 422) and the sheet (439 × 362) are top-aligned at the same y (973 px), so they read as two boxes in a row.
  - **Carousel block:** a full-width kraft band opening with a toolbar row ("Select a product … PLAYER SELECT · 1 / 12 ‹ ›").

  The sheet is shorter than the stage (362 vs 422 px), which leaves a dead 60 px gap under it.
- **REFERENCE:** One spread.
  - **Intro:** compact, about 90 px tall, in the upper-left only.
  - **Sheet:** rises alongside the intro, with its top level with the h1. It runs down past the stage's bottom edge.
  - **Stage:** sits under the intro, to the left of the sheet.
  - **Kraft band:** its torn top edge tucks under the bottom of *both* the stage and the sheet.
  - **Arrows:** sit at the band's two torn ends. There is no toolbar row.

  The eye moves in a Z: intro → sheet → stage → covers.
- **CORRECTION:**
  - **Intro:** at ≥ 1024 it takes the left column only, capped at the stage's width.
  - **Sheet:** a negative top margin equal to the intro's height aligns its top with the eyebrow. It ends 24–32 px below the stage bottom.
  - **Band:** tucks 28–40 px under both (`z-index` below, negative top margin).
  - **Toolbar row:** at ≥ 1024 it becomes a small tag on the band's top-left edge, and the arrows become torn tabs at the band's left and right ends, centred on the covers.
  - **Below 1024:** the order stays media → sheet → actions → carousel.

### 2. Visual hierarchy
- **CURRENT:** The h1 is Fraunces 500 at 60 px, over two lines. It outweighs the stage: the first things the eye finds are "Products I've built, / tested, and shipped." and then the "TeachSpark" lettering on the poster. The stage poster's 35 px lettering sits bottom-right on a dark scrim and competes with the sheet's 50 px "TeachSpark" h2 beside it. The toolbar row puts four equal-weight items (label, "PLAYER SELECT", counter, arrows) between the stage and the covers.
- **REFERENCE:**
  - **Intro:** a small h1 (about 32 px bold serif, one line) and a 14 px typewriter subline, so it reads as a caption.
  - **Stage:** the dominant object, with its lettering composed into the poster's calm top-right and a large play disc.
  - **Sheet:** second; its h2 is large but on a smaller object.
  - **Covers:** third.
- **CORRECTION:**
  - **Intro:** h1 at `clamp(28px, …, 40px)` weight 700, one line from 1024; the subline at 16–17 px.
  - **Stage:** the largest object on the page, with lettering at the top of the poster's calm band. The Play disc keeps its current size.
  - **Sheet h2:** stays about 46–50 px.
  - **Band label:** collapses to one small tag.

  The result is one clear order: stage → sheet → covers → enterprise.

### 3. Materiality
- **CURRENT:** One paper stock everywhere: flat ivory with the 7 px and 11 px grain-dot tiles.
  - The kraft band is a flat kraft fill with a faint gradient.
  - The back sheets are flat kraft rectangles.
  - The tape is a translucent flat rectangle.

  No paper has fibres, mottling, stains or crumple, so every surface reads as a CSS fill.
- **REFERENCE:** Mixed stocks.
  - **Page:** aged cream paper with specks and stains.
  - **Kraft band:** mottled and crumpled, with lighter fibres along its tears.
  - **Sheet:** off-white, with a faint water stain.
  - **Tape:** translucent kraft, with torn ends.
  - **Enterprise:** a paler, wrinkled page.
- **CORRECTION:** Three paper stocks as static SVG tiles in `public/media/portfolio/decor/`:
  - **Cream fibre:** specks and short fibres, used for the section background.
  - **Kraft:** mottled, with long fibres, used for the band and the backing.
  - **Dossier:** cooler and faintly ruled, used for the enterprise section.

  The ivory sheet and mat get a faint stain and fibre layer. All colour stays in the SVG files; the CSS only references them, so EVAL-020 is unaffected.

### 4. Layering
- **CURRENT:**
  - **Stage:** two layers (a torn ivory frame plus a kraft sheet offset 14–18 px behind it). The kraft shows only as a 16 px strip at the right and bottom.
  - **Sheet:** two layers (ivory plus a kraft back sheet at −1.4°).
  - **Band:** one layer.
  - **Covers:** sit inside the band's padding and never cross an edge.
- **REFERENCE (and spec §3):** The poster stack is kraft backing → a dark torn under-layer → a cream torn mat → the poster, with each layer's torn edge visible at a different place. The sheet is paper on paper, pinned and taped. The band sits over the page and under the stage. Tape crosses the edges.
- **CORRECTION:**
  - **Stage:** four layers.
    - Kraft backing at −1.2°, offset down and left, extending 18–26 px.
    - A navy under-layer at +0.8°, showing as an irregular 3–6 px dark rim at the top-right and bottom-left.
    - An ivory mat with a fibrous tear.
    - The 16:9 poster.
  - **"Pitch video" label:** becomes a strip of kraft tape crossing the mat's top-left edge, onto the poster.
  - **Sheet:** a paper-2 under-sheet peeks out at the bottom-left, plus a pin at top-left and a translucent tape corner at top-right.
  - **Band:** tucked under the stage and sheet. Covers overhang its top tear by 4–10 px as their rotation varies.

### 5. Paper treatment (edges)
- **CURRENT:** Every tear is a `clip-path: polygon()` with 20–35 vertices and 0.5–2 % amplitude:
  - the stage frame, the back sheets, the strips, the band and the "coming" tag;
  - several objects share the same two polygons (`--pf-tear-a`, `--pf-tear-b`).

  At 1440 those edges read as straight lines with a slight zigzag, with no fibre and no light rim. The info sheet's polygon is almost a rectangle.
- **REFERENCE:** Torn edges have two frequencies: a slow wander of several px, plus hairline fibres. They also show a lighter "core" rim where the paper split. The kraft band has white fibres along both tears.
- **CORRECTION:**
  - **Rough filter:** one inline SVG filter (`feTurbulence` + `feDisplacementMap`, no colour, so EVAL-020 is clean) applied through `filter: url(#…)` to the paper *layers only* (pseudo-elements). It is never applied to text, to the poster or to any ancestor of the video iframe.
  - **Light rim:** each torn paper gets a slightly larger, lighter rim layer, displaced with a different seed, under it.
  - **Clip-paths:** the polygons stay only as the slow wander (base shape). The fibres come from the displacement.

### 6. Artwork richness
- **CURRENT:** One painted image (TeachSpark). Every other product's poster is the enlarged CSS cover: a two-stop gradient, one blurred disc (the "sun"), a `clip-path` ground band and a 1.4 px-stroke lucide icon at 46 % of the width. On RailCite's stage that is a 170 px `ShieldCheck`-style outline over a purple-to-orange gradient, with horizontal pinstripes for "rails". There is no foreground, midground or background, no story and no light source.
- **REFERENCE:** Painted scenes with three depth planes and a light source.
  - **TeachSpark:** worksheets in the foreground, a robot in the midground, a lit classroom window in the background.
  - **RailCite:** a train on a sunset track.
  - **Cubicle:** a CRT on a desk.
  - **Velora:** a mountain at dusk.
- **CORRECTION:** Twelve hand-authored SVG illustrations (no image generation is available, per the brief), one per product. Each file:
  - is 1600 × 900, under 40 kB and text-free;
  - has a calm top band (sky or wall) for the HTML lettering, the subject in the centre-left third, story props on the right (seen on the stage only) and a foreground band;
  - carries halftone shading (pattern), print grain (turbulence at low opacity), a warm light source and dark ink keylines;
  - uses a limited palette per product, harmonised with the paper tokens.

  Each subject comes from the product's own record (see B).

### 7. Product-cover individuality
- **CURRENT:** Eleven CSS covers share one template: navy band, sun disc, ground, a centred lucide icon, the name at the top and a navy mono plate. Only the tint and icon change. In the before screenshots, RailCite, Nuptis → Velora and Bhakti Vilas differ only in hue. TeachSpark is the one painted cover, so the row reads as "one real cover plus ten placeholders".
- **REFERENCE:** Six covers share a packaging grammar (a code chip, title lettering in six different faces, a cream plate plus an emblem, a printed border), but each has entirely different art and palette.
- **CORRECTION:**
  - **Grammar kept:** code chip, HTML lettering, printed border, halftone.
  - **Art:** each cover's art is its own composition, in a different palette and with a different dominant shape.
  - **Plate:** becomes cream paper with navy mono text, plus an emblem in the product's accent (matching the reference), replacing the navy plate.
  - **Lettering:** stays per product (rounded / slab / script / block / serif / mono), with per-product title and extrude colours.

### 8. Carousel proportions
- **CURRENT:** 4:5 covers, 175 × 218 px; about six visible in a 1168 px track. The band is 336 px tall, including a 60 px toolbar row. The covers sit in a normal flex scroller with 16 px top padding.
- **REFERENCE:** About 158 × 136 px covers (≈ 7:6, slightly landscape), six visible. The band is only a little taller than the covers, and the arrows sit outside the covers at the band ends.
- **CORRECTION:** The spec fixes the ratio at 4:5 or 5:6 and bans tall, skinny cards. **5:6** is the squarer of the two and the closest to the reference's landscape covers (a judgement call).
  - **Size at 1440:** the track is inset by the two arrow tabs (about 1110 px), giving six covers at about 168 × 202.
  - **Band:** about 280 px tall, with no toolbar row.
  - **Other widths:** 390 shows about 1.7 covers (the swipe cue); 768 shows about 3.5.

### 9. Active-media presentation
- **CURRENT:**
  - **Frame:** the screen is 670 × 378 inside a 22 px ivory frame, reading as a mat board rather than torn paper. It is rotated −0.2°, which is imperceptible.
  - **Lettering:** bottom-right, on a dark diagonal scrim.
  - **Tags:** the "Pitch video" label is a flat note-yellow tag, set beside a separate kraft tape strip.
  - **No-video state:** products without video show a "Pitch video coming" tag in the screen's corner; RailCite's play disc sits over the icon.
- **REFERENCE:**
  - **Poster:** a pitch-film poster with a fibrous torn edge, torn cream paper visible around it, and a slight rotation.
  - **Label:** a strip of kraft tape reading "Pitch Video", crossing the frame corner.
  - **Lettering and play button:** top-centre-right, integrated with the art; the play disc sits in a calm zone of the art.
- **CORRECTION:**
  - **Stage stack:** the 4-layer stack from §4, rotated −0.4°, with warm shadows that follow the torn silhouettes (`drop-shadow` on the layers, not a box shadow).
  - **Lettering:** moves to the poster's calm top band, with the cover line in Caveat and a rust marker swipe beneath. It stays HTML and `aria-hidden` (the figcaption carries the name and the art's alt).
  - **Play disc:** moves into the art's calm right-centre zone. The player markup is untouched; only CSS placement changes.
  - **"Coming" tag:** becomes a small torn kraft tag pinned to the poster.
  - **One tape label:** the tape piece is the "Pitch video" / "Demo video" label.

### 10. Product-info sheet styling
- **CURRENT:**
  - **Sheet:** 439 × 362 px, an almost rectangular ivory polygon at +0.4° over a kraft back sheet, with one pin.
  - **Strips:** an Inter 600 16 px label, a rounded-rectangle icon block and one shared polygon.
  - **Case study:** a kraft tab.
  - **TeachSpark:** has only one real action (Product link), so the sheet is mostly empty paper.
- **REFERENCE:**
  - **Sheet:** off-white, torn and faintly stained, pinned top-left and taped top-right. It is visibly thicker than the page because of its shadow and underlayer.
  - **Name:** a bold serif h2, with a small spark doodle.
  - **Cover line:** italic serif.
  - **Strips:** five tinted torn strips, each with a darker torn icon chip, a serif label, a small serif hint and an arrow. Each strip is slightly rotated and has fibrous ends.
- **CORRECTION:**
  - **Sheet:** torn with fibrous edges (the §5 filter) at +0.6°; a pin at top-left, a translucent tape corner at top-right, a paper-2 under-sheet and a faint stain in the paper tile.
  - **Hierarchy (spec §6):** metadata (14 px mono, ink-soft; no longer a terracotta chip) → name (Fraunces 650) → cover line → description (≤ 3 lines) → strips.
  - **Strips:** Fraunces 600 labels, torn icon chips, fibrous ends and per-strip jitter (±0.4°, 0–6 px offsets).
  - **Case study:** becomes a real sixth strip in kraft ("Read the case study →"). It is a real destination, and it keeps sparse products from looking empty.

  Only actions that exist are rendered (unchanged).

### 11. Enterprise-section density
- **CURRENT:**
  - **Grid:** 3 columns × 2 rows at 1440. Every card is 375 × 532 px.
  - **Cards:** each holds a stamp, client, program, role + dates, a 2–5 line summary, the sub-projects, 5–6 tags and a two-line source, so it reads like a miniature résumé.
  - **Heading:** the h2 is 56 px over two lines and the subline is 22 px, so the intro takes 231 px.
- **REFERENCE:** Short, balanced cards: a logo, client, a 2–3 line summary, tags and "Open case file →".
- **CORRECTION:**
  - **Grid:** keep 3 × 2 at ≥ 1024, 2 at 768 and 1 at 390 (spec §21), with gaps of 34–40 px.
  - **Card order:** file tab → client → program → summary → sub-projects → tags.
  - **Card footer:** role · dates · source move into one quiet 14 px footer.
  - **Heading:** h2 at `clamp(28px, …, 42px)`, one line from 1024; the subline at 16–17 px.

  No "Open case file →" link: no destination exists (brief).

### 12. Spacing
- **CURRENT:**
  - **Intro to stage:** 31 px gap.
  - **Stage to band:** separated by the band's own padding.
  - **Band to enterprise:** 171 px from the band bottom to the enterprise eyebrow, but a flat 44 px torn edge carries the transition, so it still feels abrupt.
  - **Inside the sheet:** a uniform 10 px gap.
- **REFERENCE:**
  - **Top:** tight overlaps between the intro, stage, sheet and band.
  - **Enterprise:** a clear pause, then a new paper.
  - **Sheet:** spacing is grouped (a name/cover-line pair, a paragraph, then the strip stack).
- **CORRECTION:**
  - **Top:** overlaps replace gaps (the sheet rises beside the intro; the band tucks 28–40 px under).
  - **Enterprise transition:** about 180–220 px at 1440, split across the band's bottom tear, a layered two-sheet seam and the enterprise padding.
  - **Sheet groups:** 4 px inside the name/cover-line pair, 14 px before the description, 18 px before the strips, 8 px between strips.

### 13. Controlled imperfection
- **CURRENT:** The rotations are stage −0.2°, sheet +0.4°, covers ±0.6° and strips ±0.3°. All the edges are machine-smooth, and every cover shares the same shadow. The tape strip, pins and doodle are straight and centred.
- **REFERENCE:** The imperfection comes mostly from the *edges* (fibres), the tape angles and the stacked offsets, not from rotation alone.
- **CORRECTION (spec §16 ranges):**
  - **Rotations:** stage −0.4°, sheet +0.6°, covers −0.8…+0.8° (four-step cycle), strips ±0.4°, tape −4…−7°.
  - **Paper layers:** backing layers are offset unevenly (for example 18 px left and 12 px down).
  - **Edges:** every paper edge gets the displacement fibre.
  - **Shadows:** the cover shadows vary with rotation.
  - **Mobile:** the stage and sheet rotations drop to 0 on phones (legibility), while the edges stay torn.

### 14. Shadows / depth
- **CURRENT:** A warm terracotta/navy mix (good), but applied as `box-shadow` on rectangles (covers, cards) or as one `drop-shadow` on the whole stage. Depth reads as "floating card", and the kraft back sheets cast no shadow of their own.
- **REFERENCE:** Short, soft contact shadows under every paper layer, following each tear, plus a longer diffuse shadow under the topmost object. There is no black and no gloss.
- **CORRECTION:** Two shadow tokens per paper object:
  - **Contact:** 1–2 px navy at 10 %.
  - **Ambient:** 10–18 px terracotta at 14–20 %.

  Both are applied as `drop-shadow` on each torn layer so they follow the tear.
  - **Selected cover:** lifts 8 px with a longer ambient shadow.
  - **Enterprise cards:** quieter (half the ambient).

### 15. Emotional impact
- **CURRENT:** Competent and tidy, but generic. Ten of the twelve products show an icon on a gradient, so the page says "a component library in a paper theme". The one warm moment is TeachSpark's painted robot.
- **REFERENCE:** It feels like someone's desk: a wall of cherished cartridges on kraft paper, a poster taped up, a note pinned beside it. Each product feels like it has a world.
- **CORRECTION:**
  - **Art:** every product gets a world (the twelve scenes).
  - **Top:** feels made by hand (fibre edges, stacked papers, one tape label, one pin per object).
  - **Enterprise:** turns grown-up (manila dossiers, restrained type) so the contrast reads as intent.

  No copy is added to make up for weak visuals (spec §28).

---

## A. The 10 most important corrections

1. **Real artwork.** Replace the eleven CSS icon scenes (and the enlarged-cover poster) with twelve hand-authored illustrated SVG scenes, one per product, used as both the 5:6 cover and the 16:9 poster. See B for TeachSpark.
2. **One spread at the top.** A compact one-line intro in the upper-left; the sheet rises beside it; the stage below; the kraft band tucked under both; no toolbar row.
3. **The stage as a 4-layer physical stack.** Kraft backing → navy torn under-layer → fibrous ivory mat → poster, at −0.4°. One kraft tape label ("Pitch video" / "Demo video"), one pin, lettering in the poster's calm band, and the play disc in the art's calm zone.
4. **Real tears everywhere.** One colour-free SVG displacement filter plus light rim layers on every paper layer, replacing the smooth 1 % polygons.
5. **The info sheet as a torn, pinned and taped sheet** (+0.6°, under-sheet, stain), with the §6 hierarchy and serif strip labels.
6. **Torn action strips.** Fibrous ends, torn icon chips, jitter and per-strip shadows. The case study becomes a real kraft strip.
7. **A physical kraft band.** Crumpled kraft texture, lighter fibre rims, visible torn ends, tucked under the stage. Torn paper arrow tabs at its ends, and a small "Select a product · 01 / 12" tag.
8. **The collectible cover system at 5:6.** Code chip, per-product lettering, a cream plate plus emblem, a printed border, halftone and grain, and per-cover tilt ±0.8°. **Selected cover:** 8 px lift, a hand-drawn marker frame (SVG `border-image`), a pin and a marker swipe on the plate.
9. **The enterprise chapter break and dossiers.** A layered torn seam, about 200 px of air and dossier paper. Cards sit in manila folders with a tab, paperclip and neutral stamp; content is trimmed to client, program, summary, sub-projects and tags, with role, dates and source in a quiet footer. A one-line h2.
10. **Materiality and depth.** Three paper stocks (cream fibre, kraft, dossier) as SVG tiles, plus contact and ambient warm shadows that follow each tear.

## B. Current assets to replace entirely

- **The eleven CSS cover scenes:** `.pf-cover-scene`, `.pf-scene-sun/-ground/-hero` and every `.pf-cover[data-scene=…]` rule (about 330 lines in the TASK-116 block of `app/globals.css`). Their `scene` field and lucide hero use go with them. The lucide glyph stays only as the small plate emblem.
- **The stage poster:** today the enlarged cover. It is replaced by the product's own artwork, reframed to 16:9.
- **TeachSpark's painted cover** (`cover-teachspark.webp`, Dev-115):
  - **Decision:** replaced by an SVG counterpart.
  - **Why:** it is the only raster, painted with soft photographic light. Beside eleven bold, flat printed vector scenes it would read as a different medium, which breaks the brief's "one shared packaging grammar and illustration style". The concept is kept (a friendly helper robot, worksheets, a green chat bubble, a dusk classroom).
  - **Recovery:** the webp stays in git history (`c448cc5`) if Tushar prefers painted art later (see the open question).
- **All the `clip-path` tears:** `--pf-tear-a/-b`, the stage frame, both back sheets, the strip polygons, the band polygon and the arrow-chip polygons. Each is replaced by a base shape plus the displacement filter.
- **The carousel toolbar row:** the "Select a product" label, "PLAYER SELECT", the counter and the arrow chips move into a small band tag and two torn arrow tabs. The tablist keeps its accessible name "Select a product".
- **The enterprise card chrome:** the 1 px border, the identical folded corner and the heavy two-line source block.

**New assets to create:**
- **Covers:** 12 SVG scenes (`public/media/illustrations/covers/cover-<slug>.svg`, registered in the manifest and README).
- **Paper tiles:** three SVG paper tiles (`public/media/portfolio/decor/`).
- **Selected frame:** one hand-drawn frame SVG for the selected cover.
- **Tear filter:** one inline, colour-free SVG filter block (a React component, no colour literals).

## C. Current components that can be preserved

- **`IndependentProductsShowcase`:**
  - its state machine (`activeProductId`, `mediaMode`, `enter`, the stage nonce);
  - the `?product=` deep link with `replaceState`;
  - the tabpanel semantics.
- **`ProductMediaPlayer`:** untouched (click-to-load, youtube-nocookie only, one iframe, the blocked-embed fallback). Only its CSS placement (the `.pf-play` position) changes. `lib/video-providers.ts` and `lib/csp.ts` are untouched.
- **`ProductCarousel` logic:** tabs with a roving `tabIndex`, ←/→/Home/End with wrap, the arrow buttons, scroll-into-view inside the track only, and the `aria-live` counter. The markup is restyled.
- **`ProductInfoPanel` logic:**
  - only existing actions render;
  - Pitch / Demo carry `aria-pressed` and `aria-controls`;
  - external links open a new tab with `noopener noreferrer` and an "(opens in new tab)" name;
  - the case-study link and its label "Read the case study".
- **`MainMediaStage` keying:** `product:mode:nonce`, and the figcaption with the art's alt.
- **`EnterpriseClientWork`:** data rendering, the six cards in order, the source line, and no links.
- **Data and lib:** `lib/portfolio.ts` (model and derivations), `data/enterprise.ts`, `data/projects.ts`.
- **Paper primitives:** `Pin`, `Tape`, `Sheet`, `Annotation`, `TornEdge`, `Sketch`.
- **The five strip tints:** `--strip-*` (Dev-116).
- **The EVAL-018 counts:** products 2 and enterprise 2.

## D. Exact implementation order

1. **Sync:** `git merge origin/m-009-redesign` (brief §1).
2. **Tracer bullet (the riskiest assumption):** can hand-authored SVG look like designed art at this bar, under 40 kB?
   - Author **RailCite's** scene.
   - Wire the SVG pipeline: manifest entry, README row, eval-021, `next/image` unoptimized.
   - Render it as the stage poster and the cover, then screenshot at 1440 and judge it against reference 2.
   - Only then continue.
3. **Paper materials:** the colour-free tear filter component, the three paper tiles and the shadow custom properties. Prove the filter on one layer, and confirm it never wraps the iframe.
4. **Stage:** the 4-layer stack, tape label, pin, the lettering band, the play-disc placement and the "coming" tag.
5. **Info sheet and strips:** the torn sheet, pin and tape, the hierarchy, serif strips and the case-study strip.
6. **Composition:** the compact intro, the sheet rising beside it and the band tucked under.
7. **Carousel:** the kraft band with torn ends, the arrow tabs, the band tag, 5:6 covers, the cream plate, tilts and the selected state.
8. **The other eleven scenes** in the shared grammar, including TeachSpark's SVG counterpart.
9. **Enterprise:** the layered seam and spacing, the dossier cards and the one-line heading.
10. **Responsive:** at 768 and 390, fewer layers (no backing rotation, no doodle, no under-layer rim on phones), the mobile order and no overflow.
11. **Clean-up:** delete the dead scene CSS, the `scene` field, unused glyphs and the webp; add the Design.md §11 rows.
12. **Gates, then review:** typecheck, lint, tokens, unit, build, the full e2e (all four projects) and the bundle budget. Then the §31 review loop (at most four rounds), the after screenshots and the report.
