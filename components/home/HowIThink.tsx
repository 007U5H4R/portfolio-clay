import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { DraftTag, Hand, Pin, Sheet, Sketch, TornEdge } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { stagePin, type StageId } from "@/lib/stages";

/**
 * HowIThink — home section "A product journey, not a process." (TKT-76, Design.md §7.1; mockup
 * docs/redesign-mockups/m-009/home.html `.think`). Server component.
 *
 * Six pinned ivory stage cards (`Sheet variant="card"` + `Pin`, alternating −0.8° / +0.6°, odd cards
 * offset 28 px) laid over the dashed journey-curve `Sketch`. Every card is static: Caveat numeral
 * (`data-hand="label"`), h3 stage, the DRAFT principle with its `DraftTag`, the VERIFIED example as a
 * `data-hand="quote"` blockquote + `cite`, and one link pill into the case-study chapter that proves
 * it. The M-008 expand / arrow-key disclosure is gone — the quote is always visible, and the
 * pills are the section's only focus stops (TC-148).
 *
 * Decorations (Design.md §3.3, EVAL-018): `torn` + the journey `sketch` = 2 at ≥ 1025. The sketch is
 * mounted through `MediaGate min={1025}`, so it is absent from the DOM ≤ 1024 (count 1 at 390) — the
 * cards reflow to 3 / 2 / 1 columns there and the curve would no longer connect them.
 *
 * Copy: stage label, principle, quote and attribution are rendered verbatim from
 * `data/thinking-framework.ts` (D7); the project name is resolved server-side in `app/page.tsx`.
 */

export interface HowIThinkStage {
  id: StageId;
  label: string;
  /** DRAFT editorial framing (data/thinking-framework.ts header) — always rendered with a `DraftTag`. */
  principle: string;
  example: {
    quote: string;
    attribution: string;
    href: string;
    /** Resolved project display name (e.g. "Nuptis → Velora") — resolved server-side (A1). */
    projectName: string;
  };
}

export interface HowIThinkProps {
  /** Already in CONTENT_INVENTORY §1.5 order (`lib/stages.ts` `orderStages`) — rendered as given. */
  stages: HowIThinkStage[];
}

/** Mockup rotations: odd cards −0.8°, even +0.6° (within the Sheet's ±0.9° cap). */
const rotationFor = (index: number) => (index % 2 === 0 ? -0.8 : 0.6);

export function HowIThink({ stages }: HowIThinkProps) {
  return (
    <section id="how-i-think" className="hit" aria-labelledby="how-i-think-heading">
      <TornEdge fill="paper" />
      <Container className="hit-wrap">
        <div className="hit-head">
          <div>
            <p className="hit-eyebrow">How I think</p>
            <h2 id="how-i-think-heading" className="hit-h2">
              A product journey, not a process.
            </h2>
          </div>
          <p className="hit-lead">
            From ambiguity to impact — six stages I return to on every product, each grounded in one real, sourced
            example.
          </p>
        </div>

        <div className="hit-journey">
          <MediaGate min={1025}>
            <Sketch variant="journey" className="hit-path" />
          </MediaGate>
          <ol className="hit-stages">
            {stages.map((stage, index) => (
              <li key={stage.id} className="hit-stage" data-stage={stage.id}>
                <Reveal index={index} className="hit-reveal">
                  <Sheet as="article" variant="card" rotate={rotationFor(index)} className="hit-card">
                    <Pin tone={stagePin[stage.id]} />
                    <Hand kind="label" className="hit-num">
                      {String(index + 1).padStart(2, "0")}
                    </Hand>
                    <h3 className="hit-h3">{stage.label}</h3>
                    <DraftTag className="hit-draft" />
                    <p className="hit-principle">{stage.principle}</p>
                    <div className="hit-quote">
                      <Hand kind="quote" as="blockquote" cite={stage.example.attribution}>
                        {`“${stage.example.quote}”`}
                      </Hand>
                    </div>
                    <Link href={stage.example.href} className="hit-pill focus-ring">
                      {`See how I tested this in ${stage.example.projectName}`}
                    </Link>
                  </Sheet>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
