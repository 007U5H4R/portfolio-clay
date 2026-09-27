import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { ContactCard } from "./ContactCard";
import { ContactEntrance } from "./ContactEntrance";
import { ContactVisualStory } from "./ContactVisualStory";

/**
 * `/contact` Contact section (TASK-113 — Tushar's contact spec 2026-09-27, the reference of record;
 * `docs/redesign-mockups/m-009/tushar-2026-09-27/contact-spec.md`). The last page of the scrapbook,
 * directly under TKT-95's `SceneOpener`, replacing TSK-46's numbered actions list and the separate
 * postcard "details" section (spec §27; Design.md §11 Dev-98).
 *
 *   ≥ 1024: two columns `42fr 58fr` — left the visual story (collage, sticky, closing line), right the
 *           head (eyebrow, h1, hand subline) over the functional card.
 *   < 1024: one column in the spec §22 order — head → card → visual story (collage scaled down).
 *
 * Counting unit (EVAL-018, Design.md §3.3): subline annotation · collage · sticky · closing
 * annotation = 4. No torn edge: the band footer's tear slides over this section (TKT-106); the
 * section is its own stacking context at z 0, so nothing here ever paints over the band.
 */
export function ContactSection() {
  return (
    <section id="contact" className="cx" aria-labelledby="contact-h">
      <Container>
        <ContactEntrance className="cx-grid">
          <div className="cx-head">
            <p className="contact-eyebrow">Contact</p>
            <h1 id="contact-h" className="cx-h1">
              Still curious?
            </h1>
            <Annotation size="hero" rotate={-1.5} className="cx-subline">
              Choose the easiest way to say hello ↓
            </Annotation>
          </div>
          <div className="cx-main">
            <ContactCard />
          </div>
          <ContactVisualStory />
        </ContactEntrance>
      </Container>
    </section>
  );
}
