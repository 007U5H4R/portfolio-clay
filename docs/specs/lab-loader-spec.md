# Gummy Lab — Premium Paper Lab Machine Loading Bar
## Master Implementation Prompt for Claude Code / Claude Opus

### 1. Mission

Redesign and implement a premium, animated loading experience for my existing Gummy Lab game inside my personal portfolio.

My portfolio uses a **3D paper-cut aesthetic**: layered paper, tactile depth, soft shadows, torn edges, editorial typography, subtle parallax, and playful physical objects.

The Gummy Lab game already exists, and its physics and gameplay are working well.

**Your scope is the loading component and its integration with the existing game-loading lifecycle. Do not rebuild the game or unnecessarily modify its physics.**

The loading experience should feel like a miniature mechanical paper sculpture that doubles as a progress indicator:

- A miniature paper laboratory assembling itself.
- A handcrafted mechanical machine coming to life.
- A glossy gummy bear travelling along a paper conveyor.
- A premium interactive artifact consistent with the portfolio.
- A coherent experience in light and dark modes.

Target quality: **luxury paper craft + mechanical illustration + premium motion design**.

Avoid generic SaaS loaders, flat CSS progress bars, neon gaming HUDs, glassmorphism, and excessive decoration.

---

### 2. Inspect the existing project first

Before writing code:

1. Inspect the repository structure and identify the Gummy Lab route and entry point.
2. Locate the existing intro screen and game scene.
3. Identify how models, textures, fonts, and other assets are loaded.
4. Determine how the application currently knows when loading is complete.
5. Inspect the existing light/dark theme implementation.
6. Identify the animation library and rendering technology already in use.
7. Reuse existing components, theme tokens, assets, and dependencies wherever possible.

Do not assume the project uses a particular framework or asset-loading API. Inspect it first.

Create a short implementation plan, then implement the component directly in the existing codebase.

### 3. Visual concept — The Paper Lab Machine

The loading indicator is the hero. It should occupy the central visual area without becoming a full-screen, heavily illustrated scene.

#### A. Mechanical paper conveyor

Create a long horizontal conveyor made from several physically layered paper strips.

- Warm cream paper for the upper track.
- Slightly darker parchment for the underside.
- Thin terracotta accents.
- Visible paper thickness along the edges.
- Soft contact shadows beneath each layer.
- Tiny irregularities that suggest hand-cut construction.
- A recessed channel through which the progress fill travels.

The conveyor should feel like a physical miniature machine assembled by hand.

#### B. Paper gears

Place two or three gears near the left side of the conveyor and one or two smaller gears near the right.

- Layered cut-paper construction.
- Muted terracotta, parchment, and dusty blue.
- Visible central hubs and paper-thickness details.
- Slow, restrained rotation.
- Slightly different rotation speeds.
- Tiny shadows between overlapping components.

Gears should communicate that the laboratory is preparing something. They must not dominate the gummy or progress indicator.

Keep the number of gears limited. The result should be art-directed, not cluttered.

#### C. Gummy progress indicator

A small translucent, glossy gummy bear travels along the conveyor.

- Warm amber, caramel, or coral gummy material.
- Soft studio highlights.
- Subtle internal light.
- Rounded, gelatinous silhouette.
- Gentle squash-and-stretch animation.
- Tiny bounce at meaningful loading milestones.

The gummy is the main character of the loading experience.

Its position must correspond to actual progress when determinate progress is available. It must not randomly move ahead of loading.

#### D. Progress fill

The conveyor track gradually fills with a translucent terracotta/coral material.

- Restrained warm highlight.
- Subtle layered depth.
- Clean, readable leading edge.
- Slight gloss on the filled portion.
- Darker underside to reinforce depth.

The fill should not look like liquid spilling across the interface.

#### E. Experiment notes

Use a maximum of two or three small paper details around the machine:

- A clipped-on note marked `LOADING...`.
- A small paper label showing the current loading stage.
- An optional handwritten annotation such as `Almost there...`.

These are supporting details, not additional dashboards.

Do not surround the loader with books, jars, foliage, shelves, and dozens of props. Keep the composition focused on the machine.

### 4. Layout and visual hierarchy

The loading component should be compact and readable.

Suggested composition:

```text
             TUSHAR'S SECRET LAB

                 Gummy Lab

           Preparing the playground...

     [gears] ═══ PAPER CONVEYOR ═══ [gear]
                       🧸
             ━━━━━━━━━━━━━━━━━━━━━
                  68% LOADED

             BUILDING THE WORLD
```

This is a structural reference, not a literal layout to copy.

The final layout should feel like a physical miniature object with restrained editorial typography.

Recommended hierarchy:

1. Conveyor and gummy.
2. `Gummy Lab` title.
3. Actual loading progress.
4. Current loading stage.
5. Small decorative paper notes.

Use existing portfolio typefaces where possible.

- Display title: editorial serif consistent with the portfolio.
- Progress percentage: clear and highly legible.
- Stage label: restrained uppercase sans-serif.
- Handwritten type: only for small annotations.

Do not introduce unnecessary fonts just for this component.

### 5. Light mode — Sunlit Paper Studio

Use the existing light theme and align with the portfolio's paper-cut design.

Suggested palette:

- Background: warm cream, approximately `#EBD7C6`.
- Primary paper: ivory, approximately `#F8F0E5`.
- Secondary paper: parchment, approximately `#D9BBA5`.
- Terracotta: approximately `#B84A2B`.
- Muted blue: approximately `#829BA4`.
- Text: deep navy, approximately `#17223F`.
- Gummy: warm amber/coral.

These are starting points. Inspect existing theme tokens and use them if suitable.

Lighting should feel like soft daylight from the upper-left:

- Warm ambient illumination.
- Gentle shadows.
- Subtle highlights on the gummy.
- Visible paper edges.
- No harsh specular lighting.

The result should feel tactile, calm, warm, and premium.

### 6. Dark mode — Midnight Paper Laboratory

Dark mode must be designed intentionally. Do not simply invert the light theme.

Use:

- Background: deep charcoal/navy, approximately `#151A23`.
- Primary paper: charcoal, approximately `#232A33`.
- Secondary paper: `#303945`.
- Terracotta accents: warm copper.
- Text: warm ivory.
- Gears: charcoal, muted blue, and copper.
- Gummy: glowing amber/coral, with restrained highlights.

Lighting should feel like a small laboratory illuminated by a warm desk lamp:

- Warm amber key light.
- Soft edge lighting around the conveyor.
- Copper highlights on the gears.
- Subtle separation between paper layers.
- Gently luminous gummy.
- Dark, soft shadows that preserve dimensionality.

Paper must still look matte and fibrous. Do not turn the scene into glass or polished metal.

Use the portfolio's existing theme state. When the user switches themes, the loader should update without a page reload. If the theme changes during loading, transition colors and lighting smoothly without flashing or remounting the game.

### 7. Animation specification

Use purposeful, lightweight animation.

#### Initial appearance

- Outer paper track settles into position.
- Gear hubs make a small mechanical movement.
- Progress track becomes visible.
- Gummy appears with a tiny squash-and-settle.
- Loading label fades in.

#### During loading

- Gears rotate slowly.
- Progress fill advances in response to real loading progress.
- Gummy moves along the conveyor when progress advances.
- Gummy makes a subtle bounce at stage transitions.
- A small paper note may shift by one or two pixels.
- Highlights remain restrained.

Avoid continuously animating every object. Most of the scene should remain still.

#### Milestones

At meaningful progress milestones, when supported by the real loading lifecycle:

- Relevant stage label changes.
- Gummy briefly squashes and rebounds.
- A gear makes a small additional turn.
- Progress fill settles into its new position.

Avoid loud particle explosions and excessive bounce.

#### Completion

When the game is actually ready:

1. Bring progress to completion.
2. Let the gummy make one small celebratory bounce.
3. Let the machine settle.
4. Fade or fold the loading component away.
5. Reveal the existing Gummy Lab intro scene.

The transition should take approximately 300–600 ms, provided the game is already ready.

Never delay gameplay just to finish an animation. If loading completes during the transition, finish the transition immediately or shorten it.

### 8. Real progress — critical technical requirement

The progress indicator must reflect the actual loading lifecycle. Do not use a fake timer that always advances from 0% to 100%.

Inspect how the application loads its scene and assets. Where possible, track meaningful stages such as:

- `Preparing assets`
- `Loading assets`
- `Building the world`
- `Calibrating physics`
- `Almost ready`

Adapt labels to what the code actually does. Do not imply physics is being calibrated if no such process occurs.

If the current loader does not expose granular progress, introduce a small loading-state abstraction only if it can be done safely.

For example:

```ts
type LoadingState = {
  progress: number | null;
  stage: string;
  isReady: boolean;
};
```

This is illustrative; adapt it to the existing architecture.

Rules:

- `progress` is a number from 0 to 100 when determinate.
- `progress: null` represents indeterminate loading.
- `isReady` reflects actual game readiness.
- Progress must never reach 100% before the game is ready.
- Do not claim all assets are loaded when only the initial scene is ready.
- Do not alter the physics engine to accommodate the loader.

If true progress is unavailable, use an indeterminate conveyor animation with a label such as `Preparing the playground...`. Do not display a fabricated percentage.

### 9. Loading component lifecycle

The loading component should appear only when appropriate.

1. Entering Gummy Lab shows the loader while required resources initialize.
2. The loader remains visible until the game is ready to display.
3. The existing intro appears once loading completes.
4. Starting gameplay must not re-trigger loading unnecessarily.
5. Navigating back to the portfolio must clean up loader-specific animation resources.
6. Re-entering Gummy Lab should work reliably.
7. Failed loading should display a graceful retry option rather than remaining stuck indefinitely.

Avoid duplicate loading screens, flicker, and unnecessary remounts.

### 10. Component architecture

Adapt this to the existing project rather than blindly introducing a new structure.

```text
GummyLabLoader
├── LoaderBackdrop
├── LoaderHeader
├── PaperMachine
│   ├── PaperConveyor
│   ├── PaperGears
│   ├── ProgressFill
│   └── GummyIndicator
├── ProgressReadout
├── LoadingStage
└── OptionalErrorState
```

Keep the loading lifecycle separate from visual presentation where practical.

The visual component should receive loading state through props or the project's existing state-management approach.

Avoid introducing global state for a component that can use local state.

### 11. Higgsfield assets and implementation strategy

First decide whether the machine can be rendered efficiently using the existing technology.

Preferred order:

1. Existing 3D scene and materials.
2. CSS/SVG layered paper elements for the conveyor and gears.
3. Existing image-generation assets for non-interactive decorative details.
4. Higgsfield-generated assets where they materially improve visual quality.

Do not generate a full-screen background image and place fake progress text over it. Progress, percentage, loading stage, theme switching, and gummy position must remain live and controllable.

If using Higgsfield:

- Generate the machine's static art direction or isolated decorative assets.
- Keep critical text and progress fill in the application.
- Use generated artwork as a visual reference or asset, not as a substitute for functional UI.
- Avoid baked-in percentages, text, or loading stages.
- Preserve negative space around the machine.
- Ensure assets work in both light and dark themes.

Do not add Blender, Three.js, or another rendering engine just for the loader unless the existing architecture makes it genuinely necessary.

### 12. Performance and accessibility

The loader must not make the application slower.

- Avoid large textures and unnecessary dependencies.
- Avoid expensive per-frame React state updates.
- Prefer CSS transforms for lightweight animation.
- Clean up animation frames, event listeners, and observers.
- Avoid excessive blur and full-screen filters.
- Keep the component responsive.
- Respect `prefers-reduced-motion`.
- Maintain readable contrast.
- Provide accessible progress semantics where appropriate.
- Do not communicate progress through color alone.

For reduced-motion users:

- Stop decorative gear rotation or make it static.
- Remove parallax and repeated bouncing.
- Keep the progress indicator functional.
- Use a simple fade transition into the intro.

### 13. Responsive behavior

**Desktop**
- Full conveyor and gear composition.
- Comfortable negative space.
- Clear title and stage label.

**Tablet**
- Reduce decorative details.
- Keep the full conveyor visible.
- Scale gears down proportionally.

**Mobile**
- Use a compact horizontal conveyor where possible.
- Prevent horizontal page overflow.
- Preserve the gummy and progress percentage.
- Remove nonessential notes and decorations.
- Keep the stage label legible.
- Avoid making the loader taller than necessary.

Do not simply shrink the desktop scene until details become illegible.

### 14. Verification checklist

After implementation, verify:

- Loader appears when the game needs to load.
- Loader disappears when the game is ready.
- The game intro still works.
- Existing gameplay and physics remain unchanged.
- Real progress is used where available.
- Indeterminate loading does not show a fake percentage.
- Light mode looks intentional.
- Dark mode looks intentional.
- Theme switching works during loading.
- Mobile layouts do not overflow.
- Reduced-motion behavior works.
- Retry behavior works if loading fails.
- There are no console errors.
- Existing build, lint, and type checks pass where configured.

Inspect the actual result in the browser if browser tooling is available. Do not claim visual verification or test success if it was not performed.

### 15. Final quality bar

The result must not look like a default loading bar with decorations added around it.

It should feel like a **tiny paper machine built specifically to prepare the Gummy Lab world**.

The machine should have physical depth. The gummy should feel alive. Progress should be honest. Light and dark themes should both feel art-directed. The transition should lead naturally into the existing intro.

Preserve the working game. Implement the loader, integrate it with actual readiness, verify it, and report the files changed and any limitations.

---

# HIGGSFIELD PROMPT — PAPER LAB MACHINE

## Primary prompt: Light Mode asset

Create a premium, highly detailed 3D paper-craft product illustration of a miniature mechanical loading machine for a playful portfolio Easter egg called “Gummy Lab.”

**Art direction:** luxury paper sculpture, Japanese stationery, editorial art direction, premium handcrafted packaging, sophisticated miniature diorama, tactile layered paper, warm studio photography.

The composition is centered around a long, horizontal paper conveyor machine built from stacked ivory and parchment paper strips. The conveyor has clearly visible paper thickness, tiny cut edges, warm terracotta accents, and realistic contact shadows. A few overlapping gears sit near the left and right ends. The gears are constructed from layered paper discs and cut-paper teeth, with muted dusty-blue, cream, and terracotta surfaces.

A small, adorable translucent amber-coral gummy bear stands on the conveyor. It has a glossy gelatinous surface, rounded silhouette, subtle internal glow, soft studio highlights, and an expressive but restrained face. It should resemble premium gummy candy rather than a plastic toy.

The conveyor includes a clean recessed track with a partially filled terracotta-coral progress segment. The progress segment has a slightly glossy surface and a precise leading edge. Leave enough clear space for a live progress indicator to be added by the application.

Add only a few small supporting details: a clipped-on paper note, one or two tiny paper labels, and subtle mechanical hubs. Avoid clutter.

**Palette:** warm ivory, cream, parchment, muted terracotta, dusty blue, deep navy, amber-coral gummy.

**Lighting:** soft warm daylight from the upper-left, delicate contact shadows, subtle ambient occlusion, controlled glossy highlights on the gummy, realistic shadows between paper layers.

**Composition:** centered horizontal machine, clear silhouette, generous negative space above and below, clean readable conveyor, strong material hierarchy, premium handcrafted miniature photographed in a studio. Wide 16:9 composition.

The result should feel physical, elegant, playful, and sophisticated. Every paper layer should have believable thickness and depth. The machine must remain visually legible at a small UI size.

**Important:** the application will render the actual title, progress percentage, progress fill, and loading-stage text. Do not bake readable text, logos, numbers, or percentages into the artwork. Keep the main conveyor area clean and unobstructed.

## Dark Mode variation

Use the same composition and geometry, but reinterpret the scene as a midnight paper laboratory.

Replace the warm ivory background with deep charcoal and navy paper. Use tonal layers of charcoal, slate, and dark blue to preserve paper depth. Keep the conveyor constructed from matte dark paper with restrained copper and terracotta details. The gears should have layered dark-paper surfaces and warm copper hubs.

Illuminate the machine with a warm amber desk-lamp glow from the upper-left. Add subtle rim lighting to reveal paper edges. The gummy should glow gently in amber-coral, with controlled highlights and a soft internal luminous quality. Preserve dark negative space and avoid neon.

The mood should feel intimate, mysterious, premium, and tactile—like a secret miniature laboratory after dark.

Keep the exact same layout and machine proportions as the light version so both themes can be used interchangeably in the same component.

## Negative prompt

Avoid flat vector illustration, generic SaaS UI, glassmorphism, neon cyberpunk, excessive bloom, oversaturated candy colors, plastic-looking paper, smooth featureless surfaces, excessive props, busy backgrounds, random floating objects, unreadable text, misspelled words, baked-in progress percentages, fake interface controls, watermarks, logos, extreme perspective, cropped conveyor ends, distorted gears, malformed gummy anatomy, and excessive cartoon styling.

## Optional Higgsfield motion prompt

If generating a short looping motion asset, animate only the decorative machine elements:

- Paper gears rotate slowly and continuously.
- The gummy makes a tiny, gentle squash-and-settle.
- A small mechanical hub moves subtly.
- Lighting remains stable with minimal shimmer.
- The camera stays locked.
- The conveyor and its overall shape remain fixed.
- The animation loops seamlessly.

Do not animate the actual progress percentage or pretend the asset knows when loading has completed. The real application controls the live progress fill and gummy position.

The loop should be subtle enough to remain in the background for several seconds without distracting the user.

### Final instruction

Use the generated image as an art-direction reference or decorative asset. Implement the actual loading bar, progress state, theme switching, accessibility, and completion transition in the portfolio code.

The final experience should feel like a tiny handcrafted paper machine preparing a living gummy world—not a video playing while the website loads.
