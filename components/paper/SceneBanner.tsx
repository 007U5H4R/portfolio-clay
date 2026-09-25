import Image, { getImageProps } from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { preload } from "react-dom";
import { illustration, sceneImage, type StaticIllustrationId } from "@/lib/illustrations";

export type SceneBannerProps = {
  /** A manifest id that ships as a static import (`sceneImage`): the six scenes or `hero-banner`. */
  id: StaticIllustrationId;
  /** LCP image: preload + `fetchpriority="high"` + eager (the first banner on a page). */
  priority?: boolean | undefined;
  /**
   * Horizontal focal point of the scene as a fraction of its width (0–1, default 0.5). When the box
   * is taller than the scene's aspect ratio the canvas overflows sideways and is positioned so the
   * focal point sits at the box's centre — clamped so the canvas always covers the box.
   */
  focalX?: number | undefined;
  /**
   * Vertical focal point (0–1, TKT-95). Omitted → the canvas is centred vertically (the home hero's
   * behaviour, unchanged). Given → the box becomes an inline-size container and the canvas is placed so
   * this point sits at the box's centre, clamped so the canvas always covers the box (the page openers
   * are wider than their scenes, so they crop top/bottom and need the face kept in).
   */
  focalY?: number | undefined;
  /** `next/image` `sizes` (default `100vw` — the banner is full-bleed). */
  sizes?: string | undefined;
  /**
   * Narrow-screen art direction (TKT-92r2): a pre-cropped rendition of the part of the scene the < 768
   * box actually shows, served through `<picture><source media="(max-width: 767px)">`. The `<img>` is
   * then placed on the canvas at the crop's own position (`left`/`span`, fractions of the scene width;
   * full height), so it stays on the canvas pixel grid and any registered child is unaffected.
   */
  narrow?: SceneBannerNarrow | undefined;
  className?: string | undefined;
  /**
   * Overlays registered to the scene's pixel grid — rendered inside the canvas, after the image, so
   * a child positioned in percentages of the canvas stays registered under any crop (the hero clip).
   */
  children?: ReactNode | undefined;
};

/**
 * Full-bleed illustrated banner (TKT-93, Design.md §11 Dev-21 / Dev-24; reused by TKT-95 as every
 * page's scene opener). One outer box (`.scene-banner`, `overflow: hidden`, height by breakpoint)
 * crops one inner canvas (`.scene-banner-canvas`, the scene's own aspect ratio, sized to cover the box
 * and centred on `focalX`) that holds the `<img>` and any registered children. The img and the
 * children are never `object-fit`ted separately — cropping the *canvas* is what keeps an overlay
 * registered (app/globals.css, the "TKT-93 · hero banner" block). Server component; alt from the manifest
 * (Design.md §6.1). Not in the `components/paper` barrel: the barrel's unit fixture renders every
 * export under jsdom, where a static image import is a bare URL `next/image` rejects — import it from
 * this module directly. The torn bottom edge is the page's `TornEdge`, placed by the caller.
 */
export type SceneBannerNarrow = {
  /** Served path of the crop (under `public/`, optimised by next/image). */
  src: string;
  width: number;
  height: number;
  /** Crop's left edge and width as fractions of the full scene's width. */
  left: number;
  span: number;
  /** `sizes` for the crop's `<source>`. */
  sizes: string;
};

/** The breakpoint the banner box switches to its narrow 4:3 crop at (app/globals.css `.scene-banner`). */
const NARROW_MEDIA = "(max-width: 767px)";
const WIDE_MEDIA = "(min-width: 768px)";

const unit = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.5);

export function SceneBanner({ id, priority = false, focalX = 0.5, focalY, sizes = "100vw", narrow, className, children }: SceneBannerProps) {
  const entry = illustration(id);
  const style = {
    "--focal": String(unit(focalX)),
    "--scene-ar": `${entry.width} / ${entry.height}`,
    ...(focalY === undefined ? {} : { "--focal-y": String(unit(focalY)) }),
    ...(narrow === undefined ? {} : { "--narrow-left": String(unit(narrow.left)), "--narrow-span": String(unit(narrow.span)) }),
  } as CSSProperties;
  const classes = ["scene-banner", focalY === undefined ? null : "scene-banner--focal-y", className];
  return (
    <figure data-illustration={id} className={classes.filter(Boolean).join(" ")} style={style}>
      <div className="scene-banner-canvas">
        {narrow === undefined ? (
          <Image
            src={sceneImage(id)}
            alt={entry.alt}
            sizes={sizes}
            preload={priority}
            // Next 16 does not derive fetchpriority from preload; the first banner is the LCP image.
            fetchPriority={priority ? "high" : undefined}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="scene-banner-img"
          />
        ) : (
          <ArtDirectedImage id={id} alt={entry.alt} sizes={sizes} narrow={narrow} priority={priority} />
        )}
        {children}
      </div>
    </figure>
  );
}

/**
 * The banner `<img>` with a narrow-screen `<source>` (TKT-92r2). `getImageProps` builds both srcsets
 * (next/image's documented art-direction path); the `<img>` keeps the full scene's src/srcset/size
 * attributes, so ≥ 768 is byte-identical to the plain `Image` branch. `getImageProps` emits no preload,
 * so a priority banner preloads each rendition itself, split by `media` — a phone never fetches the
 * wide scene and a desktop never fetches the crop.
 */
function ArtDirectedImage({ id, alt, sizes, narrow, priority }: { id: StaticIllustrationId; alt: string; sizes: string; narrow: SceneBannerNarrow; priority: boolean }) {
  const common = { alt, loading: priority ? ("eager" as const) : ("lazy" as const), decoding: "async" as const };
  const { props: wide } = getImageProps({ ...common, src: sceneImage(id), sizes });
  const {
    props: { srcSet: narrowSrcSet, src: narrowSrc },
  } = getImageProps({ ...common, src: narrow.src, width: narrow.width, height: narrow.height, sizes: narrow.sizes });
  if (priority) {
    preload(narrowSrc, { as: "image", imageSrcSet: narrowSrcSet, imageSizes: narrow.sizes, fetchPriority: "high", media: NARROW_MEDIA });
    preload(wide.src, { as: "image", imageSrcSet: wide.srcSet, imageSizes: sizes, fetchPriority: "high", media: WIDE_MEDIA });
  }
  return (
    <picture>
      <source media={NARROW_MEDIA} srcSet={narrowSrcSet} sizes={narrow.sizes} width={narrow.width} height={narrow.height} />
      <img {...wide} alt={alt} fetchPriority={priority ? "high" : undefined} className="scene-banner-img scene-banner-img--narrow-crop" />
    </picture>
  );
}
