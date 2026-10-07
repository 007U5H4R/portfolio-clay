import { SceneBanner } from "@/components/paper/SceneBanner";
import { OPENER_FOCAL_X, openerNarrow } from "@/components/paper/scene-opener-frames";
import { PaperParallaxScene } from "@/components/paper-world/PaperParallaxScene";
import { LAYERED_SCENES, type LayeredSceneId } from "@/content/media/illustrations/layers";
import { TornEdge, type TornFill } from "@/components/paper/TornEdge";
import type { CSSProperties, ReactNode } from "react";
import type { SceneId } from "@/lib/illustrations";

export type SceneOpenerProps = {
  /** The page's manifest scene (Design.md §11 Dev-24 mapping). */
  id: SceneId;
  /** The route's LCP candidate: preload + `fetchpriority="high"` + eager. */
  priority?: boolean | undefined;
  /** Fill of the section directly below the opener (default `paper` — the page background). */
  tornFill?: TornFill | undefined;
  /** Live text written on a layered scene (≥ 768, registered to the scene box and riding its scroll drift), below it on
   *  narrow screens — the Contact quote (TASK-171). */
  note?: ReactNode | undefined;
};

/**
 * Page scene opener (TKT-95, decision EXE-18, Design.md §11 Dev-24): the page's manifest scene as a
 * full-bleed `SceneBanner` (reused from the home hero, TKT-93 — not forked) with a paper `TornEdge`
 * along its bottom edge, in the home-banner style. It is its own `<section>` (an EVAL-018 unit) holding
 * exactly one counted decoration (`torn`); the page's existing title block renders directly below it.
 * The image is content: the manifest alt, never `aria-hidden` (§6.1). On scroll the banner moves at
 * half speed and the opener clips its bottom at the torn edge, so the page's paper slides over the
 * image (TKT-96 parallax, app/globals.css — CSS scroll-driven, off under reduced motion).
 * TKT-107 (Dev-95): every scene is a 21:9 outpaint sized exactly like the home banner — ≥ 768 the whole
 * scene, < 768 a 4:3 crop on the scene's focal point served from a pre-cropped narrow rendition (home's
 * TKT-92r2 art direction); the focal point per scene lives in `scene-opener-frames.ts`. Server component;
 * not in the `components/paper` barrel for the same reason `SceneBanner` is not (static image import under jsdom).
 */
const isLayered = (id: SceneId): id is SceneId & LayeredSceneId => LAYERED_SCENES.some((s) => s.id === id);

export function SceneOpener({ id, priority = false, tornFill = "paper", note }: SceneOpenerProps) {
  const layered = LAYERED_SCENES.find((s) => s.id === id);
  return (
    <section className="scene-opener" data-opener={id}>
      {isLayered(id) ? (
        // M-011 P2: the opener's frame is the home hero's — the scene's own ratio ≥ 768, a 4:3 cover crop on the focal point
        // below (TKT-107's rule, now carried by the scene root's aspect-ratio).
        <PaperParallaxScene id={id} priority={priority} focal={{ x: OPENER_FOCAL_X[id] }} narrowAspect="4 / 3" />
      ) : (
        <SceneBanner id={id} focalX={OPENER_FOCAL_X[id]} priority={priority} sizes="100vw" narrow={openerNarrow(id)} />
      )}
      {/* TASK-171: the note's box has the scene's own ratio (≥ 768 the scene is uncropped), so the note registers on the art. */}
      {note && layered ? (
        <div className="scene-opener-note" style={{ "--ps-ar": `${layered.width} / ${layered.height}` } as CSSProperties}>
          {note}
        </div>
      ) : null}
      <TornEdge fill={tornFill} className="scene-opener-torn" />
    </section>
  );
}
