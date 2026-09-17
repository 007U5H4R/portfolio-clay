import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Prose } from "@/components/common/Prose";
import { ProgressBar } from "@/components/interactions/ProgressBar";
import { ShowTheThinking } from "@/components/interactions/ShowTheThinking";
import { CaseStudyHeader } from "@/components/case-study/CaseStudyHeader";
import { OverviewToggle } from "@/components/case-study/OverviewToggle";
import { Chapter } from "@/components/case-study/Chapter";
import { ChapterNav, type ChapterNavItem } from "@/components/case-study/ChapterNav";
import { NextProject } from "@/components/case-study/NextProject";
import { getProject, projectIcon, projects } from "@/data/projects";
import { CHAPTER_ANCHORS } from "@/lib/anchors";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

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
 * The full case-study template (TKT-19). It assembles the reused M-004 components — `CaseStudyHeader`
 * (TKT-06, extended with metrics + hero media) → `OverviewToggle` (30-sec ↔ deep dive) → `Chapter`s
 * with inline artifacts/`MetricCard`s (TKT-20) → `ShowTheThinking` (TKT-21) → `NextProject`, plus a
 * `ProgressBar`. One template scales its depth with the evidence a project actually has.
 *
 * Graceful thin content (the live state for every project until M-005): chapters/metrics/thinking
 * are empty today, so the page renders the header + 30-second overview + a labelled "Deep dive
 * coming" note + NextProject — never a broken or empty chapter section. `ChapterNav` lists only the
 * chapters that exist (so no anchor link is ever dead, EVAL-011), and their `NN-slug` anchors come
 * from `lib/anchors.ts` `CHAPTER_ANCHORS` (E-3 — ids are schema values, anchors are presentation).
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const icon = projectIcon(project.icon);

  // A chapter is "present" once it has body prose or at least one artifact; empty chapters are
  // omitted entirely (short honest page). The anchor and the 01–08 number come from CHAPTER_ANCHORS
  // (the anchor's numeric prefix is the canonical chapter position, so #05-what-i-built is "05").
  const renderedChapters = project.chapters
    .filter((chapter) => chapter.body.length > 0 || chapter.artifacts.length > 0)
    .map((chapter) => {
      const anchor = CHAPTER_ANCHORS[chapter.id].anchor;
      return { chapter, anchor, number: Number(anchor.slice(0, 2)) };
    });

  const hasChapters = renderedChapters.length > 0;
  // Schema guarantees `deepDive` ⇒ ≥4 non-empty chapters, so the toggle only appears with real depth.
  const showToggle = project.overview.deepDive && hasChapters;

  const currentIndex = PERSONAL.findIndex((entry) => entry.slug === project.slug);
  const nextProject = PERSONAL[(currentIndex + 1) % PERSONAL.length]!;

  const navItems: ChapterNavItem[] = renderedChapters.map(({ anchor, chapter, number }) => ({
    anchor,
    number,
    title: chapter.title,
  }));

  const summaryView = (
    <Prose>
      {project.overview.thirtySecond.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </Prose>
  );

  const deepView = (
    <div className="grid gap-[var(--space-8)] lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
      <ChapterNav items={navItems} />
      <div className="flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap-tablet)]">
        {renderedChapters.map(({ chapter, anchor, number }) => (
          <Chapter
            key={chapter.id}
            chapter={chapter}
            anchor={anchor}
            number={number}
            sources={project.sources}
          />
        ))}
        {/* ShowTheThinking returns null for a thin project (empty chain) — no empty toggle. */}
        <ShowTheThinking chain={project.thinking} sources={project.sources} />
      </div>
    </div>
  );

  return (
    <>
      <ProgressBar />
      <Container as="article" className="flex flex-col gap-[var(--section-gap-mobile)] py-[var(--section-gap-mobile)] md:gap-[var(--section-gap-tablet)] md:py-[var(--section-gap-tablet)] lg:py-[var(--section-gap-desktop)]">
        <CaseStudyHeader project={project} icon={icon} />

        {showToggle ? (
          <OverviewToggle summary={summaryView} deep={deepView} />
        ) : (
          <div className="flex flex-col gap-[var(--space-8)]">
            {summaryView}
            {hasChapters ? (
              deepView
            ) : (
              <div className="flex max-w-[60ch] flex-col gap-[var(--space-2)] rounded-[var(--radius-utility)] bg-surface p-[var(--space-6)] shadow-[var(--shadow-utility)]">
                {/* ink-2, not ink-3: ink-3 on this surface measures 4.48 (< AA 4.5, axe serious);
                    ink-2 clears every surface/tone with margin (same rule as SectionHeading). */}
                <p className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-2">
                  Deep dive coming
                </p>
                <p className="text-[length:var(--text-body)] text-ink-2">
                  The full case study is being written up. This project is documented as{" "}
                  <span className="font-semibold text-ink">{project.statusLabel}</span>.
                </p>
              </div>
            )}
          </div>
        )}
      </Container>

      <NextProject project={nextProject} icon={projectIcon(nextProject.icon)} />
    </>
  );
}
