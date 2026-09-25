import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { Annotation } from "@/components/paper/Annotation";
import { Sheet } from "@/components/paper/Sheet";
import { ProgressBar } from "@/components/interactions/ProgressBar";
import { ShowTheThinking } from "@/components/interactions/ShowTheThinking";
import { CaseStudyHeader } from "@/components/case-study/CaseStudyHeader";
import { MetricStrip } from "@/components/case-study/MetricStrip";
import { OverviewToggle } from "@/components/case-study/OverviewToggle";
import { Chapter } from "@/components/case-study/Chapter";
import { ChapterNav, type ChapterNavItem } from "@/components/case-study/ChapterNav";
import { NextProject } from "@/components/case-study/NextProject";
// TKT-82 · What I learned + Sources (Design.md §7.3)
import { Learnings } from "@/components/case-study/Learnings";
import { Sources } from "@/components/case-study/Sources";
import { projectSources } from "@/lib/sources";
import { getProject, projects } from "@/data/projects";
import { CHAPTER_ANCHORS } from "@/lib/anchors";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Container } from "@/components/layout/Container";

/**
 * Only the personal slugs are built; any other `/work/*` slug 404s (dynamicParams=false). Every
 * personal build gets a `/work/<slug>` page; professional experience entries have no case-study
 * page (SITEMAP.md), matching the sitemap's personal-only filter. All routes stay static (TP1).
 */
export function generateStaticParams() {
  return projects
    .filter((project) => project.category === "personal")
    .map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return buildMetadata({
    title: `${project.name} · ${site.name}`,
    description: project.tagline,
    path: `/work/${project.slug}`,
    ogFamily: `${project.name} case study`,
    type: "article",
  });
}

const PERSONAL = projects.filter((project) => project.category === "personal");

/**
 * The case-study template on paper (TKT-81, Design.md §7.3). Section order (§7.3 heading):
 *   SceneOpener (TKT-95) → header → metric strip → overview → deep dive (TKT-83) → what I learned
 *   (TKT-82) → sources (TKT-82) → next project → band (layout).
 *
 * One template renders every one of the 11 personal projects honestly (S18, PB4):
 *   - rich: ≥ 2 metrics → the metric strip; `overview.deepDive` + chapters → the folder tabs, and
 *     "Deep dive" mounts `section#deep` right below the overview (TC-156);
 *   - thin: no metric section (0–1 metrics), no tabs; with no chapter content the notebook carries
 *     the kraft "Deep dive coming" tag with the project's `statusLabel` (§7.9 "Thin case study").
 * `ChapterNav` lists only chapters that exist and their `NN-slug` anchors come from
 * `lib/anchors.ts` `CHAPTER_ANCHORS` (TP8 — ids are schema values, anchors are presentation).
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // A chapter is "present" once it has body prose or at least one artifact; empty chapters are
  // omitted entirely (short honest page). The anchor and the 01–08 number come from CHAPTER_ANCHORS.
  const renderedChapters = project.chapters
    .filter((chapter) => chapter.body.length > 0 || chapter.artifacts.length > 0)
    .map((chapter) => {
      const anchor = CHAPTER_ANCHORS[chapter.id].anchor;
      return { chapter, anchor, number: Number(anchor.slice(0, 2)) };
    });

  const hasChapters = renderedChapters.length > 0;
  // Schema guarantees `deepDive` ⇒ ≥4 non-empty chapters, so the tabs only appear with real depth.
  const showToggle = project.overview.deepDive && hasChapters;

  const currentIndex = PERSONAL.findIndex((entry) => entry.slug === project.slug);
  const nextProject = PERSONAL[(currentIndex + 1) % PERSONAL.length]!;

  const navItems: ChapterNavItem[] = renderedChapters.map(({ anchor, chapter, number }) => ({
    anchor,
    number,
    title: chapter.title,
  }));
  const deepIds = ["deep", ...renderedChapters.map(({ anchor }) => anchor)];

  // ── Deep dive — TKT-83 slot ──────────────────────────────────────────────────────────────────
  // `section#deep` (§7.3 "Deep dive"). TKT-83 owns everything INSIDE this section (grid, ChapterNav,
  // Chapter, ShowTheThinking); keep the outer `<section id="deep" aria-label="Deep dive">` so the
  // overview tabs and the `#deep` anchor keep working.
  const deepSection = hasChapters ? (
    <section id="deep" aria-label="Deep dive" className="cs-deep">
      {/* TKT-83 (Design.md §7.3 deep dive): `200px 1fr` grid. `ChapterNav` mounts only ≥ 1024 via
          MediaGate (Dev-09), so the chapters column is pinned to column 2 and never shifts when the nav
          is absent. Chapters + ShowTheThinking are nested sections and own their EVAL-018 counts. */}
      <Container className="grid items-start gap-[clamp(32px,4vw,64px)] lg:grid-cols-[200px_minmax(0,1fr)]">
        <ChapterNav items={navItems} />
        <div className="chapters lg:col-start-2 lg:row-start-1">
          {renderedChapters.map(({ chapter, anchor, number }) => (
            <Chapter key={chapter.id} chapter={chapter} anchor={anchor} number={number} sources={project.sources} />
          ))}
          {/* ShowTheThinking returns null for a thin project (empty chain) — no empty toggle. */}
          <ShowTheThinking chain={project.thinking} sources={project.sources} />
        </div>
      </Container>
    </section>
  ) : null;
  // ── end deep dive slot ─────────────────────────────────────────────────────────────────────────

  const overviewIntro = (
    <>
      <p className="cs-eyebrow">Overview</p>
      <h2 id="ov-h" className="sr-only">
        Case-study overview
      </h2>
      <Annotation size="lg" rotate={-1.5} className="cs-overview-note">
        if you only have thirty seconds →
      </Annotation>
    </>
  );

  const notebook = (
    <div className="cs-notebook-col">
      <Sheet variant="notebook" rotate={0.5} className="cs-notebook">
        <p className="cs-notebook-label">30-sec</p>
        {project.overview.thirtySecond.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </Sheet>
      {hasChapters ? null : (
        // §7.9 "Thin case study" → empty state: the kraft tag, never an empty chapter section.
        <Sheet variant="tag" rotate={-1} className="cs-coming">
          <span className="cs-coming-eyebrow" data-micro-label="">
            Deep dive coming
          </span>
          <span className="cs-coming-body">
            The full case study is being written up. This project is documented as{" "}
            <b>{project.statusLabel}</b>.
          </span>
        </Sheet>
      )}
    </div>
  );
  // end TKT-83

  return (
    <>
      {/* TKT-95 scene opener (EXE-18): one scene for every case study; the crop keeps face + open book. */}
      <SceneOpener id="scene-casestudy" focalX={0.5} focalY={0.32} priority />
      <ProgressBar />
      <article className="cs-article">
        <CaseStudyHeader project={project} />
        <MetricStrip metrics={project.metrics} sources={project.sources} slug={project.slug} />

        {showToggle ? (
          <OverviewToggle
            intro={overviewIntro}
            notebook={notebook}
            deep={deepSection}
            deepIds={deepIds}
            help={`Deep dive adds the ${renderedChapters.length} chapters and the evidence behind each one.`}
          />
        ) : (
          <>
            <OverviewToggle intro={overviewIntro} notebook={notebook} />
            {/* A project with chapters but no full deep dive shows them inline (no tabs). */}
            {deepSection}
          </>
        )}

        {/* TKT-82 · §7.3 order: … deep dive → What I learned → Sources → next project. Both return null when empty. */}
        <Learnings learnings={project.learnings} />
        <Sources sources={projectSources(project)} />
        {/* end TKT-82 */}
      </article>

      <NextProject project={nextProject} />
    </>
  );
}
