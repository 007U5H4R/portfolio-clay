# Custom product case-study system (Tushar, 2026-09-29, verbatim)

Ticket: TASK-130. Reference image: `railcite-case-study-reference.jpg` (the RailCite one-pager, the quality benchmark).

Tushar's message that came with this spec:

> i want you to run this task in cloud session. Make sure to create this type of case study page for all old and new onboarding products. Make sure whenever a user clicks on case study link a new tab should open for Case study not on the existing tab.

---

I want you to redesign ALL product case-study pages in my portfolio using the RailCite direction as the benchmark.

IMPORTANT:
Do NOT simply copy the RailCite visual design onto every product.

RailCite establishes the QUALITY BAR and CASE-STUDY STRUCTURE.

Each product must get its own:

- visual identity
- custom motifs
- color accents
- storytelling devices
- domain-specific illustrations
- product-specific interaction patterns
- evidence presentation
- architecture visualization

The system should feel cohesive across the portfolio while allowing every product to look meaningfully different.

## 1. PRIMARY GOAL

Build a reusable **Custom Product Case Study System**.

Each case study should be:

- one-page
- visually rich
- highly skimmable
- evidence-driven
- product-specific
- compact
- recruiter-friendly
- editorial
- tactile / handcrafted
- memorable

The case-study experience should combine:

product narrative + UX/product evidence + technical depth + visual storytelling + decision-making + outcomes / learnings

without reading like a PRD or project documentation archive.

## 2. CORE PRINCIPLE

Every case study should answer these questions quickly:

1. What was the problem?
2. Who experienced it?
3. What did Tushar build?
4. What was the important product decision?
5. How did the product work?
6. What evidence existed?
7. What happened?
8. What did Tushar learn?

If information does not exist for a product: DO NOT INVENT IT.

Adapt the page rather than filling gaps with generic claims.

## 3. SHARED CASE-STUDY STRUCTURE

Use this as the default skeleton:

01 HERO
02 PROBLEM
03 PRODUCT / EXPERIENCE
04 SYSTEM / DECISIONS / HOW IT WORKS
05 EVIDENCE / IMPACT / LEARNINGS
06 SOURCE / CTA FOOTER

However:

Do NOT force every product into exactly six visible blocks.

The structure should adapt based on the actual story.

Example:

- RailCite: Hero, Problem, Product, Trust Architecture, Learnings, Evidence
- TeachSpark: Hero, Teacher Problem, WhatsApp Experience, Activation Funnel, Experiment / Validation, Impact / Learning
- Vendor Passport: Hero, Vendor Onboarding Problem, Research / Discovery, Portable Identity Bet, Workflow / System, Experiment Results, Learnings

The narrative should follow the strongest story in the product.

## 4. ONE-PAGER RULE

Each case study should be designed as a compact one-page scroll experience.

Target: approximately 4–6 major sections.

Avoid:

- 8–12 chapter documentation pages
- huge walls of copy
- repeated explanations
- PRD-style prose
- long methodology sections

Target total public-facing prose: approximately 350–600 words per case study, excluding evidence drawer/modal.

## 5. CASE STUDY HERO

Every case study needs a strong custom hero.

Hero should include:

- product name
- product tagline
- one-sentence positioning
- 2–4 strongest proof metrics
- product screenshot/demo/poster
- optional project status/category

Use a split composition or custom layout appropriate to the product.

Do not use the same exact hero layout everywhere.

## 6. HERO COPY FORMAT

Use:

PRODUCT NAME

Short tagline

One-sentence product proposition

Then: 2–4 proof points

Example pattern:

- 5,760 documents indexed
- 68% PDFs OCR'd
- 0 invented citations

Do not overload with:

- role
- duration
- tech stack
- long metadata
- status caveats

Move minor metadata lower.

## 7. CUSTOM VISUAL IDENTITY

Each product must receive its own visual vocabulary.

Do NOT reuse one generic scrapbook aesthetic mechanically.

Create a product-specific art direction based on:

- domain
- user
- product behavior
- emotional context
- primary metaphor

## 8. EXAMPLE ART DIRECTIONS

### RailCite

Visual metaphor: railway field notebook / official circular archive

Use:

- railway lines
- tracks
- rust red
- steel blue
- official stamps
- clipped circular documents
- station markers
- engineering paper
- ticket-like artifacts

Tone: trust, precision, evidence, correctness

### TeachSpark

Visual metaphor: teacher's desk / classroom workbook

Use:

- notebook paper
- worksheet fragments
- WhatsApp chat bubbles
- teacher stamps
- colorful tabs
- pencils
- test-paper markings
- classroom doodles

Tone: warm, practical, fast, accessible

### Vendor Passport

Visual metaphor: passport + supply-chain onboarding dossier

Use:

- passport stamps
- identity cards
- vendor forms
- approval stamps
- folder tabs
- supply-chain arrows
- compliance checkmarks

Tone: enterprise, identity, verification, reuse

### Cubicle

Visual metaphor: office operating system / workbench

Use:

- retro office computer
- workflow diagrams
- task cards
- desk notes
- system state indicators

Tone: productivity, automation, coordination

### Tegaki

Visual metaphor: Japanese stationery / handwriting studio

Use:

- ink
- grid notebook
- brush lines
- torn notes
- minimal stamps
- handwriting samples

Tone: creative, quiet, crafted

### Velora

Visual metaphor: premium lifestyle journal / routine planner

Use:

- soft editorial photography
- routine cards
- moodboard
- warm gradients only if appropriate
- minimal paper overlays

Tone: aspirational, elegant, personal

## 9. NEVER FORCE THE SAME DECORATION

Do NOT put:

- pushpins everywhere
- torn paper everywhere
- stamps everywhere
- doodles everywhere

Choose only visual elements that support the product story.

Shared portfolio system:

- typography
- spacing
- evidence UI
- navigation
- interaction behavior
- accessibility

Product pages:

- visual metaphor
- illustration
- palette accents
- narrative composition

## 10. PROBLEM SECTION

Every case study should communicate the problem in one strong sentence.

Example RailCite:

"One wrong circular can damage an inspector's credibility."

The section should then support it with:

- one short context paragraph
- one visual workflow
- or one user journey
- or one evidence fragment

Do not use 4–5 paragraphs.

## 11. PROBLEM VISUALIZATION

Prefer diagrams over prose.

Possible formats:

- Before workflow
- Pain chain
- Manual process
- User journey
- Decision tree
- Quote card
- Failure-mode map

Example:

```
Input
↓
manual step
↓
handoff
↓
error risk
↓
outcome
```

## 12. PRODUCT SECTION

Show the product early.

Do not wait several sections before showing UI.

Use:

- real screenshot
- demo loop
- interactive mock
- animated flow
- product-state comparison

This section should answer:

"What does the user actually do?"

## 13. BEFORE / AFTER

Where appropriate, show:

- BEFORE: manual / fragmented workflow
- AFTER: new product experience

Keep this visual.

Do not write a long transformation paragraph.

## 14. PRODUCT DECISION SECTION

Every case study should highlight 1–3 important product decisions.

Examples:

- RailCite:
  - refuse rather than hallucinate
  - validate citations in code
- TeachSpark:
  - WhatsApp instead of new app
  - classroom-ready output over generic prompting
- Vendor Passport:
  - reusable identity over repeated onboarding

Show these as:

- decision cards
- trade-off cards
- "we chose X over Y"
- hypothesis → decision → consequence

## 15. TRADE-OFF DESIGN

Use a simple decision format:

```
WE COULD HAVE
Generic chatbot

WE CHOSE
Cite-or-refuse

BECAUSE
Trust mattered more than answer rate
```

This is more useful to PM reviewers than generic process descriptions.

## 16. SYSTEM / ARCHITECTURE SECTION

When a product has meaningful technical complexity: show a compact visual architecture.

Avoid giant engineering diagrams.

Use 5–8 steps maximum.

Example:

```
User
→ retrieval
→ validation
→ model
→ output
```

Use plain language where possible.

## 17. TECHNICAL DEPTH

The architecture should prove technical product fluency without becoming an engineering design document.

Show only the parts that influence:

- user experience
- trust
- latency
- quality
- scalability
- product decisions

## 18. EVALUATION / EVIDENCE

If product has evals: make them visible.

Possible:

- benchmark result
- failure-rate
- activation
- accuracy
- threshold calibration
- refusal behavior
- qualitative interviews

Use evidence cards rather than long explanation.

## 19. IMPACT

Only show supported outcomes.

Separate:

- MEASURED
- OBSERVED
- SELF-REPORTED
- STRUCTURAL

Example visual badge system:

- ● Measured
- ◐ Self-reported
- ◇ Structural
- ○ Prototype

Use this consistently throughout all case studies.

## 20. METRIC QUALITY

Do not show weak engineering metrics as headline product outcomes.

Examples that usually belong lower:

- bundle size
- unit test count
- line count

Prioritize:

- activation
- adoption
- time saved
- answer quality
- error reduction
- completion
- decision accuracy
- user behavior

## 21. LEARNINGS SECTION

Keep only 2–4 strongest learnings.

Each learning:

- short title
- one sentence
- optional tiny evidence note

Example:

Refusal is a feature.
A wrong authoritative answer is worse than no answer.

Do not use long retrospective prose.

## 22. EVIDENCE DRAWER

Do not expose all evidence artifacts inline.

Use a compact section:

```
Evidence behind this case study

[ PRD ]
[ Design ]
[ Evals ]
[ Research ]
[ Architecture ]
[ Build Ledger ]

[ View all evidence → ]
```

Click opens: drawer / modal / expanded section.

## 23. SOURCE TRANSPARENCY

Inside evidence drawer show:

- artifact title
- artifact type
- date/version if available
- what claim it supports

Example:

Threshold Calibration
Evaluation
Supports: retrieval threshold 0.45 → 0.32

## 24. CASE STUDY NAVIGATION

Add a compact sticky case-study navigator where useful.

Example:

Problem · Product · Decision · System · Impact

Do not make it visually heavy.

On mobile: hide or collapse.

## 25. CUSTOM SECTION MOTIFS

Each case study may use a custom progression motif.

Examples:

- RailCite: railway line with station stops
- TeachSpark: notebook tabs / lesson markers
- Vendor Passport: passport journey stamps
- Cubicle: workflow state line
- Tegaki: ink stroke progression

Use these only if they strengthen orientation.

## 26. ANIMATION

Use motion to reinforce the product metaphor.

- RailCite: rail line draws between sections
- TeachSpark: worksheet tabs slide / stamp settles
- Vendor Passport: passport stamps animate in

Do not animate constantly.

Use:

- viewport-triggered
- subtle
- one-time
- purposeful

## 27. NO GENERIC ENTRANCE ANIMATION

Avoid applying the same fade-up, fade-up, fade-up to every section.

Use product-specific animation sparingly.

## 28. GLOBAL TYPOGRAPHY

Maintain portfolio-wide typography hierarchy.

Use:

- editorial serif for major headings
- clean readable body type
- handwritten type only for annotations

Do not use handwritten fonts for critical body content.

## 29. GLOBAL COLOR SYSTEM

Use the portfolio's base:

- cream / paper
- deep navy
- terracotta

Then add 1–3 product-specific accent colors.

Do not reinvent the whole design system per page.

## 30. PAGE DENSITY

Every section should have one primary message.

Avoid:

- four cards
- two diagrams
- three quotes
- long paragraph

all in the same section.

Use white space.

## 31. REMOVE DEVELOPMENT COPY

Never publicly display:

- Hero media coming
- Placeholder
- Draft
- Pending sign-off
- TODO
- coming soon
- stand-in illustration

If content is unavailable: redesign around what is available.

## 32. REMOVE DUPLICATION

If a metric appears in hero: do not explain it again in full later unless needed.

If architecture explains refusal: do not repeat another full refusal section.

Trim aggressively.

## 33. ROLE / CONTRIBUTION

Do not use a giant generic "My Role" paragraph.

Instead weave contribution into relevant sections.

Example:

- Decision: "I set the cite-or-refuse product constraint…"
- Research: "I tested…"
- Build: "I designed…"

Use first-person sparingly and evidence-first.

## 34. MOBILE

Mobile must remain a real case study, not a compressed desktop page.

Simplify:

- fewer decorative assets
- stacked diagrams
- swipeable evidence cards
- no overlapping objects that hurt readability

## 35. PERFORMANCE

Lazy load:

- large screenshots
- videos
- non-critical visual assets

Use optimized responsive images.

Avoid loading all animations immediately.

## 36. ACCESSIBILITY

Ensure:

- real text remains text
- diagrams have labels/alt summaries
- animations respect reduced motion
- contrast remains readable
- keyboard access works
- evidence drawer is accessible
- videos are captionable

## 37. CASE STUDY DATA MODEL

Create a reusable case-study schema.

Conceptually:

```
{
  id,
  name,
  tagline,
  proposition,

  theme: {
    metaphor,
    accentColors,
    motif
  },

  hero: {
    media,
    metrics
  },

  problem: {
    headline,
    context,
    visualization
  },

  product: {
    media,
    summary
  },

  decisions: [],

  architecture: {...},

  evidence: [],

  outcomes: [],

  learnings: [],

  links: {
    product,
    github,
    prd,
    demo
  }
}
```

Do not hardcode entire pages independently if avoidable.

## 38. COMPONENT SYSTEM

Build reusable primitives such as:

- `<CaseStudyHero />`
- `<MetricCard />`
- `<ProblemFlow />`
- `<DecisionCard />`
- `<SystemFlow />`
- `<EvidenceCard />`
- `<LearningCard />`
- `<EvidenceDrawer />`
- `<CaseStudyCTA />`

Then allow custom product-specific components for major visual moments.

## 39. DO NOT OVER-TEMPLATE

This is important.

Reusable components should create consistency.

They must NOT make every page look identical.

A product can override:

- hero composition
- visual motif
- section order
- illustration
- diagram type
- accent palette

## 40. PRODUCT-SPECIFIC AUDIT BEFORE DESIGN

Before redesigning each product page: inspect all available product content.

Identify:

1. strongest problem
2. strongest product decision
3. strongest evidence
4. strongest measurable outcome
5. most interesting technical system
6. most memorable learning
7. available screenshots/videos
8. available PRDs/research/evals

Then design the page around those facts.

Do not start from the template first.

Start from the story.

## 41. STORY SELECTION RULE

Each case study should have ONE dominant narrative.

Examples:

- RailCite: TRUST
- TeachSpark: TRANSFER AI INTO REAL CLASSROOM WORK
- Vendor Passport: REUSABLE VENDOR IDENTITY
- Velora: KILLING THE WRONG BET / PIVOT

The visual design should reinforce this narrative.

## 42. PRODUCT-SPECIFIC UI

The product UI shown inside each case study should use actual product screenshots where available.

Do NOT redraw the product UI unnecessarily.

Use illustration primarily for:

- framing
- narrative
- metaphor
- diagrams

## 43. CASE STUDY ENDING

Finish each page with a compact action strip.

Possible:

[ Live Product ] [ Demo ] [ GitHub ] [ PRD ]

Then: next project navigation.

Do not add a giant generic "Let's connect" section after every case study.

## 44. RAILCITE AS QUALITY REFERENCE

The RailCite one-pager visual direction is the quality benchmark.

Retain these principles:

- strong custom visual metaphor
- clear numbered narrative
- product screenshots early
- concise copy
- architecture as visual
- evidence visible
- learnings reduced to strongest three
- proof metrics prominent
- source artifacts collapsed
- custom thematic styling

But do NOT copy:

- rail tracks
- railway stamps
- train graphics
- railway colors

onto other products.

## 45. FIRST PRODUCTS TO REDESIGN

Start with these case studies:

1. RailCite
2. TeachSpark
3. Vendor Passport / apparel onboarding
4. Cubicle
5. Tegaki
6. Velora

If another product has an existing case-study page, inspect it before deciding whether it needs this system.

## 46. TEACHSPARK DIRECTION

Dominant story: getting useful AI into a teacher's existing workflow.

Hero: WhatsApp + worksheet/classroom visual

Potential proof:

- joined users
- activation
- time saved

Problem: teachers are time-poor and generic AI does not transfer cleanly into classroom tasks.

Product: WhatsApp-first worksheet/question-paper generation.

Potential visual flow:

```
Teacher
↓
WhatsApp
↓
Choose grade/topic
↓
Generate
↓
Use in class
```

Impact: show funnel if supported.

## 47. RAILCITE DIRECTION

Dominant story: trust.

Use:

- railway-field-notebook visual
- refusal state
- citation validator
- supersession
- freshness

Keep the current one-page direction.

## 48. VENDOR PASSPORT DIRECTION

Dominant story: onboarding friction is largely waiting, verification, and repeated truth collection.

Visual: passport / verification / onboarding file.

Potential structure:

```
Problem
↓
Research
↓
Insight
↓
Bet
↓
Portable identity
↓
Experiment
```

Use actual research/evidence available.

## 49. VELORA DIRECTION

Dominant story: good product management can mean killing the original idea.

Use a strong pivot visual:

```
Nuptis
✕
↓
evidence
↓
decision
↓
Velora
```

This should be one of the most visually memorable pages.

## 50. CASE STUDY REVIEW CHECKLIST

Before completing each case study ask:

- Can someone understand the problem in 10 seconds?
- Is the product visible above the fold?
- Is the strongest decision obvious?
- Is there evidence?
- Is the page skimmable?
- Is any paragraph unnecessary?
- Does the page feel specific to this product?
- Does this look like a PM case study or documentation?
- Is the UI beautiful enough to stand alone visually?
- Does every decorative element support the story?

If not: keep refining.

## 51. IMPLEMENTATION PROCESS

Work product-by-product.

For each product:

- STEP 1: Audit existing case study and source files.
- STEP 2: Produce a short proposed narrative: Problem, Product, Decision, Evidence, Learning.
- STEP 3: Choose the product-specific visual metaphor.
- STEP 4: Propose section structure.
- STEP 5: Identify text to delete / shorten.
- STEP 6: Implement.
- STEP 7: Compare against RailCite quality benchmark.

Do not redesign all pages blindly in one batch without understanding their content.

## 52. DO NOT INVENT CONTENT

This is critical.

Only use supported project information.

Never invent:

- metrics
- research findings
- users
- conversion
- outcomes
- technical architecture
- experiments
- client claims
- dates

If information is missing:

- omit that element
- or mark internally as data needed.

Do not put placeholder language on the public page.

## 53. FINAL DELIVERABLE

After implementing the system, report:

1. shared case-study components created
2. case-study schema
3. product-specific theme system
4. pages redesigned
5. copy removed from each page
6. custom assets created
7. diagrams created
8. evidence sources used
9. responsive behavior
10. remaining products requiring source information
