import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, DraftTag, Pin, Sheet, Sketch, TornEdge, type PinProps } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";

export interface ProductJourneyStage {
  id: string;
  /** Big display year — that stage's own `range` start year ("Now" for the mid-flight last stage). */
  year: string;
  /** Short milestone name, derived from the stage's own `label`/`description` (see below). */
  milestone: string;
  range: string;
  label: string;
  description: string;
}

// source: CONTENT_INVENTORY §4.2 — unchanged copy from the M-008 component (content truth). The
// 2019–2022 gap note (education/patent/paper) stays OMITTED (M-006 default, Design.md TKT-40 AC 3).
// A different 4-stage framing than `data/experience.ts`'s 4 roles (that file backs ExperienceTimeline).
// `year`/`milestone` derivations: `year` = the `range` start year ("Now" for the last, mid-flight
// stage); "Products" — Godrej Smartnet was a product platform; "Cloud & Data" — the stage's `label`;
// "Enterprise Platforms" — the AmEx role's `context` ("cloud-native MARS microservices platform");
// "AI-Native Products" — the `label` plus the description's product list.
export const JOURNEY_STAGES: readonly ProductJourneyStage[] = [
  {
    id: "physical-enterprise",
    year: "2016",
    milestone: "Products",
    range: "Sep 2016 – Dec 2018",
    label: "Physical / enterprise",
    description:
      "Godrej Infotech — Assistant PM on the Godrej Smartnet platform; 12 features shipped in 11 months.",
  },
  {
    id: "cloud-data",
    year: "2022",
    milestone: "Cloud & Data",
    range: "Aug 2022 – Jun 2026",
    label: "Cloud & data",
    description:
      "Quantiphi (GCP) — cloud-native programs across data engineering, API modernization, and GenAI initiatives; Shellkode (AWS) delivery programs.",
  },
  {
    id: "ai-enabled",
    year: "2026",
    milestone: "Enterprise Platforms",
    range: "Jun 2026 – present",
    label: "AI-enabled",
    description: "American Express — Devin GenAI adoption across the MARS engineering ecosystem.",
  },
  {
    id: "ai-native",
    year: "Now",
    milestone: "AI-Native Products",
    range: "Aug – Sep 2026",
    label: "AI-native",
    description:
      "TeachSpark (Claude-generated worksheets on WhatsApp), RailCite (cite-or-refuse RAG), Cubicle (multi-agent, unlaunched).",
  },
];

/** Mockup pin colours (about.html `.jnote`): rust · steel · forest · rust. */
const PIN_TONES: readonly NonNullable<PinProps["tone"]>[] = ["rust", "steel", "forest", "rust"];
/** Mockup rotations (about.html `.jnote:nth-of-type(n)`), within the Sheet's ±0.9° cap. */
const ROTATIONS = [-0.9, 0.7, -0.5, 0.9] as const;

/**
 * `/about` product journey (TKT-86 S86.02, Design.md §7.4 "Product journey"; mockup
 * docs/redesign-mockups/m-009/about.html `.journey-s`). Server component (the `Reveal` leaves and the
 * `MediaGate` are the only client islands).
 *
 * Four pinned ivory year cards over the dashed path `Sketch`, with a "start here ↘" annotation. The
 * path and the annotation go through `MediaGate min={900}` — absent from the DOM below 900, where the
 * cards reflow to 2 / 1 columns and the curve would no longer connect them.
 *
 * Decorations (§3.3): torn + path sketch + "start here" annotation = 3 at ≥ 900; torn only = 1 at 390.
 * The closing line is a Fraunces lead + `DraftTag` (DRAFT editorial framing), not Caveat.
 * Still no buttons, links or URL hash here — the per-role disclosure is ExperienceTimeline's job.
 */
export function ProductJourney() {
  return (
    <section id="journey" className="aj" aria-labelledby="journey-heading">
      <TornEdge fill="paper-2" />
      <Container className="aj-wrap">
        <div className="about-head">
          <div>
            <p className="about-eyebrow" data-micro-label="">My product journey</p>
            <h2 id="journey-heading" className="about-h2">
              Different tools. Same curiosity.
            </h2>
          </div>
          <p className="about-lead">Four stages, from enterprise delivery to AI-native products.</p>
        </div>

        <div className="aj-grid">
          <MediaGate min={900}>
            <Sketch variant="path" className="aj-path" />
            <Annotation rotate={-4} className="aj-start">
              start here ↘
            </Annotation>
          </MediaGate>
          <ol className="aj-list">
            {JOURNEY_STAGES.map((stage, index) => (
              <li key={stage.id} className="aj-item" data-stage={stage.id}>
                <Reveal index={index} className="aj-reveal">
                  <Sheet as="article" variant="card" rotate={ROTATIONS[index]} className="aj-card">
                    <Pin tone={PIN_TONES[index]} />
                    <span className="aj-year">{stage.year}</span>
                    <h3 className="aj-h3">{stage.milestone}</h3>
                    <p className="aj-range" data-micro-label="">
                      {stage.range} · {stage.label}
                    </p>
                    <p className="aj-desc">{stage.description}</p>
                  </Sheet>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <p className="aj-close">
          The tools changed. The curiosity didn&apos;t. <DraftTag />
        </p>
      </Container>
    </section>
  );
}
