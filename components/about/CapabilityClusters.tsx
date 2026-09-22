import { skills } from "@/data/skills";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ClayTile } from "@/components/clay/ClayTile";

/**
 * `/about`'s "What I Bring" section (Design.md §3 Timeline section: "capability clusters are 4
 * `ClayTile`s in a 2×2/4×1 grid (utility tier)"; TSK-24, TKT-40 AC 6, TC-094).
 *
 * Renders the 4 `SkillCluster`s from `data/skills.ts` verbatim — every item is transcribed from
 * CONTENT_INVENTORY §4.3, never reworded into a new claim. "SAFe" appears only as a methodology
 * label inside the Execution cluster's item list (never a certification), exactly as `skills.ts`
 * already authors it.
 *
 * `!h-auto !w-full` relaxes `ClayTile`'s fixed square default (same idiom `HowIThink.tsx` uses for
 * its 140px stage tiles) so each tile can grow to fit a heading + item list and stretch to its grid
 * cell, instead of a fixed icon-sized square. Utility tier only — no interactive press state
 * (Design.md §2 / D1: utility tiles never carry the card tier's press physics).
 *
 * Server component: no interactivity, so no client boundary is needed.
 */
export function CapabilityClusters() {
  return (
    <Section id="capability-clusters" aria-labelledby="capability-clusters-heading">
      <SectionHeading
        id="capability-clusters-heading"
        eyebrow="Skills"
        title="What I Bring"
        lead="Product, AI, technology, and execution — the range behind the roadmap."
        className="mb-[var(--space-8)]"
      />

      <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2">
        {skills.map((cluster) => (
          <ClayTile
            key={cluster.id}
            tier="utility"
            tone={cluster.tone}
            className="!h-auto !w-full flex-col items-start gap-[var(--space-3)] p-[var(--space-5)] text-left"
          >
            <span className="text-[length:var(--text-body)] font-bold text-ink">{cluster.name}</span>
            <ul className="flex flex-col gap-[var(--space-2)]">
              {cluster.items.map((item) => (
                <li key={item} className="text-caption text-ink-2">
                  {item}
                </li>
              ))}
            </ul>
          </ClayTile>
        ))}
      </div>
    </Section>
  );
}
