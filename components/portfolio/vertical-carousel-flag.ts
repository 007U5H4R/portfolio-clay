/**
 * TASK-301 experiment — set false to restore the TASK-291 layout exactly.
 *
 * One kill switch for the vertical /projects carousel: ON (desktop, >= 1024 px) lays the page out as three columns of one height —
 * a vertical product carousel, the 16:9 video frame, and the product card as a 5:7 "baseball card". OFF renders the TASK-291
 * layout (video + card above a horizontal tray) — same DOM, same CSS effect: every rule is scoped under `.pf-vcar`, a class that
 * is only emitted while this is true. Kept in its own tiny module so specs can import it without the component tree. Same pattern
 * as `HOME_GLASS_HERO_ENABLED`.
 */
export const VERTICAL_CAROUSEL_ENABLED = true;
