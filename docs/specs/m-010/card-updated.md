# Tushar Pathak — Paper-Cut Digital Business Card
## Design + Interaction + Implementation Specification

> **Goal:** Replace the conventional metallic business-card concept with a premium **3D paper-cut / layered papercraft digital business card** that feels native to Tushar's existing portfolio visual language.
>
> The card should feel like a physical miniature paper artwork sitting on the page—not a flat UI component with a paper texture applied to it.

---

# 1. Core Concept

Create an interactive digital business card for **Tushar Pathak**, an **AI Product Manager / Product Owner / Builder**.

The card is inspired by **Variant 2 — Nature / Landscape**:

- Warm
- Organic
- Personal
- Crafted
- Premium
- Slightly whimsical
- Editorial / tactile
- Clearly connected to the portfolio's paper-cut visual identity

The card should visually communicate:

> **Product × AI × Builder × Human**

The central visual metaphor is a **small layered paper landscape**.

The card should look as though someone physically cut multiple sheets of colored paper, stacked them at different depths, and photographed the result.

Do NOT make it look like:
- A generic SaaS card
- A neumorphic card
- A glassmorphism card
- A flat illustration
- A generic QR-code generator
- A conventional business-card template
- A 3D plastic card

It should look like a **premium piece of handmade paper artwork that happens to be interactive**.

---

# 2. Card Experience

The experience has two states:

### FRONT
The professional identity.

### BACK
The contact / QR / Wallet action layer.

The user should be able to rotate the card around its vertical axis.

Conceptually:

```text
                 FRONT
        ┌────────────────────┐
        │ TP                 │
        │                    │
        │ TUSHAR PATHAK      │
        │ AI PRODUCT MANAGER │
        │                    │
        │   paper landscape  │
        │  mountains + lake  │
        └────────────────────┘
                 ↻
                 │
                 ▼
                 BACK
        ┌────────────────────┐
        │       QR CODE      │
        │                    │
        │ Keep me in         │
        │ your pocket.       │
        │                    │
        │ Add to Apple Wallet│
        │                    │
        │ Email              │
        │ LinkedIn            │
        │ Portfolio           │
        │ GitHub              │
        └────────────────────┘
```

---

# 3. FRONT — LIGHT MODE

## Visual direction

Use a warm off-white / ivory paper base.

The card should have:

- Warm cream paper background
- Multiple layered mountain silhouettes
- A small body of water
- A tiny sailboat
- A subtle sun / circular paper cutout
- Dark blue-grey and muted green paper layers
- Visible paper edges
- Soft physical shadows between layers
- Slight imperfections in paper edges
- No glossy gradients

### Suggested hierarchy

```text
┌──────────────────────────────┐
│                              │
│ TP                           │
│                              │
│                              │
│ TUSHAR PATHAK                │
│ AI PRODUCT MANAGER           │
│                              │
│                              │
│       layered mountains      │
│     ╱╲  ╱╲  ╱╲               │
│    ╱  ╲╱  ╲╱  ╲              │
│                              │
│ ~~~~~~~~~~~~~~~~~~~~~~~~~~~  │
│              ⛵              │
└──────────────────────────────┘
```

### Typography

Primary:

**TUSHAR PATHAK**

Secondary:

**AI PRODUCT MANAGER**

Optional micro-label:

**PRODUCT • AI • BUILDER**

Typography should be clean and modern.

Use a strong grotesk / geometric sans-serif for the main identity.

Avoid decorative handwritten fonts inside the card itself.

The paper artwork provides the personality.

---

# 4. FRONT — LANDSCAPE ART DIRECTION

The landscape is the signature element.

Build it from actual visual layers rather than a single flattened illustration.

Suggested layer stack:

```text
Layer 01 — Card paper
Layer 02 — distant sky
Layer 03 — distant mountains
Layer 04 — middle mountains
Layer 05 — foreground mountains
Layer 06 — shoreline
Layer 07 — water
Layer 08 — small sailboat
Layer 09 — sun / circular paper element
Layer 10 — typography
```

Each layer should have:

- Slight Z-depth
- Different shadow softness
- Slightly different paper grain
- Imperfect cut edges

The effect should resemble:

> handcrafted layered paper art photographed under soft studio lighting.

---

# 5. FRONT — MICRO-INTERACTION

When the cursor moves over the card:

### Parallax

Different layers move by different amounts.

Example:

```text
Mouse movement
      ↓

Sky                 1x
Distant mountains   2x
Middle mountains    4x
Foreground          6x
Boat                7x
Typography          2x
```

Keep the movement subtle.

The card should never feel like a game.

The interaction should communicate physical depth.

### Lighting

Add a very subtle simulated light source.

As the cursor moves:

- paper edges catch light
- shadows subtly shift
- the card's physical depth becomes more obvious

Do not add shiny glass reflections.

---

# 6. CARD PHYSICALITY

The card itself should have:

- Slightly rounded corners
- Very subtle paper thickness
- Visible edge layers
- Ambient shadow beneath the entire card
- Small imperfections
- Soft contact shadow
- Slight rotation while resting

Suggested resting transform:

```text
rotateX(1–2deg)
rotateY(-2–3deg)
rotateZ(-1deg)
```

The card should feel as though it is sitting on the portfolio page.

It should NOT appear perfectly aligned like a UI component.

---

# 7. CLICK / TAP INTERACTION

Clicking the card triggers the flip.

### Sequence

1. Card slightly lifts.
2. Shadow expands.
3. Card rotates around the Y axis.
4. Front disappears naturally during rotation.
5. Back becomes visible.
6. Card settles back down.
7. QR and actions become visually emphasized.

Suggested timing:

```text
Lift:       150–200ms
Flip:       700–900ms
Settle:     150–250ms
```

Use a physically believable easing curve.

Avoid a generic CSS `ease-in-out` feeling if a better spring / custom cubic-bezier can produce a more physical result.

---

# 8. BACK — LIGHT MODE

The back should continue the landscape language.

Base:

Warm ivory paper.

The QR should sit in a dedicated quiet area.

Suggested composition:

```text
┌──────────────────────────────┐
│                              │
│        ┌────────────┐        │
│        │            │        │
│        │  QR CODE   │        │
│        │            │        │
│        └────────────┘        │
│                              │
│      Keep me in your         │
│          pocket.             │
│                              │
│     [ Add to Apple Wallet ]  │
│                              │
│     ✉ Email                  │
│     in LinkedIn              │
│     ↗ Portfolio              │
│     ◉ GitHub                 │
│                              │
│          TP                  │
│     layered landscape        │
└──────────────────────────────┘
```

---

# 9. QR CODE DESIGN

The QR must remain genuinely scannable.

Do not sacrifice QR reliability for aesthetics.

### QR content

Use:

```text
https://yourdomain.com/card
```

Replace the domain with the actual production domain.

The QR should point to the digital-card landing page rather than directly encoding a vCard.

This allows the destination to:

- Detect device
- Present the appropriate action
- Track visits if analytics are enabled
- Update the destination without replacing printed artwork
- Provide Apple Wallet on supported devices
- Provide contact saving on other platforms

### QR visual treatment

The QR should:

- Have high contrast
- Have sufficient quiet zone
- Preserve finder patterns
- Avoid excessive paper texture inside the QR
- Avoid low-contrast colors
- Avoid overlapping decorative artwork
- Remain readable by modern smartphone cameras

A subtle paper frame around the QR is acceptable.

Do not distort the QR for artistic effect.

---

# 10. "KEEP ME IN YOUR POCKET"

Use this phrase as the emotional micro-copy:

> **Keep me in your pocket.**

This is preferable to simply saying:

> Digital Business Card

The phrase should feel personal and slightly playful without becoming cheesy.

Typography:

- Small
- Editorial
- Slightly separated from the QR
- Centered

Optional alternate:

> **Take me with you.**

But use **"Keep me in your pocket."** as the default.

---

# 11. APPLE WALLET ACTION

Include the official Apple **Add to Apple Wallet** badge / button for the production implementation.

Do NOT recreate Apple's badge from scratch if Apple's official badge asset is available.

The visual hierarchy should be:

```text
QR CODE

Keep me in your pocket.

[ Add to Apple Wallet ]

────────────────

Email
LinkedIn
Portfolio
GitHub
```

The Apple Wallet action should feel integrated into the paper composition while remaining recognizable and compliant with Apple's distribution requirements.

---

# 12. WALLET FLOW

The QR itself should NOT imply:

> Scan → automatically added to Apple Wallet.

Instead:

```text
QR
 ↓
/card
 ↓
Device detection
 ↓
iPhone / iPad
 ↓
Add to Apple Wallet
 ↓
Signed .pkpass
 ↓
Apple Wallet installation flow
```

For Android:

```text
QR
 ↓
/card
 ↓
Save Contact
```

For desktop:

```text
/card
 ↓
Scan QR with phone
```

---

# 13. ACTUAL APPLE WALLET PASS

The website card is the **visual experience**.

The Apple Wallet pass is the **functional artifact**.

Generate a real signed `.pkpass`.

The pass should be designed as a digital professional identity card.

Potential fields:

```text
TUSHAR PATHAK

AI PRODUCT MANAGER

Product • AI • Builder

Email
Phone
LinkedIn
Portfolio
GitHub
```

The Wallet pass may include a QR / barcode that resolves to:

```text
https://yourdomain.com/card
```

The Wallet pass should use artwork that is visually related to the website card.

Do not attempt to reproduce the full interactive 3D paper scene inside Apple Wallet.

Instead create a simplified, native Wallet-compatible version of the landscape.

---

# 14. SERVER-SIDE WALLET GENERATION

The `.pkpass` should be generated and signed server-side.

Never expose:

- Apple pass certificate
- private key
- signing credentials
- Pass Type ID secrets

in the browser.

Suggested architecture:

```text
Frontend
   │
   │ POST /api/wallet
   ▼
Backend
   │
   ├── Build pass.json
   ├── Add icons
   ├── Add background/strip artwork
   ├── Add contact fields
   ├── Add QR/barcode
   │
   ▼
Sign with Apple Pass Certificate
   │
   ▼
Generate .pkpass
   │
   ▼
Return application/vnd.apple.pkpass
```

---

# 15. BACK — DARK MODE

Dark mode should NOT simply invert the light-mode card.

Create a dedicated art direction.

Base:

- Deep charcoal paper
- Near-black paper layers
- Deep navy
- Desaturated forest green
- Warm off-white typography
- Muted cream moon/sun
- Slightly stronger paper-edge separation

Example:

```text
Dark sky
       ↓
deep navy mountain
       ↓
blue-grey mountain
       ↓
forest-green foreground
       ↓
dark water
       ↓
cream sailboat
```

The card should remain visibly paper-cut even in dark mode.

---

# 16. DARK MODE — QR

Use a high-contrast QR treatment.

Preferred:

- Warm ivory QR modules
- Dark charcoal QR background

OR

- White / ivory QR on a dedicated light paper panel

The QR must remain reliably scannable.

Never allow the QR to become low contrast simply because the site is in dark mode.

---

# 17. DARK MODE — TYPOGRAPHY

Use warm off-white instead of pure white where possible.

Example:

```text
TUSHAR PATHAK
AI PRODUCT MANAGER
```

should feel like ink printed on dark paper.

Avoid:

- neon
- glowing text
- excessive shadows
- metallic gradients

---

# 18. LIGHT ↔ DARK MODE

The card must respond to the portfolio's existing theme.

Light mode:

```text
warm paper
blue-grey mountains
muted green landscape
ivory background
```

Dark mode:

```text
charcoal paper
deep navy mountains
dark green landscape
cream highlights
```

Do not simply apply:

```css
filter: invert(...)
```

Create intentional theme-specific artwork.

---

# 19. PAPER MATERIAL SYSTEM

The entire card should use a consistent material language.

### Paper properties

Each layer can have:

- subtle grain
- slight fibers
- imperfect edge
- soft ambient occlusion
- contact shadow
- tiny tonal variations

The paper texture should remain subtle.

Avoid obvious repeating noise textures.

The viewer should feel:

> "This looks like paper."

not:

> "Someone added a paper texture."

---

# 20. EDGE DETAILS

One of the most important details.

The card should show that it has physical thickness.

At the edge:

```text
┌─────────────── top paper
│
│   thin shadow
│
│─────────────── second paper
│
│   thin shadow
│
└─────────────── backing
```

The edges can reveal multiple paper layers.

Use this especially on:

- mountains
- water
- card corners
- foreground shapes

---

# 21. HOVER STATE

Before clicking:

```text
Resting
   ↓
Hover
   ↓
Card lifts 4–8px
   ↓
Parallax increases slightly
   ↓
Paper shadows become visible
```

Optional micro-copy:

> **Click to flip**

But avoid permanently showing it.

It could appear subtly on first interaction.

---

# 22. MOBILE / TOUCH

The interaction must work without hover.

On touch:

```text
Tap card
 ↓
Lift
 ↓
Flip
```

Use touch movement to create very subtle parallax if appropriate.

Do not require:

- hover
- cursor
- mouse movement
- precise gestures

The card must remain completely usable on mobile.

---

# 23. ACCESSIBILITY

The interaction must not be purely visual.

Provide an accessible button / interactive element.

Example accessible label:

```text
Open Tushar Pathak digital business card
```

After flipping:

```text
Show Tushar Pathak contact and Apple Wallet options
```

Respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled:

- disable parallax
- disable dramatic 3D rotation
- use a short fade / crossfade
- retain all functionality

Keyboard:

```text
Enter / Space → flip card
Tab → QR / Wallet / contact links
```

Focus states must remain visible.

---

# 24. CARD DIMENSIONS

Design around a vertical business-card proportion.

Recommended aspect ratio:

```text
~1.6 : 1
```

Example:

```text
420 × 680
```

or:

```text
600 × 960
```

The physical proportions should remain consistent across responsive breakpoints.

Desktop:

```text
Card width ≈ 360–440px
```

Mobile:

```text
Card width ≈ 280–340px
```

Do not make it full-width on desktop.

The surrounding portfolio whitespace is important.

---

# 25. 3D SCENE

Place the card inside a small physical scene.

The card should appear to sit on:

- a large paper sheet
- a slightly different paper tone
- subtle layered torn-paper shapes

Optional:

- small paper shadow
- tiny paper fibers
- subtle decorative cutout shapes

The scene should connect directly with the rest of the portfolio.

---

# 26. PAGE-LEVEL INTERACTION

When the card is hovered:

- background paper layers can subtly respond
- card shadow changes
- card becomes slightly more prominent

When clicked:

```text
Page remains stable
       ↓
Card becomes the focal object
       ↓
Card lifts
       ↓
Card flips
```

Do not make the entire page rotate.

The interaction should feel like manipulating a physical card.

---

# 27. FLIP PHYSICS

Use realistic 3D perspective.

Recommended conceptual CSS:

```css
perspective: 1200px;
transform-style: preserve-3d;
backface-visibility: hidden;
```

The card should rotate around its vertical center axis.

Avoid:

- flat 2D swap
- instant content replacement
- excessive 360° rotation
- spinning like a game card

Target:

```text
0° → 90° → 180°
```

One clean rotation.

---

# 28. CARD SHADOW

Use multiple subtle shadow layers.

Example concept:

```text
Contact shadow:
tight + dark + low opacity

Ambient shadow:
large + soft + low opacity

Layer shadows:
tiny shadows between paper pieces
```

Avoid a single heavy `box-shadow`.

The goal is physical depth.

---

# 29. RESPONSIVE COMPOSITION

Desktop:

```text
ABOUT

          ┌─────────────┐
          │             │
          │ PAPER CARD  │
          │             │
          └─────────────┘

       Keep me in your pocket.
```

Mobile:

```text
ABOUT

     ┌───────────┐
     │           │
     │   CARD    │
     │           │
     └───────────┘

  Keep me in your pocket.
```

The card should remain the hero element.

Do not shrink the card until the text becomes unreadable.

---

# 30. CONTENT

Front:

```text
TP

TUSHAR PATHAK

AI PRODUCT MANAGER

PRODUCT • AI • BUILDER
```

Back:

```text
QR

Keep me in your pocket.

Add to Apple Wallet

Email
LinkedIn
Portfolio
GitHub

TP
```

Use actual links from the portfolio configuration.

Do not hardcode placeholder URLs in production.

---

# 31. ANALYTICS

If analytics already exist in the portfolio, track:

```text
card_view
card_hover
card_flip
qr_visible
wallet_click
email_click
linkedin_click
portfolio_click
github_click
```

Do not track QR scans directly unless the QR destination is instrumented.

For QR:

```text
/card?source=qr
```

or equivalent analytics attribution can be considered.

---

# 32. ERROR / FALLBACK STATES

If Apple Wallet is unavailable:

Show:

```text
Apple Wallet isn't available here.

[ Save Contact ]
```

If QR generation fails:

Do not render a broken / empty QR frame.

If `.pkpass` generation fails:

Show:

```text
Wallet card unavailable right now.

[ Save Contact ]
```

The rest of the card must remain functional.

---

# 33. PERFORMANCE

This interaction should feel premium without making the portfolio heavy.

Prioritize:

- optimized artwork
- WebP / AVIF where appropriate
- lazy loading
- GPU-friendly transforms
- transform/opacity animation
- avoid animating layout properties
- avoid expensive blur layers
- avoid huge textures

The card should maintain smooth animation on modern mobile devices.

Target:

```text
60 FPS where practical
```

Do not add effects simply because they look impressive in a screenshot.

Every effect should reinforce physical paper.

---

# 34. REDUCED MOTION

When:

```css
@media (prefers-reduced-motion: reduce)
```

use:

```text
No parallax
No 3D flip
No dramatic lift
No continuous animation
```

Replace with:

```text
Front ↔ Back crossfade
```

All functionality remains available.

---

# 35. VISUAL QUALITY BAR

The final result should feel closer to:

> **high-end editorial papercraft + interactive product design**

than:

> **portfolio UI component**

The visual benchmark is:

```text
Apple-level restraint
+
handmade paper craft
+
editorial composition
+
subtle physical animation
+
Tushar's portfolio personality
```

Avoid visual overdesign.

The landscape should be beautiful but quiet.

The typography should remain the primary identity.

---

# 36. GENERATIVE ART DIRECTION

If generating artwork with an image-generation system, use this direction:

> Premium handcrafted layered paper-cut landscape artwork for a digital professional business card. Warm ivory handmade paper background, multiple physically layered paper cut mountains in muted blue-grey and forest green, subtle body of water, tiny minimalist sailboat, small circular sun made from a separate paper layer, realistic paper fibers and cut edges, soft studio lighting, physically accurate contact shadows and ambient occlusion, editorial art direction, sophisticated Scandinavian/Japanese paper craft aesthetic, minimal composition, tactile depth, restrained color palette, no gradients, no plastic, no glass, no glossy 3D, no photorealistic landscape, isolated vertical business card composition, premium product photography feel.

For dark mode:

> Premium handcrafted dark layered paper-cut landscape artwork for a digital professional business card. Deep charcoal handmade paper background, layered deep navy, blue-grey and muted forest-green paper mountains, dark water, tiny cream sailboat, subtle warm ivory circular moon/sun paper layer, realistic paper fibers and cut edges, soft studio lighting, physically accurate contact shadows and ambient occlusion, sophisticated editorial papercraft aesthetic, minimal and premium, tactile depth, restrained palette, no gradients, no plastic, no glass, no neon, no glossy 3D, isolated vertical business card composition.

---

# 37. IMPORTANT — DO NOT CREATE A FLAT MOCKUP

The artwork must be designed as a system of layers wherever possible.

Prefer:

```text
SVG / transparent PNG / layered assets
```

over:

```text
single flattened JPG
```

This allows:

- parallax
- independent shadows
- theme variations
- responsive positioning
- interaction
- future animation

If a generated artwork is initially flattened, recreate / separate the important layers before implementing the final interaction.

---

# 38. IMPORTANT — PRESERVE THE EXISTING PORTFOLIO LANGUAGE

This card must look like it belongs to the existing portfolio.

Reuse the portfolio's:

- paper textures
- section-divider language
- torn-paper edges
- shadow vocabulary
- typography system
- light/dark behavior
- motion philosophy
- spacing rhythm

Do NOT introduce an unrelated visual design system just for the business card.

The card should feel like:

> **a physical object that escaped from the portfolio and can now travel with the visitor.**

---

# 39. EMOTIONAL MOMENT

After the user successfully adds the card to Apple Wallet, provide a very subtle confirmation.

Example:

```text
You're carrying a little piece of my portfolio now.
```

Or, more restrained:

```text
See you in your pocket.
```

Keep this optional and brief.

Do not interrupt the user with a large modal.

---



# 43. DEPTH SYSTEM — CORE REQUIREMENT

**Depth is a core part of the card's identity, not an optional visual enhancement.**

The card should feel like a **miniature paper diorama** rather than a flat illustration placed inside a card.

The intended progression is:

```text
First glance
→ Beautiful paper-cut business card

Hover
→ Physical card thickness becomes visible

Cursor movement
→ Individual paper layers reveal different Z-depths

Closer interaction
→ Shadows, lighting and parallax reinforce the physical construction

Click
→ The complete paper object lifts and flips as one coherent artifact
```

The depth system must combine:

- Physical card thickness
- Independent landscape Z-layers
- Layer-specific contact shadows
- Ambient occlusion
- Cursor/touch parallax
- Dynamic lighting
- Floating foreground elements
- Physically believable perspective
- Depth-aware 3D flip

---

# 44. PHYSICAL CARD THICKNESS

The card itself should have subtle physical thickness.

It should resemble several sheets of premium cardstock stacked together.

When tilted or flipped, reveal a thin layered edge rather than making the card look infinitely thin.

The thickness should remain restrained:

- No plastic-like thickness
- No wooden-block appearance
- No metallic extrusion
- No excessive bevel

The physical edge should become most visible when hovering, tilting, lifting, and beginning the flip.

---

# 45. LANDSCAPE Z-STACK

Build the landscape from independent layers rather than one flattened image.

Suggested conceptual stack:

```text
Z = 0       Card paper / sky
Z = 8       Sun / moon
Z = 12      Distant mountains
Z = 20      Secondary mountains
Z = 28      Middle landscape
Z = 36      Foreground mountains / shoreline
Z = 44      Water
Z = 52      Sailboat
Z = 60      Foreground decorative paper
```

These values are starting points, not literal production measurements. Tune visually.

The layers should feel like **tightly stacked sheets of paper with tiny physical gaps**.

---

# 46. LAYER-SPECIFIC SHADOWS

Every meaningful paper layer should have its own subtle shadow.

Use a combination of:

- **Contact shadow:** small and relatively sharp immediately beneath the paper edge.
- **Ambient shadow:** larger and softer, suggesting slight elevation.
- **Occlusion:** subtle darkening where one paper layer overlaps another.

Do not use one generic shadow for the entire artwork.

Vary opacity, blur, offset, and spread according to perceived depth.

---

# 47. MINIATURE PAPER DIORAMA

The primary visual target is:

> **A tiny handcrafted landscape diorama embedded inside the business card.**

Every major shape should feel physically cut and layered.

The viewer should feel that the landscape exists *inside* the card rather than being printed onto it.

Maintain an elegant, restrained composition. Depth should be discovered rather than shouted.

---

# 48. SAILBOAT — FLOATING FOREGROUND ELEMENT

The sailboat should sit slightly above the water layer instead of being printed directly into it.

Conceptually:

```text
             ⛵
            /│\
           / │ \
          /  │  \
─────────────┼────────────
~~~~~~~~~~~~~┼~~~~~~~~~~~~
          WATER
```

Give the boat a very subtle contact shadow on the water.

When the card tilts:

- The boat moves slightly with its foreground depth.
- Its shadow remains visually connected to the water.
- The relative depth becomes perceptible.

Do not animate the boat independently like a game object. Its motion must remain subordinate to the card's physical movement.

---

# 49. DEPTH PARALLAX

Cursor movement should reveal the Z hierarchy.

Suggested relative movement:

```text
Sky                 0.5×
Sun                 0.8×
Distant mountains   1×
Middle mountains    2×
Foreground          3×
Water               3.5×
Boat                4×
Front decoration    4.5×
```

The closer a layer is to the viewer, the more it responds.

Keep the total movement within a controlled visual envelope so layers never visibly detach from the artwork.

---

# 50. CARD-LEVEL TILT

The entire card should subtly respond to pointer position.

Conceptually:

```text
Cursor left  → slight left rotation
Cursor right → slight right rotation
Cursor up    → slight backward tilt
Cursor down  → slight forward tilt
```

Suggested maximum range:

```text
rotateX: ±4–6°
rotateY: ±4–6°
```

The movement should feel like gently moving a physical paper card beneath a camera, not a flashy 3D product-card effect.

---

# 51. DYNAMIC LIGHTING

Introduce a subtle virtual light source tied to pointer position.

As the pointer moves:

- Exposed paper edges catch slightly more light.
- Layer shadows shift subtly.
- Card depth becomes more apparent.

Keep the effect restrained.

Avoid glossy reflections, metallic highlights, neon lighting, lens flares, or dramatic spotlights.

The material must remain unmistakably paper.

---

# 52. COHERENT LIGHT DIRECTION

Use one coherent virtual light direction throughout the scene.

If the sun/moon is positioned in the upper-right:

```text
Light → upper-right
Highlights → upper-right
Shadows → lower-left
```

All paper layers should appear to exist in the same physical environment.

---

# 53. AMBIENT OCCLUSION

Where paper layers overlap, introduce subtle darkening to reinforce depth.

This may be achieved using CSS shadows, pseudo-elements, SVG filters, generated artwork shadows, or carefully controlled compositing.

The effect should be subconscious rather than visually obvious.

---

# 54. EDGE REVEAL

Depth should be particularly visible around:

- Mountain edges
- Shoreline
- Water edges
- Card perimeter
- Torn-paper shapes
- Sailboat
- Layer intersections

Use slightly darker paper edges and tiny contact shadows.

The result should resemble physically cut paper photographed under soft studio lighting.

---

# 55. DEPTH DURING CARD FLIP

The entire card must rotate as one physical object.

Correct behavior:

```text
Front layers
    ↓
Card lifts
    ↓
All layers rotate together
    ↓
90°
    ↓
Back becomes visible
    ↓
180°
    ↓
Back settles
```

Do **not** independently rotate every landscape layer around the Y-axis during the flip.

The card is one physical artifact; the internal landscape layers retain their local Z-depth relative to that artifact.

---

# 56. BACK-SIDE DEPTH

The back should use the same layered paper philosophy.

Suggested structure:

```text
Back paper
    ↓
Landscape edge decoration
    ↓
Raised QR paper panel
    ↓
QR code
    ↓
"Keep me in your pocket."
    ↓
Apple Wallet badge
    ↓
Contact links
```

The QR panel may sit slightly above the backing paper and have tiny paper thickness, subtle edge shadow, and a slight raised appearance.

---

# 57. RAISED QR PAPER PANEL

Create a dedicated paper layer behind the QR.

```text
┌──────────────────┐
│                  │
│     QR CODE      │
│                  │
└──────────────────┘
       ↑
Raised paper panel
```

The QR modules themselves must remain flat and machine-readable.

The **paper frame provides the depth**, not distortion of the QR.

Maintain high contrast, adequate quiet zone, reliable finder patterns, and no overlapping decorative elements.

---

# 58. LIGHT/DARK DEPTH SYSTEM

Light and dark modes must use the same depth architecture but different material palettes.

### Light mode

- Warm ivory base
- Blue-grey mountains
- Muted forest green
- Cream paper
- Soft charcoal shadows

### Dark mode

- Deep charcoal base
- Deep navy mountains
- Dark forest green
- Warm ivory highlights
- Soft near-black shadows

Do not simply invert the light-mode artwork.

The shadow hierarchy must remain visible in dark mode.

---

# 59. DEPTH PERFORMANCE

Use GPU-friendly properties wherever possible.

Prefer:

```css
transform
opacity
will-change: transform
transform-style: preserve-3d
perspective
```

Avoid continuously animating layout properties.

If dynamic lighting becomes expensive on mobile:

1. Preserve major static layer shadows.
2. Reduce dynamic lighting.
3. Reduce parallax amplitude.
4. Preserve the core physical-depth illusion.

Target smooth interaction on modern devices without sacrificing the rest of the portfolio.

---

# 60. MOBILE DEPTH

Mobile must retain the depth concept without depending on a cursor.

Possible interaction:

```text
Device motion available
        ↓
Subtle tilt response
```

If motion sensors are unavailable:

```text
Tap / touch
    ↓
Small tilt
    ↓
Return to neutral
```

Do not require motion sensors for core functionality.

The card must work perfectly without them.

---

# 61. REDUCED MOTION

When:

```css
prefers-reduced-motion: reduce
```

disable:

- Cursor parallax
- Card tilt
- Dynamic light movement
- Dramatic layer movement
- 3D flip

Retain static depth:

- Paper shadows
- Layer separation
- Card thickness
- Ambient occlusion
- Raised QR panel

Use a simple front/back transition instead.

---

# 62. DEPTH QUALITY TEST

Before shipping, verify:

### Static
Does the card look physically layered without animation?

### Hover
Can multiple Z-layers be perceived immediately?

### Cursor movement
Do foreground layers move more than background layers?

### Extreme cursor position
Do layers remain inside the artwork and avoid exposing empty gaps?

### Flip
Does the card remain one coherent physical object?

### Dark mode
Can the depth hierarchy still be distinguished?

### Mobile
Does depth remain convincing without hover?

### Reduced motion
Does the card still look physically layered?

---

# 63. DEPTH SUCCESS CRITERIA

The implementation passes the depth requirement only if:

- The card has visible but subtle physical thickness.
- Landscape elements are independently layered.
- Layer edges create real perceived depth.
- Major layers have appropriate contact/ambient shadows.
- Foreground layers respond more strongly to pointer movement.
- The sailboat appears slightly above the water.
- The boat shadow remains visually connected to the water.
- Card-level tilt feels physical rather than gimmicky.
- Lighting direction is coherent.
- The flip rotates the entire card as one object.
- The back also contains layered depth.
- Light and dark modes preserve the depth hierarchy.
- Reduced-motion mode preserves static depth.
- Mobile remains usable without hover.
- No effect makes the card feel like plastic, glass, metal, or a gaming UI.

---

# 64. FINAL DEPTH PRINCIPLE

The desired illusion is:

> **You are not looking at a picture of a paper landscape. You are looking into a tiny paper landscape.**

The final interaction should make the user subconsciously think:

> **"If I could reach into the screen, I could pick this card up."**

That is the quality bar for the 3D depth system.

# 40. FINAL EXPERIENCE

The ideal experience should feel like:

```text
User scrolls to About
        ↓
Sees a beautiful paper landscape card
        ↓
Moves cursor
        ↓
Paper layers subtly move
        ↓
Card feels physical
        ↓
User clicks
        ↓
Card lifts
        ↓
Card flips
        ↓
QR appears
        ↓
"Keep me in your pocket."
        ↓
Add to Apple Wallet
        ↓
Real .pkpass installation
        ↓
User leaves with Tushar's professional identity
```

The interaction should leave the user thinking:

> **"That was a business card, but it felt like a tiny piece of his product."**

---

# 41. IMPLEMENTATION PRINCIPLE

The depth system in Sections 43–64 is a **core implementation requirement**, not a decorative enhancement.

Do not optimize for:

> "How many effects can we add?"

Optimize for:

> **"How convincingly can this feel like a real paper object?"**

Every animation, shadow, texture, parallax effect, and transition should reinforce that single idea.

The final business card should be:

**Tactile.**
**Quiet.**
**Premium.**
**Personal.**
**Useful.**
**Memorable.**
** unmistakably Tushar.**
