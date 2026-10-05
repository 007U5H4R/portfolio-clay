# Portfolio page: high-effort visual correction pass (Tushar, 2026-09-28, verbatim)

Ticket: TASK-127. Images in this folder:
- `portfolio-current-railcite.png`: the current generated implementation (RailCite selected), which needs fixing.
- `portfolio-reference-1.png`: reference image 1 (scrapbook product-review composition).
- `portfolio-reference-2.png`: reference image 2 (the full-page target).

---

You are doing a HIGH-EFFORT VISUAL CORRECTION PASS on the current Portfolio page.

IMPORTANT:
Do NOT aim for "acceptable".
Aim for **reference-quality visual fidelity**.

If the current visual foundations are weak, replace them rather than polishing them.

You have:
1. the current generated Portfolio implementation
2. reference image 1
3. reference image 2

The current implementation is structurally acceptable but visually underperforms the references.

This task has TWO PHASES.

## PHASE 1 — VISUAL AUDIT ONLY

Do NOT modify code yet.

First, compare the current implementation against both supplied references.

I want a precise diagnosis of WHY the current result still feels like:

"a regular web page with paper styling"

instead of:

"an interactive handcrafted paper portfolio".

Analyze the following dimensions separately:

1. composition
2. visual hierarchy
3. materiality
4. layering
5. paper treatment
6. artwork richness
7. product-cover individuality
8. carousel proportions
9. active-media presentation
10. product-info-sheet styling
11. enterprise-section density
12. spacing
13. controlled imperfection
14. shadows/depth
15. emotional impact

For each dimension, state:

- CURRENT: What the existing implementation is doing.
- REFERENCE: What the reference images are doing differently.
- CORRECTION: Exactly what must change.

Do not give generic feedback like "add more shadows" or "make it more scrapbook-like".

Be specific.

Examples of the level of specificity I expect:

- "The active poster uses one flat visual plane, while the reference uses three paper layers with offset edges."
- "The carousel cards reuse the same icon-centric composition, whereas the reference treats each card as independent cover art."
- "The enterprise cards are too narrow because five are compressed into one row; the reference gives each artifact more breathing room."

At the end of Phase 1, provide:

- A. the 10 most important corrections
- B. which current assets should be replaced entirely
- C. which current components can be preserved
- D. the exact implementation order

Then STOP.

Do not modify the page until Phase 2.

## PHASE 2 — IMPLEMENT AFTER AUDIT

Once the audit is complete, implement the corrections below.

Do NOT reinterpret the information architecture.

Preserve this macro structure:

```
PORTFOLIO INTRO
↓
ACTIVE PRODUCT SHOWCASE
↓
PRODUCT CAROUSEL
↓
ENTERPRISE & CLIENT WORK
```

The problem is visual execution, not structure.

## 1. CORE VISUAL PRINCIPLE

The final page must look like:

A REAL PAPER PORTFOLIO THAT BECAME INTERACTIVE.

Not:

A WEBSITE WITH PAPER TEXTURES.

Every major object should feel physical:

- poster
- sheet
- note
- cover
- tape
- paper strip
- dossier
- scrapbook artifact

## 2. ACTIVE PRODUCT SHOWCASE

The entire top showcase must read as ONE handcrafted composition.

It should not feel like:

```
media block
+
text block
+
carousel block
```

stacked independently.

Instead it should feel like one physical portfolio spread.

Use:

- LEFT: large cinematic active media
- RIGHT: independent ripped-paper product sheet
- BOTTOM: long torn kraft-paper selector strip

These elements should visually overlap and belong to the same scene.

## 3. ACTIVE MEDIA — REBUILD VISUALLY

The left media stage is currently too flat.

Rebuild it so it feels like a premium pitch-film poster.

Target: 16:9

Visual stack:

```
kraft / backing paper
↓
dark or colored torn underlayer
↓
cream torn mat
↓
poster/video surface
```

Add:

- natural irregular edges
- subtle rotation
- paper shadow
- one small tape label
- restrained doodle accents

The media area must become the strongest visual object on the page.

## 4. ACTIVE PRODUCT ART MUST BE REAL ART

Do NOT rely on:

- flat gradients
- one central icon
- generic placeholder graphic
- repeated template

Each active product should have actual poster art.

Examples:

- TeachSpark
  - teacher/classroom atmosphere
  - worksheets
  - WhatsApp
  - approachable AI helper
  - warm practical energy
- RailCite
  - rail/track metaphor
  - research/citation/documentation
  - trust/correctness
  - strong visual storytelling
- Cubicle
  - retro office/workstation
  - systems/workflow
  - productivity
- Tegaki
  - handwriting
  - stationery
  - Japanese-inspired graphic language
  - paper/ink
- Vendor Passport
  - passport
  - globe
  - vendors
  - movement/identity
- Velora
  - aspirational routine/lifestyle
  - elegant colors
  - softer editorial visual

Do not use one visual system with different icons only.

## 5. CREATE ASSETS IF NECESSARY

If current assets are not good enough:

REPLACE THEM.

Create new local assets.

Possible:

- /public/portfolio/posters/
- /public/portfolio/covers/
- /public/portfolio/decor/

Use:

- SVG
- React SVG components
- layered compositions
- custom illustration assets

Do not stop at CSS gradients if proper cover/poster artwork is required.

## 6. RIGHT PRODUCT INFO SHEET

The right panel must stop looking like normal page text.

Turn it into a physical ripped-paper sheet.

Use:

- irregular torn silhouette
- subtle +0.3deg to +0.8deg rotation
- soft shadow
- one taped or pinned corner
- tiny doodle marks if useful

Hierarchy:

```
product code / tiny metadata
↓
product name
↓
tagline
↓
2–3 line description
↓
action strips
```

## 7. REMOVE OPERATIONAL COPY FROM HERO POSITION

Do not lead with text like:

"Live pilot ... uptime unverified"

Move such information to tiny metadata.

Example:

PILOT · WHATSAPP · 2026

The product name and value proposition must dominate.

## 8. ACTION STACK

Show these when available:

- Pitch Video
- Demo Video
- Product Link
- GitHub
- PRD

Style each as a torn paper strip.

Suggested accents:

- Pitch — terracotta
- Demo — dusty blue
- Product — sage
- GitHub — lavender
- PRD — warm yellow

Each strip:

- icon
- label
- optional helper text
- arrow
- torn edges
- slight shadow

Do not make them look like standard SaaS buttons.

## 9. ACTION BEHAVIOR

- Pitch Video → play in LEFT media stage
- Demo Video → play in SAME LEFT media stage
- Product Link → new tab
- GitHub → new tab
- PRD → new tab

Preserve current functionality.

## 10. PRODUCT CAROUSEL — COMPLETE VISUAL REWORK

The current carousel is still too templated.

Replace the repeated icon-card look.

Each product should feel like:

a collectible 1990s game cover.

Shared packaging grammar: YES.

Repeated artwork: NO.

## 11. PRODUCT COVER SYSTEM

Each cover should include:

- product code
- product title/logo
- hero art
- short tagline
- tiny badge/detail
- print texture

Use approx:

aspect-ratio: 4 / 5 or 5 / 6

Show approximately: 5–6 cards on desktop.

Do NOT use very tall skinny cards.

## 12. PER-PRODUCT ART DIRECTION

Create distinct cover art:

- TeachSpark: AI classroom / worksheet / WhatsApp
- RailCite: train / citation / research
- Cubicle: retro office / workstation
- Tegaki: handwritten notes / ink / stationery
- Vendor Passport: passport / globe / vendor identity
- Velora: beauty/routine/lifestyle
- Nuptis: wedding operations / florals / coordination
- Bhakti Vilas: devotional / music / calm spirituality

Each must feel visually different.

## 13. CAROUSEL BACKING STRIP

Use one continuous torn kraft-paper strip.

Cards sit ON TOP of the strip.

Do not put cards inside a normal web container.

The kraft strip should visually connect the carousel into one physical object.

## 14. SELECTED PRODUCT STATE

Selected card:

- lift 6–10px
- stronger paper shadow
- hand-drawn border
- optional tape/pin accent
- subtle scribble/underline

Do NOT communicate selection only with a clean outline.

## 15. CAROUSEL CONTROLS

Replace generic UI arrows with:

- hand-cut torn-paper arrow tabs
- or crafted paper controls

Keep them usable but visually integrated.

## 16. CONTROLLED IMPERFECTION

Introduce slight rotations.

Suggested ranges:

- media: -0.2deg to -0.5deg
- info sheet: +0.3deg to +0.8deg
- carousel cards: -0.8deg to +0.8deg
- tape: slightly angled
- paper edges: non-uniform

Do NOT make it messy.

The objective is: crafted, not chaotic.

## 17. SHADOWS

Use warm paper-on-paper shadows.

Avoid:

- dark UI-card shadows
- glossy floating-card effects
- exaggerated depth

Use subtle layered depth.

## 18. OVERLAP

The current implementation is too cleanly separated.

Add gentle overlap between:

- poster and backing layers
- info sheet and adjacent papers
- covers and kraft strip
- tape and paper
- section transition elements

Use 8–18px type overlaps where appropriate.

## 19. PAGE INTRO

Keep:

PORTFOLIO

Products I've built, tested, and shipped.

Pick one. Watch the pitch. Open the demo. Explore the build.

Do not make the intro overly large.

The active product showcase should dominate.

## 20. ENTERPRISE TRANSITION

The enterprise section currently starts too abruptly.

Add significantly more vertical breathing room.

Use a physical chapter break:

- torn-paper seam
- layered page edge
- subtle material transition

It should visually say:

```
OWNED PRODUCTS
↓
ENTERPRISE SYSTEMS
```

without needing giant text.

## 21. ENTERPRISE SECTION LAYOUT

Do NOT compress enterprise cards into one narrow row.

Use:

- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

Allow two rows.

Cards should have real breathing room.

## 22. ENTERPRISE SECTION VISUAL LANGUAGE

Enterprise cards should feel like:

case files / dossiers

NOT:

retro game cards

Use:

- off-white paper
- dossier edge
- paperclip
- small stamp
- technical/domain tags
- quiet shadows
- restrained typography

Keep the section more mature and structured.

## 23. ENTERPRISE CARD CONTENT

Each card:

- client
- program title
- short summary
- sub-projects if relevant
- technical/domain tags

Do not make them miniature résumés.

Do not overfill.

## 24. ENTERPRISE GROUPING

Keep these grouped case files:

- Pear Health Labs
- Mojix
- Google Cloud — HMLE
- Telus Health / LifeWorks
- LifePoint Health
- Indiana University Health

Do not merge Google HMLE with IU Health.

## 25. MATERIALITY TARGET

The final page should visibly include:

- layered torn sheets
- kraft paper
- mixed paper textures
- small tape pieces
- occasional pins
- subtle paper grain
- imperfect edges
- small rotations
- soft depth

BUT:

Do NOT decorate every object.

Use restraint.

## 26. VISUAL DENSITY

Reference images feel rich because major objects are strong.

Do NOT create richness by adding many small things.

Prefer:

fewer, larger, better-designed objects.

## 27. WHAT MUST BE REPLACED IF STILL WEAK

If the following still look template-like, replace them:

- pitch poster artwork
- carousel cover artwork
- repeated icon circles
- flat gradient panels
- generic paper rectangles

Do not preserve weak assets simply because they already exist.

## 28. DO NOT DO THESE THINGS

Do NOT:

- turn the page into dark retro gaming
- add neon
- add arcade chrome
- use glassmorphism
- create overly pixelated UI
- use generic web cards
- overuse stickers
- add more explanatory copy to solve visual weakness
- repeat one cover template for every product
- squeeze enterprise cards
- rebuild the entire application architecture

## 29. RESPONSIVE

- Desktop: full composition
- Tablet: preserve feel; stack only if necessary
- Mobile:

```
media
↓
info sheet
↓
actions
↓
horizontal swipe carousel
↓
enterprise cards
```

Reduce nonessential decorative layers on mobile.

## 30. FUNCTIONALITY MUST REMAIN INTACT

Do not break:

- product selection
- video switching
- YouTube/Vimeo embedding
- links
- PRD links
- keyboard navigation
- mobile carousel
- analytics
- accessibility

This is a visual quality pass.

## 31. FINAL INTERNAL REVIEW BEFORE STOPPING

Before considering the work finished, compare the result again with both references.

Ask yourself:

1. Does this still look like standard UI with paper styling?
2. Are the posters actual designed artworks?
3. Do the covers feel collectible?
4. Does each product have its own identity?
5. Does the info sheet feel physically separate?
6. Does the top feel like one composed scrapbook spread?
7. Is Section 2 spacious and mature?
8. Is there controlled imperfection?
9. Is material depth visible?
10. Does the current page feel significantly closer to the references?

If the answer to #1 is still yes: KEEP REFINING.

Do not stop at the first acceptable result.

## 32. FINAL REPORT

Report:

1. visual problems found
2. components preserved
3. assets replaced
4. new assets created
5. poster changes
6. carousel changes
7. materiality/layering changes
8. enterprise changes
9. responsive changes
10. remaining limitations
