import { languages } from "@/data/credentials";
import { skills } from "@/data/skills";
import { Container } from "@/components/layout/Container";
import { Sheet, TornEdge } from "@/components/paper";

/** Mockup rotations (about.html `.sheet.s1…s4`), within the Sheet's ±0.9° cap. */
const ROTATIONS = [-0.6, 0.5, 0.4, -0.8] as const;
/** Tick ink per sheet (about.html: rust on 1 and 4, forest on 2 and 3). */
const TICKS = ["rust", "forest", "forest", "rust"] as const;

/**
 * `/work` Skills — "What I Bring" (TKT-86 S86.02 on `/about`; moved to Experience by TASK-136, Tushar's
 * About redesign spec §30–§33: a skills list is résumé content, so it lives beside the roles and the
 * education it came from). `section#skills` after Education, on `paper` under its torn edge. Server
 * component.
 *
 * The four `data/skills.ts` clusters, verbatim (D7), as ruled notebook sheets on a 12-column grid
 * (5 / 7 / 7 / 5, ±0.4–0.8°), full width below 900. Each item is an Inter 15 px `li` on the sheet's
 * 32 px rules with a hand-drawn tick drawn by CSS (`.acap-list li::before` — list chrome, not a
 * decoration). "SAFe" stays a bare methodology label, never a credential. Then the languages line
 * (Inter, Dev-04; it moved with the Education row it sat under on `/about`).
 *
 * Decorations (§3.3): torn only = 1. The notebooks are content paper (`data-paper="notebook"`).
 */
export function Skills() {
  return (
    <section id="skills" className="acap" aria-labelledby="skills-heading">
      <TornEdge fill="paper" />
      <Container className="acap-wrap">
        <div className="about-head">
          <div>
            <p className="about-eyebrow" data-micro-label="">
              Skills
            </p>
            <h2 id="skills-heading" className="about-h2">
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
        {languages.length > 0 ? <p className="acap-langs">Languages: {languages.join(", ")}.</p> : null}
      </Container>
    </section>
  );
}
