# Design Specification (`Design.md`)

Stage 4 of the build chain · Clay Portfolio (Tushar Pathak). Consumes `Solution-PRD.md`, `DESIGN_DIRECTION.md` (authoritative for palette/type/motion/scope — nothing here re-decides it), `SITEMAP.md`, `COMPONENT_ARCHITECTURE.md`, `evaluation-plan.md` (EVAL-001/006/007/008/009/010 are the design gates this file must satisfy), and `CONTENT_INVENTORY.md` (artifact/content shapes). Feeds `tickets.md` + `technical-plan.md` (Stages 5–6). Avatar generation is **out of scope for this document** — handled separately by the orchestrator per `HANDOFF.md` step 3, from `DESIGN_DIRECTION.md` §8's spec.

---

## 1. Executive Visual Strategy & Discovery

### Benchmark patterns (Mobbin — real production screens, cited)

Portfolio/marketing hero composition (asymmetric image + oversized headline + two-CTA row): [Squarespace portfolio hero](https://mobbin.com/sites/sections/1d20fb5e-0196-4e6d-b1f2-c0d2caf79e22), [Vizcom product hero](https://mobbin.com/sites/sections/5a194a1a-1add-434f-b901-b832b3c4ba78) — both confirm the brief's "35/65, oversized type, restrained CTA count" reads as premium rather than templated, which is why Hero keeps exactly two buttons and no third decorative CTA.

Editorial asymmetric project grids (one large + smaller supporting tiles, not a uniform card wall): [Legora stories grid](https://mobbin.com/sites/sections/48da9391-3b50-40a6-b9f0-4f3e636f0bde), [Koto work grid](https://mobbin.com/sites/sections/d820c5ae-eeff-4b27-bf9b-4f78df222c89) — both directly informed `EditorialGrid`'s 1-large/2-medium/rest-small sizing math in §3.

Filter/segmented case-study browsing: [Vanta success-story filters](https://mobbin.com/sites/sections/6ce59419-6a59-4cbf-915e-6ee1c653b559), [Kajabi filtered case studies](https://mobbin.com/sites/sections/0c5600f6-192c-4f36-8f06-006c8cd1b805) — confirm filter controls sit as a single dropdown/pill row directly above the grid, never inline with cards.

Right-side AI panel with page still visible behind it (not a centered modal): [ReadMe docs Assistant](https://mobbin.com/sites/sections/614eea9b-f552-4201-acd0-971719210520) — closest real reference for `AskPanel`'s proportions (fixed-width right column, page content untouched, input pinned to the panel's own bottom). Search-that-becomes-an-answer-inline (not a redirect): [Antimetal "Ask, search, or give instructions"](https://mobbin.com/sites/sections/9fcab6fd-d7e0-4049-bb7f-00c8fbc12dbc) and [Dovetail "Search and you shall receive"](https://mobbin.com/sites/sections/9387466b-71e3-4298-8940-42e91bb422f4) — both directly informed `AskPortfolio`'s in-place expansion (field stays put, results grow beneath it) rather than a modal takeover.

Horizontal role/company timeline with expandable nodes: [Square "An endless evolution"](https://mobbin.com/sites/sections/40dfaada-0563-453f-9aff-779e4cb58d56) (label above a connecting line, media below, arrow-paged) and [Surfshark "Our timeline"](https://mobbin.com/sites/sections/a212c823-0e5e-4513-a933-8a3663fb4165) (alternating node position) — the Square pattern is the closer match to `ExperienceTimeline`'s single-line-with-dots layout and is the primary reference in §3.

Claymorphism/soft-3D reference (the CRM product literally named Clay, not the material style, but its icon/metric tiles are the closest production example of soft rounded 3D objects paired with confident typography rather than a toy aesthetic): [Clay 3D icon grid](https://mobbin.com/sites/sections/30dfca7f-2098-4ef7-ba22-2df5a5cae1b7), [Clay metric result cards](https://mobbin.com/sites/sections/7a702566-13fa-41bc-8369-c61d5292271f) — used to validate that a soft/rounded material system can still read "serious SaaS," which is the central risk this project is managing (Solution-PRD §9 risk 1).

No claymorphism-specific personal-portfolio example surfaced in the searched queries (Mobbin's corpus skews SaaS/marketing, not indie portfolios) — the personal-portfolio precedent is therefore triangulated from the hero/grid/timeline references above plus the brief's own Dribbble reference (§04, translated, not copied, per that section's explicit instruction).

### Core aesthetic

Premium minimal claymorphism = soft-UI material system + editorial restraint. The material (clay) is confined to a strict tier system (§2) so it never competes with typography; text zones (case-study bodies, essays, tables) are **always flat** — this is the single biggest lever against the "toy" risk (Solution-PRD §9), because Law of Figure-Ground only works if there is an unambiguous ground: flat text areas are the ground, clay objects are the only figures. One accent colour is visible per section (never the full six-colour palette at once), which is Law of Similarity used defensively — six colours all present would create six false categories instead of one calm one.

### Conversion goal

Single funnel, per `SITEMAP.md` cross-links: Hero CTA → `/work` → `ProjectCard` → `/work/[slug]` → "See my experience →" → `/about` → "Let's talk" → `/contact`, with resume reachable from Hero, Footer, `/about`, `/contact` at every step (Fitts's Law: the highest-frequency action — resume download — is never more than one target away on any page). The 5-second and 30-second tests (EVAL-001/EVAL-002) are satisfied structurally by Hero alone: name, title, "AI-native products," a floating tile naming real shipped work, and both CTAs must all render inside the first 390px and 1440px viewport with no scroll.

### PWA & mobile considerations

This is a static Next.js site, not an installable PWA — no manifest or service worker is in `COMPONENT_ARCHITECTURE.md`, so nothing here assumes one. "Mobile-first" instead means: 44×44px minimum touch targets everywhere (Fitts's Law), safe-area-aware fixed chrome (`env(safe-area-inset-*)` on the sticky header and the mobile bottom-sheet `AskPanel`), and font/image loading that degrades safely offline (self-hosted fonts via `next/font`, `next/image` with blur placeholders, no CDN dependency for anything except nothing — this project has zero required third-party runtime scripts, unlike the cinematic site's Three.js CDN dependency).

---

## 2. Design Tokens & Brand System

### Color — OKLCH + hex, `@theme` block (Tailwind 4)

OKLCH values below are computed by hand via the standard sRGB → linear → OKLab conversion (accurate to roughly ±0.5%). **Hex remains the authoritative source (`DESIGN_DIRECTION.md` §2, unchanged)** — regenerate exact OKLCH with a converter (e.g. `culori`, oklch.com) at implementation time before locking the file; this is flagged again in §5 Deviations.

| Token | Hex | OKLCH (computed) | Use |
|---|---|---|---|
| `bg` | `#FAF9FF` | `oklch(98.5% 0.008 296)` | page background |
| `surface` | `#F4F2FF` | `oklch(96.7% 0.017 294)` | clay body base (opaque variant; `rgba(255,255,255,.7)` over `bg` is the alternate per DESIGN_DIRECTION) |
| `ink` | `#101646` | `oklch(23.1% 0.089 272)` | primary text |
| `ink-2` | `#3D4270` | `oklch(39.7% 0.078 278)` | secondary text |
| `ink-3` | `#6B6F94` | `oklch(55.3% 0.058 280)` | captions, eyebrows |
| `accent` | `#6657F5` | `oklch(56.6% 0.226 280)` | links, highlight, active pill, primary button |
| `accent-deep` | `#4E40D8` | `oklch(48.9% 0.221 278)` | hover/pressed accent |
| `lavender` | `#BFA8FF` | `oklch(78.4% 0.123 296)` | hero frame, Ask panel tint |
| `sky` | `#A8D7FF` | `oklch(86.0% 0.074 245)` | avatar frame, Technology cluster |
| `mint` | `#A5EBD2` | `oklch(88.7% 0.077 170)` | Evaluate/Impact, success states |
| `blush` | `#FFB4C6` | `oklch(84.6% 0.090 4)` | People tile, human moments, also error surface (see below) |
| `peach` | `#FFD2B2` | `oklch(89.4% 0.067 56)` | Build stage, playground |
| `butter` | `#FFE389` | `oklch(92.0% 0.114 92)` | Insight stage, annotation backdrop |

No dedicated error hue exists — adding one would violate the brief's "not a rainbow UI" rule and DESIGN_DIRECTION's one-accent-per-section discipline. Error states (Ask panel, DemoVideo, CopyButton clipboard failure) use **`ink` text on a `blush`-tinted flat surface plus an alert icon** — Law of Similarity's redundant-coding rule: never colour alone.

```css
@theme {
  --color-bg: oklch(98.5% 0.008 296);
  --color-surface: oklch(96.7% 0.017 294);
  --color-ink: oklch(23.1% 0.089 272);
  --color-ink-2: oklch(39.7% 0.078 278);
  --color-ink-3: oklch(55.3% 0.058 280);
  --color-accent: oklch(56.6% 0.226 280);
  --color-accent-deep: oklch(48.9% 0.221 278);
  --color-lavender: oklch(78.4% 0.123 296);
  --color-sky: oklch(86.0% 0.074 245);
  --color-mint: oklch(88.7% 0.077 170);
  --color-blush: oklch(84.6% 0.090 4);
  --color-peach: oklch(89.4% 0.067 56);
  --color-butter: oklch(92.0% 0.114 92);
}
```

Contrast rule (unchanged from DESIGN_DIRECTION, restated as the build gate): body text ≥7:1 on `bg`, secondary ≥4.5:1, text on any clay tone uses `ink` only, never `ink` on `bg` inverted or white-on-tint.

### Typography

Manrope (display/UI, 500–800) + Caveat (handwritten, 500–600, ≤3/viewport, `aria-hidden`), per DESIGN_DIRECTION §3 — unchanged. Fluid scale computed for the 390→1440px viewport range (matches the four required breakpoints), so no separate mobile/desktop CSS overrides are needed for size — only for stacking order:

```css
@theme {
  --font-display: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-hand: "Caveat", cursive;

  --text-hero: clamp(2.75rem, 1.729rem + 4.19vw, 5.5rem);   /* 44px → 88px */
  --text-h2:   clamp(2.125rem, 1.614rem + 2.1vw, 3.5rem);   /* 34px → 56px */
  --text-h3:   clamp(1.5rem, 1.314rem + 0.76vw, 2rem);      /* 24px → 32px */
  --text-lead: clamp(1.1875rem, 1.118rem + 0.29vw, 1.375rem); /* 19px → 22px */
  --text-body: clamp(1.0625rem, 1.039rem + 0.1vw, 1.125rem); /* 17px → 18px */
  --text-caption: 0.875rem; /* fixed 14px — the DESIGN_DIRECTION floor, never fluid below it */

  --tracking-hero: -0.03em;
  --tracking-eyebrow: 0.12em;
  --leading-hero: 1.02;
}
```
Hero weight 800; h2/h3 weight 700; body/lead weight 500; eyebrow/caption weight 600 uppercase. Paragraph measure ≤600px (enforced by the `Prose` primitive, §3). "AI-native products" renders as an inline `<span>` in `accent` with a one-time 700ms `background-position` wash (no loop) — spec detail in §4.

### Spacing, radius, shadow

Base unit 8px; the scale below is what `Section`, `Container`, and `ClayCard` padding props read from.

```css
@theme {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 40px; --space-8: 48px;
  --space-9: 56px; --space-10: 64px; --space-11: 72px; --space-12: 96px; --space-13: 128px;

  /* Section rhythm */
  --section-gap-mobile: var(--space-11);   /* 72px */
  --section-gap-tablet: var(--space-12);   /* 96px */
  --section-gap-desktop: var(--space-13);  /* 128px */
  --card-padding: var(--space-7) to var(--space-9); /* 40–56px, larger on hero-tier cards */

  /* Container */
  --container-max: 1200px;
  --container-max-wide: 1320px; /* ≥1440 */
  --gutter-mobile: var(--space-5);  /* 24px */
  --gutter-tablet: var(--space-7);  /* 40px */
  --gutter-desktop: var(--space-10); /* 64px */

  /* Radius */
  --radius-clay: 28px;     /* range 24–36 */
  --radius-clay-sm: 20px;  /* buttons */
  --radius-pill: 999px;
  --radius-utility: 14px;  /* tags, filter pills, nav pill — "light clay" tier */

  /* Shadows — the three clay states, verbatim from DESIGN_DIRECTION §5 */
  --shadow-clay-rest: 0 16px 35px rgba(16,22,70,.10), 0 5px 10px rgba(16,22,70,.06),
                      inset 0 2px 3px rgba(255,255,255,.85), inset 0 -3px 6px rgba(16,22,70,.05);
  --shadow-clay-hover: 0 22px 44px rgba(16,22,70,.14), 0 8px 14px rgba(16,22,70,.08),
                      inset 0 2px 3px rgba(255,255,255,.85), inset 0 -3px 6px rgba(16,22,70,.05);
  --shadow-clay-press: 0 6px 14px rgba(16,22,70,.10), 0 2px 4px rgba(16,22,70,.06),
                      inset 0 3px 6px rgba(16,22,70,.08);
  --shadow-utility: 0 2px 6px rgba(16,22,70,.08), inset 0 1px 2px rgba(255,255,255,.6);
  --gradient-clay-volume: linear-gradient(160deg, rgba(255,255,255,.65), rgba(255,255,255,0) 55%);
}
```

**Clay tiers** (governs which token set a component may use — this is the mechanical guardrail against overusing the effect):

| Tier | Radius | Shadow | Volume gradient | Used by |
|---|---|---|---|---|
| Hero | `--radius-clay` (upper end, 32–36px) | rest/hover/press | yes | `AvatarStage`/`ClayFrame`, `ContactCard` |
| Card | `--radius-clay` | rest/hover/press | yes | `ProjectCard`, `ArtifactCard` family, `StoryCard`, `HowIThink` module |
| Utility | `--radius-utility` | `--shadow-utility` only, no press state | no | `Tag`, `FilterTabs` pill, `NavPill`, `StatusBadge` |
| Flat | none | none | no | `Prose`, case-study chapter bodies, essay pages, tables, `WorkHero`/`ThinkingHero` text zones |

Glass (12px `backdrop-blur`, 80% `bg`) is reserved for the compacted header only — never combined with clay shadows on the same element.

---

## 3. Component Architecture & Spatial Layout

Breakpoints used throughout: **390 / 768 / 1024 / 1440.** Mobile home section order (fixed, per brief §30 + DESIGN_DIRECTION §4): avatar → headline → CTAs → Ask → projects → How I Think → final CTA. Layout math below follows `better-layout`'s rules: group with space before borders (Law of Proximity first, Law of Common Region — a card boundary — only where proximity alone is insufficient), align to shared container edges, and never clip a primary action at a viewport edge.

### Clay primitives (shared substrate)

| Primitive | Dimensions/shape | Notes |
|---|---|---|
| `ClayCard` | `tone` × `tier` × `interactive` props | reads tokens above; `interactive` adds hover/press physics from §4 |
| `ClayButton` | min 44×44px, `--radius-clay-sm` | `variant`: primary (accent fill, ink text... actually white/bg text on accent), secondary (outline), ghost (icon-only, transparent) |
| `ClayPill` | height 40–44px, `--radius-pill` | filters (interactive, gets hover+active state) vs tags (static, no hover — Law of Similarity: the two must look distinguishably different so a static tag is never mistaken for a control) |
| `ClayTile` | square, 56–180px depending on context | icon tiles, floating hero tiles, playground tiles |
| `ClayFrame` | intrinsic ratio bezel (4:5 avatar, 16:9 prototype) | avatar + case-study hero media + PrototypeFrame artifact |
| `ClayIcon` | 56×56 (card icon) or 40×40 (nav mark) | lucide icon centered inside a `ClayTile`, one stroke weight (1.75px) everywhere |

### Header (`Header`, `NavPill`, `MobileMenu`, `AskAIButton`, `SkipLink`)

- ≥1024: height 96px at rest (28px vertical padding), compacts to 68px (14px padding) with 12px `backdrop-blur` + 80% `bg` fill after 24px scroll. Container gutter 64px. Left: `ClayIcon` "TP" mark (40×40, utility tier) + wordmark "Tushar Pathak" (14px semibold) + "Senior Product Manager" (12px `ink-3`) stacked. Center-right: nav `Home · Work · Thinking · About`, each a ≥44×44 hit area; the active route's label sits inside a `NavPill` (lavender utility fill) that slides between items via layout animation (Fitts's Law: the pill grows the effective target, not just the label). Far right: `AskAIButton` (`ClayButton` secondary, icon+"Ask AI").
- 768–1023: nav collapses behind a hamburger; wordmark subtitle ("Senior Product Manager") hides to keep header height down (see Deviations §5).
- <768 / hamburger tap: `MobileMenu` — full-screen dialog sheet (not a small anchored dropdown, so focus-trap and 44px targets are trivially correct), 56px row height per nav item, `AskAIButton` + "Download Resume" pinned at the bottom, `Esc`/backdrop closes and returns focus to the trigger.
- `SkipLink`: visually hidden, appears top-left on `:focus`, targets `#main`.
- States: header `idle` / `compact`; `MobileMenu` `closed`/`open`; nav item `default`/`hover`/`active`/`focus-visible` (3px `accent` ring, 3px offset).

### Hero (`Hero`, `AvatarStage`, `FloatingTiles`, `Annotation`)

- ≥1024: two-column grid, 35% `AvatarStage` / 65% content, column gap 64px (96px at ≥1440), container max 1320px at ≥1440. Vertical padding: 128px top (no header compaction has occurred yet) / 96px bottom before the Ask section.
- `AvatarStage`: `ClayFrame` (hero tier, sky/lavender duotone volume gradient), intrinsic 480×600 at 1024–1439, 520×650 at ≥1440. Up to 3 supporting `ClayTile`s (laptop, plant, 2 books → capped at 3 total per DESIGN_DIRECTION) positioned at the frame's corners, z-index above the frame, each independently parallaxed at a shallower depth than the avatar (§4).
- Right column, top-to-bottom (Law of Continuity — single vertical reading axis, no zig-zag): eyebrow (`--text-caption`, uppercase, `ink-3`) → headline (`--text-hero`, weight 800, `ink`, "AI-native products" as the `accent` span) → supporting line (`--text-lead`, `ink-2`, max 44ch) → CTA row (`ClayButton` primary "View My Work →" + secondary "Download Resume ↓", 16px gap, wraps to stacked full-width <768) → `FloatingTiles`.
- `FloatingTiles`: 3 `ClayTile`s (AI Products · People · Progress), ~180×140 at ≥1024, loosely stacked with vertical offsets (−24/0/+24px) to avoid a mechanical grid (brief §11's "possible decorative stack," translated into an asymmetric cluster per the Dribbble-reference principle of restrained asymmetry). <1024: single column, 16px gap, ordered after the CTA row per the fixed mobile order.
- Breakpoint specifics: 768–1023 stacks avatar (centered, 360×450) → headline → CTA → tiles, full width, text center-aligned is **not** used (left-aligned throughout, per Law of Continuity — centering would break the single reading axis established at desktop); <768 avatar 280×350, CTAs full-width stacked, tiles single column, all still left-aligned within the gutter.
- `Annotation`: at most 1 in the hero (not 2–3 — the hero is the highest-stakes screen for the "professional not student" read; save additional annotations for lower-stakes sections), `aria-hidden`, placed near the CTA row, ≤6° rotation.
- States: avatar `idle` / `parallax-active` (pointer:fine, no reduced-motion) / `static` (touch or reduced-motion — frame and tiles simply don't move); CTA `rest`/`hover`/`press`/`focus-visible`.

### Ask my portfolio (`AskPortfolio`, `AskPanel`, `AnswerView`, `SuggestedPrompts`, `EvidenceLinks`, `AskAIButton`)

- `AskPortfolio` (home, inline): full-width rounded field inside a `ClayCard` (card tier), 56–64px height (≥44 target), max width 720px centered below the Hero/tiles, placeholder "Ask about my work…". Below it: 5 `SuggestedPrompts` as `ClayPill`s (interactive), wrapping to 2 rows on mobile.
- On submit the field **does not navigate** (brief §13, hard requirement): the same `ClayCard` expands via layout animation from 64px to `auto` (min 240px), revealing `AnswerView` beneath the field within the card — tone shifts to a `lavender` tint so the expanded state reads as "the same object, now open" (Law of Continuity: one continuous container, not a new one appearing). `AnswerView` = answer text (`--text-body`, ≤65ch) + `EvidenceLinks` (2–3 `ClayPill` links with a trailing arrow, e.g. "View RailCite →") + a ghost "Ask another" button that collapses back to idle.
- `AskPanel` (global, triggered by header `AskAIButton`): right-side drawer, 400px at 1024–1439 / 480px at ≥1440, full height minus 16px inset top/bottom, page content visible and dimmed 20% behind a scrim (`role="dialog" aria-modal="true"`). Header row: "Ask AI" title + 44×44 close. Body reuses the same idle→loading→answer→empty→error state machine as `AskPortfolio`. <768: becomes a bottom sheet at 90vh sliding up from the bottom edge rather than a right drawer (see Deviations §5) — same content, scrim identical.
- States (both surfaces share `useAsk(provider)`): `idle` (prompts visible) → `loading` (≤150ms skeleton, 2 shimmer lines — deliberately shown even though the local provider resolves faster, so the UI never flashes) → `answer` (text + evidence + "Ask another") → `empty` ("I don't have that in the portfolio yet" + 3 fresh prompts) → `error` (`ink` on `blush` flat surface + alert icon + "Try again").
- a11y: `AskPanel` traps focus, `Esc`/scrim click closes and returns focus to `AskAIButton`; `AskPortfolio`'s in-place expansion moves DOM focus to the answer heading without trapping it (the page must stay scrollable, unlike the panel).

### Featured Work (`FeaturedWork`, `ProjectCard` — featured mode, `StatusBadge`)

- ≥1024: 3 `ClayCard`s (card tier) in a single row, 32px gap, equal height (~280px); <1024 stacked full-width, 24px gap.
- Card anatomy, fixed order (brief §14, no additions): 56×56 `ClayIcon` (top-left) → name (`--text-h3`) → one-sentence proposition (`--text-body`, clamped to 2 lines) → ≤3 `Tag` pills → `StatusBadge` → arrow `ClayButton` (ghost, icon-only, 44×44, bottom-right). The entire card is the click target (Law of Figure-Ground: the card's shadow/radius is what makes it read as one clickable figure against the flat `bg`, so no secondary "read more" link is needed or wanted).
- States: `rest` / `hover` (rise 5px, icon scale 1.03, arrow translateX +4px, tone gradient +8% opacity, 200ms) / `focus-visible` (ring) / `press`.

### How I Think (6-stage module, home only)

- ≥1024: horizontal row of 6 `ClayTile` modules (utility-light tier, ~160px wide each), connected by a thin `ink-3` line beneath the row (Law of Continuity: the line is what tells the eye these six are one sequence, not six unrelated items) — icon + label + one-line principle per module, each keyed to its DESIGN_DIRECTION §2 stage colour (Insight→butter, Build→peach, Evaluate/Impact→mint, etc.), and that same colour-to-stage mapping is reused wherever a stage is referenced elsewhere on the site (Law of Similarity — one meaning, one colour, everywhere).
- <1024: the row rotates into a vertical stack, connecting line runs down the left edge instead.
- Interaction: `default` → `hover` (principle line emphasizes, 200ms, desktop only) → `active/expanded` (click/Enter reveals a card below the row — real example quote + "See how I tested this in {Project} →" — pushes following content down via layout animation; only one stage open at a time; closes on outside click or `Esc`).

### Work page (`WorkHero`, `FilterTabs`, `EditorialGrid`, `ProjectCard` — grid mode, `ExperienceStrip`, `DemoVideo`)

- `WorkHero`: flat zone, h1 + lead only, no clay (text-leading pages open flat, establishing credibility before any clay appears below the fold).
- `FilterTabs`: row of 5 `ClayPill`s (utility, interactive). ≥768 the row wraps/fits inline; <768 it scrolls horizontally with the next pill peeking 16–24px past the edge (better-layout's "hint at hidden content" rule — a fully clipped 6th option is a dead end). Active pill: `lavender` fill + `ink` text; inactive: `ink-2` on transparent. Layout-animated indicator per DESIGN_DIRECTION §6 (spring 260/28).
- `EditorialGrid` sizing (12-col grid ≥1024): card[0] "large" spans 8 cols × 2 rows (~800×480); card[1–2] "medium" span 4 cols × 1 row each in the remaining rail (~380×230 each); remaining cards "small" span 4 cols × 1 row in 3-up rows below (~380×180). 768–1023: large spans full width, medium 2-up, small 2-up. <768: single column, all full-width, large card's media ratio drops 16:9→4:3 to control scroll length.
- `ExperienceStrip` (Professional Experience): rendered as a visually distinct **flat, non-clay** bordered strip below the personal grid — Law of Common Region used deliberately here to separate "product" from "employment" — labelled "Professional experience — corporate work, not a public product." Each entry is a flat row (not a card), no arrow/live-link affordance (there is no product to click through to), inline expand-on-click for the one-paragraph summary.
- `DemoVideo`: poster image + centered 56×56 play `ClayButton`. States: `no-video` ("Demo coming" badge over poster only) / `loading` (spinner overlay) / `playing` (native controls, `preload="none"` until intent) / `error` (overlay "View live →" falling back to the project's live URL).
- `StatusBadge`: icon + text, never colour alone — Live=mint, Pilot=sky, Prototype=peach, Research=lavender, Archived=`ink-3` neutral.
- **Open item carried from `CONTENT_INVENTORY.md` §2.1** (not resolved here — Tushar's call): Token Toli / Pratyasa / Bhakti-Vilas don't cleanly fit a filter tab. This spec assumes they park under "Experiments" until decided; zero visual-system impact either way.

### Case study (`CaseStudyHeader`, `OverviewToggle`, `Chapter`, `ChapterNav`, artifacts, `ShowTheThinking`, `NextProject`)

- `CaseStudyHeader`: flat zone, 60/40 two-column ≥1024. Left: name (h1) → one-line problem (lead) → role/duration/status meta row (caption chips, icon+label) → 2–3 inline mini `MetricCard`s ("value + label + context + asOf"). Right: hero media inside `ClayFrame` (prototype bezel), which is the shared-element transition target (`<ViewTransition name="project-{slug}">`, icon gets `name="icon-{slug}"`). <768: media above, text below, metrics wrap to 1 column.
- `OverviewToggle`: 2-segment `ClayPill` switch ("30-sec" default | "Deep dive"). Switching crossfades (200ms) the short RichText for the full `Chapter` list, with a layout animation absorbing the resulting height change.
- `ChapterNav`: ≥1024 a sticky flat left rail (numbered 01–08, current chapter bold + `accent` underline — Law of Continuity marking the active point on the path); <1024 becomes a sticky horizontal scrollable pill row under the header (a fixed rail at tablet width would eat into the 600px prose measure — see Deviations §5).
- `Chapter`: flat text zone (h3 + `Prose` body, ≤600px measure) with 1–3 artifact components below the body, laid out 1-up mobile / 2-up ≥768 / max 3-up ≥1024, **always within the chapter's text column width, never full-bleed** — evidence stays visually anchored to the paragraph it supports (Law of Proximity: an artifact placed full-width would read as belonging to the whole page, not to its chapter).
- Artifacts — one shared `ClayCard` DNA (card tier), shape varies by type (DESIGN_DIRECTION §7, restated as layout): `InsightCard` (quote block, `butter` left accent bar, source caption); `HypothesisCard` (two-part "We believe…" / "We'll know when…" split by a thin rule); `MetricCard` (large tabular-nums value + label + context sentence + `asOf` caption + kind badge: measured/structural/self-reported); `DecisionCard` (two columns, "Chosen" with a `mint` check vs "Rejected" muted `ink-3`, divided); `EvaluationCard` (method → result → limitation, 3 stacked labeled rows); `ExperimentCard` (setup → result → learning, horizontal 3-step mini-connector); `PrototypeFrame` (`ClayFrame` bezel around image/video + caption).
- `ShowTheThinking`: a `ClayButton` toggle below chapter 08 ("Show the thinking ↓"). On click, reveals all 8 `ThinkingNode`s as a **single vertical list at every breakpoint** (not a desktop-horizontal variant — see Deviations §5), each node showing stage label + text + source link, connector line drawing in with each node (120ms stagger). Nodes exist in the DOM (visually collapsed) before the toggle is opened, for screen-reader discoverability. Never auto-plays.
- `NextProject`: flat full-bleed band, "Next: {name} →", 96px height, thumbnail slides in from the right on hover (200ms).

### Timeline (`ExperienceTimeline`, `TimelineNode`, `StoryCard`, `ProductJourney`)

- ≥1024: single horizontal `ink-3` connecting line spans the container; 4 `TimelineNode` dots (Godrej · Quantiphi · Shellkode · AmEx) evenly spaced, company label above the line, date range below. `hover` → node scales 1.1 + adjoining line segment brightens to `ink-2`. `click`/`Enter` → `StoryCard` (`ClayCard`, card tier, `lavender` tone) opens above or below the timeline (whichever has room), full container width, Context/Role/Scale/What changed/Outcomes as a 2-column definition grid (≥768) / 1-column (<768), 44×44 close, URL hash per role, only one card open at a time.
- <1024: rotates to a vertical timeline, connecting line runs down a 24px left inset, `StoryCard` opens inline as an accordion beneath its node.
- `ProductJourney` (About page): the same connector-line pattern at reduced scale, 4 stages (physical → cloud/data → AI-enabled → AI-native), no click interaction — decorative `Reveal`-on-scroll labels only.
- About page's remaining sections (`AboutHero`, capability clusters, `Impact`) follow the same primitives already specified: `AboutHero` is a flat hero variant of `Hero` (headline + avatar, no floating tiles); capability clusters are 4 `ClayTile`s in a 2×2/4×1 grid (utility tier); `Impact` numbers use the `MetricCard` artifact shape (value + label + context, never a naked number, per DESIGN_DIRECTION §1 rule 4).

### Playground (`PlaygroundHero` + tiles)

- Flat hero zone ("Small experiments. Big questions."). Grid of 4 `ClayTile`s (Pratyasa, Tegaki, dino-arcade, cinematic-portfolio), 2×2 ≥768 / 1-column <768. Stronger clay is explicitly permitted here (deeper hover shadow, one tone each: butter/peach/blush/mint) per DESIGN_DIRECTION — this is the one section where the 70/20/10 professional/playful/experimental ratio tips toward playful. Each tile fully clickable, opens the live URL in a new tab (`rel="noopener"`), 44×44 minimum.

### Contact (`ContactCard`)

- Single centered `ClayCard` (hero tier — the largest radius on the site, `lavender` tone), max-width 640px: headline "Still curious?" → `CopyButton` (email; copies to clipboard, toast "Copied") → mailto `ClayButton` → LinkedIn `ClayButton` (external) → "Download Resume" `ClayButton`. 2×2 button grid ≥768, stacked <768, 12px gaps between bordered controls (better-layout's breathing-room minimum), all ≥44×44.
- `CopyButton` states: `idle` → `copied` (200ms icon morph to check, reverts after 2s) → `error` (clipboard API blocked — falls back to visibly selectable email text, never a silent failure).

### Footer

- Flat, two-tier. Tier 1: large "Still curious? Let's build what's next." + 3 actions (Download Resume · LinkedIn · Let's Talk — same components as `ContactCard`'s actions, not re-implemented). Tier 2 (caption size, `ink-3`): name + title, 4 nav links (Work · Thinking · About · Contact), "Built with curiosity." 96px top padding, 40px bottom + `env(safe-area-inset-bottom)`.

### Thinking (`ThinkingHero`, `ThinkingList`, `EssayBody`)

- `ThinkingHero`: flat, h1 only. `ThinkingList`: numbered rows ("01" in `ink-3`, large) + title (h3) + one-line dek, full width, 1px `ink-3`/10% bottom border, 32px vertical padding. `hover`: number shifts to `accent`, row background tints `lavender` at 4% (a deliberately subtle Law of Figure-Ground cue — this is an editorial list, not a card grid, so the hover state must stay quiet). `EssayBody` = `Prose` wrapper (title, reading-time caption, body, related-project `ExternalLink` card at the end). DRAFT essays show a "Draft — pending sign-off" `Tag` instead of a publish date (per CONTENT_INVENTORY's DRAFT-until-signed-off rule).

### Common primitives

`Icon` = lucide, 1.75px stroke, 20/24px sizes, one family everywhere. `Tag` = static utility `ClayPill`, `ink-2` text, no hover state (distinguishing it from `FilterTabs`, which is interactive — see Law of Similarity note above). `ExternalLink` = inline text + 12px arrow-up-right icon, opens new tab. `VisuallyHidden` = sr-only utility. `Prose` = the flat 60ch-measure wrapper used by every essay/chapter body.

---

## 4. Motion & Micro-Interactions Spec

Global rule (unchanged from DESIGN_DIRECTION §6): everything below collapses to instant or opacity-only under `prefers-reduced-motion: reduce`. Never: trailing cursor, scroll hijack, continuous rotation/bounce/float, particles, animated backgrounds, typewriter. Per `emil-design-eng`: nothing here uses `ease-in` (feels sluggish on entrance), nothing exceeds ~450ms for a UI-triggered animation, and every entrance starts from `scale(0.95)`/`opacity:0` minimum — never `scale(0)`.

| Interaction | Mechanism | Physics / curve | Duration | Stagger | Reduced-motion mapping |
|---|---|---|---|---|---|
| Section reveal | CSS transition (`Reveal`, IO once) | `cubic-bezier(.2,.7,.2,1)` | 500ms | 70ms/item | opacity only, ~1ms (effectively instant) |
| Card hover (Project/Featured) | CSS transition | `cubic-bezier(0.23,1,0.32,1)` (strong ease-out) | 200ms | — | disabled entirely (no rise); colour/opacity change only |
| Cursor parallax (hero avatar + tiles) | `motion` `useSpring` | stiffness 120 / damping 20 / mass 1 | perceptual ~450ms settle | tiles at 0.5×/1×/1.5× depth | fully static; also gated behind `(hover:hover) and (pointer:fine)` so touch never attempts it |
| Button press | CSS transition | ease-out | 90ms press / 180ms hover-lift | — | press `scale(0.98)` kept (safe, no positional motion); `translateY` lift removed |
| Header compaction | CSS transition | ease | 250ms | — | instant swap, no blur cross-fade |
| Filter change | `motion` layout animation | spring stiffness 260 / damping 28 | ~300ms | fade-out 150 / fade-in 200 | opacity-only crossfade, no spring reflow |
| Shared element (card → case header) | View Transitions API | `cubic-bezier(.77,0,.175,1)` | 450ms | — | plain navigation (already the progressive-enhancement fallback for unsupported browsers) |
| Ask panel slide-in | CSS transition (Ionic drawer curve) | `cubic-bezier(0.32,0.72,0,1)` | 320ms | — | instant show/hide; scrim still fades 150ms opacity-only |
| Ask inline expand (home field) | `motion` layout animation | spring stiffness 210 / damping 26 | ~280ms | — | height snaps instantly, content opacity 150ms |
| Show-the-thinking node reveal | CSS transition | `cubic-bezier(.2,.7,.2,1)` | 220ms | 120ms/node | all 8 appear at once, opacity only |
| Timeline `StoryCard` expand | `motion` layout animation | spring stiffness 240 / damping 30 | ~300ms | — | height snaps instantly |
| How-I-Think stage expand | CSS transition | ease-out | 200ms | — | instant |
| DemoVideo poster → play | CSS transition | ease | 150ms | — | unaffected (opacity/scale of the play icon only, no positional motion) |
| CopyButton icon morph | CSS transition | ease-out | 160ms | — | unaffected |
| Handwritten annotation wash | CSS transition, one-time on first view | ease-out | 700ms | — | removed entirely (decorative, `aria-hidden`) |

Hardware-acceleration rule (per `emil-design-eng`): every entry above animates only `transform` and `opacity` (plus `clip-path` for the Show-the-thinking connector draw-in), never `width`/`height`/`top`/`left` directly — `motion`'s layout-animation entries handle height/position changes internally via FLIP, not by animating box-model properties frame-by-frame.

---

## 5. Accessibility & QA Checklist (mapped to `evaluation-plan.md`)

| Check | Spec source | EVAL gate |
|---|---|---|
| Body text ≥7:1 on `bg`; secondary ≥4.5:1; text on clay tones is `ink` only | §2 tokens | EVAL-006, EVAL-009 |
| Every touch/pointer target ≥44×44px | Fitts's Law, applied throughout §3 | EVAL-008 |
| Full keyboard path: nav, `MobileMenu`, `FilterTabs`, `ExperienceTimeline`, `AskPanel` open/answer/close, `ShowTheThinking` | §3 per-component states | EVAL-007 |
| Focus ring always visible: 3px `accent`, 3px offset | DESIGN_DIRECTION §5, carried through every interactive primitive | EVAL-007 |
| `prefers-reduced-motion` collapses every row in §4's table | §4 | EVAL-010 |
| axe-core 0 critical/serious at 390 & 1440 on every route | cross-cutting | EVAL-006 |
| Alt text on every image; avatar alt fixed to "Clay illustration of Tushar Pathak at a laptop" | DESIGN_DIRECTION §9 | EVAL-006, EVAL-013 |
| Colour never the sole carrier of meaning (`StatusBadge`, error states, active nav/filter state all pair colour with icon/label/weight) | §3 | EVAL-006, EVAL-009 |
| Semantic landmarks + `SkipLink` on every route | §3 Header | EVAL-006, EVAL-007 |
| No horizontal scroll at 390/768/1024/1440 (the only intentional horizontal scroller is `FilterTabs`, which has a visible peek affordance, not silent overflow) | §3 Work page | EVAL-008 |
| Premium rubric: whitespace ≥50%, ≤1 accent colour visible per section, avatar resembles Tushar, reads "Senior PM" not "student" | §1–§3 throughout; scored at Stage 8 (`impeccable` critique) against the running build | EVAL-009 |
| 5-second test: name / Senior PM / builds AI products / user problems / actually builds / projects to explore, all in the first viewport at 390 & 1440 | §1 Conversion goal, §3 Hero | EVAL-001 |
| Four screen states (loading/empty/error/working) designed for every data-backed view: `AskPortfolio`/`AskPanel`, `DemoVideo`, `FilterTabs`+`EditorialGrid`, `ExperienceTimeline` | §3 per-component states | EVAL-014, EVAL-015 |
| Reduced-motion, keyboard, and screen-reader paths for `ShowTheThinking` and `ExperienceTimeline` specifically (the two most novel interactions) | §3, §4 | EVAL-007, EVAL-010 |

---

## Deviations

Departures from `DESIGN_DIRECTION.md` / the brief, each for accessibility, performance, or feasibility only — none are aesthetic re-decisions:

1. **OKLCH values are hand-computed approximations, not tool-exact.** Hex stays byte-identical to DESIGN_DIRECTION §2 and is the source of truth; regenerate exact OKLCH via a converter before locking `app/globals.css`'s `@theme` block. *(Feasibility — no colour-conversion tool was available in this pipeline step.)*
2. **`AskPanel` becomes a bottom sheet, not a right drawer, below 768px.** A 400px fixed-width right drawer cannot fit a 390px viewport at all; a bottom sheet preserves "page visible behind" and keeps the input in the thumb-reach lower half of the screen. *(Accessibility/feasibility — Fitts's Law for one-handed mobile use.)*
3. **`FilterTabs` scrolls horizontally with a peeking affordance below 768px**, instead of wrapping to multiple rows. Five tabs cannot wrap onto 375–390px width without shrinking labels below the 14px caption floor DESIGN_DIRECTION sets as an absolute minimum. *(Accessibility — text-size floor takes priority over avoiding scroll.)*
4. **`ChapterNav` becomes a sticky horizontal pill row below 1024px** instead of keeping the desktop left rail. A fixed left rail at tablet width would compress the 600px prose measure DESIGN_DIRECTION requires for case-study bodies. *(Feasibility — competing space constraint.)*
5. **Header wordmark subtitle ("Senior Product Manager") hides below 768px.** Keeping a 3-line header at mobile width eats vertical space the Hero needs to pass the 390px 5-second test (EVAL-001) without scrolling. *(Performance of the primary conversion goal, not aesthetics.)*
6. **`ShowTheThinking` renders as a single vertical list at every breakpoint**, rather than offering a desktop-only horizontal variant. A horizontal-scroll region for 8 sequential nodes would need its own keyboard-navigation affordance and complicates the "read top to bottom" mental model the interaction is built on; vertical-always is simpler to keep fully keyboard- and screen-reader-operable. *(Accessibility.)*

Nothing in this document re-opens palette, typography, navigation, or scope decisions already fixed in `DESIGN_DIRECTION.md`, `SITEMAP.md`, or `Solution-PRD.md`.
