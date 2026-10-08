# GUMMY PINBALL — FINAL UI/UX + VISUAL REDESIGN

## PRIMARY REFERENCE

Use the attached reference image as the PRIMARY visual direction for the redesign.

The reference establishes:

- handcrafted paper-cut pinball machine
- slightly top-down perspective
- premium 3D paper/cardboard construction
- layered physical playfield
- dedicated right-side launch lane
- physical spring plunger
- recognizable pinball flippers
- circular bumpers
- physical targets
- central drain
- black-hole portfolio exit
- integrated HUD
- subtle neon/illuminated accents
- glowing motion trails behind the Gummy
- premium cinematic lighting

DO NOT copy the image literally.

Recreate the DESIGN LANGUAGE and COMPOSITION using the existing game's actual functionality and physics.

---

# 1. PRIMARY OBJECTIVE

The current implementation looks like:

"3D physics objects floating inside a decorative paper frame."

That is NOT the target.

The final implementation must look like:

"A premium handcrafted paper-cut pinball machine that happens to exist inside Tushar's portfolio universe."

The user should recognize "PINBALL" immediately.

The design hierarchy is:

1. PINBALL GAMEPLAY
2. PHYSICAL MACHINE
3. PAPER-CUT WORLD
4. GUMMY CHARACTER
5. PORTFOLIO PERSONALITY
6. NEON / LIGHT ACCENTS

Do NOT allow decorative effects to overpower gameplay.

---

# 2. CORE PLAYFIELD COMPOSITION

Create a real pinball-machine composition.

The main playfield should contain:

- outer cabinet
- side rails
- upper ramps
- bumpers
- targets
- slingshots
- Gummy
- flippers
- drain
- launch lane

Recommended structure:

┌────────────────────────────────────────────────────────────┐
│ BLACK HOLE      SCORE       COMBO       TIME               │
│                                                            │
│     ╭──────────── RAMP / RAIL ─────────────╮              │
│     │                                      │              │
│     │       ○ BUMPER    ○ BUMPER           │              │
│     │                                      │              │
│     │  [AI]             GUMMY          [PRODUCT]          │
│     │                                      │              │
│     │       ○ BUMPER    ○ BUMPER           │              │
│     │                                      │              │
│     │ [DESIGN]                         [BUILD]             │
│     │                                      │              │
│     │    SLINGSHOT              SLINGSHOT                 │
│     │        ╲                      ╱                      │
│     │         ╲                    ╱                       │
│     │        LEFT FLIPPER    RIGHT FLIPPER                │
│     │                ╲    ╱                               │
│     │                 DRAIN                               │
│     └─────────────────────────────────────────────────────┘
│                                              LAUNCH LANE   │
│                                              POWER         │
│                                              PLUNGER       │
└────────────────────────────────────────────────────────────┘

The geometry must clearly communicate how the game works.

---

# 3. PAPER-CUT PHYSICALITY

Everything should look physically constructed.

Use:

- layered cardstock
- torn paper
- paper grain
- painted cardboard
- miniature paper scenery
- raised objects
- recessed areas
- physical mounting points
- realistic contact shadows
- ambient occlusion
- subtle imperfections

Objects should have actual perceived thickness.

Avoid:

- flat SVG-looking objects
- generic CSS cards
- floating 3D primitives
- excessive glassmorphism
- generic gradients

The player should feel like they are looking at a tiny handcrafted pinball machine.

---

# 4. COLOR SYSTEM

Keep the existing portfolio palette.

Primary:

Cream
#F4E9D2

Dusty Pink
#D98F91

Sage
#9BAF91

Muted Blue
#91AFC1

Terracotta
#C97959

Deep Ink
#273447

Neon accents should be limited to:

Warm amber
Cool cyan
Soft magenta
Warm white

IMPORTANT:

Neon is an ACCENT.

Do not convert the entire game into a neon arcade.

Approximately:

85–90% paper / physical material
10–15% illumination

The paper-cut aesthetic must remain dominant.

---

# 5. NEON / ILLUMINATED RAIL SYSTEM

Introduce subtle illuminated rails throughout the pinball table.

These should look like tiny embedded light tubes underneath or alongside the paper/cardboard rails.

Use them to reinforce:

- ramps
- outer rails
- launch lane
- important paths
- flipper edges
- bumpers

The light should appear physically embedded into the machine.

DO NOT use generic CSS glowing borders.

Instead:

paper rail
+
small recessed light channel
+
soft bloom
+
localized illumination on nearby paper

The glow should spill subtly onto adjacent surfaces.

---

# 6. LIGHTING STYLE

Use cinematic, warm, tactile lighting.

Base lighting:

- warm ambient light
- soft directional light
- subtle paper shadows
- gentle depth
- slightly warm highlights

Then add localized neon illumination.

The neon should illuminate nearby paper surfaces.

For example:

cyan light
→ subtle blue reflection on nearby paper

amber light
→ warm reflection on cardboard

magenta light
→ tiny purple tint on adjacent paper

Do not make the entire scene glow.

---

# 7. GUMMY TRAILING LIGHT

The Gummy should have a distinctive motion trail.

When moving quickly, create:

GUMMY
   ↓
bright core
   ↓
soft glowing trail
   ↓
fading particles

The trail should communicate velocity.

It should NOT look like a permanent laser beam.

Use a fading gradient:

100% opacity
→ 70%
→ 40%
→ 15%
→ 0%

The trail should be longest when the Gummy has high velocity.

When the Gummy slows down:

trail becomes shorter
→ fades naturally.

---

# 8. TRAIL COLOR

Use a restrained multi-tone trail.

Preferred:

warm white core
+
soft cyan
+
subtle magenta
+
warm amber at the edges

However:

DO NOT make it rainbow-colored.

The dominant trail should remain warm white with a subtle colored aura.

Example:

        GUMMY
          ●
        ╱
      ╱
    ╱
  ╱
╱

The closest portion should be brightest.

Older trail segments should progressively disappear.

---

# 9. TRAIL PARTICLES

Add very subtle micro-particles around the Gummy's high-speed path.

Particles should:

- be tiny
- fade quickly
- have slight variation
- disappear within milliseconds
- follow the Gummy's direction

Avoid particle explosions.

The effect should feel premium and restrained.

---

# 10. COLLISION LIGHT FEEDBACK

When Gummy hits a bumper:

1. bumper compresses
2. bumper light briefly intensifies
3. Gummy trail flashes
4. tiny particles appear
5. score popup appears
6. bumper returns to normal

Example:

GUMMY
  ↓
BUMPER

        +100

The entire effect should happen within roughly 200–350ms.

Keep it snappy.

---

# 11. BUMPER LIGHTING

Each bumper should have:

- paper/cardboard body
- raised center
- star/icon
- recessed illumination

Normal state:

soft ambient glow

Hit state:

brief bright pulse

Then:

smooth decay

Do NOT keep bumpers constantly glowing at maximum brightness.

---

# 12. FLIPPER LIGHTING

The flippers should have subtle illuminated edges.

Normal:

very soft warm edge light.

When activated:

edge briefly becomes brighter.

On collision:

small flash at the impact point.

The flipper itself remains primarily physical paper/cardboard.

The light is an accent, not its material.

---

# 13. LAUNCH LANE

The RIGHT side contains the dedicated launch lane.

It should be visually separated from the main playfield.

The lane should contain:

- side rails
- illuminated guide
- Gummy starting position
- power indicator
- physical spring
- plunger

The Gummy must start inside this lane.

---

# 14. PHYSICAL PLUNGER

Create a clearly recognizable mechanical pinball plunger.

Components:

- cylindrical metal/paper rod
- spring
- handle
- recessed housing
- layered cardboard frame

The spring should be visible.

The plunger must visibly move.

---

# 15. SPACE BAR INTERACTION

SPACE = CHARGE

RELEASE SPACE = LAUNCH

When Space is held:

plunger retracts

power meter increases

Gummy settles against the plunger

subtle mechanical tension animation occurs

The longer Space is held:

→ greater compression
→ greater launch force

Maximum:

MAX_CHARGE_TIME = 1500ms

Formula:

chargeProgress =
  clamp(
    elapsedTime / MAX_CHARGE_TIME,
    0,
    1
  )

launchForce =
  MIN_FORCE +
  chargeProgress *
  (MAX_FORCE - MIN_FORCE)

The launch force MUST affect the actual physics body.

Do not fake different launch strengths using only animation.

---

# 16. POWER METER

Place a vertical physical power meter next to the launcher.

It should look like part of the machine.

Example:

LAUNCH
POWER

┌──────┐
│      │
│ ████ │
│ ████ │
│ ████ │
│ ██░░ │
│ ░░░░ │
└──────┘

78%

As Space is held:

meter fills upward.

At 100%:

MAX POWER

Add a restrained pulse.

Do not use a generic progress bar.

---

# 17. LAUNCH VISUAL EFFECT

When Space releases:

1. plunger rapidly snaps forward
2. spring expands
3. Gummy launches
4. bright short trail appears
5. launch lane light briefly activates
6. Gummy enters main playfield
7. trail begins fading naturally

The launch should feel powerful.

But avoid exaggerated arcade effects.

---

# 18. BUMPERS

Use 3–5 major circular bumpers.

Recommended arrangement:

             ○

        ○         ○

             ○

Each bumper should have:

- layered paper ring
- center button
- star/symbol
- subtle illuminated edge
- physical shadow

On impact:

compress
→ flash
→ impulse
→ score
→ recover

---

# 19. TARGETS

Convert:

AI
DESIGN
PRODUCT
BUILD

into physical pinball targets.

Each target should be:

- raised
- mounted
- tactile
- slightly angled
- illuminated subtly
- physically integrated into the playfield

On impact:

target moves backward slightly
→ light flashes
→ score appears

Suggested scores:

AI = +150
DESIGN = +200
PRODUCT = +250
BUILD = +300

---

# 20. SLINGSHOTS

Add two classic triangular pinball slingshots.

Place above the flippers.

They should have:

- paper/cardboard body
- colored trim
- small illuminated button
- physical depth

On collision:

compress
→ flash
→ release
→ push Gummy

---

# 21. FLIPPERS

Replace the current generic angled bars.

They MUST unmistakably look like pinball flippers.

Left:

pivot → rounded tip

Right:

pivot → rounded tip

Controls:

A / LEFT ARROW
→ LEFT FLIPPER

D / RIGHT ARROW
→ RIGHT FLIPPER

Animation:

REST
→ rapid rotation
→ slight overshoot
→ spring return

They should feel mechanical.

---

# 22. DRAIN

Create a deep central drain.

It should look like an actual hole recessed into the paper machine.

Use:

- layered circular opening
- dark interior
- subtle orange/amber reflected light
- inner paper rings
- depth shadow

When Gummy falls inside:

DRAINED

Then reset to launcher.

---

# 23. BLACK HOLE — BACK TO PORTFOLIO

TOP-LEFT CORNER.

Create a small cosmic black hole embedded in the paper.

It should look like:

a circular tear in the paper
+
deep black center
+
purple/orange cosmic ring
+
tiny stars
+
subtle gravitational distortion

Place:

"← BACK TO PORTFOLIO"

on a small torn-paper label next to it.

Interaction:

HOVER:
- black hole subtly expands
- particles orbit faster
- nearby paper edge bends subtly
- tiny gravitational pull

CLICK:
navigate to portfolio homepage.

IMPORTANT:

The black hole should NOT look like a conventional button.

It should feel like a secret portal hidden in the game.

---

# 24. HUD

Integrate the HUD into the physical machine.

Top:

SCORE
000352

COMBO
×3

TIME
00:24

Use embossed paper plaques.

Add subtle physical screws/pins if appropriate.

Do not use modern glassmorphism.

---

# 25. MOTION LANGUAGE

The game should have a coherent motion system.

Use:

FAST:
flipper activation
plunger release
bumper impact

MEDIUM:
target movement
power meter transition
score popup

SLOW:
paper ambient movement
black-hole orbit
subtle background elements

The game should never feel sluggish.

---

# 26. NEON MOTION LANGUAGE

Neon effects should communicate:

SPEED
IMPACT
DIRECTION
INTERACTION

Not decoration.

Use:

Gummy movement
→ trailing light

Bumper collision
→ light pulse

Flipper collision
→ short flash

Launcher
→ directional light streak

Rail
→ subtle persistent illumination

Black hole
→ cosmic glow

This gives the neon system functional meaning.

---

# 27. TRAIL PERFORMANCE

Do not create hundreds of DOM elements.

Prefer:

- Canvas
- CSS transform layers
- WebGL if already used
- lightweight particle system

The trail must remain performant.

Target:

60 FPS desktop.

Avoid memory leaks from continuously accumulating particles.

Expire trail segments automatically.

---

# 28. START STATE

Initial state:

Gummy sits in launcher.

Plunger is extended.

Power = 0%.

Main playfield is visible.

Small instruction plaque:

HOLD SPACE
TO CHARGE

RELEASE
TO LAUNCH

Do not cover the game with a modal.

---

# 29. GAMEPLAY STATE

Once launched:

Remove the instruction plaque.

Let the machine breathe.

The player should learn from:

- launcher movement
- power meter
- Gummy movement
- flippers
- bumpers
- targets

No persistent instructional overlay.

---

# 30. RESPONSIVE DESIGN

Desktop is the primary experience.

Keyboard:

SPACE
A / LEFT
D / RIGHT

Prevent browser scrolling during active gameplay.

Prevent default behavior for:

Space
ArrowLeft
ArrowRight

when game is active.

---

# 31. DO NOT BREAK EXISTING PHYSICS

Before modifying:

inspect the current implementation.

Preserve:

- physics engine
- collision detection
- Gummy body
- scoring
- timer
- combo
- game state
- reset logic

Only modify what is required.

Do not rebuild working physics unnecessarily.

---

# 32. VISUAL QUALITY BAR

The final result must feel:

HANDCRAFTED
+
PHYSICAL
+
PREMIUM
+
PLAYABLE
+
SLIGHTLY MAGICAL

It should NOT feel:

GENERIC
+
NEON ARCADE
+
CYBERPUNK
+
FLAT UI
+
PHYSICS SANDBOX

---

# 33. CRITICAL BALANCE

Use this ratio as the visual rule:

70% PAPER / PHYSICAL MATERIAL
20% LANDSCAPE / WORLD BUILDING
10% LIGHT / NEON

The neon is there to elevate the experience, not redefine it.

The player should still recognize the paper-cut aesthetic when all lights are turned off.

---

# 34. FINAL SUCCESS TEST

Before finishing, evaluate the implementation.

### PINBALL

Can a person identify it as a pinball machine immediately?

### LAUNCHER

Is the right-side plunger unmistakable?

### SPACE

Does holding Space visibly compress the plunger?

### FORCE

Does longer holding produce stronger actual launch force?

### FLIPPERS

Do the bottom objects clearly read as pinball flippers?

### DRAIN

Is the drain unmistakable?

### BUMPERS

Do the circular objects look like pinball bumpers?

### TARGETS

Do AI / DESIGN / PRODUCT / BUILD look like physical pinball targets?

### TRAIL

Does the Gummy leave a beautiful fading light trail while moving quickly?

### LIGHT

Do neon accents communicate speed and impact rather than merely decoration?

### BLACK HOLE

Is the top-left black hole clearly the exit back to the portfolio?

### PAPER

Does the entire game still belong to the same paper-cut portfolio universe?

### PREMIUM

Does this look like a finished interactive portfolio experience rather than a prototype?

If any answer is NO, continue iterating.

---

# FINAL DESIGN PRINCIPLE

DO NOT BUILD:

"A paper-cut scene with neon effects."

DO NOT BUILD:

"A cyberpunk pinball machine with paper textures."

BUILD:

"A handcrafted paper-cut pinball machine with a restrained magical light system."

The physical paper construction is the foundation.

The pinball architecture is the gameplay language.

The Gummy is the personality.

The neon is the energy.

The black hole is the portal back to the portfolio.
