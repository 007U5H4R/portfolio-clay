import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, TornEdge } from "@/components/paper";
import { RECOGNITION, RECOGNITION_HEAD } from "./about-content";

/** Small hand-drawn award icons (spec §28) in `currentColor`: a trophy, a star, a rosette ribbon. */
const ICONS: Record<(typeof RECOGNITION)[number]["icon"], ReactNode> = {
  trophy: (
    <>
      <path d="M12 6h12v6.5c0 4.2-2.7 7.5-6 7.5s-6-3.3-6-7.5z" />
      <path d="M12 9H7.5c0 4 1.8 6.5 5 6.8M24 9h4.5c0 4-1.8 6.5-5 6.8M18 20v5M13 31h10M14.5 25.5h7l1 5.5h-9z" />
    </>
  ),
  star: <path d="M18 4.5l3.9 8.6 9.3 1-7 6.3 2 9.2L18 24.9l-8.2 4.7 2-9.2-7-6.3 9.3-1z" />,
  ribbon: (
    <>
      <circle cx="18" cy="13" r="8.5" />
      <circle cx="18" cy="13" r="4.2" />
      <path d="M12.5 19.5 9.5 31l4.6-2.2 2.6 4.2 1.3-11.4M23.5 19.5l3 11.5-4.6-2.2-2.6 4.2-1.3-11.4" />
    </>
  ),
};

/**
 * RECOGNITION (TASK-136, spec §27–§28) — `section#recognition` on `paper` under its torn edge: eyebrow,
 * h2 "A few milestones along the way." and the recognition `data/credentials.ts` records — a small icon,
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
              {RECOGNITION.map((award) => (
                <li key={award.id} className="rcx-item" data-award={award.id}>
                  <svg className="rcx-icon" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
                    {ICONS[award.icon]}
                  </svg>
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
