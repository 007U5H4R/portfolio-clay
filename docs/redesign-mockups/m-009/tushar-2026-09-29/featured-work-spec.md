# Home Featured Work redesign (Tushar, 2026-09-29, verbatim)

Ticket: TASK-133. Reference: `featured-work-reference.jpg`, Tushar's AI mockup. Its layout and mood are the target, but some of its copy is NOT supported by the data (see the brief).

---

I want you to redesign ONLY the **Featured Work** section on the Home page.

- Do NOT redesign the rest of the homepage.
- Do NOT change the overall site navigation.
- Do NOT change the underlying product data unless required to support this section.

The Featured Work section should showcase exactly these 3 products:

1. RailCite
2. Slag City
3. Campfire Board

Remove TeachSpark from Featured Work.

## 1. CORE GOAL

The section should feel like a curated editorial showcase of three products.

It should communicate:

- strong product thinking
- different problem spaces
- visual craft
- evidence
- shipping/building ability

The design should feel:

- premium
- tactile
- paper-cutout
- editorial
- memorable
- compact
- not cluttered

The section should NOT feel like:

- three standard cards
- a generic project grid
- a SaaS feature section
- a portfolio gallery with identical tiles

## 2. SECTION COPY

Use:

- EYEBROW: FEATURED WORK
- HEADLINE: **Real problems. Real products.**
- SUBLINE: **Three products that show how I turn ambiguity into something people can actually use.**

Keep this compact.

Do not add another paragraph below it.

## 3. DESKTOP LAYOUT

Use an asymmetric editorial layout.

- LEFT: RailCite as the large anchor project.
- RIGHT: Slag City on top. Campfire Board below.

Concept:

```
┌───────────────────────────────────────────────┐
│ FEATURED WORK                                 │
│ Real problems. Real products.                 │
│ short subline                                 │
│                                               │
│ ┌───────────────────────┐ ┌────────────────┐ │
│ │                       │ │   SLAG CITY    │ │
│ │      RAILCITE         │ │   visual       │ │
│ │      large card       │ │   Explore →    │ │
│ │                       │ └────────────────┘ │
│ │                       │ ┌────────────────┐ │
│ │                       │ │ CAMPFIRE BOARD │ │
│ │                       │ │ visual         │ │
│ │                       │ │ Explore →      │ │
│ └───────────────────────┘ └────────────────┘ │
└───────────────────────────────────────────────┘
```

Desktop proportions:

- RailCite: ~58–62% width
- Right column: ~38–42% width
- Right cards: equal or near-equal height.

## 4. RAILCITE — FEATURED ANCHOR CARD

RailCite should be the largest card.

Use a custom visual identity based on:

- railway field notebook
- Indian Railways circulars
- documents
- citation
- evidence
- trust
- tracks
- station maps
- vintage railway imagery

Do NOT use only a screenshot.

Create a richer editorial composition.

Include:

**RailCite**

Tagline: **Research on track.**

Short proof points:

- **5,760** documents indexed
- **0** invented citations

Only include these if they are already supported by the existing source data.

CTA: **Explore case study →**

Do not add long body copy.

Optional one-line description: **A trust-first assistant for citing the right railway rule without inventing authority.**

Keep it concise.

## 5. RAILCITE VISUAL COMPOSITION

Inside the RailCite card use:

- large train/railway illustration or product visual
- circular/document fragment
- railway map/track element
- torn-paper layering
- muted rust/terracotta circle
- navy / cream / railway red accents
- one or two small evidence-paper fragments

Do not overcrowd.

The artwork should occupy roughly 55–65% of the card.

Text should remain readable and calm.

## 6. SLAG CITY CARD

Use: **Slag City**

Do NOT invent product claims if the project data does not support them.

If a current tagline/description exists in the codebase, reuse it.

If no verified tagline exists, show only:

- product name
- category / theme if known
- artwork
- Explore CTA

Visual direction:

- industrial
- foundry / plant / city / steel / slag
- muted charcoal
- rust
- ochre
- industrial blue
- layered map / factory / infrastructure visuals

The artwork should feel product-specific and not generic.

CTA: **Explore →**

## 7. CAMPFIRE BOARD CARD

Use: **Campfire Board**

Do NOT invent product claims if unsupported.

If existing product data contains a tagline/description, reuse it.

If not, show:

- product name
- artwork
- Explore CTA

Visual direction:

- collaborative planning
- shared ideas
- campfire
- whiteboard / sticky notes
- chairs / gathering
- planning / momentum

Use:

- warm orange
- forest green
- navy
- cream
- paper-note elements

Keep it sophisticated, not cartoonish.

CTA: **Explore →**

## 8. IMPORTANT CONTENT RULE

Do NOT invent the following for Slag City or Campfire Board:

- metrics
- user counts
- product outcomes
- project descriptions
- dates
- categories
- taglines

Inspect the existing product data first.

If data exists: use it.

If it does not: use minimal verified presentation rather than filling gaps.

## 9. PAPER / MATERIAL SYSTEM

Use the established portfolio paper language:

- warm cream background
- ripped paper edges
- paper layering
- soft natural shadows
- subtle texture
- terracotta
- deep navy
- muted greens
- tactile imperfections

Do not use:

- glassmorphism
- dark card UI
- neon effects
- glossy SaaS cards

## 10. CONTROLLED ASYMMETRY

- RailCite card: slight rotation around -0.2deg to -0.4deg
- Slag City: +0.2deg to +0.5deg
- Campfire Board: -0.2deg to +0.2deg

Keep rotations subtle.

The section should feel crafted, not messy.

## 11. NO IDENTICAL CARD TEMPLATES

The three cards should share:

- typography
- CTA style
- paper material
- spacing system

But should NOT share:

- identical internal artwork
- identical metric placement
- identical composition
- identical visual metaphor

Each product should feel distinct.

## 12. CTA BEHAVIOR — VERY IMPORTANT

Every Explore CTA must open the **Portfolio tab**.

Do NOT open:

- individual case study page
- modal
- drawer
- external URL

The CTA should navigate to the Portfolio page and select/focus the relevant product.

Preferred behavior:

- RailCite: `/projects?product=railcite`
- Slag City: `/projects?product=slag-city`
- Campfire Board: `/projects?product=campfire-board`

If the visible nav label is Portfolio but the existing route remains `/projects`, preserve the existing route.

Do NOT rename the route unless necessary.

## 13. SELECTED PRODUCT STATE AFTER NAVIGATION

When the user clicks "Explore case study →" or "Explore →", the Portfolio page should open with that product already selected in the product carousel.

Example:

```
click RailCite
↓
navigate to:
/projects?product=railcite
↓
Portfolio page loads
↓
RailCite becomes active product
↓
left media stage shows RailCite pitch/default media
↓
carousel highlights RailCite
```

Do the same for Slag City and Campfire Board.

## 14. QUERY PARAMETER HANDLING

Use the existing query-parameter system if already implemented.

If the Portfolio page already supports `?product=...`, reuse it.

Do not create a second routing mechanism.

If invalid/missing product parameter: fallback to the default featured/first product.

## 15. CTA COMPONENT

Use a consistent CTA treatment: terracotta torn-paper button.

Text:

- RailCite: **Explore case study →**
- Slag City: **Explore →**
- Campfire Board: **Explore →**

Hover:

- translateY(-1px)
- slightly stronger shadow
- arrow moves right 3px

Do not scale aggressively.

## 16. SECTION HEIGHT

Keep the section compact.

Desktop target: ~700–850px including heading.

Do not let Featured Work become a full standalone page.

It should give enough visual interest to make people click Portfolio.

## 17. MOBILE LAYOUT

On mobile, stack:

```
RailCite
↓
Slag City
↓
Campfire Board
```

RailCite can remain visually larger.

Keep artwork responsive.

Do not crop essential product information.

CTA remains visible on each card.

## 18. TABLET

Tablet can use:

```
RailCite full width
↓
Slag City + Campfire Board side-by-side
```

or stacked if width is insufficient.

Choose based on actual breakpoint readability.

## 19. IMAGE / ASSET STRATEGY

If existing artwork is weak: create or replace local assets.

Possible:

- SVG compositions
- layered paper illustrations
- custom product hero artwork

Do not rely on generic icons only.

Use real product screenshots only where they improve the composition.

## 20. RAILCITE ART PRIORITY

RailCite should visually be the strongest of the three because it is the anchor project.

Give it:

- richer collage
- stronger evidence presentation
- more visual depth

But do not make it so dominant that the right column feels secondary/unimportant.

## 21. SECTION SPACING

Suggested:

- top padding: 80–100px
- heading → cards: 32–44px
- card gap: 20–28px
- bottom padding: 80–100px

Avoid large unused space.

## 22. REMOVE OLD FEATURED WORK CONTENT

Remove TeachSpark from Featured Work.

Remove Nuptis → Velora if it is currently shown in this section.

Do not remove them from the Portfolio page unless separately instructed.

Featured Work should show only:

- RailCite
- Slag City
- Campfire Board

## 23. SOURCE DATA

Before editing: identify where Featured Work products are configured.

Prefer a data structure such as:

```
const featuredProducts = [
  'railcite',
  'slag-city',
  'campfire-board'
];
```

Do not duplicate product content manually if the master product dataset already exists.

Reuse existing:

- title
- tagline
- verified metrics
- routes
- artwork paths

## 24. ACCESSIBILITY

Each card CTA must be a real link.

Use meaningful aria labels:

- `Explore RailCite in Portfolio`
- `Explore Slag City in Portfolio`
- `Explore Campfire Board in Portfolio`

Ensure:

- keyboard focus
- visible focus state
- contrast
- correct link semantics

## 25. OPTIONAL ENTRANCE MOTION

On viewport entry:

- heading: fade + slight translateY
- RailCite: fade + translateY 10px
- Slag City: fade + translateX 10px
- Campfire Board: fade + translateX 10px

Keep stagger subtle.

No looping motion.

Respect reduced-motion settings.

## 26. DO NOT DO

Do NOT:

- show TeachSpark here
- show Nuptis/Velora here
- add more than 3 featured products
- add long case-study copy
- create generic equal cards
- make all visuals use same layout
- invent Slag City/Campfire Board metrics
- open individual case-study routes from Explore
- open new tabs
- use external links
- break Portfolio query-param selection
- redesign unrelated Home sections

## 27. BEFORE IMPLEMENTATION

Before changing code:

1. locate the Featured Work component
2. inspect current product data source
3. inspect Portfolio query-param behavior
4. identify RailCite / Slag City / Campfire Board product IDs
5. identify existing artwork for each
6. identify existing metrics/taglines
7. verify no unsupported copy is introduced
8. present a short implementation plan

Then implement.

## 28. AFTER IMPLEMENTATION

Verify:

- Featured Work contains exactly 3 products
- TeachSpark is removed
- RailCite is largest
- Slag City appears top-right
- Campfire Board appears bottom-right
- visual identities differ
- section remains compact
- Explore RailCite opens Portfolio with RailCite selected
- Explore Slag City opens Portfolio with Slag City selected
- Explore Campfire Board opens Portfolio with Campfire Board selected
- no CTA opens a separate case-study page
- query parameter is preserved
- mobile works
- no horizontal overflow
- no unsupported facts were added

Finally summarize:

1. files changed
2. Featured Work data source
3. card layout
4. product-art approach
5. Explore routing behavior
6. query-param handling
7. responsive behavior
8. any missing source content for Slag City / Campfire Board
