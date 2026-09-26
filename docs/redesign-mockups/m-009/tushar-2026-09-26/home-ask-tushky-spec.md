# Home "Ask Tushky" section — Tushar's spec (2026-09-26, verbatim values)

Reference image: `home-ask-tushky-target.png` (same folder). Campfire TASK-109, ticket TKT-113.

Redesign the existing **Ask section on the Home page** so it visually matches the new **Tushky portfolio assistant** identity.

IMPORTANT: this is the inline section on the Home page. Do NOT convert it into the right-side drawer. Keep it a horizontally composed homepage section. The CTA/input inside it must still open the existing right-side Tushky drawer. Preserve the paper / scrapbook / notebook aesthetic. Do not redesign unrelated homepage sections.

## 1. Goal
The section acts as a visual introduction to Tushky: "Tushky is Tushar's portfolio assistant, and I can ask him questions about Tushar's work." Warm, personal, premium, editorial, scrapbook-inspired, compact, friendly, intentional. NOT a generic search widget, customer-support section, giant chatbot, childish, sci-fi or overly decorative.

## 2. Layout
Two-column desktop composition. LEFT: Tushky identity + Golden Retriever visual (42–46%). RIGHT: compact notebook-style Ask UI (54–58%). The right Ask card stays the stronger functional element.

## 3. Left column
Eyebrow **ASK**; title **Ask Tushky 🐾**; subtitle **Tushar's Portfolio Assistant**. Existing serif/editorial type. Eyebrow 14–16px; title 48–64px desktop; subtitle 22–28px handwritten/script. Headline not oversized versus the rest of the homepage hierarchy.

## 4. Description copy
Replace "Type a question and get a sourced answer drawn only from this site — no live AI." with: **Ask anything about Tushar's work, projects, experience, skills, product thinking, and learnings. Answers are grounded only in this portfolio.** Do not repeat this trust message elsewhere in the section.

## 5. Tushky Golden Retriever
Warm Golden Retriever, friendly and intelligent, navy bandana reading "Tushky", expressive natural eyes, a portfolio companion, not childish, not a generic mascot. Desktop 220–300px tall; prominent but not dominating. Preferred: below/beside the title, front paws resting on the lower edge of the composition if feasible.

## 6. Handwritten label
Near Tushky: **That's Tushky! 🐾** — small handwritten annotation with an arrow pointing to the dog.

## 7. Optional sticky note
**I sniff through Tushar's work so you don't have to.** Pale yellow paper, slight rotation, one piece of tape, handwritten, compact. Personality, not primary content.

## 8. Right column notebook panel
Lined notebook paper: warm ivory, subtle horizontal rules, red vertical margin line, 3–4 subtle binder holes, slight torn/irregular edge, soft shadow, one tape strip at top. Not a generic rectangular SaaS card.

## 9. Panel header
**What would you like to know?** handwritten, 24–30px, compact.

## 10. Input
Chatbot-style composer: [paperclip] [Ask Tushky anything about Tushar...] [send]. Placeholder **Ask Tushky anything about Tushar...** (not "Ask about my work..."). Height 56–64px, radius 18–22px, warm white, subtle navy/gray border, soft shadow. Send: navy, round or rounded square, paper-plane icon. No large text "Ask →" button.

## 11. Input behaviour
On focus, submit, or send: open the existing RIGHT-side Tushky drawer. If text was entered, carry it into the drawer and immediately submit it there. Do NOT answer inline. The Home component is a launcher/preview.

## 12. Suggested question cards
6 compact cards, 2-column grid on desktop:
1. What products has Tushar built?
2. What AI products has he worked on?
3. What impact has he created?
4. What are his strongest skills?
5. Show me his product thinking process.
6. Walk me through a specific project.
Each: [icon] [text] [→]; height 72–84px; text 15–17px; radius 16–20px; subtle shadow; paper-card styling, not pills.

## 13. Colour coding
Pastel icon circles: Products coral/peach; AI lavender; Impact pale blue; Skills mint; Product thinking soft yellow; Projects teal/aqua. Card bodies neutral cream/white.

## 14. Card interaction
Hover: lift 2px, slightly stronger shadow, arrow shifts right 3px, border tint slightly darker; 160–200ms; no noticeable scale. Click: open the drawer and immediately submit that question.

## 15. Hierarchy
1 Ask Tushky, 2 Golden Retriever, 3 notebook Ask interface, 4 suggested prompts, 5 handwritten personality details. Not six equally important decorative elements.

## 16. Background
Same warm background. Only subtle layered-paper accents: torn blue paper in one corner, a muted terracotta scrap, a faint grid-paper piece, one botanical leaf. Cleaner than the Experience/Education scrapbook sections.

## 17. Consistency
Same visual language as Experience, Education, Certifications and the Tushky drawer: paper texture, warm cream, navy type, terracotta accent, handwritten notes, soft shadow, torn edges.

## 18. Typography (desktop)
Eyebrow 14px; title 52–60px; subtitle 24px; body 17–19px; notebook title 26px; prompt card 15–16px; input 16px. No body text above ~20px.

## 19. Spacing
Section vertical padding 80–110px; left column gap 16–24px; right card padding 28–36px; prompt gap 12–16px. No giant vertical dead space.

## 20. Height
Whole section ~700–850px desktop, no internal scrolling, one composed frame.

## 21. Responsive
Desktop 2 columns. Tablet stacks: title → Tushky image → notebook panel. Mobile single column; dog 120–160px; cards single column; input full width. The Home section does NOT behave like the drawer on mobile; it stays inline.

## 22. Accessibility
Suggested questions are real buttons. Input aria-label "Ask Tushky anything about Tushar". Cards keyboard focusable with visible focus. Min touch target 44px. Don't rely on colour only.

## 23. Motion
On viewport entry: title opacity 0→1, translateY 12px→0; Tushky opacity 0→1, scale 0.97→1; notebook opacity 0→1, translateX 20px→0; cards stagger 70–100ms; total ~700–900ms. No continuous dog animation (optional single head tilt / paw on first reveal).

## 24. Connection to drawer
Input submit, suggested question, and Ask Tushky CTA all open the RIGHT drawer; the transition should feel connected. Optional: animate the clicked input/card toward the right before the drawer opens — skip if it hurts performance.

## 25. Architecture
e.g. `<HomeAskTushky><TushkyIntro/><TushkyMascot/><TushkyLaunchPanel/><SuggestedQuestions/></HomeAskTushky>`. Reuse the drawer's suggestion data; one shared source (e.g. `tushkyQuestions = [{label, icon}, …]`) for the Home section and the drawer empty state. Do not duplicate prompt definitions.

## 26. Copy
Eyebrow ASK · Headline **Ask Tushky 🐾** · Subtitle **Tushar's Portfolio Assistant** · Body (§4) · Annotation **That's Tushky! 🐾** · Sticky **I sniff through Tushar's work so you don't have to.** · Notebook heading **What would you like to know?** · Input **Ask Tushky anything about Tushar...**

## 27. Remove
"Ask my portfolio" → "Ask Tushky". The old description (§4). "Answers come from this portfolio's content — nothing generated." (grounding is already stated once).

## 28. Do NOT
Turn this into the drawer; make Tushky a tiny icon or enormous; dark chatbot theme; neon/glassmorphism; generic search UI; large text bubbles; huge prompt pills; continuous animations; overloaded scrapbook decoration; change unrelated homepage sections; duplicate questions if a shared config exists.

## 29. Desired result
Editorial portfolio + personal AI assistant + Golden Retriever personality + functional chatbot launcher. "I can ask this dog anything about Tushar." without feeling gimmicky.

## 30. Before implementation
Find the Home Ask section and its component file; the input logic; how the drawer opens; whether prompt cards share data; typography tokens; colour variables; whether Framer Motion is available; responsive breakpoints. Present a concise implementation plan, then implement.

## 31. After implementation — verify and report
Verify: inline on Home; Tushky only in this section (and the drawer); balanced desktop; no oversized fonts; notebook fits; compact prompts; input launches the right drawer; a suggestion launches it; typed text transfers; mobile stacks; no horizontal overflow; subtle animation; focus states; matches the system.
Report: 1 files changed; 2 component structure; 3 shared question-data approach; 4 typography sizes; 5 desktop proportions; 6 drawer-launch behaviour; 7 responsive behaviour; 8 accessibility changes; 9 compromises.
