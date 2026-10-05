# KEEP THE GUMMY ALIVE — CLAUDE CODE IMPLEMENTATION PROMPT

You are Claude Code working as a senior creative technologist, interaction designer, game designer, WebGL engineer, 3D pipeline engineer, and frontend architect.

Your task is to design and implement a hidden, highly polished, physics-driven Easter egg game inside my existing portfolio website.

The game is called:

# KEEP THE GUMMY ALIVE

It should feel like the kind of hidden delight users used to discover in Android version Easter eggs: unexpected, playful, memorable, and completely optional.

The main portfolio should remain professional. The game is a secret layer underneath it.

---

# 1. CORE IDEA

When a visitor rapidly clicks either:

- "Tushar Pathak"
- or the "TP" monogram

five times, they discover a hidden interactive experience.

The fifth click should transition the user into a secret game called:

# Gummy Lab
## Keep the Gummy Alive

The player controls a cute translucent gummy bear inside a playful physics arena.

Their objective is simple:

> Keep the gummy bear alive for as long as possible by bouncing, dragging, flicking, squishing, launching and rescuing it before it stays inside dangerous zones for too long.

The gameplay must prioritize:

- tactile interaction
- satisfying physics
- jelly deformation
- personality
- visual delight
- short replayable sessions

This is NOT intended to become a large standalone game.

Target experience length:

30–60 seconds per run.

---

# 2. DESIGN PHILOSOPHY

The experience must feel:

- premium
- playful
- soft
- tactile
- highly polished
- charming
- slightly mischievous
- visually connected to my portfolio

Avoid:

- childish mobile-game clutter
- excessive HUD
- generic game UI
- cartoon overload
- casino-like visual effects
- aggressive sounds
- excessive tutorials
- complicated mechanics

Think:

"Apple-level interaction polish meets experimental WebGL candy physics."

The interface should remain minimal enough that the gummy bear is always the hero.

---

# 3. TECH STACK

Use the existing portfolio stack where sensible.

Preferred implementation stack:

- Next.js
- React
- TypeScript
- Three.js
- React Three Fiber
- @react-three/drei
- @react-three/rapier
- Zustand
- GSAP
- custom GLSL where needed
- Web Audio API or existing audio system
- localStorage for high score / achievements only

For 3D asset creation, modeling, cleanup, rigging, morph targets, UVs, materials, collision meshes, baking, or export optimization:

- Blender may and should be used whenever it materially improves quality, stability, or performance.

Do NOT introduce unnecessary dependencies.

Prefer performant GPU-based visual effects over heavy DOM animation.

---

# 4. BLENDER / 3D ASSET PIPELINE

You are explicitly allowed to use Blender as part of this task.

Do not treat Blender as an optional afterthought if the final experience would materially benefit from authored 3D assets.

Use Blender when needed for:

- creating the original gummy bear model
- refining proportions and silhouette
- sculpting smooth rounded forms
- generating clean topology
- building facial geometry
- creating eyes / mouth / nose
- creating morph targets / shape keys
- authoring squash and stretch shapes
- ear / arm / belly deformation targets
- UV preparation if textures are required
- material previewing
- normal cleanup
- mesh simplification
- LOD preparation
- collision geometry
- convex hull proxy generation
- separating gameplay-relevant mesh regions
- origin / pivot correction
- scale normalization
- GLB export
- animation clips if useful
- baking textures or normals
- reducing draw calls
- performance optimization

The gummy bear must be an ORIGINAL generic gummy bear character.

Do not reproduce a branded or copyrighted gummy bear design.

Preferred visual character:

- rounded head
- small round ears
- chubby belly
- stubby arms
- short legs
- cute minimal face
- soft silhouette
- slightly oversized head
- premium candy-product proportions

The bear should remain recognizable even as a silhouette.

---

# 5. BLENDER MODEL REQUIREMENTS

If using Blender, create the gummy bear with gameplay use in mind.

Recommended structure:

GummyBear
├── Body
├── Eyes
├── Mouth
├── Nose
└── optional internal/highlight geometry

Prefer one optimized skinned or morph-capable body mesh when possible.

Avoid excessive mesh separation.

Recommended topology goals:

- deformation-friendly loops around:
  - belly
  - head
  - ears
  - shoulders
  - arms
  - legs

Keep polygon count appropriate for web use.

Suggested target:

Desktop hero model:
~15k–50k triangles depending on visual requirements.

Mobile fallback:
lower LOD if necessary.

Do not ship unnecessarily dense sculpt geometry.

---

# 6. SHAPE KEYS / MORPH TARGETS

If Blender morph targets improve the result, create shape keys such as:

Basis

SquishVertical
StretchVertical
SquishHorizontal
BellyImpact
HeadWobbleLeft
HeadWobbleRight
EarBounceLeft
EarBounceRight
ArmLagLeft
ArmLagRight
Happy
Surprised
Worried
Dizzy

Do not necessarily activate all simultaneously.

Use them as a controlled visual-deformation layer over Rapier movement.

The runtime may blend:

shader deformation
+
morph targets
+
rigid-body movement.

Choose the combination that looks best and remains performant.

---

# 7. COLLISION GEOMETRY

Do NOT use a dense rendered gummy mesh as the physics collider unless performance proves acceptable.

Create simplified collision geometry.

Possible approach:

- one main convex hull
- optional secondary hulls for head/body
- compound collider if needed

Gameplay physics should be stable and predictable.

The rendered mesh may deform visually without forcing the physics collider to deform identically.

This separation is intentional.

---

# 8. GLB EXPORT

When exporting Blender assets:

- use glTF / GLB
- apply transforms
- normalize scale
- confirm correct forward/up orientation
- remove unused materials
- remove hidden geometry
- preserve required morph targets
- preserve animation clips only if used
- use Meshopt or Draco where appropriate
- inspect exported asset in the actual R3F scene

Do not assume a Blender viewport appearance will exactly match WebGL rendering.

Tune final materials inside the browser.

---

# 9. ENTRY / SECRET TRIGGER

The Easter egg should activate only when the user performs:

5 clicks on "Tushar Pathak" or "TP"

within approximately:

3–4 seconds.

The click sequence should progressively hint that something is happening.

## Click 1

Subtle scale compression.

Example:

scale 1 → 0.96 → 1

Very subtle.

## Click 2

Tiny elastic wobble.

## Click 3

A faint gummy-like glow appears.

One or two tiny translucent candy particles appear.

## Click 4

The name becomes partially gelatinous.

Letters briefly stretch.

Tiny gummy droplets appear nearby.

## Click 5

The name transforms into translucent gummy typography.

The UI around it softens/fades.

The gummy lettering stretches, melts and expands into the transition.

The user is pulled into the hidden world.

Do NOT simply perform:

window.location.href = "/game"

The entry must feel transformational.

---

# 10. ROUTING

Use a dedicated route:

/gummy-lab

However, animate the transition so the user feels as though the existing portfolio transformed into this world.

Preserve enough context to allow a smooth return.

If possible:

store return location.

Example:

returnRoute = current pathname

Default fallback:

/

---

# 11. GAME INTRO SCREEN

After the transition, present a short introduction.

Visual:

Large glossy gummy bear standing in the center.

Soft cream / peach / blush environment.

Beautiful product-photography lighting.

Typography:

GUMMY LAB

Subheading:

Keep the Gummy Alive

Optional handwritten microcopy:

"You found the secret lab."

Show only the essential instructions:

DRAG
FLICK
BOUNCE
SQUISH
DON'T LET IT FALL

Primary button:

LET'S PLAY →

Do not create a long tutorial.

Users should understand the game in seconds.

---

# 12. THE GUMMY BEAR

The gummy bear is the core of the entire experience.

It must feel:

- soft
- elastic
- translucent
- glossy
- slightly squishy
- weighted
- reactive

The bear must NOT feel like:

- hard plastic
- rigid toy
- rubber ball
- static GLB

Use:

MeshPhysicalMaterial and/or custom shader.

Suggested visual properties:

transmission: high
roughness: ~0.2–0.35
thickness: moderate
IOR: candy-like
clearcoat: subtle
specular response: strong but controlled

The material should allow light to travel through the gummy.

---

# 13. GUMMY PHYSICS

The gummy should respond physically to:

- collisions
- dragging
- flicking
- landing
- squishing
- bounce pads
- moving platforms
- walls

Use Rapier for rigid-body simulation.

But do NOT rely entirely on rigid-body physics for appearance.

Combine:

Rigid-body movement
+
visual deformation

The object can remain physically rigid internally while visually appearing soft.

---

# 14. JELLY DEFORMATION

Implement visually convincing gummy wobble.

Use a deformation system based on:

- impact energy
- impact direction
- velocity
- angular velocity
- time since collision

Maintain values such as:

jellyEnergy
impactDirection
impactPoint
impactTime

When a collision occurs:

jellyEnergy += collisionVelocity * multiplier

Then gradually damp it.

Conceptual behavior:

impact
→ compression
→ overshoot
→ oscillation
→ damping
→ rest

The bear should exhibit:

- belly wobble
- ear jiggle
- arm lag
- head wobble
- slight squash/stretch

Avoid extreme deformation that makes the bear look broken.

If Blender morph targets provide a better result than pure shader deformation, use them.

A hybrid approach is encouraged:

physics event
→ calculate impact energy
→ drive morph weights
→ add subtle shader ripple
→ damp back to neutral.

---

# 15. PRIMARY GAMEPLAY

The player must prevent the gummy bear from staying in the danger zone.

The arena should include:

- platforms
- spring pads
- launch pads
- floating rings
- soft barriers
- bumpers
- moving platforms

There should be a clear danger zone at the bottom.

Possible visual treatment:

warm red gummy liquid / glowing jelly floor.

Do NOT make it violent.

The danger area should feel playful.

---

# 16. SURVIVAL RULE

The gummy is allowed to briefly touch the danger zone.

Do NOT instantly kill the player.

Instead:

Danger contact begins a visible countdown.

Example:

1.2 seconds until elimination.

During that time:

- gummy glows
- UI pulses
- small rescue indicator appears

If the player pulls or launches the gummy out of the zone:

the countdown cancels.

This creates dramatic "save it!" moments.

---

# 17. PLAYER INTERACTIONS

## TAP / CLICK

Quickly squishes the gummy.

Useful for:

- bouncing
- changing momentum
- triggering nearby pads

## DRAG

Grab gummy using pointer interaction.

The bear should stretch slightly toward the pointer.

Do not rigidly teleport the body.

Instead use:

spring-like attraction.

## FLICK

Pointer velocity at release generates impulse.

The faster the flick:

the stronger the launch.

Cap extreme values.

## SQUISH

Pressing/holding compresses gummy.

On release:

stored elastic force creates a bounce.

This can become a skill mechanic.

---

# 18. SCORING

Keep scoring simple.

Primary score:

SURVIVAL TIME

Secondary score sources:

- rings collected
- stars collected
- targets hit
- successful saves
- combo actions

Example:

Score:
1,280

Time:
00:24

Combo:
x3

Avoid multiple confusing currencies.

---

# 19. COMBO SYSTEM

A combo increases when the user performs successful actions close together.

Examples:

bounce pad
→ ring
→ bumper
→ star

Combo:

x2
x3
x4
x5

Combo slowly decays if no useful interaction occurs.

Provide satisfying but restrained feedback.

Avoid huge arcade text covering the scene.

---

# 20. DIFFICULTY PROGRESSION

Difficulty should evolve during the run.

## 0–10 seconds

Calm.

- stable platforms
- normal gravity
- slow movement

## 10–20 seconds

Arena begins moving.

- moving platforms
- rotating bumper
- more collectibles

## 20–35 seconds

Physics becomes more dynamic.

Possible changes:

- stronger gravity pulses
- disappearing platforms
- moving walls
- wind impulse

## 35–50 seconds

Chaos phase.

But maintain fairness.

Examples:

- low-gravity shifts
- bounce pads reposition
- obstacles move faster
- danger floor rises slightly

## 50+ seconds

"LAB UNSTABLE"

Difficulty increases progressively.

Do not suddenly make survival impossible.

---

# 21. POWER-UPS

Power-ups should appear occasionally.

Use four primary types.

## SUPER SQUISH

Icon:
lightning

Effect:

Next squish stores significantly more elastic force.

Result:

massive bounce.

Duration:

single use or ~5 sec.

---

## LOW GRAVITY

Icon:
feather

Effect:

gravity becomes lighter.

The gummy floats and moves slowly.

Duration:

~6–8 seconds.

Visual:

slight purple/blue ambience.

---

## RAINBOW MODE

Icon:
rainbow

Effect:

gummy cycles through candy colors.

Bonus multiplier.

Slightly increased bounce.

Duration:

~7 seconds.

Do not make visuals overly saturated.

---

## GOLDEN GUMMY

Icon:
star / gold bear

Effect:

gummy temporarily becomes golden translucent candy.

Score multiplier.

Example:

x2 score.

Duration:

~5–7 seconds.

---

# 22. OPTIONAL RARE POWER-UP

Implement only if it does not clutter the experience.

## TIME FREEZE

Environment movement slows dramatically.

Gummy remains responsive.

Duration:

~3 seconds.

Use sparingly.

---

# 23. COLLECTIBLES

Use simple collectible objects:

rings
stars
small gummy droplets

Rings:

reward trajectory skill.

Stars:

reward exploration.

Tiny gummy droplets:

restore danger-zone timer or grant small bonus.

Do not fill the screen with collectibles.

---

# 24. EMOTIONAL CHARACTER

The bear should behave like a character.

Use subtle expressions.

Examples:

Normal:
happy.

High speed:
surprised.

Big bounce:
excited.

Danger:
worried.

Combo:
celebrating.

Long fall:
wide-eyed.

Power-up:
confident.

Game over:
dizzy but adorable.

Expressions can be created through:

- Blender shape keys / morph targets
- eye scaling
- mouth changes
- facial bones if genuinely helpful
- material animation

Do not use dialogue bubbles constantly.

---

# 25. PARTICLES

Use small restrained effects.

Examples:

impact sparkles
gummy droplets
star particles
power-up trails

Prefer:

instanced meshes
or GPU particles.

Target:

20–80 active particles.

Avoid hundreds of expensive DOM nodes.

---

# 26. SOUND DESIGN

Audio is important but optional depending on browser permission.

Sounds should include:

soft gummy squish
spring bounce
ring pickup
star pickup
power-up activation
danger warning
game over
secret-entry sound

Sound character:

soft
rubbery
candy-like
friendly

No aggressive arcade sound effects.

Respect:

prefers-reduced-motion

and audio mute state.

Include a small mute control if sound is enabled.

---

# 27. CAMERA

Camera should feel cinematic but stable.

Recommended:

PerspectiveCamera

FOV:

30–38 degrees.

Avoid first-person movement.

The camera may subtly:

- follow gummy position
- zoom during special moments
- shake 1–3 px equivalent on major impacts

Do not create motion sickness.

---

# 28. LIGHTING

Use product-photography lighting.

Key:

large soft light from upper left.

Fill:

weaker front-right light.

Rim:

soft rear highlight.

Environment:

studio HDRI or custom environment.

Ground:

soft shadow receiver.

Gummy should have beautiful internal illumination.

---

# 29. VISUAL ENVIRONMENT

Use:

warm cream
peach
soft pink
candy orange
occasional pastel cyan/green

Avoid rainbow overload outside power-up mode.

Arena objects should resemble:

- gummy candy
- soft acrylic
- translucent resin
- rounded toys

No sharp metallic industrial environment.

If Blender provides a better workflow for arena pieces such as ramps, bumpers, rings, spring platforms, candy portals, or decorative props, model and optimize those assets in Blender as well.

---

# 30. GAME UI

Persistent HUD should contain only:

Score
Combo
Time
Pause

Potential layout:

Top left:
SCORE

Top center:
COMBO

Top right:
TIME + pause

Exit should remain accessible but visually secondary.

Example:

← Back to Portfolio

Do not clutter with:

inventory
health bars
quest logs
multiple meters

---

# 31. DANGER UI

When gummy enters danger:

display a subtle ring around it.

Example:

SAVE THE GUMMY!

with countdown:

1.2
0.9
0.6
0.3

Avoid full-screen red overlays.

---

# 32. ACHIEVEMENTS

Use lightweight hidden achievements.

Store locally using localStorage.

Examples:

CURIOUS MIND
Discovered the secret lab.

WOBBLE MASTER
Reach x10 combo.

GUMMY OPERATOR
Survive 30 seconds.

PRODUCT SENSE
Hit four special targets during one run.

YOU REALLY FOUND IT
Discover a hidden interaction.

Achievements appear only as small toast cards.

No achievements page.

---

# 33. HIDDEN META DETAIL

Include four subtle special targets:

AI
PRODUCT
DESIGN
BUILD

They should be integrated visually into the arena, not look like corporate buttons.

If player hits all four during the same session:

Trigger:

TP MODE

Effects:

- slight environmental glow
- increased score multiplier
- TP gummy emblem appears
- short celebratory animation

This should be a rare surprise.

---

# 34. GAME OVER

Game over occurs when:

the gummy remains in the danger zone longer than the rescue timer.

Avoid anything resembling death.

Instead:

gummy melts/squishes into a puddle.

Then reforms on the results screen.

Show:

YOUR SCORE

example:

8,420

BEST SCORE

Combo

Time survived

Targets hit

Power-ups used

Then give the gummy a playful status:

"Certified Gummy Operator"

or:

"The gummy survived... mostly."

Buttons:

PLAY AGAIN

BACK TO PORTFOLIO

---

# 35. HIGH SCORE

Store only locally.

Use:

localStorage

Store:

bestScore
bestTime
maxCombo
achievements

Do NOT build authentication or backend leaderboard.

---

# 36. EXIT STRATEGY

Users must never feel trapped.

Support four exit mechanisms.

## Primary

Visible:

← Back to Portfolio

Top-left or top-right.

## Keyboard

ESC

## Results screen

Back to Portfolio button.

## Playful exit

Include a hidden/in-world gummy portal.

When activated:

gummy bear gets pulled toward portal.

It stretches into gummy material.

Transforms back into:

TP

The TP object flies toward the screen/header.

Transition restores portfolio.

---

# 37. EXIT ANIMATION

Preferred transition:

gummy
→ compress
→ stretch
→ spiral into candy vortex
→ become TP
→ screen brightens
→ portfolio returns

When possible, reverse visual elements from the entry transition.

The entire game should feel contained inside the portfolio universe.

---

# 38. RESPONSIVE BEHAVIOR

Desktop:

full physics experience.

Tablet:

same mechanics with simplified arena.

Mobile:

prioritize touch.

Support:

tap
drag
flick
hold

Do not require hover.

Reduce:

particle count
post-processing
shadow resolution
physics complexity

based on device capability.

If needed, use a lower-poly Blender-exported LOD on mobile.

---

# 39. PERFORMANCE TARGETS

Desktop target:

60 FPS.

Modern phone target:

45–60 FPS.

Use:

instancing
memoized geometry
GLB compression
Meshopt/Draco
limited rigid bodies
limited real-time lights
adaptive DPR
LOD where useful

Do not run unnecessary React state updates every frame.

Use refs for per-frame physics values.

Profile actual browser performance before finalizing.

---

# 40. REDUCED MOTION

Respect:

prefers-reduced-motion

When enabled:

- reduce camera motion
- remove strong screen shake
- reduce particles
- simplify transition
- reduce wobble amplitude

The game remains functional.

---

# 41. FILE ARCHITECTURE

Use approximately:

src/

app/
  gummy-lab/
    page.tsx

components/
  easter-egg/
    SecretTrigger.tsx
    EntryTransition.tsx
    ExitTransition.tsx

game/
  GummyLab.tsx
  GameScene.tsx
  Arena.tsx
  GameHUD.tsx
  ResultsScreen.tsx

game/gummy/
  GummyBear.tsx
  GummyMaterial.ts
  GummyExpressions.ts
  GummyController.ts

game/arena/
  Platform.tsx
  SpringPad.tsx
  Bumper.tsx
  DangerFloor.tsx
  MovingPlatform.tsx

game/powerups/
  PowerUp.tsx
  SuperSquish.ts
  LowGravity.ts
  RainbowMode.ts
  GoldenGummy.ts

game/effects/
  ParticleSystem.tsx
  ImpactEffects.tsx
  CameraEffects.tsx

game/state/
  gameStore.ts

game/audio/
  audioManager.ts

game/shaders/
  gummy.vert
  gummy.frag

public/
  models/
    gummy-bear.glb
    gummy-arena.glb
  audio/
  textures/

If Blender source files are created and project conventions allow source assets:

assets/
  blender/
    gummy-bear.blend
    gummy-arena.blend

Do not ship .blend files to the browser bundle.

---

# 42. GAME STATE MACHINE

Use explicit states.

Example:

IDLE
DISCOVERED
INTRO
COUNTDOWN
PLAYING
PAUSED
DANGER
GAME_OVER
RESULTS
EXITING

Avoid loosely coupled boolean flags.

---

# 43. PHYSICS STATES

Gummy controller should understand:

GROUND
AIRBORNE
DRAGGED
SQUISHED
BOUNCING
DANGER
POWERED

Use these to drive animations and expressions.

---

# 44. GAME LOOP

Simplified gameplay loop:

START
↓
Gummy drops
↓
Player keeps gummy moving
↓
Collect rings / stars
↓
Build combos
↓
Difficulty increases
↓
Power-ups appear
↓
Danger moments
↓
Rescue gummy
↓
Continue
↓
Eventually fail
↓
Results
↓
Replay or exit

---

# 45. FIRST SESSION EXPERIENCE

The first session must be self-explanatory.

Use contextual micro-instructions.

Example:

On first launch:

"Drag me."

After first drag:

"Now flick!"

After bounce:

"Keep me off the floor."

Then hide tutorials permanently for the session.

No tutorial modal.

---

# 46. POLISH DETAILS

Include subtle touches:

- gummy ears continue wobbling after body stops
- eyes track nearby cursor occasionally
- big impacts slightly deform facial expression
- bear waves on intro screen
- bear celebrates high combos
- particles leave short trails
- button presses feel slightly gelatinous
- power-up cards bounce gently when unlocked
- gummy stretches slightly toward drag direction
- shadows subtly compress when the gummy squashes
- large impacts create delayed ear/arm follow-through
- landing poses briefly flatten the belly/body
- gummy material reacts subtly to environmental light

These details matter more than adding extra mechanics.

---

# 47. DEVELOPMENT CONTROLS

During development, provide a hidden debug panel using Leva or internal controls.

Allow adjustment of:

gravity
bounce
friction
jelly intensity
damping
drag strength
flick multiplier
camera follow
power-up spawn rate
morph target strength
material transmission
roughness
thickness
IOR

Debug UI must NOT ship visibly in production.

---

# 48. ACCEPTANCE CRITERIA

The experience is finished only when:

1. Five rapid clicks reliably trigger the secret.
2. Slow/random clicks do not accidentally activate it.
3. Entry transition feels continuous.
4. Gummy looks translucent and soft.
5. Collisions create visible jelly deformation.
6. Drag/flick controls feel responsive.
7. Danger rescue mechanic works.
8. Score and combo work reliably.
9. Difficulty increases gradually.
10. Power-ups visibly change gameplay.
11. Mobile controls work.
12. Exit works at all times.
13. ESC exits on desktop.
14. Replay resets all game state.
15. High score persists locally.
16. Reduced-motion mode works.
17. Game runs smoothly.
18. Existing portfolio remains unaffected.
19. No console errors.
20. No memory leaks after repeated entry/exit.
21. Blender-authored assets, if used, are optimized for web.
22. GLB scale, pivots, morph targets, materials, and collisions work correctly in-browser.
23. Mobile performance remains acceptable with 3D assets enabled.

---

# 49. TEST CASES

Create automated and manual test coverage for:

Secret trigger:
- 5 rapid clicks activates.
- fewer than 5 does not.
- delay resets counter.

Controls:
- drag.
- flick.
- squish.
- pointer release.

Physics:
- collisions.
- spring pads.
- danger floor.
- moving platforms.

Gameplay:
- score.
- timer.
- combo.
- power-ups.
- game over.
- replay.

Navigation:
- Back to Portfolio.
- ESC.
- portal exit.
- browser navigation.

Mobile:
- touch dragging.
- touch flick.
- responsive HUD.

3D assets:
- GLB loads correctly.
- model orientation correct.
- scale correct.
- collider alignment correct.
- morph targets work.
- material remains visually correct.
- fallback works if asset load fails.

Performance:
- repeated game sessions.
- enter/exit repeatedly.
- no zombie animation loops.
- no leaking physics bodies.
- stable FPS under expected load.

---

# 50. IMPORTANT IMPLEMENTATION PRINCIPLE

Do not chase perfect real-world soft-body physics.

Create the illusion.

Use:

Rigid-body physics for movement

+

Shader/morph deformation for softness

+

Blender-authored geometry when better control is needed

+

GSAP choreography for cinematic events

+

sound/particles for impact feedback.

The experience should LOOK physically rich while remaining technically stable.

---

# 51. EXECUTION APPROACH

Before writing large amounts of code:

1. inspect the existing portfolio architecture.
2. identify where Tushar Pathak / TP is rendered.
3. understand existing routing.
4. understand existing theme tokens.
5. understand dark-mode behavior.
6. identify animation libraries already installed.
7. inspect current 3D/web capabilities.
8. determine whether Blender-authored assets will materially improve the result.
9. reuse existing design primitives where possible.

Then implement in stages.

Stage 1:
Secret click detector.

Stage 2:
Entry and exit transitions.

Stage 3:
Basic R3F world.

Stage 4:
Gummy 3D asset pipeline.
If needed:
- build/refine gummy in Blender
- build shape keys
- create collision proxies
- export GLB
- verify in browser

Stage 5:
Gummy material and shader.

Stage 6:
Physics and controls.

Stage 7:
Danger mechanic.

Stage 8:
Scoring/combo.

Stage 9:
Power-ups.

Stage 10:
Expressions/audio/particles.

Stage 11:
Mobile optimization.

Stage 12:
Accessibility.

Stage 13:
QA/performance.

Do not build everything in one monolithic component.

---

# 52. ART / ASSET GENERATION

If image generation, 3D generation, Blender automation, or relevant MCP/tools are available:

use them yourself where appropriate.

Possible generated assets:

- gummy material references
- environment textures
- icon concepts
- decorative gummy elements
- achievement icons
- concept references for Blender modeling

Do NOT ask me to manually generate assets that you can generate yourself.

For the actual gummy bear:

prefer one of these in priority order:

1. Original optimized Blender-authored model with morph targets.
2. Original generated 3D model that is cleaned and optimized in Blender.
3. Procedurally generated simplified gummy bear if asset tooling is unavailable.

If a generated 3D asset is poor:

do not continue with it.

Fix, regenerate, remodel, or clean it up before proceeding.

---

# 53. BLENDER QUALITY GATE

If Blender is used, do not consider the asset complete until:

- silhouette looks cute and intentional
- topology is clean enough for deformation
- normals are correct
- no visible self-intersections
- transforms applied
- pivots sensible
- materials map correctly
- morph targets behave cleanly
- collision proxies align
- GLB loads without warnings
- browser lighting looks good
- file size is reasonable
- mobile fallback exists if required

The browser result is the source of truth, not the Blender viewport.

---

# 54. FINAL EXPERIENCE TARGET

The final product should make a visitor think:

"I clicked his name a few times and somehow discovered an entire tiny game hidden inside his portfolio."

Then:

"The physics are surprisingly good."

Then:

"This person clearly cares about product detail."

That emotional progression is the objective.

It should never feel like:

"He randomly embedded a game."

The secret game should reinforce:

curiosity
craftsmanship
product thinking
AI experimentation
interaction design
attention to detail.

---

# 55. FINAL DELIVERABLE

Implement the complete experience.

Do not provide only mockups.

Do not stop after creating components.

Run and test the implementation.

Fix broken interactions.

Validate responsiveness.

Validate the original portfolio remains intact.

If Blender is required:

own the Blender portion as part of the implementation workflow rather than asking me to manually create or prepare the model.

Then provide a concise completion report containing:

- files added
- files modified
- Blender assets created or modified
- GLB assets exported
- architecture summary
- mechanics implemented
- performance optimizations
- remaining limitations, if any

The game should be production-ready, not a prototype.
