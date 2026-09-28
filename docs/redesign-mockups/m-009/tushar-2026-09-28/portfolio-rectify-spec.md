# Portfolio page: rectify the visuals (Tushar, 2026-09-28, verbatim)

References in this folder:
- `portfolio-current.png`: the current generated implementation (TASK-116), which needs fixing.
- `portfolio-reference-1.png`: the scrapbook product-review composition (media frame, torn info sheet, colour action strips, kraft carousel strip).
- `portfolio-reference-2.png`: the full-page target (TeachSpark poster hero, pinned info sheet, 90s game-box covers on kraft, enterprise case files).

---

I want you to **rectify the current Portfolio page implementation**.

IMPORTANT:
- I am **not asking for a full rebuild from scratch**.
- The current implementation already has the right **overall structure**.
- What is wrong is mainly the **visual execution**, **materiality**, **card styling**, **layering**, and **hierarchy**.
- Your task is to **refine the current implementation so it matches the visual feel of the provided reference images much more closely**.

There are 3 visual states to compare:

1. **Current generated implementation** → this is the one that needs fixing.
2. **Reference image 1**
3. **Reference image 2**

Your goal is to keep the **current functionality and information architecture**, but **upgrade the visual system** so it feels like a **real tactile scrapbook / handcrafted paper portfolio**, not a standard web UI with paper textures.

## 1. HIGH-LEVEL DIAGNOSIS

The current implementation is **structurally correct** but visually still feels like:

- regular webpage sections
- rectangular UI blocks
- cards with paper textures applied on top
- a digital layout pretending to be paper

The references instead feel like:

- a **physical handcrafted portfolio**
- **layered torn paper**
- **objects placed on a desk/wall**
- **collectible visual artifacts**
- **intentional imperfection**
- **stronger depth and composition**
- **scrapbook first, UI second**

So the task is to correct the **visual language**, not to change the page logic.

## 2. CORE GOAL

Rectify the current Portfolio page so that:

- the **top product showcase** feels like a tactile **interactive scrapbook composition**
- the **bottom product carousel** feels like a row of **collectible 90s game-box product covers**
- the **right product panel** feels like a **separate ripped paper sheet**
- the **enterprise/client work section** feels like a **case-file / dossier section**
- the overall page has more **material realism**, **layering**, **overlap**, and **visual hierarchy**

Do **not** make it cluttered.
Do **not** over-decorate.
Do **not** break existing behavior.

## 3. WHAT TO PRESERVE

Preserve:

- current page structure
- current data model if already built
- product showcase concept
- pitch/demo/product/github/prd interaction model
- enterprise/client work section
- warm paper palette
- scrapbook direction
- general nav / route / layout logic

Do NOT preserve the current weak visual execution where it fails to match the references.

## 4. MOST IMPORTANT CORRECTION

The biggest problem right now is this:

> the current page looks like a normal website arranged in sections, whereas the references look like one **physical scrapbook composition**.

So your primary design correction should be:

### Make the top showcase feel like one crafted artifact.

That means:

- the large media panel
- the right-side info sheet
- the kraft-paper carousel strip
- the carousel cards
- the tape/pins/doodles/shadows

should all feel like they belong to **one physical scene**.

Right now they still feel too separate and too cleanly "web-like".

## 5. TOP PRODUCT SHOWCASE — SPECIFIC FIXES

### 5.1 Main media stage

The current main media stage is too flat and too placeholder-like.

#### Fix:
Turn it into a much more cinematic, emotional **hero media frame**.

It should look like:

- a real ripped-paper video frame
- layered on top of other paper pieces
- with visible depth
- with a proper poster image
- with strong emotional product art
- with a large centered play button
- with the product personality visible immediately

#### Required corrections:
- replace flat placeholder feeling with richer poster composition
- use **layered paper framing**
- make the media panel the main focal point
- make it larger and more emotionally engaging
- reduce the feeling of "graphic placeholder card"

#### Material stack concept:
- kraft-paper backing
- torn cream paper layer
- video/poster frame on top
- tape/pin accents
- subtle doodle strokes
- soft shadow

#### Do NOT:
- keep it looking like a standard bordered rectangle
- use overly clean geometry
- make it look like a UI mockup card

### 5.2 Media content

The active product should visually feel like a **real product poster / pitch film cover**, not a static diagram or placeholder panel.

For example, TeachSpark should feel like:

- WhatsApp
- classroom
- worksheets
- AI helper
- education energy
- warm, useful, human

Not a generic product icon board.

The active visual needs stronger storytelling.

### 5.3 Product info panel

The current right panel is too much like ordinary webpage content sitting on the background.

#### Fix:
It must become its own **independent ripped-paper information sheet**.

It should feel like:
- a torn note pinned next to the media
- slightly rotated
- with its own shadow
- clearly layered
- visually separate from the background

#### Must include:
- product code
- product name
- product tagline
- concise short description
- action strips/buttons

#### Styling:
- torn edges
- soft shadow
- slight paper rotation
- one corner taped or pinned
- tiny doodles / light personality details

#### Copy hierarchy:
1. product code / tiny metadata
2. product name
3. tagline
4. short product description
5. action stack

### 5.4 Remove operational status prominence

The current top line such as:

> Live pilot (Twilio sandbox) — uptime after 2026-09-09 unverified

is visually too operational and too prominent.

#### Fix:
Do NOT lead with this.

If needed, compress it into tiny metadata, such as:

- PILOT · WHATSAPP · 2026
- LIVE PILOT · TWILIO SANDBOX
- WHATSAPP · K–12 · INDIA

Keep it very small.

The product name must remain the hero.

### 5.5 Product description shortening

Descriptions are too web-copy-like.

#### Fix:
Keep them to **2–3 concise lines maximum**.

Example style:

**AI worksheets for teachers, delivered where they already work: WhatsApp.**

Optional second line:
Generate classroom-ready quizzes, worksheets, and papers in minutes.

Keep it crisp, not paragraph-heavy.

## 6. ACTION BUTTONS — SPECIFIC FIXES

The current action treatment is heading in the right direction but can be more tactile.

### Required:
Show these actions where available:

- Pitch Video
- Demo Video
- Product Link
- GitHub
- PRD

### Behavior:
- Pitch Video → plays in left media area
- Demo Video → plays in left media area
- Product Link → opens new tab
- GitHub → opens new tab
- PRD → opens new tab

### Visual style:
Each should look like a **torn paper strip**, not ordinary buttons.

### Suggested color accents:
- Pitch Video → muted coral / terracotta
- Demo Video → dusty blue
- Product Link → sage / mint
- GitHub → soft lavender
- PRD → warm yellow

### Add:
- icon on left
- subtle right arrow
- slight texture
- uneven torn lower/side edges
- hover lift
- hand-crafted feel

### Do NOT:
- make them look like standard SaaS buttons
- make them too uniform or machine-perfect

## 7. BOTTOM PRODUCT CAROUSEL — BIGGEST VISUAL REDESIGN

This is one of the most important fixes.

The current bottom cards still feel too repetitive and too much like narrow info cards.

They should instead feel like **collectible 90s game-box covers**.

### 7.1 Core correction

Do NOT keep the repeated "same-layout icon cards" approach.

Instead, every product should have:

- a shared **90s packaging system**
- but its own **distinct visual identity**

Each card should feel like a collectible cover.

### 7.2 Card visual direction

Think:
- SNES / Sega / arcade title cover
- retro packaging
- product logo as title art
- a strong hero visual
- faux game label / number
- print texture / halftone texture
- slightly aged printed surface

#### Important:
Do NOT copy real copyrighted packaging.

This should be inspired by the era, not derivative of a specific franchise.

### 7.3 Product-by-product visual identity

Every product cover should differ.

Examples:

#### TeachSpark
- WhatsApp
- classroom papers
- friendly AI helper
- teacher/worksheet mood
- navy + orange

#### RailCite
- train / rail
- citations / documents
- research / decision support
- teal + red / steel blue

#### Cubicle
- retro office monitor
- desk tools
- workflow / productivity
- orange + navy

#### Tegaki
- handwriting / note-taking
- Japanese stationery / brush / paper vibe
- indigo + cream + terracotta

#### Vendor Passport
- passport / globe / vendor movement
- green + mustard + travel/admin feel

#### Velora
- beauty / routine / elegance / aspiration
- soft violet / sunset palette

#### Nuptis / Bhakti Vilas / others
Give each one a unique cover identity based on the product theme.

### 7.4 Card proportions

The current cards are too tall and narrow.

#### Fix:
Use more collectible-cover-like ratios.

Preferred:
- aspect-ratio around **4:5**
or
- **5:6**

Do not make them skinny.

### 7.5 Carousel strip

The current backing is too rectangular.

#### Fix:
Place the covers on one long **torn kraft-paper strip**.

This strip should feel like:
- a paper band
- slightly irregular
- layered over the page
- physically anchoring the product covers

The carousel should read as one physical shelf/strip.

### 7.6 Selected card state

The selected product must feel clearly chosen.

#### Required selected state:
- slight rise (6–8px)
- stronger paper shadow
- hand-drawn border or sketch outline
- tiny pushpin/tape/doodle accent
- optional underline/marker swipe

Do NOT rely only on a clean border change.

### 7.7 Carousel arrows

Replace overly modern UI arrows.

Use:
- torn-paper arrow pieces
- hand-cut nav buttons
- subtle scrapbook controls

Keep them minimal.

Do not use glossy or highly modern circular controls unless they have been paper-styled very carefully.

### 7.8 Product selector header

You may keep:

**SELECT A PRODUCT**

but make it slightly more crafted.

Also add a small indicator such as:

- 01 / 11
or
- PLAYER SELECT · 01 / 11

Keep it subtle.

Do NOT turn the entire carousel into a full gamer interface.

## 8. IMPROVE MATERIALITY AND PHYSICALITY

This is a major priority.

Right now the geometry is too perfect.

### 8.1 Add controlled irregularity

Introduce small intentional imperfections:

- media stage rotate: around -0.2deg
- info sheet rotate: around +0.4deg
- product cards: vary between roughly -0.6deg and +0.6deg
- tape pieces slightly angled
- torn edges non-uniform
- overlaps between elements
- hand-drawn lines with slight irregularity

#### Important:
Do not exaggerate.
It should feel crafted, not chaotic.

### 8.2 Use overlap

Current layout still feels too boxed into zones.

#### Fix:
Add more gentle overlap between:
- media frame and backing paper
- info panel and its shadow/back sheet
- carousel cards and kraft strip
- section dividers and surrounding scraps

Not too much, but enough to feel physical.

### 8.3 Shadow treatment

Use softer natural paper shadows.

Avoid:
- heavy drop-shadow web-card look
- harsh black shadow
- floating glossy-card depth

Use:
- diffuse
- warm
- paper-on-paper shadows

## 9. OVERALL HIERARCHY FIXES

The top section should read in this order:

1. Portfolio heading
2. main active product media stage
3. right-side product sheet
4. product carousel
5. enterprise section

Right now, too many things compete equally.

### Fix:
Make the active product experience more dominant.

The page should immediately feel like:

> "Pick a product → watch the pitch → explore the build"

## 10. SECTION SEPARATION

The enterprise section currently begins too quickly after the carousel.

### Fix:
Give more breathing room below the product showcase.

Add a clear chapter transition using:

- torn paper seam
- ripped horizontal divider
- change in paper texture
- slight narrative pause

Do NOT just stack the next section immediately below like a standard webpage block.

## 11. ENTERPRISE & CLIENT WORK — CORRECTIONS

The enterprise section is directionally right, but it is too compressed and too horizontally crowded.

### 11.1 Grid structure

Do NOT place too many narrow cards in one row.

#### Preferred desktop layout:
3 columns × 2 rows

This will give each enterprise card room to breathe.

### 11.2 Visual style

This section should be **quieter and more dossier-like**.

It must NOT inherit the 90s game-cover treatment.

Instead use:
- case-file cards
- dossier paper
- subtle stamps
- paperclip accents
- restrained paper tears
- technical tags
- small client icon/logo only if appropriate

### 11.3 Card content

Each card should contain:
- client name
- short subtitle
- 1–2 sentence summary
- grouped sub-projects where relevant
- 4–6 tags
- optional "Open case file →" if there is a real destination

Do not make these feel like miniature resumes.

They should feel like compact case files.

### 11.4 Enterprise visual rhythm

Keep these cards:
- more neutral
- more structured
- less colorful
- more technical
- more restrained

This contrast with Section 1 is intentional.

## 12. WHAT NOT TO DO

Do NOT:

- rebuild the page as a totally different information architecture
- remove the current product/enterprise split
- use standard UI cards with only textured backgrounds
- keep the repeated circular-icon product card system
- overload the page with too many stickers/doodles
- make the page childish
- make the page chaotic
- make enterprise cards playful like game cards
- overuse text
- keep operational metadata highly prominent
- use neon retro-gaming aesthetics
- use glassmorphism
- use a dark gamer UI
- turn the layout into a generic SaaS dashboard

## 13. BEFORE YOU CHANGE CODE

Before editing, do a deliberate comparison between:

- the current generated implementation
- reference image 1
- reference image 2

Explicitly analyze:

1. where the current implementation still looks like standard web UI
2. where paper layering is missing
3. where geometry is too clean/perfect
4. where the product cards are too repetitive
5. where the active product experience lacks emotional focus
6. where enterprise cards are too compressed
7. how the references achieve stronger materiality

Then present a concise correction plan.

Only after that, implement.

## 14. IMPLEMENTATION PRIORITY ORDER

Make changes in this order:

1. Fix top media panel materiality
2. Fix right-side product sheet
3. Redesign product carousel cards
4. Improve carousel strip and selected state
5. Improve overall layering/overlap
6. Increase separation before enterprise section
7. Reflow enterprise cards into stronger grid
8. Refine textures, shadows, and imperfect details
9. Review responsiveness
10. Final polish

## 15. RESPONSIVE BEHAVIOR

Do not break responsive layout while making these corrections.

### Desktop
- full expressive scrapbook composition

### Tablet
- keep top section usable
- stack only if necessary
- preserve visual identity

### Mobile
- media
- info sheet
- action strips
- swipeable carousel
- enterprise case-file stack

On mobile, reduce decorative layers if needed, but keep the visual system intact.

## 16. ACCESSIBILITY

While rectifying the visuals, preserve:

- keyboard accessibility
- focus states
- semantic buttons/links
- visible selected state
- video accessibility
- responsive readability
- reduced motion support

Do not sacrifice usability for visual style.

## 17. AFTER IMPLEMENTATION

After making corrections, verify:

### Product showcase
- active product media feels like a real hero poster
- product info sheet feels like a separate torn-paper object
- descriptions are concise
- action strips feel tactile
- product covers feel like collectible 90s game-box covers
- each product has a distinct identity
- carousel strip feels physical
- selected card is clearly highlighted
- overall top section feels like one scrapbook composition

### Enterprise section
- cards have breathing room
- section feels distinct from product showcase
- 3-column grid works
- cards feel like dossiers/case files
- no visual clutter

### General
- hierarchy is stronger
- materiality is improved
- page feels less like web UI and more like an interactive paper portfolio
- responsiveness still works
- no accessibility regressions

Finally summarize:
1. What was visually wrong before
2. What you changed
3. Which parts were structurally preserved
4. How you improved materiality
5. How you improved the carousel cards
6. How you improved the enterprise section
7. Any compromises made
