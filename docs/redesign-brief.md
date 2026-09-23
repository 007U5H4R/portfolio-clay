# Redesign-Readiness Brief — Stage B (remaining screens)

**Milestone:** M-008 Visual redesign ("WoW factor") · branch `m-008-visual-wow`
**Purpose:** Make Stage B (`TASK-54…59, 61`) turnkey. For each screen this catalogues (a) what it is *today*, (b) what its redesign ticket/HANDOFF says the mockup wants, and (c) the specific decisions that **cannot** be made until the mockup is in hand.
**Author:** readiness catalogue only — no code changed, no visual direction invented.
**Date:** 2026-09-23

> **Blocking fact — the mockups are not in the repo.** HANDOFF §2/§5 and `docs/ledger.md` reference "Tushar's 8-panel redesign mockups" and map them to screens by number (mockup 1–8), but no mockup image exists under the project root, and the ledger's NEXT note says Stage B "needs mockup paths". The only redesign spec on disk is the hero-avatar animation spec at `/Users/tushar/Downloads/animation prompt.md` (hero only). **Everything in the "Gap / open questions" sections below stays blocked until the mockup files are dropped in and their paths recorded here** (see "What I need from you" at the end).
>
> **Mockup → screen map (from HANDOFF §5 B):** 1 = Hero (done, TASK-51) · 2 = Featured Work · 3 = How I Think · 4–5 = About · 6 = Work · 7 = Case study · 8 = Contact. Thinking/Playground/404 have **no mockup** — TASK-61 says "adopt the new system", intent-only.

> **Guardrails that constrain every screen** (HANDOFF §7): 13 colour-token gate (no new `--color-*`, use `color-mix`) · content-truth + **no new PII** (the mockups' gmail/city are explicitly *not* to be used) · reduced-motion + touch fallbacks · keep the avatar LCP `priority` · all routes stay statically prerendered (TP1) · four screen states where data-backed · responsive 390–1440 · footer stays "Built with curiosity."

---

## 1. Home
Tickets: **TASK-51** (hero — In Progress, largely shipped, mockup 1) · **TASK-54** (Featured Work, mockup 2) · **TASK-55** (How I Think, mockup 3). Page: `app/page.tsx` — order Hero → Ask → FeaturedWork → HowIThink → FinalCTA.

**Current state**
- Hero (`components/hero/Hero.tsx` + `AvatarScene`/`AvatarStage`/`FloatingTiles`/`Annotation`) already redesigned: aurora bg, badge eyebrow, glow halo, claymorphic bust avatar, pointer-parallax "alive" motion. Deferred pose/expression swaps are stubbed at the `ClayFrame` seam (HANDOFF §3/§5 A-bis).
- Featured Work (`components/projects/FeaturedWork.tsx` → `ProjectCard mode="featured"`): server component, one editorial row at ≥1024 — the one `gridSize:'large'` project spans 2 of 4 cols, the two `medium` cards 1 col each; stacks to 1 col below 1024. Cards are the standard clay card anatomy (icon, name, tagline, tags, status, hover-rise).
- How I Think (`components/home/HowIThink.tsx`): client component, 6 `ClayTile` disclosure buttons (one per framework stage, keyed to a `tone`), one shared expand card below revealing that stage's sourced quote + case-study link; roving-tabindex keyboard, one-open-at-a-time, CSS grid-rows expand. Draft badge on principle lines.
- Data is server-resolved: `HOME_PROMPTS` (Ask) and `HOW_I_THINK_STAGES` (from `data/thinking-framework.ts`, project slugs resolved to display names).

**Redesign intent**
- Hero (TASK-51, mockup 1): match mockup 1; Ask surface integrated/adjacent; responsive 390–1440; LCP avatar preserved. *Largely done — confirm against mockup 1.*
- Featured Work (TASK-54, **mockup 2**): the featured trio (RailCite / TeachSpark / Velora) rendered as **"product scenes"**, not three identical rectangles. Live URLs retained, responsive, content truth intact. HANDOFF §5 B: *prefer real interactive UI for product scenes over generated images; Higgsfield only for clay props (TASK-60).*
- How I Think (TASK-55, **mockup 3**): the six stages (Problem → Insight → Bet → Build → Evaluate → Impact) as a **connected journey path**; each step reveals a real sourced example; keyboard/a11y preserved.

**Gap / open questions (need mockup 2 & 3)**
- Featured Work: What *is* a "product scene" visually — a device mockup, an app-screenshot frame, an isolated clay prop per product, an animated preview? Layout structure (still one lead + two, or stacked full-bleed scenes?). Which real per-product imagery/screenshots exist vs. need creating? Does each card keep the full clay-card anatomy or become a looser scene?
- How I Think: Path geometry (horizontal timeline, vertical spine, S-curve, node graph?). Is the sourced example still a click-to-expand card, or inline along the path? Desktop path vs. mobile stack shape. Any connector animation (must have a reduced-motion fallback).
- Both: exact copy/eyebrow/heading changes vs. current; whether section order on the page changes.

---

## 2. About
Ticket: **TASK-56** (P1, sp:5, **mockups 4–5**). Page: `app/about/page.tsx` — AboutHero → ProductJourney → CapabilityClusters → Impact → ExperienceTimeline → Awards → Research → Education → CTA.

**Current state**
- `components/about/AboutHero.tsx`: flat hero variant of the home hero — reuses `AvatarStage` (same avatar), single ≤600px `Prose` bio, no floating tiles / no CTA row. 42/58 two-col grid at ≥lg.
- `components/timeline/ProductJourney.tsx`: decorative reduced-scale connector-line, 4 hard-coded career-arc stages (physical/enterprise → cloud & data → AI-enabled → AI-native), reveal-only, sourced from `CONTENT_INVENTORY §4.2`.
- `components/timeline/ExperienceTimeline.tsx`: client, interactive — one connecting line, 4 `TimelineNode`s from `data/experience.ts`, each expands to a `StoryCard`; full keyboard + roving focus, one-open-at-a-time, `#experience-<id>` deep links (consumed by `/work` ExperienceStrip and Ask evidence — **must not break**).
- Impact metrics carry `source`/`asOf` and are truth-gated.

**Redesign intent**
- Editorial opening hero + a **visual** product-journey timeline per mockups 4–5. Impact metrics keep source/asOf/truth; responsive; a11y.

**Gap / open questions (need mockups 4 & 5)**
- Which mockup is the hero (4) and which is the timeline (5)? Editorial hero layout: big type, portrait placement, is the avatar reused or a new treatment?
- "Visual timeline": does it **replace** `ProductJourney`, `ExperienceTimeline`, or both — or merge the decorative arc with the interactive role cards? Critical: the `#experience-<id>` anchors and keyboard/expand behaviour are load-bearing (deep-linked elsewhere) — does the redesign preserve the interaction model or restyle only?
- Visual language of the timeline (vertical spine, horizontal scroll, alternating cards, imagery per node?), and how impact metrics are presented within it.
- Any copy changes to bio / stage descriptions (current copy is DRAFT, sourced — no new facts allowed).

---

## 3. Work (index)
Ticket: **TASK-57** (P2, sp:3, **mockup 6**). Page: `app/work/page.tsx` — WorkHero → FilterTabs → WorkGrid/EditorialGrid → ExperienceStrip.

**Current state**
- `components/projects/WorkHero.tsx`: flat, no-clay — h1 "Work" + one lead line.
- `components/projects/FilterTabs.tsx` + `WorkGrid.tsx`/`EditorialGrid.tsx`: URL-synced `?filter=` (AI/Enterprise/Cloud/Experiments), client-filtered. `EditorialGrid` is a 12-col positional layout (first card hero 8×2, next two rail mediums, rest 3-up), crossfade on filter change; each `Suspense` fallback prerenders the default/unfiltered set (keeps route static, SEO-safe).
- `ExperienceStrip.tsx`: professional roles as a flat, non-clay strip, deliberately separated from the filterable personal-build grid.

**Redesign intent**
- A **numbered 01 / 02 / 03 editorial list** layout per mockup 6. Filters preserved; responsive; a11y.

**Gap / open questions (need mockup 6)**
- Is the numbered list the *replacement* for the `EditorialGrid` card matrix (list rows with big index numerals) or an additional treatment? Row anatomy: number + title + tagline + tags + thumbnail?
- How do filters coexist with a numbered list (do numbers re-sequence on filter, or stay fixed)? The URL-sync + static-prerender discipline must survive.
- Placement/treatment of the professional `ExperienceStrip` in the new layout.
- Whether personal builds only, or professional entries also get numbered.

---

## 4. Case study (`/work/[slug]`)
Ticket: **TASK-58** (P2, sp:5, **mockup 7**). Page: `app/work/[slug]/page.tsx`.

**Current state**
- `CaseStudyHeader.tsx`: flat 60/40 header — name (h1), lead, role/duration/status chips, 2–3 inline `MetricCard`s (each with a resolved source, fail-loud), and a 16:9 `ClayFrame` hero-media slot (image → demo video → "Hero media coming" placeholder). Carries the `project-{slug}` View-Transition name morphed from the ProjectCard.
- Body: `OverviewToggle` (30-second ↔ deep dive; toggle only appears when `deepDive` + ≥1 real chapter), `Chapter`s with inline artifacts/`MetricCard`s from `CHAPTER_ANCHORS`, `ChapterNav`, `ShowTheThinking`, `NextProject`, `ProgressBar`.
- **Content is thin today**: every project renders header + 30-sec overview + a "Deep dive coming" note until real chapter content lands (was M-005). Chapters/metrics/thinking arrays are largely empty.

**Redesign intent**
- **Cinematic storytelling** layout — Problem → Decision → Proof beats per mockup 7. Overview/deep toggle preserved; content truth intact.

**Gap / open questions (need mockup 7)**
- "Cinematic beats": full-bleed scroll sections, pinned/scroll-triggered media, big pull-quotes? What does a "beat" contain and how does it map onto the existing `Chapter` model (Problem/Decision/Proof vs. the current `CHAPTER_ANCHORS` set)?
- How the cinematic layout degrades for **thin projects** (the live state) — a cinematic shell with almost no content risks looking empty; need the mockup's empty/minimal state.
- Does the redesign keep the 30-sec/deep `OverviewToggle` and `ChapterNav`, or replace them?
- Media requirements per beat (real screenshots/video vs. clay props) — and whether the missing demo videos (prod gate) are assumed present.
- Reduced-motion fallback for any scroll-cinematics.

---

## 5. Contact
Ticket: **TASK-59** (P2, sp:2, **mockup 8**). Page: `app/contact/page.tsx` → `components/contact/ContactCard.tsx`.

**Current state**
- Single centred hero-tier lavender `ClayCard` (max 640px), h1 "Still curious?", four reach-out actions in a 2×2 grid: copy-email, `mailto:`, LinkedIn (external), résumé (from `resumeAction()`, placeholder until the flag flips). No form (decision S10). `id="resume"` anchor is the target of every résumé link site-wide.
- Contact data (email/LinkedIn/city) is verbatim from `CONTENT_INVENTORY §7` — **no phone/DOB/street address**.

**Redesign intent**
- **Simplified, personal** contact layout + scene per mockup 8. Real contact data only, **no new PII**; **one clear CTA**.

**Gap / open questions (need mockup 8)**
- What is the "scene" (avatar/portrait, clay props, illustration)? Layout: split personal-note + actions, or single column?
- "One clear CTA" vs. the current four equal actions — which action is primary (email? LinkedIn?), and do the others demote to secondary/inline links? The `#resume` anchor and `resumeAction()` single-source must be preserved.
- Any personal copy/message the mockup shows — must be Tushar's real words, not invented; confirm the mockup's gmail/city are dropped per guardrail.

---

## 6. Thinking (`/thinking`)
Ticket: **TASK-61** (P3, sp:2, chore — **no mockup**, "adopt the new system"). Page: `app/thinking/page.tsx`.

**Current state**
- `ThinkingHero` (h1 only) + `ThinkingList` (numbered rows from `data/writing.ts`; each title a real `<h3>` inside its row link; sr-only `h2` bridges the outline). All 5 essays are `draft: true`; an honest "five drafts, none published yet" empty-state line renders above the still-shown rows. Static.

**Redesign intent**
- Adopt the new visual system (aurora/glow/depth, new type/layout tokens). Responsive; a11y; **four screen states where data-backed**.

**Gap / open questions (no mockup exists — needs a direction call)**
- TASK-61 has **no mockup**, so the bar is "consistent with the new system", not "match a panel". Owner decision: is a restyle-only pass (apply new tokens/aurora, keep structure) acceptable, or is a bespoke layout wanted? If bespoke, a mockup or reference is needed.
- Confirm the four screen states to design (loading/empty/error/working) given the list is static + all-draft — the empty/draft state already exists; clarify what "loading/error" mean for static content.

---

## 7. Playground (`/playground`)
Ticket: **TASK-61** (shared, P3, chore — **no mockup**). Page: `app/playground/page.tsx`.

**Current state**
- `PlaygroundHero` (h1 only) + `PlaygroundGrid` (2×2 ≥md / 1-col of 4 sanctioned experiments — Pratyasa, Tegaki, Dino Arcade, Cinematic Portfolio — each a fully-clickable `ClayTile` to its live URL; each tile title an `h2`). Static.

**Redesign intent**
- Adopt the new visual system; responsive; a11y; four screen states where data-backed.

**Gap / open questions (no mockup exists — needs a direction call)**
- Same as Thinking: restyle-only vs. bespoke. Should the experiment tiles become richer "scenes" (matching the Featured Work "product scene" direction) or stay as clay tiles with new tokens?
- The Cinematic Portfolio link points at the untouchable cinematic site (`portfolio/index.html`) — confirm it stays linked, not restyled.

---

## 8. 404 (Not found)
Ticket: **TASK-61** (shared, P3, chore — **no mockup**). Page: `app/not-found.tsx`.

**Current state**
- One centred hero-tier peach `ClayCard` (max 640px), h1 "This page wandered off.", lead line, three `ClayButton`s (home / work / contact). Rendered inside the root layout (inherits Header/Footer). Static.

**Redesign intent**
- Adopt the new visual system; responsive; a11y.

**Gap / open questions (no mockup exists — needs a direction call)**
- Restyle-only (new tokens/aurora on the existing card) vs. a bespoke "WoW" 404 (e.g. an avatar-surprised pose — note `avatar-surprised` was generated in A-bis but not yet processed/wired). Confirm scope.

---

## What I need from you (drop these and record the paths)

For each screen below, add the mockup file path (image on disk) next to it. Once filled, Stage B is unblocked.

| Screen | Ticket | Mockup | Path (fill in) |
|--------|--------|--------|----------------|
| Home — Hero *(verify only, largely done)* | TASK-51 | mockup 1 | `…` |
| Home — Featured Work (product scenes) | TASK-54 | mockup 2 | `…` |
| Home — How I Think (journey path) | TASK-55 | mockup 3 | `…` |
| About — editorial hero | TASK-56 | mockup 4 | `…` |
| About — visual product-journey timeline | TASK-56 | mockup 5 | `…` |
| Work — numbered editorial layout | TASK-57 | mockup 6 | `…` |
| Case study — cinematic beats | TASK-58 | mockup 7 | `…` |
| Contact — personal scene | TASK-59 | mockup 8 | `…` |
| Thinking / Playground / 404 | TASK-61 | *none* | Decision needed: restyle-only to the new system, or provide a reference/mockup for a bespoke layout? |

**Also confirm:**
1. Where the 8 mockup files live (a folder path is fine — e.g. `content/media/mockups/` or a Downloads path to copy in). They are **not** currently in the repo.
2. Whether the hero-avatar A-bis pose/expression set (generated, not yet processed/wired) should land **before** Stage B or in parallel — several screens (Contact scene, 404) could use those poses.
3. For each screen: any **copy changes** the mockup implies (all copy must stay truth-sourced; the mockups' gmail/city are excluded per guardrail).
