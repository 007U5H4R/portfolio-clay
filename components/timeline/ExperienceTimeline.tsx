import { experience } from "@/data/experience";
import { Container } from "@/components/layout/Container";
import { TornEdge } from "@/components/paper";
import { formatRange } from "@/lib/format";
import { StoryCard } from "./StoryCard";
import { SECTION_ANCHOR, storyCardId, TIMELINE_LEAD } from "./timeline-logic";

/**
 * ExperienceTimeline (TKT-41 → TKT-87, Design.md §7.4, §11 Dev-11, decision S18) — `section#experience`
 * on `paper`, one torn edge (the section's only decoration, §3.3).
 *
 * A vertical dashed rail (`220px 1fr` ≥ 900; rail at the left edge below) with one entry per role:
 * a sticky company node (Fraunces 24, dates Inter 14 tabular) and an always-open `StoryCard`. The
 * roles map `data/experience.ts` **in data order** — oldest → newest — which is exactly what the
 * lead now says (S18; TC-167 pins both). Each entry keeps its `#experience-<id>` anchor, so the
 * `/work` experience strip and Ask evidence links still land on the right role, and the keyboard
 * path is plain document order (no toggles to operate). Server component: no client JS.
 *
 * Screen states: static data, no async source → only the working state exists (Design.md §7.9).
 */
export function ExperienceTimeline() {
  return (
    <section id={SECTION_ANCHOR} aria-labelledby="experience-heading" className="xp-s">
      <TornEdge fill="paper" />
      <div className="xp-body">
        <Container className="xp-wrap">
          <div className="xp-head">
            <div>
              <p className="xp-eyebrow" data-micro-label="">Experience</p>
              <h2 id="experience-heading">Where I&apos;ve built</h2>
            </div>
            <p className="xp-lead">{TIMELINE_LEAD}</p>
          </div>

          <ol className="xp-timeline">
            {experience.map((role, index) => {
              const dates = formatRange(
                role.dates.end ? { start: role.dates.start, end: role.dates.end } : { start: role.dates.start },
              );
              return (
                <li key={role.id} id={storyCardId(role.id)} className="xp-role">
                  <div className="xp-node">
                    <p className="xp-co">
                      {role.company}
                      {role.companyNote ? <small>({role.companyNote})</small> : null}
                    </p>
                    <p className="xp-when">{dates}</p>
                  </div>
                  <StoryCard role={role} rotate={index % 2 === 0 ? -0.4 : 0.35} />
                </li>
              );
            })}
          </ol>
        </Container>
      </div>
    </section>
  );
}
