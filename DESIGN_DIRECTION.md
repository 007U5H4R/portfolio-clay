# DESIGN_DIRECTION — Clay Portfolio

Status: approved 2026-09-15 (with Solution-PRD). Source brief: `~/Downloads/prompt.md` §03–§08, §12, §28–§31, §37, §40. This file fixes the visual system; `Design.md` (Stage 4, t-design) will turn it into OKLCH tokens, component specs and motion physics.

## 1. Design principles (in priority order)
1. **Less UI, more personality.** 50–60 % of every viewport is breathing space. If three items work, don't add six.
2. **Typography leads, clay supports.** The hero statement is the loudest element on every page; clay objects never compete with it.
3. **Clay adds character, never subtracts credibility.** Target reading: 70 % professional · 20 % playful · 10 % experimental. Anything that reads "children's app" or "UI kit demo" is a defect.
4. **Every number has context.** `35+ · AR capabilities · roadmap ownership` — never a naked big number.
5. **Motion must earn its place.** Each animation improves understanding, feedback or delight; otherwise it's cut.
6. **Evidence over decoration.** Case-study artifacts show real hypotheses, quotes, metrics, diagrams — no empty process graphics.

## 2. Palette
| Token | Value | Use |
|---|---|---|
| `bg` | `#FAF9FF` | page background (never pure white) |
| `surface` | `#FFFFFF` @ 70 % over bg, or `#F4F2FF` | clay body base |
| `ink` | `#101646` | primary text |
| `ink-2` | `#3D4270` | secondary text |
| `ink-3` | `#6B6F94` | captions, eyebrows (AA on bg) |
| `accent` | `#6657F5` | links, highlight word, active pill, primary button |
| `accent-deep` | `#4E40D8` | hover/pressed accent |
| Secondary clay — one per section, never all at once: | | |
| `lavender` | `#BFA8FF` | hero frame, Ask panel tint |
| `sky` | `#A8D7FF` | avatar frame, Technology cluster |
| `mint` | `#A5EBD2` | Evaluate/Impact stage, success states |
| `blush` | `#FFB4C6` | People tile, human moments |
| `peach` | `#FFD2B2` | Build stage, playground |
| `butter` | `#FFE389` | Insight stage, annotations backdrop |

Contrast rule: body text ≥ 7:1, secondary ≥ 4.5:1, text on clay colours uses `ink` only. Colour is never the sole carrier of meaning (status badges get an icon + label).

## 3. Typography
- **Display / UI:** Manrope (variable, `next/font`, weights 500–800). Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Handwritten annotations:** Caveat (weight 500–600). Max 2–3 annotations per viewport; copy from the brief's set (`ideas → impact`, `same curiosity. bigger problems.`, `good products → happier people`, `build. learn. repeat.`).
- Scale (desktop → mobile): hero 88 → 44 px (weight 800, tracking −0.03em, line-height 1.02); h2 56 → 34; h3 32 → 24; lead 22 → 19; body 18 → 17; caption 14 (never below 14).
- Paragraph measure ≤ 600 px. Eyebrows: 13–14 px, uppercase, tracking +0.12em, `ink-3`.
- Hero highlight: "AI-native products" in `accent` with a one-time 700 ms soft lavender wash on first view; no loops, no typewriter, no blink.

## 4. Spacing & layout
- Base unit 8 px. Section rhythm: 128 px desktop / 96 tablet / 72 mobile between sections; 40–56 px inside a clay card.
- Container 1200 px max (1320 at ≥1440), side gutters 24 px mobile / 40 tablet / 64 desktop.
- Hero: 35 % avatar column / 65 % content at ≥1024; stacks (avatar → headline → CTA) below.
- Breakpoints: 1440+ · 1024–1439 · 768–1023 · <768. Mobile home order: avatar · headline · CTAs · Ask · projects · How I Think · CTA.
- Touch targets ≥ 44 × 44 px. Clay cards go full-width on mobile.

## 5. Clay material system
```
--clay-radius:        28px   (range 24–36; buttons 20px; pills 999px)
--clay-shadow-rest:   0 16px 35px rgba(16,22,70,.10), 0 5px 10px rgba(16,22,70,.06),
                      inset 0 2px 3px rgba(255,255,255,.85), inset 0 -3px 6px rgba(16,22,70,.05)
--clay-shadow-hover:  0 22px 44px rgba(16,22,70,.14), 0 8px 14px rgba(16,22,70,.08), (same insets)
--clay-shadow-press:  0 6px 14px rgba(16,22,70,.10), 0 2px 4px rgba(16,22,70,.06),
                      inset 0 3px 6px rgba(16,22,70,.08)
--clay-volume:        linear-gradient(160deg, rgba(255,255,255,.65), rgba(255,255,255,0) 55%)
```
- Volume: base colour + `--clay-volume` overlay; tinted clay uses the section colour at 100 % with a 6 % darker bottom edge.
- **Button physics:** rest → hover `translateY(-3px)` + hover shadow (180 ms ease-out) → active `translateY(1px) scale(.98)` + press shadow (90 ms). Focus ring: 3 px `accent` outline offset 3 px, always visible on keyboard.
- Clay tiers: **Hero objects** (avatar frame, floating tiles) — full clay; **Cards** (project, stage, story) — full clay at rest, lift on hover; **Utility** (tags, filters, nav pill) — light clay (radius + soft single shadow). Body text areas, essay pages and tables are **flat** — no clay.
- Glass is used only for the compacted header background (`backdrop-blur 12px`, 80 % bg).

## 6. Motion system
| Pattern | Spec |
|---|---|
| Section reveal | opacity 0→1, y 20→0, 500 ms, `cubic-bezier(.2,.7,.2,1)`, stagger 70 ms, triggers at 20 % in view, once |
| Card hover | rise 5 px, artwork scale 1.03, arrow x +4 px, gradient +8 % — 200 ms |
| Cursor parallax (hero) | avatar −6 px opposite cursor; tiles at 0.5×/1×/1.5× depth; spring stiffness 120 / damping 20; disabled on touch |
| Header compaction | padding 28→14 px, blur in, 250 ms; after 24 px scroll |
| Filter change | layout animation (spring 260/28) with fade-out 150 / fade-in 200 |
| Shared element (card → case header) | React `<ViewTransition>` name = slug, 450 ms; falls back to plain navigation |
| Ask panel | slide from right 320 ms ease-out, page dims 20 %, focus trapped, Esc closes |
| Show the thinking | 8 nodes, each 220 ms, 120 ms stagger, connector draws with node; user-triggered only |
| Timeline expand | height auto via layout animation 300 ms |
Global: everything above collapses to instant/opacity-only under `prefers-reduced-motion: reduce`. Never: trailing cursor, scroll hijack, continuous rotation/bounce/float, particles, animated backgrounds, typing effects.

## 7. Component rules
- One icon family (lucide) at 1.75 px stroke; clay "3D icons" are CSS/SVG tiles built from the material tokens — no mixed illustration styles.
- Project cards: icon · name · one sentence · ≤3 tags · arrow. Nothing else.
- Case-study artifacts share radius/shadow DNA but vary by shape: Insight = quote block with source; Hypothesis = "We believe… we'll know when…"; Metric = number + label + context + date; Decision = chosen vs rejected; Evaluation = method + result + limitation; Experiment = setup → result → learning; PrototypeFrame = media in a clay bezel.
- Every data-backed view designs loading / empty / error / working states (Ask panel, filters, video player, timeline).
- Handwritten annotations are decorative (`aria-hidden`) and never carry unique information.
- No stock photos, robots, neural-net backgrounds, floating spheres, fake logos/testimonials.

## 8. Avatar
Semi-realistic claymorphism waist-up portrait of Tushar (from `photo.jpg`: short dark hair, full beard, warm skin, grey blazer over dark tee) inside a large sky/lavender clay frame; ≤3 supporting objects (laptop, small plant, two books). Friendly, curious, professional — not a caricature, not a Pixar child. Delivered as transparent WebP ≥1600 px + 2× poster; generated via Higgsfield/Recraft with photo.jpg as identity reference, candidates approved by Tushar.

## 9. Performance & accessibility budgets
Lighthouse ≥ 90 / 95 / 95 / 95 on every route (mobile + desktop) · LCP ≤ 2.5 s · CLS < 0.05 · JS ≤ 180 kB gz on home · images AVIF/WebP via `next/image` · videos `preload="none"`, ≤ 4 MB, poster first · fonts self-hosted via `next/font` with `display: swap` · axe: 0 critical/serious · full keyboard path incl. Ask panel and timeline · skip link · semantic landmarks · alt text on every image (avatar alt: "Clay illustration of Tushar Pathak at a laptop").
