import type { ReactNode } from "react";
import type { CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { NextProject } from "@/components/case-study/NextProject";
import { SectionFrame } from "@/components/case-study/system/SectionFrame";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { accentVars, caseActions, evidenceRows, legendKinds } from "@/components/case-study/system/case-context";
import { JournalHero } from "./JournalHero";
import { CaseStudyEvidenceDrawer } from "./CaseStudyEvidenceDrawer";
import { JournalCta } from "./JournalCta";
import { CubicleHeroArt, renderCubicleSection } from "./cubicle/Cubicle";
import { DinoHeroArt, renderDinoSection } from "./dino/Dino";
import { VeloraHeroArt, veloraSectionRenderer } from "./velora/Velora";

interface JournalProduct {
  art: (study: CaseStudy) => ReactNode;
  section: (section: CaseSection, study: CaseStudy) => ReactNode;
  /** A smaller evidence strip for thin records (brief §31). */
  compactEvidence?: boolean;
}

/* Each product owns its composition (brief §62: distinct identities first, shared frame second). */
const PRODUCTS: Record<string, JournalProduct> = {
  cubicle: { art: (study) => <CubicleHeroArt study={study} />, section: renderCubicleSection },
  "dino-arcade-pwa": { art: (study) => <DinoHeroArt study={study} />, section: renderDinoSection, compactEvidence: true },
  velora: { art: (study) => <VeloraHeroArt study={study} />, section: (section, study) => veloraSectionRenderer(study)(section) },
};

export function hasJournal(slug: string): boolean {
  return slug in PRODUCTS;
}

export interface JournalViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * The bespoke editorial one-pager (TASK-130 redesign brief): one project journal laid open on a
 * desk. Shared frame — hero · ≈ five numbered chapters on a product-specific vertical rail · the
 * evidence strip and drawer · paper CTA strips · next project. Everything inside a chapter is the
 * product's own composition. The same contract as the system layout holds: one h1, labelled
 * section landmarks with legacy anchors, one badge legend, the accessible drawer, no dev copy.
 */
export function JournalView({ project, study, portfolio, next }: JournalViewProps) {
  const product = PRODUCTS[study.slug];
  if (!product) throw new Error(`/work/${study.slug}: no journal composition (TASK-130)`);
  const rootId = `case-${study.slug}`;
  return (
    <>
      <article id={rootId} className="csx" data-layout="journal" data-theme={study.theme.key} style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />
        <JournalHero
          slug={project.slug}
          name={project.name}
          code={portfolio.code}
          status={portfolio.meta}
          tagline={study.hero.tagline}
          beats={study.hero.beats}
          proposition={study.hero.proposition}
          proofs={study.hero.proofs}
          legendKinds={legendKinds(study)}
          art={product.art(study)}
        />
        <div className="csx-body jx-body">
          <span className="jx-rail" aria-hidden="true" />
          {study.sections.map((section, index) => (
            <SectionFrame
              key={section.id}
              id={section.id}
              kind={section.kind}
              number={index + 1}
              eyebrow={section.eyebrow}
              headline={section.headline}
              anchors={section.anchors}
            >
              {product.section(section, study)}
            </SectionFrame>
          ))}
        </div>
        <CaseStudyEvidenceDrawer items={study.evidence} rows={evidenceRows(project, study)} name={project.name} compact={product.compactEvidence} />
        <JournalCta actions={caseActions(project, portfolio)} portfolioHref={`/projects?product=${project.slug}`} name={project.name} meta={[project.role, project.duration, portfolio.meta]} />
      </article>
      <NextProject project={next} />
    </>
  );
}
