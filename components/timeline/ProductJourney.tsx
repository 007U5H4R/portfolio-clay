import type { CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, DraftTag, Pin, Sheet, Sketch, TornEdge, type PinProps } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { deckle } from "./deckle";
import { JourneyCollage } from "./JourneyCollage";

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

/** Torn outline pair per card: the pale rim, then the cream face inset inside it (TKT-100). */
const edgesFor = (index: number) => ({
  rim: deckle(401 + index * 7, { across: 14, down: 22, depthX: 3, depthY: 1 }),
  face: deckle(503 + index * 7, { across: 14, down: 22, depthX: 3.2, depthY: 1, insetX: 2.4, insetY: 0.8 }),
});

/** Torn strips behind the head, the lead and the closing line (read by CSS as `--strip-edge`). */
const strip = (seed: number) =>
  ({ "--strip-edge": deckle(seed, { across: 18, down: 6, depthX: 1.2, depthY: 9 }) }) as CSSProperties;

/**
 * `/about` product journey (TKT-86 S86.02, Design.md §7.4 "Product journey"; mockup
 * docs/redesign-mockups/m-009/about.html `.journey-s`). Server component (the `Reveal` leaves and the
 * `MediaGate` are the only client islands).
 *
 * Four pinned ivory year cards over the dashed path `Sketch`, with a "start here ↘" annotation. The
 * path and the annotation go through `MediaGate min={900}` — absent from the DOM below 900, where the
 * cards reflow to 2 / 1 columns and the curve would no longer connect them.
 *
 * Decorations (§3.3): torn + collage + path sketch + "start here" annotation = 4 at ≥ 900; torn +
 * collage = 2 at 390. The closing line is a Fraunces lead + `DraftTag` (DRAFT editorial framing), not
 * Caveat.
 *
 * TKT-100 (Tushar direction 2026-09-26, about-journey-target.png; Design.md §11 Dev-41): the head,
 * lead and closing line sit on torn paper strips (CSS on their own boxes — content paper, not
 * decoration); each card is a deckled torn-edge sheet (two seeded `clip-path` layers behind the
 * content, `aria-hidden`, the card's own material); the range line sits on a tinted highlighter strip;
 * the DraftTag is a stamp-like outlined box; and every ornament — scraps, sprigs, flowers, stamp,
 * postmarks, the line-art doodles at the card feet — lives in ONE `data-decor="collage"` layer
 * (`JourneyCollage`).
 * Still no buttons, links or URL hash here — the per-role disclosure is ExperienceTimeline's job.
 */
export function ProductJourney() {
  return (
    <section id="journey" className="aj" aria-labelledby="journey-heading">
      <TornEdge fill="paper-2" />
      <Container className="aj-wrap">
        <div className="about-head aj-head">
          <div className="aj-strip aj-head-strip" style={strip(601)}>
            <p className="about-eyebrow" data-micro-label="">My product journey</p>
            <h2 id="journey-heading" className="about-h2">
              Different tools. Same curiosity.
            </h2>
          </div>
          <p className="about-lead aj-strip aj-lead-strip" style={strip(602)}>Four stages, from enterprise delivery to AI-native products.</p>
        </div>

        <div className="aj-grid">
          <JourneyCollage />
          <MediaGate min={900}>
            <Sketch variant="path" className="aj-path" />
            <Annotation rotate={-4} className="aj-start">
              start here ↘
            </Annotation>
          </MediaGate>
          <ol className="aj-list">
            {JOURNEY_STAGES.map((stage, index) => {
              const edges = edgesFor(index);
              return (
                <li key={stage.id} className="aj-item" data-stage={stage.id}>
                  <Reveal index={index} className="aj-reveal">
                    <Sheet as="article" variant="card" rotate={ROTATIONS[index]} className="aj-card">
                      <Pin tone={PIN_TONES[index]} />
                      <span className="aj-paper" aria-hidden="true">
                        <span className="aj-paper-rim" style={{ clipPath: edges.rim }} />
                        <span className="aj-paper-face" style={{ clipPath: edges.face }} />
                      </span>
                      <span className="aj-year">{stage.year}</span>
                      <h3 className="aj-h3">{stage.milestone}</h3>
                      <p className="aj-range" data-micro-label="">
                        {stage.range} · {stage.label}
                      </p>
                      <p className="aj-desc">{stage.description}</p>
                    </Sheet>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="aj-close">
          <span className="aj-strip aj-close-strip" style={strip(603)}>
            The tools changed. The curiosity didn&apos;t.
          </span>{" "}
          <DraftTag className="aj-stamp" />
        </p>
      </Container>
    </section>
  );
}
