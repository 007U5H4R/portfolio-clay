# About hero redesign: Tushar's spec (2026-09-28, verbatim)

Source: Tushar's chat message of 2026-09-28 (TASK-117). He attached two reference images (#50, #51) in chat. They were not available to the orchestrator as files, so this text is the reference of record.

---

Redesign the existing **About / Senior Product Manager hero section** to match the attached handcrafted editorial-paper mockup.

The section should visually communicate my journey: machines → systems → people → intelligent products.

Do NOT redesign the entire About page. Only update this hero / intro section.

Preserve the existing overall portfolio visual language: warm paper texture, serif editorial typography, handwritten annotations, navy + terracotta palette, tactile scrapbook details, restrained shadows, premium, human, personal feel.

## 1. CORE NARRATIVE
The section should communicate this story immediately:

**I started with machines. Then systems. Then people. Now, intelligent products.**

This is the hero narrative. The visual design should reinforce that progression without needing a literal timeline.

The section should feel thoughtful, personal, editorial, human, mature, reflective, premium and slightly tactile.

Avoid: corporate About page styling, generic PM résumé layout, glassmorphism, dark cards, excessive icons, over-decoration, giant empty white space.

## 2. OVERALL LAYOUT
Use a wide, asymmetric two-column composition. LEFT: main story / headline / stats. RIGHT: scrapbook collage / personal philosophy. Suggested desktop ratio: left 54–58%, right 42–46%. The right-side collage should balance the left-side typography, not overpower it.

## 3. EYEBROW
At the top-left: **ABOUT · SENIOR PRODUCT MANAGER**. Uppercase, letter-spacing, navy, small editorial sans-serif, approximately 14–16px. Use a small terracotta separator dot. Do not make the eyebrow too large.

## 4. MAIN HEADLINE
Use exactly:

**I started with machines.
Then systems. Then people.
Now, intelligent products.**

Large editorial serif. Line 1 navy, line 2 navy, line 3 terracotta; the final line should feel like the culmination of the journey. Suggested desktop size 56–72px, line-height 1.05–1.12. Do not make the type so large that the section requires unnecessary scrolling.

## 5. REMOVE PUBLIC DRAFT LABELS
Remove all visible public labels such as **DRAFT — PENDING SIGN-OFF**. Do not show draft status anywhere in this section. If draft state is needed internally, hide it behind development/debug configuration.

## 6. HANDWRITTEN SUBLINE
Under the headline: **Same curiosity → bigger problems.** Handwritten font, navy, 26–32px, subtle imperfect underline or terracotta stroke. Keep this line expressive but secondary.

## 7. LEFT-SIDE METRICS CARD
Below the headline area, create one wide paper stats card with 3 columns:

- **10+** years building products
- **3** industries — physical → cloud → AI
- **∞** curiosity

Use thin vertical separators between the 3 columns. The card should look like warm handmade paper, slightly raised, with a very subtle shadow, one small masking tape piece near top-left, and no heavy border.

## 8. METRIC TYPOGRAPHY
Metric numbers: large editorial serif, suggested 52–64px. Colors: 10+ terracotta; 3 navy; ∞ dark green / muted teal. Labels: 16–18px, muted navy/slate.

## 9. METRIC FOOTNOTE
Below the metrics inside the same card: **counted from 2016 — the “+” is because the American Express role is still open**. Smaller text, 14–15px. Add a subtle dotted or pencil divider above it. Keep it understated.

## 10. SMALL PERSONAL NOTE
Below the metrics card: **coffee first. then the roadmap. ☕**. Handwritten, 18–22px, muted navy, optional small terracotta underline. This is a personality detail, not a headline.

## 11. RIGHT-SIDE COLLAGE
A restrained scrapbook collage containing: 1. pinned yellow note, 2. one Polaroid-style photo, 3. one torn notebook page, 4. one small botanical sprig, 5. subtle tape / pin accents. Do not add too many decorative elements. The collage should feel intentionally arranged, not chaotic.

## 12. YELLOW PHILOSOPHY NOTE
At the top-right: a pale yellow lined note card with the text **“I build at the intersection of people, products and intelligent systems.”** in handwritten typography. Add a small terracotta pushpin at the top, a slight rotation, and a terracotta underline under the quote. Remove any public draft label.

## 13. POLAROID / PERSONAL IMAGE
Below / partly behind the yellow quote note, a Polaroid-style image. Preferred visual: a quiet mountain / sunrise / landscape image representing curiosity, reflection, exploration and growth. Caption below: **Bigger problems. Brighter mornings.** in small handwritten typography. Do not make the photo overly dominant.

## 14. TORN NOTEBOOK PAGE
Beside / below the Polaroid, a torn notebook-paper card with a simple hand-sketched Venn diagram: People / Products / Intelligent Systems, with the center overlap highlighted subtly in terracotta. Below the diagram, in handwritten text:

☐ Better tools
☐ More capable people
☐ A more thoughtful future

Optional: small terracotta underline under the last item.

## 15. SMALL COLLAGE ANNOTATION
Near the bottom of the collage: **same curiosity, still here.** in tiny handwritten text with a curved arrow. Keep it quiet.

## 16. BOTANICAL ELEMENT
One small green leaf / botanical sprig partly taped to the notebook page. Muted sage / olive, not bright green. It should add warmth and texture.

## 17. PAPER / TEXTURE SYSTEM
Background warm cream paper; stats card slightly brighter ivory; yellow note muted warm yellow; notebook page off-white ruled paper; tape semi-transparent beige; pin terracotta; shadows soft, diffuse, natural. Avoid pure white cards, hard black borders, heavy shadows, glossy effects.

## 18. COLOR SYSTEM
Reuse existing portfolio tokens if available. Deep navy: primary text. Terracotta: highlight / emphasis. Muted teal / green: curiosity metric. Warm ivory: background. Soft yellow: quote note. Muted sage: botanical accent. Do not introduce bright saturated colors.

## 19. VISUAL HIERARCHY
Intended eye flow: 1. ABOUT eyebrow, 2. headline, 3. handwritten subline, 4. metrics card, 5. right-side philosophy note, 6. personal Polaroid / Venn sketch, 7. tiny personality notes. The collage should support the story, not compete with the headline.

## 20. SPACING
Suggested desktop: section padding 80–120px horizontal and 80–100px vertical; headline bottom 28–36px; subline bottom 40–48px; metrics top 24–32px; column gap 70–100px. Avoid large dead zones.

## 21. SECTION HEIGHT
Target ~750–900px on desktop. Do not force the section to exceed one viewport significantly. It should feel like one coherent editorial composition.

## 22. ENTRANCE MOTION
Restrained viewport animation, in sequence:
- eyebrow: opacity 0 → 1
- headline: opacity 0 → 1, translateY 14px → 0
- terracotta line: slightly delayed
- subline: fade in
- metrics: fade + translateY 12px
- quote note: fade + rotate settle
- Polaroid: fade + translateY 12px
- notebook page: fade + rotate settle

Total ~900–1200ms with a subtle stagger. Do NOT animate continuously.

## 23. CARD PHYSICS
Tiny natural final rotations, e.g. quote +2deg, Polaroid -1.5deg, notebook +1deg, stats card 0deg or -0.2deg. Handmade but controlled.

## 24. RESPONSIVENESS
Desktop: 2 columns. Tablet: slightly narrower columns. Mobile: stack, in this order: 1. eyebrow, 2. headline, 3. subline, 4. stats card, 5. quote note, 6. Polaroid, 7. Venn notebook, 8. personal note. On mobile: reduce decorative overlap, remove nonessential background scraps, keep all text readable, and don't use absolute positioning that causes overlap.

## 25. MOBILE TYPOGRAPHY
Headline 38–46px; subline 22–26px; metric numbers 42–50px; metric labels 14–16px; quote 20–24px. Do not force desktop line breaks on mobile.

## 26. ACCESSIBILITY
Sufficient text contrast; semantic heading structure; decorative illustrations have empty alt text; a meaningful image has useful alt text; no essential information exists only in handwriting illustration; motion respects prefers-reduced-motion.

## 27. REDUCED MOTION
For prefers-reduced-motion: reduce, disable stagger, translate motion and rotation settle. Show all elements immediately.

## 28. COMPONENT STRUCTURE
```
<AboutHero>
  <AboutNarrative>
    <AboutEyebrow />
    <AboutHeadline />
    <AboutSubline />
    <AboutMetrics />
    <AboutPersonalNote />
  </AboutNarrative>
  <AboutCollage>
    <PhilosophyNote />
    <JourneyPolaroid />
    <IntersectionSketch />
  </AboutCollage>
</AboutHero>
```
Do not create one giant monolithic component.

## 29. INTERSECTION SKETCH DETAILS
Use an SVG or lightweight HTML/CSS illustration for the Venn diagram; no raster image if it can be drawn natively. Circles: thin navy stroke. Labels: People, Products, Intelligent Systems. Intersection: subtle terracotta fill. It should look hand-sketched.

## 30. COPY TO USE
- Eyebrow: ABOUT · SENIOR PRODUCT MANAGER
- Headline: I started with machines. / Then systems. Then people. / Now, intelligent products.
- Subline: Same curiosity → bigger problems.
- Metrics: 10+ years building products / 3 industries — physical → cloud → AI / ∞ curiosity
- Footnote: counted from 2016 — the “+” is because the American Express role is still open
- Personal note: coffee first. then the roadmap. ☕
- Philosophy quote: “I build at the intersection of people, products and intelligent systems.”
- Polaroid caption: Bigger problems. Brighter mornings.
- Notebook: People / Products / Intelligent Systems; ☐ Better tools; ☐ More capable people; ☐ A more thoughtful future
- Annotation: same curiosity, still here.

## 31. WHAT TO REMOVE
Remove all “DRAFT — PENDING SIGN-OFF” labels, large unused whitespace, disconnected floating note placement, the overly plain stats rectangle, unnecessary duplicate headings and harsh card borders. Do not add gradients, glass effects, dark cards, 3D graphics or generic corporate icons.

## 32. DESIRED EMOTIONAL EFFECT
This should feel like the opening page of a personal product journal. The user should understand, without a long biography, that engineering gave me foundations, systems gave me scale, people gave me context, and AI-native products bring those together. Human, reflective, curious, experienced, forward-looking.

## 33. BEFORE IMPLEMENTATION
1. Locate the existing About hero component. 2. Identify the current headline structure. 3. Identify the metrics component. 4. Find existing typography tokens. 5. Find paper texture assets. 6. Identify the current handwritten font. 7. Check how background textures are implemented. 8. Check the existing motion library. 9. Check responsive breakpoints. 10. Present a concise implementation plan. Then implement.

## 34. AFTER IMPLEMENTATION
Verify: all draft labels removed; headline hierarchy preserved; terracotta emphasis correct; metrics accurate; right-side collage balanced; no text overlaps; mobile layout works; paper texture remains subtle; Venn diagram readable; motion restrained; no horizontal overflow; section matches Experience / Education / Certifications styling.

Finally summarize: 1. Files changed 2. Component structure 3. Typography decisions 4. Paper/collage implementation 5. Metrics implementation 6. Responsive behavior 7. Motion behavior 8. Accessibility improvements 9. Any compromises made.
