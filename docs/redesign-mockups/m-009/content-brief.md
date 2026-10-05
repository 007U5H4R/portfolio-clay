# Content Brief — Portfolio-clay, verbatim extraction for HTML mockups

**Source repo (read-only):** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/`
**Extracted:** 2026-09-23, from `data/*.ts`, `app/**/page.tsx`, `components/**`, `lib/site.ts`, `lib/nav.ts`, `lib/anchors.ts`, `lib/filters.ts`, `lib/format.ts`, `app/globals.css`, `SITEMAP.md`, `CONTENT_INVENTORY.md` §1–§7.

**Rules used in this document**

- Every string in a fenced block or in backticks is quoted **exactly** as it appears in the source. Nothing is paraphrased, tidied, or "improved". Typographic characters (`–`, `—`, `…`, `→`, `≈`, `≥`, `×`, curly quotes) are preserved.
- `status: VERIFIED | DRAFT` and `source:` fields are carried wherever the data declares them. The site's own convention (CONTENT_INVENTORY.md): **VERIFIED** = quoted/derived from a cited artifact · **DRAFT** = composed only from VERIFIED facts but not yet signed off by Tushar (the UI renders a `Draft` badge) · **MISSING** = no source exists (a visible placeholder is rendered, never a fabrication).
- Where a component *computes* rendered text from data (e.g. `formatRange`, `formatAsOf`, template strings), the computed output is shown and the rule is noted.
- `SourceRef.label` is the only source field the UI ever renders; `SourceRef.ref` (an inventory path) is never shown publicly. Labels are quoted here; refs are included only where they help the designer judge provenance.

**Files not found / not applicable:** none of the requested files were missing. `public/media/` does not exist in the repo (the two Nuptis `prototype` artifacts reference `/media/nuptis/*.jpg` with `kind: "placeholder"`, so the UI renders a labelled placeholder tile, never an `<img>`). Two data fields are defined but **not rendered by any component**: `hero.tagline` (`"Observing what others overlook."`) and every project's `learnings[]` — both are listed below and flagged.

---

## Global

### Site identity constants (`lib/site.ts`)

```
site.name            = "Tushar Pathak"
site.title           = "Senior Product Manager"
site.tagline         = "Product Thinker · AI Builder · Problem Solver"
site.email           = "Tushar_Pathak@outlook.com"
site.linkedin        = "https://www.linkedin.com/in/pathaktushar"
site.github          = "https://github.com/007U5H4R"
site.priorSite       = "https://tushar-pathak.vercel.app/"
site.resumeAvailable = false
site.avatarAlt       = "Claymorphic portrait of Tushar Pathak, arms crossed in a grey blazer"
```

`site.tagline` is used only as the `<meta description>` for `/` and the root layout, and as the eyebrow of the home OG image. It is not rendered in the page body.

### Resume control — `resumeAction()` (`lib/site.ts`) — single source of truth for every resume affordance

```ts
if (site.resumeAvailable) {
  return { label: "Download Resume ↓", href: "/resume.pdf", download: true };
}
return {
  label: "Resume — updating",
  href: "/contact#resume",
  download: false,
  note: "Sanitised resume coming — email me for a copy",
};
```

**Current live state:** `resumeAvailable` is `false`, so every resume button on the site (Hero, MobileMenu, Footer, FinalCTA, `/about` foot, `/contact`) renders the label `Resume — updating`, links to `/contact#resume`, and carries `title="Sanitised resume coming — email me for a copy"`. Only `/contact` renders the note as visible text; elsewhere it is a tooltip.

### Primary navigation (`lib/nav.ts`) — header

Exactly four items. `Playground` and `Contact` are deliberately **not** in the header (decision E-9); they are reached via footer/CTAs only.

```
Home      → /
Work      → /work
Thinking  → /thinking
About     → /about
```

### Footer navigation (`components/layout/Footer.tsx`, footer-only order)

```
Work      → /work
Thinking  → /thinking
About     → /about
Contact   → /contact
```

### Header (`components/navigation/Header.tsx`) — sticky, 96px rest → 68px compact on scroll

Rendered left → right:

1. Brand link → `/`: a 40px utility `ClayTile` containing the monogram `TP` (aria-hidden), then a two-line wordmark: `Tushar Pathak` (14px semibold) over `Senior Product Manager` (12px, hidden below 768px).
2. `<nav aria-label="Primary">` (≥768px only): the four nav items; active item gets a lavender `NavPill` behind it and `aria-current="page"`.
3. `AskAIButton` (≥768px): secondary `ClayButton` with a Sparkles icon and the label `Ask AI` (`aria-haspopup="dialog"`).
4. `MobileMenu` trigger (<768px): icon-only ghost button, `aria-label` = `Open menu` / `Close menu`.

### Mobile menu (`components/navigation/MobileMenu.tsx`) — full-screen native `<dialog aria-label="Site navigation">`

- Top-right icon-only close button, `aria-label="Close menu"`.
- `<nav aria-label="Primary">` with the four nav items at 18px, 56px rows.
- Bottom row, above a hairline: `AskAIButton` (`Ask AI`) and the resume `ClayButton` (`Resume — updating`).

### Ask AI panel — global slide-over (`components/ai/AskPanel.tsx`; opened from the header/mobile `Ask AI` button)

Native `<dialog aria-modal="true">`. ≥1440: right drawer 480px · 768–1439: right drawer 400px · <768: bottom sheet 90vh. Backdrop dims the page 20%.

```
Heading (h2):            Ask AI
Close button aria-label: Close Ask panel
Input label (sr-only):   Ask about my work
Input placeholder:       Ask about my work…
Submit button aria-label: Ask
```

Body = `AnswerView` (see below) seeded with the **6 panel prompts** (in `data/knowledge.ts` order):

```
What makes Tushar a product manager?
Show enterprise experience
Strongest product skills
What did you learn when an assumption failed?
How do you evaluate an AI product?
What is your research background?
```

### AnswerView — shared body for both Ask surfaces (`components/ai/AnswerView.tsx`, `lib/ask/local-provider.ts`)

Five states. Every answer string is byte-identical to its `data/knowledge.ts` entry (no live LLM; deterministic keyword match, threshold 0.34).

| State | Rendered copy |
|---|---|
| idle | Microcopy: `Answers come from this portfolio's content — nothing generated.` then `SuggestedPrompts` (a `<ul aria-label="Suggested questions">` of `ClayPill variant="filter"` chips). |
| loading | `role="status" aria-busy="true"`; sr-only text `Looking through the portfolio…`; two shimmer bars. |
| answer | h3 `Answer` (focus target) + a `Draft` badge when the matched entry is `draft: true` (all 11 are) · the answer text (≤65ch) · `EvidenceLinks` (`<ul aria-label="Sources">` of `ClayPill variant="link"` pills with a trailing arrow; external ones open in a new tab) · the microcopy line again · ghost button `Ask another`. |
| empty | `I only answer from the sourced facts on this site — try one of the prompts, or email me.` then up to 3 fresh suggested prompts. (`FALLBACK`, source: CONTENT_INVENTORY §1.3, DRAFT) |
| error | Blush surface with an alert icon: `Something went wrong finding that answer. Please try again.` + secondary button `Try again`. The microcopy line is never shown in error. |

### Ask knowledge base — all 11 entries verbatim (`data/knowledge.ts`; every entry `draft: true`; provenance `inventory: "§9"` unless noted)

**home surface (5)**

```
id: built
prompt: What products have you built?
answer: Since August 2026 I've shipped TeachSpark (a WhatsApp bot that generates differentiated worksheets for Indian K–12 teachers), RailCite (a cite-or-refuse assistant over Indian Railways circulars), and two vendor-onboarding products, Nuptis and Velora, in nine days. Smaller live builds include Tegaki, Pratyasa, a PWA arcade cabinet and a scroll-film portfolio. Cubicle, a multi-agent "AI team", is built but not yet launched.
evidence: TeachSpark → /work/teachspark · RailCite → /work/railcite · Nuptis → Velora → /work/velora
sources (labels): TeachSpark README · RailCite Discovery PRD · Nine-day build series · Cubicle QA report
```

```
id: discovery
prompt: How do you approach product discovery?
answer: I start from a real person and a specific moment — a Sanskrit teacher's evenings, a CCI defending a demurrage decision — then write the hypothesis down with its confidence level before building. In the vendor-onboarding work every claim was tagged [Known]/[Observed]/[Hypothesized]/[Validated]/[Unknown], and in TeachSpark eight assumptions were listed with type and risk before a line of code. When the evidence says kill it, I kill it — Nuptis died on day seven.
evidence: Velora — Discovery → /work/velora#03-discovery · TeachSpark — Discovery → /work/teachspark#03-discovery · Thinking notes → /thinking
sources (labels): TeachSpark pitch · Apparel Vendor Onboarding Discovery PRD
```

```
id: ai-products
prompt: What AI products have you worked on?
answer: TeachSpark uses Claude Sonnet 5 with structured outputs, vision on teacher-sent photos and a second QC pass to produce worksheets and question papers over WhatsApp. RailCite is a retrieval system over 5,700+ government PDFs (Voyage-3 embeddings, pgvector) with extractive Claude synthesis and a validator that drops any uncited claim. At American Express I led the integration of Devin GenAI into the MARS platform.
evidence: TeachSpark — What I built → /work/teachspark#05-what-i-built · RailCite — What I built → /work/railcite#05-what-i-built · Experience → /about#experience
sources (labels): TeachSpark question-paper adapter · RailCite citation validator · Résumé
```

```
id: most-technical
prompt: Show me your most technical project.
answer: RailCite: a Next.js + Supabase/pgvector RAG pipeline that ingests and OCRs thousands of scanned railway circulars nightly, classifies query domain with Haiku, retrieves k=8 above a calibrated 0.32 threshold, and forces Claude into an `answered|refused` tool schema whose citations are validated before display. It runs live with 5,760 documents and 14,406 chunks (as of 15 Sep 2026) and 345 passing tests.
evidence: RailCite → /work/railcite · railcite.vercel.app → https://railcite.vercel.app · RailCite — Evaluation → /work/railcite#06-evaluation
sources (labels): RailCite query route · RailCite threshold calibration
```

```
id: impact
prompt: What impact have you created?
answer: At American Express I own the migration roadmap for 35+ Accounts Receivable capabilities — 180+ stories across four Agile teams — with a 30% reduction in feature delivery cycle time (self-reported). TeachSpark's first-week pilot (24 Aug 2026, test handsets excluded) took 17 teachers onto WhatsApp, activated 8, and saved a median 37.5 minutes per teacher by their own report. RailCite keeps 5,760 government documents searchable with zero invented citations by construction.
evidence: Impact → /about#impact · TeachSpark — Outcome → /work/teachspark#07-outcome · RailCite — Outcome → /work/railcite#07-outcome
sources (labels): Résumé · TeachSpark Final PRD §7 · RailCite citation validator
```

**panel surface (6)**

```
id: pm
prompt: What makes Tushar a product manager?
answer: 7+ years across product and delivery — Godrej Smartnet, Quantiphi's GCP programs, Shellkode, and now Senior Product Manager at American Express — plus a habit of building the thing myself to test the idea. I write the hypothesis before the feature, publish smaller honest numbers over bigger fake ones, and design refusal as a success state when trust is the product.
evidence: About → /about · Thinking notes → /thinking · Work → /work
sources (labels): Résumé (2016–present) · TeachSpark 9-day build series · RailCite Design.md
```

```
id: enterprise
prompt: Show enterprise experience
answer: American Express (via IntraEdge), 2026–present: Senior PM for Accounts Receivable, migrating 35+ capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform and championing Devin GenAI adoption. Quantiphi (2022–26): GCP programs including DynamoDB→Cloud Spanner migrations and HIPAA-compliant healthcare data migration. Godrej Infotech (2016–18): Assistant PM on the Smartnet platform, 12 features in 11 months.
evidence: Experience → /about#experience · Work — Enterprise → /work?filter=enterprise
sources (labels): Résumé
```

```
id: skills
prompt: Strongest product skills
answer: Discovery and hypothesis framing (confidence-tagged PRDs, assumption tables), AI product design where trust is the feature (cite-or-refuse, QC passes, honest instrumentation), and enterprise delivery at scale (roadmaps across four Agile teams, program governance on GCP/AWS).
evidence: Capabilities → /about#capabilities · RailCite → /work/railcite · TeachSpark — Evaluation → /work/teachspark#06-evaluation
sources (labels): Résumé — Core Competencies · RailCite Design.md · TeachSpark Final PRD
```

```
id: learned
prompt: What did you learn when an assumption failed?
answer: When I added an `is_test` flag to TeachSpark and excluded my own handsets the day before submission, activated teachers dropped from 10 to 8 and median time saved fell from 37.5 minutes to 30 — I shipped the smaller, honest number. On the vendor-onboarding work I killed Nuptis on day seven when it had no real pilot data and rebuilt it as Velora. And RailCite taught me that staleness is a correctness bug, not a missing feature — I recalibrated its retrieval threshold from 0.45 to 0.32 against real queries.
evidence: TeachSpark — Evaluation → /work/teachspark#06-evaluation · Velora — Outcome → /work/velora#07-outcome · RailCite — Evaluation → /work/railcite#06-evaluation
sources (labels): TeachSpark 9-day build series (Post 9) [§8.1] · Nine-day build series (Day 7) [§8.4] · RailCite build ledger [§8.2]
```

```
id: evaluate
prompt: How do you evaluate an AI product?
answer: I define what “good” means before building, then measure against it. RailCite calibrated its retrieval threshold on 5 relevant and 3 irrelevant queries, validates every citation so any uncited claim is dropped, and treats refusal as a first-class success state; its citation validity is 100% by construction — a structural guarantee, not a measured score. TeachSpark ran phase-by-phase QA gates with 32 event types of pilot instrumentation, and I excluded my own test handsets before reporting activation.
evidence: RailCite — Evaluation → /work/railcite#06-evaluation · RailCite — What I built → /work/railcite#05-what-i-built · TeachSpark — Evaluation → /work/teachspark#06-evaluation
sources (labels): RailCite threshold calibration [§8.2] · RailCite citation validator [§8.2] · TeachSpark instrumentation [§8.1]
```

```
id: research
prompt: What is your research background?
answer: Before product management I was a co-inventor — second of five — on granted Indian patent IN 429867, a low-cost portable electrochemical biosensor for rapid endotoxin detection. The work is published as a 2025 Langmuir paper on a point-of-care sepsis-biomarker aptasensor and a 2023 Soft Matter paper on topological phases in nanoparticle monolayers. On the device I worked across the analyser's electronics and firmware, the Android app, sensor preparation, and validation in blood and food samples.
evidence: Research → /about#research · Pratyasa → /work/pratyasa · Langmuir 2025 (DOI) → https://doi.org/10.1021/acs.langmuir.5c00784
sources (labels): Pratyasa Discovery PRD §4 [§4.7] · Pratyasa role note [§8.8]
```

### Footer (`components/layout/Footer.tsx`) — flat, two-tier, on every page

```
Tier 1 heading (h2):  Still curious? Let's build what's next.
Tier 1 actions:       [Resume — updating] (secondary)  [LinkedIn] (secondary, external)  [Let's Talk] (primary → /contact)

Tier 2 left:          Tushar Pathak
                      Senior Product Manager
Tier 2 nav (aria-label="Footer"):  Work · Thinking · About · Contact
Tier 2 right (ExternalLink):       GitHub → https://github.com/007U5H4R
                                   Previous portfolio → https://tushar-pathak.vercel.app/

Credit line:          Built with curiosity.
```

**Hard rule from the code (decision TP10/E-1):** the footer credit is exactly `Built with curiosity.` and must never say "Built with Claude Code". The Claude Code colophon lives only on `/about` (see that section).

### Skip link (`components/layout/SkipLink.tsx`)

First tab stop on every page; visually hidden until focused; targets `#main`.

```
Skip to main content
```

### 404 (`app/not-found.tsx`) — one centred hero-tier peach `ClayCard`, rendered inside the root layout

```
h1:    This page wandered off.
lead:  Whatever you were looking for isn't at this address. Here are a few places that are still there.
CTAs:  [Back home] (primary → /)   [See the work] (secondary → /work)   [Get in touch] (secondary → /contact)
```

### Shared vocabularies rendered site-wide

**StatusBadge** (`components/projects/StatusBadge.tsx`) — icon + text always; text comes from each project's `statusLabel`.

| `status` | tone | icon |
|---|---|---|
| live | mint | Radio |
| pilot | sky | FlaskConical |
| prototype | peach | Hammer |
| research | lavender | BookOpen |
| archived | neutral | Archive |

**MetricCard kind badge** (`MetricCard.tsx`; also reused by `StoryCard` outcomes)

| `kind` | tone | icon | label |
|---|---|---|---|
| measured | mint | Gauge | `Measured` |
| structural | sky | Ruler | `Structural` |
| self-reported | peach | UserRound | `Self-reported` |

MetricCard body order: big `tabular-nums` value → label → context sentence → kind badge + `formatAsOf(asOf)` caption → optional caption → `Source: {label}`. `formatAsOf("2026-08-24")` → `as of 24 Aug 2026`.

**HypothesisCard status badge**

| `status` | tone | icon | label |
|---|---|---|---|
| validated | mint | CheckCircle2 | `Validated` |
| partially-validated | butter | CircleDot | `Partially validated` |
| invalidated | blush | XCircle | `Invalidated` |
| unmeasured | neutral | CircleDashed | `Unmeasured` |

**Other fixed strings**

```
DraftBadge (AnswerView / HowIThink / FinalCTA):         Draft
ExternalLink / ClayButton external (sr-only):           (opens in new tab)
CopyButton labels:  idle → "Copy"   copied → "Copied"   error → "Copy failed"
CopyButton aria-label:            "{label} {value}"   e.g. "Copy Tushar_Pathak@outlook.com"
CopyButton live-region:           "Copied {value}"  |  "Copy failed — select the address to copy it"
CopyButton error fallback:        <output>{value}</output>  +  "Select to copy"
SourceCaption:                    "Source: " + source.label (an ExternalLink when source.url exists)
ArtifactShell eyebrows:           Insight · Hypothesis · Metric · Decision · Evaluation · Experiment
ArtifactCard (generic) eyebrows:  prd → "PRD"  deck → "Deck"  ledger → "Ledger"  doc → "Doc"  link → "Link"
DecisionCard column labels:       Chosen  |  Rejected   (+ "Why: " prefix before reason)
HypothesisCard labels:            We believe  |  We'll know when
EvaluationCard rows:              Method → Result → Limitation
ExperimentCard steps:             Setup → Result → Learning
```

### Date formatting (`lib/format.ts`)

```
formatAsOf("2026-08-24")                     → "as of 24 Aug 2026"
formatRange({ start:"2026-08" })             → "Aug 2026 – present"
formatRange({ start:"2022-01", end:"2026-08" }) → "Jan 2022 – Aug 2026"
readingTime(400)                             → "2 min read"   (200 wpm, floor 1)
```

### Link-preview (OG) copy per route (`lib/og.tsx` template: eyebrow → title → subtitle → optional badge; footer line `Tushar Pathak`; 1200×630)

| Route | eyebrow | title | subtitle | badge |
|---|---|---|---|---|
| `/` | `Product Thinker · AI Builder · Problem Solver` | `I turn ambiguity into AI-native products people can use.` | `Senior Product Manager` | — (avatar poster shown) |
| `/work` | `Selected Work` | `Real problems. Thoughtful bets. Products that ship.` | `Personal AI builds and professional platform work — filterable by AI, Enterprise, Cloud and Experiments.` | — |
| `/work/[slug]` | `Case study` | `{project.name}` | `{project.tagline}` | `{project.statusLabel}` |
| `/about` | `About` | `Senior Product Manager. Product Thinker · AI Builder · Problem Solver.` | `The career arc from enterprise programs to AI-native products — the experience, capabilities, and proof behind it.` | — |
| `/thinking` | `Product Thinking` | `Thinking` | `An honest editorial list — five DRAFT essays, each backed by a real quoted passage.` | — |
| `/playground` | `Product Playground` | `Small experiments. Big questions.` | `Four shipped experiments — Pratyasa, Tegaki, Dino Arcade and Cinematic Portfolio.` | — |
| `/contact` | `Contact` | `Still curious?` | `Email, LinkedIn, or a resume — the fastest ways to reach Tushar Pathak.` | — |

`<title>` per route: `Tushar Pathak · Senior Product Manager` (home) · `Work · Tushar Pathak` · `{name} · Tushar Pathak` · `About · Tushar Pathak` · `Thinking · Tushar Pathak` · `{essay.title} · Tushar Pathak` · `Playground · Tushar Pathak` · `Contact · Tushar Pathak`.

### Design tokens currently defined (`app/globals.css` `@theme`)

```
/* Colour — 13 tokens (hex authoritative in DESIGN_DIRECTION §2; oklch regenerated by scripts/tokens-check.ts) */
--color-bg            oklch(0.985 0.008 293.914)   /* hex #FAF9FF */
--color-surface       oklch(0.966 0.017 293.143)   /* #F4F2FF */
--color-ink           oklch(0.231 0.089 271.893)   /* #101646 */
--color-ink-2         oklch(0.397 0.078 277.538)   /* #3D4270 */
--color-ink-3         oklch(0.553 0.058 279.533)   /* #6B6F94 */
--color-accent        oklch(0.566 0.226 280.614)
--color-accent-deep   oklch(0.489 0.221 278.521)
--color-lavender      oklch(0.784 0.124 295.563)   /* #BFA8FF */
--color-sky           oklch(0.86 0.074 244.491)    /* #A8D7FF */
--color-mint          oklch(0.887 0.078 170.241)   /* #A5EBD2 */
--color-blush         oklch(0.845 0.09 3.396)      /* #FFB4C6 */
--color-peach         oklch(0.895 0.066 57.165)    /* #FFD2B2 */
--color-butter        oklch(0.92 0.114 92.676)     /* #FFE389 */

/* Typography */
--font-display   var(--font-manrope), system-ui, -apple-system, "Segoe UI", sans-serif   /* Manrope 500/600/700/800 */
--font-hand      var(--font-caveat), "Caveat", cursive                                    /* Caveat 500/600 */
--text-hero      clamp(2.25rem, 1.229rem + 4.19vw, 5rem)
--text-hero-lg   clamp(2.75rem, -2.788rem + 8.654vw, 5rem)
--text-h2        clamp(2.125rem, 1.614rem + 2.1vw, 3.5rem)
--text-h3        clamp(1.5rem, 1.314rem + 0.76vw, 2rem)
--text-lead      clamp(1.1875rem, 1.118rem + 0.29vw, 1.375rem)
--text-body      clamp(1.0625rem, 1.039rem + 0.1vw, 1.125rem)
--text-caption   0.875rem
--tracking-hero    -0.03em
--tracking-eyebrow  0.12em
--leading-hero      1.02

/* Spacing (8px base) */
--space-1 4px · --space-2 8px · --space-3 12px · --space-4 16px · --space-5 24px · --space-6 32px
--space-7 40px · --space-8 48px · --space-9 56px · --space-10 64px · --space-11 72px · --space-12 96px · --space-13 128px
--section-gap-mobile  var(--space-11)   --section-gap-tablet  var(--space-12)   --section-gap-desktop  var(--space-13)

/* Container + gutters */
--container-max 1200px · --container-max-wide 1320px
--gutter-mobile var(--space-5) · --gutter-tablet var(--space-7) · --gutter-desktop var(--space-10)
--breakpoint-2xl 1440px   (overridden from Tailwind's 1536)

/* Card padding */
--card-padding var(--space-7) · --card-padding-hero var(--space-9)

/* Radius */
--radius-clay 28px · --radius-clay-sm 20px · --radius-pill 999px · --radius-utility 14px   (hero tier uses 34px inline)

/* Shadows + volume gradient */
--shadow-clay-rest, --shadow-clay-hover, --shadow-clay-press, --shadow-utility, --gradient-clay-volume

/* Motion easings */
--ease-hover  cubic-bezier(0.23, 1, 0.32, 1)
--ease-reveal cubic-bezier(0.2, 0.7, 0.2, 1)
--ease-panel  cubic-bezier(0.32, 0.72, 0, 1)
--ease-vt     cubic-bezier(0.77, 0, 0.175, 1)
```

Clay tiers (`components/clay/tiers.ts`): `hero` (34px radius, rest shadow, volume gradient) · `card` (28px, rest shadow, gradient) · `utility` (14px, utility shadow, no press state) · `flat` (nothing). Seven tones: `neutral lavender sky mint blush peach butter`, always paired with `ink` text; tone washes are 30% tints (`bg-lavender/30` etc.).

Global decorative layers: a fixed aurora/gradient-mesh `body::before` (lavender/sky/blush/mint/peach radial blobs, 30s drift) and a `.glow-halo` behind the hero avatar; a `.glass` (12px blur, 80% bg) treatment reserved for the compact header only.

### Accessibility conventions worth preserving

- **Landmarks:** `SkipLink` → `<header>` (sticky) → `<main id="main">` → `<footer>`. Nav regions: `aria-label="Primary"` (header + mobile), `aria-label="Footer"`. Every page section is a `<section>` with `aria-labelledby` pointing at its `SectionHeading` `<h2 id>` or an `aria-label`.
- **Heading outline is skip-free by construction:** every page has exactly one `h1`; `/work` inserts an sr-only `h2` `Personal builds`; `/thinking` inserts an sr-only `h2` `Essays`; case-study chapters are `h2`, `DecisionCard` titles `h3`; card titles inside links are real `h3`/`h2`s.
- **Reduced motion:** a global `@media (prefers-reduced-motion: reduce)` rule forces every transition/animation to 1ms, disables view transitions, removes the hero wash, aurora drift, glow pulse, avatar breathing/lean/tilt/variant crossfades, and collapses `.reveal` and `.thinking-node` to opacity-only with 0ms stagger. Hover/focus *colour* changes stay on.
- **JS-off safety:** `.reveal` and `.thinking-nodes` classes are added only after mount, so server HTML is fully visible without JavaScript. Hero entrance is pure CSS and transform-only (the LCP avatar never fades in).
- **Focus ring:** `.focus-ring:focus-visible` = 3px solid accent, 3px offset — on every interactive element.
- **Targets:** every control is ≥44×44 (`min-h-11 min-w-11`); running-text links are marked `data-inline-link` as the WCAG 2.5.8 exception.
- **Colour is never the only signal:** status/kind/hypothesis badges always pair icon + text; error surfaces use ink-on-blush with an alert icon.
- **Alt-text rules:** the avatar `alt` lives only in `site.avatarAlt`; decorative images use `alt=""` + `aria-hidden`; `Media.alt` must be ≥8 chars (schema); placeholders render the alt as visible caption text, never a broken `<img>`.
- **Native `<dialog>`** for the Ask panel and mobile menu (focus trap, Esc, focus returned to the trigger that opened it); page behind is made `inert` while the Ask panel is open.
- **Sources are mandatory:** a metric or artifact without `asOf`/`source` throws at render; `SourceRef.ref` (local paths) is never emitted to HTML.
- **Screen states:** Ask (idle/loading/answer/empty/error), `/work` grid (`EmptyState`), `DemoVideo` (no-video/idle/loading/playing/error), `CopyButton` (idle/copied/error) are all designed and rendered.

---

## `/` — Home

**Purpose (SITEMAP.md):** "Executive summary: who, level, what he builds, proof, how to reach him."

**Section order (`app/page.tsx`):** `Hero` → `Section#ask` (`SectionHeading` + `AskPortfolio`) → `FeaturedWork` → `HowIThink` → `FinalCTA`. (Header/Footer from the root layout.)

### 1. Hero (`components/hero/Hero.tsx` + `data/hero.ts`)

Two columns at ≥1024 (42fr avatar / 58fr copy); stacks below. Left: `AvatarStage` — a 4:5 hero-tier `ClayFrame` (sky/lavender) holding `/avatar/avatar.webp` (1440×1800, `alt` = `site.avatarAlt`) inside a `.glow-halo`, with three floating `ClayIcon` tiles at its corners: Laptop (mint, top-left, "build"), BookMarked (butter, right, "learn"), Sprout (blush, bottom-left, "grow"). Pose variants crossfade on hover (`/avatar/avatar-gaze-laptop|gaze-book|gaze-plant|ask-lean|smile|thinking|surprised.webp`).

Right column, top → bottom:

```
Eyebrow pill (with accent dot):
  "Senior Product Manager · Product Thinker · AI Builder · Problem Solver"
  source: RESUME (title); positioning per user instruction
  status: DRAFT  (VERIFIED title / DRAFT supporting triad)

h1 (highlight span renders in accent with a one-time lavender wash):
  "I turn ambiguity into " + [AI-native products] + " people can use."
  source: User instruction (fixed copy)
  status: DRAFT

Support paragraph (hidden below 768px):
  "7+ years shipping cloud, data and AI products at Godrej Infotech, Quantiphi, Shellkode and American Express — and, since August 2026, a run of solo-built AI products with real users."
  source: RESUME profile summary; career timeline; AUDIT §4/§5 (TeachSpark/RailCite solo-built, first commits 2026-08-20 / 2026-08-28)
  status: DRAFT

CTA row:
  [View My Work →]  primary → /work
  [Resume — updating]  secondary → /contact#resume  (title: "Sanitised resume coming — email me for a copy")
  Annotation (Caveat, −4°, aria-hidden, decorative):  "ideas → impact"

FloatingTiles (3 lavender card-tier ClayTiles; label uppercase + copy):
  AI Products — "TeachSpark · RailCite — two live AI products, built solo, Aug–Sep 2026"
     source: TS/README.md:3; CS5/Discovery-PRD.md L3-5; AUDIT git table   status: VERIFIED
  People — "17 teachers joined a WhatsApp pilot in its first week (TeachSpark, snapshot 2026-08-24, test handsets excluded)"
     source: CS4/docs/final-prd.docx §0/§7; DL/Tushar's PRD_ TechSpark.pdf pp.19-21   status: VERIFIED
  Progress — "35+ Accounts Receivable capabilities migrated off a legacy platform; 180+ stories across four Agile teams (AmEx, 2026)"
     source: RESUME AmEx Key Achievements   status: VERIFIED
```

**Defined but NOT rendered:** `hero.tagline.text = "Observing what others overlook."` (source: `PORT "Tagline: Observing what others overlook."`, status VERIFIED). No component reads it.

### 2. Ask my portfolio (`Section#ask`, `SectionHeading`, `components/ai/AskPortfolio.tsx`)

```
eyebrow:  Ask
h2:       Ask my portfolio
lead:     Type a question and get a sourced answer drawn only from this site — no live AI.
```

A single card-tier `ClayCard` (max 720px; neutral → lavender tone when expanded): a text input (label sr-only `Ask about my work`, placeholder `Ask about my work…`) + a 56px accent submit button (`aria-label="Ask"`, ArrowUp icon). Below it, `AnswerView` in the **idle** state with the **5 home prompts**:

```
What products have you built?
How do you approach product discovery?
What AI products have you worked on?
Show me your most technical project.
What impact have you created?
```

Submitting never navigates; the card expands in place (min-height 240px) and focus moves to the `Answer` heading.

### 3. Featured work (`components/projects/FeaturedWork.tsx`, `ProductScene.tsx`, `ProjectCard.tsx`)

```
eyebrow:  Featured work
h2:       Real problems. Real products.
lead:     Three products I designed and built end-to-end — from the problem to the shipped thing.
```

**Flagship `ProductScene`** (hero-tier lavender `ClayCard`, two columns) — RailCite (featured rank 2 but promoted to the flagship slot for presentation):

Left — a browser-window mock: three neutral dots · address pill `railcite.vercel.app` · row of `ClayIcon` (ShieldCheck, lavender, 40px) + `RailCite` · a chrome-only input placeholder `Ask about RailCite…` · a lavender/20 answer surface holding the tagline `A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular… without ever inventing a citation.` and two evidence pills built as `{value} {label}`: `5,760 Documents indexed` · `0 Invented citations`.

Right — pull-quote + CTA:

```
“The feature is a citation. The product is trust.”
— RailCite 9-day LinkedIn series, Day 5
[Explore RailCite →]  primary → /work/railcite
```

(The quote is artifact `rc-a-trust` from RailCite's "What I learned" chapter, source label `RailCite 9-day LinkedIn series`.)

**Two `ProjectCard`s** (featured mode, 2-up) in featured-rank order — anatomy: `ClayIcon` (lavender, 56) → h3 name → tagline (2-line clamp) → up to 3 `Tag`s → `StatusBadge` + decorative arrow. The whole card is the link (`aria-label` = name).

```
TeachSpark (rank 1, large)
  icon: MessageSquareText
  tagline: A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work.
  tags: AI · WhatsApp · EdTech
  status: pilot → badge "Live pilot (Twilio sandbox) — uptime after 2026-09-09 unverified"
  → /work/teachspark

Nuptis → Velora (rank 3, medium)
  icon: Handshake
  tagline: Two vendor-onboarding products in nine days — and the decision to kill the first.
  tags: B2B · Marketplace · PM craft
  status: live → badge "Live (mock data)"
  → /work/velora
```

### 4. How I think (`components/home/HowIThink.tsx` + `data/thinking-framework.ts`)

```
eyebrow:  How I think
h2:       A product journey, not a process.
lead:     From ambiguity to impact — six stages I return to on every product, each grounded in one real, sourced example.
```

Six round 56px utility `ClayTile` nodes in a row (≥1024, joined by a static dashed SVG wave) / a vertical list with a left hairline (<1024). Each node = icon + label button (`aria-expanded`, roving tabindex, arrows/Esc). Clicking opens ONE shared "sticky-note" `ClayCard` (card tier, stage tone, −1° rotate, a butter "washi tape" strip) containing: `Draft` badge + `{label} — my own framing, not yet signed off` · the **principle** (DRAFT) · the **example quote** (VERIFIED) · `— {attribution}` · a link pill `See how I tested this in {projectName}` → `href`.

| # | id / label | tone | icon | principle (DRAFT, unsigned) | example quote (VERIFIED) | attribution | project → link text | href | source (never rendered) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `problem` / **Problem** | sky | CircleAlert | `Find the sentence where the current way of doing things quietly costs someone their credibility — that's the problem, not the missing feature.` | `A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists… one wrong/superseded citation damages the inspector's credibility — not the tool's.` | `RailCite Discovery PRD` | `See how I tested this in RailCite` | `/work/railcite#02-problem` | CS5/Discovery-PRD.md:38-41 |
| 2 | `insight` / **Insight** | butter | Lightbulb | `Look for the idle time between handoffs, not the work itself — that's usually where the real delay is hiding.` | `Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs.` | `Week 4 team research` | `See how I tested this in Nuptis → Velora` | `/work/velora#03-discovery` | CS3/CASE STUDY 3 PRD.pdf:p.7 |
| 3 | `bet` / **Bet** | lavender | Dice5 | `Bet on capability over dependency: teach the reusable skill instead of doing the task for someone.` | `Capability, not dependency.` | `TeachSpark Solution-Space PRD` | `See how I tested this in TeachSpark` | `/work/teachspark#04-product-bet` | CS4/Case Study 4 - Solution-Space PRD.docx:§3 |
| 4 | `build` / **Build** | peach | Hammer | `Design the failure mode on purpose: decide what should refuse to work before deciding what should.` | `Refuse is a first-class success state, never an error.` | `RailCite Design.md` | `See how I tested this in RailCite` | `/work/railcite#05-what-i-built` | CS5/Design.md:21-24 |
| 5 | `evaluate` / **Evaluate** | mint | FlaskConical | `Re-run the evaluation on the version of the data you'd be embarrassed to leave in, not the one that flatters the number.` | `Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30.` | `TeachSpark build-series, Post 9` | `See how I tested this in TeachSpark` | `/work/teachspark#06-evaluation` | TS/docs/linkedin/9-day-build-series.md:Post 9 |
| 6 | `impact` / **Impact** | mint | TrendingUp | `Report the number with its date and its caveats attached, or don't report it at all.` | `17 teachers joined, 8 activated (47%), median 37.5 min saved (self-report).` | `TeachSpark final PRD — pilot snapshot 2026-08-24, test handsets excluded` | `See how I tested this in TeachSpark` | `/work/teachspark#07-outcome` | CS4/docs/final-prd.docx:§0/§7 |

### 5. Final CTA (`components/home/FinalCTA.tsx`) — one centred hero-tier lavender `ClayCard` (max 640px)

```
h2:      Building something AI-native? Let's talk.        (DRAFT — editorial framing, unsigned)
lead:    Copy my email, drop me a line, or grab my resume — whichever is easiest.
actions: [Copy] (CopyButton, copies Tushar_Pathak@outlook.com)   [Let's Talk] (primary → /contact)   [Resume — updating] (secondary)
footer:  [Draft] Closing copy is my framing, not yet signed off.
```

---

## `/work` — Selected Work

**Purpose (SITEMAP.md):** "Every project, filterable, editorial hierarchy." Meta description: `Every project — personal AI builds and professional platform work — filterable by AI, Enterprise, Cloud and Experiments.`

**Section order (`app/work/page.tsx`):** `WorkHero` → `<section aria-labelledby="work-personal-heading">` [sr-only h2 `Personal builds` · `FilterTabs` · `WorkGrid` (→ `EditorialGrid` or `EmptyState`)] → `<section aria-label="Professional experience">` [`ExperienceStrip`].

### WorkHero (`components/projects/WorkHero.tsx`) — flat, no clay

```
eyebrow pill (accent dot):  Work
h1:                         Work
lead:                       Personal builds first. Corporate work is listed as experience, not product.
                            (source: CONTENT_INVENTORY §2.1 — DRAFT)
```

### FilterTabs (`lib/filters.ts`, `components/projects/FilterTabs.tsx`) — `role="tablist" aria-label="Filter projects"`

Tabs are `<a role="tab">` links; the active one has a lavender/30 pill behind it. `all` is the bare `/work` route; the others are `/work?filter=<value>`.

```
All          → /work
AI           → /work?filter=ai
Enterprise   → /work?filter=enterprise
Cloud        → /work?filter=cloud
Experiments  → /work?filter=experiments
```

### EditorialGrid (`components/projects/EditorialGrid.tsx`) — numbered `<ol>` of clay rows

Row anatomy: big numeral `01`…`11` (aria-hidden, outside the card; **re-sequences on every filter change**) → the row link (`aria-label` = name; `data-card-mode="grid"`) containing `ClayIcon` (lavender, 56) → h3 name → tagline (2-line clamp) → up to 3 `Tag`s + `StatusBadge` → a decorative dark pill `View project →` (≥640px) / ghost arrow (<640px).

**Personal builds, in render order (All tab):**

| # | slug | name | icon | tagline | tags | filters | status → statusLabel | statusAsOf | featured | gridSize | role | duration |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | `teachspark` | TeachSpark | MessageSquareText | `A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work.` | AI · WhatsApp · EdTech | ai | pilot → `Live pilot (Twilio sandbox) — uptime after 2026-09-09 unverified` | 2026-09-09 | 1 | large | Solo build | Aug 2026 |
| 02 | `railcite` | RailCite | ShieldCheck | `A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular… without ever inventing a citation.` | AI · RAG · GovTech | ai, cloud | live → `Live` | 2026-09-15 | 2 | medium | Solo build | Aug–Sep 2026 |
| 03 | `velora` | Nuptis → Velora | Handshake | `Two vendor-onboarding products in nine days — and the decision to kill the first.` | B2B · Marketplace · PM craft | enterprise, experiments | live → `Live (mock data)` | 2026-09-15 | 3 | medium | Solo build | Aug 2026 |
| 04 | `cubicle` | Cubicle | Users | `Four AI teammates debate visibly, then produce a PRD, competitor scan, landing copy and build plan in ~90 seconds.` | AI · Multi-agent · Gemini | ai | prototype → `Built, not launched` | 2026-09-15 | — | small | Team build | Sep 2026 |
| 05 | `nuptis` | Nuptis | ClipboardList | `Vendor ops for wedding-planning agencies — verification status, work orders, payment milestones and backup coverage in one place.` | B2B · Vendor ops · Supabase | enterprise | live → `Live (mock data)` | 2026-09-15 | — | small | Solo build | Aug 2026 |
| 06 | `bhakti-vilas` | Bhakti Vilas | Music | `An elder-focused wellness prototype built around bhajan — devotion as behavioural health, not a clinical app.` | Prototype · Health · Team | experiments | prototype → `Live prototype (mock data, team build)` | 2026-09-15 | — | small | Team build | Jul–Aug 2026 |
| 07 | `token-toli` | Token Toli | Search | `Ageing-in-place care orchestration for long-distance families — a team discovery PRD with 11 named respondents and three tested hypotheses.` | Discovery · Research · Healthcare | experiments | research → `Discovery only` | — | — | small | Team discovery | Jul 2026 |
| 08 | `pratyasa` | Pratyasa | Award | `A static record of granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage.` | Patent · Static · Record | experiments | live → `Live` | 2026-09-15 | — | small | Solo build | Aug 2026 |
| 09 | `tegaki` | Tegaki | PenLine | `What your handwriting suggests about you — read and written by hand.` | D2C · Supabase RLS · Pilot | experiments | pilot → `Live pilot` | 2026-09-15 | — | small | Solo build | Sep 2026 |
| 10 | `dino-arcade-pwa` | Dino Arcade | Gamepad2 | `A mobile PWA that turns your phone into an arcade cabinet — strictly BYO-ROM, no game data ships or uploads.` | PWA · Offline · EmulatorJS | experiments | live → `Live (BYO-ROM)` | 2026-09-15 | — | small | Solo build | Sep 2026 |
| 11 | `cinematic-portfolio` | Cinematic Portfolio | Film | `A scroll-driven film portfolio — AI-generated footage of me as the backdrop, Apple-product-page style, no build step.` | Motion · Static · Higgsfield | experiments | live → `Live` | 2026-09-15 | — | small | Solo build | Aug 2026 |

**Links per project** (`links`): teachspark live `https://teachspark-production.up.railway.app`, github `https://github.com/007U5H4R/teachspark` (private) · railcite live `https://railcite.vercel.app` (no github) · velora live `https://velora-nu-eight.vercel.app/` · cubicle github `https://github.com/007U5H4R/cubicle` (private, no live) · nuptis live `https://nuptis.vercel.app/`, github `https://github.com/007U5H4R/nuptis` (private) · bhakti-vilas live `https://bhakti-vilas.vercel.app/`, github `https://github.com/teenytinybot/Bhakti-Vilas` (unverified) · token-toli none · pratyasa live `https://pratyasa.vercel.app`, github `https://github.com/007U5H4R/pratyasa` (private) · tegaki live `https://tegaki-one.vercel.app`, github `https://github.com/007U5H4R/tegaki` (private) · dino-arcade-pwa live `https://007u5h4r.github.io/dino-arcade-pwa/`, github `https://github.com/007U5H4R/dino-arcade-pwa` (**repoPublic: true**) · cinematic-portfolio live `https://tushar-pathak.vercel.app/`, github `https://github.com/007U5H4R/cinematic-portfolio` (**repoPublic: true**). No project has `demoVideo` or `hero.image` today.

**Filter → visible rows (computed from `filters`):**

```
AI:          01 TeachSpark · 02 RailCite · 03 Cubicle          (+ strip: AmEx)
Enterprise:  01 Nuptis → Velora · 02 Nuptis                    (+ strip: AmEx · Quantiphi & Shellkode · Godrej)
Cloud:       01 RailCite                                        (+ strip: AmEx · Quantiphi & Shellkode)
Experiments: 01 Nuptis → Velora · 02 Bhakti Vilas · 03 Token Toli · 04 Pratyasa · 05 Tegaki · 06 Dino Arcade · 07 Cinematic Portfolio   (strip renders nothing)
```

### EmptyState (`components/projects/EmptyState.tsx`) — unreachable with current data, but designed

```
ClayIcon SearchX (lavender, 56)
No projects match this filter
Nothing here yet under this lens. Clear the filter to see every build.
[Show all] → /work   (ClayPill link)
```

### ExperienceStrip (`components/projects/ExperienceStrip.tsx`) — flat, bordered, NOT clay; rendered as employment, not product

```
h2 (caption, uppercase):  Professional experience — corporate work, not a public product.
```

Rows (one open at a time; button → `role` bold, `name` caption, `duration` right; `Tag`s + chevron; expands to `overview.thirtySecond[0]`):

```
Senior Product Manager
Accounts Receivable Modernization — American Express
Jun 2026 – present
Enterprise · Cloud · GenAI
  ↓ Senior Product Manager for Accounts Receivable at American Express (via IntraEdge): migrating 35+ capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform and championing Devin GenAI adoption. Self-reported, resume-sourced.

Technical Project Manager
Cloud & Data Platform Modernization — Quantiphi & Shellkode
Aug 2022 – Jun 2026
Cloud · Data · Delivery
  ↓ Technical Project Manager across enterprise cloud-native programs — Quantiphi (GCP, 2022–2026) and Shellkode (AWS, 2026): data-engineering and API modernization, DynamoDB→Cloud Spanner migrations, HIPAA-compliant healthcare data migration and Agile delivery governance. Resume-sourced.

Assistant Product Manager
Godrej Smartnet Platform — Godrej Infotech
Sep 2016 – Dec 2018
Product · Enterprise · Platform
  ↓ Assistant Product Manager at Godrej Infotech (2016–2018): end-to-end lifecycle of the Godrej Smartnet platform, 12 features in 11 months, and Agile transformation across the portfolio. Self-reported, resume-sourced.

[See my experience →]  ClayPill link → /about#experience
```

Professional entries' full data (`category: "professional"`, `status: "archived"`, `statusLabel: "Professional experience"`, no live/demo/featured, no `/work/[slug]` page):

```
slug: mars-ar-modernization · icon Landmark · filters enterprise, cloud, ai · dates 2026-06 – (open)
  tagline: Owned the migration roadmap for 35+ AR capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform; led Devin GenAI integration for AI-assisted development.
  source label: Résumé — American Express (via IntraEdge)  [§2.3]
slug: cloud-modernization-programs · icon Cloud · filters cloud, enterprise · dates 2022-08 – 2026-06
  tagline: DynamoDB→Cloud Spanner and SQL Server transformation frameworks; HIPAA-compliant healthcare data migration; GCP capability-building program; Agile delivery governance.
  source label: Résumé — Quantiphi & Shellkode  [§2.3]
slug: godrej-smartnet · icon Network · filters enterprise · dates 2016-09 – 2018-12
  tagline: Assistant Product Manager: end-to-end lifecycle of the Smartnet platform; 12 features in 11 months; Agile transformation.
  source label: Résumé — Godrej Infotech  [§2.3]
```

---

## `/work/[slug]` — Case study

**Purpose (SITEMAP.md):** "Progressive-disclosure story per project." Only the 11 personal slugs are built; professional entries and unknown slugs 404.

**Section order (`app/work/[slug]/page.tsx`):** `ProgressBar` (reading progress) → `<article>` [`CaseStudyHeader` → either `OverviewToggle` (summary ↔ deep) **or** summary + deep view **or** summary + "Deep dive coming" box] → `NextProject` band.

### CaseStudyHeader (`components/case-study/CaseStudyHeader.tsx`) — flat 60/40

Left: `h1` name → lead = `tagline` (44ch) → meta chips `Role: {role}` · `Duration: {duration}` · `StatusBadge` → up to 3 inline `MetricCard`s (`variant="inline"`: value/label/context/kind badge/as-of/`Source:` line). Right: a 16:9 card-tier lavender `ClayFrame` with the project's `ClayIcon` top-left; since no project has `hero.image` or `demoVideo`, every header renders the placeholder text `Hero media coming`.

### OverviewToggle (`components/case-study/OverviewToggle.tsx`) — `role="radiogroup" aria-label="Case-study depth"`

```
[30-sec]  (default)   |   [Deep dive]
```

Shown only when `overview.deepDive` is true and ≥1 chapter has content (TeachSpark, RailCite, Velora, Cubicle, Nuptis, Bhakti Vilas). The 30-sec view = `overview.thirtySecond` paragraphs in `Prose`. The deep view = `ChapterNav` (sticky left rail ≥1024 / sticky pill row <1024; `aria-label="Chapters"`) + the rendered `Chapter`s + `ShowTheThinking`.

### Thin projects (deepDive false: Token Toli, Pratyasa, Tegaki, Dino Arcade, Cinematic Portfolio)

No toggle. Summary paragraphs, then a flat utility box:

```
eyebrow:  Deep dive coming
body:     The full case study is being written up. This project is documented as {statusLabel}.
```

### Chapter structure — fixed 8, fixed order (`data/schema.ts` CHAPTER_IDS + `lib/anchors.ts` CHAPTER_ANCHORS)

Chapters are rendered only when they have body text or artifacts; the numeral is the canonical position from the anchor (so `#05-what-i-built` is always "05").

| id | anchor | numeral + title (h2) |
|---|---|---|
| `context` | `#01-context` | `01 Context` |
| `problem` | `#02-problem` | `02 Problem` |
| `discovery` | `#03-discovery` | `03 Discovery` |
| `bet` | `#04-product-bet` | `04 Product bet` |
| `built` | `#05-what-i-built` | `05 What I built` |
| `evaluation` | `#06-evaluation` | `06 Evaluation` |
| `outcome` | `#07-outcome` | `07 Outcome` |
| `learned` | `#08-what-i-learned` | `08 What I learned` |

Each `Chapter`: `h2` (numeral in ink-3 + title) → `Prose` body paragraphs (60ch) → `ArtifactGrid` (≤3 artifacts, inside the chapter column, auto-fit ≥15rem tracks).

### Artifact types the system supports (`data/schema.ts` discriminated union → `components/case-study/artifacts/*`)

| `type` | component | shape rendered |
|---|---|---|
| `insight` | `InsightCard` | eyebrow `Insight` · `“{quote}”` with a butter left bar · `— {attribution}` |
| `hypothesis` | `HypothesisCard` | eyebrow `Hypothesis` · `We believe` + `{believe}` · rule · `We'll know when` + `{knowWhen}` · status badge |
| `metric` | `MetricCard` | eyebrow `Metric` · value · label · context · kind badge · `as of …` |
| `decision` | `DecisionCard` | eyebrow `Decision` · h3 `{title}` · `Chosen` (mint check) `{chosen}` ‖ `Rejected` (struck-through list) · `Why: {reason}` |
| `evaluation` | `EvaluationCard` | eyebrow `Evaluation` · `Method` / `Result` / `Limitation` rows |
| `experiment` | `ExperimentCard` | eyebrow `Experiment` · `Setup` ↓ `Result` ↓ `Learning` |
| `prototype` | `PrototypeFrame` | 16:9 lavender `ClayFrame` with image / video / placeholder (ImageOff icon + `media.alt`) · caption · source |
| `generic` | `ArtifactCard` | eyebrow by `kind` (`PRD` `Deck` `Ledger` `Doc` `Link`) · `ClayIcon` · `{title}` (a link when `href`) · `{note}` as caption |

Every artifact ends with `Source: {source.label}` (an external link when the source has a public `url`).

### ShowTheThinking (`components/interactions/ShowTheThinking.tsx`, `ThinkingNode.tsx`) — below the last chapter

```
Toggle (secondary ClayButton, aria-expanded):  Show the thinking ↓  [sr-only: — 8-step reasoning chain, expand to read]
```

Opens an 8-node vertical chain (never auto-plays; nodes fade in 120ms apart with a connector wipe). Node = 40px round icon medallion → uppercase stage label → text (60ch) → the source **label** as an accent link to `href`. Stage order and labels are fixed:

| # | stage | label | icon |
|---|---|---|---|
| 1 | `observation` | `Observation` | Eye |
| 2 | `user-problem` | `User problem` | CircleAlert |
| 3 | `insight` | `Insight` | Lightbulb |
| 4 | `hypothesis` | `Hypothesis` | FlaskConical |
| 5 | `product-decision` | `Product decision` | Hammer |
| 6 | `prototype` | `Prototype` | Wrench |
| 7 | `evaluation` | `Evaluation` | ClipboardCheck |
| 8 | `outcome` | `Outcome` | TrendingUp |

Thin projects have `thinking: []` and the whole control is hidden.

### NextProject band (`components/case-study/NextProject.tsx`) — flat full-bleed, whole band is the link

```
eyebrow:  Next
title:    {next project name} →      (aria-label "Next project: {name}")
```

Order cycles through the personal list: teachspark → railcite → velora → cubicle → nuptis → bhakti-vilas → token-toli → pratyasa → tegaki → dino-arcade-pwa → cinematic-portfolio → teachspark.

**Not rendered anywhere:** every project's `learnings[]` array (listed per project below for completeness, flagged).

---

### `/work/teachspark` — FULL VERBATIM (`data/projects.ts` lines 73–521; provenance CONTENT_INVENTORY §8.1 + AUDIT §4)

**Header**

```
h1:        TeachSpark
lead:      A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work.
meta:      Role: Solo build   ·   Duration: Aug 2026   ·   [pilot badge] Live pilot (Twilio sandbox) — uptime after 2026-09-09 unverified
hero:      "Hero media coming" placeholder (icon MessageSquareText)
```

**Header metrics (3, inline)**

```
17          Teachers joined
            joined the WhatsApp pilot in its first week; Final-PRD snapshot 2026-08-24, test handsets excluded
            [Measured]  as of 24 Aug 2026   Source: TeachSpark Final PRD

8 (47%)     Activated
            of 17 joined reached an activation event (12 onboarded first, 71%); snapshot 2026-08-24, test handsets excluded
            [Measured]  as of 24 Aug 2026   Source: TeachSpark Final PRD

37.5 min    Median time saved
            self-reported median time saved per activated teacher; snapshot 2026-08-24, test handsets excluded
            [Self-reported]  as of 24 Aug 2026   Source: TeachSpark Final PRD
```

**30-sec overview (`overview.thirtySecond`, deepDive: true)**

```
School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context.

TeachSpark is a solo-built WhatsApp bot that teaches a teacher the reusable AI skill to make a differentiated worksheet herself in about two minutes, measures the time she saved, and pulls her back the next day for the next skill. A first-week pilot (2026-08-24, test handsets excluded) took 17 teachers onto WhatsApp, activated 8, and saved a median 37.5 self-reported minutes each.
```

**Chapter nav (all 8 present):** `01 Context · 02 Problem · 03 Discovery · 04 Product bet · 05 What I built · 06 Evaluation · 07 Outcome · 08 What I learned`

#### 01 Context (`#01-context`)

```
TeachSpark began as Case Study 4 in a Cohort 8 product sprint on learning technology and AI for the next generation of professionals — the teacher vertical. Group discovery ran over the first weekend; from Tuesday the work was individual. Tushar authored the Discovery, Solution-Space and Final PRDs and built the entire MVP solo — the WhatsApp bot, the web landing, the admin console and the analytics.

The starting point was personal, not a market slide. As the pitch put it, "it started with one real teacher: my mother, who teaches Sanskrit," and the build notes described the best user research as "remembering my mother's evenings."
```

Artifacts:

```
[insight] id ts-a-mother
  “My best user research was remembering my mother's evenings.”
  — TeachSpark build notes (pitch, slide 13)
  Source: TeachSpark pitch deck
```

#### 02 Problem (`#02-problem`)

```
The Discovery PRD framed the problem plainly: "School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context. They don't know what to learn, where to start, or how to translate generic AI tutorials into their specific subject/grade/board — so despite abundant free resources, most never build durable, confident, applied AI skills."

The persona was "Meera": a full-time K–12 teacher, 25–40, with 3–15 years of experience and class sizes of 30–50 mixed-ability students, who has never written a prompt with intent. Her job-to-be-done anchors the whole product.
```

Artifacts:

```
[insight] id ts-a-jtbd
  “When I'm overwhelmed by prep and grading, help me solve this week's specific teaching task with AI, so I get real time back and feel more in control — without having to become a techie first.”
  — Persona "Meera", Discovery PRD §1.1
  Source: TeachSpark Discovery PRD
```

#### 03 Discovery (`#03-discovery`)

```
The load-bearing insight reframed the market: the problem is not scarcity of content, it is that content is generic and disconnected from the classroom. A 2×2 whitespace map — generic ↔ classroom-specific against task-execution ↔ capability-building — located the wedge: problem-led, applied, capability-building learning with impact feedback, a corner nobody occupied.

Honesty note: the Discovery PRD planned 8–12 teacher interviews, but none were recorded — no notes, counts, transcripts or synthesis exist, and the observation sheet on disk is a blank template. The one documented user trace is Tushar's mother. Discovery rigour instead lived in a central hypothesis decomposed into eight assumptions (A1–A8), each tagged with type and risk before a line of code.
```

Artifacts:

```
[insight] id ts-a-insight
  “The problem is not scarcity of content, it is that content is generic and disconnected from the classroom.”
  — Discovery PRD §0
  Source: TeachSpark Discovery PRD

[hypothesis] id ts-a-hypothesis   status: partially-validated → badge "Partially validated" (butter)
  We believe:      A time-poor teacher will adopt AI if it solves one real classroom task this week and shows the time saved, rather than teaching AI generically.
  We'll know when: when teachers activate and return for a second skill — not merely try the bot once.
  Source: TeachSpark Discovery PRD
```

#### 04 Product bet (`#04-product-bet`)

```
The bet was "Capability, not dependency." Rather than doing the task for the teacher (a worksheet-vending service that creates dependency) or teaching AI generically, TeachSpark teaches the reusable skill to produce a differentiated worksheet herself in about two minutes, then measures the time saved and brings her back for the next skill.

The MVP wedge was chosen for being high frequency, high pain, and easy to template and measure. WhatsApp was the distribution decision — meet teachers where they already are, on a Twilio sandbox for the case-study cohort, rather than asking them to install and learn a new app.
```

Artifacts:

```
[decision] id ts-a-capability
  title:    Capability, not dependency
  Chosen:   Teach the teacher the reusable AI skill to make a differentiated worksheet herself in ~2 minutes, measure the time saved, and pull her back for the next skill.
  Rejected: • Do the task for her — a worksheet-vending service that creates dependency
            • Teach AI generically, disconnected from a real classroom task
  Why:      The white space was problem-led, applied, capability-building learning with impact feedback — nobody else occupied it.
  Source: TeachSpark Solution-Space PRD

[decision] id ts-a-whatsapp
  title:    WhatsApp as the distribution wedge
  Chosen:   Ship on WhatsApp, where teachers already are, via a Twilio sandbox for the cohort.
  Rejected: • A standalone app requiring a new install and a new login
  Why:      Distribution, not a new destination.
  Source: TeachSpark Solution-Space PRD
```

#### 05 What I built (`#05-what-i-built`)

```
The architecture is a single honest loop: WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX → back to WhatsApp. The core transition() is a pure function of (teacher, message, now) → step, with all I/O pushed through ports and adapters (Twilio, Supabase, Anthropic, PDF, DOCX, media, storage). Claude Sonnet 5 is the default model, with Claude Haiku 4.5 env-switchable.

The question-paper path uses structured outputs (messages.parse with a zod output format), vision on teacher-sent photos, and a second QC pass; its prompt is explicit — flag an unreadable or blurry page in source notes and never hallucinate. The worksheet prompt keeps generation inside the stated board's syllabus (CBSE, ICSE or a State board) and never asks for a student's personal details.
```

Artifacts:

```
[generic · kind doc → eyebrow "Doc"] id ts-a-arch
  title: Ports-and-adapters architecture
  note:  transition() is a pure function (teacher, message, now) → step; all I/O runs through ports/adapters — Twilio, Supabase, Anthropic, PDF/DOCX.
  Source: TeachSpark runbook

[generic · kind doc → "Doc"] id ts-a-paper
  title: Question-paper path: structured outputs + vision + QC pass
  note:  messages.parse with a zod output format, vision on teacher photos, and a second QC pass; the prompt says never hallucinate and flags unreadable pages.
  Source: TeachSpark question-paper adapter

[metric] id ts-a-cost
  ≈ $0.01    Cost per generation
  runbook estimate per worksheet/paper generation; an estimate, not an independently measured figure
  [Self-reported]  as of 24 Aug 2026   Source: TeachSpark runbook
```

#### 06 Evaluation (`#06-evaluation`)

```
TeachSpark was instrumented with 32 event types across a server-side event store, Mixpanel and Clarity. QA ran as phased gates through phase-7, with real Claude→PDF→Supabase round-trips and Twilio-shaped webhook end-to-end tests; the last recorded gate was 335 passed / 2 skipped (phase-6, 2026-08-21). The pitch's "625 tests" could not be reproduced and is not used, and no LLM output-quality evals exist — only the in-product QC pass.

The most telling evaluation decision was about honesty. The day before submission, Tushar added an is_test flag and excluded his own handsets from the pilot numbers: activated teachers dropped from 10 to 8, median time saved fell from 37.5 to 30 minutes, and exported papers went from 5 to 2. Mixpanel (captured from 24 Aug only; the first-party store of 72 landing views is authoritative) recorded a 27 → 7 → 4 landing → sign-up → join funnel.
```

Artifacts:

```
[experiment] id ts-a-istest
  Setup:    The day before submission, added an is_test flag and excluded my own handsets from the pilot numbers.
  Result:   Activated teachers dropped from 10 to 8; median time saved fell from 37.5 to 30 minutes; papers from 5 to 2.
  Learning: Honest smaller numbers earn more trust than impressive fake ones.
  Source: TeachSpark 9-day build series

[evaluation] id ts-a-qa
  Method:     Phased QA gates through phase-7 with real Claude→PDF→Supabase round-trips and Twilio-shaped webhook end-to-end tests.
  Result:     Last recorded gate: 335 passed / 2 skipped (phase-6, 2026-08-21).
  Limitation: No LLM output-quality evals exist; the pitch's "625 tests" could not be reproduced and is not used.
  Source: TeachSpark QA phase-6 gate

[metric] id ts-a-mixpanel
  27→7→4    Mixpanel 3-step funnel
  landing_view → signup_completed → join_tapped; captured from 24 Aug only, first-party store (72 views) is authoritative
  [Measured]  as of 24 Aug 2026   Source: TeachSpark Mixpanel funnel
```

#### 07 Outcome (`#07-outcome`)

```
The first-week pilot (Final-PRD snapshot 2026-08-24, test handsets excluded) ran the full funnel: 72 landing views → 17 sign-ups (23.6%) → 17 joined on WhatsApp → 12 onboarded (71%) → 8 activated (47%) → 5 question papers exported, with a self-reported median of 37.5 minutes saved, 3 referrals, and nudge re-engagement of 1 of 4. Sign-up method was 17 manual, 0 Google.

Measured against the pre-set targets — joined 40–50, activation ≥60%, D1 retention ≥25% — the pilot came in under. Tushar's own reflection was that the D1 number "wasn't low; it was structurally impossible," because the measurement window was shorter than the 24-hour definition. The service runs as a live pilot on a Twilio sandbox rather than a production WhatsApp number, and whether the Railway service is still up after 2026-09-09 is unverified.
```

Artifacts:

```
[metric] id ts-a-referrals
  3    Referrals
  teacher-reported referrals during the first-week pilot; snapshot 2026-08-24, test handsets excluded
  [Self-reported]  as of 24 Aug 2026   Source: TeachSpark Final PRD

[experiment] id ts-a-d1
  Setup:    Set activation and D1-retention targets before the pilot (joined 40–50, activation ≥60%, D1 ≥25%).
  Result:   17 joined and 47% activated — under target; D1 was not meaningfully measurable.
  Learning: The number wasn't low, it was structurally impossible — the measurement window was shorter than the 24-hour definition.
  Source: TeachSpark 9-day build series
```

#### 08 What I learned (`#08-what-i-learned`)

```
The sharpest lesson came from the mentor: "a teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow." The mentor also warned that WhatsApp is a strong distribution decision but should not become the entire product differentiation, and that the original objective of helping teachers learn Tech + AI was currently missing from the experience. Tushar's response kept the best-worksheet tool as the lead and delivered learning in-product as the trust mechanism — Wave 1 ("trust & clarity") shipped on 2026-08-29.

Two build-level lessons stuck. First, green tests prove a thing runs, not that it is right: 335 passing tests still shipped a sign-up India map that placed zero real sign-ups, because a case-sensitive lookup against 14 hard-coded cities missed teachers who had typed "Bangalore" four different ways when it expected "Bengaluru." Second, the redundant typed WhatsApp-number field on the sign-up form was the likely top drop-off.
```

Artifacts:

```
[insight] id ts-a-mentor
  “A teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow.”
  — Mentor feedback, 2026-08-29
  Source: TeachSpark mentor feedback

[experiment] id ts-a-cities
  Setup:    The sign-up India map matched city names with a case-sensitive lookup against 14 hard-coded cities.
  Result:   It placed zero real sign-ups — teachers had typed "Bangalore" four different ways; the lookup expected "Bengaluru."
  Learning: Real inputs are messier than any hard-coded list — normalize before you match.
  Source: TeachSpark 9-day build series

[decision] id ts-a-wave1
  title:    Wave 1: trust & clarity
  Chosen:   Keep the best-worksheet tool as the lead and deliver learning in-product as the trust mechanism; ship Wave 1 (trust & clarity) on the landing.
  Rejected: • Reposition the product as an AI-learning course
            • Make WhatsApp itself the product differentiation
  Why:      Commit 2026-08-29: "Wave 1: trust & clarity on the landing (mentor feedback)."
  Source: TeachSpark mentor feedback
```

#### Show the thinking — 8 nodes (text · source label → href)

```
Observation
  It started with one real teacher: my mother, who teaches Sanskrit. My best user research was remembering my mother's evenings.
  TeachSpark pitch deck → /work/teachspark#01-context

User problem
  Time-poor K–12 teachers want AI to save time, but resources are generic, fragmented and disconnected from their classroom — so most never build durable, applied AI skills.
  TeachSpark Discovery PRD → /work/teachspark#02-problem

Insight
  The problem is not scarcity of content, it is that content is generic and disconnected from the classroom.
  TeachSpark Discovery PRD → /work/teachspark#03-discovery

Hypothesis
  A teacher will adopt AI if it solves one real classroom task this week and shows the time saved; eight assumptions (A1–A8) were written with type and risk before any code.
  TeachSpark Discovery PRD → /work/teachspark#03-discovery

Product decision
  Capability, not dependency: teach the reusable skill instead of doing the task; the MVP wedge was chosen for high frequency, high pain, and being easy to template and measure.
  TeachSpark Solution-Space PRD → /work/teachspark#04-product-bet

Prototype
  Shipped solo: a WhatsApp bot (Twilio sandbox), a web landing, an admin console and analytics — WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX.
  TeachSpark runbook → /work/teachspark#05-what-i-built

Evaluation
  Instrumented 32 event types; the day before submission I added an is_test flag and excluded my own handsets — activation dropped 10→8 and median time saved 37.5→30 minutes.
  TeachSpark 9-day build series → /work/teachspark#06-evaluation

Outcome
  First-week pilot (2026-08-24, test handsets excluded): 17 teachers joined, 8 activated (47%), median 37.5 minutes saved (self-report), 3 referrals; then a mentor challenge drove a Wave-1 trust-and-clarity iteration.
  TeachSpark Final PRD → /work/teachspark#07-outcome
```

#### `learnings[]` (defined, NOT rendered)

```
A teacher buys a worksheet good enough for tomorrow, not "AI" — lead with the artifact and deliver learning as the trust mechanism (mentor, 2026-08-29).
Green tests prove it runs; they don't prove it's right — 335 passing tests still shipped a broken, case-sensitive city lookup.
Honest smaller numbers earn more trust than impressive fake ones — excluding my own handsets the day before submission was the right call.
Distribution (WhatsApp) is a strong wedge, but it must not become the entire product differentiation.
```

#### Sources (id → label; `url` = renders as a link)

```
TS-README-3         TeachSpark README
CS4-FINAL-PRD       TeachSpark Final PRD
TS-DISCOVERY-PRD    TeachSpark Discovery PRD
TS-SOLUTION-PRD     TeachSpark Solution-Space PRD
TS-PITCH            TeachSpark pitch deck
TS-RUNBOOK          TeachSpark runbook
TS-ANTHROPIC-PAPER  TeachSpark question-paper adapter
TS-LINKEDIN-BUILD   TeachSpark 9-day build series
TS-MENTOR           TeachSpark mentor feedback
TS-QA-PHASE6        TeachSpark QA phase-6 gate
TS-MIXPANEL         TeachSpark Mixpanel funnel
TS-LIVE             TeachSpark live pilot (Railway)   url: https://teachspark-production.up.railway.app
```

**Next project:** `RailCite`.

---

### `/work/railcite` — FULL VERBATIM (lines 536–985; §8.2 + AUDIT §5)

**Header**

```
h1:    RailCite
lead:  A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular… without ever inventing a citation.
meta:  Role: Solo build · Duration: Aug–Sep 2026 · [live badge] Live
```

**Header metrics**

```
5,760   Documents indexed
        live corpus of Indian Railways commercial circulars from /api/stats; grows as the nightly crawl ingests new PDFs
        [Measured]  as of 15 Sep 2026   Source: RailCite live /api/stats (link → https://railcite.vercel.app)

0       Invented citations
        a P0 validator drops any answer block whose citations don't resolve; all-dropped becomes a refusal — enforced by construction, not measured over a sample of queries
        [Structural]  as of 15 Sep 2026   Source: RailCite citation validator

68%     Ingested PDFs needing OCR
        3,865 of 5,687 ingested PDFs required OCR; Final-PRD ingest run, 7 Sep 2026
        [Measured]  as of 7 Sep 2026   Source: RailCite Final PRD
```

**30-sec overview**

```
A Chief Commercial Inspector has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists, reading scanned circulars, guessing which version is current, and hand-writing a justification note that cites them — and one wrong or superseded citation damages the inspector's credibility, not the tool's.

RailCite is a solo-built, live RAG assistant over Indian Railways commercial circulars that answers a CCI's question with correctly-numbered, dated citations and supersession lineage — or refuses when no passage governs the case, because refusal is designed as a first-class success state. A P0 validator drops any answer whose citations don't resolve, so the corpus (5,760 documents / 14,406 chunks, live as of 2026-09-15) can grow nightly without ever letting the model invent a citation.
```

#### 01 Context

```
RailCite was Case Study 5 of a Cohort 8 product sprint — a nine-day Government / Public Sector brief. Tushar authored the Discovery, Solution and Final PRDs and built the entire MVP solo (104 of 105 commits are his; the other is a Vercel bot), directed with Claude Code.

The starting point was a person, not a market slide. The builder's father is a serving Chief Commercial Inspector, and he and his colleagues became the first users to run real freight, demurrage and wharfage cases against the tool.
```

```
[insight] rc-a-father
  “The builder's father is a serving CCI; he and colleagues ran real freight and demurrage cases against RailCite.”
  — RailCite Final PRD §6   Source: RailCite Final PRD
```

#### 02 Problem

```
The Discovery PRD stated the problem plainly: "A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists, reading scanned circulars, guessing which version is current, and hand-writing a justification note that cites them. It is slow, error-prone, and one wrong/superseded citation damages the inspector's credibility — not the tool's."

The user is "Ravi," a composite of a real CCI — the builder's father and his colleagues: middle-aged, in the Group-C commercial supervisory cadre, not an officer, with a low tolerance for a tool that sounds confident and is wrong.
```

```
[insight] rc-a-ravi
  “Ravi (composite of a real CCI — the builder's father and his colleagues)… low tolerance for a tool that 'sounds confident and is wrong.'”
  — Persona "Ravi", RailCite Discovery PRD   Source: RailCite Discovery PRD
```

#### 03 Discovery

```
The load-bearing insight was that the Railway Board itself won't settle what's in force: its Master Circulars carry the caveat that instructions not included "should not be deemed to have been superseded simply because of their non-inclusion." That reframed the product from search-led ("find the circular faster") to accountability-led ("prove which version governs today") — because the officer who sanctions is the officer who defends.

Discovery rigour is uneven, and stated as such. The father-and-colleagues user testing is real but unrecorded — no interview count, names, dates or transcripts exist, and the planned human-in-the-loop gate of "3 real CCI cases" was still marked pending in the build ledger. The central hypothesis and its eight assumptions (A1–A8) were written before the build; the fielded-interview record was not.
```

```
[insight] rc-a-caveat
  “The Railway Board itself won't settle what's in force: its Master Circulars carry the caveat that instructions not included 'should not be deemed to have been superseded simply because of their non-inclusion.'”
  — RailCite Discovery PRD — insight   Source: RailCite Discovery PRD

[hypothesis] rc-a-hypothesis   status unmeasured → "Unmeasured"
  We believe:      CCIs struggle to justify decisions defensibly because the corpus is un-searchable and silently out-of-date, and because generic AI is confidently wrong.
  We'll know when: when a real CCI completes a real justification using a tool-generated, correctly-cited draft, and the tool refuses rather than fabricates on an uncovered case.
  Source: RailCite Final PRD
```

#### 04 Product bet

```
The defining product decision was to make refusal a feature. RailCite's design North Star states that "refuse is a first-class success state, never an error" — called out in the design document as "the single most important design decision in the document." Rather than always producing an answer, the system is built to say no when no passage governs the case.

This is a cite-or-refuse contract, enforced in code rather than left to the model's good behaviour. The synthesis prompt is explicit: extractive only; if no provided passage actually governs the case, the model must refuse; never claim finality; never invent circular numbers, dates, or provisions.
```

```
[decision] rc-a-refuse
  title:    Refuse is a first-class success state
  Chosen:   Answer with resolved, dated citations and supersession lineage — or refuse when no passage governs the case; refusal is designed as a success, not an error.
  Rejected: • Always return an answer, ranking the best-matching passage even when none truly governs the case
  Why:      For a CCI, a confident wrong citation damages the inspector's credibility, not the tool's — so refusing beats guessing.
  Source: RailCite Design North Star

[generic · Doc] rc-a-extractive
  title: Cite-or-refuse contract, enforced in code
  note:  The synthesis prompt is extractive-only: "If no provided passage actually governs the case, you MUST refuse… Never invent circular numbers, dates, or provisions."
  Source: RailCite synthesis prompt
```

#### 05 What I built

```
The live app is a retrieval pipeline with the trust contract wired through it: a signed-in request is authenticated, embedded and domain-classified in parallel, checked against a scope-aware answer cache, then matched against the corpus (top-k = 8) with a calibrated relevance threshold of 0.32; passages that clear the gate are synthesised by Claude Sonnet 5 through a forced tool that returns a validated "answered | refused" result, after which the citation validator and supersession-lineage lookup run before the answer is cached.

Embeddings are Voyage-3 (1024-dimension) over Supabase Postgres with pgvector; a Claude Haiku classifier routes the query domain, and a hard SQL domain filter keeps one commodity's circulars from bleeding into another's case. There is no reranker. The P0 citation validator drops any answer block whose citations don't resolve to a real source; if every block is dropped, the whole answer becomes a refusal. A nightly GitHub Actions crawl on a self-hosted runner keeps the corpus current.
```

```
[generic · Doc] rc-a-pipeline
  title: Cite-or-refuse retrieval pipeline
  note:  Auth → embed + domain classify → scope-aware cache → match top-k 8 → threshold 0.32 → Claude Sonnet 5 forced-tool synthesis → citation validator → supersession lineage → cache.
  Source: RailCite query pipeline

[generic · Doc] rc-a-validator
  title: P0 citation validator
  note:  Drops any answer block whose citations don't resolve to a real source; all-blocks-dropped becomes a refusal — the cite-or-refuse contract enforced in code, not prompt-only.
  Source: RailCite citation validator

[metric] rc-a-lineage
  193   Supersession lineage links
  explicit supersedes / superseded-by links loaded across the corpus so an answer can show which version governs today; Final-PRD figure, 7 Sep 2026
  [Measured]  as of 7 Sep 2026   Source: RailCite Final PRD
```

#### 06 Evaluation

```
The relevance threshold was calibrated, not guessed: five relevant and three irrelevant queries showed irrelevant scores at ≤0.25 and relevant scores between 0.29 and 0.66, so the gate was set in the gap at 0.32 — down from an initial 0.45. A deliberately nonsensical query was correctly refused, with every hit scoring ≤0.20.

The honest gaps are named. Citation validity is "0 invented citations by construction" — enforced by the validator, not measured over a sample of queries — and there is no groundedness, retrieval-precision or latency evaluation, no usage or funnel data, and no measured time-to-cited-answer. An impeccable UX critique of the live Ask screen scored 22/40 ("Acceptable") and raised one P0, "Flagship starter refuses"; no record of a fix for that defect exists. The test suite ran 345 passed / 1 failed / 2 skipped across 48 files on 2026-09-15, the single failure a stale expectation left over from moving to a self-hosted runner.
```

```
[experiment] rc-a-calibrate
  Setup:    Calibrated the relevance threshold with 5 relevant and 3 irrelevant queries instead of picking a number.
  Result:   Irrelevant ≤0.25, relevant 0.29–0.66; the threshold was set in the gap at 0.32, down from 0.45, and a nonsense query was refused with all hits ≤0.20.
  Learning: A retrieval threshold is a measurable decision, not a vibe — calibrate it against real relevant and irrelevant queries.
  Source: RailCite threshold calibration

[evaluation] rc-a-impeccable
  Method:     Impeccable UX critique of the live Ask screen — a design-quality review, not a groundedness eval.
  Result:     22/40 ("Acceptable"), with one P0 finding, "Flagship starter refuses," and four P1s.
  Limitation: No groundedness, retrieval-precision or latency evaluation and no usage data exist; no record of a fix for the P0 defect exists.
  Source: RailCite impeccable critique

[metric] rc-a-tests
  345 / 1 / 2   Tests: passed / failed / skipped
  railcite-cron vitest run across 48 files on 2026-09-15; the one failure is a stale expectation after the move to a self-hosted runner, not a product defect
  [Measured]  as of 15 Sep 2026   Source: RailCite test run (railcite-cron)
```

#### 07 Outcome

```
RailCite is live at railcite.vercel.app (HTTP 200), and its /api/stats endpoint reported 5,760 documents and 14,406 chunks on 2026-09-15. The Final-PRD ingest run (7 Sep 2026) discovered 6,333 PDFs, ingested 5,687, needed OCR on 3,865 of them (68%), produced 14,078 chunks and loaded 193 supersession-lineage links; the live figures are higher because a nightly crawl keeps ingesting.

The sharpest post-launch fix came from a retrieval bug: a passage from one commodity or volume could surface for a different-domain case. The response was that "bleed has to be impossible, not merely unlikely," implemented as a hard SQL domain filter, per-PDF traceability and a scope-aware cache (commits 2026-09-03). What's still missing is the demand side: there is no recorded usage, no measured time-to-cited-answer and no logged real-CCI test session.
```

```
[metric] rc-a-chunks
  14,406   Chunks indexed (live)
  live /api/stats on 2026-09-15; the corpus is cited live-with-date because the nightly crawl keeps ingesting new circulars
  [Measured]  as of 15 Sep 2026   Source: RailCite live /api/stats (link)

[experiment] rc-a-bleed
  Setup:    Found that retrieval could surface a passage from one commodity or volume for a different-domain case.
  Result:   Fixed with a hard SQL domain filter, per-PDF traceability and a scope-aware cache — "bleed has to be impossible, not merely unlikely."
  Learning: For a trust-first tool, an unlikely wrong answer is still a wrong answer; make the failure structurally impossible, not just rare.
  Source: RailCite Final PRD
```

#### 08 What I learned

```
Two ideas define the build. The first: "the feature is a citation; the product is trust." Everything — extractive synthesis, the validator, supersession lineage, refusal-as-success — serves the inspector's ability to defend a decision, not the appearance of an answer.

The second: staleness is a correctness bug, not a missing feature. As the crawl design put it, "a circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached" — which is why the nightly crawl exists. Two engineering scars stuck too: Claude Sonnet 5 rejecting a temperature parameter was caught only by a live smoke test, and the relevance threshold moved from 0.45 to 0.32 only after calibration against real queries.
```

```
[insight] rc-a-trust
  “The feature is a citation. The product is trust.”
  — RailCite 9-day LinkedIn series, Day 5   Source: RailCite 9-day LinkedIn series

[insight] rc-a-staleness
  “Staleness is not a missing feature — it is a correctness bug… A circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached.”
  — RailCite nightly-crawl design doc   Source: RailCite nightly-crawl design doc

[experiment] rc-a-smoke
  Setup:    Two failures showed up only in the real environment.
  Result:   Claude Sonnet 5 rejected a temperature parameter (caught by a live smoke test, not a unit test); the relevance threshold moved 0.45 → 0.32 after calibration.
  Learning: Some correctness facts only surface against the live model and real data — smoke-test the real thing and calibrate against real queries.
  Source: RailCite build ledger
```

#### Show the thinking

```
Observation — The starting point was a person: the builder's father is a serving Chief Commercial Inspector, and he and his colleagues ran real freight and demurrage cases against the tool.   RailCite Final PRD → #01-context
User problem — A CCI has to defend a demurrage/wharfage decision by walking yearly PDF lists and scanned circulars, guessing which version is current — and one wrong or superseded citation damages the inspector's credibility, not the tool's.   RailCite Discovery PRD → #02-problem
Insight — The Railway Board itself won't settle what's in force, so the job isn't search-led ("find the circular faster") but accountability-led ("prove which version governs today") — the officer who sanctions is the officer who defends.   RailCite Discovery PRD → #03-discovery
Hypothesis — CCIs struggle to justify decisions defensibly because the corpus is un-searchable and silently out-of-date and generic AI is confidently wrong; we'd know we're right when a real CCI completes a correctly-cited justification and the tool refuses rather than fabricates on an uncovered case.   RailCite Final PRD → #03-discovery
Product decision — Refuse is a first-class success state, never an error — the single most important design decision: answer with resolved, dated citations and lineage, or refuse when no passage governs.   RailCite Design North Star → #04-product-bet
Prototype — Shipped a live RAG pipeline: auth → embed + domain classify → scope-aware cache → top-k match at threshold 0.32 → Claude Sonnet 5 forced-tool extractive synthesis → citation validator → supersession lineage, on Voyage-3 embeddings + pgvector, with a nightly crawl.   RailCite query pipeline → #05-what-i-built
Evaluation — Calibrated the threshold with 5 relevant + 3 irrelevant queries (gap → 0.32) and refused a nonsense query; 345 tests pass with 1 stale-expectation failure, but there is no groundedness or latency eval and citation validity is "by construction," not sampled.   RailCite threshold calibration → #06-evaluation
Outcome — Live at 5,760 documents / 14,406 chunks (as of 2026-09-15), kept current by a nightly crawl, after a cross-domain-bleed fix made retrieval domain isolation structural — "bleed has to be impossible, not merely unlikely."   RailCite live /api/stats → #07-outcome
```

`learnings[]` (not rendered): `Make refusal a first-class success state: for a trust-first tool, refusing beats a confident wrong citation that damages the user's credibility.` · `Enforce the trust contract in code, not just the prompt — a P0 validator that drops unresolved citations (and refuses when all are dropped) is stronger than instructions alone.` · `Staleness is a correctness bug, not a missing feature — a superseding circular turns a cited answer confidently wrong, so freshness needs a nightly crawl.` · `A retrieval threshold is a measurable decision: calibrate it against real relevant and irrelevant queries (0.45 → 0.32), don't guess.` · `Some correctness facts only surface against the live model and data — Claude Sonnet 5 rejecting a temperature parameter was caught only by a live smoke test.`

Source labels: `RailCite Discovery PRD` · `RailCite Final PRD` · `RailCite Design North Star` · `RailCite synthesis prompt` · `RailCite citation validator` · `RailCite query pipeline` · `RailCite threshold calibration` · `RailCite impeccable critique` · `RailCite test run (railcite-cron)` · `RailCite live /api/stats` (url `https://railcite.vercel.app`) · `RailCite nightly-crawl design doc` · `RailCite build ledger` · `RailCite 9-day LinkedIn series`. **Next project:** `Nuptis → Velora`.

---

### `/work/velora` — Nuptis → Velora (lines 1003–1353; §8.5 + §8.4; full bodies in source)

```
h1:    Nuptis → Velora
lead:  Two vendor-onboarding products in nine days — and the decision to kill the first.
meta:  Role: Solo build · Duration: Aug 2026 · [live] Live (mock data)

metrics:
  2        Products in nine days — Nuptis (wedding vendor ops) then Velora (apparel sourcing), built solo across the nine-day Case Study 3 sprint; Nuptis was killed on day seven and Velora shipped   [Structural] as of 9 Sep 2026   Source: Case Study 3 — nine-day LinkedIn series
  10/10    Unit tests passing — npx vitest run on the Velora app at the task-6.3 final review, re-run 2026-09-15 — a build-quality signal, not a usage metric (Velora has no users)   [Measured] as of 15 Sep 2026   Source: Velora task-6.3 final review
  156 kB   Gzipped bundle — production bundle 500.63 kB / 156 kB gzip at the task-6.3 final review, with 0 horizontal overflow at 375 and 768 on every route   [Measured] as of 11 Aug 2026   Source: Velora task-6.3 final review

30-sec:
  Discovery today is broken: founders find manufacturers through cold referrals, trade fairs, or Alibaba-style directories where trust is unverified and non-portable.
  Velora is a B2B apparel sourcing marketplace where fashion brands and garment manufacturers swipe to connect and matches turn into bids — the surviving half of a nine-day sprint in which its predecessor, Nuptis (wedding vendor ops), was deliberately killed on day seven. It runs live on mock data; the Supabase path was built but never run against a real project, and its Trust Scores are authored, shown as if verified rather than checked against any government API.
```

Chapters (all 8) and artifacts: 01 `v-a-two-products` (generic Doc "Two products, one sprint") · 02 `v-a-interviews` (insight, attr. "Procurement interviews (team-pooled), Case Study 3 team PRD p.10") · 03 `v-a-queue-time` (insight), `v-a-h1` (hypothesis, unmeasured) · 04 `v-a-kill` (decision "Kill Nuptis, build Velora"), `v-a-errc` (generic Doc "Red/Blue Ocean + ERRC framing") · 05 `v-a-stack` (generic Doc "One-day build: React 19 + Zustand + env-gated Supabase"), `v-a-trust-scores` (decision "Trust Scores are authored, not verified") · 06 `v-a-review` (evaluation) · 07 `v-a-nuptis-link` (generic **Link** "Nine days, two products, one survived" → `/work/nuptis`) · 08 `v-a-kill-without-flinching` (insight `“Nine days. Two products. One survived — learning to kill Nuptis without flinching.”` — Velora / Nuptis nine-day series, Day 9).

Thinking chain: Observation `The starting point was the cohort's procurement interviews: "I find out where a vendor is by asking around… we scrutinise new vendors; changes to old ones, we just… trust."` · User problem `Discovery today is broken: founders find manufacturers through cold referrals, trade fairs, or Alibaba-style directories where trust is unverified and non-portable.` · Insight `Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs (team research, versus an APQC median of ~3 days).` · Hypothesis `H1: the biggest delay is coordination between teams, not any one team working slowly — with every discovery claim tagged [Known] / [Observed] / [Hypothesized] / [Validated] / [Unknown].` · Product decision `"Weddings were blue — but a shallow pool." Kill Nuptis on day seven and pivot the same trust problem to B2B apparel sourcing.` · Prototype `Shipped a live one-day build: React 19 + react-router 7 + Zustand, env-gated Supabase with a mock fallback, a seven-table schema, all 40+ commits on 11 Aug 2026 — no AI, Trust Scores authored.` · Evaluation `Evaluated as a build: 10/10 unit tests, 0 horizontal overflow at 375 and 768, a 156 kB gzip bundle, 2 MUST-FIX cleared — but no pilot and no users.` · Outcome `"Nine days. Two products. One survived." Velora is live on mock data; Nuptis was retired — and there is no usage data on either.`

Source labels: `Velora PRD` · `Apparel Vendor Onboarding Discovery PRD` · `Case Study 3 team PRD` · `Case Study 3 — nine-day LinkedIn series` · `Velora README & package.json` · `Velora Supabase notes` · `Velora task-6.3 final review` · `Velora live app` (url). **Next:** `Cubicle`.

### `/work/cubicle` — Cubicle (lines 1379–1793; §8.3)

```
h1:    Cubicle
lead:  Four AI teammates debate visibly, then produce a PRD, competitor scan, landing copy and build plan in ~90 seconds.
meta:  Role: Team build · Duration: Sep 2026 · [prototype] Built, not launched

metrics:
  326                  Automated tests passing — 326 passed, 3 skipped across 55 test files, plus a clean typecheck, lint and production-dependency audit in CI — an offline build-quality signal, not a live-usage or product metric.   [Measured] as of 12 Sep 2026   Source: Cubicle QA report
  ≥5.18:1 / ≥6.14:1    WCAG AA text contrast (light / dark) — Light-mode and dark-mode text contrast ratios measured against the design system, both above the 4.5:1 AA bar.   [Measured] as of 12 Sep 2026   Source: Cubicle QA report

30-sec:
  Cubicle is a hosted-web-app concept where a solo founder types a product idea and watches four AI teammates — PM, researcher, designer, developer — visibly debate it, then produce a one-page PRD, a competitor scan, landing-page copy and a build plan, shareable by link, in about 90 seconds.
  It was built during a ten-day team buildathon (a team of six; Tushar's own named role inside that team was never recorded) and is code-complete — 326 tests passing, CI green — but the real four-agent run has never been executed against a live model or database, and it was never deployed. This page says that plainly: built, not launched. No live link, no users, no usage numbers.
```

Chapters/artifacts: 01 `cub-a-tagline` (insight `“Your first team fits in a cubicle.”`), `cub-a-team-of-6` (Doc), `cub-a-decks` (**Deck** "Two 13-page pitch decks") · 02 `cub-a-aarav` (insight, persona), `cub-a-secondary-personas` (Doc) · 03 `cub-a-gap-insight` (insight `“Nobody makes the collaboration visible. The word 'why' is missing from the whole table. That is the gap.”`), `cub-a-research` (Doc) · 04 `cub-a-targets` (hypothesis, unmeasured), `cub-a-sequencing` (decision "Trust first, ownership second, autonomy last") · 05 `cub-a-architecture` (Doc), `cub-a-four-artifacts` (decision "Four fixed artifacts, not an open-ended chat"), `cub-a-gateway` (Doc "Gemini-only gateway, one file") · 06 `cub-a-qa-gates` (evaluation) · 07 `cub-a-recommendation` (Doc "Deployment recommendation: CONDITIONALLY READY — STEPS REQUIRED"), `cub-a-no-live-run` (Doc "No live run, no users") · 08 `cub-a-l1` (insight), `cub-a-l2` (Doc), `cub-a-l8` (insight). Thinking chain present (8 nodes; source labels `Cubicle Discovery PRD`, `Cubicle technical-plan.md`, `Cubicle QA report`). **Next:** `Nuptis`.

### `/work/nuptis` — Nuptis (lines 1809–2192; §8.4)

```
h1:    Nuptis
lead:  Vendor ops for wedding-planning agencies — verification status, work orders, payment milestones and backup coverage in one place.
meta:  Role: Solo build · Duration: Aug 2026 · [live] Live (mock data)
metrics: none (header renders no metric row)

30-sec:
  Wedding planning agencies run 15–30+ vendors across 5–7 ceremonies per wedding over spreadsheets and WhatsApp threads, with no structured record of vendor verification, work orders, payment milestones or backup coverage — so one no-show turns into a scramble.
  Nuptis was the first of two products built solo in a nine-day sprint — a risk-tier verification model and a North Star metric were defined, but no pilot ever ran, so every success metric stayed unmeasured. It was killed on day seven in favour of its successor, Velora, though it is still deployed and live on mock data.
```

Notable artifacts: two `prototype` placeholders — `nup-a-contingency-shot` (alt `Nuptis contingency and backup-vendor drawer screenshot (pending capture)`, caption `Contingency / backup-vendor drawer — screenshot capture pending (TKT-24).`, 1568×661) and `nup-a-dashboard-shot` (alt `Nuptis vendor-ops dashboard screenshot (pending capture)`, caption `Vendor-ops dashboard — screenshot capture pending (TKT-24).`) — these are the only `prototype`-type artifacts on the site and render the ImageOff placeholder. Also `nup-a-risk-tier` (insight `“Spending three weeks vetting a card printer and two days vetting a fireworks vendor is backwards.”`), `nup-a-north-star` (hypothesis), `nup-a-cut-list` (decision), `nup-a-no-ai` (decision "No AI in the assistant"), `nup-a-mobile-sweep` (evaluation), `nup-a-design-rigor` (Doc "168 Figma frames, 283 prototype reactions, AA audit"), `nup-a-velora-link` (**Link** → `/work/velora`), `nup-a-self-feedback` (insight), `nup-a-process` (Doc). Thinking chain present. **Next:** `Bhakti Vilas`.

### `/work/bhakti-vilas` — Bhakti Vilas (lines 2210–2592; §8.6)

```
h1:    Bhakti Vilas
lead:  An elder-focused wellness prototype built around bhajan — devotion as behavioural health, not a clinical app.
meta:  Role: Team build · Duration: Jul–Aug 2026 · [prototype] Live prototype (mock data, team build)
metrics: none
30-sec:
  An interactive prototype for an elder-focused wellness platform for India built around bhajan — positioned as devotion-as-behavioural-health rather than a clinical wellness app.
```

All 8 chapters present; Evaluation/Outcome/Learned are single-paragraph. Artifacts include `bv-a-brief` (insight `“The market doesn't appear to have a shortage of products. It appears to have a shortage of clarity.”`), `bv-a-distance-insight` (insight `“Distance was never the variable. Availability was.”`), `bv-a-insure-the-visit` (hypothesis), `bv-a-madhu-mukti-decision` (decision "Health meaning coded, not front-loaded"), `bv-a-live-link` (**Link** → `https://bhakti-vilas.vercel.app/`), `bv-a-mentor-qa` (evaluation), `bv-a-readme-gaps` (Doc "Translation ~90/500 strings; medical copy unreviewed"). Thinking chain present. **Next:** `Token Toli`.

### Thin case studies (summary + "Deep dive coming" only)

**`/work/token-toli`** — `h1 Token Toli` · lead `Ageing-in-place care orchestration for long-distance families — a team discovery PRD with 11 named respondents and three tested hypotheses.` · `Role: Team discovery · Duration: Jul 2026 · [research] Discovery only` · 30-sec:

```
Adult children living away from ageing parents lack a trusted, medically informed view of their parent's health and care; existing solutions coordinate services but do not prioritise medical accountability and reporting.
Eleven named respondents were interviewed for this Guru-pod PRD (co-authored with Gursimran Singh and Suyash P); the wider cohort's discovery work separately logged 44 interviews, but that figure belongs to the team PRD, not to this pod's own fieldwork.
The bet — a medically informed accountability layer sold as a monthly subscription, with guaranteed emergency response as the trust-building differentiator — was not selected by the cohort, which moved forward with a teammate's lending concept instead; the pod's own self-critique judged that 20–30 structured interviews were still needed before pitching it to anyone.
```
Deep-dive box: `…This project is documented as Discovery only.` **Next:** `Pratyasa`.

**`/work/pratyasa`** — `h1 Pratyasa` · lead `A static record of granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage.` · `Role: Solo build · Duration: Aug 2026 · [live] Live` · 30-sec:

```
A public, fast, self-contained web page that showcases granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — as a credible record of work.
Tushar is the second of five co-inventors, having worked across the portable analyser's electronics and firmware, the Android application, sensor preparation, and validation testing in blood and food samples; the page states the rights and safety framing plainly — "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic."
```
**Next:** `Tegaki`.

**`/work/tegaki`** — `h1 Tegaki` · lead `What your handwriting suggests about you — read and written by hand.` · `Role: Solo build · Duration: Sep 2026 · [pilot] Live pilot` · 30-sec:

```
A D2C pilot that productizes a fully manual handwriting-analysis practice — from analysis to a polished report — asking whether a stranger would trust and pay for the experience.
There is no AI in the product — report generation is manual and offline — and the checkout intentionally confirms an order without charging for it while the pilot is being validated; no pilot users or orders have been recorded yet.
```
**Next:** `Dino Arcade`.

**`/work/dino-arcade-pwa`** — `h1 Dino Arcade` · lead `A mobile PWA that turns your phone into an arcade cabinet — strictly BYO-ROM, no game data ships or uploads.` · `Role: Solo build · Duration: Sep 2026 · [live] Live (BYO-ROM)` · 30-sec:

```
A mobile-first Progressive Web App that turns your phone into an arcade cabinet — styled as a backlit cabinet with a marquee, recessed bezel, CRT shader and an on-screen controller. It ships no game data: you supply a file you are legally entitled to use.
Built on vendored EmulatorJS with a self-hosted FBNeo core, IndexedDB storage and a service-worker precache — no backend, no accounts, and no analytics. Test results for the emulator core exist in the repo but were not reviewed for this page.
```
**Next:** `Cinematic Portfolio`.

**`/work/cinematic-portfolio`** — `h1 Cinematic Portfolio` · lead `A scroll-driven film portfolio — AI-generated footage of me as the backdrop, Apple-product-page style, no build step.` · `Role: Solo build · Duration: Aug 2026 · [live] Live` · one header metric:

```
197   Film generation cost
      Higgsfield credits spent generating the scroll film, exactly as pre-flighted before rendering — a build-tooling cost, not a product metric.
      [Measured]  as of 26 Aug 2026   Source: Cinematic build ledger
```
30-sec:
```
A cinematic 3D-scroll personal portfolio — AI-generated film of Tushar as the backdrop, scroll-driven like an Apple product page, with a reduced-motion static fallback and no build step.
Built to answer a recruiter's first question — "who is Tushar Pathak?" — and checked with three QA passes (8/8, 11/11, 12/12) plus a scrub-performance benchmark averaging 0.04 ms per frame with zero frames over 16 ms. Live since 26 August 2026.
```
**Next:** `TeachSpark` (wraps).

---

## `/about` — About / Experience

**Purpose (SITEMAP.md):** "The person, the journey, the proof." Meta description: `Senior Product Manager and AI builder — the career arc from enterprise programs to AI-native products, and the experience behind it.`

**Section order (`app/about/page.tsx`):** `AboutHero` → `ProductJourney` → `CapabilityClusters` (`#capability-clusters`) → `Impact` (`#impact`) → `ExperienceTimeline` (`#experience`) → `Awards` (`#awards`) → `Research` (`#research`) → `Education` (`#education`) → page-foot CTA (`#about-cta`) + colophon.

### AboutHero (`components/about/AboutHero.tsx`) — same 42/58 avatar grid as the home hero

```
eyebrow pill (accent dot):  About
h1 (three stacked lines; the third carries the accent wash):
  I started with machines.
  Then systems. Then people.
  Now, intelligent products.                       (DRAFT — editorial, unsigned)
subline (Caveat, 1.5rem, in the a11y tree):
  Same curiosity → bigger problems.                (DRAFT)

3-stat row (value / label; derived, not MetricCards):
  10+   years building products      (2026 − 2016, earliest role start; "+" because AmEx is open-ended)
  3     industries — physical → cloud → AI
  ∞     curiosity

Pull-quote (card-tier lavender ClayCard, Quote icon):
  I build at the intersection of people, products and intelligent systems.     (DRAFT)
```

### ProductJourney (`components/timeline/ProductJourney.tsx`; source CONTENT_INVENTORY §4.2, VERIFIED resume/audit — the 2019–2022 gap note is deliberately omitted)

```
eyebrow:  My product journey
h2:       Different tools. Same curiosity.
lead:     Four stages, from enterprise delivery to AI-native products.
```

Four round 56px utility tiles joined by a static dashed SVG (≥1024) / left hairline (<1024). Each stage: big `year` → `milestone` → caption `{range} · {label}` → `description`.

| year | milestone | icon / tone | range · label | description |
|---|---|---|---|---|
| `2016` | `Products` | Cog / peach | `Sep 2016 – Dec 2018 · Physical / enterprise` | `Godrej Infotech — Assistant PM on the Godrej Smartnet platform; 12 features shipped in 11 months.` |
| `2022` | `Cloud & Data` | Cloud / sky | `Aug 2022 – Jun 2026 · Cloud & data` | `Quantiphi (GCP) — cloud-native programs across data engineering, API modernization, and GenAI initiatives; Shellkode (AWS) delivery programs.` |
| `2026` | `Enterprise Platforms` | Building2 / lavender | `Jun 2026 – present · AI-enabled` | `American Express — Devin GenAI adoption across the MARS engineering ecosystem.` |
| `Now` | `AI-Native Products` | BrainCircuit / mint | `Aug – Sep 2026 · AI-native` | `TeachSpark (Claude-generated worksheets on WhatsApp), RailCite (cite-or-refuse RAG), Cubicle (multi-agent, unlaunched).` |

Closing line (lead size, DRAFT): `The tools changed. The curiosity didn't.`

### CapabilityClusters — "What I Bring" (`components/about/CapabilityClusters.tsx` + `data/skills.ts`; CONTENT_INVENTORY §4.3, VERIFIED)

```
eyebrow:  Skills
h2:       What I Bring
lead:     Product, AI, technology, and execution — the range behind the roadmap.
```

Four utility `ClayTile`s (2×2 ≥640px):

```
Product  (sky)                            source: RESUME Core Competencies
  Strategy, vision & roadmap
  Discovery & requirements
  Governance & delivery
  End-to-end lifecycle
  Data-driven decisions

AI & GenAI  (lavender)                    source: TS/src/adapters/anthropic.ts, anthropic-paper.ts; RC/lib/embeddings.ts, synthesize.ts, validate.ts; CS6/cubicle/lib/gateway/transport.ts; RESUME
  Shipped LLM features: structured outputs, vision, QC pass (TeachSpark)
  RAG with citation validation (RailCite)
  Multi-agent orchestration design (Cubicle)
  Enterprise GenAI adoption (Devin at AmEx; GenAI initiatives at Quantiphi)

Technology  (mint)                        source: RESUME Technical Skills; GR/README.md (18 RLS migrations); RC/migrations/001_init.sql
  GCP & AWS
  Microservices vs. legacy monoliths
  BigQuery, Cloud Spanner & SQL
  Looker
  Supabase/Postgres (RLS, pgvector)
  Next.js/React, Vercel/Railway

Execution  (peach)                        source: RESUME Agile Methodologies, PM Tools
  Agile & Scrum
  SAFe
  Kanban
  Program governance & cross-functional leadership
  Jira / Azure DevOps
```

(`SAFe` is a methodology label only — never a certification claim; the forbidden-strings gate enforces this.)

### Impact (`components/about/Impact.tsx` + `data/impact.ts`; CONTENT_INVENTORY §4.4)

```
eyebrow:  Evidence
h2:       Impact
lead:     Numbers from AmEx, Godrej, TeachSpark, and RailCite — each dated and labelled by how it was verified.
```

**Tier 1 — shipped-product evidence** (`source !== "RESUME"`): full clay `MetricCard`s in an `ArtifactGrid`, in this order:

```
17          Teachers joined — joined the WhatsApp pilot in its first week; Final-PRD snapshot 2026-08-24, test handsets excluded   [Measured] as of 24 Aug 2026   Source: TeachSpark Final PRD
8 (47%)     Activated — of 17 joined reached an activation event (12 onboarded first, 71%); snapshot 2026-08-24, test handsets excluded   [Measured] as of 24 Aug 2026   Source: TeachSpark Final PRD
37.5 min    Median time saved — self-reported median time saved per activated teacher; snapshot 2026-08-24, test handsets excluded   [Self-reported] as of 24 Aug 2026   Source: TeachSpark Final PRD
3           Referrals — teacher-reported referrals during the first-week pilot; snapshot 2026-08-24, test handsets excluded   [Self-reported] as of 24 Aug 2026   Source: TeachSpark Final PRD
5,760       Documents indexed — live corpus of Indian Railways commercial circulars from /api/stats; grows as the nightly crawl ingests new PDFs   [Measured] as of 15 Sep 2026   Source: RailCite live /api/stats (link → https://railcite.vercel.app)
14,406      Chunks indexed (live) — live /api/stats on 2026-09-15; the corpus is cited live-with-date because the nightly crawl keeps ingesting new circulars   [Measured] as of 15 Sep 2026   Source: RailCite live /api/stats (link)
68%         Ingested PDFs needing OCR — 3,865 of 5,687 ingested PDFs required OCR; Final-PRD ingest run, 7 Sep 2026   [Measured] as of 7 Sep 2026   Source: RailCite Final PRD
0           Invented citations — by construction (lib/validate.ts)   [Structural] as of 15 Sep 2026   Source: RailCite citation validator
```

**Tier 2 — "From my résumé"** (`source === "RESUME"`): flat `inline` MetricCards under a secondary heading:

```
h3:    From my résumé
body:  Self-reported outcomes from earlier enterprise roles at American Express and Godrej, dated to my résumé snapshot.
```

```
35+     AR capabilities delivered — AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé   [Self-reported] as of 15 Sep 2026   Source: Résumé — Impact metrics
180+    User stories — AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé   [Self-reported] as of 15 Sep 2026
4       Agile teams — AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé   [Self-reported] as of 15 Sep 2026
-30%    Feature delivery cycle time — AmEx MARS Accounts Receivable migration, Jun 2026–present; self-reported in résumé   [Self-reported] as of 15 Sep 2026
40+     Cloud-native microservices/API capabilities — AmEx MARS Accounts Receivable migration; self-reported in résumé   [Self-reported] as of 15 Sep 2026
-30%    Development effort (Devin GenAI) — Devin GenAI adoption in the MARS engineering ecosystem; measurement method not recorded; self-reported in résumé   [Self-reported] as of 15 Sep 2026
+25%    Developer productivity (Devin GenAI) — Devin GenAI adoption in the MARS engineering ecosystem; measurement method not recorded; self-reported in résumé   [Self-reported] as of 15 Sep 2026
12      Features shipped in 11 months — Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé   [Self-reported] as of 15 Sep 2026
+25%    Service-monitoring effectiveness — Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé   [Self-reported] as of 15 Sep 2026
+30%    Team productivity — Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé   [Self-reported] as of 15 Sep 2026
-20%    Turnaround time — Godrej Smartnet platform, Sep 2016–Dec 2018; self-reported in résumé   [Self-reported] as of 15 Sep 2026
```

(All tier-2 rows: `Source: Résumé — Impact metrics`; `asOf` is the résumé snapshot `2026-09-15`, flagged in the data file as a placeholder for Tushar to confirm.)

### ExperienceTimeline (`components/timeline/ExperienceTimeline.tsx` + `data/experience.ts`; CONTENT_INVENTORY §4.5; every outcome `self-reported`)

```
eyebrow:  Experience
h2:       Where I've built
lead:     Four roles, newest to oldest — open any node for the context, scale, and what changed.
```

**Observed inconsistency (not fixed):** the lead says "newest to oldest" but `data/experience.ts` is ordered oldest → newest and the rail renders in that array order (Godrej → Quantiphi → Shellkode → AmEx).

Rail: four `TimelineNode` buttons (label = company [+ `(companyNote)`], date via `formatRange`), horizontal ≥1024 / vertical accordion <1024; one `StoryCard` open at a time (lavender card, `role="region"`, close button `aria-label="Close {company} details"`). Deep links `#experience-{id}`.

StoryCard = `h3 "{company (note)} — {title}"` then a `<dl>`: `Context` · `Role` (= `responsibility`) · `Scale` · `What changed` · `Outcomes` (list; each with a kind badge unless the text already says "self-reported").

```
Node: Godrej Infotech            Sep 2016 – Dec 2018
  h3: Godrej Infotech — Assistant Product Manager
  Context:       Product ownership of the Godrej Smartnet platform.
  Role:          End-to-end product lifecycle ownership, roadmap definition, and driving Scrum adoption across the portfolio.
  Scale:         not recorded
  What changed:  Agile/Scrum practices institutionalized across the portfolio.
  Outcomes:      12 features shipped in 11 months [Self-reported]
                 +25% service-monitoring effectiveness [Self-reported]
                 +30% team productivity [Self-reported]
                 -20% turnaround time [Self-reported]
  source label:  Résumé — Godrej Infotech

Node: Quantiphi Analytics        Aug 2022 – Apr 2026
  h3: Quantiphi Analytics — Technical Project Manager, GCP Division
  Context:       Enterprise cloud-native programs spanning data engineering, API modernization, and GenAI initiatives.
  Role:          Program governance, charters, risk management, and cross-team dependencies.
  Scale:         not recorded
  What changed:  DynamoDB→Cloud Spanner migrations; SQL Server transformation frameworks; HIPAA-compliant healthcare data migration; a GCP capability-building program.
  Outcomes:      Reduced latency and optimized operational costs (unquantified) [Self-reported]
                 Zero data loss during migrations (unquantified) [Self-reported]
  source label:  Résumé — Quantiphi Analytics

Node: Shellkode                  Apr 2026 – Jun 2026
  h3: Shellkode — Technical Project Manager, AWS Division
  Context:       AWS delivery programs.
  Role:          End-to-end program delivery; Agile/DevOps/CI-CD frameworks; executive and client engagement.
  Scale:         not recorded
  What changed:  Org-wide adoption of the internal PM platform "Pulse"; standardized stories, acceptance criteria, docs, and repos.
  Outcomes:      Standardized delivery practices across programs via org-wide "Pulse" adoption (qualitative outcome; no quantified metric recorded) [Self-reported]
  source label:  Résumé — Shellkode

Node: American Express (via IntraEdge)    Jun 2026 – present
  h3: American Express (via IntraEdge) — Senior Product Manager (Accounts Receivable)
  Context:       Legacy Triumph platform being migrated to the cloud-native MARS microservices platform.
  Role:          Owns the Accounts Receivable transaction-capability roadmap: requirements, backlog, and Devin GenAI integration.
  Scale:         35+ capabilities, 180+ user stories, 4 Agile teams, 40+ microservices/APIs
  What changed:  Legacy retirement accelerated; AI-assisted development (Devin) adopted across the MARS engineering ecosystem.
  Outcomes:      -30% feature delivery cycle time (self-reported)         (badge suppressed — text already says it)
                 -30% development effort with Devin GenAI adoption (self-reported)
                 +25% developer productivity (self-reported)
  source label:  Résumé — American Express (via IntraEdge)
```

### Awards (`components/about/Awards.tsx` + `data/credentials.ts`; §4.6, VERIFIED résumé; certificates MISSING)

```
eyebrow:  Recognition
h2:       Awards
lead:     Text only — the underlying certificates aren't digitised yet.
```

Three butter utility tiles (title + year):

```
Google Cloud Partner All-Star: Delivery Excellence        2024
Annual Unsung Hero Award, Quantiphi Analytics Solutions   2024
12 in 11 Award, Godrej Infotech                            2018
```

(PMP / SAFe-Agilist certification claims are explicitly EXCLUDED — not in the résumé.)

### Research (`components/about/Research.tsx`; §4.7)

```
eyebrow:  Before product management
h2:       Research
lead:     A granted patent and two peer-reviewed papers from the M.Tech years.
```

Patent — lavender card-tier `ClayCard`:

```
A Low-Cost Portable Electrochemical Biosensor for Rapid Detection of Endotoxin and Method Thereof
Patent IN 429867 · Application 202241053140 · Filed 16 Sep 2022 · Granted 24 Apr 2023
Patentee: NIT–Calicut. Inventors: Dr. N. Sandhyarani, Tushar Pathak, Haritha K, Dr. Arun R, Dr. M. K. Ravi Varma.
[View Pratyasa — the patent record ↗]  → https://pratyasa.vercel.app
```

**Truth non-negotiable:** `IN 429867` is the only patent number ever rendered (the résumé misprints the SL No. `044152784` as the patent number — that string never appears).

Papers (flat list):

```
A Point-of-Care Aptasensor for the Real-Time Detection of Sepsis Biomarker
Kuttoth, H.; Pathak, T.; Sandhyarani, N. Langmuir 2025, 41(26)
[DOI 10.1021/acs.langmuir.5c00784 ↗]  → https://doi.org/10.1021/acs.langmuir.5c00784

Topological Phases in Nanoparticle Monolayers: Why Crystalline, Hexatic, and Isotropic-Fluid Phases Coexist at the Same Temperature
Soft Matter, RSC 2023
[DOI pending]  (static Tag — authors + DOI are MISSING on the résumé; never fabricated)
```

Disclaimer (caption, always rendered):

```
Patent owned by NIT–Calicut; research prototype, not an approved diagnostic.
```

### Education (`components/about/Education.tsx`; §4.8)

```
eyebrow:  Foundation
h2:       Education
(no lead)

M.Tech., Nanotechnology
National Institute of Technology Calicut, Kozhikode · 2022

B.E., Mechanical Engineering
Bhilai Institute of Technology, Durg · 2016

Languages: English, Hindi, Bengali.
```

### Page-foot CTA + colophon (`app/about/page.tsx`, `Section#about-cta`)

```
h2:       Let's build what's next.
actions:  [Let's talk] (primary → /contact)   [Resume — updating] (secondary)
colophon: Designed and built with Claude Code.        (decision TP10 — this exact wording, only here)
```

---

## `/thinking` — Product Thinking

**Purpose (SITEMAP.md):** "Editorial list of short essays." Meta description: `An honest editorial list — five DRAFT essays, each backed by a real quoted passage, none published yet.`

**Section order (`app/thinking/page.tsx`):** `ThinkingHero` (h1 only) → `<section aria-label="Essays">` [sr-only h2 `Essays` · `ThinkingList`].

### ThinkingHero

```
h1:  Thinking
```
(No lead line — none is sourced.)

### ThinkingList (`components/thinking/ThinkingList.tsx` + `data/writing.ts`; CONTENT_INVENTORY §5 — no article has been published; every essay `draft: true`, no `publishedOn`)

Empty-state line (rendered because 0 essays are published):

```
Essays in progress — five drafts, none published yet.
```

Numbered rows (numeral `01`… in ink-3 → h3 title + `Draft — pending sign-off` Tag → dek), each row a link to `/thinking/{slug}`:

| # | slug | title | dek | readingMinutes | relatedProject |
|---|---|---|---|---|---|
| 01 | `green-tests-prove-it-runs` | `Green tests prove it runs. They don't prove it's right.` | `A note on why a fully green test suite still missed the defects that mattered.` | 2 | teachspark |
| 02 | `worse-numbers-before-submitting` | `I made my own numbers worse the day before submitting` | `A note on re-checking a pilot metric and reporting the smaller, honest number instead.` | 2 | teachspark |
| 03 | `refusal-is-a-feature` | `Refusal is a feature: designing an AI that would rather say no` | `A note on why RailCite is built to refuse an answer rather than guess a citation.` | 2 | railcite |
| 04 | `killing-nuptis` | `Killing Nuptis: two products in nine days and why one had to die` | `A note on shutting down one product nine days after starting it, and building its replacement.` | 2 | nuptis |
| 05 | `staleness-is-a-correctness-bug` | `Staleness is a correctness bug, not a missing feature` | `A note on why an out-of-date citation is a bug, not a nice-to-have.` | 1 | railcite |

Essays have no `tags` field. Hover: numeral → accent, row tints lavender 4%.

---

## `/thinking/[slug]` — Essay

**Section order (`app/thinking/[slug]/page.tsx`):** one `Container` → `EssayBody` (`<article>`): header [h1 title · `{readingMinutes} min read` · `Draft — pending sign-off` Tag] → `Prose` (≤600px) [each `passage` as a butter-bar blockquote with `Source: {label}` caption → one framing paragraph prefixed `Draft — pending sign-off: `] → `Related project: {name} →` link.

### Representative post — full structure: `/thinking/green-tests-prove-it-runs`

```
h1:       Green tests prove it runs. They don't prove it's right.
meta:     2 min read   [Draft — pending sign-off]

blockquote:
  “364 tests passed. Then I opened the actual file… Green tests prove it runs. They don't prove it's right.”
  Source: TeachSpark — 9-Day Build Series (LinkedIn draft)

blockquote:
  “The two most important defects this session… were both found by reading the code/reasoning, not by any test.”
  Source: Cubicle — lesson-learnt.md

framing paragraph:
  Draft — pending sign-off: Draft — pending sign-off: this is a placeholder note, not the finished essay. It connects two separate build sessions — TeachSpark and Cubicle — around one recurring observation: a fully green test suite still let through the defects that turned out to matter most, and those were only caught by reading the code and the reasoning directly, not by any test passing or failing. The full essay, worked examples, and conclusion are not yet written.

link:     Related project: TeachSpark →   (→ /work/teachspark)
```

**Note for the designer:** the component prefixes `Draft — pending sign-off: ` and every `framing` string in `data/writing.ts` *also* begins with `Draft — pending sign-off: `, so the phrase renders **twice** in a row on every essay page. This is what the current code produces; reproduce it or flag it, but do not silently fix it in data.

### The other four essays — passages + framing verbatim

**`worse-numbers-before-submitting`** (`2 min read`, related `TeachSpark`)

```
“Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30. Papers went from 5 to 2.”   Source: TeachSpark — Final PRD §0
“Honest smaller numbers earn more trust than impressive fake ones.”   Source: TeachSpark — 9-Day Build Series (LinkedIn draft), Post 9
framing: Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around a TeachSpark pilot moment — a late re-check found the activation and time-saved numbers had actually gotten worse than an earlier snapshot, and the decision was to report the smaller, honest numbers rather than the earlier, better-looking ones. The full essay, reasoning, and conclusion are not yet written.
```

**`refusal-is-a-feature`** (`2 min read`, related `RailCite`)

```
“Refuse is a first-class success state, never an error… the single most important design decision in the document.”   Source: RailCite — Design.md L21-24
“The feature is a citation. The product is trust.”   Source: RailCite — 9-Day LinkedIn Series, Day 5
framing: Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around RailCite's core design decision — treating a refusal to answer as a first-class successful outcome, not a failure, whenever the system cannot back an answer with a valid citation. The full essay, reasoning, and conclusion are not yet written.
(third declared source, not attached to a passage: RailCite — lib/synthesize.ts L8-21)
```

**`killing-nuptis`** (`2 min read`, related `Nuptis`)

```
“Weddings were blue — but a shallow pool. Few events, low willingness to pay… the same trust problem, aimed at apparel vendor onboarding.”   Source: Nuptis/Velora — 9-Day LinkedIn Series, Day 7
“learning to kill Nuptis without flinching.”   Source: Nuptis/Velora — 9-Day LinkedIn Series, Day 9
framing: Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around the decision to stop building Nuptis (wedding vendor onboarding) and redirect the same underlying trust problem toward Velora (apparel vendor onboarding), within the same nine-day build window. The full essay, reasoning, and conclusion are not yet written.
```

**`staleness-is-a-correctness-bug`** (`1 min read`, related `RailCite`)

```
“A circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached.”   Source: RailCite — daily-crawl cron design spec L16-19
framing: Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around RailCite's daily-crawl design — the observation that a superseded rule left uncrawled can make the system return a confidently wrong, citation-backed answer, which is why freshness is treated as a correctness requirement rather than a nice-to-have. The full essay, reasoning, and conclusion are not yet written.
```

---

## `/playground` — Product Playground

**Purpose (SITEMAP.md):** `"Small experiments. Big questions."` Meta description: `Four shipped experiments — Pratyasa, Tegaki, Dino Arcade and Cinematic Portfolio — each linking straight to its live build.`

**Section order (`app/playground/page.tsx`):** `PlaygroundHero` (h1 only) → `<section aria-label="Experiments">` [`PlaygroundGrid`].

### PlaygroundHero

```
h1:  Small experiments. Big questions.
```

### PlaygroundGrid (`components/playground/PlaygroundGrid.tsx`) — 2×2 ≥768px / 1-col; each tile is one external link (`target=_blank`, sr-only `(opens in new tab)`), card-tier interactive `ClayTile`, h2 name + tagline. Fixed order and tones:

```
Pratyasa  (butter)  → https://pratyasa.vercel.app
  A static record of granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage.

Tegaki  (peach)  → https://tegaki-one.vercel.app
  What your handwriting suggests about you — read and written by hand.

Dino Arcade  (blush)  → https://007u5h4r.github.io/dino-arcade-pwa/
  A mobile PWA that turns your phone into an arcade cabinet — strictly BYO-ROM, no game data ships or uploads.

Cinematic Portfolio  (mint)  → https://tushar-pathak.vercel.app/
  A scroll-driven film portfolio — AI-generated footage of me as the backdrop, Apple-product-page style, no build step.
```

No status badges, tags, or dates are rendered on this page. Three projects are excluded by rule and have no path onto the page (Slag City, Mock Interview, Game — CONTENT_INVENTORY §6).

---

## `/contact` — Contact

**Purpose (SITEMAP.md):** "Reach Tushar." No form in v1 (decision S10). Meta description: `Email, LinkedIn, or a resume — the fastest ways to reach Tushar Pathak.`

**Section order (`app/contact/page.tsx`):** `<section id="contact" aria-label="Contact">` → `ContactCard`.

### ContactCard (`components/contact/ContactCard.tsx`) — one centred hero-tier lavender `ClayCard` (max 640px), all text centred

```
h1:  Still curious?

Actions (2×2 ≥768px / stacked; 12px gaps; all ≥44×44):
  1. CopyButton      label "Copy" (→ "Copied" 2s → back; on failure "Copy failed" + selectable
                     "Tushar_Pathak@outlook.com" + "Select to copy")   aria-label "Copy Tushar_Pathak@outlook.com"
  2. [Email me]      secondary → mailto:Tushar_Pathak@outlook.com
  3. [LinkedIn]      secondary, external → https://www.linkedin.com/in/pathaktushar   (+ sr-only "(opens in new tab)")
  4. #resume block:  [Resume — updating]  secondary → /contact#resume  (title = note)
                     visible note below the button:  Sanitised resume coming — email me for a copy

Location line:  Bengaluru, India
```

**Resume control logic:** `id="resume"` sits on the resume action wrapper (not the card) — it is the deep-link target every placeholder resume button site-wide points at. When `site.resumeAvailable` flips to `true`, all six resume controls become `Download Resume ↓` → `/resume.pdf` with `download`, and the note disappears. **Form fields:** none (there is no contact form).

**PII rule (CONTENT_INVENTORY §7):** email, LinkedIn, and city only — no phone, DOB, or street address anywhere on the site.

---

## Appendix A — Provenance vocabulary and where each status is visibly labelled

| Copy | Status | How the UI marks it |
|---|---|---|
| Hero eyebrow, headline, support line | DRAFT | not visibly badged on the hero |
| HowIThink `principle` lines | DRAFT | `Draft` badge + `— my own framing, not yet signed off` inside the sticky card |
| FinalCTA headline | DRAFT | `Draft` badge + `Closing copy is my framing, not yet signed off.` |
| AboutHero headline, subline, pull-quote; ProductJourney closing line | DRAFT | not visibly badged (documented in component comments) |
| All 11 Ask answers | DRAFT | `Draft` badge beside the `Answer` heading |
| All 5 essays | DRAFT | `Draft — pending sign-off` Tag on list rows and essay header; framing paragraph prefixed |
| Every metric | kind badge | `Measured` / `Structural` / `Self-reported` + `as of {date}` + `Source:` |
| Résumé-only facts (experience, impact tier 2, awards, education) | VERIFIED (résumé) | `Self-reported` badges; Impact tier-2 heading `From my résumé` |
| Soft Matter DOI/authors | MISSING | `DOI pending` Tag |
| Nuptis screenshots | MISSING | `PrototypeFrame` placeholder with the `(pending capture)` alt |
| All hero media | MISSING | `Hero media coming` |
| Thin case studies | — | `Deep dive coming` box |

## Appendix B — Source file index (for anything the designer wants to re-check)

```
data/hero.ts                     home hero copy (with source/status per row)
data/knowledge.ts                11 Ask Q→A entries
data/thinking-framework.ts       6 How-I-Think stages
data/projects.ts                 14 project records (lines: teachspark 73–521 · railcite 536–985 · velora 1003–1353 · cubicle 1379–1793 · nuptis 1809–2192 · bhakti-vilas 2210–2592 · token-toli 2598–2637 · pratyasa 2643–2682 · tegaki 2688–2724 · dino-arcade-pwa 2730–2766 · cinematic-portfolio 2772–2820 · professional 2831–2933)
data/experience.ts               4 roles for the /about timeline
data/impact.ts                   19 /about impact metrics + 5 impact sources
data/skills.ts                   4 capability clusters
data/credentials.ts              awards, patent, papers, disclaimer, education, languages
data/writing.ts                  5 essays
data/schema.ts                   zod schemas: Project, Artifact union, CHAPTER_IDS, THINKING_STAGES, Experience, Essay, KnowledgeEntry
lib/site.ts · lib/nav.ts · lib/anchors.ts · lib/filters.ts · lib/format.ts · lib/seo.ts · lib/og.tsx
app/globals.css                  tokens + motion/reduced-motion rules
SITEMAP.md · CONTENT_INVENTORY.md (§1–§7 page maps; §8 case-study packs; §9 Ask index; §10 MISSING checklist)
```
