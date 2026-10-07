/**
 * The Contact opener's handwritten quote (TASK-171, Tushar 2026-10-07: "a motivational or inspirational quote relevant
 * to my personality and portfolio" on the empty notebook page, handwriting, light and dark). A real, attributed quote —
 * Alan Kay, 1971 (Xerox PARC) — for a builder who turns research into shipped products. Live text for screen readers,
 * written on the scene's ruled page at every width (smaller in the < 768 crop's top-left corner).
 */
export function ContactQuote() {
  return (
    <figure className="opener-quote">
      {/* EVAL-018 §3.4: handwriting is a declared quote (`data-hand="quote"`) with its cite beside it. */}
      <blockquote className="opener-quote-text" data-hand="quote">
        <p>The best way to predict the future is to invent it.</p>
      </blockquote>
      <figcaption className="opener-quote-by">
        — <cite>Alan Kay</cite>
      </figcaption>
    </figure>
  );
}
