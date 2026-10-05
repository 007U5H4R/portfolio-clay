import { skills } from "@/data/skills";
import { Container } from "@/components/layout/Container";
import { Sheet, TornEdge } from "@/components/paper";

/** Mockup rotations (about.html `.sheet.s1…s4`), within the Sheet's ±0.9° cap. */
const ROTATIONS = [-0.6, 0.5, 0.4, -0.8] as const;
/** Tick ink per sheet (about.html: rust on 1 and 4, forest on 2 and 3). */
const TICKS = ["rust", "forest", "forest", "rust"] as const;

/**
 * `/about` "What I Bring" (TKT-86 S86.02, Design.md §7.4 "Capabilities"; mockup about.html
 * `.skills-s`). Server component.
 *
 * The four `data/skills.ts` clusters, verbatim (D7), as ruled notebook sheets on a 12-column grid
 * (5 / 7 / 7 / 5, ±0.4–0.8°), full width below 900. Each item is an Inter 15 px `li` on the sheet's
 * 32 px rules with a hand-drawn tick drawn by CSS (`.acap-list li::before` — list chrome, not a
 * decoration). "SAFe" stays a bare methodology label, never a credential.
 *
 * Decorations (§3.3): torn only = 1. The notebooks are content paper (`data-paper="notebook"`).
 */
export function CapabilityClusters() {
  return (
    <section id="capability-clusters" className="acap" aria-labelledby="capability-clusters-heading">
      <TornEdge fill="paper" />
      <Container className="acap-wrap">
        <div className="about-head">
          <div>
            <p className="about-eyebrow" data-micro-label="">Skills</p>
            <h2 id="capability-clusters-heading" className="about-h2">
              What I Bring
            </h2>
          </div>
          <p className="about-lead">Product, AI, technology, and execution — the range behind the roadmap.</p>
        </div>

        <div className="acap-sheets">
          {skills.map((cluster, index) => (
            <Sheet
              key={cluster.id}
              as="article"
              variant="notebook"
              rotate={ROTATIONS[index % ROTATIONS.length]}
              className="acap-sheet"
            >
              <h3 className="acap-h3">{cluster.name}</h3>
              <ul className="acap-list" data-tick={TICKS[index % TICKS.length]}>
                {cluster.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Sheet>
          ))}
        </div>
      </Container>
    </section>
  );
}
