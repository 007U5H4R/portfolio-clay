import Image from "next/image";
import {
  Award,
  Box,
  Brush,
  ClipboardList,
  Clapperboard,
  Film,
  Flame,
  Flower2,
  Gamepad2,
  Handshake,
  HeartHandshake,
  MessageSquareText,
  Microscope,
  Monitor,
  Music,
  PenLine,
  Search,
  ShieldCheck,
  Shirt,
  SquareKanban,
  TrainFront,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import type { PortfolioProduct } from "@/lib/portfolio";

/**
 * The cover glyphs, keyed by lucide name — `project.icon` (TASK-116) and the TASK-121 `coverGlyph`
 * of each portfolio entry. A static map (not a dynamic lucide lookup) keeps the client bundle to these
 * icons; an unknown name falls back to `Box` rather than rendering nothing.
 */
const GLYPHS: Readonly<Record<string, LucideIcon>> = {
  MessageSquareText,
  ShieldCheck,
  Handshake,
  Users,
  ClipboardList,
  Music,
  Search,
  Award,
  PenLine,
  Gamepad2,
  Film,
  TrainFront,
  Shirt,
  Monitor,
  Flower2,
  HeartHandshake,
  Microscope,
  Brush,
  Clapperboard,
  SquareKanban,
  Flame,
};

export function glyphFor(name: string): LucideIcon {
  return GLYPHS[name] ?? Box;
}

export interface ProductCoverProps {
  product: PortfolioProduct;
  /** `thumb` = the carousel card (4:5); `stage` = the media stage's poster (16:9). */
  size: "thumb" | "stage";
}

/**
 * The collectible 90s cover (TASK-121 rectify spec §5.2, §7; TASK-127 fidelity spec §10–§12). One
 * shared packaging grammar — printed ivory keyline, a fine halftone, a code chip, title lettering over
 * the art's calm top band, a cream cover-line plate with the product's emblem — and a distinct world
 * per product: its hand-authored, text-free SVG scene (`product.art`, the illustration manifest;
 * sources in scripts/portfolio-art/scenes/). The SAME image is the carousel cover (5:6 crop, framed on
 * the subject) and the stage poster (the full 16:9 frame).
 * Title lettering is always HTML (crisp, accessible, never baked into the art). The whole cover is
 * presentational — its text repeats what the tab / info sheet already expose — so it is `aria-hidden`;
 * the stage figure names the art through its own caption. The plate's cover line is a packaging
 * micro-label (12.5 px; the same line is real content on the stage poster and the info sheet).
 */
export function ProductCover({ product, size }: ProductCoverProps) {
  const Glyph = glyphFor(product.coverGlyph);
  return (
    <span
      className="pf-cover"
      data-size={size}
      data-accent={product.accent}
      data-lettering={product.lettering}
      data-product={product.id}
      aria-hidden="true"
    >
      <span className="pf-cover-art">
        <Image
          src={product.art.src}
          alt=""
          fill
          sizes={size === "stage" ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 200px, 45vw"}
          unoptimized={product.art.src.endsWith(".svg")}
          className="pf-cover-img"
        />
      </span>
      <span className="pf-cover-code" data-micro-label="">{product.code}</span>
      <span className="pf-cover-title">
        <span className="pf-cover-name">{product.name}</span>
        {size === "stage" ? <span className="pf-cover-sub">{product.tagline}</span> : null}
      </span>
      {size === "thumb" ? (
        <span className="pf-cover-plate">
          <span className="pf-cover-line" data-micro-label="">
            {product.tagline}
          </span>
          {createElement(Glyph, { className: "pf-cover-emblem", strokeWidth: 1.75, "aria-hidden": true, focusable: false })}
        </span>
      ) : null}
    </span>
  );
}
