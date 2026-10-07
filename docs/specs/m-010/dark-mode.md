# MASTER PROMPT — CREATE PORTFOLIO DARK MODE + ENABLE PAPER-CUT THEME TOGGLE

I want you to implement a complete **dark mode for the entire portfolio** and connect it to the existing / planned **paper-cut Light / Dark theme toggle**.

This is not just a color inversion task.

The goal is to create a **premium dark-mode version of the same portfolio**, preserving the paper-cut editorial identity, 3D layered artwork, typography hierarchy, product storytelling, and interaction quality.

The dark mode should feel like:

> the same handcrafted paper-cut portfolio world, gently transformed from daytime into a calm, premium evening version.

The final implementation must include:

- full site-wide dark theme
- theme token system
- paper-cut dark-mode surface styling
- matched dark-mode scene assets where needed
- theme persistence
- system preference support
- no flash of incorrect theme
- working paper-cut Light / Dark toggle
- responsive support
- reduced-motion support
- accessibility
- dark-mode QA across all tabs
- no runtime Higgsfield dependency

---

# IMPORTANT EXECUTION REQUIREMENT

You have access to **Higgsfield through MCP**.

Do not return Higgsfield prompts to me as instructions for me to execute manually.

Use Higgsfield MCP yourself whenever a visual asset needs a true dark-mode variant.

You own:

- theme architecture
- frontend implementation
- asset generation
- asset QA
- optimization
- theme-toggle integration
- cross-site QA

If a generated dark-mode asset is poor or compositionally mismatched with the light version, regenerate it before continuing.

Do not ask me to manually create or prepare artwork unless Higgsfield MCP is unavailable.

---

# 1. PRIMARY DESIGN PRINCIPLE

Dark mode must NOT look like a separate website.

Preserve:

- existing information architecture
- existing typography
- existing component hierarchy
- existing spacing rhythm
- existing content
- existing product screenshots
- existing interaction patterns
- paper-cut / scrapbook / editorial character

Change only:

- theme palette
- paper surface colors
- border/shadow treatment
- lighting mood
- some decorative assets
- matched scene imagery where a light asset visually clashes

---

# 2. AUDIT BEFORE IMPLEMENTATION

Before changing anything:

inspect the entire site.

Audit at minimum:

- Home
- Experience
- Portfolio
- Thinking
- About
- Playground
- Certifications
- Ask Tushky
- Contact / footer
- product case studies
- modals / drawers / overlays
- video players
- buttons
- cards
- timelines
- badges
- forms / inputs
- source/evidence drawers
- theme toggle if partially implemented

Build an internal inventory:

ROUTE
COMPONENT
LIGHT COLORS
CURRENT PAPER SURFACE
CURRENT BORDER
CURRENT SHADOW
DARK-MODE STRATEGY
ASSET SWAP NEEDED?
ACCESSIBILITY RISK?

Do this first.

---

# 3. DARK MODE PALETTE

Use a restrained handcrafted dark palette.

## Core colors

Primary background:
deep navy / midnight paper

Suggested family:
#0B1530
#101C38
#13213E

Secondary paper surface:
#172646
#1C2C4D

Elevated paper card:
#1E3154
or slightly warmer/navier equivalent

Primary text:
warm ivory
#F4EEDF

Secondary text:
muted cream/slate
#C7C2B6
#B8C0CE

Muted text:
#8F9AAF

Terracotta accent:
retain existing brand terracotta

Approx:
#A94C2D
#B65432
#C0613C

Warm gold:
restrained only
#D2A85A

Cream paper highlight:
#F2E8D8

Sage / lavender / blue:
use muted dark-compatible versions.

Do not hardcode these exact values if the existing design system already has brand tokens.

Translate the current palette systematically.

---

# 4. DO NOT USE PURE BLACK

Avoid using pure black as the dominant page background.

Do not use:

#000000

for the main site.

The dark mode should feel like deep paper, not a void.

Use dark navy / indigo paper tones.

---

# 5. PAPER MATERIALITY IN DARK MODE

Dark-mode surfaces should still look like paper.

Do not flatten everything into dark rectangles.

Maintain:

- subtle paper grain
- matte finish
- layered paper edges
- close soft shadows
- slight fiber texture
- torn-paper boundaries
- tape/pins where already used
- tactile depth

The dark mode should feel like dark handmade cardstock.

Not:
generic SaaS dark mode.

---

# 6. DARK MODE SHADOWS

Do not simply reuse light-mode gray drop shadows.

Use:

- deep navy ambient shadows
- subtle warm edge shadows
- small ivory/terracotta rim accents where useful
- low blur
- close contact distance

Avoid:
- giant black floating-card shadows
- glow effects
- neon outlines

---

# 7. BORDERS

Dark-mode paper borders should be:

- muted navy
- slate
- subtle cream/terracotta highlights only where needed

Avoid bright white borders around every card.

Use contrast sparingly.

---

# 8. TEXT

Ensure all text remains readable.

Primary:
warm ivory

Secondary:
muted cream/slate

Meta:
cool muted slate

Do not use medium gray on navy if contrast becomes weak.

Run WCAG contrast checks for:

- body copy
- nav
- buttons
- labels
- input placeholders
- disabled states
- source chips
- footer text

---

# 9. NAVIGATION — DARK MODE

Keep existing navigation structure.

Dark-mode nav should:

- use dark navy paper
- preserve cream/ivory text
- maintain active indicator
- maintain hover states
- keep theme toggle visible and discoverable
- preserve torn-paper or tactile styling if present

Do not redesign the nav.

---

# 10. ENABLE THE PAPER-CUT THEME TOGGLE

Use the existing/planned paper-cut Light / Dark toggle.

The toggle must actually control the site theme.

Requirements:

- Light side activates light theme
- Dark side activates dark theme
- active state visible
- keyboard accessible
- mobile accessible
- screen-reader accessible
- persists explicit user choice
- respects system preference initially
- no incorrect-theme flash
- reduced-motion compatible

---

# 11. THEME STATE PRIORITY

Use this order:

1. explicitly saved user choice
2. system `prefers-color-scheme`
3. light fallback

Persist explicit user choice only.

Recommended storage key:

portfolio-theme

or reuse existing project key if already present.

---

# 12. THEME ATTRIBUTE

Prefer:

```html
<html data-theme="light">
```

or:

```html
<html data-theme="dark">
```

If the project already uses:

`.dark`

or a theme provider,
reuse the existing implementation.

Do not create a second competing theme system.

---

# 13. THEME TOKENS

Centralize theme values.

Use CSS variables or existing token system.

Example:

```css
:root {
  --bg: #f6f0e4;
  --surface: #fffaf0;
  --text: #091b3f;
  --text-muted: #667085;
  --accent: #a94827;
  --border: rgba(...);
  --shadow: ...;
}

[data-theme="dark"] {
  --bg: #0b1530;
  --surface: #142440;
  --text: #f4eedf;
  --text-muted: #aab4c5;
  --accent: #c0613c;
  --border: rgba(...);
  --shadow: ...;
}
```

Do not scatter hardcoded dark colors across dozens of components.

---

# 14. PREVENT THEME FLASH

Dark-mode users must not see:

light page
→ flash
→ dark page.

Use the correct pre-hydration strategy for the current stack.

For Next.js / React:

- resolve saved/system theme before visible render when possible
- use a small inline initialization script if necessary
- or reuse existing theme provider
- apply theme to `<html>` before hydration

Do not introduce unnecessary dependencies.

---

# 15. THEME TOGGLE VISUAL STATE

The paper-cut toggle must visually communicate active mode.

LIGHT active:
- sun slightly more prominent
- light scene brighter
- light panel raised subtly
- dark side slightly muted

DARK active:
- moon/stars slightly more prominent
- dark scene richer
- dark panel raised subtly
- light side slightly muted

Do not use a generic checkmark if the paper-art state already communicates selection.

---

# 16. THEME TOGGLE INTERACTION

Keep motion subtle:

350–500ms.

Possible sequence:

Light → Dark:
1. Light panel settles
2. sun moves 1–3px
3. dark panel gains contrast
4. moon/stars appear
5. site theme variables transition

Dark → Light:
reverse.

Do not create dramatic day/night animation.

---

# 17. ACCESSIBILITY OF TOGGLE

Use proper semantics.

Possible:

- radiogroup with Light/Dark options
or
- switch with descriptive state

Labels must be available to assistive technology:

- Use light theme
- Use dark theme

Support:

- Tab
- Enter
- Space
- Arrow keys if radio implementation

Visible focus style required.

---

# 18. REDUCED MOTION

With:

```css
@media (prefers-reduced-motion: reduce)
```

Disable:

- sun movement
- moon movement
- stars reveal
- panel parallax
- image crossfade beyond minimal opacity
- decorative theme animation

Theme switching must still work.

---

# 19. PAGE BACKGROUND — DARK MODE

Main site background should become:

deep navy handmade paper.

Do not use a flat featureless background.

Use:

- extremely subtle texture
- low-contrast paper fibers
- restrained noise
- no high-frequency texture

Paper texture should support the design, not compete with text.

---

# 20. HOME TAB — DARK MODE

Preserve the Home layout exactly.

Translate:

- cream background → deep navy paper
- navy typography → warm ivory
- terracotta remains terracotta
- cream paper elements → slate/indigo + selective ivory highlights

Use the matched dark 3D paper-cut hero scene from the asset system.

Do not change:
- hero copy
- CTA placement
- Featured Work structure

---

# 21. HOME HERO SCENE

Use the dark matched variant.

Preserve:

- composition
- character location
- props
- board
- negative space
- framing

Dark mood:

- calm evening studio
- navy/slate paper wall
- warm desk/studio accents
- ivory paper notes
- terracotta highlights

Do not make it neon.

---

# 22. FEATURED WORK — DARK MODE

Keep existing Featured Work layout.

Use dark paper surfaces for cards.

Preserve:
- RailCite
- Slag City
- Campfire Board
- project hierarchy
- CTA behavior
- actual product names and data

Use matched dark artwork only where needed.

Do not reduce card readability.

---

# 23. EXPERIENCE TAB — DARK MODE

Do not redesign chronology.

Translate:

- timeline paper
- company cards
- logos
- dates
- achievements

Use:
- deep navy background
- slate cards
- cream typography
- terracotta timeline accents

Company logos remain original.

Do not invert logos blindly.

If a logo fails on dark background:
use existing official alternate version if already available or place it on a neutral paper chip.

---

# 24. ABOUT TAB — DARK MODE

Keep the editorial About redesign.

Dark translation:

- navy/slate paper
- ivory typography
- terracotta annotations
- dark-mode matched 3D hero scene
- cream research notes
- muted-gold recognition accents

Do not turn About into a dramatic black portfolio.

Keep it reflective and warm.

---

# 25. THINKING TAB — DARK MODE

Preserve the six-stage thinking system.

Problem
→ Insight
→ Bet
→ Build
→ Evaluate
→ Impact

Dark-mode styling:

- dark paper background
- cream/slate stage banners
- terracotta path
- ivory text
- muted accent colors

Do not change stage order or animation logic.

---

# 26. PORTFOLIO TAB — DARK MODE

Preserve:

- media stage
- product info
- actions
- collectible product carousel

Dark mode should make the product art feel cinematic but still paper-based.

Use:

- navy/kraft surfaces
- cream labels
- subtle terracotta selection state
- dark-mode environmental framing

Do not darken actual embedded product screenshots artificially unless necessary.

---

# 27. PRODUCT SCREENSHOTS

Do not replace real screenshots with dark-themed generated art.

If the actual product UI is light:
show it as-is.

Use:
- paper frame
- shadow
- dark background

Do not apply heavy filters.

Evidence remains evidence.

---

# 28. PLAYGROUND — DARK MODE

Preserve playful experimentation.

Use:

- deep navy paper
- muted colorful paper artifacts
- cream notes
- terracotta highlights

Do not make Playground a neon arcade.

---

# 29. CERTIFICATIONS — DARK MODE

Real badges remain unchanged.

Dark environment:

- navy paper wall
- cream paper sleeves
- muted gold / terracotta clips
- readable credential text

Do not recolor badges.

---

# 30. ASK TUSHKY — DARK MODE

Preserve Tushky’s friendly paper assistant design.

Dark version:

- navy paper drawer
- cream message bubbles
- terracotta accents
- warm Golden Retriever paper avatar
- dark matched Tushky scene if used

Voice controls must remain legible.

Audio player paper strip:
- dark paper or cream chip depending on message context
- clear Listen/Pause/Replay states

Do not reduce contrast.

---

# 31. FORMS / INPUTS / CHAT INPUT

Dark-mode fields:

- dark paper fill
- subtle border
- warm cream input text
- readable placeholder
- clear focus ring
- no bright neon focus glow

---

# 32. FOOTER — DARK MODE

The footer uses a strong terracotta branded paper-ocean system.

Do not automatically make it blue/navy.

Preserve the footer brand identity unless the current footer theme logic intentionally changes it.

If a dark variant is needed:
use the matched dark paper-ocean asset system defined elsewhere.

Preserve:
- waves
- ship
- content
- palette identity
- animation

---

# 33. CASE STUDIES — DARK MODE

Each case study should keep its own visual identity.

Do not apply one generic dark card system.

RailCite:
dark railway/archive field notebook

Cubicle:
evening office/cubicle paper diorama

Dino Arcade:
night desert/arcade environment

Velora:
dark fashion/sourcing editorial studio

Use real UI screenshots unchanged where appropriate.

---

# 34. MODALS / DRAWERS / OVERLAYS

Audit all:

- evidence drawers
- Tushky drawer
- modal dialogs
- image previews
- navigation overlays

Dark mode should use:
- dark paper surfaces
- readable ivory text
- controlled shadows
- correct overlay opacity

Do not leave light-mode modal surfaces accidentally.

---

# 35. VIDEO EMBEDS

Keep video content unchanged.

Dark mode only affects:

- poster frame
- paper surround
- CTA
- caption
- player background

Do not filter the video itself.

---

# 36. LINKS

Dark-mode link states:

default:
ivory/cream or existing content color

accent link:
terracotta

hover:
slightly brighter or underlined

focus:
strong visible paper-outline state

Do not use low-contrast blue links unless already part of the brand.

---

# 37. BUTTONS

Preserve existing button hierarchy.

Primary:
terracotta paper

Secondary:
cream/dark paper border

Dark mode should not flatten buttons.

Retain:
- paper texture
- shadow
- tactile press state

---

# 38. BADGES / CHIPS

Use:
- cream paper chip
- slate paper chip
- terracotta paper chip

Avoid translucent glass pills.

Maintain paper-cut grammar.

---

# 39. TORN PAPER EDGES

Dark mode should keep torn-paper boundaries visible.

Use:
- subtle lighter/darker edge contrast
- close shadow
- slight texture variation

Do not use bright white torn edges around everything.

---

# 40. TAPE / PINS / PAPERCLIPS

Existing scrapbook details may remain.

Translate:
- beige tape → muted kraft
- cream tape → desaturated warm paper
- pins → brass / terracotta / dark navy

Do not turn them metallic/glossy.

---

# 41. 3D PAPER-CUT ASSET SWAPPING

For rich image scenes, use true matched themed assets.

Example:

```ts
const assets = {
  homeHero: {
    light: "/assets/paper-cut/light/home/hero.webp",
    dark: "/assets/paper-cut/dark/home/hero.webp",
  },
};
```

Use centralized mapping.

Do not hardcode theme paths repeatedly.

---

# 42. DO NOT USE CSS FILTERS FOR RICH ART

Avoid:

```css
filter: invert(...)
brightness(...)
hue-rotate(...)
```

for rich paper-cut scene conversion.

These destroy art direction.

Use real matched dark assets.

Simple icons/shapes may use CSS tokens.

---

# 43. IMAGE SWAP TRANSITION

Because light/dark compositions should match:

use a subtle crossfade.

Recommended:
150–300ms opacity.

Do not slide scenes across the screen.

Do not create layout jump.

---

# 44. PRELOAD OPPOSITE-THEME HERO ASSET

After the active route hero loads:

preload the opposite-theme hero variant during idle time.

This makes theme switching instant.

Do not preload dark/light assets for every route globally.

Use route-aware loading.

---

# 45. RESPONSIVE THEME ASSETS

If the light theme uses mobile-specific art:

the dark theme must also have a matched mobile version.

Do not use a mismatched desktop dark crop on mobile.

---

# 46. CSS TRANSITIONS

Use theme transitions selectively.

Good:
- background-color
- color
- border-color
- box-shadow
- opacity

Typical duration:
180–320ms.

Do not animate every CSS property globally.

Avoid:
```css
* {
  transition: all ...
}
```

This hurts performance and causes strange behavior.

---

# 47. THEME TRANSITION PERFORMANCE

Prefer CSS variables.

One root theme change should cascade.

Do not trigger rerenders across the whole app unnecessarily.

If React state is used:
keep it lightweight.

---

# 48. SYSTEM THEME CHANGES

If the user has NOT explicitly selected a theme:

respond to system `prefers-color-scheme` changes.

If the user DID explicitly select Light/Dark:

their choice takes precedence.

---

# 49. OPTIONAL “SYSTEM” MODE

Do not add a third System option unless it improves the UX and is requested.

For now:
the visible toggle remains Light / Dark.

System preference is used only for initial default when no explicit choice exists.

---

# 50. LOCAL STORAGE

Use a stable key.

Example:

```text
portfolio-theme
```

Values:

```text
light
dark
```

Do not store unnecessary user data.

---

# 51. SSR / HYDRATION

Ensure theme handling does not produce:

- hydration mismatch
- flickering classes
- duplicate state
- layout shift

Test both direct loads:

- saved light
- saved dark
- no saved choice + light OS
- no saved choice + dark OS

---

# 52. ACCESSIBILITY — CONTRAST

Test dark mode contrast across:

- body text
- headings
- nav
- footnotes
- inputs
- placeholder text
- links
- chips
- disabled controls
- timeline meta
- carousel labels
- source chips
- Tushky voice controls

Do not assume ivory on navy automatically passes.

Measure where needed.

---

# 53. ACCESSIBILITY — THEME TOGGLE

Theme toggle must:
- have semantic state
- expose current theme
- have accessible label
- support keyboard
- show focus
- not rely only on imagery

---

# 54. ACCESSIBILITY — IMAGES

Light and dark variants of the same decorative scene should not create duplicate screen-reader noise.

Use the same semantic meaning.

Decorative:
alt=""
aria-hidden="true"

---

# 55. REDUCED MOTION

With reduced motion:

- theme art swaps without dramatic animation
- paper toggle movement minimized
- no decorative parallax
- no wave animation if separately controlled by existing reduced-motion rules

Theme switching still works.

---

# 56. PRINT / SCREENSHOT SAFETY

Ensure dark mode does not break:
- browser print styles
- screenshots
- Open Graph cards if they render page sections
- static export behavior if applicable

Keep OG assets separate if needed.

---

# 57. BROWSER QA

Test:

- Chrome
- Safari
- Firefox

Desktop and mobile where practical.

Check:
- theme persistence
- initial theme
- toggle
- scene swaps
- CSS variables
- iframe/video behavior
- fixed elements
- custom cursor
- Tushky drawer
- footer animation

---

# 58. CUSTOM CURSOR — DARK MODE

If the Paper Trail Cursor system is enabled:

adapt it to dark mode.

Keep:
- cursor visibility
- paper trail assets
- semantic labels

Dark-mode cursor:
- cream / terracotta contrast
- no low-contrast navy-on-navy cursor
- reuse transparent trail assets where possible

Only generate dark trail variants if genuinely necessary.

---

# 59. DARK-MODE TROUBLESHOOTING

| Problem | Likely cause / fix |
|---|---|
| Dark mode flashes after page load | Theme applied after hydration. Move initialization earlier. |
| Saved theme resets | Local storage key/value not read correctly. |
| Toggle visually changes but page does not | UI state is disconnected from root theme attribute. |
| Page is dark but some cards remain white | Hardcoded light colors remain. Convert to tokens. |
| Text becomes unreadable | Contrast tokens not mapped properly. |
| Product screenshots look distorted | CSS filter incorrectly applied. Remove filter. |
| Scene jumps when switching themes | Light/dark image dimensions or composition differ. |
| Dark artwork looks neon | Higgsfield prompt drift. Regenerate with navy/slate/ivory palette. |
| Dark artwork looks too black | Replace black with deep navy/indigo paper. |
| Paper texture disappears in dark mode | Contrast too low or surface too flat. Add subtle texture/rim separation. |
| Toggle causes hydration warning | Theme state differs server/client. Fix initialization strategy. |
| Theme toggle inaccessible | Missing semantic state / focus / keyboard support. |
| Video iframe turns dark unexpectedly | Global CSS/filter is leaking into media. Scope theme styles correctly. |
| Footer loses terracotta identity | Theme override is too aggressive. Preserve branded footer palette. |
| Tushky voice controls disappear | Dark surface and icon contrast too close. Increase ivory/terracotta separation. |
| Cursor disappears in dark mode | Cursor color token not theme-aware. |
| Dark mode loads all alternate assets immediately | Over-eager preloading. Use route-aware lazy loading. |

---

# 60. IMPLEMENTATION ORDER

Use this sequence:

1. audit current theme implementation
2. audit hardcoded colors
3. define theme tokens
4. add root theme state
5. implement persistence
6. implement system default
7. prevent flash
8. enable paper-cut theme toggle
9. migrate global background/text/borders/shadows
10. Home
11. Featured Work
12. Experience
13. About
14. Thinking
15. Portfolio
16. Playground
17. Certifications
18. Tushky
19. case studies
20. footer
21. modals / overlays
22. cursor
23. asset swapping
24. responsive QA
25. accessibility QA
26. browser QA
27. performance QA

Do not attempt to dark-mode every component randomly in parallel.

---

# 61. QA MATRIX

Test every major route in:

- Light desktop
- Dark desktop
- Light mobile
- Dark mobile

Also test:

- saved light
- saved dark
- system light
- system dark
- reduced motion
- keyboard-only
- theme switching while Tushky drawer open
- theme switching while video visible
- theme switching on case study
- theme switching near footer

---

# 62. VISUAL ACCEPTANCE CRITERIA

Dark mode is complete only if:

- it feels like the same portfolio
- paper-cut identity remains intact
- no generic SaaS dark mode appearance
- no pure-black dominant page
- terracotta brand survives
- typography hierarchy survives
- all major tabs are themed
- overlays and drawers are themed
- real screenshots remain truthful
- real badges/logos remain intact
- matched paper-cut scenes swap cleanly
- no layout shift during asset swap
- toggle works
- persistence works
- system default works
- no initial flash
- mobile works
- reduced motion works
- accessibility passes
- no neon/cyberpunk drift

---

# 63. FINAL REPORT

After implementation provide:

## THEME ARCHITECTURE
- theme provider/state
- root attribute/class
- persistence
- system preference behavior
- no-flash strategy

## TOKENS
- key light tokens
- key dark tokens
- accent preservation

## TOGGLE
- component location
- interaction
- accessibility
- navbar behavior
- mobile behavior

## ROUTES
For each route:
- what changed
- asset swap used?
- any compromise

## ASSETS
- light/dark pairs
- shared assets
- generated dark assets
- optimized sizes

## QA
- desktop
- mobile
- keyboard
- screen reader considerations
- reduced motion
- theme persistence
- performance

## REMAINING ISSUES
List anything unresolved.

---

# FINAL DESIGN PRINCIPLE

Do not make a dark version by “turning everything black.”

Create a true dark-mode paper universe.

The site should feel like:

DAY:
warm cream handcrafted portfolio

NIGHT:
deep navy handcrafted portfolio

Same story.
Same craft.
Same identity.
Different atmosphere.

Prioritize:

consistency
→ readability
→ materiality
→ accessibility
→ performance
→ delight.
