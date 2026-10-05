import type { SceneBannerNarrow } from "@/components/paper/SceneBanner";
import type { SceneId } from "@/lib/illustrations";

/**
 * TKT-107 (Tushar 2026-09-26: "make the images of all the tabs same height and width similiar to Home
 * tab"; Design.md §11 Dev-95). Every page scene is now a 3168×1344 (21:9) outpaint, the home banner's
 * ratio, and every opener uses the home banner's box: ≥ 768 the whole scene (height = width × 1344/3168),
 * < 768 a 4:3 crop centred on the scene's focal point (app/globals.css "TKT-107" block). This table is the
 * one place each scene's focal point lives — the narrow rendition's crop is derived from it, so the crop
 * and the box can never disagree.
 */

/** The outpainted scenes' pixel size (= `hero-banner`). */
export const OPENER_SCENE_W = 3168;
export const OPENER_SCENE_H = 1344;
/** < 768 the box is 100vw × 75vw over a canvas 75vw × 3168/1344 wide: it shows this fraction of the scene. */
export const NARROW_VISIBLE_SPAN = (OPENER_SCENE_H * (4 / 3)) / OPENER_SCENE_W; // 1792 / 3168 ≈ 0.5657
/** The narrow rendition is the visible region plus 16 px (≈ 0.5 %) a side — as home's (TKT-92r2). */
const NARROW_MARGIN_PX = 16;

/** Horizontal focal point per scene (0–1 of the scene width): the subject's centre in the 21:9 outpaint. */
export const OPENER_FOCAL_X: Record<SceneId, number> = {
  // TASK-144.5 (M-010 T3): the paper-cut scenes' focal points (PLAN.md mobile-crop column). Every value keeps the 4:3
  // box un-clamped (0.283 ≤ x ≤ 0.717), so each narrow crop is exactly the visible region plus the 16 px margin.
  "scene-work": 0.5, // the two shelves, centred — the blank cream frame at the centre
  "scene-casestudy": 0.5, // Tushar in the armchair + the sleeping dog (watercolour, 144.4 deferred)
  "scene-thinking": 0.5, // the pathway's middle four stations (sticky notes → light bulb → blocks → checked sheet)
  "scene-about": 0.66, // Tushar from behind (≈ 0.70) with the terracotta sun (≈ 0.58) and the snow-capped peaks to his right
  "scene-playground": 0.6, // Tushar holding the prototype (≈ 0.60) under the stage curtains
  "scene-contact": 0.71, // Tushar waving (≈ 0.72) on the notebook page — the right 57 % of the scene
  "scene-experience": 0.68, // the city window (≈ 0.40–0.56), Tushar (≈ 0.58) and the whiteboard (to ≈ 0.98)
  "scene-certifications": 0.5, // the pinboard of eight blank certificates, centred
};

/** The box's left edge on the scene (fraction), as the CSS clamp in `.scene-banner-canvas` computes it. */
export function narrowBoxLeft(focalX: number): number {
  return Math.min(1 - NARROW_VISIBLE_SPAN, Math.max(0, focalX - NARROW_VISIBLE_SPAN / 2));
}

/** Pixel crop of the narrow rendition for a focal point (left, width; full height). */
export function narrowCropPx(focalX: number): { left: number; width: number } {
  const left = Math.max(0, Math.round(narrowBoxLeft(focalX) * OPENER_SCENE_W) - NARROW_MARGIN_PX);
  const right = Math.min(OPENER_SCENE_W, Math.round((narrowBoxLeft(focalX) + NARROW_VISIBLE_SPAN) * OPENER_SCENE_W) + NARROW_MARGIN_PX);
  return { left, width: right - left };
}

/** `SceneBanner`'s `narrow` prop for a scene: its pre-cropped < 768 rendition under `public/`. */
export function openerNarrow(id: SceneId): SceneBannerNarrow {
  const { left, width } = narrowCropPx(OPENER_FOCAL_X[id]);
  return {
    src: `/media/illustrations/${id}-mobile.webp`,
    // The dark twin's crop (T3, TASK-144.5); `scene-casestudy` is the one scene with no dark art (144.4 deferred).
    ...(id === "scene-casestudy" ? {} : { darkSrc: `/media/illustrations/${id}-dark-mobile.webp` }),
    width,
    height: OPENER_SCENE_H,
    left: left / OPENER_SCENE_W,
    span: width / OPENER_SCENE_W,
    // Home's density cap (components/hero/Hero.tsx `BANNER_NARROW`): the same pixels per CSS px as the banner.
    sizes: "54vw",
  };
}
