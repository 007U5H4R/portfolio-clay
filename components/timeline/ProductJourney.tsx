import { Reveal } from "@/components/interactions/Reveal";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";

interface ProductJourneyStage {
  id: string;
  range: string;
  label: string;
  description: string;
}

// source: CONTENT_INVENTORY §4.2 — the 2019–2022 gap note (education/patent/paper) is deliberately
// OMITTED here (M-006 default): it renders only once Tushar confirms the framing (Design.md TKT-40
// AC 3). This is a DIFFERENT 4-stage framing than `data/experience.ts`'s 4 roles — that file backs
// TKT-41's `ExperienceTimeline` (click-through `StoryCard`s per role); this is the decorative,
// reduced-scale "arc of the career" read.
const STAGES: ProductJourneyStage[] = [
  {
    id: "physical-enterprise",
    range: "Sep 2016 – Dec 2018",
    label: "Physical / enterprise",
    description:
      "Godrej Infotech — Assistant PM on the Godrej Smartnet platform; 12 features shipped in 11 months.",
  },
  {
    id: "cloud-data",
    range: "Aug 2022 – Jun 2026",
    label: "Cloud & data",
    description:
      "Quantiphi (GCP) — cloud-native programs across data engineering, API modernization, and GenAI initiatives; Shellkode (AWS) delivery programs.",
  },
  {
    id: "ai-enabled",
    range: "Jun 2026 – present",
    label: "AI-enabled",
    description: "American Express — Devin GenAI adoption across the MARS engineering ecosystem.",
  },
  {
    id: "ai-native",
    range: "Aug – Sep 2026",
    label: "AI-native",
    description:
      "TeachSpark (Claude-generated worksheets on WhatsApp), RailCite (cite-or-refuse RAG), Cubicle (multi-agent, unlaunched).",
  },
];

/**
 * `/about`'s `ProductJourney` (Design.md §3 "Timeline" section: "the same connector-line pattern
 * [as `ExperienceTimeline`] at reduced scale, 4 stages … no click interaction — decorative
 * `Reveal`-on-scroll labels only"; TSK-23, TKT-40, EVAL-008/EVAL-010, TC-095).
 *
 * Deliberately NOT `ExperienceTimeline` (TKT-41, a separate component/ticket): no `TimelineNode`
 * hover-scale, no click/Enter `StoryCard`, no URL hash per role. Each stage is a plain `Reveal`
 * leaf beside a static `ink-3` connector line (the line itself never animates — only the stage
 * text fades/slides in once per Design.md §4's "section reveal" row).
 *
 * Reduced motion (EVAL-010): handled entirely by `Reveal`'s shared global CSS (`app/globals.css`
 * `.reveal` + its `prefers-reduced-motion` override) — under reduced motion the reveal collapses to
 * an opacity-only, ~instant fade with `transform` dropped from the transition list entirely, so
 * this component needs no bespoke reduced-motion branch of its own.
 */
export function ProductJourney() {
  return (
    <Section id="product-journey" aria-labelledby="product-journey-heading">
      <SectionHeading
        id="product-journey-heading"
        eyebrow="Career arc"
        title="The product journey"
        lead="Four stages, from enterprise delivery to AI-native products."
        className="mb-[var(--space-8)]"
      />

      <ol className="relative flex flex-col gap-[var(--space-6)] pl-[var(--space-6)] before:absolute before:left-[var(--space-2)] before:top-[var(--space-2)] before:bottom-[var(--space-2)] before:w-px before:bg-ink-3 before:content-[''] lg:flex-row lg:flex-wrap lg:gap-[var(--space-4)] lg:pl-0 lg:before:inset-x-0 lg:before:bottom-[-14px] lg:before:top-auto lg:before:left-0 lg:before:h-px lg:before:w-auto">
        {STAGES.map((stage, index) => (
          <li key={stage.id} className="relative lg:min-w-0 lg:flex-1">
            <Reveal index={index} className="flex flex-col gap-[var(--space-1)]">
              <span className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
                {stage.range}
              </span>
              <span className="text-[length:var(--text-body)] font-bold text-ink">{stage.label}</span>
              <span className="text-caption text-ink-2">{stage.description}</span>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
