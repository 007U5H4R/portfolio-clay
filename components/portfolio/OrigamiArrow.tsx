export type OrigamiArrowDirection = "up" | "down" | "left" | "right";

/**
 * TASK-303: a standalone folded-paper arrow — three facets (face, shade, lit fold) and a soft cast shadow, no disc or ring behind it.
 * Purely visual and `aria-hidden`: the caller's button names it and supplies the >= 44 px hit area. Colours are the custom properties
 * `--oa-face`, `--oa-shade`, `--oa-lit`, `--oa-shadow` (defaults in its CSS block in globals.css, overridable by the caller).
 * Size is `--oa-size` (default 28px). `left` is the mirror of `right`; `up` / `down` are quarter turns. The shadow sits on the wrapper so
 * it keeps falling to the lower right whichever way the arrow points.
 */
export function OrigamiArrow({ direction }: { direction: OrigamiArrowDirection }) {
  return (
    <span className="oa" data-dir={direction} aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        <polygon className="oa-lit" points="8,5 18,20 8,35" />
        <polygon className="oa-face" points="8,5 36,20 18,20" />
        <polygon className="oa-shade" points="8,35 36,20 18,20" />
      </svg>
    </span>
  );
}
