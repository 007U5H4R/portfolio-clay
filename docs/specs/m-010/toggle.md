# Paper-Cut Light / Dark Theme Toggle — Claude + Higgsfield MCP Master Prompt

## Objective

Redesign and implement a beautiful **paper-cut Light Mode / Dark Mode toggle** for the portfolio using the approved visual direction.

This is not a generic sun/moon switch.

The toggle should feel like a handcrafted physical object made from layered paper, with:

- tactile paper textures
- cream and deep navy materials
- capsule-shaped cutout windows
- layered landscapes
- a dimensional paper sun
- a layered crescent moon
- small scrapbook details
- soft paper shadows
- premium editorial craftsmanship

The supplied reference image is the **visual acceptance target**.

---

# IMPORTANT EXECUTION REQUIREMENT

You have access to **Higgsfield through MCP**.

Do not return Higgsfield prompts to me as instructions for me to execute.

Use those prompts yourself through Higgsfield MCP as part of this task.

You own both:

- ART GENERATION
- FRONTEND IMPLEMENTATION

If a generated asset is poor, regenerate it before continuing.

Do not ask me to manually download, create or prepare the artwork unless Higgsfield MCP itself is unavailable.

---

# 1. CORE VISUAL CONCEPT

The toggle should closely follow this concept:

- the full component feels like a two-panel handcrafted paper composition
- left = Light
- right = Dark
- each half has its own textured paper surface
- the left uses warm cream paper
- the right uses deep navy paper
- each side contains a capsule-shaped recessed landscape window

Inside the Light side:

- soft blue paper sky
- rolling paper hills
- white paper clouds
- large layered golden sun
- small rounded paper sun rays

Inside the Dark side:

- deep navy night sky
- layered blue/indigo hills
- crescent moon
- cloud silhouettes
- small warm-gold stars

Above each side:

- `LIGHT`
- `DARK`

Use real HTML text for labels.

Do not bake the labels into raster assets.

---

# 2. DESIGN LANGUAGE

The toggle should visually match the rest of the portfolio:

- scrapbook
- editorial
- tactile
- paper-cut
- handmade
- refined
- premium
- warm
- slightly imperfect

Use:

- subtle paper grain
- visible paper fibers
- slightly uneven torn edges
- realistic cut-paper thickness
- soft close shadows between layers
- masking tape / washi tape
- tiny doodle accents
- restrained botanical/celestial decoration

Avoid:

- glossy 3D
- glassmorphism
- neon
- futuristic switch UI
- plastic look
- generic flat vector icons
- childish craft aesthetic
- default mobile toggle styling

---

# 3. PRODUCT REQUIREMENTS

This must be a real working theme selector.

Functional requirements:

- clicking Light activates light theme
- clicking Dark activates dark theme
- theme choice persists
- respect system preference on first visit
- no light-to-dark flash on initial render
- keyboard accessible
- screen-reader accessible
- mobile compatible
- reduced-motion compatible
- production ready

Use the existing theme state system if one already exists.

Do not create a duplicate competing theme implementation.

---

# 4. THEME RESOLUTION ORDER

Use this priority:

1. explicit saved user choice
2. `prefers-color-scheme`
3. light fallback

Persist only explicit user choice.

Use either:

- `data-theme="light|dark"`
- root class
- existing project mechanism

based on the current codebase.

---

# 5. PREVENT THEME FLASH

Avoid:

light render
→ visible flash
→ dark render

Use the appropriate strategy for the current Next.js / React stack.

Possible options:

- inline blocking theme initialization script
- server-resolved theme when available
- existing theme provider

Do not introduce a large dependency solely for this.

---

# 6. ASSET GENERATION + INTEGRATION — USE HIGGSFIELD MCP

IMPORTANT:

Do NOT ask me to manually generate the artwork.

You have access to Higgsfield through MCP.

You are responsible for:

1. analyzing the supplied reference image
2. defining the required visual assets
3. calling Higgsfield MCP yourself
4. generating the artwork
5. reviewing the generated outputs
6. regenerating weak assets if necessary
7. optimizing the selected assets
8. integrating them into the working theme-toggle component
9. visually comparing the implementation with the reference
10. refining until it reaches the required quality

Do not stop after giving me prompts.

Actually use Higgsfield MCP during implementation.

---

# 7. HIGGSFIELD IS PART OF THE BUILD PIPELINE

Treat Higgsfield as an internal design-generation tool within this task.

Workflow:

REFERENCE IMAGE
↓
visual analysis
↓
asset plan
↓
Higgsfield MCP generation
↓
visual QA
↓
select/regenerate
↓
asset optimization
↓
frontend implementation
↓
browser visual QA
↓
refinement

Do not separate “art generation” from “implementation.”

---

# 8. REFERENCE IMAGE PRIORITY

The supplied Light/Dark paper-cut reference is the visual acceptance target.

Pay particular attention to:

- cream torn-paper Light panel
- deep navy torn-paper Dark panel
- capsule-shaped recessed landscape windows
- layered paper depth
- physical paper shadows
- large sun on Light side
- large crescent moon on Dark side
- layered clouds/hills
- tiny stars
- washi tape
- botanical decoration
- handmade doodle marks
- imperfect physical edges
- restrained handcrafted typography
- premium scrapbook/editorial feel

Do not reinterpret this as a generic sun/moon toggle.

The materiality is the main idea.

---

# 9. FIRST: AUDIT WHAT MUST BE GENERATED

Before calling Higgsfield:

inspect the existing portfolio assets.

Determine whether any existing:

- paper textures
- clouds
- tape
- doodles
- sun/moon artwork
- landscape assets

can be reused without lowering visual quality.

Only generate assets that are actually needed.

However:

do NOT compromise visual fidelity merely to reuse existing generic assets.

---

# 10. PREFERRED ASSET ARCHITECTURE

Do NOT generate one giant screenshot containing the entire finished UI unless using it only as an art-direction reference.

Prefer modular production assets.

Generate:

```text
/public/theme-toggle/

    light-scene.webp
    dark-scene.webp

    light-sun.webp
    dark-moon.webp

    light-clouds.webp
    dark-clouds.webp

    light-decoration.webp
    dark-decoration.webp
```

Optional if needed:

```text
light-reference.webp
dark-reference.webp
combined-reference.webp
```

Use actual file formats supported by the project.

SVG may be used for simple shapes that are easier to recreate precisely in code.

---

# 11. WHAT SHOULD BE CODE VS IMAGE

Implement in HTML/CSS whenever practical:

- outer toggle structure
- labels LIGHT / DARK
- capsule mask
- borders
- background colors
- active state
- focus state
- selection indicator
- shadows where CSS looks convincing
- accessibility
- transitions
- theme behavior

Use generated assets primarily for:

- landscape composition
- layered paper scenery
- complex botanical details
- decorative collage
- highly tactile paper objects

Do NOT bake critical UI text into generated raster images.

LIGHT and DARK should remain real HTML text.

---

# 12. GENERATE A MASTER ART-DIRECTION REFERENCE FIRST

First call Higgsfield MCP to create one high-quality reference composition.

Use approximately this prompt:

## HIGGSFIELD PROMPT — MASTER REFERENCE

```text
Create a premium handcrafted paper-cut editorial concept for a Light Mode / Dark Mode website theme selector.

This artwork is a visual reference for a sophisticated product portfolio website.

COMPOSITION:

A horizontal composition divided into two tactile paper panels.

LEFT:
LIGHT MODE.

RIGHT:
DARK MODE.

The two panels should visually belong to the same handcrafted system.

LIGHT PANEL:

Warm ivory handmade paper with visible fine fibers and naturally imperfect torn outer edges.

At the top is room for the word LIGHT.

Below is a wide horizontal capsule-shaped recessed window cut through the cream paper.

Inside the capsule is a miniature layered paper landscape:

- soft powder-blue sky
- overlapping blue paper hills
- layered white clouds
- a large warm golden paper sun
- small rounded sun rays
- subtle distant landscape layers

The scene should have real dimensional depth created by stacked paper layers.

Add restrained scrapbook details outside the window:

- beige gingham washi tape near a corner
- tiny hand-drawn warm-brown accent strokes
- small heart doodle
- delicate pressed white botanical flowers near one lower corner

DARK PANEL:

Deep midnight navy handmade paper with rich tactile fiber texture and naturally torn outer edges.

Leave space at top for DARK.

Below is the same horizontal capsule-shaped recessed window.

Inside it:

- deep navy night sky
- layered indigo and slate-blue hills
- overlapping paper clouds
- scattered tiny warm-gold stars
- large ivory layered crescent moon
- dreamy atmospheric depth
- subtle layered paper waves/hills

Outside the window:

- dark blue star-pattern washi tape near one upper corner
- minimal cream doodle strokes
- tiny heart
- small gold paper-star botanical/celestial ornament near lower corner

MATERIAL:

Everything must look physically constructed from paper.

Important details:

- visible paper fibers
- subtle thickness at cut edges
- soft ambient occlusion between paper layers
- realistic close paper shadows
- handmade imperfections
- slight unevenness in edges
- matte surfaces
- no plastic
- no glass
- no glossy 3D

VISUAL LANGUAGE:

premium editorial scrapbook
handcrafted stationery
paper theater / shadow-box depth
subtle risograph influence
modern product-design sophistication

The result must feel elegant enough for an award-quality designer portfolio.

COLOR:

Light:
warm cream
ivory
powder blue
soft white
muted sky blue
golden yellow
subtle warm brown

Dark:
midnight navy
indigo
slate blue
muted periwinkle
ivory moonlight
small warm-gold accents

AVOID:

generic mobile toggle
flat vector illustration
emoji aesthetic
children's craft aesthetic
plastic 3D
glossy surfaces
neon
glassmorphism
heavy gradients
stock illustration
photorealistic scenery

Do not render UI buttons or browser chrome.

Focus on the tactile art direction.
```

Generate at high resolution.

Inspect the result.

Do not automatically accept the first generation.

Evaluate:

- paper materiality
- capsule composition
- landscape depth
- visual balance
- palette
- premium feel
- similarity to supplied reference

If weak:
regenerate with corrections.

---

# 13. GENERATE LIGHT PRODUCTION SCENE

After art direction is established, call Higgsfield MCP again.

## HIGGSFIELD PROMPT — LIGHT SCENE

```text
Create a production-ready isolated paper-cut landscape asset for the LIGHT state of a website theme toggle.

It will be displayed inside a horizontal rounded capsule approximately 2.4:1 aspect ratio.

The artwork must survive being cropped by a rounded capsule mask.

SCENE:

A beautiful miniature daytime landscape constructed entirely from layered paper.

Include:

- soft powder-blue paper sky
- several overlapping rolling blue hills
- 3–5 layered white paper clouds
- large warm golden paper sun positioned toward the left
- subtle circular sun rays made from paper pieces
- gentle distant landscape layers

COMPOSITION:

Keep major subjects away from extreme edges.

Sun:
large enough to remain identifiable when rendered at approximately 50–80px tall.

Clouds:
simple enough to remain legible at small UI size.

Landscape:
layered from foreground to background.

MATERIAL:

- tactile handmade paper
- fine paper fiber
- matte finish
- visible cut-paper thickness
- soft shadows between layers
- subtle handmade imperfections
- slight screen-print / risograph character

PALETTE:

powder blue
pale blue
muted turquoise
cream
warm white
golden yellow
very subtle green-blue if needed

NO:

text
UI controls
outer card
border
label
moon
stars
watermark
photography
plastic 3D

BACKGROUND:

Prefer transparent outside the landscape/capsule artwork if Higgsfield supports reliable alpha.

Otherwise use a clean composition that can be masked safely in CSS.

High resolution.
Clean silhouette.
Production asset.
```

---

# 14. GENERATE DARK PRODUCTION SCENE

## HIGGSFIELD PROMPT — DARK SCENE

```text
Create a production-ready isolated paper-cut landscape asset for the DARK state of a website theme toggle.

It will be displayed inside a horizontal rounded capsule approximately 2.4:1 aspect ratio.

SCENE:

A miniature nighttime landscape built entirely from layered paper.

Include:

- deep midnight navy paper sky
- overlapping indigo/slate paper hills
- layered dark blue clouds
- large ivory crescent paper moon positioned toward the right
- small warm-gold paper stars
- subtle distant landscape depth

The moon must remain clearly visible when the final component is only approximately 50–80px tall.

MATERIAL:

- tactile handmade paper
- visible fiber texture
- matte finish
- layered physical depth
- realistic close shadows
- slightly imperfect cut edges
- premium editorial craftsmanship

PALETTE:

midnight navy
deep indigo
slate blue
muted periwinkle
ivory
small warm-gold accents

NO:

text
UI controls
outer card
border
label
sun
photography
neon
glossy 3D
watermark

BACKGROUND:

Prefer transparency when reliable.

Otherwise compose so CSS capsule masking works cleanly.

High resolution.
Production-ready.
```

---

# 15. GENERATE SUN AS SEPARATE LAYER

If a separate animated sun improves implementation, generate it independently.

## HIGGSFIELD PROMPT — SUN

```text
Create one isolated handcrafted paper-cut sun.

Large warm golden circular center with individually layered rounded paper rays.

Premium handmade stationery aesthetic.

Materials:

thick matte paper
subtle fiber
slight imperfect cut edges
very soft paper-on-paper shadow
warm golden yellow
small orange undertone

It must remain beautiful at approximately 45–70px.

Centered isolated object.

Transparent background.

No landscape.
No clouds.
No text.
No face.
No cartoon expression.
No watermark.
```

---

# 16. GENERATE MOON AS SEPARATE LAYER

## HIGGSFIELD PROMPT — MOON

```text
Create one isolated layered crescent moon made from premium handmade paper.

Ivory / warm moonlight paper layered over subtle midnight-blue backing paper.

Elegant thick crescent silhouette.

Materials:

matte paper
visible fine fibers
subtle cut edge thickness
soft dimensional shadow
slightly imperfect handmade contour

Must remain legible around 45–70px.

Transparent background.

No stars.
No sky.
No text.
No face.
No watermark.
```

---

# 17. GENERATE LIGHT DECORATION

Only if CSS/simple SVG is insufficient.

## HIGGSFIELD PROMPT — LIGHT DECORATION

```text
Create an isolated set of delicate scrapbook decorations for a premium cream-paper website interface.

Include:

- small pressed white botanical flower branch
- tiny beige gingham washi tape strip
- 2–3 subtle warm-brown hand-drawn doodle strokes
- tiny hand-drawn heart

Handcrafted editorial stationery style.

Keep composition sparse.

Transparent background.

No text.
No card.
No scenery.
No watermark.
```

---

# 18. GENERATE DARK DECORATION

## HIGGSFIELD PROMPT — DARK DECORATION

```text
Create an isolated set of delicate scrapbook decorations for a premium midnight-navy paper interface.

Include:

- small cluster of gold paper stars on thin hand-drawn stems
- tiny dark-blue washi tape strip with subtle star print
- 2–3 small ivory hand-drawn accent strokes
- tiny outlined heart

Premium handmade editorial scrapbook style.

Sparse composition.

Transparent background.

No text.
No scenery.
No card.
No watermark.
```

---

# 19. ASSET QA — MANDATORY

After every Higgsfield generation:

inspect the output before integrating it.

Reject/regenerate if:

- obvious AI artifacts
- malformed moon
- malformed sun
- inconsistent paper direction
- fake plastic texture
- blurry edges
- excessive depth
- poor small-size readability
- badly cropped objects
- distracting decoration
- inconsistent palette
- visible watermark
- text artifacts
- incorrect transparency
- white halo around cutout
- background contamination

Do NOT accept weak generated assets simply because the tool returned an image.

---

# 20. TRANSPARENCY QA

Pay special attention to transparency.

If generated asset contains:

- white rectangle
- black rectangle
- baked checkerboard
- colored background

do NOT treat it as transparent.

Either:

1. regenerate properly
or
2. isolate it with the appropriate supported image-editing workflow

Do not ship fake transparency.

---

# 21. ASSET OPTIMIZATION

Higgsfield source assets may be large.

Do not use multi-megabyte source files directly.

Create production versions.

Recommended maximum dimensions:

Landscape:
1200–1600px wide

Sun / Moon:
400–600px

Decoration:
600–1000px depending on composition

Prefer:

WebP / AVIF

when transparency and quality remain correct.

Use optimized PNG only where needed.

Keep original generated assets outside the critical application bundle if practical.

---

# 22. FILE STRUCTURE

Store selected production assets in approximately:

```text
/public/theme-toggle/

    light-scene.webp
    dark-scene.webp

    light-sun.webp
    dark-moon.webp

    light-decoration.webp
    dark-decoration.webp

    master-reference.webp
```

Use names consistent with the project's conventions.

---

# 23. DO NOT REGENERATE ON EVERY BUILD

Higgsfield should be a design-time dependency.

Once good assets are generated and committed:

do not call Higgsfield at runtime.

Do not generate theme art when a visitor changes theme.

Theme switching must be instantaneous.

---

# 24. IMPLEMENTATION AFTER ASSET GENERATION

Once assets pass QA:

build the functional toggle.

Do NOT stop after asset generation.

The generated art must become part of the actual production interface.

---

# 25. TOGGLE STRUCTURE

Implement approximately:

```tsx
<PaperThemeToggle>
    <LightOption>
        <Label />
        <SceneWindow>
            <Landscape />
            <Sun />
            <Clouds />
        </SceneWindow>
    </LightOption>

    <DarkOption>
        <Label />
        <SceneWindow>
            <Landscape />
            <Moon />
            <Stars />
        </SceneWindow>
    </DarkOption>
</PaperThemeToggle>
```

Adjust architecture based on existing stack.

---

# 26. IMPORTANT — DON'T USE THE FULL REFERENCE AS ONE IMAGE

Do not simply place the generated master-reference image on the site and attach a click handler.

That is not an acceptable implementation.

The final control must be a real UI component.

Use:

- HTML
- CSS
- generated art layers

so that:

- states are interactive
- animations are possible
- responsive design works
- accessibility works
- artwork remains sharp
- labels remain real text

---

# 27. LIGHT OPTION

Light-side container:

- warm cream handmade paper
- subtle texture
- optional irregular/torn outer edge
- warm-brown/navy typography

Label:

`LIGHT`

Use real HTML.

Scene:
rounded capsule cutout.

Landscape inside:
Higgsfield-generated light scene.

Sun:
separate layer if available.

---

# 28. DARK OPTION

Dark-side container:

- deep midnight navy paper
- subtle fiber texture
- slight torn edge
- ivory/pale blue typography

Label:

`DARK`

Real HTML.

Scene:
matching capsule geometry.

Landscape:
Higgsfield dark scene.

Moon:
independent layer if available.

---

# 29. CAPSULE WINDOW

The capsule should feel physically cut into the paper.

Use:

- `border-radius: 999px`
- `overflow: hidden`
- inset shadow
- subtle inner paper edge
- 1–3px physical-looking rim

Avoid glossy bevel effects.

Think:

paper shadow-box.

---

# 30. ACTIVE STATE

Selected theme should be visually obvious without ruining the artwork.

Possible behaviors:

LIGHT ACTIVE:

- sun slightly forward
- scene +3–5% brighter
- warmer shadow
- tiny sun-ray reveal

DARK ACTIVE:

- moon slightly forward
- stars gently become visible
- cool shadow strengthens slightly

Do not add a generic blue checkbox.

---

# 31. THEME SWITCH ANIMATION

Switch duration approximately:

350–500ms.

Potential interaction:

LIGHT → DARK

1. sun slides a short distance
2. light scene dims subtly
3. dark scene gains contrast
4. moon settles forward
5. stars reveal
6. application color tokens transition

DARK → LIGHT:

reverse.

Do not simulate a full sunrise/sunset animation.

Keep interaction compact.

---

# 32. OPTIONAL PAPER PARALLAX

A tiny 1–2px separation between scene layers on hover is acceptable.

Do not create dramatic 3D perspective.

This is paper craftsmanship, not WebGL.

---

# 33. FULL DECORATIVE VERSION

The full approved visual can be used for:

- settings panel
- Playground
- a visual theme demo
- a dedicated design Easter egg

It may include:

- tape
- flowers
- stars
- doodles
- torn-paper edges

Keep this version visually rich.

---

# 34. NAVBAR VERSION

Create a compact production version suitable for the portfolio navbar.

Recommended overall size:

- width: ~94–128px
- height: ~42–52px

The landscape should still remain recognizable.

Do not show the full decorative flowers/tape inside the navbar version.

Navbar version should retain:

- sun
- clouds
- landscape
- moon
- stars
- paper texture

and remove excess surrounding collage.

---

# 35. MOBILE VERSION

On mobile, use a compact variant.

If the full two-panel component is too wide:

use one capsule with the active scene and animate between:

sun/day
↔
moon/night

Keep the paper-cut art direction.

Do not reduce tap area below comfortable touch size.

---

# 36. RESPONSIVE BEHAVIOR

Desktop:
full interactive paper toggle.

Tablet:
slightly simplified.

Mobile:
compact iconographic/paper landscape version if necessary.

Do not occupy excessive mobile navbar width.

---

# 37. HOVER BEHAVIOR

Desktop hover:

- selected panel rises ~1–2px
- subtle shadow enhancement
- sun/moon may move 1–2px
- no scale >1.03

Avoid dramatic motion.

---

# 38. PRESSED STATE

On click/tap:

- 1px downward paper press
- slight shadow compression
- then transition theme

Keep tactile.

---

# 39. KEYBOARD ACCESSIBILITY

Support:

- Tab
- Enter
- Space
- Arrow keys if implementing a radiogroup

Visible focus style should match paper UI.

Example:

- thin terracotta outline
- subtle cream/navy offset

Do not remove focus rings.

---

# 40. SCREEN READER ACCESSIBILITY

Use semantic labels:

- `Use light theme`
- `Use dark theme`

Do not rely on sun/moon imagery alone.

If using radio options:

```html
role="radiogroup"
```

If using a binary switch:

use proper switch semantics.

Choose whichever better fits the current implementation.

---

# 41. REDUCED MOTION

With:

```css
@media (prefers-reduced-motion: reduce)
```

disable:

- sliding sun
- moon movement
- star reveal
- decorative parallax

Theme should still switch correctly.

---

# 42. PERFORMANCE

This navbar element must not hurt LCP.

Requirements:

- optimized assets
- no runtime Higgsfield requests
- no giant PNG
- preload only if truly above-the-fold critical
- avoid JS animation libraries solely for the toggle
- CSS transforms/opacity preferred

---

# 43. IMAGE LOADING

For above-the-fold navbar assets:

use appropriate priority only if needed.

Avoid eagerly loading oversized reference art.

Use only compact production assets in the live navbar.

---

# 44. DARK MODE ART CONTRAST

Ensure moon/stars remain visible against navy without becoming neon.

Use:

- ivory moon
- muted gold stars
- subtle periwinkle highlights

Avoid pure white + electric blue combinations.

---

# 45. LIGHT MODE ART CONTRAST

Ensure sun and clouds remain readable on cream/sky layers.

Use:

- warm yellow sun
- off-white clouds
- muted sky blues

Avoid overly saturated cyan.

---

# 46. PAPER TEXTURE

Use subtle texture.

Do not place a high-contrast noise texture over the entire toggle.

Paper grain should be perceptible only on closer inspection.

---

# 47. SHADOWS

Shadows should feel like paper-on-paper shadows.

Use:

- small blur
- low opacity
- close distance
- warm neutral tint

Avoid large soft floating-card shadows.

---

# 48. TORN EDGES

If using torn panel edges:

keep them subtle.

Do not make the navbar toggle look damaged.

The torn-paper character should remain refined.

---

# 49. VISUAL QA

After implementation:

render the portfolio in:

LIGHT
and
DARK

Compare the toggle against:

1. supplied reference
2. Higgsfield master reference

Audit:

- paper texture
- color palette
- scene readability
- cutout depth
- sun quality
- moon quality
- shadows
- label size
- active-state readability
- overall handcrafted feeling

If the implementation looks flatter than the generated art:

improve CSS/layering.

If the generated art is the limiting factor:

regenerate it with Higgsfield MCP.

Do not compensate for weak assets with excessive CSS effects.

---

# 50. TROUBLESHOOTING

| Problem | Cause / Fix |
|---|---|
| Toggle art shows white boxes | Generated/exported image does not have real transparency. Regenerate or re-export with alpha preserved. |
| White halo around moon/sun | Background contamination or matte baked into asset. Regenerate against true transparency or clean with image-editing workflow. |
| Toggle looks flat | CSS layers are not preserving depth. Add subtle inset rim, layered shadows and correct z-index ordering. |
| Sun/moon looks blurry | Asset source is too small or being enlarged beyond intended size. Regenerate/export at 400–600px. |
| Navbar becomes too tall | Using full decorative reference version instead of compact navbar variant. |
| Dark scene becomes unreadable | Contrast too low between hills/clouds/background. Regenerate or adjust with subtle layer-specific contrast. |
| Light scene feels too saturated | Regenerate with muted powder-blue / warm cream palette. |
| Theme flashes on load | Initial theme resolution happens after render. Fix pre-hydration theme initialization. |
| Theme choice resets | Persistence logic missing or wrong storage key. |
| Toggle works visually but not with keyboard | Semantic button/radio/switch behavior incomplete. |
| Motion still runs for reduced-motion users | Missing or incomplete `prefers-reduced-motion` handling. |
| Page shifts when toggle loads | Width/height/aspect ratio not reserved. Give component explicit dimensions. |
| Higgsfield output contains text artifacts | Reject generation. Production art should not contain baked UI labels. |
| Generated stars/moon look plastic | Prompt drifted toward glossy 3D. Regenerate emphasizing matte paper, fibers, soft close shadows. |
| Asset is several MB | Source asset was used directly. Create optimized WebP/AVIF production version. |

---

# 51. FINAL ACCEPTANCE CRITERIA

The implementation is finished only if:

- Claude generated required art through Higgsfield MCP
- generated artwork was visually inspected
- weak generations were rejected/regenerated
- final assets are optimized
- LIGHT/DARK text remains real HTML
- toggle is genuinely interactive
- selected theme persists
- system theme is respected initially
- no initial theme flash
- keyboard interaction works
- screen readers understand control
- reduced motion works
- navbar version is compact
- mobile works
- assets do not show white/black backgrounds
- paper depth is visible
- sun and moon remain readable at navbar size
- page theme transitions elegantly
- no runtime Higgsfield dependency exists

---

# 52. IMPLEMENTATION ORDER

Use this sequence:

1. inspect existing theme logic
2. inspect current navbar
3. inspect existing paper textures/components
4. analyze supplied reference
5. define Higgsfield asset plan
6. generate master reference via Higgsfield MCP
7. inspect/regenerate until acceptable
8. generate Light production assets
9. generate Dark production assets
10. optimize final assets
11. build reusable theme toggle
12. integrate into existing theme state
13. prevent theme flash
14. create compact navbar variant
15. create responsive/mobile variant
16. accessibility pass
17. reduced-motion pass
18. visual QA against reference
19. performance check
20. final report

Do not start by coding a generic switch before the art direction is established.

---

# 53. FINAL REPORT

After implementation report:

## HIGGSFIELD
- generations made
- prompts used
- outputs rejected and why
- final assets selected

## ASSETS
- filenames
- source dimensions
- final dimensions
- source sizes
- optimized sizes
- formats

## IMPLEMENTATION
- files changed
- component created
- theme state architecture
- persistence method
- system-theme behavior
- animation behavior
- navbar behavior
- mobile behavior

## QA
- Light screenshot result
- Dark screenshot result
- mobile
- keyboard
- reduced motion
- performance
- remaining limitations

---

# FINAL DESIGN PRINCIPLE

The toggle should feel like a **tiny handcrafted paper world** embedded inside the portfolio.

It should be delightful enough that visitors notice it, but restrained enough that it still feels like part of a serious product portfolio.

Prioritize:

materiality → clarity → accessibility → performance → delight.
