import { wibHeading, wibStatement } from "@/data/what-i-bring";
import { Container } from "@/components/layout/Container";
import { TornEdge } from "@/components/paper";
import { WhatIBringJourney } from "./WhatIBringJourney";

/**
 * `/work` "What I Bring" (TKT-86 S86.02 on `/about`; moved to Experience by TASK-136; redesigned by TASK-187 as the
 * ambiguity-to-impact paper journey, Tushar's spec 2026-10-08). `section#skills` after Education, on `paper` under its
 * torn edge. The four skill-cluster sheets are gone: the seven stages (data/what-i-bring.ts) carry the capabilities,
 * tools and proof, every claim traced to `data/` by tests/unit/what-i-bring.test.ts. The languages line was removed at Tushar's request
 * (TASK-200, 2026-10-12). Server component; the journey is the one client island.
 *
 * Decorations (§3.3): torn only = 1. The art is content (layered paper-cut images), not a decoration.
 */
export function Skills() {
  return (
    <section id="skills" className="acap" aria-labelledby="skills-heading">
      <TornEdge fill="paper" />
      <Container className="acap-wrap">
        <div className="wib-head">
          <h2 id="skills-heading" className="about-h2">
            {wibHeading}
          </h2>
          <p className="wib-statement">{wibStatement}</p>
        </div>
        <WhatIBringJourney />
      </Container>
    </section>
  );
}
