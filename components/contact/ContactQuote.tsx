/**
 * The Contact opener's handwritten quote (TASK-171, Tushar 2026-10-07: "a motivational or inspirational quote relevant
 * to my personality and portfolio" on the empty notebook page, handwriting, light and dark). A real, attributed quote —
 * Alan Kay, 1971 (Xerox PARC) — for a builder who turns research into shipped products. Live text for screen readers;
 * ≥ 768 it is written on the scene's ruled page, < 768 (the opener crops to Tushar) it sits just below the scene.
 */
export function ContactQuote() {
  return (
    <figure className="opener-quote">
      <blockquote className="opener-quote-text">
        <p>The best way to predict the future is to invent it.</p>
      </blockquote>
      <figcaption className="opener-quote-by">— Alan Kay</figcaption>
    </figure>
  );
}
