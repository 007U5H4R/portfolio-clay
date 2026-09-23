# Accessibility pass — semantic-structure evidence (TKT-48)

Automated substitute for a full manual screen-reader pass, dumped straight from the rendered DOM
of the production build (`pnpm build && pnpm start`) via a throwaway Playwright script (not
committed — the evidence below is its captured output). Covers the three routes the brief asked
for: `/`, `/work/teachspark` (both the default 30-sec view and with "Deep dive" expanded, since the
`OverviewToggle` swaps which subtree is mounted), and `/about`.

**Read this alongside `docs/reports/TKT-48.md`**, which has the full axe/keyboard/reduced-motion/
contrast results. This file is scoped to what a screen reader actually exposes: landmarks, heading
outline, `aria-current`/`aria-expanded`/`aria-controls`, live regions, and alt text.

A visibility filter (`Element.checkVisibility()`) was applied throughout — the raw DOM contains a
few elements that only ever render inside the closed `<dialog>` (MobileMenu's copy of the primary
nav, its own "Ask AI" row); those are correctly absent from a screen reader's tree while the dialog
is closed, so they're excluded here too. An earlier, unfiltered pass over-reported a duplicate
"Primary" nav landmark and a duplicate "Ask AI" control on every route — re-running with the
visibility filter showed both were exactly one real, AT-exposed instance each. Recorded here so the
false read isn't repeated.

## / (home)

**Heading outline:** `h1` "I turn ambiguity into AI-native products people can use." → `h2` "Ask my
portfolio" → `h2` "Featured work" → `h3` × 3 (TeachSpark / RailCite / Nuptis → Velora) → `h2` "How I
think" → `h2` "Building something AI-native? Let's talk." → `h2` "Still curious? Let's build what's
next." No skipped level.

**Landmarks:** `header` (banner) → `nav[aria-label="Primary"]` → `main` → `footer` →
`nav[aria-label="Footer"]`. One nav landmark visible at a time (desktop primary nav; the
MobileMenu's nav only exists inside its closed dialog, see above) — no duplicate-landmark ambiguity
for VoiceOver's rotor.

**`aria-current`:** the header's "Home" link carries `aria-current="page"`.

**`aria-expanded`/`aria-controls`:** the header "Ask AI" trigger (`aria-expanded="false"`, opens the
AskPanel dialog) and the six "How I think" node buttons (`aria-expanded="false"`,
`aria-controls="how-i-think-panel"`).

**Live regions:** one `role="status" aria-live="polite"` region (AskPanel's status announcer) —
empty at rest, populated only once an answer is announced; not an accessible-name gap, live regions
are correctly nameless.

**Images:** one `<img>` (hero avatar), `alt="Clay illustration of Tushar Pathak at a laptop"` —
descriptive, not filename/decorative-empty.

## /work/teachspark

**Default view (30-sec):** `h1` "TeachSpark" → `h2` "Still curious? Let's build what's next." (the
deep-dive chapters are unmounted, not just hidden, while "30-sec" is selected — `OverviewToggle`
swaps subtrees). Landmarks add `div[role=progressbar][aria-label="Reading progress"]`, a second
`header` (the case-study hero), and `div[role=radiogroup][aria-label="Case-study depth"]` with two
`role=radio` buttons ("30-sec" / "Deep dive").

**"Deep dive" expanded — heading outline (fixed by this ticket, see `QA-003` below):**
`h1` "TeachSpark" → `h2` "01 Context" → `h2` "02 Problem" → `h2` "03 Discovery" → `h2` "04 Product
bet" → `h3` "Capability, not dependency" → `h3` "WhatsApp as the distribution wedge" → `h2` "05 What
I built" → `h2` "06 Evaluation" → `h2` "07 Outcome" → `h2` "08 What I learned" → `h3` "Wave 1: trust
& clarity" → `h2` "Still curious? Let's build what's next." No skipped level in either direction.

Landmarks add `nav[aria-label="Chapters"]` (the ChapterNav) and three `svg[role=img]` pairs labelled
"Chosen"/"Rejected" (the DecisionCard icons).

**`aria-expanded`/`aria-controls`:** header "Ask AI", and — once expanded — "Show the thinking ↓"
(`aria-controls="show-the-thinking-panel"`, carries a `VisuallyHidden` "8-step reasoning chain,
expand to read" summary so the chain is discoverable before it's opened).

## /about

**Heading outline:** `h1` "Senior Product Manager. Product Thinker · AI Builder · Problem Solver." →
`h2` × 8 ("The product journey", "What I Bring", "Impact", "Where I've built", "Awards", "Research",
"Education", "Let's build what's next.") → `h2` "Still curious? Let's build what's next." No skipped
level.

**Landmarks:** same header/nav/main/footer/footer-nav shape as `/`.

**`aria-current`:** header's "About" link, `aria-current="page"`.

**`aria-expanded`/`aria-controls`:** header "Ask AI", plus four `ExperienceTimeline` role buttons
(Godrej / Quantiphi / Shellkode / American Express), each `aria-controls="experience-<company>"`.

**Images:** avatar `alt="Clay illustration of Tushar Pathak at a laptop"` (same as home).

## Finding fixed during this pass

**QA-003 — heading-outline skip on every deep-dive case study (h1 → h3, no h2).** `Chapter.tsx`
rendered each chapter's numbered heading as `<h3>` directly under the page's `<h1>`, with nothing at
`h2` — a genuine outline skip for a screen-reader user navigating by heading, present on all 11
personal case studies whenever "Deep dive" is selected. `DecisionCard.tsx`'s artifact title was
`<h4>` immediately under that `<h3>`. Fixed by promoting `Chapter` to `<h2>` and `DecisionCard` to
`<h3>` (both are sized by a CSS class bound to a design token, not by the tag, so there is no visual
change) — outline is now `h1 → h2 → h3` with no skip. Axe's default WCAG 2.1 AA ruleset does not
include the `heading-order` rule (it's a best-practice/moderate check, not a wcag2a/wcag2aa
conformance criterion), so this did not show up as an axe critical/serious failure before or after —
it was only visible from a real accessibility-tree read, which is exactly why this manual-substitute
pass exists. Commit: see `docs/reports/TKT-48.md`.

## What this pass does NOT verify — human VoiceOver spot-check needed

This is a DOM/accessibility-tree read, not a real screen reader. It confirms the tree a screen
reader *would* build from (roles, names, landmarks, heading order, state attributes, live regions,
alt text) is structurally correct, but it cannot confirm:
- What VoiceOver actually *announces* out loud for each of the above (wording, punctuation reading,
  rotor behaviour, landmark navigation feel).
- Real gesture/rotor navigation on macOS VoiceOver (Ctrl+Opt+arrows, rotor by heading/landmark/link,
  form-control announcements).
- Real focus-order *feel* during the AskPanel/MobileMenu focus traps (automated only proves focus
  never escapes to the page — a human ear should confirm the trap doesn't feel confusing).
- Whether "Show the thinking ↓" plus its visually-hidden summary reads naturally as one control.

**Turnkey action for Tushar:** run a real VoiceOver pass (Cmd+F5) on `/`, `/work/teachspark` (both
the 30-sec and Deep-dive states), and `/about` — walk the rotor by heading and by landmark, Tab
through the header nav → MobileMenu → AskPanel → ExperienceTimeline → OverviewToggle →
ShowTheThinking → CopyButton (`/contact`) flows listed in `docs/reports/TKT-48.md`'s keyboard-flow
matrix, and confirm announcements sound right. Nothing above is expected to fail — the automated
substitute found the tree is clean — but only a human ear can confirm the experience, not just the
structure.
