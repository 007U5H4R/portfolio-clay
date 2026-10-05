# How I think — animation choreography spec (Tushar, 2026-09-26)

Screenshot of the current section: `how-i-think-choreo-current.png` (same folder). Every value below is Tushar's, kept verbatim where given.

Redesign the animation choreography of the existing 6-stage product-thinking section (01 Problem, 02 Insight, 03 Bet, 04 Build, 05 Evaluate, 06 Impact).
IMPORTANT: Do NOT redesign the visual content, typography, copy, dimensions, or overall layout unless necessary for animation. Preserve the current paper-cutout aesthetic.
Desired experience: a slow, tactile, cinematic paper-unrolling sequence. Six paper banners are physically rolled out and pinned onto a scrapbook board one after another (Problem → Insight → Bet → Build → Evaluate → Impact). Do NOT animate all six simultaneously; each stage begins only after the previous has substantially completed its rollout. Feel: tactile, physical, slightly imperfect, slow and intentional, premium, editorial, scrapbook-like, playful without being childish. Avoid generic fade-up / scale-in / slide-left / spring-card animations. The motion should look like paper being unrolled or unfolded into place.

## 1. Section background reveal
Before the cards animate, reveal the whole section background with a radial / circular reveal from the exact centre: small circle → expands → reaches all four edges. Prefer CSS `clip-path: circle()` or a mask over opacity alone. Initial `clip-path: circle(0% at 50% 50%)`, final `circle(75%–100% at 50% 50%)`, with the radius large enough to fully reveal the rectangle. Duration ~1.2–1.6 s, easing `cubic-bezier(0.22, 1, 0.36, 1)`. It should not feel like a hard wipe: the paper world is uncovered from its centre. Optional subtle opacity 0.85 → 1 during the expansion. Once the reveal is ~65–75 % complete, begin the path animation.

## 2. The connecting path moves to the foreground
The dotted journey path currently sits behind the banners. It should sit ABOVE / IN FRONT of the paper cards. Stacking: section background z0, decorative scraps z1, stage cards z2, journey path SVG z4, pins / foreground accents z5. The path must not cover important text; adjust its geometry slightly so it travels naturally between and around headings and pins. It should look as if someone drew the journey line across the assembled scrapbook AFTER placing the strips.

## 3. Animate the path from stage 1 → stage 6
The path is not visible initially. Draw it progressively with SVG `stroke-dasharray` / `stroke-dashoffset` (pathLength → 0), or `pathLength 0 → 1`, synchronised with the cards, in segments: start → Problem, Problem → Insight, Insight → Bet, Bet → Build, Build → Evaluate, Evaluate → Impact. Each segment draws immediately before or during its card's reveal. Do NOT draw the whole path before the banners appear. The line is a guide travelling through the story.

## 4. Paper roll-out for each stage
Cards must not simply appear. Each vertical banner rolls downward / unfurls, TOP → BOTTOM: the top edge and pin appear first, then the paper extends down. Preferred: clip-path/mask reveal `inset(0 0 100% 0)` → `inset(0 0 0% 0)` plus scale/skew/rotation so it feels physical. Alternative: `transform-origin: top center` + scaleY, masking the content so text does not visibly distort. Prefer clipping/masking over stretching text.
START: bottom mostly hidden, opacity ~0.75, rotation ±1–2deg, translateY ~-10px, scaleX ~0.98. MID: paper extends down, small rotational settling, shadow increases, content becomes visible. END: reaches natural height, overshoots very slightly, rebounds, settles.

## 5. Bounce-back at the end of each roll
Mimic a real sheet reaching full extension and recoiling slightly — not a cartoon spring: 100 % → ~102 % → ~99 % → 100 %; or translateY 0 → +4px → -2px → 0; rotation 0° → 0.4° → -0.2° → final. Total bounce ~250–350 ms. Custom cubic-bezier or a LOW-bounce spring (stiffness 180–220, damping 18–24, mass 0.8–1). Tune visually.

## 6. Stagger / sequencing (intentional timeline, not a generic staggerChildren)
T 0.00 radial reveal starts · 0.70 path begins · 1.00 Problem rollout · 1.75 Problem settles · 1.85 path → Insight · 2.10 Insight rollout · 2.85 settles · 2.95 path → Bet · 3.20 Bet rollout · 3.95 settles · 4.05 path → Build · 4.30 Build rollout · 5.05 settles · 5.15 path → Evaluate · 5.40 Evaluate rollout · 6.15 settles · 6.25 path → Impact · 6.50 Impact rollout · 7.25 settles · 7.40 final path / decorative details settle. Tunable. Total ~7–8 s — intentionally slow; do NOT compress to 2–3 s.

## 7. Pin animation
At ~80–90 % rollout the pin lands: scale 1.3 → 0.92 → 1; translateY -8px → 2px → 0; shadow soft → slightly stronger; ~250 ms. Optional tiny paper vibration after landing: rotate 0 → 0.5deg → -0.35deg → 0 (very subtle).

## 8. Content reveal inside each banner
The PAPER is the hero. After ~50–60 % of the card is revealed, gently reveal its contents in order: stage number → title → description → quote/note → source/link/button; stagger 40–80 ms; opacity 0 → 1, translateY 4–6px → 0; no noticeable scale.

## 9. Dark outline around each paper banner
A visible dark outline following the irregular torn silhouette (not a rectangular border): dark charcoal / near-black (~#182033 / #171717), ~1–1.5px, slightly ink-like; plus a separate soft physical shadow (outline sharp/dark, shadow soft/diffuse). Methods: `filter: drop-shadow()`, a duplicated SVG/mask silhouette behind the card, or a pseudo-element with the same clip-path scaled outward. (TKT-99 r2 already ships an outline — keep/refine it; note the project's finding that `filter: drop-shadow` over clip-pathed layers stalled the 1920 load, EVAL-019.)

## 10. Initial card state
Before its turn a banner should hint that it exists: a tiny visible rolled paper header, the pin location, a narrow folded strip or compressed top edge — e.g. clip while leaving ~20–30px of the top paper edge visible — so it reads as unrolling, not appearing.

## 11. Small paper physics
Final rotations: Problem -0.5deg · Insight +0.35deg · Bet -0.25deg · Build +0.4deg · Evaluate -0.35deg · Impact +0.3deg; interpolate toward them during rollout; slight timing variance so it feels handmade while staying sequential.

## 12. Optional path traveller
A small ink dot / pin-head / pencil-tip moving along the path as it draws, reaching each stage just before its paper unrolls (journey arrives → paper opens → journey continues). Very subtle, never a neon loading indicator.

## 13. Scroll trigger
Trigger once the section is meaningfully visible (~25–35 %; e.g. `viewport={{ once: true, amount: 0.3 }}` or IntersectionObserver). Do NOT restart on scroll away/back — once per page load.

## 14. Scroll during the animation
Never lock page scroll; don't trap the user; once triggered the animation continues naturally; page stays fully usable.

## 15. Reduced motion
`prefers-reduced-motion: reduce`: background immediately revealed, all banners displayed, path complete, no bounce, no rolling. Never leave content hidden.

## 16. Responsiveness
Desktop: full sequential horizontal storytelling. Tablet: keep the sequence, slightly shorter if needed. Mobile: cards may stack; animate each banner as the user approaches it OR keep the sequence if the whole group is visible; don't force desktop geometry; the path adapts (separate SVG path definitions per breakpoint if needed).

## 17. Performance
60fps; prefer transform, opacity, clip-path, SVG stroke animation; avoid animating height/width/top/left and large continuous blur filters; `will-change` sparingly; don't permanently promote every element to its own layer.

## 18. Technical implementation
Inspect the stack first and use it. Framer Motion (`motion/react`) is installed — prefer it if it doesn't break the budget, else CSS + IntersectionObserver; do NOT install GSAP. Reusable architecture, e.g. `<ProductThinkingJourney><JourneyBackground/><AnimatedJourneyPath/><StageCard stage index/>…</ProductThinkingJourney>`, data-driven `const stages = [{ id: 'problem', index: 1, … }, …]` — no six hard-coded implementations.

## 19. Animation state machine
Explicit states: idle → backgroundReveal → pathToProblem → problemReveal → pathToInsight → insightReveal → pathToBet → betReveal → pathToBuild → buildReveal → pathToEvaluate → evaluateReveal → pathToImpact → impactReveal → complete (named variants if using Framer Motion).

## 20. Final polish
After Impact lands: complete the final 5–10 % of the path, very gently settle the composition, optionally pulse the Impact pin ONCE, loop nothing, leave nothing floating — end in complete stillness.

## Desired emotional effect
"I'm watching Tushar's product thinking process physically unfold." — a paper roadmap being assembled in front of the viewer, not six cards using standard web animations.

## Before implementation
1 inspect the component and animation architecture; 2 where the six cards and path render; 3 the stacking / z-index structure; 4 whether the path is CSS, SVG or image; 5 any parent `overflow: hidden` that could clip the bounce or outlines; 6 desktop/tablet/mobile layout; 7 present a concise implementation plan; 8 then implement.

## After implementation — test and report
Test: full desktop animation; scroll trigger; no replay on normal scroll; path above cards; text readable; each stage waits for the previous; bounce visible but restrained; outline works against every scrap; radial reveal from the exact centre; tablet; mobile; reduced motion; no layout shift; no content clipping; no horizontal overflow; smooth.
Report: 1 files changed; 2 animation architecture; 3 total duration; 4 how sequencing works; 5 how path drawing works; 6 how the radial reveal works; 7 how the outline was implemented; 8 reduced-motion behaviour; 9 compromises.
