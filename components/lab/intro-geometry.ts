/**
 * Intro scene geometry (TASK-168): the layered art is one registered canvas (2400 × 1350, or 1080 × 1350 on a
 * portrait phone) that is cover-fitted and centred on the viewport. The live gummy's feet must land on the stage
 * disc's centre, so the camera rig and the CSS (`.introBox`) share these numbers.
 */
export const INTRO_DESKTOP = { w: 2400, h: 1350 } as const;
export const INTRO_PORTRAIT = { w: 1080, h: 1350 } as const;
/** Stage disc centre in art pixels (the bear's feet); y is the same on both crops. */
export const STAGE_ANCHOR = { desktop: { x: 1200, y: 905 }, portrait: { x: 540, y: 905 } } as const;
/** Bear height as a fraction of the art box height: the gummy is the hero, the title banner is smaller. */
export const BEAR_BOX_FRACTION = 0.3;
/** World height of the intro bear (gummy-bear.md §27; measured against the camera framing). */
export const BEAR_UNITS = 1.92;

/** Matches the CSS `(max-width: 767px) and (orientation: portrait)` that swaps to the mobile crop. */
export const isPortraitIntro = (vw: number, vh: number) => vw <= 767 && vh > vw;

/** The cover-fitted art box in viewport pixels (centred). */
export function introBox(vw: number, vh: number) {
  const portrait = isPortraitIntro(vw, vh);
  const art = portrait ? INTRO_PORTRAIT : INTRO_DESKTOP;
  const ar = art.w / art.h;
  const w = Math.max(vw, vh * ar);
  const h = w / ar;
  return { portrait, w, h, left: (vw - w) / 2, top: (vh - h) / 2 };
}

/** Where the stage anchor lands in viewport pixels. */
export function stageAnchorPx(vw: number, vh: number) {
  const b = introBox(vw, vh);
  const a = b.portrait ? STAGE_ANCHOR.portrait : STAGE_ANCHOR.desktop;
  const art = b.portrait ? INTRO_PORTRAIT : INTRO_DESKTOP;
  return { x: b.left + (a.x / art.w) * b.w, y: b.top + (a.y / art.h) * b.h, box: b };
}

/**
 * Camera framing for the intro: the visible world height that makes the bear `BEAR_BOX_FRACTION` of the art box,
 * and the fraction of the canvas height (from the top) where the feet must sit to stand on the stage anchor.
 */
export function introFraming(vw: number, vh: number, canvas: { top: number; height: number }) {
  const { y, box } = stageAnchorPx(vw, vh);
  const feet = Math.min(0.95, Math.max(0.3, (y - canvas.top) / Math.max(1, canvas.height)));
  const height = Math.min(7.5, Math.max(3, (BEAR_UNITS * canvas.height) / (BEAR_BOX_FRACTION * box.h)));
  return { visibleHeight: height, feetFraction: feet };
}
