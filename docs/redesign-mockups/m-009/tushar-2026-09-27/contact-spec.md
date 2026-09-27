# Contact section redesign — Tushar's spec (2026-09-27, verbatim)

Source: Tushar's chat message of 2026-09-27 (TASK-113). He attached two reference images (#41, #42) in chat; they were not available as files to the orchestrator, so the text below is the reference of record.

Redesign the **Contact section** of my portfolio to match the warm, premium, scrapbook / paper-cutout visual language used across the rest of the site.

The current section is too list-like and visually unbalanced: the left side has too much empty space, while the right side contains all the actual contact actions.

I want the new section to feel like the **last page of a personal notebook / travel journal** — calm, warm, tactile, and inviting.

Do NOT redesign the entire site.
Only update the Contact section.

## 1. CORE DESIGN INTENT

The section should feel like:

- the final page of a scrapbook
- a warm invitation to continue the conversation
- personal, but still professional
- editorial, not corporate
- tactile and handmade
- visually consistent with my Experience, Education, Certifications, and Tushky sections

Avoid:

- generic contact forms
- SaaS-style cards
- glassmorphism
- dark UI
- excessive gradients
- giant typography
- overly decorative collage chaos
- multiple competing CTAs

The section should be simple, memorable, and emotionally warm.

## 2. NEW SECTION STRUCTURE

Use a two-column desktop layout.

LEFT: visual / emotional storytelling
RIGHT: functional contact card

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   handwritten note             CONTACT                    │
│                                                           │
│   coffee / envelope /          Still curious?             │
│   postcard collage                                        │
│                                Choose the easiest way     │
│   sticky note                  to say hello ↓             │
│   “No forms. No funnels.                                  │
│    Just say hello.”          ┌────────────────────────┐   │
│                              │ EMAIL                  │   │
│                              │ tushar_pathak@... Copy │   │
│                              │                        │   │
│                              │ [ Email me → ]         │   │
│                              │                        │   │
│                              │ [ LinkedIn ↗ ] [Resume]│   │
│                              └────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Desktop ratio: left 40–45%, right 55–60%.

## 3. MAIN COPY

Eyebrow: **CONTACT**
Headline: **Still curious?**
Handwritten subline: **Choose the easiest way to say hello ↓**

Do not use “whichever is easiest for you”. Use the new phrasing above.

## 4. LEFT SIDE — VISUAL STORY

The left side should act as a warm visual anchor. Include a restrained collage composed of:

- coffee cup
- envelope
- postcard / travel photo
- dried flowers or subtle botanical element
- one handwritten note
- one yellow sticky note
- optional tiny Tushky paw-print stamp

Do NOT overload this area. The visual should feel like someone just left a coffee, postcard, and note on a desk.

## 5. HANDWRITTEN LEFT-SIDE COPY

Near the top-left:

**Waving from the window seat —
the coffee’s usually on
and I’m always up for
a good conversation.**

Keep it small and atmospheric. Do not treat it like body copy.

## 6. STICKY NOTE

One yellow sticky note:

**No forms.
No funnels.
Just say hello.**

Optional small smiley. Style: warm muted yellow, masking tape on top, slight rotation, handwritten font, subtle paper shadow.

## 7. SECOND HANDWRITTEN LINE

Near the lower-left:

**Good conversations usually start
with one message.**

Handwritten typography, with a small underline or terracotta stroke beneath.

## 8. MAIN CONTACT CARD

The right-side contact content lives inside one large paper card that feels like torn handmade paper, warm ivory, subtle irregular edges, soft shadow, maybe one paperclip at the top-right, and an optional small postage-stamp illustration. Do NOT use a plain bordered rectangle. Wide enough for email + CTA + two secondary links. Padding 32–44px.

## 9. EMAIL BLOCK

Email is the primary action. Inside the card: small label **EMAIL**, then `tushar_pathak@outlook.com` in a large, readable serif/editorial font (24–30px desktop; do not over-enlarge), with a compact **Copy** control on the right.

```
[ email icon ]  EMAIL
tushar_pathak@outlook.com          [ Copy ]
```

## 10. COPY BUTTON

Copy icon; compact; soft rounded paper-pill styling; hover feedback; after click changes to **Copied ✓** for ~1.5–2 seconds. No toast unless the design system already uses one.

## 11. PRIMARY CTA

**Email me →** — existing terracotta token; pill/rounded; medium-large; handwritten or expressive button type; white text; soft shadow; subtle hover lift. Not enormous: height 52–58px.

## 12. SECONDARY ACTIONS

Below a subtle divider: **LinkedIn ↗** and **Resume ↓**, equal-width secondary buttons (cream/white, subtle border, navy text, minimal shadow, icon on left). Desktop two-column; mobile stack.

## 13. RESUME STATE

If the real resume link is available, use **Resume ↓**. If not, do NOT show “Resume — updating”; show **Resume — available on request** or **Email me for my resume** instead. No unfinished-state language in the public portfolio.

## 14. PAPER / STATIONERY DETAILS

Restrained accents: paperclip, envelope icon, postage-stamp motif, airmail border on envelope, masking tape, subtle travel postcard, very small botanical accent. Don't use all at once if it clutters. One clear visual story: “send me a note / start a conversation.”

## 15. COLOR SYSTEM

Background warm cream; primary text deep navy; primary CTA terracotta; secondary muted blue / sage / soft gray; sticky note muted yellow. Avoid bright saturated colors, neon, black-heavy UI.

## 16. TYPOGRAPHY (desktop)

Eyebrow 14–16px; headline 56–68px; handwritten subline 24–28px; body 16–18px; email 24–30px; buttons 16–18px. No very large display type that pushes the section beyond one viewport.

## 17. SECTION HEIGHT

Fits in ~700–850px desktop height. No internal scrolling, no giant empty spaces, balanced left and right.

## 18. ALIGNMENT

Headline aligns visually with the card; the left collage vertically balances the card; the sticky note doesn't float in isolation; no large dead zone in the left column; the right card doesn't sit too low. The current design has too much unused space on the left — fix this intentionally.

## 19. HOVER STATES (160–220ms)

Email me: translateY(-2px), slightly stronger shadow, arrow shifts right 3px. LinkedIn: subtle border tint, icon nudges. Resume: subtle border tint, download icon moves down 2px. Copy: hover background tint, active state, “Copied ✓”.

## 20. MOTION

Subtle entrance only, when the section enters the viewport: headline fade + translateY 10px → 0; left collage fade + slight rotation settle; contact card fade + translateX 20px → 0; sticky note fade + rotate 1deg → final. Total ~700ms. Nothing loops.

## 21. OPTIONAL MICRO-DETAIL

A small, subtle Tushky paw print near the handwritten note, as a continuity detail only.

## 22. RESPONSIVENESS

Desktop two-column; tablet two-column if space allows, otherwise stack. Mobile order: 1 CONTACT, 2 Still curious?, 3 handwritten subline, 4 contact card, 5 left visual collage / sticky note. On mobile, reduce the collage size significantly; never push the functional controls below excessive decoration.

## 23. ACCESSIBILITY

Email is a real `mailto:`; LinkedIn a real anchor with `target="_blank" rel="noopener noreferrer"`; Resume a proper link/button; Copy a real button with aria-label “Copy email address”; visible keyboard focus; 44px minimum targets; sufficient contrast.

## 24. SEMANTIC STRUCTURE

```
<ContactSection>
  <ContactVisualStory />
  <ContactCard>
    <EmailBlock />
    <PrimaryContactCTA />
    <SecondaryContactLinks />
  </ContactCard>
</ContactSection>
```

Avoid one giant monolithic component.

## 25. REUSE EXISTING TOKENS

Inspect and reuse the existing navy, terracotta, cream, handwritten font, serif display font, card shadow and spacing tokens. No disconnected design system for Contact.

## 26. COPY TO USE (exactly)

CONTACT / Still curious? / Choose the easiest way to say hello ↓ / Email: tushar_pathak@outlook.com / Primary CTA: Email me → / Secondary: LinkedIn ↗, Resume ↓ / Sticky note: No forms. No funnels. Just say hello. / Handwritten: Waving from the window seat — the coffee’s usually on and I’m always up for a good conversation. / Footer note: Good conversations usually start with one message.

## 27. WHAT TO REMOVE

01 / 02 / 03 / 04 numbering; “Resume — updating”; long dashed list separators; repeated row-based contact layout; excessive empty space; generic pill-only structure. Contact methods must not look like sequential steps.

## 28. DESIRED FINAL FEEL

A postcard + a coffee-table note + a polished portfolio contact interface. “This feels personal and easy. I can just reach out.” Not “This is another contact section.”

## 29. BEFORE IMPLEMENTATION

Find the current Contact section component; identify email, LinkedIn and resume link sources; check spacing/typography tokens, paper textures/assets, existing clipboard-copy logic, whether Framer Motion exists, and mobile behavior. Present a concise implementation plan, then implement.

## 30. AFTER IMPLEMENTATION

Verify: email address correct; copy button and copied state work; mailto works; LinkedIn works; resume state valid; no “updating” copy remains; left/right balance improved; no giant dead space; mobile stacks correctly; animations subtle; keyboard focus works; no horizontal overflow; matches the rest of the portfolio. Summarize: files changed, component structure, copy-button behavior, contact link behavior, desktop layout, mobile layout, motion implementation, accessibility improvements, compromises.
