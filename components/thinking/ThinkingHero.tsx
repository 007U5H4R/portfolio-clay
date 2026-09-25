import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { Sketch } from "@/components/paper/Sketch";

/**
 * `/thinking` opener copy (TKT-84 S84.01, Design.md §7.5): eyebrow "Product Thinking", the oversized
 * h1 "Thinking" with the draw-in underline `Sketch`, and the hand-sub `Annotation` "Notes first.
 * Essays later." (an aside, not copy — `aria-hidden`).
 *
 * The §7.5 taped `scene-thinking` photo + its caption annotation are **not** rendered here: TKT-95's
 * `SceneOpener` already shows that scene as the page's full-bleed banner directly above this section
 * (EXE-18 / Dev-24 supersede §6.4's per-page placements), so a second copy of the same picture would
 * be a duplicate. Unit count: 2 (underline sketch · hand-sub annotation) — §3.3 planned 3 with the
 * photo caption.
 */
export function ThinkingHero() {
  return (
    <section className="thinking-opener" aria-labelledby="thinking-h">
      <Container className="thinking-opener-copy">
        <p className="thinking-eyebrow">Product Thinking</p>
        <h1 id="thinking-h" className="thinking-h1">
          <span className="thinking-ul">
            Thinking
            <Sketch variant="underline" />
          </span>
        </h1>
        <Annotation size="hero" rotate={-1.5} className="thinking-hand-sub">
          Notes first. Essays later.
        </Annotation>
      </Container>
    </section>
  );
}
