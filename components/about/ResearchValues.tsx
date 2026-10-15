import { FileText } from "lucide-react";
import { papers, patent, researchDisclaimer } from "@/data/credentials";
import type { ResearchPaper } from "@/data/credentials";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Tag } from "@/components/common/Tag";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Sheet, Tape, TornEdge } from "@/components/paper";
import { RESEARCH_ARTIFACTS, RESEARCH_HEAD } from "./about-content";
import { ABOUT_ARTWORK } from "./about-artwork";
import { ThemedPaperImg } from "./PaperImg";

function DocBadge() {
  return (
    <span className="rvx-badge" aria-hidden="true">
      <FileText size={18} strokeWidth={1.6} />
    </span>
  );
}

/** One bibliographic entry: journal + year, the full title, and its DOI link (never a guessed DOI). */
function PaperEntry({ paper }: { paper: ResearchPaper }) {
  return (
    <div className="rvx-panel-body">
      <div className="rvx-cite-row">
        <DocBadge />
        <p className="rvx-cite">
          {paper.journal} {paper.year}
        </p>
      </div>
      <p className="rvx-ptitle">{paper.title}</p>
      {paper.doi && paper.doiHref ? (
        <ExternalLink href={paper.doiHref} className="rvx-doi">
          <span>
            DOI {paper.doi.split("/")[0]}/<wbr />
            {paper.doi.split("/").slice(1).join("/")}
          </span>
        </ExternalLink>
      ) : (
        <Tag className="rvx-pending">DOI pending</Tag>
      )}
    </div>
  );
}

/**
 * RESEARCH & INTELLECTUAL WORK (TASK-136, spec §19–§23, §42; TASK-213 removed "What drives me") — one
 * `section#research-values` on `paper-2` under its torn edge, a single `#research` region:
 *
 *   #research  eyebrow, h2 "From labs to lasting ideas.", "Research shaped how I think." and three compact
 *              artifacts (nanotechnology · the granted patent · the papers), each a taped print with its
 *              caption in HTML. TASK-209: each card is self-contained — the Langmuir reference sits in the
 *              nanotechnology card, the patent-record link + rights line verbatim in the patent card, both full
 *              bibliographic entries (journal, year, title, DOI; "DOI pending" if ever missing, never invented)
 *              in the papers card. No detached reference block. Not an education block (spec §23).
 *
 * TASK-196: the research head carries the open-notebook art. TASK-213: the three card images are one paper-craft
 * triptych (research data · technical investigation · research insights), same camera, light and ratio.
 * EVAL-018: torn = 1. Motion: the artifacts settle in once, 90 ms apart (spec §57); none under reduced motion.
 */
export function ResearchValues() {
  const nanoPaper = papers.find((paper) => paper.id === "langmuir-2025");
  return (
    <section id="research-values" aria-label="Research and intellectual work" className="rvx">
      <TornEdge fill="paper-2" />
      <div className="rvx-body">
        <Container className="rvx-wrap">
          <div id="research" role="region" aria-labelledby="research-heading" className="rvx-research">
            <div className="rvx-head">
              <div className="rvx-head-copy">
                <p className="ab-eyebrow">{RESEARCH_HEAD.eyebrow}</p>
                <h2 id="research-heading" className="ab-h2">
                  {RESEARCH_HEAD.title}
                </h2>
                <p className="ab-lead">{RESEARCH_HEAD.lead}</p>
              </div>
              <div className="rvx-notebook" aria-hidden="true">
                <ThemedPaperImg id="notebook" className="rvx-notebook-img" />
              </div>
            </div>
            <ul className="rvx-artifacts">
              {RESEARCH_ARTIFACTS.map((artifact, index) => (
                <li key={artifact.id} className="rvx-slot" data-artifact={artifact.id}>
                  <Reveal index={index} className="rvx-rv">
                    <Sheet as="article" variant="card" rotate={[-0.8, 0.5, -0.4][index]} className="rvx-artifact">
                      <Tape side={index === 1 ? "r" : "l"} />
                      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP */}
                      <img
                        className="rvx-art"
                        src={ABOUT_ARTWORK[artifact.art].src}
                        width={ABOUT_ARTWORK[artifact.art].width}
                        height={ABOUT_ARTWORK[artifact.art].height}
                        alt={ABOUT_ARTWORK[artifact.art].alt}
                        loading="lazy"
                        decoding="async"
                        data-about-artwork={artifact.art}
                      />
                      <h3 className="rvx-title">{artifact.title}</h3>
                      {artifact.meta ? <p className="rvx-meta">{artifact.meta}</p> : null}
                      {artifact.id === "publications" ? null : <p className="rvx-text">{artifact.body}</p>}
                      {artifact.id === "nanotech" && nanoPaper ? (
                        <div className="rvx-panel">
                          <PaperEntry paper={nanoPaper} />
                        </div>
                      ) : null}
                      {artifact.id === "patent" ? (
                        <div className="rvx-panel">
                          <DocBadge />
                          <div className="rvx-panel-body">
                            <ExternalLink href={patent.href} className="rvx-patent-link">
                              View Pratyasa — the patent record
                            </ExternalLink>
                            <p className="rvx-disclaimer">{researchDisclaimer}</p>
                          </div>
                        </div>
                      ) : null}
                      {artifact.id === "publications" ? (
                        <ul className="rvx-papers" aria-label="Publications">
                          {papers.map((paper) => (
                            <li key={paper.id} className="rvx-panel">
                              <PaperEntry paper={paper} />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </Sheet>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
    </section>
  );
}
