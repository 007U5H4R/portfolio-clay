import type { ReactNode } from "react";
import { illustration, type IllustrationId } from "@/lib/illustrations";
import { hostFasteners } from "./fastener";
import { IllustrationImg } from "./IllustrationImg";
import { ROTATION_CAP, rotationStyle } from "./rotation";

/**
 * `photo` = taped/pinned photograph on an ivory frame; `bleed` = scene behind the copy (Design.md
 * §6.4). The hero frame is composed by `Hero` itself (TSK-37, §5.2), not by this component.
 */
export type IllustrationPlacement = "photo" | "bleed";

/** No `alt` prop: the alt always comes from the manifest (Design.md §6.1). */
export type IllustrationProps = {
  id: IllustrationId;
  placement: IllustrationPlacement;
  /** `next/image` `sizes` for this placement. */
  sizes: string;
  /** LCP image: preload + `fetchpriority="high"` + eager (only above-the-fold placements). */
  priority?: boolean | undefined;
  /** Photo only: degrees, clamped to ±2.4 (Design.md §3.1). */
  rotate?: number | undefined;
  /** Photo only: rendered after the image (the Caveat caption `Annotation`). */
  caption?: ReactNode | undefined;
  className?: string | undefined;
  /** Photo only: up to two fasteners (`<Tape/>`, `<Pin/>`) as direct children. */
  children?: ReactNode;
};

/**
 * A manifest illustration (Design.md §3.1 `Illustration` row, §6; S70.06). Throws on an unknown id.
 * Renders exactly **one** `<img>` (`IllustrationImg`) whose alt is `illustration(id).alt` byte for
 * byte — the bleed is restyled per breakpoint in CSS, never duplicated (Dev-06).
 *   - `photo` → `<figure data-illustration data-paper="photo">` — content paper, fasteners counted.
 *   - `bleed` → `<figure data-illustration class="illustration-bleed">` — masked scene behind copy.
 */
export function Illustration({ id, placement, sizes, priority, rotate, caption, className, children }: IllustrationProps) {
  const entry = illustration(id);
  const img = (
    <IllustrationImg
      src={entry.publicSrc}
      alt={entry.alt}
      width={entry.width}
      height={entry.height}
      sizes={sizes}
      priority={priority}
      className="illustration-img"
    />
  );

  if (placement === "bleed") {
    return (
      <figure data-illustration={id} className={["illustration-bleed", className].filter(Boolean).join(" ")}>
        {img}
      </figure>
    );
  }

  return (
    <figure
      data-illustration={id}
      data-paper="photo"
      className={["paper-sheet", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, 0, ROTATION_CAP.photo)}
    >
      {hostFasteners(children, "Illustration")}
      {img}
      {caption}
    </figure>
  );
}
