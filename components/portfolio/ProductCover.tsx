import {
  Award,
  Box,
  ClipboardList,
  Film,
  Gamepad2,
  Handshake,
  MessageSquareText,
  Music,
  PenLine,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createElement } from "react";
import type { PortfolioProduct } from "@/lib/portfolio";

/**
 * The cover glyphs, keyed by the lucide name each project already records in `project.icon`. A
 * static map (not a dynamic lucide lookup) keeps the client bundle to these twelve icons; an unknown
 * name falls back to `Box` rather than rendering nothing.
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
};

export function glyphFor(name: string): LucideIcon {
  return GLYPHS[name] ?? Box;
}

export interface ProductCoverProps {
  product: PortfolioProduct;
  /** `thumb` = the carousel card; `stage` = the media stage's poster (spec §8, no video yet). */
  size: "thumb" | "stage";
}

/**
 * The 90s game-box cover (TASK-116, spec §14–§15, §19). Drawn deterministically in HTML/CSS/SVG —
 * no raster art, no text baked into an image, no real game's artwork or branding:
 *   top band   product code + edition ("TS-01 · No. 03") on a solid chip (micro-label),
 *   logo       the product name set as a bold wordmark (no product logo files exist in the repo),
 *   hero       the product's lucide glyph inside a sunburst + a halftone dot field (CSS),
 *   foot       the short cover line,
 *   chrome     faux packaging: a spine stripe, a corner seal and a print-registration notch (CSS).
 * The whole cover is presentational: its text repeats the product name and tagline the tab / info
 * panel already expose, so it is `aria-hidden` and the host supplies the accessible name.
 */
export function ProductCover({ product, size }: ProductCoverProps) {
  return (
    <span className="pf-cover" data-size={size} data-accent={product.accent} aria-hidden="true">
      <span className="pf-cover-top">
        <span className="pf-cover-code" data-micro-label="">
          {product.code}
        </span>
        <span className="pf-cover-no" data-micro-label="">
          No. {String(product.position).padStart(2, "0")}
        </span>
      </span>
      <span className="pf-cover-hero">
        <span className="pf-cover-burst" />
        {createElement(glyphFor(product.glyph), {
          className: "pf-cover-glyph",
          strokeWidth: 1.6,
          "aria-hidden": true,
          focusable: false,
        })}
      </span>
      <span className="pf-cover-name">{product.name}</span>
      <span className="pf-cover-line">{product.tagline}</span>
    </span>
  );
}
