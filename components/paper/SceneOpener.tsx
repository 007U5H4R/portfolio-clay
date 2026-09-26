import { SceneBanner } from "@/components/paper/SceneBanner";
import { OPENER_FOCAL_X, openerNarrow } from "@/components/paper/scene-opener-frames";
import { TornEdge, type TornFill } from "@/components/paper/TornEdge";
import type { SceneId } from "@/lib/illustrations";

export type SceneOpenerProps = {
  /** The page's manifest scene (Design.md §11 Dev-24 mapping). */
  id: SceneId;
  /** The route's LCP candidate: preload + `fetchpriority="high"` + eager. */
  priority?: boolean | undefined;
  /** Fill of the section directly below the opener (default `paper` — the page background). */
  tornFill?: TornFill | undefined;
};

/**
 * Page scene opener (TKT-95, decision EXE-18, Design.md §11 Dev-24): the page's manifest scene as a
 * full-bleed `SceneBanner` (reused from the home hero, TKT-93 — not forked) with a paper `TornEdge`
 * along its bottom edge, in the home-banner style. It is its own `<section>` (an EVAL-018 unit) holding
 * exactly one counted decoration (`torn`); the page's existing title block renders directly below it.
 * The image is content: the manifest alt, never `aria-hidden` (§6.1). On scroll the banner moves at
 * half speed and the opener clips its bottom at the torn edge, so the page's paper slides over the
 * image (TKT-96 parallax, app/globals.css — CSS scroll-driven, off under reduced motion).
 * TKT-107 (Dev-48): every scene is a 21:9 outpaint sized exactly like the home banner — ≥ 768 the whole
 * scene, < 768 a 4:3 crop on the scene's focal point served from a pre-cropped narrow rendition (home's
 * TKT-92r2 art direction); the focal point per scene lives in `scene-opener-frames.ts`. Server component;
 * not in the `components/paper` barrel for the same reason `SceneBanner` is not (static image import under jsdom).
 */
export function SceneOpener({ id, priority = false, tornFill = "paper" }: SceneOpenerProps) {
  return (
    <section className="scene-opener" data-opener={id}>
      <SceneBanner id={id} focalX={OPENER_FOCAL_X[id]} priority={priority} sizes="100vw" narrow={openerNarrow(id)} />
      <TornEdge fill={tornFill} className="scene-opener-torn" />
    </section>
  );
}
