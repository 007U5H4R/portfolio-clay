# Ask Tushky drawer — Tushar's spec (2026-09-26, verbatim)

Reference image: `ask-tushky-drawer-target.png` (same folder).

Redesign the existing portfolio chatbot into a **right-side drawer / panel** called **Ask Tushky**.

Tushky is a friendly Golden Retriever who acts as Tushar's portfolio assistant.

IMPORTANT:
- Do NOT redesign the full page.
- Do NOT move the main portfolio content.
- The chatbot must open from the **right side**.
- The rest of the portfolio remains visible on the left.
- Preserve the site's current paper / scrapbook / notebook visual language.
- Keep the chatbot compact enough to fit in a single desktop viewport whenever possible.

## 1. CORE INTERACTION
When the user clicks the existing "Ask my portfolio" / "Ask Tushky" trigger: open a fixed drawer from the RIGHT side.
Desktop: existing portfolio content on the left, ASK TUSHKY chatbot on the right. The left-side portfolio must remain visible. Apply a subtle overlay / dimming effect to the existing page while the drawer is open. Do NOT navigate to a separate Ask AI page.

## 2. DRAWER DIMENSIONS
Desktop: position: fixed; top: 0; right: 0; height: 100dvh. Target width 420px–480px, preferred 460px.
Suggested CSS: width: min(460px, 32vw); min-width: 400px; max-width: 480px; On large displays do not exceed roughly 30–32% of screen width.
Tablet: 380px–430px. Mobile: 100vw — at mobile breakpoint, convert the drawer into a full-screen chat experience.

## 3. DRAWER OPEN / CLOSE ANIMATION
Open from right: transform translateX(100%) → translateX(0); duration 380–450ms; easing cubic-bezier(0.22, 1, 0.36, 1). Add a very subtle paper-settle at the end: 0 → -4px → 0. Do NOT use a large elastic spring.
Close: translateX(0) → translateX(100%); duration 250–320ms; no bounce on close.

## 4. BACKDROP
While drawer is open: existing portfolio remains visible on left. Background overlay rgba(10, 15, 28, 0.38). Optional backdrop-filter: blur(2px); maximum blur 4px. Do not make the page unrecognizable. Clicking the backdrop should close the drawer. Escape key should close it. Do NOT allow the backdrop to cover the drawer itself. Layering: portfolio page z-index 0, backdrop z-index 40, drawer z-index 50.

## 5. OVERALL VISUAL DIRECTION
"a useful AI assistant living inside Tushar's scrapbook portfolio." Warm cream paper, tactile paper texture, subtle torn-paper edges, tiny notebook details, navy typography, terracotta accents, pastel category colors, handwritten annotations, soft physical shadows. BUT keep the ratio around 80% functional chatbot / 20% scrapbook personality. Do NOT turn it into a collage.

## 6. PANEL BACKGROUND
Warm off-white / cream base (#F7F1E7, #FAF6EE or the existing portfolio paper color). Optional very subtle paper grain. Possible details: faint notebook rules, extremely subtle red margin line, small torn edge along the LEFT side of the drawer, tiny paper imperfections. The LEFT edge is important because it separates the drawer from the page — give it an irregular paper-cutout edge if feasible.

## 7. DRAWER SHADOW
Soft left-facing shadow, e.g. box-shadow: -16px 0 40px rgba(15, 22, 40, 0.16). Avoid very dark or harsh shadows.

## 8. HEADER
Top of drawer: **Ask Tushky 🐾**; subtitle **Tushar's Portfolio Assistant**. Compact header. Ask Tushky 32–38px; subtitle 14–16px. Do NOT use giant hero typography. Use the existing serif / editorial typography for "Ask Tushky". "Tushky" may use the terracotta accent. Add a small handwritten underline or stroke. Close button top-right: circular paper button ~42–44px, white/cream, subtle border, small shadow, navy X.

## 9. TUSHKY AVATAR
A friendly Golden Retriever; warm realistic / polished illustrated mascot. Friendly, intelligent, warm eyes, curious, wears a navy bandana, bandana says "Tushky", not overly cartoonish, not a corporate mascot, not too much vertical space. Desktop target 110–135px tall. Sits around the top section under or beside the header. Optional tiny annotation: "I sniff through Tushar's work so you don't have to." Keep this small.

## 10. TRUST / GROUNDING NOTE
One sticky note near Tushky: **Ask anything about Tushar — answers are grounded only in this portfolio.** Pale yellow / beige paper, small masking tape at top, slight rotation ~1deg, handwritten typography, compact. Do NOT repeat this message elsewhere.

## 11. TUSHKY INTRO MESSAGE
Below the avatar, one assistant message: **🐾 Hi! I'm Tushky.** I can help you explore Tushar's work, projects, experience, skills, product thinking, and learnings. **What would you like to know?** Container warm white, rounded 18–20px, subtle paper texture, slight shadow. Headline 18–20px, body 14.5–16px. Compact.

## 12. SUGGESTION SECTION
Heading **Try asking...** (handwritten). Compact single-column prompt cards:
1. What products has Tushar built?
2. What impact has he created?
3. Show me his product thinking process.
4. What is his AI / cloud experience?
5. What are his strongest skills?
6. Walk me through a specific project.
Each row: [icon] question text → ; height 54–60px; radius 14–16px; text 14.5–15.5px; icon 30–34px pastel circle; arrow right aligned. Colors: Products coral, Impact pale blue, Thinking pale yellow, AI/Cloud lavender, Skills mint, Project walkthrough teal. No huge cards. No two columns inside the drawer.

## 13. QUESTION CARD HOVER
translateY(-1px or -2px), shadow slightly stronger, arrow translateX(3px), optional border tint change. No scale > 1.01. Duration 160–200ms.

## 14. DRAWER LAYOUT / VERTICAL FIT
Empty state should fit common laptop heights (768–900px). Flex layout: drawer (display:flex; flex-direction:column; height:100dvh) → header (flex-shrink:0) → scrollable body (flex:1; overflow-y:auto) → input footer (flex-shrink:0). Reduce excessive whitespace. Rhythm: header padding 20–24px; avatar block bottom 12px; message bottom 12px; prompt gap 8px; footer 12–16px.

## 15. CHAT INPUT FOOTER
Pinned at the bottom: [attachment] [Ask Tushky anything about Tushar...] [send]. Placeholder **Ask Tushky anything about Tushar...**. Height 52–56px; warm white; subtle navy outline; rounded pill / 16–18px. Attachment: paperclip icon. Send: compact navy circular / rounded-square button with a paper-plane icon, ~44–48px. No giant text CTA.

## 16. ACTUAL CHAT MODE
After the user submits a question the drawer transitions into a real conversational layout. Remove or collapse the large dog illustration, the full suggestion list and the large welcome block. Keep: small header, small Tushky avatar, conversation messages, input. (User message right; Tushky answer left; follow-up chips; input pinned.)

## 17. CHAT BUBBLES
Tushky message left aligned, small Tushky avatar 28–34px, bubble cream/white, navy text. User message right aligned, very light terracotta or light navy tint. No saturated bubbles. 14.5–15.5px, line-height 1.5–1.6.

## 18. SOURCED ANSWER UI
At the end of an answer, optionally "Sources from portfolio:" with small chips (e.g. [TeachSpark] [Experience] [RailCite]). Do NOT show raw URLs. Do NOT overload every response.

## 19. FOLLOW-UP SUGGESTIONS
After Tushky answers, show 2–3 compact chips (e.g. [Show TeachSpark] [Tell me about RailCite] [Compare his experience]). These replace the initial 6-card list.

## 20. SCROLL BEHAVIOR
Chat body scrolls independently. Lock underlying body scroll if required; drawer content remains scrollable. After submit, auto-scroll to the latest message smoothly (not abruptly) unless reduced motion.

## 21. TUSHKY MICRO-INTERACTIONS
On open (once): opacity 0 → 1, scale 0.97 → 1, rotation -1deg → 0; optional tiny paw lift / head tilt. While generating: small avatar may subtly pulse or blink. Do NOT continuously animate the dog; the UI settles into stillness.

## 22. RESPONSIVE BEHAVIOR
Desktop 420–480px drawer; tablet 380–420px; mobile 100vw full-screen overlay. On mobile: hide the underlying site, dog avatar 75–90px, title 28–32px, input above safe area, full-width question cards, avoid the large sticky note.

## 23. ACCESSIBILITY
role="dialog"; aria-modal="true"; aria-labelledby="ask-tushky-title"; focus trap; Escape closes; focus returns to the original CTA after close; all buttons keyboard accessible; ≥ 44×44px targets; visible focus ring; do not rely on color only.

## 24. REDUCED MOTION
prefers-reduced-motion: reduce → drawer appears without sliding, no bounce, no avatar entrance motion, no smooth scrolling; all content visible.

## 25. SEMANTIC / COMPONENT STRUCTURE
Reusable components, e.g. <AskTushkyDrawer> <DrawerBackdrop/> <TushkyHeader/> <TushkyEmptyState/> <ChatConversation/> <SuggestedQuestions/> <ChatComposer/> </AskTushkyDrawer>. State: isOpen, messages, isGenerating. Data-driven suggestions ({ icon, label, category }). Do NOT hardcode six separate card components.

## 26. IF FRAMER MOTION EXISTS
AnimatePresence, motion.aside, motion.div. Drawer initial {x:"100%"} animate {x:0} exit {x:"100%"} transition {duration:0.42, ease:[0.22,1,0.36,1]}. Backdrop opacity 0 → 1.

## 27. PAPER EDGE TREATMENT
The drawer's LEFT border should not look like a generic rectangular modal: torn-paper pseudo-element, SVG irregular edge, or CSS mask. Do not make the irregularity so strong that content alignment suffers.

## 28. COLOR SYSTEM
Existing portfolio colors: primary deep navy, accent terracotta / burnt orange, paper cream, suggestions soft pastel variants only. Avoid neon, metallic gradients, glassmorphism, cyberpunk blue, dark chatbot backgrounds.

## 29. COPY
Header **Ask Tushky 🐾**; subtitle **Tushar's Portfolio Assistant**; trust note **Ask anything about Tushar — answers are grounded only in this portfolio.**; optional note **I sniff through Tushar's work so you don't have to.**; welcome **🐾 Hi! I'm Tushky.** I can help you explore Tushar's work, projects, experience, skills, product thinking, and learnings. **What would you like to know?**; input **Ask Tushky anything about Tushar...**

## 30. WHAT NOT TO DO
No left-side drawer; no full-page experience on desktop; don't obscure the entire portfolio; no giant typography; no giant Golden Retriever image; no dark-mode chatbot; no glassmorphism; no lots of decorative plants/books/mountains; don't look like customer support software; don't duplicate the grounding message; no generic "How can I help?" copy; empty state no taller than necessary; no continuous bouncing animations; don't change unrelated portfolio sections.

## 31. TARGET FEEL
A sophisticated portfolio + a personal AI assistant + a friendly Golden Retriever + a tactile paper notebook. First impression: "Oh, this is Tushar's own assistant." not "This is a support chat widget."

## 32. BEFORE IMPLEMENTING
Inspect the existing Ask AI component; find the trigger; find the current drawer/modal; whether it opens left/center/full-screen; z-index structure; responsive breakpoints; typography tokens; whether Framer Motion is installed; existing AI/chat state handling; whether it supports real conversation state. Then show a concise implementation plan. Only after that, implement.

## 33. AFTER IMPLEMENTING
Test: opens from RIGHT; closes to RIGHT; backdrop works; click outside closes; Escape closes; focus trap; underlying site visible on desktop; width compact; empty state fits viewport; input anchored; suggested cards readable; dog doesn't dominate; conversation state works; follow-ups work; mobile full-screen; reduced motion; no horizontal overflow; no content shift in the underlying page; no unrelated styles break.
Then summarize: files changed; drawer width; animation implementation; empty-state structure; chat state structure; typography changes; responsive behavior; accessibility behavior; compromises.
