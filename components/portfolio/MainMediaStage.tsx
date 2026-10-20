"use client";

import { Sheet } from "@/components/paper";
import { mediaFor, type MediaMode, type PortfolioProduct } from "@/lib/portfolio";
import { ProductCover } from "./ProductCover";
import { ProductMediaPlayer } from "./ProductMediaPlayer";
import "./paper-player.css";

export interface MainMediaStageProps {
  product: PortfolioProduct;
  mode: MediaMode;
  /** Which change brought this stage in — drives the enter transition (spec §20). */
  enter: "none" | "product" | "mode";
  id: string;
  /** TASK-210: start the player on mount (the viewer pressed "Watch demo / pitch"). */
  autoStart?: boolean;
  /** TASK-253: the start came from choosing the product (muted on touch devices, see the player). */
  autoMute?: boolean;
  /** TASK-304: render the origami paper player (desktop vertical-carousel stage only; the host decides). */
  paper?: boolean;
}

const MODE_LABEL: Record<MediaMode, string> = { pitch: "pitch video", demo: "demo video" };

/**
 * The left media stage (TASK-116, spec §7–§10, §20, §49; TASK-121 rectify spec §5.1–§5.2; TASK-127
 * fidelity spec §3, §16–§18): the strongest object on the page, built as one physical stack, back to
 * front — a kraft backing sheet and a dark torn under-layer (`.pf-stage-backing`), a fibrous cream mat
 * with its lighter rim (`.pf-stage-mat`), then the 16:9 poster/video surface. One push-pin, one strip
 * of kraft tape across the mat's corner that names the mode ("Pitch video" / "Demo video"), a small
 * doodle burst; every paper layer is torn by a baked mask and the stack casts one warm shadow.
 *
 * The showcase renders it with `key={product:mode}`, so every product or Pitch ↔ Demo change is a
 * fresh mount: the old player (if any) unmounts — stopping it — and the new one starts at its poster,
 * from the beginning (video-embed spec §5, §13). TASK-253 (Tushar 2026-10-18): choosing a product is the viewer's
 * request to watch it, so the showcase passes `autoStart` and the pitch (else demo) plays at once; a page load or deep
 * link still lands on the poster.
 *   video    → `ProductMediaPlayer` IS the 16:9 screen: the custom poster (else the product's cover)
 *              + a Play button; the press mounts the one privacy-enhanced iframe; a blocked embed
 *              falls back to the poster + "Video unavailable here." (TASK-122, spec §10–§17).
 *   no video → the cover + a small torn "Pitch video coming" tag — never a dead play button (§22).
 */
export function MainMediaStage({ product, mode, enter, id, autoStart = false, autoMute = false, paper = false }: MainMediaStageProps) {
  const media = mediaFor(product, mode);
  const cover = <ProductCover product={product} size="stage" />;

  return (
    <Sheet as="figure" variant="photo" className={paper ? "pf-stage pf-paper" : "pf-stage"}>
      <span className="pf-stage-backing" aria-hidden="true" />
      <span className="pf-stage-mat" aria-hidden="true" />
      <span className="pf-stage-label" data-micro-label="" aria-hidden="true">
        {mode === "pitch" ? "Pitch video" : "Demo video"}
      </span>
      {media ? (
        <ProductMediaPlayer id={id} className="pf-stage-screen" data-enter={enter} data-mode={mode} media={media} fallbackPoster={cover} analytics={{ projectId: product.id, videoType: mode }} autoStart={autoStart} autoMute={autoMute} paper={paper ? { name: product.name, logo: product.logo } : undefined} />
      ) : (
        <div id={id} className="pf-stage-screen" data-enter={enter} data-mode={mode}>
          {cover}
          {/* TASK-210: the phone's honest no-video note (the torn "coming" tag below is a desktop-only flourish) */}
          <span className="pf-m-novideo">{product.pitchVideo || product.demoVideo ? `No ${MODE_LABEL[mode]} yet` : "No video for this project yet"}</span>
          <span className="pf-stage-tag" data-paper="tag">
            {mode === "pitch" ? "Pitch video coming" : "Demo video coming"}
          </span>
        </div>
      )}
      <figcaption className="sr-only">
        {media ? media.title : `${product.name} — ${MODE_LABEL[mode]}`}
        {!media?.poster ? `. Poster: ${product.art.alt}` : ""}
      </figcaption>
    </Sheet>
  );
}
