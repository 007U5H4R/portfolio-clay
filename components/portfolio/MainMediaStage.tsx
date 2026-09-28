"use client";

import { Pin, Sheet, Tape } from "@/components/paper";
import { mediaFor, type MediaMode, type PortfolioProduct } from "@/lib/portfolio";
import { ProductCover } from "./ProductCover";
import { ProductMediaPlayer } from "./ProductMediaPlayer";

export interface MainMediaStageProps {
  product: PortfolioProduct;
  mode: MediaMode;
  /** Which change brought this stage in — drives the enter transition (spec §20). */
  enter: "none" | "product" | "mode";
  id: string;
}

const MODE_LABEL: Record<MediaMode, string> = { pitch: "pitch video", demo: "demo video" };

/**
 * The left media stage (TASK-116, spec §7–§10, §20, §49; TASK-121 rectify spec §5.1–§5.2): the hero
 * of the page, built as one physical stack — a kraft back sheet, a torn cream frame (`::before` /
 * `::after`), the 16:9 screen on top, a tape strip + a push-pin, a small doodle burst and a warm
 * paper shadow. A torn tab on the frame names the mode ("Pitch video" / "Demo video").
 *
 * The showcase renders it with `key={product:mode}`, so every product or Pitch ↔ Demo change is a
 * fresh mount: the old player (if any) unmounts — stopping it — and the new one starts at its poster,
 * from the beginning, never autoplaying (video-embed spec §5, §13).
 *   video    → `ProductMediaPlayer` IS the 16:9 screen: the custom poster (else the product's cover)
 *              + a Play button; the press mounts the one privacy-enhanced iframe; a blocked embed
 *              falls back to the poster + "Video unavailable here." (TASK-122, spec §10–§17).
 *   no video → the cover + a small torn "Pitch video coming" tag — never a dead play button (§22).
 */
export function MainMediaStage({ product, mode, enter, id }: MainMediaStageProps) {
  const media = mediaFor(product, mode);
  const cover = <ProductCover product={product} size="stage" />;

  return (
    <Sheet as="figure" variant="photo" className="pf-stage">
      <Tape side="l" rotate={-6} />
      <Pin tone="rust" className="pf-stage-pin" />
      <span className="pf-stage-label" aria-hidden="true">
        {mode === "pitch" ? "Pitch video" : "Demo video"}
      </span>
      <span className="pf-doodle pf-doodle-burst" aria-hidden="true" />
      {media ? (
        <ProductMediaPlayer id={id} className="pf-stage-screen" data-enter={enter} data-mode={mode} media={media} fallbackPoster={cover} />
      ) : (
        <div id={id} className="pf-stage-screen" data-enter={enter} data-mode={mode}>
          {cover}
          <span className="pf-stage-tag" data-paper="tag">
            {mode === "pitch" ? "Pitch video coming" : "Demo video coming"}
          </span>
        </div>
      )}
      <figcaption className="sr-only">
        {media ? media.title : `${product.name} — ${MODE_LABEL[mode]}`}
        {!media?.poster && product.art ? `. Poster: ${product.art.alt}` : ""}
      </figcaption>
    </Sheet>
  );
}
