# Accessibility pass: reading order (M-009, TKT-90c · S90.03 · TC-175 step 5)

> This supersedes the M-007 clay-era pass (TKT-48: semantic-structure evidence for the old avatar hero, the footer nav and the
> "Still curious?" CTA sections, all now removed). That version is in git history: `git show ff806f5:docs/a11y-pass.md`.

**Method.** I built production (`pnpm build && pnpm start`) on `ff806f5` + TKT-90c. Chromium 1440×900 with default motion.
The accessibility tree is captured with Playwright `locator("body").ariaSnapshot()`. Playwright 1.63 has no
`page.accessibility.snapshot()`, and the ARIA snapshot is its replacement. Each page was captured 500 ms after `load`,
with no scrolling. I also captured the first 40 Tab stops. The raw captures are in
`/Volumes/E Drive/Dev/.scratch/m009/tkt90c/{aria_*.yaml,tab_*.txt}`.

**What this is not.** It is not a VoiceOver session. Stage 8 still does the real VoiceOver pass (Safari + VO, rotor
headings/landmarks). This file tells that pass what to expect and where to look. Findings are numbered
`A11Y-n` so Stage 8 can promote them to `QA-###`. I fixed nothing (TKT-90c is test-and-document only).

## Shared chrome (every route)
Order: skip link → `banner` (home link "Tushar Pathak — home", `navigation "Primary"` with 5 links, "Let's connect" pill,
"Ask AI" button) → `main` → `contentinfo` (the band). The band is the only footer, and its name is the band h2
"Let's build something people can use.". Tab order matches the visual order. The skip link is stop 1, and focus wraps
to `body` after the last band link.

## `/`
1. **Hero** `region` named by the h1. Order: banner `img` (full `hero-banner` alt, Dev-23) → eyebrow → **h1** "I turn
   ambiguity into AI-native products people can use." → support paragraph → "View my work →" → "Ask my portfolio". The
   poster, clip, polaroids and postmark are absent from the tree, as intended (`aria-hidden`, `alt=""`).
   Screen-reader users hear the long alt before the h1. This is acceptable because the h1 is the first heading, so rotor navigation lands on it directly.
2. **Featured work** `region` "Real problems. Real products." has three `article`s. Each card is one link named by its
   project ("TeachSpark", "RailCite", "Nuptis → Velora"), and the card copy is read inside the link. There is one Tab stop per card.
3. **How I think**: `region` "A product journey, not a process." has the eyebrow, h2 and lead, then a `list` of 6 **empty
   `listitem`s**. See **A11Y-1**.
4. **Ask**: `region` "Ask my portfolio". Label + textbox → "Ask" submit → microcopy → `list "Suggested questions"` with
   5 buttons. The Tab order is input → submit → 5 chips.
5. **Band** (see chrome). The DraftTag "Draft — pending sign-off" is read inline after the hiring line, which is correct.
   The tagline's `Source: Tushar Pathak` is sr-only (Dev-20).

## `/work/teachspark`
1. Opener `figure` + `img` (the `scene-casestudy` alt) comes before the `article`. Inside the article: `region "TeachSpark"`
   with the breadcrumb ("Work" link + "Case study") → **h1** "TeachSpark" → lead → meta ("Role: Solo build · Duration ·
   status · Hero media coming").
2. `region "Headline metrics"`: a list of 3. Each item is read as value → label → context → "Measured/Self-reported as of …
   Source: …", so the metric kind is announced in words, not by colour alone.
3. `region "Case-study overview"`: h2 → `radiogroup "Case-study depth"` (30-sec checked / Deep dive) → help line → the 30-sec
   body. There is **one Tab stop for the group** (roving; arrow keys switch), which is correct.
4. **Deep dive** (after picking "Deep dive"): a `region "Deep dive"` → `navigation "Chapters"` (8 links "01 Context" …
   "08 What I learned") → 8 chapter `region`s, each named by its "0n Title" h2, in order. Artifacts are read in their
   chapter: insight `figure` (named by its cite) + `blockquote`, hypothesis, decision (h3), doc (h3), metric, experiment
   (list), evaluation (`term`/`definition` pairs). See **A11Y-3** and **A11Y-4**.
5. `region "What I learned"` → 4 list items with their "01…04" numerals; then `region "Where every line on this page comes
   from"` → 10 sources.
6. `region "Next project"` → one link "Next project: RailCite" that contains the h2 "RailCite". This region sits outside the
   `article`, which is correct because it is navigation, not case-study content.

## `/about`
1. Opener `figure` + `img` (the `scene-about` alt) → `region` named by the **h1** "I started with machines. Then systems. Then
   people. Now, intelligent products." → DraftTag → `list "Three quick facts"` (3) → "counted from 2016…" note →
   quote `figure` (`blockquote` + sr-visible "Source: Tushar Pathak" + DraftTag).
2. `region "Different tools. Same curiosity."` (product journey): h2 → lead → a list of **4 empty `listitem`s** → closing
   line. See **A11Y-1**.
3. `region "What I Bring"`: 4 `article`s (Product, AI & GenAI, Technology, Execution), each an h3 + list.
4. `region "Impact"`: `list "Shipped-product evidence"` with 8 `article`s. Each is read as value → label → context → "●
   Measured/Self-reported/Structural as of …" → Source (a link for the live RailCite stats). Then h3 "From my résumé" →
   3 grouped lists → "● Self-reported as of 15 Sep 2026". See **A11Y-2**.
5. `region "Where I've built"`: 4 list items (company, dates, then an `article` with h3 + `term`/`definition` pairs, with
   outcomes as nested lists) → awards / research / education → the page CTA "Let's talk →" → band.
6. Tab order: chrome → the 2 RailCite source links → patent record → DOI → "Let's talk" → "Resume — updating" → band.
   All 4 external links say "(opens in new tab)".

## Findings for Stage 8 (not fixed here; owner in brackets)

| id | Severity | What | Where | Suggested fix |
|---|---|---|---|---|
| A11Y-1 | **Medium** | `Reveal` hides content with `visibility: hidden` until it scrolls into view. The **How I think** stages (6) on `/` and the **product journey** (4) on `/about` are **absent from the accessibility tree on load**: their `listitem`s are empty, and their h3s are missing from the VoiceOver rotor / heading list until the user has scrolled past them. A screen-reader user who jumps by heading from the top never reaches them. Reduced motion does not change this. The `.reveal` rule keeps `visibility: hidden` until `data-revealed`. | `app/globals.css` base `.reveal` (A6) · `components/interactions/Reveal.tsx` · used by `components/home/HowIThink.tsx`, `components/timeline/ProductJourney.tsx` | Keep the content in the tree. Either drop `visibility: hidden` and hide only visually (opacity + `pointer-events: none`), accepting the axe false-positive note in the rule comment, or reveal immediately under reduced motion and when focus or a virtual cursor enters (`focusin`). Re-run EVAL-006 axe after the change. [integration / Stage 8] |
| A11Y-2 | Low | The kind-badge dot "●" is plain text, so VoiceOver reads "black circle, Measured as of …". | `/about` Impact cards + résumé footnote (`components/about/Impact.tsx`) | `aria-hidden` on the dot span; the word already carries the meaning. [TKT-86 owner] |
| A11Y-3 | Low | The insight `figure` starts with a bare "“" text node (the decorative opening quote), so it is read aloud as "left double quotation mark". | every insight artifact (`components/case-study/artifacts/*Insight*`) | Make the glyph `aria-hidden` or a CSS `::before`. [TKT-83 owner] |
| A11Y-4 | Low | The decision artifact's "Why:" label runs into its sentence ("Why:The white space…"), with no space in the text, so it is read as one word. | `/work/*` decision artifacts | Add a space (or `margin` + a real space) after the label. [TKT-83 owner] |
| A11Y-5 | Info | The `/about` "Where I've built" lead says "open any node for the context…", but every story card is always open (Dev-11). The copy is verbatim from `data/*.ts` (D7). | `/about` experience lead | Content call for Tushar: update the data string or accept it. [content] |

The empty tree also explains why EVAL-006 axe stays green on these sections: hidden content is never audited until it is
revealed. The axe runs in `about.spec.ts` / `how-i-think.spec.ts` scroll first, so they do audit the revealed state.
