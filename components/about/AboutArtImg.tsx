import { ABOUT_ART, type AboutArtId } from "./about-art";

/**
 * One piece of the `/about` art (TASK-136) as a plain `<img>`: a static SVG needs no optimiser, and
 * `width`/`height` reserve its box. Always decorative (`alt=""`) — the HTML beside it carries the words.
 */
export function AboutArtImg({ id, className, eager = false }: { id: AboutArtId; className?: string | undefined; eager?: boolean }) {
  const art = ABOUT_ART[id];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a static hand-authored SVG (no raster pipeline to gain)
    <img
      className={className}
      src={art.src}
      width={art.width}
      height={art.height}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      data-about-art={id}
    />
  );
}
