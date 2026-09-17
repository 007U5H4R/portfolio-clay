import { z } from 'zod';

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

/* ── about ──────────────────────────────────────────────────── */
export const Outcome = z.object({ text: z.string().min(8), kind: z.enum(['measured','self-reported']), source: z.string().min(2) });
export const Experience = z.object({
  id: Slug, company: z.string().min(2), companyNote: z.string().optional(),  // 'via IntraEdge'
  title: z.string().min(2), dates: z.object({ start: YearMonth, end: YearMonth.optional() }),
  context: z.string().min(20), responsibility: z.string().min(20),
  scale: z.union([z.string().min(10), z.literal('not recorded')]),           // MISSING renders 'Scale: not recorded' (TKT-41 AC 1)
  whatChanged: z.string().min(20), outcomes: z.array(Outcome).min(1), sources: z.array(SourceRef).min(1),
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
