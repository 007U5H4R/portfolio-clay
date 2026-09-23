/**
 * Hero-avatar motion tuning — the ONE place to nudge the "human presence that reacts, not
 * performs" interaction (animation prompt.md; Design.md §3–§4). Design principle: subtle, premium,
 * never gimmicky. Bump a number here, retune the whole scene.
 *
 * Split of responsibility (kept deliberately, like the `easings`↔`--ease-*` sync note in
 * lib/motion.ts):
 *   - JS-CONSUMED here — the cursor-driven values that need per-frame maths: parallax pixel ranges,
 *     card/icon tilt in degrees, the hover/focus "activation" offsets, and the entrance stagger
 *     delays (fed to the CSS keyframes via inline `animation-delay`).
 *   - CSS-PAIRED in app/globals.css — the keyframe animations that need no JS: the entrance settle,
 *     the idle breathing loop, and the icon-tile hover lift/glow. The `entrance`/`idle`/`hover`
 *     figures below MUST stay in sync with those keyframes (they are the documented source of truth
 *     for them); the entrance delays are the only ones JS actually reads.
 *
 * The parallax/tilt springs reuse `springs.parallax` from lib/motion.ts (the app-wide parallax
 * spring, {stiffness:120, damping:20, mass:1}) rather than defining a second, near-identical spring
 * — one source of truth for "how the cursor parallax feels". (The spec suggested mass 0.8; the 0.2
 * difference is imperceptible and not worth diverging the shared spring.)
 */
export const HERO_MOTION = {
  /** Cursor parallax (desktop pointer only). Layers move by different amounts → depth. */
  parallax: {
    /**
     * The frame + avatar move as ONE composite layer (the avatar is a single flat webp baked into
     * the desk scene, so the bezel and the person cannot be parallaxed independently — see the
     * deferred-effects note in AvatarScene). `avatar` is that unit's range; `frame` is reserved for
     * when a separated foreground/background avatar asset lands.
     */
    frame: 3, // px — reserved (needs a separated avatar asset)
    avatar: 5, // px — the whole frame+avatar composite
    tile: 10, // px — icon tiles move MORE than the subject (foreground depth)
    tilt: 2, // deg — whole-card rotateX / rotateY maximum (never exceed without review)
    iconTilt: 1.25, // deg — per-tile rotation with the cursor
  },

  /** Hover / Ask-focus "activation" offsets — the scene leaning in toward the user. */
  activation: {
    leanX: 2, // px — avatar leans toward the desk on hover / Ask-focus
    leanRotate: 0.4, // deg — a hair of rotation with the lean
    tileDrift: 4, // px — icon tiles drift inward when the Ask input is focused
  },

  /**
   * Entrance stagger — frame+avatar settle first, then the tiles pop in one after another. Only
   * these delays are read by JS (as inline `animation-delay` on each tile); the durations live in
   * the CSS keyframes and are mirrored here for reference.
   */
  entrance: {
    avatarMs: 520, // frame+avatar settle (CSS `hero-enter-avatar`)
    tileMs: 320, // per-tile pop (CSS `hero-enter-tile`)
    tileBaseDelayMs: 260, // first tile starts here (spec: ~260ms after load)
    staggerMs: 80, // gap between tiles (spec: 60–90ms)
  },

  /** Idle life + hover — CSS-paired (documented here, animated in globals.css). */
  idle: {
    breathMs: 4800, // breathing loop period on the avatar
  },
  hover: {
    liftPx: 6, // icon-tile lift on hover
  },
} as const;
