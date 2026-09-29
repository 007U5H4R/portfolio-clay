import { z } from 'zod';
import { VIDEO_PROVIDERS, isValidVideoId } from '../lib/video-providers';

/* ── primitives ─────────────────────────────────────────────── */
export const Slug      = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const IsoDate   = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'asOf must be YYYY-MM-DD');
export const YearMonth = z.string().regex(/^\d{4}-\d{2}$/);
export const InternalHref = z.string().regex(/^\/(?!\/)[^\s]*$/);            // "/work/railcite#05-what-i-built"
export const Href      = z.union([InternalHref, z.url().startsWith('https://'), z.string().startsWith('mailto:')]);
export const Tone      = z.enum(['neutral','lavender','sky','mint','blush','peach','butter']);
export const RichText  = z.array(z.string().min(1));                          // paragraphs; inline markdown links only

/* Every public claim points at one of these. `ref` (inventory path/line) is never rendered; `label` is. */
export const SourceRef = z.object({
  id: z.string().min(2),                       // 'TS-README-3'
  label: z.string().min(3),                    // 'TeachSpark README' — the only field the UI shows
  ref: z.string().min(1),                      // 'TS/README.md:3' or a URL (traceability only)
  inventory: z.string().regex(/^§\d+(?:\.\d+)*$/), // CONTENT_INVENTORY section, e.g. '§8.1'
  url: z.url().startsWith('https://').optional(),   // rendered as a link when present
});

export const Media = z.object({
  src: z.string().regex(/^\/(avatar|media|video)\//),
  alt: z.string().min(8),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  kind: z.enum(['image','video','placeholder']).default('image'),
  caption: z.string().optional(),
  source: z.string().optional(),               // SourceRef.id
});

export const Metric = z.object({
  value: z.string().min(1),                    // keep units/formatting: '17', '37.5 min', '5,760'
  label: z.string().min(2),
  context: z.string().min(12),                 // 'joined the WhatsApp pilot in week 1, test handsets excluded'
  asOf: IsoDate,
  kind: z.enum(['measured','structural','self-reported']),
  source: z.string().min(2),                   // SourceRef.id (must exist in the owning entity's sources)
});

/* ── artifacts (discriminated) ──────────────────────────────── */
const ArtifactBase = { id: z.string().min(2), source: z.string().min(2), caption: z.string().optional() };
export const InsightArtifact    = z.object({ ...ArtifactBase, type: z.literal('insight'),    quote: z.string().min(12), attribution: z.string().min(2) });
export const HypothesisArtifact = z.object({ ...ArtifactBase, type: z.literal('hypothesis'), believe: z.string().min(12), knowWhen: z.string().min(12),
                                             status: z.enum(['validated','partially-validated','invalidated','unmeasured']).default('unmeasured') });
export const MetricArtifact     = z.object({ ...ArtifactBase, type: z.literal('metric'),     metric: Metric });
export const DecisionArtifact   = z.object({ ...ArtifactBase, type: z.literal('decision'),   title: z.string().min(4), chosen: z.string().min(8), rejected: z.array(z.string().min(4)).min(1), reason: z.string().optional() });
export const EvaluationArtifact = z.object({ ...ArtifactBase, type: z.literal('evaluation'), method: z.string().min(8), result: z.string().min(4), limitation: z.string().min(8) });
export const ExperimentArtifact = z.object({ ...ArtifactBase, type: z.literal('experiment'), setup: z.string().min(8), result: z.string().min(4), learning: z.string().min(8) });
export const PrototypeArtifact  = z.object({ ...ArtifactBase, type: z.literal('prototype'),  media: Media });
export const GenericArtifact    = z.object({ ...ArtifactBase, type: z.literal('generic'),    title: z.string().min(3), kind: z.enum(['prd','deck','ledger','doc','link']), href: Href.optional(), note: z.string().optional() });
export const Artifact = z.discriminatedUnion('type', [InsightArtifact, HypothesisArtifact, MetricArtifact, DecisionArtifact, EvaluationArtifact, ExperimentArtifact, PrototypeArtifact, GenericArtifact]);

/* ── chapters (fixed 8, fixed order) ────────────────────────── */
export const CHAPTER_IDS = ['context','problem','discovery','bet','built','evaluation','outcome','learned'] as const;
export const ChapterId = z.enum(CHAPTER_IDS);
export const Chapter = z.object({ id: ChapterId, title: z.string().min(3), body: RichText, artifacts: z.array(Artifact).max(3) });
export const Chapters = z.array(Chapter).length(8).superRefine((chs, ctx) => {
  chs.forEach((c, i) => { if (c.id !== CHAPTER_IDS[i]) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `chapter ${i} must be '${CHAPTER_IDS[i]}'` }); });
});

/* ── show-the-thinking (exactly 8 or none) ──────────────────── */
export const THINKING_STAGES = ['observation','user-problem','insight','hypothesis','product-decision','prototype','evaluation','outcome'] as const;
export const ThinkingNode  = z.object({ stage: z.enum(THINKING_STAGES), text: z.string().min(20), source: z.string().min(2), href: Href.optional() });
export const ThinkingChain = z.union([
  z.array(ThinkingNode).length(8).superRefine((ns, ctx) => ns.forEach((n, i) => { if (n.stage !== THINKING_STAGES[i]) ctx.addIssue({ code: 'custom', path: [i, 'stage'], message: `node ${i} must be '${THINKING_STAGES[i]}'` }); })),
  z.tuple([]),                                  // thin projects: chain hidden entirely (TKT-21 AC 1)
]);

/* ── project ────────────────────────────────────────────────── */
export const ProjectStatus = z.enum(['live','pilot','prototype','research','archived']);
export const Filter = z.enum(['ai','enterprise','cloud','experiments']);
export const Tag = z.string().min(2).max(18);

export const Project = z.object({
  slug: Slug, name: z.string().min(2), tagline: z.string().min(20),        // tagline = the one-sentence proposition
  category: z.enum(['personal','professional']),
  tags: z.array(Tag).min(1).max(3), filters: z.array(Filter).min(1),
  status: ProjectStatus, statusLabel: z.string().min(3),                   // badge colour from status, badge text from statusLabel ('Live pilot', 'Built, not launched')
  statusAsOf: IsoDate.optional(),                                          // dated live-status check (TKT-22 AC 3)
  featured: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  gridSize: z.enum(['large','medium','small']),
  icon: z.string().min(2),                                                 // lucide icon name (cards use ClayIcon, no product imagery)
  role: z.string().min(4), dates: z.object({ start: YearMonth, end: YearMonth.optional() }), duration: z.string().min(2),
  links: z.object({
    live: z.url().startsWith('https://').optional(),
    demoVideo: z.object({ src: z.string().regex(/^\/video\/[a-z0-9-]+\.mp4$/), poster: z.string().regex(/^\/video\/[a-z0-9-]+-poster\.webp$/), durationSec: z.number().int().min(5).max(60) }).optional(),
    github: z.url().startsWith('https://github.com/').optional(),
    repoPublic: z.boolean(),
  }),
  hero: z.object({ image: Media.optional(), prototype: Media.optional() }),
  metrics: z.array(Metric),
  overview: z.object({ thirtySecond: RichText.min(1), deepDive: z.boolean() }),
  chapters: Chapters,
  thinking: ThinkingChain,
  learnings: z.array(z.string().min(8)),
  sources: z.array(SourceRef).min(1),
}).superRefine((p, ctx) => {
  const ids = new Set(p.sources.map(s => s.id));
  const need = (id: string, path: (string|number)[]) => { if (!ids.has(id)) ctx.addIssue({ code: 'custom', path, message: `source '${id}' not declared in sources[]` }); };
  p.metrics.forEach((m, i) => need(m.source, ['metrics', i, 'source']));
  p.chapters.forEach((c, ci) => c.artifacts.forEach((a, ai) => { need(a.source, ['chapters', ci, 'artifacts', ai, 'source']); if (a.type === 'metric') need(a.metric.source, ['chapters', ci, 'artifacts', ai, 'metric', 'source']); }));
  p.thinking.forEach((n, i) => need(n.source, ['thinking', i, 'source']));
  if (p.category === 'professional' && (p.links.live || p.links.demoVideo || p.featured)) ctx.addIssue({ code: 'custom', path: ['links'], message: 'professional entries never carry live/demo/featured (Solution-PRD §5)' });
  if (p.links.repoPublic && !p.links.github) ctx.addIssue({ code: 'custom', path: ['links', 'repoPublic'], message: 'repoPublic requires github' });
  if (p.overview.deepDive && p.chapters.filter(c => c.body.length > 0).length < 4) ctx.addIssue({ code: 'custom', path: ['overview', 'deepDive'], message: 'deepDive needs ≥4 non-empty chapters' });
  if (p.featured && p.category !== 'personal') ctx.addIssue({ code: 'custom', path: ['featured'], message: 'only personal builds are featured' });
});

/* ── portfolio (TASK-116) ───────────────────────────────────── */
/* TASK-122 (video-embed spec §2–§3, §19): a pitch/demo is a provider + video id — never embed HTML.
   The id shape per provider lives in `lib/video-providers.ts` (one place). `title` is optional here:
   `lib/portfolio.ts` defaults it to "<Name> pitch video" / "<Name> product demonstration" (§15). */
export const VideoMediaEntry = z.object({
  provider: z.enum(VIDEO_PROVIDERS),
  videoId: z.string(),
  title: z.string().min(8).max(80).optional(),
  poster: z.string().regex(/^\/(media|video)\/[a-z0-9/-]+\.(webp|avif|png|jpg)$/).optional(),
}).refine(v => isValidVideoId(v.provider, v.videoId), { message: 'videoId is not a valid id for its provider', path: ['videoId'] });
/* The accent a product's cover and selected state wear — paper token names only (EVAL-020). */
export const PortfolioAccent = z.enum(['steel','rust','terracotta','forest','green-2','navy-2','kraft','note']);
/* Per-product presentation for the /projects carousel. Every product FACT (name, proposition, live
   link, repo, demo MP4) stays in `data/projects.ts`; this only adds what the portfolio needs on top. */
export const PortfolioEntry = z.object({
  slug: Slug,                                                                // a personal `Project.slug`
  code: z.string().regex(/^[A-Z]{2}-\d{2}$/),                                // cover code, 'TS-01'
  coverLine: z.string().min(8).max(32),                                      // short cover tagline
  accent: PortfolioAccent,
  /* TASK-121 (rectify spec §5.4): the tiny status metadata on the info sheet — a shortening of the
     project's own `statusLabel` (the full sentence stays on the case study), never a new claim. */
  meta: z.string().min(4).max(40),
  /* TASK-127 (fidelity spec §4, §10–§12): the cover's own identity — every product names its
     hand-authored SVG cover in the illustration manifest (`cover-<slug>`); the lettering style and the
     plate emblem are its packaging. */
  coverArt: z.string().regex(/^cover-[a-z0-9-]+$/),
  lettering: z.enum(['rounded','slab','script','block','serif','mono']),
  coverGlyph: z.string().min(2),                                             // lucide name (ProductCover map)
  pitchVideo: VideoMediaEntry.optional(),
  demoVideo: VideoMediaEntry.optional(),                                     // only when `links.demoVideo` is absent
  prdUrl: z.url().startsWith('https://').optional(),
});

/* Enterprise & client work (spec §27–§35). `sources` name the document and page — never a file path. */
export const ENTERPRISE_DOCUMENTS = ['Project Manager portfolio V2.0', 'Résumé'] as const;
const NoCommercialFigures = (s: string) => !/[$€£₹]|\bbudget\b|\bUSD\b|\bINR\b/i.test(s);
const PublicText = (min: number, max: number) => z.string().min(min).max(max).refine(NoCommercialFigures, 'no budgets or commercial figures (spec §35)');
export const EnterpriseCase = z.object({
  id: Slug,
  client: PublicText(3, 40),
  program: PublicText(8, 60),
  role: PublicText(4, 60),
  period: z.object({ start: YearMonth, end: YearMonth }),
  summary: PublicText(40, 240),
  workstreams: z.array(z.object({ name: PublicText(4, 48), detail: PublicText(20, 180) })).max(4),
  tags: z.array(Tag).min(4).max(6),
  sources: z.array(z.object({ document: z.enum(ENTERPRISE_DOCUMENTS), page: z.number().int().min(1).max(4) })).min(1),
}).refine(c => c.period.start <= c.period.end, { message: 'period.start must not be after period.end', path: ['period'] });

/* ── case-study system (TASK-130, Tushar's case-study spec §37) ─────────────────────────────────
   One record per personal build (`data/case-studies/<slug>.ts`). Every FACT still lives in
   `data/projects.ts` / CONTENT_INVENTORY §8 / docs/trace: a case study only curates it into a short
   one-pager and names the `SourceRef.id` (of the same project) behind every proof, decision, step and
   evidence row — `validateAll()` fails the build on an id the project does not declare. */
/* Spec §19: the four evidence badges, used on every metric and outcome. */
export const EVIDENCE_KINDS = ['measured','self-reported','structural','prototype'] as const;
export const EvidenceKind = z.enum(EVIDENCE_KINDS);
/* A proof point (hero metric or outcome card). `value` stays short so it reads at a glance. */
export const CaseProof = z.object({
  value: z.string().min(1).max(16),
  label: z.string().min(2).max(60),
  kind: EvidenceKind,
  note: z.string().min(8).max(200).optional(),          // the context line (dates, exclusions, caveats)
  asOf: IsoDate.optional(),
  source: z.string().min(2),
});
/* A real product image, copied from docs/case-study-sources/ as WebP (provenance is never rendered). */
export const CaseImage = z.object({
  src: z.string().regex(/^\/media\/(case-studies\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|svg)|illustrations\/covers\/cover-[a-z0-9-]+\.svg)$/),
  alt: z.string().min(12),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().min(4).max(120).optional(),
  frame: z.enum(['browser','phone','print','plain']).default('plain'),
  provenance: z.string().min(8),
});
export const FlowStep = z.object({ label: z.string().min(2).max(40), note: z.string().min(2).max(90).optional() });
const CaseSectionBase = {
  id: Slug,                                              // the section's own anchor ("problem")
  nav: z.string().min(3).max(16),                        // the sticky navigator label
  eyebrow: z.string().min(3).max(32),
  headline: z.string().min(8).max(96),
  /* Legacy `NN-slug` chapter anchors (lib/anchors.ts) that land on this section, so every old deep
     link from Ask, How I think and essays still resolves (EVAL-011/013). */
  anchors: z.array(z.string().regex(/^\d{2}-[a-z-]+$/)).default([]),
};
export const ProblemSection = z.object({ ...CaseSectionBase, kind: z.literal('problem'),
  context: z.string().min(20).max(360),
  flow: z.object({ caption: z.string().min(4).max(80), steps: z.array(FlowStep).min(3).max(7), source: z.string().min(2) }).optional(),
  quote: z.object({ text: z.string().min(12).max(240), attribution: z.string().min(2), source: z.string().min(2) }).optional(),
});
export const ProductSection = z.object({ ...CaseSectionBase, kind: z.literal('product'),
  summary: z.string().min(20).max(320),
  shots: z.array(CaseImage).max(4).default([]),
  video: z.enum(['pitch','demo']).optional(),             // a portfolio YouTube id, click-to-load
  poster: CaseImage.optional(),                           // the video's poster when it differs from the hero's
  /* The recorded user flow ("what does the user actually do?", spec §12), drawn per theme. */
  flow: z.object({ caption: z.string().min(4).max(80), steps: z.array(FlowStep).min(3).max(7), source: z.string().min(2) }).optional(),
  /* Recorded output states (e.g. RailCite's `answered | refused` contract) — a diagram of the
     contract, never a redrawn screenshot. */
  states: z.array(z.object({ tone: z.enum(['yes','no','neutral']), title: z.string().min(3).max(40), lines: z.array(z.string().min(3).max(90)).min(1).max(4) })).max(3).default([]),
  /* Journal layout: the run's printed deliverables (name · owner · the product's own headings). */
  outputs: z.array(z.object({ name: z.string().min(2).max(24), owner: z.string().min(2).max(24), lines: z.array(z.string().min(2).max(48)).min(1).max(6), source: z.string().min(2) })).max(4).default([]),
  source: z.string().min(2),
});
export const Decision = z.object({
  could: z.string().min(4).max(90), chose: z.string().min(4).max(90), because: z.string().min(8).max(180), source: z.string().min(2),
});
export const DecisionsSection = z.object({ ...CaseSectionBase, kind: z.literal('decisions'), items: z.array(Decision).min(1).max(3) });
export const SystemSection = z.object({ ...CaseSectionBase, kind: z.literal('system'),
  intro: z.string().min(12).max(240).optional(),
  caption: z.string().min(8).max(120),                   // the diagram's figcaption
  steps: z.array(FlowStep).min(5).max(8),                // spec §16 + brief §5: 5–8 steps; a smaller system gets no diagram
  rules: z.array(z.string().min(8).max(110)).max(4).default([]),
  /* Journal layout: the one load-bearing decision drawn beside the system, and an ordered ladder
     (e.g. trust → ownership → autonomy) when the record states the sequence. */
  decision: Decision.optional(),
  ladder: z.array(z.string().min(3).max(20)).min(2).max(4).optional(),
  source: z.string().min(2),
});
export const Funnel = z.object({
  caption: z.string().min(8).max(140), asOf: IsoDate, kind: EvidenceKind, source: z.string().min(2),
  steps: z.array(z.object({ label: z.string().min(2).max(40), value: z.number().int().nonnegative(), note: z.string().max(40).optional() })).min(3).max(7),
});
export const OutcomeSection = z.object({ ...CaseSectionBase, kind: z.literal('outcome'),
  intro: z.string().min(12).max(320).optional(),
  proofs: z.array(CaseProof).max(6).default([]),
  funnel: Funnel.optional(),
  gaps: z.array(z.string().min(8).max(160)).max(4).default([]),   // what is honestly not measured
  /* Journal layout: a status stamp over the evidence ("Prototype / Not launched", "Mock data"). */
  stamp: z.array(z.string().min(3).max(24)).min(1).max(2).optional(),
});
export const PivotSection = z.object({ ...CaseSectionBase, kind: z.literal('pivot'),
  from: z.object({ name: z.string().min(2), line: z.string().min(8).max(140), when: z.string().min(3).max(16).optional() }),
  evidence: z.array(z.object({ text: z.string().min(8).max(200), source: z.string().min(2) })).min(1).max(3),
  decision: z.object({ text: z.string().min(8).max(200), source: z.string().min(2) }),
  to: z.object({ name: z.string().min(2), line: z.string().min(8).max(160), when: z.string().min(3).max(16).optional() }),
  /* Journal layout: the stamp on the killed card ("Day 7 · killed", "Can't publish"). */
  stamp: z.string().min(3).max(24).optional(),
});
export const ResearchSection = z.object({ ...CaseSectionBase, kind: z.literal('research'),
  intro: z.string().min(12).max(300).optional(),
  quotes: z.array(z.object({ text: z.string().min(12).max(240), attribution: z.string().min(2), source: z.string().min(2) })).min(1).max(3),
  insight: z.object({ text: z.string().min(12).max(240), source: z.string().min(2) }).optional(),
  /* Journal layout: active work vs waiting, drawn as a proportional bar. `figure` only when the
     record carries it, with its attribution (e.g. team secondary research, unverified). */
  timeline: z.object({ active: z.string().min(3).max(40), waiting: z.string().min(3).max(40), figure: z.string().min(2).max(40).optional(), note: z.string().min(8).max(140), source: z.string().min(2) }).optional(),
});
export const LearningsSection = z.object({ ...CaseSectionBase, kind: z.literal('learnings'),
  items: z.array(z.object({ title: z.string().min(4).max(48), body: z.string().min(12).max(200), source: z.string().min(2) })).min(2).max(4),
});
export const CaseSection = z.discriminatedUnion('kind', [ProblemSection, ProductSection, DecisionsSection, SystemSection, OutcomeSection, PivotSection, ResearchSection, LearningsSection]);
/* Spec §23: an evidence-drawer row. Private docs are listed (title · type · date · what they support),
   never linked; a public URL is only ever the SourceRef's own `url`. */
export const EVIDENCE_TYPES = ['PRD','Design','Evaluation','Research','Architecture','Build ledger','Deck','Code','Live data','Post','Test run','Feedback','Analytics','Paper','Readme'] as const;
export const EvidenceItem = z.object({ title: z.string().min(3).max(60), type: z.enum(EVIDENCE_TYPES), date: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).optional(), supports: z.string().min(8).max(160), source: z.string().min(2) });
/* Per-product art direction (spec §7–§9, §25, §39). `theme` keys the page's CSS scope. */
export const CASE_THEMES = ['railcite','teachspark','velora','cubicle','tegaki','nuptis','bhakti-vilas','token-toli','pratyasa','dino-arcade-pwa','cinematic-portfolio','campfire-board','slag-city'] as const;
export const CaseStudy = z.object({
  slug: Slug,
  theme: z.object({
    key: z.enum(CASE_THEMES),
    metaphor: z.string().min(8),                          // internal art-direction note, never rendered
    accents: z.array(PortfolioAccent).min(1).max(3),      // spec §29: 1–3 product accents over the base palette
  }),
  story: z.string().min(4).max(60),                       // the one dominant narrative (spec §41), internal
  hero: z.object({
    tagline: z.string().min(4).max(48),                   // "Research on track."
    proposition: z.string().min(20).max(220),
    proofs: z.array(CaseProof).max(4).default([]),
    media: z.union([CaseImage, z.object({ video: z.enum(['pitch','demo']), poster: CaseImage })]),
    layout: z.enum(['split','split-reverse','stacked','pivot']).default('split'),
    /* layout 'pivot' (spec §49): the killed first bet, shown struck beside the product that survived. */
    pivotFrom: CaseImage.optional(),
    /* Journal layout (TASK-130 redesign): two or three one-line beats under the tagline, up to three
       decorative handwritten notes (aria-hidden), and the hand-authored scene the real UI sits in. */
    beats: z.array(z.string().min(3).max(40)).max(3).default([]),
    notes: z.array(z.string().min(3).max(32)).max(3).default([]),
    scene: z.object({ src: z.string().regex(/^\/media\/case-studies\/[a-z0-9-]+\/[a-z0-9-]+\.svg$/), width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
  }),
  /* 'journal' = the bespoke editorial one-pager (Cubicle, Dino Arcade, Velora); 'system' = the shared template. */
  layout: z.enum(['system','journal']).default('system'),
  sections: z.array(CaseSection).min(3).max(7),
  evidence: z.array(EvidenceItem).max(12).default([]),
  /* Recorded artifacts CONTENT_INVENTORY §8 lists for this product that its project record doesn't
     declare (e.g. a Final-PRD diagram) — same SourceRef shape; ids must not clash with the project's. */
  extraSources: z.array(SourceRef).max(6).default([]),
}).superRefine((c, ctx) => {
  const ids = c.sections.map(s => s.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', path: ['sections'], message: 'section ids must be unique' });
  // accents[0] tints text (eyebrows, numerals, codes) — it must be an ink, never a light paper.
  if (['note','kraft'].includes(c.theme.accents[0] ?? '')) ctx.addIssue({ code: 'custom', path: ['theme', 'accents', 0], message: 'the first accent must be an ink token (not note/kraft)' });
  const anchors = c.sections.flatMap(s => s.anchors);
  if (new Set(anchors).size !== anchors.length) ctx.addIssue({ code: 'custom', path: ['sections'], message: 'a legacy anchor may land on one section only' });
});

/* ── about ──────────────────────────────────────────────────── */
export const Outcome = z.object({ text: z.string().min(8), kind: z.enum(['measured','self-reported']), source: z.string().min(2) });
export const Experience = z.object({
  id: Slug, company: z.string().min(2), companyNote: z.string().optional(),  // 'via IntraEdge'
  location: z.string().min(2).optional(),                                     // city only (CONTENT_INVENTORY §4.5); rendered on /work (TKT-101)
  title: z.string().min(2), dates: z.object({ start: YearMonth, end: YearMonth.optional() }),
  context: z.string().min(20), responsibility: z.string().min(20),
  scale: z.union([z.string().min(10), z.literal('not recorded')]),           // MISSING renders 'Scale: not recorded' (TKT-41 AC 1)
  whatChanged: z.string().min(20), outcomes: z.array(Outcome).min(1), sources: z.array(SourceRef).min(1),
  highlights: z.array(z.string().min(12)).max(4).optional(),                  // /work card bullets — Tushar's wording (TKT-101 r2)
});
export const SkillCluster = z.object({ id: Slug, name: z.string().min(3), tone: Tone, items: z.array(z.string().min(2)).min(3).max(6), source: z.string().min(2) });

/* ── thinking (essays) ──────────────────────────────────────── */
export const Essay = z.object({
  slug: Slug, title: z.string().min(6), dek: z.string().min(12), draft: z.boolean(), readingMinutes: z.number().int().min(1).max(20),
  passages: z.array(z.object({ quote: z.string().min(20), source: z.string().min(2) })).min(1),
  framing: z.string().min(40),                                                 // the one clearly-marked DRAFT paragraph
  relatedProject: Slug.optional(), publishedOn: IsoDate.optional(), sources: z.array(SourceRef).min(1),
}).refine(e => e.draft || !!e.publishedOn, { message: 'non-draft essays need publishedOn', path: ['publishedOn'] });

/* ── ask ────────────────────────────────────────────────────── */
export const KnowledgeEntry = z.object({
  id: Slug, prompt: z.string().min(8),
  aliases: z.array(z.string().min(4)).default([]),                            // whole-prompt paraphrases
  keywords: z.array(z.object({ term: z.string().min(2), weight: z.number().min(0.5).max(3) })).min(2),  // canonical terms (after synonyms)
  answer: z.string().min(40).max(600),                                        // ≤3 sentences, verbatim from CONTENT_INVENTORY §9 / VERIFIED rows
  evidence: z.array(z.object({ label: z.string().min(3), href: Href })).min(2).max(3),
  sources: z.array(SourceRef).min(1), draft: z.boolean(),
  surface: z.array(z.enum(['home','panel'])).min(1),                           // home shows 5, panel shows 6 (PB3: 11 total, disjoint)
});

/* ── how-i-think ────────────────────────────────────────────── */
export const ThinkingStageDef = z.object({
  id: z.enum(['problem','insight','bet','build','evaluate','impact']), label: z.string().min(3), principle: z.string().min(12), tone: Tone,
  example: z.object({ quote: z.string().min(20), attribution: z.string().min(2), project: Slug, href: z.string().regex(/^\/work\/[a-z0-9-]+(?:#\d{2}-[a-z-]+)?$/) }),
  source: z.string().min(2),
});

export type Project = z.infer<typeof Project>; export type Metric = z.infer<typeof Metric>; export type Artifact = z.infer<typeof Artifact>;
export type SourceRef = z.infer<typeof SourceRef>; // TKT-20: ArtifactRenderer resolves an artifact's source id → this shape (label rendered, ref never).
export type Media = z.infer<typeof Media>; // TKT-18: DemoVideo's posterFallback prop needs this type.
export type Experience = z.infer<typeof Experience>; export type Essay = z.infer<typeof Essay>; export type KnowledgeEntry = z.infer<typeof KnowledgeEntry>;
export type ThinkingStageDef = z.infer<typeof ThinkingStageDef>; export type SkillCluster = z.infer<typeof SkillCluster>;
export type ThinkingNode = z.infer<typeof ThinkingNode>; export type ThinkingChain = z.infer<typeof ThinkingChain>; // TKT-21: ShowTheThinking/ThinkingNode component props.
export type PortfolioAccent = z.infer<typeof PortfolioAccent>; // TASK-116
export type VideoMediaEntry = z.infer<typeof VideoMediaEntry>; export type PortfolioEntry = z.infer<typeof PortfolioEntry>; export type EnterpriseCase = z.infer<typeof EnterpriseCase>;
export type CaseStudy = z.infer<typeof CaseStudy>; export type CaseSection = z.infer<typeof CaseSection>; export type CaseProof = z.infer<typeof CaseProof>; // TASK-130
export type CaseImage = z.infer<typeof CaseImage>; export type EvidenceItem = z.infer<typeof EvidenceItem>; export type EvidenceKind = z.infer<typeof EvidenceKind>;
