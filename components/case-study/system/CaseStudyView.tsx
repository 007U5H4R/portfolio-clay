import type { CSSProperties, ReactNode } from "react";
import type { CaseImage, CaseSection, CaseStudy, EvidenceKind, PortfolioEntry, Project } from "@/data/schema";
import { resolveVideoMedia } from "@/lib/portfolio";
import { watchUrl, type VideoMedia } from "@/lib/video-providers";
import { formatYearMonth } from "@/lib/format";
import { Container } from "@/components/layout/Container";
import { NextProject } from "@/components/case-study/NextProject";
import { CaseStudyHero } from "./CaseStudyHero";
import { CaseStudyNav } from "./CaseStudyNav";
import { SectionFrame } from "./SectionFrame";
import { ProblemFlow } from "./ProblemFlow";
import { ProductShowcase } from "./ProductShowcase";
import { DecisionCard } from "./DecisionCard";
import { SystemFlow } from "./SystemFlow";
import { OutcomeBoard } from "./OutcomeBoard";
import { PivotFlow } from "./PivotFlow";
import { ResearchWall } from "./ResearchWall";
import { LearningCard } from "./LearningCard";
import { EvidenceDrawer, type EvidenceRow } from "./EvidenceDrawer";
import { CaseStudyCTA, type CaseAction } from "./CaseStudyCTA";
import { CaseMotion } from "./CaseMotion";
import { themeDecor } from "./theme-decor";
import { EVIDENCE_KINDS } from "@/data/schema";

export interface CaseStudyViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/** Paper-token accents → CSS custom properties the theme stylesheet reads (EVAL-020: token names only). */
function accentVars(accents: readonly string[]): CSSProperties {
  const vars: Record<string, string> = {};
  accents.forEach((token, index) => {
    vars[`--csx-a${index + 1}`] = `var(--color-${token})`;
  });
  return vars as CSSProperties;
}

const DATE_FMT = (value: string): string => {
  const [year, month, day] = value.split("-");
  const ym = formatYearMonth(`${year}-${month}`);
  return day ? `${Number(day)} ${ym}` : ym;
};

/**
 * The custom product case-study one-pager (TASK-130, Tushar's spec). Shared: typography, spacing,
 * the evidence UI (badges, drawer), the navigator, the action strip, a11y. Per product (via
 * `study.theme.key` → `[data-theme]` in case-study.css + `theme-decor.tsx`): the metaphor, motif,
 * accents, hero composition, diagram styling and section order.
 */
export function CaseStudyView({ project, study, portfolio, next }: CaseStudyViewProps) {
  const sourceById = new Map([...project.sources, ...study.extraSources].map((source) => [source.id, source]));
  const videoFor = (mode: "pitch" | "demo"): VideoMedia | undefined => {
    const entry = mode === "pitch" ? portfolio.pitchVideo : portfolio.demoVideo;
    return entry ? resolveVideoMedia(entry, project.name, mode) : undefined;
  };

  const heroMedia = study.hero.media;
  const heroVideo = "video" in heroMedia ? videoFor(heroMedia.video) : undefined;

  // Evidence badges used anywhere on the page → the one legend shows only those.
  const kinds = new Set<EvidenceKind>(study.hero.proofs.map((proof) => proof.kind));
  for (const section of study.sections) {
    if (section.kind !== "outcome") continue;
    section.proofs.forEach((proof) => kinds.add(proof.kind));
    if (section.funnel) kinds.add(section.funnel.kind);
  }
  const legendKinds = EVIDENCE_KINDS.filter((kind) => kinds.has(kind));
  const heroHasLegend = study.hero.proofs.length > 0;

  const posterFor = (mode: "pitch" | "demo", own?: CaseImage): ReactNode => {
    const poster = own ?? ("video" in heroMedia ? heroMedia.poster : undefined);
    if (!poster) return undefined;
    // eslint-disable-next-line @next/next/no-img-element -- static poster art, lazy below the fold
    return <img src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} loading="lazy" decoding="async" />;
  };

  const renderBody = (section: CaseSection): ReactNode => {
    switch (section.kind) {
      case "problem":
        return <ProblemFlow section={section} />;
      case "product":
        return <ProductShowcase section={section} video={section.video ? videoFor(section.video) : undefined} poster={section.video ? posterFor(section.video, section.poster) : undefined} />;
      case "decisions":
        return (
          <ul className="csx-decisions" data-count={section.items.length}>
            {section.items.map((decision, index) => (
              <li key={decision.chose}>
                <DecisionCard decision={decision} index={index} />
              </li>
            ))}
          </ul>
        );
      case "system":
        return <SystemFlow section={section} />;
      case "outcome":
        return <OutcomeBoard section={section} legendKinds={heroHasLegend ? [] : legendKinds} />;
      case "pivot":
        return <PivotFlow section={section} />;
      case "research":
        return <ResearchWall section={section} />;
      case "learnings":
        return (
          <ul className="csx-learnings" data-count={section.items.length}>
            {section.items.map((learning, index) => (
              <li key={learning.title}>
                <LearningCard learning={learning} index={index} />
              </li>
            ))}
          </ul>
        );
    }
  };

  const slotFor = (kind: CaseSection["kind"]) => kind;

  const evidenceRows: EvidenceRow[] = study.evidence.map((item) => ({
    title: item.title,
    type: item.type,
    date: item.date ? DATE_FMT(item.date) : undefined,
    supports: item.supports,
    url: sourceById.get(item.source)?.url,
  }));
  const evidenceTypes = Array.from(new Set(study.evidence.map((item) => item.type)));

  const actions: CaseAction[] = [];
  if (project.links.live) actions.push({ kind: "live", label: "Live product", hint: `Open ${project.name.split(" → ").pop()}`, href: project.links.live });
  const pitch = videoFor("pitch");
  if (pitch) actions.push({ kind: "pitch", label: "Pitch video", hint: "Watch on YouTube", href: watchUrl(pitch) });
  const demo = videoFor("demo");
  if (demo) actions.push({ kind: "demo", label: "Demo video", hint: "Watch on YouTube", href: watchUrl(demo) });
  if (project.links.repoPublic && project.links.github) actions.push({ kind: "github", label: "GitHub", hint: "View the source", href: project.links.github });

  const rootId = `case-${study.slug}`;

  return (
    <>
      <article id={rootId} className="csx" data-theme={study.theme.key} style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />
        <CaseStudyHero
          slug={project.slug}
          name={project.name}
          code={portfolio.code}
          status={portfolio.meta}
          tagline={study.hero.tagline}
          proposition={study.hero.proposition}
          proofs={study.hero.proofs}
          legendKinds={legendKinds}
          layout={study.hero.layout}
          image={"video" in heroMedia ? undefined : heroMedia}
          pivotFrom={study.hero.pivotFrom}
          video={"video" in heroMedia && heroVideo ? { media: heroVideo, poster: heroMedia.poster } : undefined}
          decor={themeDecor(study.theme.key, "hero")}
        />
        <CaseStudyNav name={project.name} items={study.sections.map((section) => ({ id: section.id, label: section.nav }))} />
        <div className="csx-body">
          {study.sections.map((section, index) => (
            <SectionFrame
              key={section.id}
              id={section.id}
              kind={section.kind}
              number={index + 1}
              eyebrow={section.eyebrow}
              headline={section.headline}
              anchors={section.anchors}
              decor={themeDecor(study.theme.key, slotFor(section.kind))}
            >
              {renderBody(section)}
            </SectionFrame>
          ))}
        </div>
        {study.evidence.length > 0 ? (
          <section className="csx-evidence" aria-labelledby="evidence-drawer-section-h">
            <Container className="csx-evidence-in">
              <div className="csx-evidence-head">
                <p className="csx-eyebrow" data-micro-label="">Sources</p>
                <h2 id="evidence-drawer-section-h" className="csx-h2 csx-h2-sm">
                  Everything here is backed by a real artifact.
                </h2>
              </div>
              <ul className="csx-evidence-chips" aria-label="Evidence types">
                {evidenceTypes.map((type) => (
                  <li key={type} className="csx-chip">
                    {type}
                  </li>
                ))}
              </ul>
              <EvidenceDrawer rows={evidenceRows} name={project.name} />
            </Container>
          </section>
        ) : null}
        <CaseStudyCTA actions={actions} meta={[project.role, project.duration, portfolio.meta]} />
      </article>
      <NextProject project={next} />
    </>
  );
}
