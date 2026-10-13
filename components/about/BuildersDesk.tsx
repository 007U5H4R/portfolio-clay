import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Sheet, Tape, TornEdge } from "@/components/paper";
import { DESK } from "./about-content";
import { PaperImg, ThemedPaperImg } from "./PaperImg";

/**
 * THE DESK (TASK-196) — the first body section under the unchanged hero: a ring-bound notebook page on
 * the left (eyebrow, h2, the hero's own route line and the five disciplines) and the origami research
 * desk on the right (Higgsfield art, light and dark pair). `section#desk` on `paper` under its torn edge.
 *
 * ≥ 900 copy 40 % | desk 60 %; below, the desk follows the copy. The desk is decoration (`aria-hidden`,
 * not a counted `data-decor`); the words stay HTML. Motion: the page settles in once (`Reveal`).
 * EVAL-018: torn = 1.
 */
export function BuildersDesk() {
  return (
    <section id="desk" aria-labelledby="desk-heading" className="bdx">
      <TornEdge fill="paper" />
      <div className="bdx-body">
        <Container className="bdx-wrap">
          <div className="bdx-grid">
            <Reveal className="bdx-copy" index={0}>
              <Sheet as="div" variant="card" rotate={-0.5} className="bdx-page">
                <Tape side="l" />
                <span className="bdx-rings" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <p className="ab-eyebrow">{DESK.eyebrow}</p>
                <h2 id="desk-heading" className="ab-h2">
                  {DESK.title}
                </h2>
                <p className="bdx-route">{DESK.route}</p>
                <p className="bdx-sub">{DESK.sub}</p>
                <ul className="bdx-chips" aria-label="Disciplines">
                  {DESK.disciplines.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </Sheet>
            </Reveal>
            <Reveal className="bdx-stage" index={1}>
              <div className="bdx-art" aria-hidden="true">
                <ThemedPaperImg id="desk" className="bdx-desk" />
                <PaperImg id="grove" className="bdx-grove" />
              </div>
            </Reveal>
          </div>
        </Container>
      </div>
    </section>
  );
}
