# TASK-121 · Portfolio visual rectification: comparison and plan (spec §13)

Inputs: `docs/redesign-mockups/m-009/tushar-2026-09-28/portfolio-rectify-spec.md`, `portfolio-current.png` (the TASK-116 build), `portfolio-reference-1.png` (the scrapbook product-review composition) and `portfolio-reference-2.png` (the full-page target).

Scope: visual execution only. The TASK-116 structure, data model, IA, tabs pattern, media state machine, deep link and the new-tab behaviour for external links all stay as they are.

## Comparison

### 1. Where the page still looks like standard web UI
- **Product panel:** plain text sitting straight on the page background, with no paper under it. The navy code chip and the full operational status line read like a dashboard header.
- **Action strips:** one short strip per row inside a flex-wrap, without the full-width stacked "strip list" rhythm of the references. The case-study link is a standard underlined web link.
- **Carousel:** a rounded kraft *rectangle* with a flat `box-shadow`. The heading row is a UI toolbar ("SELECT A PRODUCT … 1 / 11 (‹)(›)"), and the arrows are glossy round buttons with a hard offset shadow.
- **Enterprise section:** a standard card grid (a border plus a double top rule).

### 2. Where paper layering is missing
- **Media stage:** one ivory tear with a single kraft sheet peeking out. There is no cream mid-layer, no doodles, and no overlap with anything else.
- **Info panel:** no sheet, no back sheet, no fastener.
- **Carousel strip:** does not tuck under the stage or panel. Its covers do not overhang its edges.
- **Section seam:** a single torn edge. Reference 2 shows a kraft band that bleeds into a torn, pale dossier sheet.

### 3. Where geometry is too clean
- **Rotation:** everything sits at 0°. The stage, panel, covers and tape are all square to the grid.
- **Covers:** identical rectangles with 2 px navy borders and 3 px radii.
- **Strips:** every strip shares one clip-path.
- **Enterprise cards:** straight edges, with one identical folded corner on every card.

### 4. Where the product cards are too repetitive
- **Same template:** every cover uses the same layout: navy band, conic sunburst, lucide glyph, uppercase name and tagline box. Only the accent tint changes, so eleven "icon badges" read as one card type.
- **Proportions:** 3:4, which is taller and narrower than the references' ~4:5 covers. The name is tiny next to a big generic icon.
- **No art:** there is no hero picture. In reference 2, each cover is a painted scene (a robot with worksheets, a train, a CRT office, a wave, a globe, a mountain sunset) with title lettering over it.

### 5. Where the active product lacks emotional focus
- **Stage poster:** the enlarged icon badge (a speech-bubble glyph in a sunburst). It carries no story, and nothing says "classroom, worksheets, WhatsApp, helper".
- **No play button:** the play affordance is missing because no pitch video exists. A "Pitch video coming" tag sits there instead, so the focal point is a placeholder.
- **Panel competes:** the product name competes with a long grey status sentence set above it.

### 6. Where the enterprise cards are too compressed
- **Too much text:** each card carries a stamp, client, program, role, dates, summary, 2–3 workstream paragraphs, 4–6 tags and a source line. That is resume density.
- **Overflowing workstreams:** the workstream paragraphs make Pear and LifePoint cards much taller than the others, so the 3 × 2 grid looks ragged.
- **Late grid:** the 3-column grid only starts at 1100 px, so 1024 shows 2 columns.

### 7. How the references get their materiality
1. **Stacked papers:** kraft backing, then torn cream paper, then the picture, with every layer's edge visible.
2. **Small rotations:** each object sits at a different small angle (about ±0.2–1°).
3. **Fasteners with a job:** one fastener per object (pin, tape or clip), each doing visible work.
4. **Warm shadows:** diffuse and offset downwards; never black, never glossy.
5. **Painted art:** real pictures with strong value contrast and HTML lettering over them, so the art is the focal point.
6. **Distinct strips:** each colour strip has its own tear, its own tint and its own left icon block and right arrow.
7. **Physical carousel:** the covers sit on a torn kraft band that runs past the content edges; the selected cover rises and gets a pin.
8. **Tonal change:** the enterprise section changes paper (paler, quieter, no colour) instead of stacking another block in the same style.

## Correction plan (spec §14 order)

1. **Media stage.**
   - Three layers: a kraft back sheet (rotated +1°), a torn cream frame, then the screen at -0.2°.
   - Tape plus a pin; one small doodle burst; a warm diffuse `drop-shadow`.
   - The poster becomes the product's **painted cover art** (object-fit cover, 16:9 crop), with the name and tagline lettered in HTML over the calm upper third.
   - The play button stays only when a real video exists (it is a real control). Otherwise a small torn "Pitch film in the edit" tag on the frame edge replaces the grey badge in the middle.
   - A focal play *disc* never appears as a dead button.
2. **Product sheet.**
   - The panel becomes its own torn ivory sheet at +0.4°: a back sheet, a push-pin at the top, a warm shadow and one tiny doodle.
   - Hierarchy: tiny metadata (`TS-01 · LIVE PILOT · TWILIO SANDBOX`, derived from the status label, never removed), then the name, then the tagline in italic serif, then a 2-line description, then the full-width stacked strips.
   - Each strip has its own tint, a left icon block, a small right arrow and its own clip-path.
   - The case-study link becomes a small torn "Read the case study →" paper tab.
3. **Covers.**
   - Covers are 4:5, with a painted art layer (one image per product).
   - Laid over the art: an HTML title wordmark with a per-product type treatment, a code tag (`TS-01`) and a cover-line plate at the bottom.
   - Inside the frame: a thin ivory printed border and a halftone overlay. The cover sits at a small per-card rotation (±0.6°).
   - Products without art get a designed CSS cover in the same packaging system: a per-product two-tone gradient sky, a large illustrative glyph mark and the same plate, so the system is shared but each cover is distinct.
4. **Strip and selection.**
   - The carousel sits on a torn kraft band: a clip-path tear top and bottom, full-bleed past the container, tucked under the stage.
   - Selected = a 7 px rise, a stronger shadow, a hand-drawn navy sketch outline, a pin on top and a marker swipe under the plate. `aria-selected` is unchanged.
   - The arrows become torn paper chips.
   - The header reads "Select a product" plus a small "PLAYER SELECT · 01 / 11".
5. **Layering and overlap:** the strip tucks under the stage (a negative margin). The panel's back sheet and the stage's kraft sheet overlap their neighbours. Covers overhang the band.
6. **Separation:** more space before enterprise, and the kraft band runs into a torn seam onto a paler dossier paper.
7. **Enterprise:**
   - 3 columns from 1024; tighter cards.
   - The workstreams become a compact name-only list (each name is a sub-project). Their detail is kept in the data, as a `title` on nothing; it is simply not shown on the card. The summary and tags stay.
   - The source line is demoted.
   - A paperclip and a neutral "CASE FILE 0N" stamp (no factual claim) stay, with a restrained tear and no bright colour.
   - No "Open case file →": there is still no destination.
8. **Textures:** warm shadows from `color-mix(navy/terracotta)` tokens, the existing grain tokens, and halftone on the covers only.
9. **Responsive:**
   - 390: media → sheet → strips → swipeable covers (~1.7 visible) → stacked case files.
   - Fewer decorative layers on small screens (no doodles, no back-sheet rotation).
   - No page overflow.
10. **Polish:** compare the 1440 capture against reference 2 and fix the biggest gaps.

## Artwork plan
- **Budget:** 17.65 credits available; cap 14.
- **Tracer first:** one TeachSpark image in two cheap models (`gpt_image_2_5` low at 0.25, `z_image` at 0.15). Keep the one that holds the painted-90s-cover style, then batch the other ten in that model.
- **Format:** 4:3 art, text-free, with the subject in the lower two-thirds. It crops to 4:5 for the cover and to 16:9 for the stage. Title lettering is always HTML.
- **Delivery:** WebP at about 960 px wide and about ≤ 60 kB each, under `public/media/illustrations/covers/`, served through `next/image`. Each is registered in the illustration manifest and README with an `Illustration of …` alt (EVAL-021).
- **Accessibility:** the stage poster gets the real alt. Carousel covers stay decorative, because the tab carries the name.

## Content honesty
- **Descriptions:** 2 lines at most, built only from each project's existing `tagline`. That field is already one sentence, so it is kept as is. No invented claims.
- **Status:** kept, but demoted to a micro label, derived by upper-casing the existing `statusLabel`. Long caveats (TeachSpark's "uptime after 2026-09-09 unverified") are shortened to a `short` label in `data/portfolio.ts`, and the full sentence is kept in the `title` / case study.
- **Velora is not a beauty product.** In `data/projects.ts` it is "Nuptis → Velora", two vendor-onboarding products (Velora = apparel sourcing). The spec's "beauty / routine" direction for Velora is a false assumption, so the Velora cover shows vendor onboarding / apparel sourcing, not beauty.
- **Vendor Passport:** not in the repo, so it is not added. This is a question for Tushar.
