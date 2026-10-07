# M-011 source spec — "Tushar Paper World" (Tushar's prompt, 2026-10-06, verbatim)

> Provenance: pasted by Tushar on 2026-10-06 with: "I want to change the structure of images that you have
> generated. Right now its flat paper cut images even in the portfolio and certification image scenes it shows
> blank canvas." His decisions on scope/approvals are recorded in `decisions.md` (S31–S34). Read by section; the
> section numbers below are the ones every M-011 brief cites.

I'd turn this into a **single global "Tushar Paper World" design system** rather than treating the paper-cut effect as an individual component.

# Global Visual System — "Tushar Paper World"

```text
You are redesigning the entire portfolio around a cohesive visual system called:

TUSHAR PAPER WORLD

The website should feel like an interactive physical paper diorama that has been transformed into a digital product portfolio.

The core idea:

DIGITAL PRODUCT DESIGN × ORIGAMI × PAPER CUTOUT × 3D DEPTH × PARALLAX

Every visual element must feel like it belongs to the same physical paper universe.

Do NOT treat paper-cut as an isolated decoration.

Paper is the fundamental visual language of the entire website.

============================================================
01. CORE DESIGN PRINCIPLE
============================================================

The website should feel as if:

A designer physically built an entire miniature world from paper,
cardboard, kraft paper, origami folds and layered cutouts,
then turned that physical world into an interactive digital portfolio.

The visitor should feel:

"I am navigating through Tushar's physical paper world."

Every section should therefore share:

- the same material language
- the same lighting direction
- the same paper textures
- the same depth system
- the same shadow system
- the same color palette
- the same interaction physics
- the same parallax behavior

Consistency is more important than adding more decoration.

============================================================
02. GLOBAL MATERIAL SYSTEM
============================================================

Define a small set of physical materials.

MATERIAL 01 — BACKGROUND PAPER

Use for:

- page backgrounds
- section backgrounds
- large empty areas

Characteristics:

- warm ivory
- subtle paper fibers
- matte
- slightly imperfect
- almost flat

Suggested:

#F5EBDD

------------------------------------------------------------

MATERIAL 02 — CREAM PAPER

Use for:

- cards
- labels
- foreground cutouts
- borders
- paper sheets

Color:

#F0E2C8

Characteristics:

- handmade paper
- slightly fibrous
- warm
- irregular edges

------------------------------------------------------------

MATERIAL 03 — KRAFT PAPER

Use for:

- illustrations
- cursor
- objects
- architectural elements
- folded structures

Color:

#C88A52

Characteristics:

- recycled cardboard
- visible fibers
- natural grain
- matte
- subtle tonal variation

------------------------------------------------------------

MATERIAL 04 — TERRACOTTA PAPER

Use for:

- major sections
- visual anchors
- large paper waves
- accent surfaces

Colors:

#96381F
#A94728
#B9532D

------------------------------------------------------------

MATERIAL 05 — DARK PAPER

Use only for:

- paper thickness
- inner shadows
- structural edges
- depth layers

Color:

#6D321E

Never use pure black for paper.

============================================================
03. GLOBAL LIGHTING SYSTEM
============================================================

ALL paper objects must use the SAME light source.

Light source:

UPPER LEFT

Approximately:

45° from upper-left.

Therefore:

TOP-LEFT EDGES
→ slightly brighter

BOTTOM-RIGHT EDGES
→ slightly darker

SHADOWS
→ cast toward bottom-right

This rule must apply to:

- cards
- buttons
- illustrations
- cursor
- icons
- paper waves
- origami objects
- section decorations
- hero illustrations

Never mix lighting directions between components.

This is critical to making the website feel like one physical world.

============================================================
04. GLOBAL PAPER DEPTH SYSTEM
============================================================

Every visual component must use physical depth.

Define these standard layers:

LEVEL 0
Flat background

LEVEL 1
Background paper decoration

LEVEL 2
Secondary paper layers

LEVEL 3
Primary content layer

LEVEL 4
Raised paper elements

LEVEL 5
Foreground paper elements

LEVEL 6
Micro-detail layer

The deeper the object appears physically,
the stronger its shadow and parallax movement.

============================================================
05. STANDARD PAPER ELEVATION
============================================================

Use consistent elevation levels.

PAPER-0

Completely flat.

Shadow:
none / extremely subtle

Parallax:
0.00

------------------------------------------------------------

PAPER-1

Slightly raised.

Shadow:
2–4px

Parallax:
0.05

------------------------------------------------------------

PAPER-2

Card-like layer.

Shadow:
4–8px

Parallax:
0.12

------------------------------------------------------------

PAPER-3

Strongly raised paper.

Shadow:
8–14px

Parallax:
0.22

------------------------------------------------------------

PAPER-4

Foreground paper object.

Shadow:
12–22px

Parallax:
0.40

------------------------------------------------------------

PAPER-5

Hero foreground object.

Shadow:
18–30px

Parallax:
0.60

============================================================
06. GLOBAL PARALLAX SYSTEM
============================================================

The entire website must support two forms of parallax.

DESKTOP:

Mouse movement + scroll

MOBILE:

Device orientation / gyroscope + scroll

The effect should be subtle.

The visitor should feel that the paper world has physical depth.

It should NOT feel like a gimmicky 3D website.

------------------------------------------------------------

DESKTOP MOUSE PARALLAX

Track pointer movement.

Map mouse position to:

approximately:

-12px → +12px

for normal layers.

Foreground layers may move:

-25px → +25px

Never move the entire website aggressively.

------------------------------------------------------------

MOBILE DEVICE PARALLAX

Use DeviceOrientation where available.

Map tilt to subtle movement.

Suggested maximum:

background:
2px

midground:
5px

hero:
9px

foreground:
14px

micro details:
18px

Use interpolation / spring smoothing.

Never directly map raw accelerometer values.

The movement should feel:

slow
soft
physical
springy

============================================================
07. PARALLAX LAYER ARCHITECTURE
============================================================

Every major illustration must be designed as a layered scene.

Example:

scene/
├── background
├── atmosphere
├── distant
├── midground
├── hero
├── foreground
└── details

Each layer should be independently movable.

If generating image assets, create them with transparent backgrounds whenever possible.

Never flatten a complex parallax scene into a single image when the visual requires depth.

============================================================
08. PAPER CARD SYSTEM
============================================================

All cards should look like physical paper cards.

A card consists of:

BACKGROUND PAPER
↓
DARK PAPER SIDEWALL
↓
MAIN CARD
↓
OPTIONAL CONTENT CUTOUT

Cards should have:

- subtle texture
- visible thickness
- irregular paper edge
- soft shadow
- small layer offset

Cards should NOT look like:

- glassmorphism
- conventional SaaS cards
- neumorphism
- plastic
- glossy UI panels

------------------------------------------------------------

HOVER EFFECT

Desktop:

card lifts slightly.

Movement:

translateY(-4px)

Depth:

+4–8px

Shadow:

slightly stronger

Optional:

internal paper layer moves 1–2px.

The effect should resemble physically lifting a paper card.

============================================================
09. BUTTON SYSTEM
============================================================

Buttons should look like small pieces of paper or cardstock.

Normal:

flat paper

Hover:

slightly raised

Active:

pressed downward

Interaction:

NORMAL
↓
HOVER
paper rises

CLICK
paper compresses

RELEASE
paper returns

Do NOT use conventional glowing button effects.

============================================================
10. PAPER-CUT ICON SYSTEM
============================================================

Icons should also belong to the paper world.

Avoid generic flat icon sets where possible.

Create icons as:

- folded paper symbols
- cardboard cutouts
- paper tokens
- tiny embossed paper objects

Use simplified geometry.

Every icon should have:

- paper texture
- edge thickness
- tiny shadow

============================================================
11. GLOBAL CURSOR
============================================================

Use the previously defined cardboard cursor.

The cursor should be:

- kraft cardboard
- cream torn-paper border
- dark paper sidewall
- subtle shadow
- slight 3D extrusion

Desktop only.

Hide native cursor.

The cursor should respond to:

mousemove
hover
click

------------------------------------------------------------

CURSOR PHYSICS

Normal:

scale: 1

Hover:

scale: 1.08

Click:

scale: 0.88

Release:

spring back to 1

Cursor movement:

smooth lerp / spring

Never directly snap the image to the mouse.

------------------------------------------------------------

INTERACTIVE STATES

Normal:
paper cursor

Link:
cursor slightly lifts

Button:
cursor becomes slightly smaller and closer to target

Project card:
cursor rotates 2–4°

External link:
cursor may display subtle paper-layer separation

============================================================
12. GLOBAL ORIGAMI ILLUSTRATION SYSTEM
============================================================

All major illustrations should be constructed like miniature origami scenes.

Use:

- folded paper
- geometric cuts
- overlapping sheets
- accordion folds
- triangular folds
- paper tabs
- raised pieces

Avoid overly realistic objects.

For example:

A mountain should look like folded paper.

A tree should look like layered paper.

A building should look like folded cardstock.

A wave should look like curved paper strips.

A person/character should look like assembled paper shapes.

A vehicle should look like folded cardboard.

============================================================
13. HERO SCENE SYSTEM
============================================================

Each major portfolio section may have a hero paper scene.

Structure:

BACKGROUND
↓
DISTANT ENVIRONMENT
↓
MIDGROUND
↓
PRIMARY SUBJECT
↓
FOREGROUND
↓
MICRO DETAILS

The primary subject should occupy:

30–45%

of the visual composition.

Maintain large negative space.

============================================================
14. SECTION TRANSITIONS
============================================================

Section transitions should not be simple empty gaps.

Use paper-world transitions.

Examples:

- torn paper edge
- folded sheet
- paper wave
- accordion fold
- overlapping paper strips
- large origami object
- paper landscape

Transitions should visually connect one section to the next.

Avoid excessive transitions.

One strong transition is better than many small decorations.

============================================================
15. PAPER WAVES
============================================================

When using waves:

Never use realistic water.

Create layered paper waves.

Each wave:

- separate paper layer
- different color
- visible thickness
- cream edge
- subtle shadow
- different amplitude

Foreground waves move faster during parallax.

Background waves move slower.

============================================================
16. TYPOGRAPHY
============================================================

Typography must contrast with the handmade paper.

Use two primary families.

DISPLAY:

Elegant editorial serif.

Possible:

Canela
Instrument Serif
Cormorant Garamond
DM Serif Display
Playfair Display

BODY:

Modern neutral sans-serif.

Possible:

Inter
Manrope
DM Sans
Satoshi
Neue Montreal

------------------------------------------------------------

Typography itself should NOT become excessively decorative.

The paper world provides personality.

Typography provides clarity.

============================================================
17. HANDWRITTEN ACCENT
============================================================

Use handwritten typography sparingly.

Use it for:

- personal notes
- annotations
- tiny captions
- signature
- design observations

It should feel like handwriting written directly onto paper.

Do not use handwritten fonts for primary navigation or body copy.

============================================================
18. EDITORIAL ANNOTATIONS
============================================================

Introduce occasional design annotations inspired by:

- engineering notes
- design drafts
- production marks
- handwritten observations
- paper labels

Examples:

DRAFT
ITERATION 03
SHIPPED
IN PROGRESS
FIELD NOTE
OBSERVATION
SYSTEM 01

Use these sparingly.

They reinforce the idea that the website represents a working product designer's notebook.

============================================================
19. PROJECT CARDS
============================================================

Project cards should behave like physical paper artifacts.

Each project can have:

- paper title strip
- folded corner
- miniature origami illustration
- project metadata
- small paper tag
- subtle depth

On hover:

paper card lifts.

Illustration moves slightly independently.

Text remains relatively stable.

This creates internal parallax.

============================================================
20. PROJECT IMAGE PARALLAX
============================================================

Images inside cards should have their own depth.

Structure:

CARD
↓
IMAGE FRAME
↓
IMAGE
↓
FOREGROUND OBJECT

When the card moves:

card:
small movement

image:
slightly larger movement

foreground:
largest movement

This creates a miniature diorama inside each project card.

============================================================
21. ABOUT SECTION
============================================================

The About section should feel like opening a paper notebook.

Possible elements:

- paper sheets
- folded profile card
- handwritten notes
- small origami objects
- timeline represented as paper strips
- skill labels as paper tabs

Avoid a conventional profile-card layout.

============================================================
22. EXPERIENCE TIMELINE
============================================================

Represent career experience as a physical paper timeline.

Example:

paper strip
│
├── 2016
│
├── 2022
│
├── 2026
│
└── NOW

Each role can be represented by a small raised paper card.

Cards should physically attach to the timeline.

Timeline should have subtle parallax.

============================================================
23. SKILLS SECTION
============================================================

Skills should NOT become a standard grid of pills.

Use:

- paper tags
- folded labels
- paper strips
- stacked cards
- small paper tabs

Group them by:

PRODUCT
AI
CLOUD
DELIVERY
DESIGN
TECHNOLOGY

Each category can exist on a different paper layer.

============================================================
24. CONTACT SECTION
============================================================

The existing terracotta ocean footer becomes the final scene of the website.

Use:

terracotta paper background

+

layered paper waves

+

fully visible origami/cardboard sailboat

+

paper contact cards

+

paper social buttons

The sailboat belongs to the same material system as the rest of the website.

It should have:

- kraft hull
- cream origami sails
- visible folds
- paper thickness
- subtle shadow

The entire sailboat must remain visible.

Never crop the mast or sails.

============================================================
25. RESPONSIVE BEHAVIOR
============================================================

Desktop:

Mouse parallax
+
scroll parallax

Tablet:

Reduced mouse/parallax movement

Mobile:

Device orientation
+
scroll parallax

If DeviceOrientation is unavailable:

fallback to:

scroll
+
touch movement

If motion preference is:

prefers-reduced-motion: reduce

disable dynamic parallax and provide a beautiful static composition.

============================================================
26. PERFORMANCE
============================================================

The paper world must NOT destroy website performance.

Use:

- transform
- translate3d
- requestAnimationFrame
- CSS variables
- GPU-friendly animations

Avoid continuously modifying:

- top
- left
- width
- height

Use transform instead.

Do not animate expensive filters continuously.

Use compressed WebP/AVIF where appropriate.

Lazy-load large illustrations.

Do not load every parallax layer immediately.

============================================================
27. PARALLAX IMPLEMENTATION
============================================================

Create a reusable component:

PaperParallaxScene

API concept:

<PaperParallaxScene
  layers={[
    { depth: 0.05, src: background },
    { depth: 0.12, src: distant },
    { depth: 0.22, src: midground },
    { depth: 0.35, src: hero },
    { depth: 0.55, src: foreground }
  ]}
/>

The component should support:

desktop mouse movement

mobile DeviceOrientation

scroll-based movement

reduced-motion fallback

spring smoothing

automatic cleanup

============================================================
28. DEVICE ORIENTATION
============================================================

Do not request motion permissions immediately.

On supported mobile browsers:

provide a subtle interaction prompt such as:

"Move your phone to explore"

Only request permission after user interaction where required.

If permission is denied:

silently fall back to scroll/touch.

Do not block navigation.

============================================================
29. MOTION PHYSICS
============================================================

Use smooth interpolation.

Never make the scene shake.

Recommended conceptual model:

target position
↓
spring interpolation
↓
rendered position

Use damping.

The movement should feel like:

a stack of physical paper floating slightly behind one another.

Not:

a 3D game.

============================================================
30. SCROLL PARALLAX
============================================================

Scroll should influence vertical depth.

Background:

very small movement

Midground:

moderate movement

Hero:

slightly stronger

Foreground:

stronger

Avoid excessive scroll-jacking.

Never hijack native page scrolling.

Use scroll position only as an enhancement.

============================================================
31. IMAGE GENERATION STANDARD
============================================================

Every generated illustration must follow these requirements:

- origami / paper-cut construction
- visible paper thickness
- tactile paper texture
- layered composition
- multiple depth planes
- consistent upper-left lighting
- transparent background when appropriate
- no text unless explicitly requested
- no watermark
- no unnecessary objects
- no glossy 3D
- no plastic
- no photorealistic CGI

Each complex illustration should be designed so it can be separated into:

background
midground
hero
foreground

for interactive parallax.

============================================================
32. ASSET NAMING
============================================================

Use predictable names.

Example:

hero-home-bg.webp
hero-home-mid.webp
hero-home-subject.webp
hero-home-fg.webp

project-ai-bg.webp
project-ai-mid.webp
project-ai-hero.webp
project-ai-fg.webp

about-bg.webp
about-mid.webp
about-hero.webp

contact-bg.webp
contact-waves.webp
contact-boat.webp
contact-fg.webp

cursor-cardboard.webp

============================================================
33. GLOBAL VISUAL CONSISTENCY CHECK
============================================================

Before adding any new visual element ask:

1. Does this look like physical paper?

2. Does it use the global material palette?

3. Does it follow the upper-left lighting direction?

4. Does it have meaningful physical depth?

5. Can it participate in the parallax system?

6. Does its shadow match the global shadow system?

7. Does it belong to the same paper world?

8. Does it improve the storytelling?

If the answer is NO to multiple questions:

do not add the element.

============================================================
34. AVOID DESIGN DRIFT
============================================================

Never introduce unrelated styles such as:

- glassmorphism
- neon gradients
- cyberpunk
- glossy 3D
- metallic UI
- generic SaaS dashboards
- random cartoon illustrations
- unrelated icon styles
- excessive brutalism
- unrelated photographic treatments

The portfolio should feel like ONE WORLD.

============================================================
35. CORE PHILOSOPHY
============================================================

The website should communicate:

"I don't just present products.

I build worlds around problems,
cut through complexity,
and turn ideas into things people can use."

The paper metaphor represents:

CRAFT
+
CURIOSITY
+
ITERATION
+
DEPTH
+
BUILDING

The interaction system reinforces this.

The visitor doesn't simply scroll through a portfolio.

They physically explore it.

============================================================
FINAL DESIGN STANDARD
============================================================

The final website should feel like:

A sophisticated editorial portfolio built from a miniature
origami-paper universe.

At first glance:

beautiful.

At second glance:

tactile.

At third interaction:

deeply interactive.

When the user moves their mouse:

the paper world subtly shifts.

When the user tilts their phone:

the layers separate naturally.

When the user scrolls:

the paper landscape moves at different depths.

When the user hovers a card:

the card physically lifts.

When the user clicks:

the paper compresses.

The result should feel less like a website
and more like:

"an interactive paper object."

This is the global visual language for the entire portfolio.
```

## The most important architectural change

I would make **parallax a shared primitive**, not something implemented separately on every section:

```text
                    PAPER WORLD
                         │
              ┌──────────┴──────────┐
              │                     │
        Material System        Motion System
              │                     │
       ┌──────┼──────┐        ┌─────┼─────┐
       │      │      │        │     │     │
     Paper  Kraft  Terra     Mouse  Gyro Scroll
       │      │      │        │     │     │
       └──────┼──────┘        └─────┼─────┘
              │                     │
              └──────────┬──────────┘
                         │
                 PaperParallaxScene
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
    Home Hero         Projects          Contact
       │                 │                 │
   Origami scene    Paper cards      Ocean scene
```

That way, **every new visual you add automatically inherits the same depth, lighting, material and motion language** instead of Claude creating a slightly different paper effect every time.

For your portfolio, I would also make **the cursor, cards, section dividers, project illustrations, About scene, experience timeline, and final sailboat scene all use this same depth-token system**. That is what will make the site feel like a genuinely designed visual identity rather than just a website with paper textures.
