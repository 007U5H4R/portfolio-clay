import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { TornEdge } from "@/components/paper";
import { CAREER_HEAD, ERAS } from "./about-content";
import { CareerBoard } from "./CareerBoard";

/**
 * CAREER ACROSS CONTEXTS (TASK-136, spec §12–§18; the pinboard is TASK-196) — eras, not employers:
 * Research & Engineering → Cloud & Data → Enterprise Platforms → AI Products. `section#career` on `paper`
 * under its torn edge. One ordered list on a pinned map (`CareerBoard`): per era a pinned photograph, the name
 * (h3, a button that selects the era), one descriptor, a few words of focus and small context references (the
 * real employers / research roots — no dates, no responsibilities: Experience owns those). Red string joins
 * each era to the "common thread" knot and the slack string draws once on entry (spec §57). < 900 the map
 * becomes a backdrop and the eras stack. No second vertical employment timeline.
 *
 * EVAL-018: torn · the thread `sketch` = 2 (map, photographs, pins and the link strings are plain art/chrome).
 */
export function CareerContexts() {
  return (
    <section id="career" aria-labelledby="career-heading" className="crx">
      <TornEdge fill="paper" />
      <div className="crx-body">
        <Container className="crx-wrap">
          <div className="ab-head">
            <div>
              <p className="ab-eyebrow">{CAREER_HEAD.eyebrow}</p>
              <h2 id="career-heading" className="ab-h2">
                {CAREER_HEAD.title}
              </h2>
            </div>
          </div>
          <Reveal className="crx-strip">
            <CareerBoard eras={ERAS} />
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
