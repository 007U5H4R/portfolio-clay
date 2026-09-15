# COMPONENT_ARCHITECTURE — Clay Portfolio

Status: approved 2026-09-15 (with Solution-PRD). Stack: Next.js 16 (App Router, static generation) · TypeScript · Tailwind 4 (CSS-first tokens) · `motion` 13 · lucide-react · pnpm.

## 1. Directory layout
```
Portfolio-clay/
  app/
    layout.tsx                 fonts, metadata defaults, Header, Footer, AskPanel provider, skip link
    page.tsx                   Home
    work/page.tsx              Selected Work
    work/[slug]/page.tsx       Case study (generateStaticParams from data/projects)
    about/page.tsx
    thinking/page.tsx
    thinking/[slug]/page.tsx
    playground/page.tsx
    contact/page.tsx
    opengraph-image.tsx        + per-route opengraph-image.tsx (1200×630, ImageResponse)
    sitemap.ts · robots.ts · not-found.tsx
  components/
    layout/      Container, Section, SectionHeading, Footer, SkipLink
    navigation/  Header, NavPill, MobileMenu, AskAIButton
    hero/        Hero, AvatarStage, FloatingTiles, Annotation
    clay/        ClayCard, ClayButton, ClayPill, ClayTile, ClayFrame, ClayIcon   ← the material primitives
    projects/    FeaturedWork, ProjectCard, EditorialGrid, FilterTabs, StatusBadge, DemoVideo, ExperienceStrip
    case-study/  CaseStudyHeader, OverviewToggle, Chapter, ChapterNav, NextProject,
                 artifacts/ ArtifactCard InsightCard HypothesisCard MetricCard DecisionCard
                            EvaluationCard ExperimentCard PrototypeFrame
    timeline/    ExperienceTimeline, TimelineNode, StoryCard, ProductJourney
    interactions/ ShowTheThinking, ThinkingNode, Reveal, Parallax, ViewTransitionLink, ProgressBar
    ai/          AskPortfolio (home search field), AskPanel (right drawer), AnswerView, SuggestedPrompts, EvidenceLinks
    thinking/    ThinkingList, EssayBody
    common/      Icon, Tag, ExternalLink, CopyButton, VisuallyHidden, Prose
  data/
    schema.ts        zod schemas + TS types (Project, Experience, Skill cluster, Essay, KnowledgeEntry)
    projects.ts      11 personal builds + 3 professional entries
    experience.ts    4 roles (context · responsibility · scale · what changed · outcomes)
    skills.ts        4 capability clusters
    writing.ts       essays (DRAFT until signed off)
    knowledge.ts     Ask-AI Q→A pairs with evidence links
    thinking-framework.ts  6 stages × principle × real example × link
  lib/
    ask/adapter.ts        AnswerProvider interface + Answer type
    ask/local-provider.ts LocalKnowledgeProvider (deterministic)
    ask/rag-provider.ts   stub: RagProvider → POST /api/ask (not wired in v1)
    motion.ts             shared variants, reduced-motion hook
    format.ts             dates, numbers
    seo.ts                metadata builders
  content/media/<slug>/  screenshots, posters (source); public/ holds optimised output
  public/video/<slug>.mp4 · public/avatar/*.webp · public/resume.pdf
  evals/ (Stage 3)  ·  tests/ (Vitest + Playwright)  ·  docs/ (screenshots for visual QA)
```
Server components by default; `"use client"` only on interactive leaves (Header scroll state, FilterTabs, ShowTheThinking, AskPanel, DemoVideo, Parallax, Timeline).

## 2. Content model (data/schema.ts — abridged)
```ts
Project {
  slug, name, tagline, category: 'personal' | 'professional',
  tags: Tag[≤3], filters: ('ai'|'enterprise'|'cloud'|'experiments')[],
  status: 'live' | 'pilot' | 'prototype' | 'research' | 'archived',
  featured?: 1|2|3, gridSize: 'large'|'medium'|'small',
  role, dates: {start: 'YYYY-MM', end?: 'YYYY-MM'}, duration,
  links: { live?: url, demoVideo?: {src, poster, duration}, github?: url, repoPublic: boolean },
  hero: { image?: Media, prototype?: Media },
  metrics: Metric[]            // {value, label, context, asOf: 'YYYY-MM-DD', source, kind:'measured'|'structural'|'self-reported'}
  overview: { thirtySecond: RichText, deepDive: boolean },
  chapters: Chapter[8]         // {id:'context'|'problem'|..., title, body: RichText, artifacts: Artifact[]}
  thinking: ThinkingChain      // 8 nodes {stage, text, source}
  learnings: string[],
  sources: SourceRef[]         // every claim traces to a path/URL (from CONTENT_INVENTORY)
}
Artifact = Insight | Hypothesis | Metric | Decision | Evaluation | Experiment | Prototype | Generic
```
Zod validates all data at build time; a failing claim (missing `source`, metric without `asOf`) fails the build — the "no invented numbers" rule becomes mechanical.

## 3. Clay primitives (components/clay)
- `ClayCard` — `tone` (neutral | lavender | sky | mint | blush | peach | butter), `tier` (hero | card | utility | flat), `interactive` (adds lift/press physics), `as` polymorphic.
- `ClayButton` — `variant` (primary | secondary | ghost), 44 px min height, press physics, focus ring, optional trailing icon.
- `ClayPill` — filters, nav active state, tags.
- `ClayTile` — square icon tile (floating tiles, How-I-Think stage icon).
- `ClayFrame` — avatar / prototype bezel.
All read tokens from CSS custom properties defined in `app/globals.css` (`@theme`), so `Design.md` values are the single source.

## 4. Key interaction contracts
- **Header**: `useScrollY` > 24 → `compact` class; nav pill moves with layout animation; mobile menu is a dialog with focus trap.
- **AskPortfolio (home) / AskPanel (global)**: same `useAsk(provider)` hook. States: idle (suggested prompts) → loading (≤150 ms skeleton even though local, to avoid flash) → answer (text + evidence links + "Ask another") → empty ("I don't have that in the portfolio yet" + 3 prompts) → error (provider threw). Panel: `role="dialog"`, `aria-modal`, Esc/overlay closes, returns focus.
- **AnswerProvider**: `ask(query: string, ctx?: {route}) => Promise<Answer>`; `Answer = {kind:'answer'|'empty', text, evidence: {label, href}[], matched: string[]}`. Local provider: normalise → intent match (synonym table) → score entries → top entry; never fabricates.
- **FilterTabs → EditorialGrid**: URL-synced (`?filter=ai`), `AnimatePresence` + layout animations; empty state per filter.
- **ProjectCard → CaseStudyHeader**: wrapped in `<ViewTransition name={`project-${slug}`}>` (React 19.2); icon gets `name={`icon-${slug}`}`. Fallback: standard Link.
- **ShowTheThinking**: button toggles; nodes animate sequentially on open only; keyboard reachable; content is in DOM (collapsed) for screen readers.
- **DemoVideo**: poster + play button; loads `<video>` on intent (click or 50 % in view on desktop), muted, controls visible, `preload="none"`; states: no-video ("Demo coming"), loading, playing, error (falls back to live link).
- **ExperienceTimeline**: horizontal ≥1024 (nodes expand on hover, story card on click/Enter), vertical below; one open card at a time; URL hash per role.
- **Reveal**: IntersectionObserver once; disabled under reduced motion.

## 5. Testing & quality gates
- Vitest: data schema validation, local provider matching (every suggested prompt → a non-empty answer with ≥2 evidence links), format helpers.
- Playwright (Chromium, 390/768/1024/1440): nav, filters, case-study open, Ask panel keyboard flow, reduced-motion, no horizontal scroll, every visible button/link resolves (no dead buttons), resume download 200.
- Lighthouse CI on `/`, `/work`, `/work/teachspark`, `/about` — thresholds from DESIGN_DIRECTION §9.
- axe-core in Playwright: 0 critical/serious.
- Build fails on schema violations (unsourced claims).

## 6. Deployment
Vercel project `portfolio-clay` (new domain, decision S1), static output, Vercel Analytics basic. Env: none required for v1 (Ask is local). `RAG_ENDPOINT` reserved for the future provider.
