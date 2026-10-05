# Mockup brief — illustrated editorial portfolio (shared rules for every page mockup)

Read this whole file before writing a page. It is the contract every mockup must satisfy.

## 1. What we are making
Static HTML mockups (one file per route) of a portfolio redesign in a **warm editorial illustration + paper collage + hand-drawn annotation** style. Tushar (the owner) approved `home.html` as the direction: "this is very good". Every other page must feel like a page from the same journal.

Principle: **"A more human approach to an AI-driven world."** Narrative: **"Same curiosity. Bigger problems."**

Feel: human, thoughtful, warm, tactile, premium, editorial, personal, credible, product-led.
Not: corporate, generic SaaS, childish, scrapbook-chaotic, over-decorated, Pinterest collage, clay UI, dashboard grids, cards everywhere.

## 2. Source of truth for style — `home.html` (same folder)
Open it and reuse **verbatim**: the `:root` tokens, the `body` paper grain, `.eyebrow`, `.hand`, `.wrap`, the whole `.header` block (monogram SVG + wordmark + subline + serif nav with ink-stroke active state + navy pill "Let's connect →" + mobile menu button/JS), `.btn/.btn-primary/.btn-secondary`, `.torn/.torn-top` section transitions, `.sticky`, `.tape`, `.sketch`, `.notebook`, `.postcard`, `.footer`, the responsive breakpoints and the reduced-motion block. Then add page-specific styles below them. Do not restyle shared parts — consistency across pages is the point.

Tokens (exact): paper `#F7F1E7` · ivory `#FBF7EF` · paper-2 `#EFE7D8` · navy `#0D1735` · navy-2 `#2E3854` · rust `#B64927` · terracotta `#92381F` · forest `#214F43` · green-2 `#496D58` · steel `#63799E` · note `#EEDCA9` · kraft `#D7BE93`.
Fonts (Google Fonts link as in home.html): **Fraunces** (display, `font-variation-settings:"opsz" …,"SOFT" …`), **Inter** (body/UI), **Caveat** (handwritten — annotations, arrows, sticky notes, short quotes, CTA labels only; never body copy).
Type scale: section headlines 48–64px desktop / 40–52 mobile; body 16–17px; eyebrows 12px uppercase tracked.

**Footer (updated 2026-09-23, Tushar's request):** every page ends with the terracotta **band footer** (`<footer class="band">` — torn top, hatched texture, "Let's *build* something people can use.", hiring line, email + social circles, © bar). It is applied by `/Volumes/E Drive/Dev/.scratch/apply-footer.py <file>` which replaces `<footer class="footer">…</footer>`; copy the `<footer class="band">` block from `home.html` if writing by hand. On home it also replaces the old Final-CTA section.

Nav (header, same on every page): Home → `home.html`, Work → `work.html`, Thinking → `thinking.html`, About → `about.html`, Playground → `playground.html`; pill → `contact.html`. Mark the current page with `aria-current="page"`. Case-study links go to `case-study.html`; essay links to `essay.html`.

## 3. Layout principles
- One strong illustrated composition per page (the page's scene image), placed asymmetrically; generous whitespace; overlapping paper objects (taped photos, pinned index cards, sticky notes, notebook sheets, hand-drawn arrows/underlines) used **sparingly** — 2–4 per screen, never a wall of them.
- Avoid equal-width boxes and repeated card grids. Prefer editorial rhythm: a large opener, a numbered/annotated list, a pinned-notes cluster, a quiet closing CTA.
- Texture stays subtle: light grain, torn edges between sections (`.torn-top` with the next section's fill), soft paper shadows. No stains, no grunge.
- Use the page's scene image as a taped/pinned photograph or as a bleed with a soft cream mask edge (see `.hero-scene img` mask in home.html). Give it a handwritten caption.
- Every data-backed view shows a realistic *working* state. Where the real site shows a `Draft` badge, render a small handwritten "draft" tag; where data is missing (e.g. `Hero media coming`, `Deep dive coming`), render the placeholder honestly as a paper note — never fake media.

## 4. Copy — verbatim from `content-brief.md` (same folder)
The brief is a verbatim extraction of the live site's data files. **Use its strings exactly**: headings, taglines, metrics (value + label + as-of), status labels, dates, quotes, attributions, link labels. Do not invent metrics, projects, essays, awards, or claims. You may write short *handwritten annotations* (sticky-note asides, arrow labels, captions) of your own — keep them few, in Tushar's calm voice, and never make them factual claims. Keep the resume control exactly as the brief describes (`Resume — updating` → `contact.html#resume`).

## 5. Responsiveness + accessibility (mandatory)
- Works at 390px, 768px, 1024px, 1440px: no horizontal scroll, ≥16px side gutter, images `max-width:100%`, grids collapse to one column, handwritten sizes stay ≥17px.
- Landmarks: `<header>`, `<main>`, `<footer>`, one `<h1>`, sections with `aria-labelledby`. Decorative SVGs `aria-hidden="true"`. Meaningful alt text on the scene image. Visible focus (`:focus-visible` rule in home.html). Reduced-motion: no autoplaying motion beyond the small SVG draw-ins, and even those disabled in the media query.

## 6. Assets
Scene illustrations (JPEG, in `assets/`): `scene-work.jpg` (2048×1360, pinboard), `scene-casestudy.jpg` (2048×1360, reading corner with dog), `scene-about.jpg` (2048×1360, mountains horizon from behind), `scene-thinking.jpg` (2336×1744, writing at window), `scene-playground.jpg` (2048×1360, tinkering workbench), `scene-contact.jpg` (1792×2240 portrait, wave with coffee), `hero-scene.jpg` (home desk scene). Reference them with relative paths `assets/<file>` and include `width`/`height` attributes.

## 7. Process for each agent
1. Read this file, `home.html` (fully), and your route's `## /route` section(s) of `content-brief.md` plus `## Global`.
2. Write `mockups/<page>.html` (author page content only — no `<!doctype>`, `<html>`, `<head>`, `<body>` wrappers; start with `<title>` then `<link>` fonts then `<style>`, exactly like home.html).
3. Render once at 1440 and 390 with Playwright from the clay repo and look at both screenshots:
   `cd "/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay" && PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright" TMPDIR="/Volumes/E Drive/Dev/.scratch" pnpm exec playwright screenshot --browser=chromium --viewport-size=1440,900 --full-page --wait-for-timeout=2500 "file:///Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/mockups/<page>.html" "/Volumes/E Drive/Dev/.scratch/<page>-1440.png"` (and 390,844). Fix what the screenshots show (overflow, overlaps, illegible text, broken layout), re-render once to confirm, then stop — no polish loops.
4. A `PreToolUse` "Fact-Forcing Gate" hook may deny your first Write to a new file. When it does, state in your text: importers/callers (none — standalone mockup published as an artifact), affected API (none), data schemas (none; copy transcribed from content-brief.md), and the user's verbatim instruction ("Mock up the other pages first"), then retry the same Write.
5. Report: the file path, the screenshot paths, what sections you built in order, any copy you could not find in the brief (and what you did instead), and anything that looked off in the render that you could not fix.

Do not modify `home.html`, `content-brief.md`, this file, or anything under `Portfolio-clay*`.
