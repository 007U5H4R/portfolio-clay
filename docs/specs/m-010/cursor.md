# Paper Trail Cursor — Claude/Fable Implementation Prompt

## Objective

Implement a custom, portfolio-specific cursor system called **Paper Trail Cursor**.

This is not a generic cursor gimmick. It should reinforce the portfolio’s existing identity:

- tactile paper-cutout / editorial scrapbook aesthetic
- warm cream paper, deep navy, terracotta, sage and muted accent colors
- product-building, research, systems thinking, experimentation and Tushky personality
- subtle delight without compromising usability, readability, accessibility or performance

The interaction should feel like:

> “As someone explores Tushar’s portfolio, they literally leave a trail of the artifacts that shaped the work.”

The system must have **two layers**:

1. **Custom semantic cursor**
2. **Hold-and-drag paper artifact trail**

Do not implement a constant noisy particle effect.

---

# 1. HIGH-LEVEL INTERACTION

## Normal state

Show a minimal custom cursor on desktop/pointer devices:

- small deep-navy center dot
- thin terracotta ring around it
- crisp, editorial, slightly handmade
- subtle paper-cut personality

Do **not** use a giant illustrated dog cursor.

Approximate size:

- center dot: 7–10px
- resting outer ring: 22–26px
- interactive outer ring: 36–44px

The cursor should track smoothly without visible lag.

---

# 2. SEMANTIC HOVER CURSOR

When hovering interactive elements, the cursor may expand slightly and show a small contextual label.

Supported semantic states:

- default → no label
- links → `OPEN →`
- product cards → `EXPLORE →`
- case study links → `CASE STUDY →`
- portfolio/project links → `VIEW →`
- video controls → `PLAY ▶`
- GitHub → `CODE ↗`
- PRD → `PRD ↗`
- external links → `OPEN ↗`
- Tushky launcher / Ask Tushky → `WOOF 🐾`

Do not show labels for every button if it creates noise.

Use semantic labels only for high-value interactive surfaces.

The label should feel like a tiny paper tag near the cursor, not a tooltip box.

---

# 3. CUSTOM CURSOR VISUAL LANGUAGE

Use the existing portfolio system:

- deep navy
- terracotta
- cream
- subtle paper grain
- very light shadow

Suggested appearance:

- cursor ring = deep navy outline or terracotta outline
- center dot = navy
- contextual label = cream paper chip with navy text
- hover accent = terracotta

Avoid:

- neon
- glowing cursor
- glassmorphism
- cyberpunk trails
- metallic effects
- oversized paw cursor
- skeuomorphic arrow pointer

---

# 4. DESKTOP-ONLY ENABLEMENT

Enable the custom cursor only for:

```css
@media (hover: hover) and (pointer: fine) {
  /* custom cursor enabled */
}
```

On touch/coarse-pointer devices use the native interaction.

---

# 5. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When reduced motion is requested:

- disable the image trail entirely
- disable cursor spring/inertia
- disable avatar-style cursor changes
- either use native cursor or a static lightweight custom cursor

Accessibility is more important than the effect.

---

# 6. PAPER TRAIL — CORE BEHAVIOR

The trail starts only while the user intentionally holds the **left mouse button** and drags.

```text
pointerdown
    ↓
spawn one paper artifact
    ↓
pointermove while pressed
    ↓
every ~110px of travel
spawn next artifact
    ↓
fill gaps on fast strokes
    ↓
artifact pops / settles / falls away
    ↓
pointerup / cancel / blur
stop trail
```

The effect should feel like small paper objects are being flicked out along the pointer path.

---

# 7. TRAIL CONSTANTS

Start with:

```ts
const SPACING = 110;
const LIFETIME = 1150;
const MAX_PER_MOVE = 5;
const MAX_ACTIVE = 18;

const MIN_WIDTH = 72;
const MAX_WIDTH = 125;
```

Keep these centralized so they can be tuned.

---

# 8. TRAIL ASSET SET

Create a cohesive set of transparent PNG/WebP/SVG assets.

Recommended base library:

1. Tushky paw print
2. RailCite railway ticket / circular fragment
3. torn sticky note
4. retro arcade coin / token
5. research-paper fragment
6. tiny product wireframe sketch
7. lightbulb / idea card
8. paper arrow / folded directional note

Optional:

9. coffee cup
10. miniature blueprint
11. tiny graph-paper scrap
12. small binder clip

Do not use employer/company logos in the trail.

---

# 9. TRAIL ORDER

Use a deterministic looping sequence:

```text
paw
→ railway ticket
→ sticky note
→ arcade coin
→ research paper
→ product sketch
→ lightbulb
→ paper arrow
→ repeat
```

Do not select fully random assets on every spawn.

---

# 10. SECTION-AWARE TRAILS

Allow each major page/section to set a trail theme via:

```html
<section data-cursor-theme="railcite">
```

Possible themes:

## Default
- paw
- sticky note
- research paper
- product sketch
- lightbulb
- paper arrow

## RailCite
- railway ticket
- circular fragment
- small track marker
- document stamp
- paper arrow

## Slag City
- arcade token / coin
- industrial label
- molten-orange tag
- warning placard
- paper arrow

## Campfire Board
- sticky note
- mini board card
- campfire icon
- planning ticket
- paper arrow

## About
- research paper
- notebook scrap
- lightbulb
- engineering sketch
- paper arrow

## Tushky
- paw print only, or paw + small speech card

---

# 11. ASSET GENERATION — HIGGSFIELD

Use **Higgsfield** or the available image-generation workflow to create the transparent trail assets.

Important:

Do not generate large full scenes.

Generate **single isolated cutout objects** on transparent background.

All assets should feel like they come from the same tactile portfolio world.

Style:

- handmade paper cutout
- vintage editorial collage
- screen-printed / risograph influence
- warm tactile paper
- subtle ink imperfections
- slightly uneven edge
- no photorealistic lighting
- no glossy 3D
- no stock icon look

---

# 12. HIGGSFIELD MASTER STYLE PROMPT

Use this base style prompt for all cursor trail assets:

```text
Create a single isolated paper-cutout object for a premium editorial scrapbook portfolio.

Visual style:
handmade torn paper, vintage editorial collage, subtle risograph/screen-print texture, warm cream paper, deep navy ink, terracotta accents, muted sage and dusty blue where appropriate, slightly imperfect cut edges, tactile paper fibers, minimal realistic shadow only around the object itself.

The object should look handcrafted but refined, suitable for a sophisticated product manager portfolio.

Requirements:
- transparent background
- centered isolated object
- no scene
- no text unless explicitly requested
- no watermark
- no border around the canvas
- no glossy 3D
- no cartoon mascot style
- no neon
- no photographic background
- clear silhouette readable at 80–120px
- leave transparent padding around the object
```

---

# 13. HIGGSFIELD ASSET PROMPTS

## A. Tushky Paw

```text
Create one isolated Golden Retriever paw-print paper cutout.

Style:
warm terracotta and deep navy ink on slightly textured cream paper, handmade torn-paper edge, subtle risograph grain, refined editorial scrapbook aesthetic.

The paw should be simple and iconic, not anatomically realistic.

Transparent background.
Readable at 80px.
No text.
```

## B. RailCite Ticket

```text
Create one isolated vintage railway ticket paper cutout.

Style:
Indian railway field-notebook inspired, cream ticket paper, deep navy type-like markings, terracotta stamp details, subtle worn print texture, torn paper edges, premium editorial scrapbook aesthetic.

No legible real railway branding.
No copyrighted logo.
Use abstract railway lines, tiny punched-hole details, and a generic circular stamp.

Transparent background.
Readable at 100px.
```

## C. Sticky Note

```text
Create one isolated torn sticky-note paper cutout.

Style:
muted warm yellow paper, subtle handwritten squiggle or tiny abstract checklist marks only, deep navy ink, terracotta accent stroke, handmade uneven edge, tactile paper texture.

No readable sentence.
Transparent background.
```

## D. Arcade Coin

```text
Create one isolated retro arcade token as a paper-cutout object.

Style:
muted brass / ochre paper, deep navy outline, terracotta accent, 1990s arcade inspiration, subtle halftone print texture, premium editorial scrapbook styling.

Use a simple abstract star or joystick symbol.
No existing arcade brand.
Transparent background.
```

## E. Research Paper Fragment

```text
Create one isolated small torn research-paper fragment.

Style:
cream academic paper, deep navy diagrams, tiny graph lines, one terracotta annotation mark, subtle paper grain, hand-cut editorial collage.

Include abstract scientific chart shapes and schematic lines, but no readable copyrighted text.

Transparent background.
```

## F. Product Wireframe

```text
Create one isolated product-wireframe sketch on torn graph paper.

Style:
cream and pale blue graph paper, deep navy UI boxes and arrows, one terracotta highlight, hand-drawn product-design sketch, tactile scrapbook cutout.

No readable product name.
Transparent background.
```

## G. Lightbulb

```text
Create one isolated lightbulb idea icon as a layered paper cutout.

Style:
warm yellow center, deep navy outline, terracotta rays, subtle screen-print texture, handcrafted editorial paper collage.

Simple silhouette.
Transparent background.
```

## H. Paper Arrow

```text
Create one isolated hand-cut directional paper arrow.

Style:
cream torn paper with deep navy hand-drawn arrow line and a small terracotta edge accent, warm editorial scrapbook aesthetic.

Transparent background.
```

---

# 14. ASSET EXPORT REQUIREMENTS

For each asset:

- transparent background
- longest edge initially 800–1200px from generation
- then create optimized site copies
- preserve alpha
- crop unnecessary transparent bounds but leave ~8–12% safe padding

Create final optimized files in:

```text
/public/cursor/trail/
```

Suggested filenames:

```text
paw.webp
rail-ticket.webp
sticky.webp
arcade-token.webp
research-paper.webp
wireframe.webp
lightbulb.webp
paper-arrow.webp
```

---

# 15. ASSET OPTIMIZATION

Do NOT ship the full generated assets directly.

Create optimized copies:

- longest side: ~400px
- WebP with alpha when quality is acceptable
- otherwise optimized PNG
- preserve transparency

Target preferably under 80–150KB per asset where feasible.

---

# 16. PRELOAD STRATEGY

Do not preload trail assets at page-critical priority.

After page becomes idle:

```ts
requestIdleCallback(() => preloadTrailAssets());
```

Fallback:

```ts
setTimeout(preloadTrailAssets, 1000);
```

Do not delay LCP for cursor assets.

---

# 17. TRAIL LAYER

Create one fixed full-screen trail layer:

```css
#trail {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  overflow: hidden;
}
```

The effect must never block interaction.

---

# 18. CUSTOM CURSOR LAYER

```css
#portfolio-cursor {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 200;
  pointer-events: none;
}
```

Keep DOM minimal.

---

# 19. CURSOR MOVEMENT

Use `pointermove`.

For the visible cursor prefer:

- transform translate3d
- requestAnimationFrame
- lightweight interpolation

Do not mutate layout properties like `left` and `top` on every frame if avoidable.

Optional smoothing:

```ts
currentX += (targetX - currentX) * 0.28;
currentY += (targetY - currentY) * 0.28;
```

Do not make the cursor lag far behind the pointer.

---

# 20. POINTERDOWN

Trail begins only when:

- pointer type = mouse
- primary pointer
- button = 0

On pointerdown:

- set pressed state
- add body class `cursor-dragging`
- disable accidental text selection
- spawn first artifact at cursor location
- store last spawn position

---

# 21. TEXT SELECTION

```css
body.cursor-dragging {
  user-select: none;
}
```

Remove immediately on:

- pointerup
- pointercancel
- blur

---

# 22. POINTERMOVE TRAIL ALGORITHM

Do not spawn one item per pointer event.

Instead measure distance:

```ts
dx = x - lastX;
dy = y - lastY;
distance = Math.hypot(dx, dy);
```

If `distance >= SPACING`, fill items evenly along the path.

---

# 23. EVEN SPACING

For fast strokes:

```ts
count = Math.min(
  Math.floor(distance / SPACING),
  MAX_PER_MOVE
);
```

Spawn evenly between previous and current points.

Do not place all items at the current pointer coordinates.

---

# 24. TRAVEL DIRECTION

```ts
const nx = dx / distance;
const ny = dy / distance;
```

Use it to nudge spawned items slightly forward:

```ts
const directionNudge = 8 + Math.random() * 8;
```

Apply directional offset based on `nx` and `ny`.

---

# 25. VELOCITY RESPONSE

Use velocity only to subtly alter:

- size
- tilt
- nudge

Slow stroke:
- ~72–95px
- ±8deg rotation

Fast stroke:
- ~100–125px
- ±16–20deg rotation
- slightly stronger directional nudge

Do not dramatically increase particle count with speed.

---

# 26. ACTIVE ITEM LIMIT

Use:

```ts
const MAX_ACTIVE = 18;
```

If creating item 19, remove oldest active item early.

---

# 27. SPAWN ELEMENT

```html
<img
  class="cursor-trail-item"
  src="..."
  alt=""
  aria-hidden="true"
/>
```

Decorative only.

---

# 28. TRAIL CSS

```css
.cursor-trail-item {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  user-select: none;
  transform-origin: center;
  will-change: transform, opacity;
  filter: drop-shadow(0 7px 10px rgba(30, 25, 18, 0.16));
}
```

Do not animate the filter.

---

# 29. PAPER FLICK ANIMATION

Use Web Animations API.

Target feeling:

**paper flick → settle → peel/fall away**

Duration:
~1150ms

Approximate phases:

```text
0ms
scale .2
opacity 0
rotation initial - extra
translate slightly opposite direction

180ms
scale 1.08
opacity 1
forward nudge

300ms
scale 1
settled

700ms
hold near full size

1150ms
scale .72
translateY +28–40px
rotate further
opacity 0
```

---

# 30. WEB ANIMATIONS API

Example concept:

```ts
element.animate(
  [
    {
      transform: "... scale(.2)",
      opacity: 0,
      easing: "cubic-bezier(.2,.9,.25,1.35)"
    },
    {
      transform: "... scale(1.08)",
      opacity: 1,
      offset: 0.18,
      easing: "cubic-bezier(.22,1,.36,1)"
    },
    {
      transform: "... scale(1)",
      opacity: 1,
      offset: 0.62,
      easing: "linear"
    },
    {
      transform: "... scale(.72)",
      opacity: 0,
      offset: 1,
      easing: "cubic-bezier(.4,0,1,1)"
    }
  ],
  {
    duration: LIFETIME,
    fill: "forwards"
  }
);
```

Tune visually.

---

# 31. CLEANUP

When animation finishes:

- remove DOM node
- remove from active collection
- release references

Do not leak trail elements.

---

# 32. END CONDITIONS

Stop trail immediately on:

```text
pointerup
pointercancel
window blur
document visibility hidden
```

Also remove `body.cursor-dragging`.

---

# 33. EXCLUSION ZONES

Do not spawn trail over dense interaction/content areas.

Block trail on:

```css
input,
textarea,
select,
button,
video,
iframe,
[contenteditable],
[data-no-trail]
```

Recommended `data-no-trail` regions:

- Ask Tushky drawer
- forms
- text inputs
- embedded YouTube/Vimeo players
- code blocks
- evidence drawers
- long reading regions if needed

---

# 34. BUTTONS VS TRAIL

If pointerdown originates on a functional UI control, prefer normal interaction over starting a decorative trail.

Trail is primarily for:

- open visual areas
- paper backgrounds
- hero whitespace
- playful portfolio surfaces

---

# 35. PAGE-SPECIFIC INTENSITY

## Home
Full Paper Trail enabled in open visual areas.

## Portfolio
Enabled around product-carousel/background areas, disabled over video and action controls.

## About
Enabled lightly with research/note assets.

## Experience
Very subtle or disabled over timeline cards.

## Case studies
Subtle only; disable over dense text, screenshots, diagrams and evidence UI.

## Ask Tushky
No full trail inside drawer. Use only semantic paw cursor on launcher/CTA.

---

# 36. TUSHKY CURSOR STATE

When hovering Tushky launcher:

- replace center dot with a tiny paw symbol or paw SVG
- show label: `WOOF 🐾`

Do not show an illustrated dog following the cursor.

---

# 37. VIDEO CURSOR STATE

For pitch/demo poster:

show `PLAY ▶`.

When video player itself is active, return to native/normal interaction where needed.

---

# 38. PRODUCT CARD CURSOR

On product tiles:

show `EXPLORE →`.

Keep product art unobstructed.

---

# 39. EXTERNAL LINK CURSOR

For external links:

show `OPEN ↗` only if useful.

---

# 40. COMPONENT ARCHITECTURE

Prefer:

```tsx
<PortfolioCursor />
<PaperTrail />
```

mounted once near application root.

Potential helpers:

```text
useCursorTheme()
useCursorState()
usePaperTrail()
```

Do not recreate app-level pointer listeners on every page.

---

# 41. DATA ATTRIBUTE API

Support:

```html
<a data-cursor="OPEN →">
<div data-cursor="EXPLORE →">
<section data-cursor-theme="railcite">
<div data-no-trail>
```

This keeps adoption simple.

---

# 42. NATIVE CURSOR HIDING

Only hide the native cursor after custom cursor initialization succeeds.

```css
@media (hover: hover) and (pointer: fine) {
  html.has-custom-cursor,
  html.has-custom-cursor a,
  html.has-custom-cursor button {
    cursor: none;
  }
}
```

Avoid a “no cursor” failure state.

---

# 43. IFRAME BEHAVIOR

Custom cursor cannot reliably track inside cross-origin YouTube/Vimeo iframes.

Do not fake it.

Allow appropriate/native behavior over iframe controls.

---

# 44. Z-INDEX SYSTEM

Inspect the current site first.

Suggested relationship:

```text
page content: normal
trail: 100
custom cursor: 200
critical modal UI: existing system as needed
```

Do not blindly overwrite existing modal hierarchy.

---

# 45. PERFORMANCE

Only animate:

- transform
- opacity

Avoid animated:

- width
- height
- top
- left
- blur
- shadow

Keep active trail elements <=18.

---

# 46. EVENT MANAGEMENT

Use one app-level pointermove system.

Clean up listeners on unmount.

Avoid attaching duplicate event handlers per section.

---

# 47. ANALYTICS — OPTIONAL

If Mixpanel exists, optionally track only:

```text
Paper Trail Used
```

once per session.

Do not track cursor paths or every movement.

---

# 48. EASTER EGG DISCOVERY

Do not add a permanent tutorial.

Optional first-session hint in one open visual area:

```text
psst… drag here ✦
```

Show once or omit entirely.

---

# 49. BROWSER QA

Test at minimum:

- Chrome desktop
- Safari desktop
- Firefox desktop

Validate:

- Web Animations API
- pointer events
- transparent image assets
- requestIdleCallback fallback
- any CSS masks used

---

# 50. ACCESSIBILITY QA

Verify:

- native cursor fallback
- reduced motion
- keyboard-only operation unaffected
- screen readers unaffected
- decorative trail assets hidden from accessibility tree
- no pointer-event blocking
- text selection works normally when not dragging
- visible focus styles remain

---

# 51. VISUAL ACCEPTANCE CRITERIA

The Paper Trail Cursor is successful only if:

- it feels native to the portfolio
- it does not look like a generic cursor plugin
- the cursor remains precise
- the trail is playful but restrained
- trail assets look tactile and editorial
- drag effect never blocks controls
- no visible lag
- no readability issue
- no effect on mobile
- reduced motion is respected
- Tushky gets a subtle paw state
- product cards get meaningful semantic hover labels
- section-aware assets feel contextual
- trail assets do not delay LCP

---

# 52. IMPLEMENTATION ORDER

Implement in this order:

1. audit existing pointer/cursor CSS
2. create asset manifest
3. generate assets with Higgsfield
4. optimize all trail assets
5. build custom cursor
6. add semantic hover labels
7. implement pointerdown trail
8. add distance-based spacing
9. add velocity response
10. add section-aware themes
11. add exclusion zones
12. add reduced-motion/capability fallback
13. browser/performance QA
14. final visual tuning

Do not start with decorative animation before the cursor itself is precise.

---

# 53. ASSET MANIFEST

Create something like:

```ts
export const TRAIL_ASSETS = {
  default: [
    "/cursor/trail/paw.webp",
    "/cursor/trail/sticky.webp",
    "/cursor/trail/research-paper.webp",
    "/cursor/trail/wireframe.webp",
    "/cursor/trail/lightbulb.webp",
    "/cursor/trail/paper-arrow.webp",
  ],

  railcite: [
    "/cursor/trail/rail-ticket.webp",
    "/cursor/trail/research-paper.webp",
    "/cursor/trail/paper-arrow.webp",
  ],

  slagCity: [
    "/cursor/trail/arcade-token.webp",
    "/cursor/trail/sticky.webp",
    "/cursor/trail/paper-arrow.webp",
  ],

  campfire: [
    "/cursor/trail/sticky.webp",
    "/cursor/trail/lightbulb.webp",
    "/cursor/trail/paper-arrow.webp",
  ],

  about: [
    "/cursor/trail/research-paper.webp",
    "/cursor/trail/wireframe.webp",
    "/cursor/trail/lightbulb.webp",
  ],

  tushky: [
    "/cursor/trail/paw.webp",
  ],
};
```

Use the actual current section IDs/names from the project.

---

# 54. FINAL REPORT

After implementation, report:

1. components added
2. asset files generated
3. Higgsfield prompts used
4. source asset sizes
5. optimized asset sizes
6. cursor visual states
7. trail algorithm
8. trail constants
9. themes implemented
10. exclusion zones
11. reduced-motion behavior
12. mobile behavior
13. browser QA
14. performance findings
15. any compromises

---

# FINAL INSTRUCTION

The effect must feel like a **hidden layer of personality**, not the main attraction.

The portfolio content remains the hero.

If the cursor becomes more memorable than the work itself, reduce the effect.

Prioritize:

**precision → usability → performance → delight**.

---

# 66. TROUBLESHOOTING & FAILURE MODES

Use this section during implementation and QA. These are practical failure cases that should be anticipated rather than discovered after deployment.

## Cursor / Trail Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| Trail images show white boxes | The source PNG/WebP assets do not actually contain transparency. Re-export them with a real alpha channel. Verify that the optimized 400px versions also preserve transparency. |
| Trail items have ugly square edges after optimization | The conversion pipeline flattened the image onto a white background or stripped alpha. Re-run optimization with alpha preservation enabled. |
| White halo appears around transparent assets | The generated asset has matte/background contamination. Re-export against true transparency and inspect it on both cream and dark test backgrounds. |
| Trail assets appear blurry | The optimized source files are too small or are being rendered too large. Keep source trail assets at ~400px longest edge and render them at roughly 72–125px. |
| Trail assets look inconsistent with the portfolio | Higgsfield outputs were generated with inconsistent prompts or palette. Regenerate using the shared master style prompt and the same paper/ink/terracotta visual system. |
| Page scrolls sideways on mobile | Apply `overflow-x: clip` to `html, body`, and ensure decorative layers stay inside clipped/hidden section wrappers. The custom cursor/trail should not mount on coarse/touch pointers. |
| Cursor trail causes horizontal scrollbar on desktop | A trail item is in normal document flow or the overlay is not clipped. Confirm `#trail { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }`. |
| Cursor disappears completely | The native cursor was hidden before the custom cursor initialized. Only add the `has-custom-cursor` class after successful mount. Native cursor must remain the fallback. |
| Custom cursor is offset from the real pointer | The visual cursor is positioned with incorrect transforms or transform-origin. Use fixed positioning and `translate3d(pointerX, pointerY, 0)` plus `translate(-50%, -50%)` to center it. |
| Cursor lags too far behind the pointer | Interpolation/lerp is too low. Increase the factor or disable smoothing over interactive controls. Precision is more important than exaggerated floatiness. |
| Cursor feels jittery | React state is being updated on every `pointermove`. Store target coordinates in refs and render the cursor using one `requestAnimationFrame` loop. |
| Trail spawns too many images during fast movement | The implementation is spawning per pointer event. Spawn by traveled distance using `SPACING` and cap creation with `MAX_PER_MOVE`. |
| Fast strokes leave large gaps | New artifacts are only spawned at the newest pointer position. Interpolate spawn coordinates evenly between the previous point and current point. |
| Long drags slow down the page | Active trail elements are not capped or cleaned up. Keep `MAX_ACTIVE` around 18 and remove each element immediately after animation completion. |
| Trail remains active after releasing the mouse | Cleanup for `pointerup`, `pointercancel`, `window.blur`, or `visibilitychange` is incomplete. All of these must terminate the pressed state. |
| Text cannot be selected after using the trail | The `cursor-dragging` class was not removed from `<body>`. Ensure every exit path restores normal `user-select`. |
| Trail starts while clicking buttons, inputs, or controls | Target exclusion logic is missing. Block trail spawning on `input`, `textarea`, `select`, `button`, `video`, `iframe`, `[contenteditable]`, and `[data-no-trail]`. |
| Trail interferes with Ask Tushky | The chat drawer is not marked as an exclusion zone. Add `data-no-trail` to the drawer/chat area and keep only the semantic paw cursor there. |
| Trail appears over YouTube/Vimeo controls | The media wrapper is not excluded. Mark embedded video regions with `data-no-trail` and allow native cursor interaction over cross-origin iframes. |
| Trail images load late on first use | Preloading did not run or ran too late. Preload after page idle using `requestIdleCallback` with a `setTimeout` fallback. |
| Cursor hurts LCP | Trail assets are being loaded at critical priority. Do not preload cursor assets before core page content; defer them until idle. |
| Cursor is visible on mobile or touch devices | Capability detection is too broad. Only enable when `(hover: hover) and (pointer: fine)` are both true. |
| Reduced-motion users still see the trail | `prefers-reduced-motion` handling is missing. Disable the trail and motion-heavy custom-cursor behavior entirely for these users. |
| Custom cursor is behind drawer/modal UI | Existing z-index tokens conflict with the cursor. Audit the current stacking context and place trail/cursor intentionally. |
| Custom cursor appears above critical dialogs | Cursor z-index is too aggressive. Do not allow it to sit above accessibility-critical full-screen dialogs or modal controls. |
| Trail animation feels like generic particles | The animation is using simple fade/scale. Use the intended `paper flick → settle → peel/fall` sequence with slight rotation, overshoot, hold, drop and fade. |
| Trail looks too busy | Asset size, density, or lifetime is too high. Increase `SPACING`, lower `MAX_ACTIVE`, reduce render size, or shorten `LIFETIME`. |
| Trail feels invisible | Asset sizes are too small or contrast is too low. Increase size slightly or strengthen edge contrast, but do not exceed the visual dominance of page content. |
| Cursor labels obscure content | Semantic labels are appearing too often or too close to the pointer. Show them only on high-value interactions and offset them away from the target. |
| Cursor breaks text links or buttons | `pointer-events` is accidentally enabled on the cursor/trail elements. Confirm all decorative cursor layers use `pointer-events: none`. |
| Cursor stalls over embedded content | Cross-origin iframes cannot be tracked normally. Let native cursor behavior take over within iframe regions rather than faking continuity. |
| Section-aware theme does not change | `data-cursor-theme` is not being detected or context state is stale. Verify the nearest active section is resolved on pointer movement/enter. |
| Wrong trail theme persists after leaving a section | Theme reset logic is missing. Restore `default` when pointer leaves themed sections or no themed ancestor is found. |

---

# 67. VIDEO / EMBED TROUBLESHOOTING

The portfolio contains YouTube/Vimeo media and click-to-load video players. These can interact with the custom cursor system.

| Problem | Likely cause / fix |
|---|---|
| Embedded YouTube video is blank | Check Content Security Policy and confirm `https://www.youtube-nocookie.com` is explicitly allowed in `frame-src`. |
| Vimeo embed fails | Confirm `https://player.vimeo.com` is allowed only if Vimeo is actually used. Remove unnecessary permissions if not needed. |
| Video layout jumps when iframe mounts | Reserve space before loading using `aspect-ratio: 16 / 9` or an equivalent responsive container. |
| Portfolio loads many slow video iframes | Only mount the active product’s active video. Use poster-first, click-to-load behavior and lazy loading. |
| Custom cursor gets stuck when entering/leaving a video | Disable custom trail interaction on the media wrapper and restore cursor state on pointer leave. |
| Cursor appears over native YouTube controls | Use `data-no-trail` on the player wrapper and allow the native cursor in iframe interaction areas. |
| Video poster is visible but playback fails | Confirm the embed URL/provider configuration is valid and the CSP allows the exact host. |
| Video causes poor page performance | Defer iframe mounting, lazy-load below-the-fold players, and avoid multiple simultaneous embeds. |

---

# 68. GLOBAL LAYOUT GUARDRAILS

Use these guardrails throughout the site because the portfolio contains large paper layers, banners, media, and positioned illustration assets.

```css
html,
body {
  overflow-x: clip;
}
```

Important:

- `overflow-x: clip` is a safety net, not an excuse to ignore genuinely oversized elements.
- Identify and fix the real source of overflow whenever possible.
- Keep large decorative assets inside local wrappers using `overflow: hidden` or `clip` where appropriate.
- Avoid viewport-width calculations that ignore scrollbar or container padding.
- Re-test at narrow desktop, tablet, and mobile widths after adding cursor or trail layers.

---

# 69. LOCAL DEVELOPMENT / ENVIRONMENT TROUBLESHOOTING

Some cursor and media behavior differs between local-file previews and an actual local/dev server.

| Problem | Likely cause / fix |
|---|---|
| Assets or embeds fail when opened directly as a local file | Do not test the site through `file://`. Use the project’s normal Next.js/Vite/dev server so browser security, module loading, CSP, fetch, and media behavior match deployment more closely. |
| Asset paths work locally but fail after deployment | Use public-root-safe URLs such as `/cursor/trail/paw.webp` rather than filesystem-relative paths that depend on current route depth. |
| Trail works on one route but not another | A route-specific layout may not include the root cursor provider/component. Mount `PortfolioCursor` and `PaperTrail` at the shared app/layout level. |
| Hot reload creates duplicate pointer handlers | Event listeners are not cleaned up on component unmount/reload. Ensure all global listeners are removed in cleanup. |
| Trail duplicates after navigation | The cursor/trail component is mounted more than once. Confirm a single global mount in the app shell. |

---

# 70. PERFORMANCE DEBUG CHECKLIST

If the effect causes frame drops, follow this order before removing the feature:

1. Confirm active trail elements never exceed `MAX_ACTIVE`.
2. Confirm cursor position is updated via `requestAnimationFrame`, not React render state on every move.
3. Confirm trail elements animate only `transform` and `opacity`.
4. Confirm Web Animations API nodes are removed on completion.
5. Confirm asset source dimensions are optimized (~400px longest side).
6. Confirm cursor assets are not loaded at LCP-critical priority.
7. Reduce `MAX_ACTIVE` from 18 → 14 if necessary.
8. Increase `SPACING` from 110 → 125 if necessary.
9. Reduce max rendered width from 125 → 110 if necessary.
10. Disable velocity-based size growth if it creates excess visual load.
11. Verify there are no expensive `filter`, blur, backdrop-filter, or layout animations on each item.
12. Profile on a mid-range laptop, not only a high-end development machine.

Target:

- no noticeable pointer lag
- no scroll jank
- no impact on video playback
- no material regression to Core Web Vitals

---

# 71. TRAIL ASSET QA CHECKLIST

Before shipping every Higgsfield-generated artifact:

- [ ] true alpha transparency exists
- [ ] no white matte/halo
- [ ] silhouette is readable at 80px
- [ ] no hidden background rectangle
- [ ] no unwanted watermark/text
- [ ] palette matches portfolio
- [ ] style matches other cursor assets
- [ ] optimized copy is ~400px longest side
- [ ] final asset is not needlessly multi-megabyte
- [ ] transparent padding is reasonable
- [ ] asset still looks good on both cream and navy test backgrounds

Do not accept generated assets solely because they look good at full resolution. They must work as tiny moving paper artifacts.

---

# 72. CURSOR SAFETY CHECK BEFORE SHIPPING

Before final sign-off, deliberately test failure cases:

- disable JavaScript → native cursor must remain usable
- enable reduced motion → trail disappears
- use trackpad/touch → no fake cursor should mount
- hold mouse and drag across page → no text-selection lock after release
- drag out of browser window → pressed state resets
- switch browser tab mid-drag → pressed state resets
- open Ask Tushky → trail disabled inside chat
- hover video → native media controls remain usable
- open modal/evidence drawer → cursor does not block controls
- navigate between routes → only one cursor/trail instance remains
- resize browser while trail is active → no overflow/stuck items

If any failure affects core navigation or readability, disable the effect on that surface rather than forcing it through.

---

# UPDATED FINAL INSTRUCTION

The Paper Trail Cursor must remain a **controlled Easter egg and interaction layer**, not a dominant visual feature.

The portfolio content, case studies, Tushky, and product work remain the focus.

Use troubleshooting feedback to tune the system conservatively:

**precision → accessibility → performance → reliability → delight**

If the effect introduces horizontal overflow, pointer ambiguity, iframe conflicts, text-selection bugs, or noticeable frame drops, reduce or disable the effect on that surface instead of compromising the underlying experience.
