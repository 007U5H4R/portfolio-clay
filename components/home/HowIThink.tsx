import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { DraftTag, Hand, Pin, Sheet, Sketch, TornEdge } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { stagePin, type StageId } from "@/lib/stages";
import { deckle } from "./deckle";
import { HowIThinkCollage } from "./HowIThinkCollage";

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
 * Decorations (Design.md §3.3, EVAL-018): `torn` + the collage backdrop + the journey `sketch` = 3 at
 * ≥ 1025. The sketch is mounted through `MediaGate min={1025}`, so it is absent from the DOM ≤ 1024
 * (count 2 at 390) — the cards reflow to 3 / 2 / 1 columns there and the curve would no longer
 * connect them.
 *
 * TKT-99 (Tushar direction 2026-09-26, how-i-think-target.png; Design.md §11 Dev-41): each card is a
 * deckled, torn-edge sheet (seeded `clip-path` layers — shade, rim, face — behind the content — the card's own
 * material, `aria-hidden`, not a decoration), the quote sits on a tinted torn slip with a washi-tape
 * strip (CSS on the blockquote; the cite stays plain below it), the DraftTag is the compact two-line
 * form, the numeral is terracotta italic, and the pill is a paper button with an arrow glyph. The
 * collage behind the cards is ONE `data-decor="collage"` object (`HowIThinkCollage`).
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

/** Torn outline pair per card: the pale rim, then the cream face inset inside it (TKT-99). */
const edgesFor = (index: number) => ({
  rim: deckle(101 + index * 7, { across: 14, down: 26, depthX: 3, depthY: 0.9 }),
  face: deckle(211 + index * 7, { across: 14, down: 26, depthX: 3.2, depthY: 0.9, insetX: 2.4, insetY: 0.7 }),
  /** The quote slip's torn outline, read by `.hit-slip::before` as `--slip-edge`. */
  slip: { "--slip-edge": deckle(307 + index * 5, { across: 10, down: 8, depthX: 3, depthY: 4 }) } as CSSProperties,
});

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
          <HowIThinkCollage />
          <MediaGate min={1025}>
            <Sketch variant="journey" className="hit-path" />
          </MediaGate>
          <ol className="hit-stages">
            {stages.map((stage, index) => {
              const edges = edgesFor(index);
              return (
              <li key={stage.id} className="hit-stage" data-stage={stage.id} style={edges.slip}>
                <Reveal index={index} className="hit-reveal">
                  <Sheet as="article" variant="card" rotate={rotationFor(index)} className="hit-card">
                    <Pin tone={stagePin[stage.id]} />
                    <span className="hit-paper" aria-hidden="true">
                      <span className="hit-paper-shade" style={{ clipPath: edges.rim }} />
                      <span className="hit-paper-rim" style={{ clipPath: edges.rim }} />
                      <span className="hit-paper-face" style={{ clipPath: edges.face }} />
                    </span>
                    <Hand kind="label" className="hit-num">
                      {String(index + 1).padStart(2, "0")}
                    </Hand>
                    <h3 className="hit-h3">{stage.label}</h3>
                    <DraftTag className="hit-draft">
                      {"Draft — "}
                      <span className="hit-draft-line">pending sign-off</span>
                    </DraftTag>
                    <p className="hit-principle">{stage.principle}</p>
                    <div className="hit-quote">
                      <Hand kind="quote" as="blockquote" cite={stage.example.attribution} className="hit-slip">
                        {`“${stage.example.quote}”`}
                      </Hand>
                    </div>
                    <Link href={stage.example.href} className="hit-pill focus-ring">
                      <span>{`See how I tested this in ${stage.example.projectName}`}</span>
                      <ArrowRight className="hit-pill-arrow" aria-hidden="true" focusable="false" size={18} strokeWidth={1.8} />
                    </Link>
                  </Sheet>
                </Reveal>
              </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
