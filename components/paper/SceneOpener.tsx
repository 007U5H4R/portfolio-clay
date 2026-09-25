import { SceneBanner } from "@/components/paper/SceneBanner";
import { TornEdge, type TornFill } from "@/components/paper/TornEdge";
import type { SceneId } from "@/lib/illustrations";

export type SceneOpenerProps = {
  /** The page's manifest scene (Design.md §11 Dev-24 mapping). */
  id: SceneId;
  /** Horizontal focal point (0–1) — only matters when the box is narrower than the scene's ratio. */
  focalX: number;
  /** Vertical focal point (0–1) — the wide opener box crops the scene top/bottom; this keeps the face in. */
  focalY: number;
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
 * The image is content: the manifest alt, never `aria-hidden` (§6.1). Server component; not in the
 * `components/paper` barrel for the same reason `SceneBanner` is not (static image import under jsdom).
 */
export function SceneOpener({ id, focalX, focalY, priority = false, tornFill = "paper" }: SceneOpenerProps) {
  return (
    <section className="scene-opener" data-opener={id}>
      <SceneBanner id={id} focalX={focalX} focalY={focalY} priority={priority} sizes="100vw" />
      <TornEdge fill={tornFill} className="scene-opener-torn" />
    </section>
  );
}
