import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, TornEdge } from "@/components/paper";
import { RECOGNITION, RECOGNITION_HEAD } from "./about-content";
import { AWARD_ART } from "./about-paper-art";
import { PaperImg } from "./PaperImg";

/**
 * RECOGNITION (TASK-136, spec §27–§28) — `section#recognition` on `paper` under its torn edge: eyebrow,
 * h2 "A few milestones along the way." and the recognition `data/credentials.ts` records — a folded paper trophy (Higgsfield art, TASK-196),
 * the award name (verbatim) and the year; no description — and one hand note. Never a placeholder award.
 *
 * EVAL-018: torn · the annotation = 2.
 * Motion: the row fades in once (spec §57); none under reduced motion.
 */
export function Recognition() {
  return (
    <section id="recognition" aria-labelledby="recognition-heading" className="rcx">
      <TornEdge fill="paper" />
      <div className="rcx-body">
        <Container className="rcx-wrap">
          <div className="ab-head">
            <div>
              <p className="ab-eyebrow">{RECOGNITION_HEAD.eyebrow}</p>
              <h2 id="recognition-heading" className="ab-h2">
                {RECOGNITION_HEAD.title}
              </h2>
            </div>
            <Annotation rotate={-4} size="lg" className="ab-aside rcx-aside">
              {RECOGNITION_HEAD.note}
            </Annotation>
          </div>
          <Reveal className="rcx-rv">
            <ul className="rcx-list">
              {RECOGNITION.map((award, index) => (
                <li key={award.id} className="rcx-item" data-award={award.id}>
                  <PaperImg id={AWARD_ART[index % AWARD_ART.length]!} className="rcx-art" />
                  <div>
                    <h3 className="rcx-name">{award.title}</h3>
                    <p className="rcx-year">{award.year}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
