/**
 * TASK-303 kill switch — set false to restore the TASK-301 product card exactly.
 *
 * ON redesigns the desktop (>= 1024 px) vertical-carousel product card as a tactile origami paper card: ivory / charcoal-navy paper, one
 * thin terracotta outline, folded-paper previous / next arrows, the product's own poster in a terracotta frame at its own aspect ratio,
 * a paper primary action and a quiet 2-column grid of secondary actions. It only ever applies where the vertical-carousel card renders
 * (`poster` is passed to ProductInfoPanel), so the phone card is untouched. Every rule is scoped under `.pf-paper`, a class that is only
 * emitted while this is true. Own tiny module so specs can import it without the component tree. Same pattern as `VERTICAL_CAROUSEL_ENABLED`.
 */
export const PAPER_CARD_ENABLED = true;
