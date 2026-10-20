/**
 * TASK-289 test — set false to restore the previous hero exactly.
 *
 * One kill switch for the "integrated frosted glass" home hero: ON renders the glass panel over the
 * existing paper-cut banner (copy: eyebrow, headline, support, "Explore my work →", "Let's connect");
 * OFF renders the previous hero (paper sheet with the intro video, h1, hand line, "View my work" and
 * "Ask Tushky") — same DOM, same CSS effect (every glass rule is scoped under `.hero-glass-on`, a
 * class that is only emitted while this is true). Kept in its own tiny module so specs can import it
 * without pulling in the component tree. Same pattern as `ORIGAMI_BG_ENABLED`.
 */
export const HOME_GLASS_HERO_ENABLED = true;
