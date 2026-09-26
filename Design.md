# Design Specification (`Design.md`) — M-009 illustrated editorial (paper) system

Stage 4 of the build chain · Portfolio (Tushar Pathak) · rewritten 2026-09-24 for M-009. **Supersedes** the clay `Design.md` (in git history at `7a8b60c` and earlier) and `DESIGN_DIRECTION.md` (S11). Consumes `Solution-PRD.md` §12, `Discovery-PRD.md` §9, `evaluation-plan.md` §8 (EVAL-018…022 are the design gates this file must make measurable), `decisions.md` S11–S21 · EV3–EV6 · D6–D12, `docs/redesign-mockups/m-009/` (the reference of record, S17), and `~/.claude/web-deliverables.md`. Feeds `milestones.md` + `tickets.md` (Stage 5), `technical-plan.md` + `test-cases.md` (Stage 6), the paper primitives (Stage 7) and the Stage-8 critique (EVAL-022 writes into §11).

**Precedence when sources disagree** (decisions D6/D7):
1. Measurable contracts in this file (§3 decoration contract, §5 hero, §6 illustrations, §9 OG) — they implement approved EVAL rows; a mockup detail that breaks one is a recorded deviation, not a reason to weaken the row.
2. Copy: `data/*.ts` (via `docs/redesign-mockups/m-009/content-brief.md`) wins over any text the mockups authored, except handwritten annotations, which are the only authored text and never carry facts (§12.3, §12.5c).
3. Layout, materials, hierarchy: the mockups win over the old clay spec.

---

## 1. Executive Visual Strategy & Discovery

### Benchmark patterns — the eight mockups are the reference (S17)
The `t-design` Mobbin research step was **not re-run**: Tushar approved `home.html` ("this is very good") and the seven other pages ("go ahead"), so the production patterns to match are the mockups themselves, copied to `docs/redesign-mockups/m-009/` (index in its `README.md`). The clay `Design.md`'s Mobbin citations (asymmetric hero, editorial grid, filter row above a list, side panel with the page visible, horizontal timeline) still describe the *structure* the mockups keep; only the material changed.

### Generative media assets (Higgsfield, already produced — no further spend, §12.4)
| Asset | Source of truth on disk | Shipped rendition (Stage 7, §6) | Used on |
|---|---|---|---|
| Character sheet, **locked Variant B** (2026-09-23; EV4 likeness gate) | `Portfolio-illustration/illustrations/character-sheet/character-ref-LOCKED.png` | `content/media/illustrations/reference/character-sheet-b.jpg` (reference only, never rendered on a page) | Stage-8 style-drift check for every scene and the clip |
| Hero desk scene + **clip A** (thinks, one pen turn, 2.5 s, plays once, holds — S14) | `Portfolio-illustration/animation/export/hero-animation.{webm,mp4}`, `hero-poster.webp`, `hero-end.webp` (1280×684) | `public/media/illustrations/hero-animation.webm` (176 kB ≤ 200) · `.mp4` (312 kB ≤ 350) · `hero-poster.webp` (87 kB ≤ 120) | `/` hero (§5) + home OG (§9) |
| Six page scenes (gpt_image_2_5 from the locked sheet, 2026-09-23) | `Portfolio-illustration/illustrations/scenes/scene-{work,casestudy,about,thinking,playground,contact}.{png,jpg}` | `content/media/illustrations/scene-*.jpg` → `next/image` AVIF/WebP | one per route family (§7) |

Character: Indian man, short dark hair, full beard, grey blazer, dark shirt; gouache-and-pencil editorial style. Never Pixar, chibi or mascot. Every scene and the clip are judged against the sheet at Stage 8 (EVAL-009 item 6, EVAL-022).

### Core aesthetic
Warm editorial illustration + paper collage + hand-drawn annotation: one cream paper world (`paper` / `ivory` / `paper-2`), navy ink, one warm accent (`rust`, deepening to `terracotta` for the band), two greens and a steel blue for secondary marks, `note` and `kraft` for the paper objects. Type is a serif display (Fraunces), a quiet sans (Inter) and a handwriting face (Caveat) that is *only* ever an annotation, a short sourced quote, a CTA label or a ≤3-word field label (S13, §3.4). Sections are separated by torn edges, content sits on tilted ivory sheets, and a hand-drawn line or a sticky note points at one thing per section.

**The central design risk moved** from "clay tips into toy" (D1) to "paper tips into scrapbook / children's book" (S15). The mechanical guard replacing the clay tiers is the **decoration contract** in §3: ≤ 4 free-standing decoration objects per `<section>`, Caveat never for body copy, headings or data, flat reading zones with zero decoration, and every text-bearing decoration hidden from assistive tech. EVAL-018 measures exactly the selectors defined there.

### Conversion goal
Unchanged funnel: hero → `/work` → case study → `/about` → `/contact`. Two changes: (1) the **terracotta band footer** is the single closing CTA on every route (S16) — headline, hiring line, email, LinkedIn / GitHub / résumé — so no page carries its own final CTA (home Final-CTA removed; §11 Dev-08 proposes the same for the Thinking/Playground "quiet close" mockup sections); (2) the hero's second CTA is **"Ask my portfolio"** (anchor to `#ask`) rather than the résumé, per the approved home mockup; the résumé stays one target away in the band on every page. The 5-second test (EVAL-001) is satisfied in the first viewport at 390 and 1440 by: the data eyebrow "Senior Product Manager · Product Thinker · AI Builder · Problem Solver" (title VERIFIED, triad DRAFT), the data h1 with "AI-native products", the two CTAs, and the illustrated desk (the character, not a photo).

### Mobile, PWA and platform considerations
Static Next.js site (TP1), no manifest or service worker. Breakpoints **390 / 768 / 1024 / 1440** (the Playwright projects). The mockups' `max-width: 640 / 900 / 1024` queries map to Tailwind `sm` (640) / `lg` (1024) / `xl` (1280); the mockup's 900 px nav collapse becomes `lg` (D12). Mobile nav: hamburger → a full-width paper sheet dropping from the header (mockup) implemented as the existing native `<dialog>` `MobileMenu` restyled (focus trap, `Esc`, focus return). Touch targets ≥ 44×44 everywhere (`min-h-11 min-w-11`); sticky header honours `env(safe-area-inset-top)`; band © bar adds `env(safe-area-inset-bottom)`. Fonts self-hosted via `next/font` (S13) — zero runtime third-party requests, so the TP9 CSP stays as is. Reduced motion, touch and Save-Data all get the poster-only hero (§5).

---

## 2. Design Tokens & Brand System

### 2.1 Colour — 13 paper tokens, swapped 1:1 for the 13 clay tokens (S12, EVAL-020)
Hex is authoritative (D2 stands); the OKLCH below was **generated with the repo's `culori` (3-decimal, round-trips to the hex exactly)** — the old "hand-computed" deviation is closed. `scripts/tokens-check.ts` `AUTHORITATIVE` and `app/globals.css` `@theme` change together in one commit; the count stays 13.

| # | Token | Hex | OKLCH (culori) | Replaces (retired name, EVAL-020 "0 references") | Role |
|---|---|---|---|---|---|
| 1 | `paper` | `#F7F1E7` | `oklch(0.96 0.015 80.707)` | `bg` | page background, torn-section fill A |
| 2 | `ivory` | `#FBF7EF` | `oklch(0.977 0.011 84.578)` | `surface` | sheets, cards, buttons, band text |
| 3 | `paper-2` | `#EFE7D8` | `oklch(0.93 0.022 83.264)` | `lavender` | alternating section fill B, tab rests, notebook holes |
| 4 | `navy` | `#0D1735` | `oklch(0.215 0.06 267.312)` | `ink` | primary text, ink strokes, nav pill, next-project band |
| 5 | `navy-2` | `#2E3854` | `oklch(0.345 0.051 268.613)` | `ink-2` | secondary text, hand-drawn arrows, eyebrows |
| 6 | `ink-soft` | `#5A6178` | `oklch(0.495 0.038 271.716)` | `ink-3` | captions, numerals, sources, placeholders |
| 7 | `rust` | `#B64927` | `oklch(0.546 0.15 37.449)` | `accent` | primary button, underlines, numerals, links, pins |
| 8 | `terracotta` | `#92381F` | `oklch(0.463 0.128 36.199)` | `accent-deep` | band footer fill, draft/kraft-tag text, hover deepening |
| 9 | `forest` | `#214F43` | `oklch(0.391 0.055 173.852)` | `mint` | "zero"/positive metrics, Chosen check, live dot |
| 10 | `green-2` | `#496D58` | `oklch(0.501 0.053 158.186)` | `sky` | kickers/tags, postcard stamp text |
| 11 | `steel` | `#63799E` | `oklch(0.573 0.063 260.651)` | `blush` | ruled lines, badge borders, pilot dot, eval labels |
| 12 | `note` | `#EEDCA9` | `oklch(0.897 0.069 90.914)` | `peach` | sticky notes, band italic word |
| 13 | `kraft` | `#D7BE93` | `oklch(0.812 0.064 81.035)` | `butter` | tape, kraft tags/labels, stamps, next-band eyebrow |

**Derived values — `color-mix()` only, never a second literal** (S12; EVAL-020 forbids colour literals outside `globals.css` and the one allow-listed OG module):

| Derived custom property | Definition | Used for |
|---|---|---|
| `--line` | `color-mix(in oklab, var(--color-navy) 12%, transparent)` | hairlines, secondary-button border, dashed rules |
| `--line-strong` | `… navy 16%` / `… navy 25%` | list row rules / sketch borders, chapnav rule |
| `--shadow-paper` | `0 1px 2px color-mix(in oklab, var(--color-navy) 8%, transparent), 0 10px 24px -12px color-mix(in oklab, var(--color-navy) 22%, transparent)` | every sheet/card/postcard |
| `--shadow-paper-hover` | `0 2px 3px navy 8%, 0 22px 40px -18px navy 35%` | card hover |
| `--shadow-sticky` | `0 8px 14px -8px navy 35%` | sticky notes |
| `--tape` | `color-mix(in oklab, var(--color-kraft) 55%, transparent)` + border `terracotta 8%` | tape strips |
| `--rule-blue` | `color-mix(in oklab, var(--color-steel) 16%, transparent)` (18% on notebooks, 13% on index cards) | ruled-paper lines |
| `--margin-red` | `color-mix(in oklab, var(--color-rust) 45%, transparent)` | notebook margin line |
| `--grain-a` / `--grain-b` | `navy 3.5%` / `terracotta 3%` radial dots, 7 px + 11 px tiles, opacity .9 | `body::before` paper grain (fixed, pointer-events none) |
| `--header-bg` | `color-mix(in srgb, var(--color-paper) 86%, transparent)` + `backdrop-blur(10px)` | sticky header |
| `--band-hatch` | `repeating-linear-gradient(-45deg, ivory 5.5% 0 1.5px, transparent 1.5px 13px)` | band texture |
| `--on-band`, `--on-band-muted` | `ivory` / `color-mix(ivory 70–85%, transparent)` | band eyebrow, hiring line, labels, © bar |

**Contrast (culori WCAG, verified 2026-09-24):** navy/paper 15.7 · navy-2/paper 10.3 · ink-soft/paper 5.5 · ink-soft/paper-2 5.0 · rust/paper 4.7 · ivory-on-rust (primary button) 4.9 · ivory-on-terracotta 7.0 · note-on-terracotta 5.5 · green-2/paper-2 4.7 · green-2/ivory 5.4 · forest/ivory 8.7 · navy/note 13.0 · navy/kraft 9.8 · kraft-on-navy 9.8 · terracotta/paper-2 6.1. **Two mockup pairs fail and are corrected here:** terracotta-on-kraft 4.2 (kraft media-tag text → `navy`, 9.8) and the band headline's second line `navy @ 78 %` on terracotta (≈2.2:1) → `kraft` on terracotta (≥ 4:1 for a 40–72 px heading). Rust text is reserved for ≥ 17 px or bold (4.7:1 is AA for normal text but leaves no headroom at 12 px); rust 12 px appears only as the `.eyebrow .dot` glyph. Body text ≥ 7:1 (navy, navy-2), secondary ≥ 4.5:1 (ink-soft, green-2), and colour is never the only signal (§10).

```css
@theme {
  /* Colour — 13 tokens (hex authoritative in Design.md §2.1; oklch regenerated by scripts/tokens-check.ts) */
  --color-paper: oklch(0.96 0.015 80.707);
  --color-ivory: oklch(0.977 0.011 84.578);
  --color-paper-2: oklch(0.93 0.022 83.264);
  --color-navy: oklch(0.215 0.06 267.312);
  --color-navy-2: oklch(0.345 0.051 268.613);
  --color-ink-soft: oklch(0.495 0.038 271.716);
  --color-rust: oklch(0.546 0.15 37.449);
  --color-terracotta: oklch(0.463 0.128 36.199);
  --color-forest: oklch(0.391 0.055 173.852);
  --color-green-2: oklch(0.501 0.053 158.186);
  --color-steel: oklch(0.573 0.063 260.651);
  --color-note: oklch(0.897 0.069 90.914);
  --color-kraft: oklch(0.812 0.064 81.035);
}
```
Dark mode: none (S19). No `dark:` variants, no theme toggle.

### 2.2 Typography (S13)
`next/font/google`, subset `latin`, `display: "swap"`: **Fraunces** (variable, `axes: ["opsz", "SOFT"]`, weight 400–700 — display only), **Inter** (400/500/600 — body and UI), **Caveat** (400/600 — hand). Manrope is removed with its `--font-manrope` variable. If the loader rejects Fraunces' axes, the Phase-0 tracer falls back to static Fraunces 500 and drops `font-variation-settings` (Solution-PRD §12.7).

```css
@theme {
  --font-display: var(--font-fraunces), "Iowan Old Style", Georgia, serif;
  --font-body: var(--font-inter), system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-hand: var(--font-caveat), "Segoe Print", "Bradley Hand", cursive;
}
```
Base: `body` Inter 16 px / 1.6, navy, `-webkit-font-smoothing: antialiased`. Headings: Fraunces 500, line-height 1.02, letter-spacing −.015em, `text-wrap: balance`; `opsz`/`SOFT` set per role.

| Role | Face · weight | Size (fluid, 390 → 1440) | `font-variation-settings` | Notes |
|---|---|---|---|---|
| Page h1 (home hero, case study, contact) | Fraunces 500 | `clamp(42px, 5.2vw, 76px)` · case study `clamp(52px, 6.4vw, 92px)` · contact `clamp(46px, 5.6vw, 84px)` | `"opsz" 144, "SOFT" 30` | home h1 carries the rust underline draw-in on "people can use." |
| Oversized page word (Work, Thinking) | Fraunces 500 | `clamp(64px, 8vw, 120px)` / `clamp(56px, 7vw, 108px)` | `"opsz" 144, "SOFT" 30–40` | single word with underline |
| Section h2 | Fraunces 500 | `clamp(40px, 4.6vw, 64px)` (ask `clamp(38px,4.2vw,58px)`; band `clamp(40px,5vw,72px)`) | `"opsz" 120, "SOFT" 30` (band 144) | |
| Card h3 (work/opener) | Fraunces 500 | `clamp(28px, 2.6vw, 40px)`; flagship `clamp(34px, 3.6vw, 56px)`; list rows `clamp(24px, 2.2vw, 30px)` | `"opsz" 96, "SOFT" 20` | |
| Small h3 (stage, story, patent, sheet) | Fraunces 500 | 22–28 px | `"opsz" 72, "SOFT" 20` | |
| Big metric value | Fraunces 500, `tabular-nums` | 30 px inline · 44 px hero metric · `clamp(40px, 4vw, 56px)` metric card | `"opsz" 96, "SOFT" 20` | rust for the headline metric, forest for a "zero" metric |
| Numerals (`01`) | Fraunces 500 (list/opener) 19–22 px · Caveat 600 label 16–26 px | — | `"opsz" 72` | Caveat numerals are `data-hand="label"` (§3.4) |
| Nav | Fraunces 500 | 18 px | — | ink-stroke SVG underline on `aria-current`/hover |
| Lead / support | Inter 400 | 17 px (19 px case-study lead) | — | max 44–48ch |
| Body / prose | Inter 400 | 17 px / 1.65–1.7 | — | measure ≤ 68ch (`Prose`) |
| Card copy | Inter 400 | 14–16 px / 1.5 | — | |
| Eyebrow / kicker / tags | Inter 600 uppercase | 12 px, tracking .12–.14em | — | navy-2 (eyebrow) · green-2 (kicker) · rust `·` dot |
| Caption / source / meta | Inter 400–500 | 12–14 px | — | ink-soft · never below 12 px (EXE-7 micro-label rule; 11 px only on `aria-hidden` tags) |
| Hand annotation | Caveat 400 | 17–22 px (hero sub `clamp(26px, 2.6vw, 34px)`; quote card 24 px) | — | ≥ 17 px always (MOCKUP-BRIEF §5); `aria-hidden` |
| Hand CTA label | Caveat 600 | 20–22 px (buttons, pill, "Read the case study →") | — | `data-hand="cta"` |
| Hand short quote | Caveat 400 | 17–30 px | — | `data-hand="quote"`, ≤ 240 chars, always with a `cite`/`Source:` |
| Secondary button | Inter 500 | 15 px | — | ivory, `--line` border |

### 2.3 Spacing, radius, shadow, layout
Base unit 8 px; the clay `--space-*` scale (4…128) stays. Container `--max: 1360px`, gutter `--gutter: clamp(16px, 4vw, 56px)` (≥ 16 px at 390 — MOCKUP-BRIEF §5). Section padding-block `clamp(56px, 7vw, 100px)` top / `clamp(72px, 8vw, 120px)` bottom; a torn section starts 16–26 px below its torn edge; sections alternate `paper` → `paper-2` → `paper`. Radius: paper 3–6 px (`--radius-paper: 4px`, sheets `3px 10px 10px 3px`), pill `999px`, image inside a frame 2 px. Rotation: content sheets ±0.4–0.9°, photos ±1.6–2.4°, stickies ±3–5°, tape ±3–12°, never more (§3.1 caps). Shadows: only the derived `--shadow-*` set. No blur other than the header; no glass elsewhere; no aurora, glow, halo (S11).

---

## 3. Paper primitives and the decoration contract (S15 / EV5 / EVAL-018) — normative

### 3.1 Vocabulary — every paper primitive, what it renders, whether it counts
`data-decor` marks a **decoration object** (counts toward the budget). `data-paper` marks **content-bearing paper** (a material, not a decoration — it carries `data/*.ts` content or a screen state and is in the accessibility tree). `data-fastener` marks tape and pins that attach a host. `data-flat` marks a reading zone. `data-hand` marks the four Caveat exemptions.

| Primitive (component) | Renders | Attribute | Counts? | Caveat inside? | `aria-hidden`? | Rotation cap |
|---|---|---|---|---|---|---|
| `TornEdge` (44–46 px SVG between sections; band 46 px) | `<svg data-decor="torn">` as first child of the section it belongs to | `data-decor="torn"` | **yes, 1** | — | yes | — |
| `Sticky` (note-coloured square; kraft variant) | `<p data-decor="sticky">` | `data-decor="sticky"` | **yes** | yes (annotation) | **yes** | ±5° |
| `Annotation` (hand caption, aside, margin note, "start here ↓", with or without an arrow SVG) | `<p data-decor="annotation">` (arrow `<svg>` inside is part of the object) | `data-decor="annotation"` | **yes** | yes | **yes** | ±4° |
| `Sketch` (hand-drawn line art: underline draw-in, spark, journey path, chain path, flow diagram, tools drawing, free arrow) | `<svg data-decor="sketch">` or `<div data-decor="sketch">` (flow diagram) | `data-decor="sketch"` | **yes** | boxes in a flow sketch are Caveat | **yes** | — |
| `Note` (any other free scrap on `note`/`kraft`/`paper-2`: stamp, decorative label carrying no data) | `<span data-decor="note">` | `data-decor="note"` | **yes** | yes | **yes** | ±6° |
| `Tape` / `Pin` fastening a host | `<span data-fastener="tape">` / `"pin"` inside the host | `data-fastener` | **no** (D6) — ≤ 2 per host | — | yes | tape ±12°, pins none |
| `collage` backdrop (TKT-99, Dev-41 — home How-I-think only: torn scraps, notebook strip, sprigs, stamp, postmark behind the stage cards) | one `<div data-decor="collage">`; its pieces carry no `data-decor` of their own | `data-decor="collage"` | **yes, 1** (the whole backdrop) | — (no text) | **yes**, pointer-events none | pieces ±16° (static) |
| Free-standing tape (not on a host) | `<span data-decor="tape">` | `data-decor="tape"` | **yes** | — | yes | ±12° |
| `Sheet` (ivory card / index card / postcard / notebook page / photo frame carrying content) | `<article|div|figure data-paper="card|index|postcard|notebook|photo|tag">` | `data-paper` | **no** | only via `data-hand` | no | ±0.9° (photo ±2.4°) |
| `Illustration` (scene image or hero poster/clip) | `<img>`/`<video>` inside `[data-paper="photo"]` or a scene bleed `<figure data-illustration>` | `data-illustration="<manifest id>"` | **no** | — | video yes; bleed duplicates yes (§6) | — |
| `DraftTag` / `StatusBadge` / kind badge | Inter 12 px pill or tag (not Caveat) | `data-paper="tag"` when on paper | **no** | **no** | no | ±4° allowed on a DraftTag |

### 3.2 The counting contract (what `tests/e2e/eval-018.spec.ts` implements)
1. **Counting unit.** Each `<section>` element, plus the `<header>` and the band `<footer>`. A decoration belongs to its **nearest ancestor section** (nested chapter `<section>`s own their decorations; the enclosing "deep dive" section does not re-count them).
2. **What counts.** Every element with a `data-decor` attribute (`torn | sticky | annotation | sketch | note | tape | collage` — `collage` added by Dev-41) — one each, regardless of size. `data-fastener` and `data-paper` never count (D6 narrows EV5's "tape" to *free-standing* tape).
3. **Budget.** ≤ **4** `data-decor` per counting unit at **both** 390 and 1440. Decorations hidden by CSS at a width still count if in the DOM — remove them from the DOM (render conditionally) or keep the section under budget at every width.
4. **Flat zones.** `[data-flat]` wraps: every case-study chapter `Prose` body, the essay `.prose` column, every `<table>`, and the `<dl>` in a story card. A flat zone contains **0** `data-decor` descendants. `data-hand="quote"` blockquotes are allowed inside a flat zone (they are content, not decoration).
5. **Caveat.** For every `p, h1, h2, h3, h4, h5, h6, li, td, th, dt, dd` whose computed `font-family` resolves to Caveat: it must have a `[data-decor]` or `[aria-hidden="true"]` ancestor-or-self, **or** carry one of the `data-hand` exemptions in §3.4 within its limits. Otherwise fail.
6. **Text-bearing decorations** (`sticky`, `annotation`, `note`, a `sketch` with text) must be `aria-hidden="true"` and must not carry information that appears nowhere else on the page (S15 d — judged at Stage 8; the automated check only asserts `aria-hidden`).
7. **Section sizing (design rule, not automated).** A section is ≈ one viewport at 1440×900 (≤ ~1.5 viewports). Long list/reading sections (work index, chapters container, essay body, timeline, sources) are allowed to be taller but place their decorations within the first viewport-height of the section and never exceed the budget.
8. **Hosts.** A host (`data-paper`) carries at most 2 fasteners; a fastener is always rendered inside its host.

### 3.3 Planned decoration count per section (design of record; Stage 7 must match, Stage 8 verifies)
Counts are the objects that count under §3.2; fasteners and content paper are listed for completeness but do not count.

| Route · section (`<section>` / unit) | `data-decor` objects | Count | Not counted (fasteners / content paper) |
|---|---|---|---|
| all · `<header>` | subline annotation "Build · Learn · Solve · Grow" | 1 | — |
| all · band `<footer>` | torn | 1 | tagline is `data-hand="quote"` |
| `/` hero | hand-sub annotation · h1 underline sketch · scene caption annotation | 3 | poster/clip illustration |
| `/` featured | torn · quote-card annotation (with arrow) · TeachSpark flow sketch · TeachSpark sticky "Capability, not dependency." | 4 | 3 taped work cards (`data-paper="card"`); **mockup's h2 spark and Velora sticky removed** (Dev-03) |
| `/` how I think | torn · journey path sketch (≥ 1025 only) · collage backdrop (Dev-41, TKT-99) | 2 → **3** at 1440 / 2 at 390 | 6 pinned torn-edge stage cards (their deckled edge layers are the card material); stage quotes `data-hand="quote"` on tinted taped slips (the slip + its tape strip are CSS on the blockquote — the quote's own paper, not a fastener or decoration) |
| `/` ask | torn · notebook prompt annotation "What would you like to know?" | 2 | notebook (`data-paper="notebook"`) |
| `/work` opener | h1 underline sketch · scene caption annotation | 2 | scene bleed illustration |
| `/work` index | torn · "start here ↓" annotation (arrow hidden < 900 stays in the object) · RailCite sticky "trust is the product." | 3 | flagship opener card (taped), rows; `EmptyState` index card renders only when empty (Dev-05) |
| `/work` experience strip | torn | 1 | `↳` is CSS list chrome |
| `/work/[slug]` header | ~~photo caption annotation~~ · media-tag sub-line annotation | 2 → **actual 1** (Dev-26: no photo until a project has hero media) | taped photo frame (only with media); "Hero media coming" tag is `data-paper="tag"` content |
| `/work/[slug]` metric strip | torn · "the smaller, honest number" annotation (rich projects only; omitted when < 2 metrics) | 2 | 3 pinned metric cards |
| `/work/[slug]` overview | torn · "if you only have thirty seconds →" annotation | 2 | notebook; depth tabs |
| `/work/[slug]` deep dive (outer) | — | 0 | chapnav |
| `/work/[slug]` each chapter (nested section) | — | 0 | `Prose` is `data-flat`; artifact cards are `data-paper` |
| `/work/[slug]` show the thinking (nested section) | "the chain, start to finish" annotation · chain path sketch | 2 | medallions, labels |
| `/work/[slug]` what I learned | torn | 1 | notebook; **mockup sticky "not on the live site yet" removed** (mockup-only note) |
| `/work/[slug]` sources | — | 0 | **mockup aside "twelve labels, one live link" removed** (count varies per project) |
| `/work/[slug]` next band | torn · "next up" annotation | 2 | navy fill |
| `/about` hero (scene + hero-under in one section) | hand-sub annotation · scene caption annotation | 2 | stats card (taped), pull-quote note (`data-paper="index"`, `data-hand="quote"`) |
| `/about` product journey | torn · collage backdrop (Dev-41, TKT-100) · path sketch · "start here ↘" annotation | 3 → **4** at 1440 / 1 → **2** at 390 | 4 pinned torn-edge year cards (deckled edge layers are the card material); range kickers on tinted highlighter strips; head, lead and closing line on torn strips (their own paper); closing line is Fraunces lead + stamp-styled DraftTag |
| `/about` capabilities | torn | 1 | 4 notebook sheets |
| `/about` impact | torn · sticky "dated, labelled, never rounded up." | 2 | 8 pinned index cards, résumé list |
| `/about` experience | torn | 1 | story cards; **mockup reviewer aside "↑ order to confirm…" removed** (S18 fixes the lead) |
| `/about` awards · research · education | torn · patent stamp note "TP" | 2 | award tags, patent card |
| `/about` page-foot CTA | torn | 1 | colophon (Inter) |
| `/thinking` opener | h1 underline sketch · hand-sub annotation "Notes first. Essays later." · ~~photo caption annotation~~ | 3 → **actual 2** (Dev-33) | ~~taped photo~~ (scene is the opener, Dev-24) |
| `/thinking` essays | torn · sticky "start here ↓" · margin annotation "the same lesson, told twice" (rendered only ≥ 1320; removed from DOM below) · h2 underline sketch | 4 | ruled sheet; count line is Inter data |
| `/thinking/[slug]` essay | ~~pinned-photo caption annotation~~ · sticky aside (one generic line reused across essays) | 2 → **actual 1** (Dev-33) | ~~pinned photo~~; `.prose` is `data-flat`; pull quotes `data-hand="quote"` |
| `/playground` opener | h1 underline sketch · "go poke at it" annotation (with arrow) · scene caption annotation | 3 | scene bleed |
| `/playground` bench | torn · "no status badges here — they're all just live" annotation · tools sketch | 3 | 4 experiment cards (taped/pinned); **mockup's Caveat notebook sheet removed** (Dev-07) |
| `/contact` opener | sticky "No form here…" · photo caption annotation (now the banner caption) · "whichever is easiest for you ↓" annotation | 3 | ~~taped portrait~~ (Dev-37) |
| `/contact` details | torn · hand-line annotation · arrow sketch | 3 | postcard (`data-paper="postcard"`, stamp is postcard chrome, labels `data-hand="label"`) |
| 404 | tools sketch (reused from playground) | 1 | — |
| Thinking / Playground "quiet close" (mockup) | **dropped** (Dev-08, pending Tushar) | — | the band is the closing CTA (S16) |

### 3.4 Caveat exemptions (`data-hand`) — the S13 list, made deterministic
| `data-hand` | Where | Limit the test enforces | Examples |
|---|---|---|---|
| `quote` | a `blockquote`, `p` or `q` that quotes a **sourced** string from `data/*.ts` (artifact `insight`, stage example quote, essay passage, the band tagline `hero.tagline`, the About pull-quote) | ≤ 240 characters **and** a `cite` / `Source:` sibling within the same `data-paper` or blockquote | “Capability, not dependency.” — TeachSpark Solution-Space PRD |
| `cta` | a link/button label | ≤ 6 words | "View my work →", "Ask →", "Read the case study →", "← Thinking", "Let's connect →" |
| `label` | a `span`, `b`, `dt` or numeral inside a `data-paper` object | ≤ 3 words, no digits other than a 2-digit numeral | "Chosen", "We'll know when", "Method", "01", postcard "email" |
| `annotation` | never used as an exemption — annotations are `data-decor` + `aria-hidden` | — | — |

Everything else in Caveat is a violation. Explicitly **not** Caveat (mockup instances normalised, Dev-04): metric kind badges ("Measured", "Self-reported" → Inter 11–12 px uppercase, About-mockup style), hypothesis believe/knowWhen text (→ Inter on the note card), timeline dates, résumé metric labels, "not recorded", "DOI pending", "Languages: …", the essays count line, the Ask input value (Inter 18 px), `draft` tags (→ the site `DraftTag`), and any h1–h3.

---

## 4. Global chrome

### 4.1 Header (`Header`, `MobileMenu`, `SkipLink`)
Sticky, `top: env(safe-area-inset-top)`, `--header-bg` + 10 px blur, 1 px `--line` bottom border appears after 8 px scroll (`data-scrolled`). **No rest→compact height change** (D12 — the mockup header is one height; `useScrollY` hysteresis logic is deleted with the motion system). Grid `auto 1fr auto`, gap 24, padding-block 14 → ~72 px tall.
- **Brand** (link → `/`, `aria-label="Tushar Pathak — home"`): the 40×40 hand-drawn "TP" monogram SVG (`aria-hidden`), then a two-line wordmark: `Tushar Pathak` Inter 600 13 px uppercase tracked .12em over the Caveat 17 px subline "Build · Learn · Solve · Grow" (`data-decor="annotation"`, `aria-hidden`; the header's one decoration). The subline hides < 640 (removed from DOM).
- **Nav** (`aria-label="Primary"`, ≥ 1024): Fraunces 18 px, gap `clamp(18px, 3vw, 36px)`, ≥ 44 px hit areas; `aria-current="page"` and hover draw the navy ink-stroke SVG underline (hover at 45 % opacity). Items = `lib/nav.ts`; **the mockups add `Playground` as a fifth item — D8 proposes accepting that** because the band footer drops the old footer nav, which was Playground's only path (E-9). Until Tushar rules, Stage 5 tickets carry both variants and the crawler test (EVAL-011) decides what must be reachable.
- **Pill** "Let's connect →" (navy fill, ivory Caveat 20 px `data-hand="cta"`, ≥ 44 px tall) → `/contact`; hidden < 1024 (the mobile sheet carries the contact row instead).
- **Menu button** (< 1024): 42→44 px round ivory button with the hand-drawn three-line glyph, `aria-expanded`/`aria-controls`; opens `MobileMenu` (native `<dialog aria-label="Site navigation">`, full-width paper sheet under the header with `--shadow-paper`, nav rows 56 px Fraunces 18 px, then a hairline and two rows: "Let's connect →" pill and the résumé control; `Esc`/backdrop close; focus returns to the button). The global `AskPanel` trigger (S21) stays as a 44 px icon-only ghost button after the nav on desktop and as a row in the sheet — unless Tushar drops the panel.
- **Reading progress** (`/work/[slug]` only): 3 px rust bar at the header's bottom edge, `transform: scaleX(progress)`, `aria-hidden`.
- **Skip link**: unchanged, targets `#main`.

### 4.2 Band footer (`BandFooter`, every route — S16)
```
<footer class="band" aria-labelledby="band-h">
  <svg data-decor="torn" class="band-torn" aria-hidden="true">…terracotta path…</svg>
  <div class="band-body">            <!-- terracotta + --band-hatch -->
    <p class="eyebrow">Let's connect</p>
    <h2 id="band-h">Let's <em>build</em><br><span class="dim">something people can use.</span></h2>
    <p class="hire">Hiring for PM, AI PM or AI-builder roles? Say hi. <DraftTag/></p>
    <div class="row">
      <div><span class="label">Email</span><a class="email" href="/contact">Tushar_Pathak@outlook.com</a></div>
      <div><span class="label">Social</span><ul class="social">LinkedIn · GitHub (only while a public repo link exists, S5) · Résumé (resumeAction())</ul></div>
    </div>
    <div class="bar">© 2026 Tushar Pathak. Built with curiosity, chai &amp; Claude Code. · <span data-hand="quote">Observing what others overlook.</span> · Bengaluru, India</div>
  </div>
</footer>
```
Type: h2 Fraunces `clamp(40px, 5vw, 72px)` `opsz 144`, `em` italic in `note` (`SOFT 60`), `.dim` in **kraft** (contrast fix, §2.1); hiring line Inter 18 px `--on-band-muted` with the site `DraftTag` until signed off; email `clamp(18px, 2vw, 22px)` ivory with a 1.5 px underline that turns `note` on hover; social circles 56 px ivory with terracotta glyphs (`aria-label`s "LinkedIn", "GitHub", `resumeAction().label`), hover −2 px; © bar 12 px tracked .08em `--on-band-muted`, `hero.tagline` in Caveat 17 px `note` (`data-hand="quote"`, S18 renders the tagline here), "Bengaluru, India" (already public; confirm with Tushar before Phase 0 — HANDOFF §6). Padding-bottom adds `env(safe-area-inset-bottom)`. Margin-top `clamp(48px, 6vw, 88px)` so the torn edge tears from the last section's fill. Landmark: `<footer>`; no second footer.

### 4.3 404 (`app/not-found.tsx`)
One `<section>` on `paper`: eyebrow "Lost?" (annotation-free), h1 "This page wandered off." Fraunces `clamp(42px, 5.2vw, 76px)`, lead (data) Inter 17 px, CTA row: primary "Back home" → `/`, secondary "See the work" → `/work`, secondary "Get in touch" → `/contact`; the pencil-and-tape `tools` sketch from the playground mockup at the right (`data-decor="sketch"`, the section's only decoration). No new illustration (§12.4). Band footer follows.

---

## 5. Hero contract (`/`, S14 — EVAL-019, EVAL-010, EVAL-001)

### 5.1 Layout
`<section class="hero" aria-labelledby="hero-h">` grid `minmax(0,42fr) minmax(0,58fr)` ≥ 1024 (copy left, scene right), gap `clamp(20px, 3vw, 44px)`, padding-block `clamp(28px, 4vw, 56px)` / `clamp(80px, 9vw, 130px)`; single column < 1024 with the copy first and the scene second (5-second test needs the copy above the fold at 390; the scene follows at full width, 1280/684 ratio, caption static below). Copy column (max 560 px, gap 22): eyebrow (**data**: `Senior Product Manager · Product Thinker · AI Builder · Problem Solver` — the mockup's shorter triad is not used, Dev-01), h1 (**data**: "I turn ambiguity into AI-native products people can use." with the rust underline draw-in on the last three words — Dev-01), hand-sub annotation "Same curiosity.<br>Bigger problems." (`clamp(26px, 2.6vw, 34px)`, −1.5°, `aria-hidden`), support paragraph (**data** `hero.support`, Inter 17 px, ≤ 46ch, hidden < 768 as today), CTA row: primary "View my work →" → `/work`, secondary "Ask my portfolio" (magnifier glyph) → `#ask`. The `FloatingTiles` proof tiles are gone; the three VERIFIED proof lines live in Featured Work's metrics (§7.1).

### 5.2 Markup per mode (the EVAL-019 matrix)
Static HTML (every mode) — rendered by the server, never lazy:
```html
<figure class="hero-scene" data-illustration="hero-desk">
  <div class="frame">                                  <!-- aspect-ratio 1280 / 684; cream mask on the left + bottom edge -->
    <img src="/media/illustrations/hero-poster.webp"   <!-- next/image priority → fetchpriority="high", loading="eager", srcset/sizes -->
         width="1280" height="684" fetchpriority="high" decoding="async"
         sizes="(min-width: 1024px) 58vw, 100vw"
         alt="Illustration of Tushar at a warm desk — laptop, notebook, books, a plant, a lamp, and pinned notes reading Problem → Insight → Bet → Build → Evaluate → Impact.">
    <!-- DEFAULT MODE ONLY, mounted on the client after hydration (§5.3): -->
    <video autoplay muted playsinline preload="metadata"
           poster="/media/illustrations/hero-poster.webp"
           aria-hidden="true" tabindex="-1" data-hero-clip>
      <source src="/media/illustrations/hero-animation.webm" type="video/webm">
      <source src="/media/illustrations/hero-animation.mp4" type="video/mp4">
    </video>
  </div>
  <figcaption data-decor="annotation" aria-hidden="true">the desk where most of it happens</figcaption>
</figure>
```
- **No `loop`, ever.** No `controls`, no audio track. The video overlays the `<img>` (absolute, same box, same mask); its `poster` is the same file as the `<img>`, so mounting causes no visible change until frame 1 decodes.
- **Poster is the LCP element** in every mode (`priority` on the `next/image`; the `<video>` never paints before the poster). The `hero-end.webp` last frame is *not* shipped as an image — the paused video holds its own last frame.
- **Asset caps** (measured 2026-09-24): webm 176 kB ≤ 200 · mp4 312 kB ≤ 350 · poster 87 kB ≤ 120. `tests/e2e/eval-019.spec.ts` asserts the file sizes from `public/media/illustrations/`.

### 5.3 Mode detection and lifecycle (client, `HeroClip` component — D10)
1. On mount (once): `posterOnly = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none), (pointer: coarse)').matches || navigator.connection?.saveData === true`. If `posterOnly` → render nothing (the static `<img>` stays; **no `<video>` enters the DOM** — satisfies reduced-motion, touch and Save-Data at both widths).
2. Else render the `<video>`; call `play()` defensively — a rejected promise (autoplay policy) or an `error` event **unmounts the video** so the poster shows (the "error" screen state).
3. `ended` → do nothing (the element stays paused on its last frame). Never call `load()`, `play()` again or set `currentTime`; ignore `visibilitychange`, scroll, and re-renders (`currentTime` must never decrease — EVAL-019 "0 restarts"). Ended within ≤ 4 s of arrival: hydration + a 2.5 s clip.
4. Media queries are read once; a later change to reduced-motion mid-session does not restart or remove anything (the clip is over in 2.5 s).
5. `<video>` is `aria-hidden`; the `<img>` alt carries the description. WCAG 2.2.2 needs no pause control: 2.5 s, no loop.

### 5.4 States
| State | What shows |
|---|---|
| loading (first paint, all modes) | poster `<img>` (LCP), copy, CTAs — pure SSR HTML, works without JS |
| working (default mode) | clip plays once over the poster, holds its last frame |
| poster-only (reduced motion / touch / Save-Data / JS off) | poster only; identical layout |
| error (autoplay rejected, decode/network error) | video unmounted → poster |

---

## 6. Illustrations — manifest, provenance, alt text (S20 — EVAL-021, EVAL-013)

### 6.1 One source of truth: `content/media/illustrations/manifest.ts`
```ts
export type IllustrationKind = "scene" | "poster" | "clip" | "reference";
export interface Illustration {
  id: "hero-desk" | "hero-clip" | "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "character-sheet-b";
  kind: IllustrationKind;
  file: string;          // relative to content/media/illustrations/ (source rendition)
  publicSrc?: string;    // served path under public/media/illustrations/ (clip + poster only; scenes go through next/image)
  width: number; height: number;
  alt: string;           // MUST start with "Illustration of" (scenes/poster) or "Animated illustration of" (clip); ≥ 8 chars (schema)
  usedOn: string[];      // routes
}
```
Rules the Vitest (`tests/unit/eval-021.test.ts`) enforces: every file under `content/media/illustrations/**` (excluding `README.md`) has exactly one manifest entry and vice versa; every entry's `id` has a row in `README.md`; every `alt` starts with "Illustration of" / "Animated illustration of"; every filename and alt passes `scripts/forbidden-strings.ts` (no PII, no forbidden claims). Components never write an alt inline — they render `illustration(id).alt`. `site.avatarAlt` and `public/avatar/*` are deleted (EVAL-013 wording).

### 6.2 `content/media/illustrations/README.md` provenance columns
`id | file | kind | model | reference media ids | prompt summary | generated (YYYY-MM-DD) | credits spent | used on`. Rows: the six scenes and the hero scene (`gpt_image_2_5`, refs `df5cca50-08c2-4588-9c0a-33f5fbd1a859` hero crop + `f49a95f5-6069-4131-85b7-c0283d000ee1` full reference page, 2026-09-23, 1 credit each), the clip (`Seedance 2.5`, single `generate_video`, 16:9 source, clip A trimmed to 2.5 s, 2026-09-24), the character sheet (`gpt_image_2_5`, 2026-09-23). The Stage-8 manual checklist (`evals/results/eval-021-<sha>.md`) confirms per asset: depicts no metric, logo, product UI or claim.

### 6.3 Exact alt strings (fixed here; EVAL-013 / EVAL-021)
| id | alt |
|---|---|
| `hero-desk` (poster) | Illustration of Tushar at a warm desk — laptop, notebook, books, a plant, a lamp, and pinned notes reading Problem → Insight → Bet → Build → Evaluate → Impact. |
| `hero-clip` | Animated illustration of Tushar thinking at his desk and turning a pen — plays once. (`aria-hidden`; recorded for the manifest only) |
| `scene-work` | Illustration of Tushar pinning a product sketch to a corkboard already covered in wireframes, flow diagrams, sticky notes and small landscape photos — a plant and a green mug on the shelf below. |
| `scene-casestudy` | Illustration of Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug beside him, a mug and a stack of books on the side table. |
| `scene-about` | Illustration of Tushar from behind on a hillside path at dawn, coffee in one hand and a notebook under his arm, looking out over pine forest towards a snow-capped mountain horizon. |
| `scene-thinking` | Illustration of Tushar writing in an open notebook at a wooden desk by a window — a green lamp, a cup of tea, stacked books, a plant, and a sketched flow diagram on loose paper. |
| `scene-playground` | Illustration of Tushar at a tinkering workbench, holding up a small cardboard prototype with wires; a breadboard, tape, scissors, paper planes and a tablet sketch sit on the desk under a green lamp. |
| `scene-contact` | Illustration of Tushar standing by a window next to a tall leafy plant, a terracotta coffee mug in one hand, the other raised in a friendly wave. |
| `character-sheet-b` | Illustration reference sheet of the Tushar character — front, three-quarter and profile views. (never rendered) |

### 6.4 Placement forms (one per page; §3.3 counts them as content paper, not decoration)
- **Taped photograph** (`data-paper="photo"`, ivory frame 12–14 px padding, 2 fasteners, ±1.6–2.4°, Caveat caption annotation below/inside): case study, thinking, contact, essay (pinned, 5:4 crop).
- **Scene bleed** (`<figure data-illustration>` absolutely positioned behind the copy, `object-fit: cover`, cream `mask-image` gradients on the copy side and bottom): work (desktop), about, playground. **One `<img>` element** restyled per breakpoint — not the mockup's desktop `alt=""` background plus a second mobile `<img>` (Dev-06) — so the description is announced once and the file downloads once. Below 1024 the bleed becomes a 4:3 masked photograph under the copy.
- **Hero frame** (§5): masked poster + clip.
- Every `next/image` scene: `sizes` per placement, AVIF/WebP, `loading="lazy"` except the hero poster; intrinsic `width`/`height` always set (no CLS). Image load failure → the frame keeps its ivory paper and shows the alt as visible caption text (schema rule "placeholders render the alt as visible caption text, never a broken img").

---

## 7. Per-page layouts (breakpoints 390 / 768 / 1024 / 1440; each data-backed view lists its four states)

Copy for every element below comes from `data/*.ts` exactly as `content-brief.md` records it; `[data]` marks where the mockup differs and the data wins (details in §11).

### 7.1 `/` Home — hero → Featured work → How I think → Ask → band
- **Featured work** (`section#work-featured`, `paper-2`, torn top): head grid `1fr auto` (h2 "Real problems.<br>Real products." + lead; right: the quote-card annotation “The feature is a citation. The product is trust.” — RailCite, with dashed arrow). Grid `1.35fr 1fr` × 2 rows, gap 28: **TeachSpark** large card (row-span 2, −0.6°, padding 36, tape left) = kicker `AI · WhatsApp · EdTech · Live pilot` (green-2/rust), h3 `clamp(34px,3.4vw,52px)`, tagline, the flow **sketch** (`data-decor="sketch"`, boxes "teacher on WhatsApp → question paper ↳ QC pass → back in minutes"), metrics row (17 teachers joined, week 1 [hero metric rust] · 8 (47%) activated · 37.5 min median time saved — VERIFIED with `asOf` caption), link "Read the case study →" (Caveat cta), sticky "Capability, not dependency." (bottom-left, −5°); **RailCite** card (+0.7°, tape centre): kicker `AI · RAG · GovTech · Live`, h3, tagline `[data]`, metrics 5,760 documents indexed · 0 invented citations (forest), link; **Nuptis → Velora** card (tape right): kicker `B2B · Marketplace · PM craft · Live (mock data)` `[data]`, h3 "Nuptis → Velora" `[data]`, tagline, metrics only if VERIFIED metrics exist in data (the mockup's "10/10 unit tests" is not in data and is dropped), link. Whole card is the link (`aria-label` = name). ≤ 1024: 2 columns, large spans both; ≤ 640: single column. Card hover: −3 px lift + `--shadow-paper-hover`, rotation preserved.
- **How I think** (`section#how-i-think`, `paper`, torn): head `1fr 1fr` (eyebrow + h2 "A product journey, not a process." `[data]`; lead right-aligned); `journey` = 6 pinned stage cards (`data-paper="card"`, alternating −0.8°/+0.6°, odd cards offset 28 px) over the dashed path **sketch** (absolute SVG, hidden ≤ 1024). Card: Caveat numeral `01` (`data-hand="label"`), h3 stage, principle (Inter 14 px, DRAFT → `DraftTag` inside the card), the VERIFIED example quote as `blockquote data-hand="quote"` + `cite`, and the link pill "See how I tested this in {project}" (Inter 13 px). Interaction: the stage cards are static (no expand) — the quote is always visible, which is what the mockup shows; roving-tabindex logic is deleted. 3-up ≤ 1024, 2-up ≤ 640, 1-up ≤ 440. **TKT-99 (Tushar direction 2026-09-26, Dev-41):** restyled to `docs/redesign-mockups/m-009/tushar-2026-09-26/how-i-think-target.png` — deckled torn-edge cards (seeded `clip-path` rim + face), a collage backdrop behind the cards (one `data-decor="collage"`; fewer scraps < 1024), terracotta italic Fraunces numeral (still `data-hand="label"`), compact two-line DraftTag, quote on a tinted torn slip with washi tape (±2°, cite plain below), pill → paper button 15 px with an arrow glyph (`aria-hidden`).
- **Ask my portfolio** (`section#ask`, `paper-2`, torn): grid `1fr 1.2fr` (≥ 900): left eyebrow "Ask", h2 "Ask my portfolio" `[data]`, lead `[data]`; right the **notebook** (`data-paper="notebook"`, ruled lines, red margin, 5 holes, +0.5°): prompt annotation, form (label sr-only "Ask about my work", Inter 18 px underline input, navy "Ask →" pill `data-hand="cta"`), chips = the 5 home prompts `[data]` (Inter 13 px pills), then `AnswerView` restyled: idle microcopy; **loading** two shimmer lines on the ruled paper + sr-only "Looking through the portfolio…"; **answer** h3 "Answer" + `DraftBadge`, text 15 px navy-2, `EvidenceLinks` as small ivory pills, "Ask another"; **empty** the FALLBACK line + 3 fresh chips; **error** ivory panel with a rust 1.5 px border, alert glyph, "Something went wrong finding that answer. Please try again." + secondary "Try again" (EVAL-014/015 unchanged). Submitting never navigates; focus → "Answer". `AskPanel` (S21): same body, restyled as a notebook sheet sliding in as a right drawer 400/480 px (≥ 768) or a 90 vh bottom sheet (< 768) with a 20 % navy scrim.

### 7.2 `/work` — opener → index → experience strip → band
- **Opener** (`section.work-hero`): scene bleed (§6.4) with the copy (max `min(460px, 40%)`) on a radial cream wash: eyebrow "Work", the oversized h1 "Work" with the underline sketch, lead `[data]` "Personal builds first. Corporate work is listed as experience, not product." Caption annotation "the pinboard — every build gets a sketch first" bottom-left. < 1024: copy, then the masked 4:3 photo.
- **Index** (`section` `aria-labelledby="work-personal-heading"`, `paper-2`, torn; sr-only h2 "Personal builds"): tabs row = `FilterTabs` restyled as **ink-underlined serif tabs** (Fraunces 20 px, rust underline on `aria-selected`, 1 px `--line` baseline; `role="tablist"`, URL-synced `?filter=` as today), right: "start here ↓" annotation with a dashed arrow (arrow hidden < 900). `EditorialGrid` becomes the **numbered index** (`<ol>` on a 12-col grid): rank 1 = flagship opener card (cols 1–7, ivory, −0.5°, tape right, giant rust numeral outside the card, kicker, h3 `clamp(34px,3.6vw,56px)`, tagline, metrics row + note, status line with the coloured status dot + `asOf` (Inter), link); rank 2 = second opener (cols 8–12, dashed left rule, sticky "trust is the product." top-right); ranks 3–11 = slim rows (`64px 1fr 240px 260px`; numeral rust Fraunces, h3 + tagline, tags, status + asOf). Numerals re-sequence on filter change (unchanged rule). Status dot colours: live forest · pilot steel · prototype rust · research kraft — always with the text. ≤ 1024 rows `56px 1fr 200px 220px`; < 900 the openers span full width and rows collapse to `48px 1fr`; ≤ 640 `40px 1fr`. **States:** working (list); **empty** = `EmptyState` rendered *instead of* the list as the pinned index card ("No projects match this filter" / body / "Show all →" `data-hand="cta"`) — rendered only when 0 rows (Dev-05); loading/error n/a (static, SSR).
- **Experience strip** (`section` `aria-label="Professional experience"`, `paper`, torn, max 1080): caption h2 "Professional experience · corporate work, not a public product." (Inter uppercase), three `<details name="job">` rows (role Fraunces 22, name, duration tabular, tags, hand-drawn chevron rotating 180° when open; body with the `↳` CSS marker), one open at a time (`name` attribute), link "See my experience →" → `/about#experience`. Filters hide rows that don't match; the strip hides when none match (Experiments).

### 7.3 `/work/[slug]` — header → metric strip → overview → deep dive → what I learned → sources → next → band
- **Header** (`section.cs-head`): grid `56fr 44fr`, copy (crumb "Work / Case study" Inter 13, h1, lead 19 px ≤ 44ch, meta: `Role:` `Duration:` bold values + `StatusBadge` as an ivory pill with steel border + icon); right the taped photo (`data-paper="photo"`, −1.6°, `scene-casestudy`) with the **"Hero media coming"** kraft tag (`data-paper="tag"`, Inter 11 px uppercase **navy** text, sub-line annotation "the illustration stands in, for now") and caption "evenings, mostly reading". When a project gains `hero.image`/`demoVideo`, the photo frame shows it instead and the tag disappears; `DemoVideo` keeps its no-video / loading / playing / error states inside the frame (error → "View live →").
- **Metric strip** (`section aria-label="Headline metrics"`, `paper-2`, torn, `torn-fill` trick: background painted from 44 px down): 3 pinned metric cards (`data-paper="index"`, alternating rotation; value Fraunces `clamp(40px,4vw,56px)`, label Inter 13 uppercase, context 14 ink-soft, foot: **kind badge Inter** + `as of …` + `Source:`). Annotation "the smaller, honest number" with a small arrow (rich projects only). Thin projects with 0–1 metrics skip the section.
- **Overview** (`section aria-labelledby="ov-h"`, `paper`, torn): left `depth` column (eyebrow "Overview", sr-only h2, annotation "if you only have thirty seconds →", `OverviewToggle` as **folder tabs** — Fraunces 17 px, `role="radiogroup"`, 30-sec / Deep dive, ivory active tab; help line), right the notebook (`data-paper="notebook"`, label "30-sec" `data-hand="label"`, `thirtySecond` paragraphs on 32 px ruled lines). Thin projects: no toggle; the "Deep dive coming" utility box becomes a kraft tag under the notebook (`data-paper="tag"`, Inter): eyebrow "Deep dive coming" + "The full case study is being written up. This project is documented as {statusLabel}."
- **Deep dive** (`section#deep aria-label="Deep dive"`): grid `200px 1fr`; sticky `ChapterNav` (Fraunces 16, Caveat numerals `data-hand="label"`, ink underline on `aria-current`) — **hidden < 1024** (the mockup drops it; the old sticky pill row is not kept — Dev-09); chapters as nested `<section class="chapter">` (h2 with Caveat numeral label; `Prose` **`data-flat`** ≤ 68ch; `artifacts` flex cluster max `68ch + 260px`, items 260–440 px, alternating ±0.6°). Artifact forms (all `data-paper`): `insight` → hand pull-quote (`blockquote data-hand="quote"`, big Fraunces “ glyph, cite + Source); `hypothesis` → note-coloured card, labels "We believe" / "We'll know when" `data-hand="label"`, **text Inter 15 px**, status pill (icon + text); `metric` → pinned ruled index card; `decision` → ivory card, h3, "Chosen" (forest check) / "Rejected" (rust, struck list) `data-hand="label"`, "Why:" line; `evaluation` → paper-2 bordered card, `dl` with Caveat `dt` labels `data-hand="label"`; `experiment` → ivory card, Setup ↓ Result ↓ Learning (Caveat step labels, last in rust); `prototype` → taped 16:9 frame (image / video / alt-as-caption placeholder); `generic` → kraft doc tag (eyebrow PRD/Deck/Ledger/Doc/Link, title link, note). `ShowTheThinking` (nested `section.thinking`): sr-only h2, secondary button "Show the thinking ↓" (`aria-expanded`), annotation "the chain, start to finish", then the 8-node chain: dashed path sketch on the left, 42 px ivory medallion with the Caveat numeral, paper-2 label tag pinned (Inter 11 px uppercase), text 15 px ≤ 60ch, source link rust. Nodes exist in the DOM collapsed; reveal 120 ms stagger; never auto-plays. < 640 chain padding 56.
- **What I learned** (`section.learned`, `paper-2`, torn — new, renders `learnings[]`, S18): grid `1fr 1.35fr`: eyebrow + h2 "What I learned" + help; notebook with a numbered list (Caveat numerals `data-hand="label"`, Inter 16 px on 32 px lines). Omitted when `learnings` is empty.
- **Sources** (`section.sources`, `paper-2`): dashed top rule, `200px 1fr`: h2 "Where every line on this page comes from" (22 px), 2-column `<ol>` of the project's unique source labels (public URL where one exists) — derived from the artifacts + metrics, no new content (Stage 5 ticket).
- **Next project** (`section.next`, navy, torn): eyebrow kraft "Next", h2 `{name} →` ivory `clamp(44px,6vw,88px)` (arrow translates 8 px on hover), annotation "next up" in kraft; whole band is the link; focus ring kraft.
- **States:** the page is static; `DemoVideo` and `PrototypeFrame` carry the media states; anchors `#01-context…` unchanged (TP8).

### 7.4 `/about` — hero → product journey → capabilities → impact → experience → awards/research/education → page-foot CTA → band
- **Hero** (`section.ahero` incl. the "hero-under" row): scene bleed `scene-about` (height `clamp(520px, 62vw, 860px)`, top/bottom mask) with the copy in the sky (absolute top-right, `min(720px, 54%)`, radial ivory wash): eyebrow "About · Senior Product Manager", h1 three lines (third line rust) + `DraftTag` (Inter, not the Caveat "draft"), hand-sub annotation "Same curiosity → bigger problems." (`aria-hidden`; the DRAFT subline leaves the a11y tree — Dev-10). Under the scene: the taped **stats card** (`data-paper="card"`, 10+ / 3 / ∞, labels Inter, the explanatory line "counted from 2016 — …" in **Inter 13 px** because it explains the number), caption annotation "coffee first. then the roadmap.", and the pull-quote on a pinned note (`data-paper="index"`, `blockquote data-hand="quote"` "I build at the intersection of people, products and intelligent systems." + `DraftTag`). < 900 the copy stacks above a 4:3 masked photo; stats 2-up ≤ 640.
- **Product journey** (`section#journey`, `paper-2`, torn): head `1fr 1fr`; 4 pinned year cards over the dashed path sketch + "start here ↘" annotation (path + start hidden < 900); card = year Fraunces `clamp(44px,4vw,60px)` (Now in rust), h3, range kicker, description. Closing line "The tools changed. The curiosity didn't." as **Fraunces lead + `DraftTag`** (data says lead size, DRAFT) — not Caveat. **TKT-100 (Tushar direction 2026-09-26, Dev-41):** restyled to `docs/redesign-mockups/m-009/tushar-2026-09-26/about-journey-target.png` — the head block, the lead and the closing line each sit on a torn paper strip; the cards are deckled torn-edge sheets (seeded `clip-path` rim + face); the range kicker sits on a tinted highlighter strip (sage · blue-grey · sage · peach; still `data-micro-label`, 12 px, ≥ 4.5:1); the DraftTag reads as an outlined stamp; one `data-decor="collage"` layer carries the scraps, sprigs, dried flowers, stamp, postmarks (generated `collage-<piece>.webp` crops, decorative) and the inline-SVG line-art doodles at the card feet (generic unbranded building · cloud + database with Caveat "Cloud. Data. GenAI." · generic building · lightbulb with "TeachSpark / RailCite / Cubicle"); < 1025 the doodles and most scraps drop out (the object stays in the DOM).
- **Capabilities** (`section#capability-clusters`, `paper`, torn): 4 notebook sheets on a 12-col grid (5/7/7/5, ±0.4–0.8°): h3 + checklist (`li` Inter 15 px on 32 px lines, hand-drawn tick in rust/forest). Full width < 900.
- **Impact** (`section#impact`, `paper-2`, torn): tier 1 = 8 pinned ruled index cards 4-up (2-up ≤ 1100, 1-up ≤ 640; value Fraunces, label, context, **kind badge Inter** + asOf, Source link); tier 2 "From my résumé" (h3, body, three `rgroup`s of inline `b` value + **Inter** label pairs, foot with Self-reported badge + asOf + Source); sticky "dated, labelled, never rounded up." at the right.
- **Experience** (`section#experience`, `paper`, torn): head with lead **fixed** "Four roles, oldest to newest — open any node for the context, scale, and what changed." (S18); vertical dashed timeline (`220px 1fr`, dot per role rust/steel/forest/rust), sticky company node (`.co` Fraunces 24, dates **Inter 14 tabular**), story card (`data-paper="card"`, h3, `dl` **`data-flat`** Context/Role/Scale/What changed/Outcomes with kind badges, "not recorded" in Inter italic ink-soft, Source). All four roles render open (the mockup shows every story; the click-to-open `StoryCard` + URL-hash behaviour is replaced by always-open cards with `id="experience-{id}"` anchors preserved — Dev-11, keeps EVAL-007's keyboard path trivially). < 900 single column with the rail at the left edge.
- **Awards · Research · Education** (`section.proof-s`, `paper-2`, torn, three `band` rows `5fr 7fr`): awards = 3 kraft-eyelet tags (`data-paper="tag"`, year Fraunces rust + title); research = patent card (`data-paper="card"`, stamp note "TP", h3, ids tabular, inventors, link "View Pratyasa — the patent record ↗") + papers list (h3, cite, DOI pill / **"DOI pending" as an Inter `Tag`**) + disclaimer; education = 2 entries on a kraft left rule + "Languages: English, Hindi, Bengali." in **Inter**.
- **Page-foot CTA** (`section#about-cta`, `paper`, torn): h2 "Let's build what's next." + primary "Let's talk" → `/contact` + secondary `resumeAction()`; colophon "Designed and built with Claude Code." (Inter 13, TP10 wording stays here).

### 7.5 `/thinking` — opener → essays → band
- **Opener**: grid `52fr 48fr`: eyebrow "Product Thinking", oversized h1 "Thinking" with underline sketch, hand-sub annotation "Notes first. Essays later."; right the taped photo (`scene-thinking`, 4:3, +1.6°, two corner tapes at −38°) with caption "where the notes get written — usually before the essay".
- **Essays** (`section aria-label="Essays"`, `paper-2`, torn): head `1fr auto` — visible h2 **"Essays"** `[data]` with the underline-hand sketch, right the **empty-state line** "Essays in progress — five drafts, none published yet." in Inter 14 px (rendered while 0 essays are published — `[data]`, replaces the mockup's Caveat count); sticky "start here ↓" top-right; margin annotation "the same lesson, told twice" (≥ 1320 only); the ruled **sheet** (`data-paper="notebook"`, max 1040) with 5 `entry` rows (`64px 1fr`): Caveat numeral label, h3 link (lead entry `clamp(32px,3.6vw,50px)`, others `clamp(24px,2.4vw,34px)`, quiet last entry), dek, meta (reading time · "Related project: {name} →" · `DraftTag` "Draft — pending sign-off"). Entries 2 and 4 indent 48 px ≥ 640. Hover: title → rust. **States:** working; empty (0 essays in data) = the sheet shows the empty-state line alone.

### 7.6 `/thinking/[slug]` — essay → band
`section.essay` with an `article` grid `minmax(0, 68ch) minmax(220px, 1fr)`: crumb "← Thinking" (Caveat cta), header (eyebrow "Essay · {nn}", h1 `clamp(40px,4.6vw,62px)`, dek, meta row with reading time · related link · **one** `DraftTag`), `.prose` **`data-flat`** (each passage as a `blockquote.pull data-hand="quote"` with a 3 px rust/forest left bar, Caveat `clamp(24px,2.2vw,30px)`, Inter cite "Source: …"; the framing paragraph Inter 17 px — the component **stops prefixing** "Draft — pending sign-off: " so the data's own prefix renders once (S18); "Related project →" Caveat cta), pager (prev "← all notes" / next essay, Fraunces titles). Margin aside (`aria-label="Pinned to the margin"`): pinned photo (`scene-thinking` 5:4 crop, −2.4°, caption annotation) + one generic sticky aside. < 900 the margin moves under the header as a row; < 640 pager stacks.

### 7.7 `/playground` — opener → bench → band
- **Opener**: `1fr auto`: eyebrow "Playground · Four live experiments", h1 "Small experiments. Big questions." with underline sketch; annotation "each one links straight to the live build — go poke at it" with arrow; below, the wide masked bench scene (`scene-playground`, height `clamp(300px, 40vw, 580px)`, left/right/bottom masks) with the ivory caption chip "the bench, most evenings".
- **Bench** (`section#experiments`, `paper-2`, torn): head = h2 eyebrow "Experiments" + annotation "no status badges here — they're all just live"; **board** 12-col (Dev-07 re-layout without the notebook sheet): 01 Pratyasa lined index card cols 1–7 (+0.6°, tape left), 02 Tegaki kraft label cols 8–12 (−2.2°, tape top, offset 26 px), 03 Dino Arcade pinned card cols 1–6 (−0.9°, forest pin), 04 Cinematic Portfolio wide taped card cols 7–12 (+1.1°, two tapes; one centre tape ≤ 640), tools sketch bottom-right. Card = Caveat numeral label, h3 `clamp(26px,2.4vw,34px)`, tagline, live URL link (Inter 14, rust underline, external icon + sr-only "(opens in new tab)", `rel="noopener"`), **no tone line** (the old clay tones are retired; the paper form is the variety). 6-col ≤ 1024, 1-col ≤ 640. Hover: −3 px lift, rotation preserved.

### 7.8 `/contact` — opener → details → band
- **Opener** (`section#contact`): grid `44fr 56fr`: left the taped portrait (`scene-contact`, 1792/2240, −2.2°, caption "waving from the window seat — the coffee's usually on") with the sticky "No form here. A plain email is the whole process." at the right edge; right: eyebrow "Contact", h1 "Still curious?", annotation "whichever is easiest for you ↓", the **actions list** (`<ul>` with dashed rules, Caveat numeral labels): 01 address + `CopyButton` (secondary; **idle** "Copy" → **copied** "Copied" forest border 2 s → **error** "Copy failed" rust border + the selectable `<output>` "Select to copy" fallback; sr-only live region), 02 primary "Email me →" mailto, 03 secondary "LinkedIn ↗" external, 04 `#resume` row: `resumeAction()` control + visible note "Sanitised resume coming — email me for a copy"; location line with the pin glyph "Bengaluru, India". < 900 the copy comes first and the portrait second (max 420 px).
- **Details** (`section`, `paper-2`, torn): left eyebrow "The details, on a card" + hand-line annotation "A more human approach to an AI-driven world." + arrow sketch; right the **postcard** (`data-paper="postcard"`, +1.5°, stamp "TP" as postcard chrome, rows email / linkedin / github / from with Caveat labels `data-hand="label"` and Inter values; the first row keeps 76 px clear of the stamp).

### 7.9 Screen-state summary (web-deliverables gate 3)
| View | loading | empty | error | working |
|---|---|---|---|---|
| Hero clip (§5) | poster (SSR) | — | poster (video unmounted) | clip once + hold |
| Ask inline / panel | ruled-paper shimmer + sr-only status | FALLBACK line + 3 chips | rust-bordered panel + "Try again" | answer + evidence |
| `/work` filtered index | SSR list (no spinner; `?filter=` read client-side, one-frame flash accepted — TP7) | pinned "No projects match this filter" card + "Show all →" | n/a (static) | numbered index |
| Case-study hero media / `PrototypeFrame` | poster + spinner overlay | "Hero media coming" kraft tag / alt-as-caption placeholder | overlay "View live →" | native video |
| Thin case study | — | "Deep dive coming" kraft tag | — | chapters |
| Essays list | SSR | "Essays in progress — five drafts, none published yet." | — | sheet with entries |
| `CopyButton` | — | — | "Copy failed" + selectable address | "Copied" 2 s |
| Illustration `<img>` | intrinsic box (no CLS) | — | alt as visible caption on the ivory frame | image |
| 404 | — | the page itself | — | — |

---

## 8. Motion & Micro-Interactions (S11: reveals + small SVG draw-ins only)

Global: `@media (prefers-reduced-motion: reduce)` sets every transition/animation below to none, draw-ins render complete (`stroke-dashoffset: 0`), and the hero is poster-only (§5). Nothing uses `ease-in`; nothing exceeds 450 ms for a UI-triggered change except the two one-time draw-ins; every reveal starts at opacity 0 / translateY 12 px, never scale 0. `motion` stays a dependency for `LazyMotion`/`m` layout animations that survive (Ask expand, filter reflow); `lib/heroMotion.ts`, `usePointerParallax`, `AvatarScene`, `HeroActivationContext`, the aurora and the header compaction are deleted (S11/S14/D12).

| Interaction | Mechanism | Curve | Duration | Reduced motion |
|---|---|---|---|---|
| Hero clip | `<video>` once, holds | — | 2.5 s | poster only |
| Headline underline draw-in (`/`, `/work`, `/thinking`, `/playground`, essays h2) | CSS `stroke-dashoffset` 400 → 0, once on load | `ease-out`, delay 0.5 s | 1.1 s | drawn (no animation) |
| Section reveal (`Reveal`, IntersectionObserver once) | CSS transition opacity + translateY(12px) | `cubic-bezier(.2,.7,.2,1)` | 500 ms, 70 ms stagger | opacity-only ≈ instant |
| Card hover (work cards, openers, experiment cards) | CSS transition `transform`, `box-shadow` | `ease` | 250 ms | none (shadow change only) |
| Button / pill hover | `translateY(-1px)` + shadow | `ease` | 180 ms | none |
| Band social hover | `translateY(-2px)` | `ease` | 180 ms | none |
| Nav / tab underline | opacity of the `::after` stroke | — | instant | — |
| Row hover arrow (`/work` rows) / title colour | opacity / colour | `ease` | 180 ms | colour only |
| Experience strip chevron | `rotate(180deg)` | `ease` | 200 ms | instant |
| Next-project arrow | `translateX(8px)` | `ease` | 200 ms | none |
| Filter change (index re-sequence) | `motion` layout | spring 260/28 | ~300 ms | opacity crossfade |
| Ask inline expand | `motion` layout (height) | spring 210/26 | ~280 ms | instant height, 150 ms opacity |
| Ask panel / mobile sheet | CSS transition | `cubic-bezier(0.32,0.72,0,1)` | 320 ms | instant; scrim 150 ms opacity |
| Show-the-thinking nodes | CSS opacity + connector `clip-path` wipe | `cubic-bezier(.2,.7,.2,1)` | 220 ms, 120 ms/node | all at once, opacity |
| Overview folder tabs swap | 200 ms crossfade + layout height | `ease-out` | 200 ms | instant |
| CopyButton icon morph | CSS | `ease-out` | 160 ms | unaffected |
| Reading progress bar | `transform: scaleX` on scroll | — | — | unaffected (position, not motion) |

Only `transform`, `opacity`, `clip-path` and `stroke-dashoffset` animate. No parallax, cursor effects, continuous motion, particles, typewriter, animated grain.

---

## 9. Link preview / Open Graph (web-deliverables gate 2 — EVAL-017 re-run for M-009)

All seven `opengraph-image.tsx` families keep their routes, sizes (1200×630 PNG ≤ 300 kB), absolute-HTTPS `og:url`/`og:image` via `buildMetadata()`, `twitter:card=summary_large_image`, `og:image:alt`, and the per-route eyebrow/title/subtitle/badge copy in `content-brief.md` (Global → OG table). Only `lib/og.tsx`'s skin changes (D11):
- **Canvas**: `paper` background; a faint 6 px torn strip in `terracotta` along the bottom edge (SVG path, Satori-safe); a `--tape`-coloured rectangle 120×30 rotated −4° at the top-left corner of the text block; footer line "Tushar Pathak" Inter 600 22 px navy-2 bottom-left; the hand caption per family in Caveat 30 px ink-soft bottom-right (home "the desk where most of it happens" · work "the pinboard" · case study "evenings, mostly reading" · about "coffee first. then the roadmap." · thinking "notes first. essays later." · playground "the bench, most evenings" · contact "waving from the window seat").
- **Text block** (left, 64 px padding, max 640 px when an image is present, 1040 px otherwise): eyebrow Inter 600 24 px uppercase tracked navy-2 with a rust `·`; title Fraunces 500 stepping 72 → 56 → 44 px by length (existing step-down logic) navy; subtitle Inter 400 28 px navy-2; badge (case studies) ivory pill, steel border, Inter 500 22 px.
- **Image** (home and case studies): the hero poster (`hero-poster.webp` → PNG via sharp, as today) 520 px wide on an ivory frame, rotated −1.5°, at the right; case studies reuse the same poster (no per-project scene — the scenes are page-family assets). Other families: text only.
- **Fonts**: static OFL TTFs in `assets/fonts/` — `Fraunces_144pt-Medium.ttf`, `Inter-Regular.ttf`, `Inter-SemiBold.ttf`, `Caveat-Regular.ttf`; Manrope TTFs deleted. Hex copies of the paper palette live only in this module (the EVAL-020 allow-list).
- **Verification**: `tests/unit/seo.test.ts` + `tests/e2e/eval-017.spec.ts` (tags, dimensions) then the manual LinkedIn Post Inspector + opengraph.xyz pass on the M-009 preview, screenshots in `docs/og/`; re-scrape after any change (`?v=N` for WhatsApp); the image must never 404 during a deploy.

---

## 10. Accessibility & QA checklist (mapped to `evaluation-plan.md`)

| Check | Spec source | EVAL gate |
|---|---|---|
| Body text ≥ 7:1 (navy/navy-2 on paper/ivory/paper-2); secondary ≥ 4.5:1 (ink-soft, green-2); band text ivory/note/kraft on terracotta ≥ 4.5:1 (headings ≥ 3:1); rust text ≥ 17 px or bold | §2.1 contrast table (two mockup pairs corrected) | EVAL-006, EVAL-009 |
| Every control ≥ 44×44 (nav, tabs, chips, social circles 56, menu button, copy button, folder tabs) | §4, §7 | EVAL-008 |
| Full keyboard path: nav, mobile `<dialog>` sheet, filter tabs, `details` strip, overview tabs, Ask (inline + panel), Show-the-thinking, CopyButton, band links | §4, §7 | EVAL-007 |
| Visible focus: 2 px rust outline, 3 px offset, 4 px radius on every interactive element; kraft outline on the navy next-band | mockup `:focus-visible` | EVAL-007 |
| Reduced motion collapses every §8 row; hero renders the poster only | §5, §8 | EVAL-010, EVAL-019 |
| axe-core 0 critical/serious at 390 & 1440 on every route incl. 404 | cross-cutting | EVAL-006 |
| Landmarks + skip link on every route; one h1; sections `aria-labelledby`/`aria-label`; the band is the only `<footer>` | §4, §7 | EVAL-006, EVAL-007 |
| Illustration alts exactly as §6.3; decorative duplicates none (one `<img>` per scene); video `aria-hidden` | §5, §6 | EVAL-013, EVAL-021 |
| Decorations: ≤ 4 `data-decor` per section, 0 in `data-flat`, Caveat only via `data-decor`/`aria-hidden`/`data-hand`, text-bearing decorations `aria-hidden` | §3 | EVAL-018 |
| Hero: no `loop`, ended ≤ 4 s, 0 restarts, poster in SSR with `fetchpriority="high"`, no `<video>` under reduced motion / touch / Save-Data, asset caps | §5 | EVAL-019, EVAL-010, EVAL-004/005 (LCP element) |
| 13 tokens, 0 literals outside `globals.css` + `lib/og.tsx`, 0 retired names (incl. `tone-*`/`bg-lavender/30` utilities) | §2.1 | EVAL-020 |
| Copy verbatim from `data/*.ts`; mockup differences reconciled in §11 | precedence rule 2 | EVAL-022, EVAL-013 |
| No horizontal scroll at 390/768/1024/1440; ≥ 16 px gutter; sticky/absolute objects clamp inside the section at 390 (`.sticky` offsets ≤ 8 px inset on mobile, as the mockups do) | §2.3, §7 | EVAL-008 |
| Colour never the sole signal: status dot + text, kind badge icon + text, tab underline + `aria-selected`, error panel border + glyph + text | §7 | EVAL-006, EVAL-009 |
| Premium rubric ≥ 10/12 with item 6 = character matches the locked sheet, no drift (EV4) | §1 | EVAL-009 |
| 5-second test at 390 & 1440 from the hero alone | §5.1 | EVAL-001 |
| Four screen states designed for every data-backed view (§7.9) and exercised at Stage 8 | §7.9 | EVAL-014, EVAL-015 |
| Link preview: 7 families, 1200×630, absolute HTTPS, paper skin, inspector pass on the preview | §9 | EVAL-017 |
| Mobile gate: nav usable (hamburger → sheet), readable without zoom (17 px body, ≥ 17 px hand), tables/wide rows collapse (`/work` rows, story `dl`, sources 1-col) | §4, §7 | EVAL-008, web-deliverables §1 |

---

## 11. Deviations (Stage-4 seed; EVAL-022 appends Stage-8 findings with Tushar's disposition)

Each row: what differs from the mockup or the earlier spec, why, and the disposition. "Stage-4 default" = applied by this file under an approved rule; "pending" = Tushar's call at the Stage-4 gate.

| # | Deviation | Reason | Disposition |
|---|---|---|---|
| Dev-01 | Home copy follows `data/*.ts`, not the mockup: h1 keeps "AI-native products"; support paragraph = `hero.support`; eyebrow = the data triad order; Featured h2 stays; How-I-think h2 = "A product journey, not a process."; Ask h2/lead/chips = data; stage principles = data wording; Velora card = "Nuptis → Velora", data tags/status, no "10/10 unit tests" or "Team build" | §12.3 verbatim rule (D7); EVAL-001 needs "AI products" in the first viewport | Stage-4 default |
| Dev-02 | Thinking essays h2 is "Essays" (visible), not "Five notes, one habit."; the count line becomes the data empty-state line | authored non-annotation copy (D7) | Stage-4 default |
| Dev-03 | Home Featured section drops the h2 spark sketch and the Velora sticky ("Killing v1 was the product decision.") | 6 → 4 decorations (S15 budget, §3.3) | Stage-4 default |
| Dev-04 | Caveat removed from data: kind badges, hypothesis text, timeline dates, résumé labels, "not recorded", "DOI pending", "Languages", essays count, Ask input, draft tags (→ `DraftTag`) | S15 b / S13 (§3.4) | Stage-4 default |
| Dev-05 | `/work` empty-state index card renders only when a filter is empty (mockup shows it always) | it is a screen state, not a decoration; keeps the index at 3 decorations | Stage-4 default |
| Dev-06 | Scene bleeds use one `<img>` (mockup: desktop `alt=""` background + second mobile `<img>`) | one download, one announcement (EVAL-006/013) | Stage-4 default |
| Dev-07 | Playground drops the Caveat notebook sheet and the "tone: butter/peach/blush/mint" lines; board re-laid as 2×2 with the tools sketch | h2/p/li in Caveat and retired clay tone hexes (EVAL-018/020); 4 → 3 decorations | Stage-4 default |
| Dev-08 | Thinking and Playground "quiet close" sections (Let's build what's next / The experiments are small on purpose) are **dropped**; the band is the closing CTA | S16 rejected two stacked closing CTAs; the mockups predate the band | **pending Tushar** (D9) |
| Dev-09 | Case-study `ChapterNav` hidden < 1024 (no sticky pill row) | mockup; anchors still work via the chain/next links | Stage-4 default |
| Dev-10 | About hero subline "Same curiosity → bigger problems." becomes an `aria-hidden` annotation (today it is in the a11y tree) | S15 d: annotations carry no unique info; h1 carries the narrative | Stage-4 default |
| Dev-11 | About experience: all four story cards render open (mockup) instead of click-to-open nodes | mockup; simpler keyboard path; anchors kept | Stage-4 default |
| Dev-12 | Playground added to the header nav (5 items) | the band footer removed the footer nav that reached Playground (E-9 re-opened by D8) | **pending Tushar** |
| Dev-13 | Band headline second line in kraft (mockup: navy @ 78 %); kraft media-tag text navy (mockup: terracotta) | contrast 2.2:1 and 4.2:1 fail | Stage-4 default |
| Dev-14 | Header does not compact; nav collapses at 1024 (mockup 900) | D12; `lg` breakpoint alignment | Stage-4 default |
| Dev-15 | Hero second CTA = "Ask my portfolio" (mockup) instead of the résumé control; résumé stays in the band and mobile sheet | mockup approved; one target away on every page | Stage-4 default |
| Dev-16 | Mockup-only notes removed: "not on the live site yet — sits in the data file", "twelve labels, one live link", "↑ order to confirm — the data runs oldest → newest" | they describe the mockup, not the site; S18 fixes the timeline lead | Stage-4 default |
| Dev-17 | Case-study essay margin note "Draft — pending sign-off:" removed; the `DraftTag` renders once in the meta row and the data prefix once in the paragraph | S18 double-prefix fix | Stage-4 default |
| Dev-19 | Focus ring ships as 2 px rust / 3 px offset **without** the §10 `border-radius: 4px` (Dev-18 is reserved for the Fraunces-axes fallback) | an outline follows the element's own radius; forcing 4 px on `:focus-visible` would square the legacy clay pills on focus. Revisit once TKT-89 removes the pills (TKT-90 a11y pass) | Stage-7 default (TSK-30, orchestrator-accepted) |
| Dev-20 | Band tagline attribution reads "Source: Tushar Pathak" (sr-only), not `Source: {hero.tagline.source}` (technical-plan F2) | `hero.tagline.source` is an internal provenance string (`PORT "Tagline: …"`) that repeats the quote and exposes internal notation to screen readers; the tagline is Tushar's own line, so the author is the source | Stage-7 default (TKT-72 review, orchestrator) — **confirm at the hero gate** |
| Dev-21 | `/` hero becomes a **full-bleed banner** (hero-gate change request, EXE-15): 21:9 outpainted desk scene under the header → torn paper bottom edge → centred copy block (eyebrow, Fraunces h1 + rust underline, Caveat hand line "Same curiosity. Bigger problems.", support, CTAs) → 2–3 taped polaroids of existing scenes over the banner's bottom-left (covering the outpaint's garbled corkboard) + a postmark stamp top-right; the clip plays once through a registered feathered mask over the character. Supersedes §5.1's two-column grid; §5.2–5.4 modes/lifecycle unchanged | Tushar's reference at the gate (style only); h1 stays Fraunces (S13/S15) | **Tushar, 2026-09-25** (EXE-15) |
| Dev-22 | Lenis smooth scroll site-wide for fine pointers; native under reduced motion and on touch; no scroll-linked animation | Tushar request (EXE-16); amends §8 for smoothing only | **Tushar, 2026-09-25** (EXE-16) |
| Dev-23 | New manifest entry `hero-banner` (outpaint of `hero-desk`, 3168×1344) with alt "Illustration of Tushar at a warm desk — laptop, notebook, plants, a lamp, a sleeping golden retriever, blank pinned notes, and books titled Product Thinking, AI & Society, System Thinking and A Better Tomorrow." (revised TKT-105, 2026-09-26: the banner's painted text was removed, only the book titles remain); polaroid crops are decorative (`alt=""`, `aria-hidden`) because each scene is described on its own page | §6.3 alts must match what is shown; polaroids repeat pictures, not information | Stage-7 default (orchestrator) — confirm at the gate |
| Dev-24 | Every page opens with its scene as a full-bleed banner + torn edge (home-banner style), superseding §6.4's per-page placement forms (photo frame on case studies, bleed masks on work/about) | Tushar, EXE-18 — scenes visible now, one consistent opener | **Tushar, 2026-09-25** (EXE-18) |
| Dev-25 | Home Featured metrics are picked **by label per §7.1** (TeachSpark 17 · 8 (47%) · 37.5 min; RailCite 5,760 · 0; Velora "2 products in nine days"), not filtered to `kind === "measured"` (plan S75.01); each non-measured row names its kind ("· self-reported" / "· structural") and a caption gives `as of …` | the plan filter contradicted §7.1 and Dev-01 on every card; Design is the record; the kind label keeps the honesty rule (TKT-75) | Stage-7 default (delegated, EXE-20) |
| Dev-26 | Case-study header: no taped `scene-casestudy` photo or its caption "evenings, mostly reading"; the "Hero media coming" kraft tag sits in the meta row; the 56/44 photo frame renders only when a project has `hero.image` / `links.demoVideo` (none today). Header unit counts **1**, not 2 (§3.3) | the `SceneOpener` (Dev-24) already shows the scene — a second copy repeats it (TKT-81) | Stage-7 default (delegated, EXE-20) |
| Dev-27 | Type floors beat mockup sizes: tags / kind badges / eyebrows / kickers are 12 px `data-micro-label` (design 11 px); content lines the design set at 12–13.5 px render at **14 px** — case-study labels (TKT-81), Sources list (TKT-82), `/about` stat labels, "counted from…" line, card context and asOf (TKT-86), `/playground` eyebrows (TSK-45), and the shared `.hand-cite` (integration) | EVAL-008 / EXE-7: content floor 14 px, micro floor 12 px | Stage-7 default (delegated, EXE-20) |
| Dev-28 | Insight quotes over the §3.4 240-char `data-hand="quote"` cap (three sourced quotes: 263 / 325 / 380 chars) render verbatim in Fraunces (`.artifact-quote-long`) without `data-hand` | D7 forbids trimming data; keeps EVAL-018 rule 5 and `Hand`'s guard intact (TKT-83) | Stage-7 default (delegated, EXE-20) |
| Dev-29 | Artifact contrast corrections: evaluation `dt` labels forest (mockup steel, 3.59:1 on paper-2); structural kind badge navy-2 (steel/ivory 4.13:1); text on the kraft doc tag navy (terracotta/kraft 4.16:1); thinking-node source link stays rust (4.71:1 at rest); `/about` structural badge text navy-2 with a steel dot (TKT-86); Sources link terracotta (rust/paper-2 4.3:1, TKT-82); `/work` row numerals 24 px so rust on paper-2 is large text (TKT-80) | §2.1 "fix the colour, not the number" (AA) | Stage-7 default (delegated, EXE-20) |
| Dev-30 | Show-the-thinking medallion numerals 1–8 are plain `aria-hidden` Caveat, not `Hand label`; chapter-nav / chapter numerals stay `Hand label` "01"…"08" | a 1-digit numeral fails the §3.4 2-digit rule; the `ol` already numbers the nodes for AT (TKT-83) | Stage-7 default (delegated, EXE-20) |
| Dev-31 | Chapter-nav rows are 44 px tall (mockup 24 px + 9 px gap) | EVAL-008 target floor beats mockup density (TKT-83) | Stage-7 default (delegated, EXE-20) |
| Dev-32 | The thinking-node label-tag pin is a CSS pseudo-element, not a `Pin` fastener; not counted either way | a `Pin` must be a direct `Sheet` child; making each label a `Sheet tag` fights the tag typography (TKT-83) | Stage-7 default (delegated, EXE-20) |
| Dev-33 | `/thinking` opener has no taped photo + caption (unit **2**, planned 3); essay margin has no pinned photo + caption (unit **1**, planned 2) and is a plain `div`, not an `aside` landmark | the `SceneOpener` (Dev-24) already shows `scene-thinking`; an empty landmark is noise for screen readers (TKT-84) | Stage-7 default (delegated, EXE-20) |
| Dev-34 | `/about` hero (TKT-86 AC5): `section.ahero` has no scene `<img>` and no 4:3 photo below 900 — the page's one manifest-alt image is the opener; hero top padding tightened to `clamp(24px,3vw,44px)`; journey id `#product-journey` → `#journey` | Dev-24 opener; §7.4 id (TKT-86) | Stage-7 default (delegated, EXE-20) |
| Dev-35 | `/about` patent stamp reads "TP" (mockup "Patent IN 429867"); award years terracotta, not rust | §7.4 / plan S87.02; rust on kraft ≈ 2.9:1 fails even as large text, terracotta ≈ 4.2:1 (TKT-87) | Stage-7 default (delegated, EXE-20) |
| Dev-36 | `/playground`: card tilts held to the §3.1 ±0.9° cap (mockup Tegaki −2.2°, Cinematic +1.1°); Tegaki numeral navy-2 (terracotta/kraft 4.15:1); poke arrow points right; no wide masked scene (opener shows it; caption chip kept, opener count 3); wide card keeps one centre tape ≤ 640 | normative §3.1 cap; AA; `sketch-paths.ts` records the mockup arrow; Dev-24 (TSK-45) | Stage-7 default (delegated, EXE-20) |
| Dev-37 | `/contact`: no taped portrait — its caption annotation stays as the banner caption (opener count 3); the GitHub postcard row is kept under the band's S5 rule (`showGithub()`); "Bengaluru, India" renders only when `site.showLocation` (default off); action numerals are `aria-hidden` Caveat spans | Dev-24; S5 conditional adds no new exposure (not PII); EXE-20 location default; EVAL-018 requires `Hand label` inside `[data-paper]` (TSK-46) | Stage-7 default (delegated, EXE-20) |
| Dev-38 | Home: no `Reveal` on the Featured / Ask / band sections below the hero (§8 plans opacity + 12 px); "How I think" keeps its own card reveal, so the home still has one scroll reveal | TKT-79 measured it: wrapping those sections either dropped every link below the hero out of the Tab order or failed EVAL-006 axe on `/` (303 contrast nodes at 390, 1738 at 1440, opacity-0 content); accessibility (EVAL-006, keyboard order) outranks the §8 motion row, which stays specified for when `Reveal` keeps content in the a11y tree (TKT-90d A11Y-1) | Stage-7 default (delegated, EXE-20) |
| Dev-39 | Home hero shows the whole scene at ≥ 768 and the page paper scrolls over scene banners (parallax); first-viewport 5-second rule kept only < 768 — Tushar direction 2026-09-26 (TKT-96) | Tushar: the home banner was cropped shorter than `/work`'s and cut off the desk and the sleeping dog. ≥ 768 the banner box is width ÷ (3168/1344), no cap (replaces the TKT-92r2 viewport-height cap and EVAL-001's ≥ 768 first-viewport fit — h1 + CTAs are now ≤ one scroll away); < 768 keeps the 4:3 art-directed crop (the whole 21:9 scene at 390 would be ≈ 165 px tall). Parallax: the image layer (banner, polaroids, postmark; openers' banner) moves at half scroll speed over the first viewport via CSS scroll-driven animation (no JS), the paper (home: torn-edge sheet over the banner; openers: clipped at their torn edge) slides over it; reduced motion = no animation, plain scroll (no sticky layer either) | Tushar (2026-09-26) |
| Dev-40 | Page scene openers (`/work`, `/work/[slug]`, `/thinking`, `/thinking/[slug]`, `/about`, `/playground`, `/contact`) show the whole scene at full width at every width — box height = width ÷ scene ratio, no crop, no letterbox (was a `clamp(220px, 32vw, 460px)` / 66 vw crop); the 3:2 / 4:3 scenes are ≈ 800–1075 px tall at 1440, so page copy starts below the fold and the TKT-96 parallax slides the paper over them | Tushar 2026-09-26: "in all the tabs, I want the full image, dont crop it out or zoom out" (TKT-103) | Tushar (2026-09-26) |
| Dev-41 | Home "How I think" restyled as a torn-paper collage — Tushar direction 2026-09-26 (TKT-99) | Tushar: "change the UI to this image" (`docs/redesign-mockups/m-009/tushar-2026-09-26/how-i-think-target.png`). The reference carries far more ornaments (≈ 11 scraps, 4 sprigs, stamp, postmark) than §3.2's ≤ 4 budget allows if each counted. Resolution: a new `data-decor="collage"` kind (§3.1 row, §3.2 rule 2) counted **once** for the whole backdrop — one `aria-hidden`, pointer-events-none, text-free object; section count 2 → 3 at 1440 and 1 → 2 at 390 (budget ≤ 4 unchanged, parked list stays `[]`). Per-card: deckled edges are the card's own material (aria-hidden layers, not decorations); each quote slip's washi-tape strip is CSS on the blockquote (not a `Tape` fastener — the slip is not a `data-paper` host, so the cite can stay plain below it as the target shows). Numeral moves from Caveat to Fraunces italic terracotta (still `data-hand="label"`). No raster crops, no new motion, tokens only | Tushar (2026-09-26) |
| Dev-42 | `/about` product journey restyled as a torn-paper collage — Tushar direction 2026-09-26 (TKT-100) | Tushar: "change this image to this image" (`docs/redesign-mockups/m-009/tushar-2026-09-26/about-journey-target.png`). The reference carries far more ornaments (≈ 15 scraps, sprigs, dried flowers, a stamp, postmark lines, four foot-of-card doodles with handwritten notes) than §3.2's ≤ 4 budget allows if each counted. Resolution: the `collage` decoration kind (Dev-40, TKT-99) is extended from the home How-I-think to this section — ONE `aria-hidden`, pointer-events-none `data-decor="collage"` object holding every ornament, **including the line-art doodles and their Caveat notes** (drawn over the card feet from inside that layer, not inside the cards); section count 3 → 4 at 1440 and 1 → 2 at 390 (budget ≤ 4 unchanged, parked list stays `[]`). The torn strips behind the head / lead / closing line and the highlighter strips on the range kickers are CSS on those content boxes (their own paper, not decorations). The reference's company-named building sketches ("Godrej", "AMERICAN EXPRESS") are **not** reproduced — EVAL-021 forbids logos / brand marks in illustrations; cards 1 and 3 carry a generic, unbranded office building instead. Card tilt stays inside the Sheet's ±0.9° cap (the reference tilts further). The paper scraps, botanicals, stamp and postmarks are the shared generated collage pieces (`public/media/illustrations/collage-<piece>.webp`, cropped from the two Higgsfield sprite sheets Tushar approved 2026-09-26 — provenance in `content/media/illustrations/README.md`; decorative `alt=""`, lazy, no manifest entry); thin grid / ledger / tape strips and the doodles stay CSS / inline SVG. No new motion; CSS colours tokens only | Tushar (2026-09-26) |
| Dev-43 | Band footer compacted: smaller h2 (`clamp(30px, 3.4vw, 48px)`), tighter rhythm, 48 px social circles, and ≥ 1024 two columns (headline + hiring line left, Email + Social bottom-right) — same markup/content; roughly half the previous height | Tushar 2026-09-26: "compress and compact it and make the height shorter" (TKT-109) | Tushar (2026-09-26) |
| Dev-47 | AskPanel restyled to Tushar's 2026-09-26 reference (`docs/redesign-mockups/m-009/tushar-2026-09-26/ask-ai-target.png`): torn-edge notebook sheet (top/bottom tear, holes, paperclip), "Ask AI" Caveat lettering with a note-yellow highlighter + sparkles, "Meet Tushky" with a steel underline, the honesty line as a pink torn note with a curly arrow, a greeting card, a green "Suggested questions" tape + bulb, the six panel prompts as tinted question cards (round icon + →, 2 columns when the drawer body is ≥ 380 px, else 1), a rounded input field with a sparkle and a torn navy "Ask →", mountain / leaf doodles and a Caveat footer — Tushar direction 2026-09-26 (TKT-104) | Tushar asked for this panel UI. Behaviour is unchanged (retrieval-only answers, the five states, focus trap, Esc/close, drawer vs bottom sheet S21, prompt text + submit). The panel is a `<dialog>` outside every `section`/`header`/`footer`, so the EVAL-018 unit budget does not count it; its doodles are `aria-hidden` SVG and its Caveat notes `aria-hidden`. The honesty line stays Inter 14 px (it is content, §3.4 / Dev-04), not handwriting as drawn. Tints are `color-mix()` on the paper tokens (EVAL-020). The home inline notebook keeps its chips (shared `AnswerView` / `SuggestedPrompts`, card variant is panel-only) | Tushar direction 2026-09-26 (TKT-104) |
| Dev-48 | New manifest entry `tushky` (kind `mascot`, public-only `/media/illustrations/tushky.webp`, 256×256) with alt "Tushky, the golden retriever portfolio assistant"; shown in the Ask panel idle intro only. Tushky is the hero banner's golden retriever (awake, waving), not the reference's robot | Tushar 2026-09-26: "make the Tushky avatar the dog that is there in hero section image. Golden Retriever." Generated with Tushar's approved spend (Higgsfield `gpt_image_2_5`, job `6932218c-ea37-4685-bfbb-ce4b34065a76`, 0.5 cr; reference = a crop of `hero-banner.webp`); lazy panel chunk only, so `/` first-load is unchanged (EVAL-005); provenance row in `content/media/illustrations/README.md` (EVAL-021) | Tushar direction 2026-09-26 (TKT-104) |
| Dev-49 | Ask panel quick-action chips under the input: "Browse my projects" links to `/projects` (TKT-101's route) and closes the panel; "Summarize my skills" submits that question (the local index answers it from the `skills` entry); the reference's "Compare experiences" is relabelled "Show my impact" and submits "What impact have you created?" | the retrieval index has no comparison answer — "Compare experiences" returns the empty fallback, so a chip promising it would claim something the panel cannot answer; the impact entry is the closest sourced, experience-level answer and the label says what it returns | Tushar direction 2026-09-26 (TKT-104) — confirm the relabel at the gate |

Nothing here re-opens the palette (S12), typography (S13), hero (S14), the budget threshold (S15/EV5 — only its definitions are refined by D6), the band (S16) or the scope (§12.3–12.4).
