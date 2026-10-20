/**
 * TASK-304 — set false to restore the previous video player exactly.
 *
 * One kill switch for the origami paper player: ON (desktop vertical-carousel stage, >= 1024 px only) the stage is a terracotta folded-paper
 * frame with a notched section tab, a title panel over the poster and an origami play triangle; the phone/tablet player is untouched.
 * OFF renders no paper-player markup or attributes, so none of its CSS can match. Own tiny module so specs can import it without the
 * component tree. Same pattern as `VERTICAL_CAROUSEL_ENABLED`.
 */
export const PAPER_PLAYER_ENABLED = true;
