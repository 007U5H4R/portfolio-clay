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
 * The collectible 90s game-box cover (TASK-121, Tushar's rectify spec 2026-09-28 §5.2, §7). One shared
 * packaging system — printed ivory border, halftone, a code tag, title lettering over the art, a
 * cover-line plate with a small emblem — and a distinct identity per product:
 *   art    a painted, text-free cover image (`product.art`, the illustration manifest) — the SAME
 *          image is the carousel cover (4:5 crop) and the enlarged stage poster (16:9 crop);
 *   scene  otherwise a designed CSS scene (`data-scene`: rails, sunset, grid, bunting, rays, hills,
 *          lab, waves, pixels, beam, campfire) with the product's own hero glyph, palette and lettering
 *          (`data-lettering`) — no raster, no real game's artwork or branding.
 * Title lettering is always HTML (editable, no AI-garbled text). The whole cover is presentational —
 * its text repeats what the tab / info sheet already expose — so it is `aria-hidden`; the stage
 * figure names the art through its own caption.
 */
export function ProductCover({ product, size }: ProductCoverProps) {
  const Glyph = glyphFor(product.coverGlyph);
  return (
    <span
      className="pf-cover"
      data-size={size}
      data-accent={product.accent}
      data-scene={product.art ? "art" : product.scene}
      data-lettering={product.lettering}
      data-product={size === "stage" ? product.id : undefined}
      aria-hidden="true"
    >
      <span className="pf-cover-art">
        {product.art ? (
          <Image
            src={product.art.src}
            alt=""
            fill
            sizes={size === "stage" ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 200px, 45vw"}
            className="pf-cover-img"
          />
        ) : (
          <span className="pf-cover-scene">
            <span className="pf-scene-sun" />
            <span className="pf-scene-ground" />
            {createElement(Glyph, { className: "pf-scene-hero", strokeWidth: 1.4, "aria-hidden": true, focusable: false })}
          </span>
        )}
      </span>
      <span className="pf-cover-code">{product.code}</span>
      <span className="pf-cover-title">
        <span className="pf-cover-name">{product.name}</span>
        {size === "stage" ? <span className="pf-cover-sub">{product.tagline}</span> : null}
      </span>
      {size === "thumb" ? (
        <span className="pf-cover-plate">
          <span className="pf-cover-line">{product.tagline}</span>
          {createElement(Glyph, { className: "pf-cover-emblem", strokeWidth: 1.75, "aria-hidden": true, focusable: false })}
        </span>
      ) : null}
    </span>
  );
}
