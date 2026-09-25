import { Container } from "@/components/layout/Container";
import { Hand } from "@/components/paper/Hand";
import { Sheet } from "@/components/paper/Sheet";
import { TornEdge } from "@/components/paper/TornEdge";

export type LearningsProps = {
  /** The project's `learnings[]`, rendered verbatim and in data order (D7). */
  learnings: readonly string[];
};

/**
 * "What I learned" (TKT-82, Design.md §7.3, decision S18; TC-157): renders the project's
 * `learnings[]` — data that existed before M-009 but was never shown. `section.learned` on
 * `paper-2` with its `TornEdge` as the first child (the section's one counted decoration, §3.3);
 * grid `1fr 1.35fr`: eyebrow + h2 + help, then a notebook `Sheet` holding a numbered `<ol>` —
 * Caveat numerals as `data-hand="label"` (2-digit numerals, §3.4), each learning in Inter 16 on
 * the notebook's 32 px rules. Returns `null` for an empty array: no invented, empty section.
 * Server component.
 */
export function Learnings({ learnings }: LearningsProps) {
  if (learnings.length === 0) return null;
  return (
    <section className="learned" aria-labelledby="learned-h">
      <TornEdge fill="paper-2" />
      <div className="learned-body">
        <Container className="learned-wrap">
          <div>
            <p className="learned-eyebrow">Learnings</p>
            <h2 id="learned-h" className="learned-h">
              What I learned
            </h2>
            <p className="learned-help">From the project file, kept short enough to remember.</p>
          </div>
          <Sheet variant="notebook" className="learned-notebook">
            <ol className="learned-list">
              {learnings.map((learning, index) => (
                <li key={index}>
                  <Hand kind="label" className="learned-num">
                    {String(index + 1).padStart(2, "0")}
                  </Hand>
                  <span>{learning}</span>
                </li>
              ))}
            </ol>
          </Sheet>
        </Container>
      </div>
    </section>
  );
}
