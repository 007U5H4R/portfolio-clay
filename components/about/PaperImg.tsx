import { PAPER_ART, THEMED_ART, type PaperArtId, type ThemedArtId } from "./about-paper-art";

/**
 * One piece of the `/about` body art (TASK-196) as a plain lazy `<img>`: `width`/`height` reserve the box,
 * `alt=""` because the HTML beside it carries the words. A WebP raster needs no optimiser round trip.
 */
export function PaperImg({ id, className }: { id: PaperArtId; className?: string | undefined }) {
  const art = PAPER_ART[id];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP art
    <img className={className} src={art.src} width={art.width} height={art.height} alt="" loading="lazy" decoding="async" data-paper-art={id} />
  );
}

/**
 * A light/dark pair. Both `<img>`s are in the markup; CSS hides the one that does not match
 * `html[data-theme]`, and a hidden lazy image never downloads, so each visitor fetches one.
 */
export function ThemedPaperImg({ id, className }: { id: ThemedArtId; className?: string | undefined }) {
  const [light, dark] = THEMED_ART[id];
  return (
    <>
      <PaperImg id={light} className={["pa-light", className].filter(Boolean).join(" ")} />
      <PaperImg id={dark} className={["pa-dark", className].filter(Boolean).join(" ")} />
    </>
  );
}
