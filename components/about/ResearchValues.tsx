import type { ReactNode } from "react";
import { papers, patent, researchDisclaimer } from "@/data/credentials";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Tag } from "@/components/common/Tag";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, Illustration, Sheet, Tape, TornEdge } from "@/components/paper";
import { PRINCIPLES, RESEARCH_ARTIFACTS, RESEARCH_HEAD, VALUES_HEAD } from "./about-content";
import { AboutArtImg } from "./AboutArtImg";

/** Hand-drawn principle icons (spec §25): a lightbulb, a gear, a leaf on a growth arrow. `currentColor`. */
const PRINCIPLE_ICONS: Record<(typeof PRINCIPLES)[number]["icon"], ReactNode> = {
  bulb: (
    <>
      <path d="M18 5.5c-5.2 0-9 3.9-9 8.7 0 3.2 1.7 5.2 3.3 6.9 1 1.1 1.7 2.2 1.7 3.6v1.3h8v-1.3c0-1.4.7-2.5 1.7-3.6 1.6-1.7 3.3-3.7 3.3-6.9 0-4.8-3.8-8.7-9-8.7z" />
      <path d="M14.5 29.5h7M15.5 32.5h5M18 12v6M15.5 15.5 18 18l2.5-2.5" />
    </>
  ),
  gear: (
    <>
      <path d="M16 4.5h4l.7 3.6 2.6 1.1 3-2.1 2.8 2.8-2.1 3 1.1 2.6 3.6.7v4l-3.6.7-1.1 2.6 2.1 3-2.8 2.8-3-2.1-2.6 1.1-.7 3.6h-4l-.7-3.6-2.6-1.1-3 2.1-2.8-2.8 2.1-3-1.1-2.6-3.6-.7v-4l3.6-.7 1.1-2.6-2.1-3 2.8-2.8 3 2.1 2.6-1.1z" />
      <circle cx="18" cy="18" r="4.6" />
    </>
  ),
  leaf: (
    <>
      <path d="M7 29c3-9.5 9.5-16.5 22-21-1.2 12.8-8.4 20-17.6 20.2" />
      <path d="M7 29c5.2-6 10-10 15.5-13.5" />
      <path d="M22.5 26.5 29 20l.2 6.4" />
    </>
  ),
};

/**
 * RESEARCH & INTELLECTUAL WORK + WHAT DRIVES ME (TASK-136, spec §19–§26, §42) — one `section#research-values`
 * on `paper-2` under its torn edge, two labelled regions with strong asymmetry (≥ 1024: 55 % | 45 %;
 * stacked below).
 *
 *   #research  eyebrow, h2 "From labs to lasting ideas.", "Research shaped how I think." and three compact
 *              artifacts (nanotechnology · the granted patent · the papers), each a taped print with its
 *              caption in HTML. Then the papers as short references (journal, year, title, DOI link or
 *              "DOI pending" — the Soft Matter DOI is recorded as missing, so it is never invented), the
 *              patent-record link and the rights line verbatim. Not an education block (spec §23).
 *   #values    eyebrow, h2, one paper card with exactly three principles and their icons, beside the
 *              `polaroid-sunrise` print (content paper, manifest alt) and a hand note.
 *
 * EVAL-018: torn · the "Same curiosity. Broader horizons." annotation = 2. Motion: the artifacts settle
 * in once, 90 ms apart (spec §57); none under reduced motion.
 */
export function ResearchValues() {
  return (
    <section id="research-values" aria-label="Research and what drives me" className="rvx">
      <TornEdge fill="paper-2" />
      <div className="rvx-body">
        <Container className="rvx-wrap">
          <div id="research" role="region" aria-labelledby="research-heading" className="rvx-research">
            <p className="ab-eyebrow">{RESEARCH_HEAD.eyebrow}</p>
            <h2 id="research-heading" className="ab-h2">
              {RESEARCH_HEAD.title}
            </h2>
            <p className="ab-lead">{RESEARCH_HEAD.lead}</p>
            <ul className="rvx-artifacts">
              {RESEARCH_ARTIFACTS.map((artifact, index) => (
                <li key={artifact.id} className="rvx-slot">
                  <Reveal index={index} className="rvx-rv">
                    <Sheet as="article" variant="card" rotate={[-0.8, 0.5, -0.4][index]} className="rvx-artifact">
                      <Tape side={index === 1 ? "r" : "l"} />
                      <AboutArtImg id={artifact.art} className="rvx-art" />
                      <h3 className="rvx-title">{artifact.title}</h3>
                      {artifact.meta ? <p className="rvx-meta">{artifact.meta}</p> : null}
                      <p className="rvx-text">{artifact.body}</p>
                    </Sheet>
                  </Reveal>
                </li>
              ))}
            </ul>
            <ul className="rvx-papers" aria-label="Publications">
              {papers.map((paper) => (
                <li key={paper.id}>
                  <span className="rvx-cite">
                    {paper.journal} {paper.year}
                  </span>{" "}
                  <span className="rvx-ptitle">{paper.title}</span>{" "}
                  {paper.doi && paper.doiHref ? (
                    <ExternalLink href={paper.doiHref} className="rvx-doi">
                      DOI {paper.doi}
                    </ExternalLink>
                  ) : (
                    <Tag className="rvx-pending">DOI pending</Tag>
                  )}
                </li>
              ))}
            </ul>
            <p className="rvx-foot">
              <ExternalLink href={patent.href} className="rvx-patent-link">
                View Pratyasa — the patent record
              </ExternalLink>
              <span className="rvx-disclaimer">{researchDisclaimer}</span>
            </p>
          </div>

          <div id="values" role="region" aria-labelledby="values-heading" className="rvx-values">
            <p className="ab-eyebrow">{VALUES_HEAD.eyebrow}</p>
            <h2 id="values-heading" className="ab-h2 rvx-values-h2">
              {VALUES_HEAD.title}
            </h2>
            <div className="rvx-values-row">
              <Sheet variant="card" rotate={-0.4} className="rvx-principles">
                <Tape side="c" />
                <ul className="rvx-plist">
                  {PRINCIPLES.map((principle) => (
                    <li key={principle.id} data-principle={principle.id}>
                      <svg className="rvx-picon" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
                        {PRINCIPLE_ICONS[principle.icon]}
                      </svg>
                      <span>{principle.text}</span>
                    </li>
                  ))}
                </ul>
              </Sheet>
              <div className="rvx-photo">
                <Illustration
                  id="polaroid-sunrise"
                  placement="photo"
                  rotate={2.2}
                  sizes="(max-width: 639px) 46vw, 200px"
                  className="rvx-polaroid"
                >
                  <Tape side="c" />
                </Illustration>
                <Annotation rotate={-4} size="lg" className="rvx-note">
                  {VALUES_HEAD.note}
                </Annotation>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
