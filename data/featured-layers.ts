/**
 * The depth layers of the three Featured Work collages (TASK-202: 3D paper-cut art generated with Higgsfield,
 * provenance in `public/media/illustrations/card-art-README.md`; encoder `scripts/card-art/encode.mjs`;
 * `tests/unit/featured-layers.test.ts`). Each card is three transparent rasters, back · mid · front, shipped as
 * AVIF + WebP: `featured-<slug>.*` for the back layer (the manifest entry, the only one with alt text) and
 * `featured-<slug>--mid.*` / `--front.*`. `depth` picks the parallax range (bg 2 · art 4 · fg 6 · top 8 px,
 * `--hx/--hy` × range); `sig` names the hover/focus signature the item belongs to (`[data-sig~=…]` in
 * `app/globals.css`): the layer nudges a few px, never an overlay.
 */
export type FeaturedDepth = "bg" | "art" | "fg" | "top";
export interface FeaturedLayerItem {
  name: string;
  sig?: string;
  /** A signature-only overlay (not part of the rest pose). */
  extra?: boolean;
}
export interface FeaturedLayerGroup {
  depth: FeaturedDepth;
  items: readonly FeaturedLayerItem[];
}
export interface FeaturedLayers {
  /** The collage's own size (the viewBox of the rest pose); layer files add `bleed` either side and below. */
  w: number;
  h: number;
  bleed: number;
  groups: readonly FeaturedLayerGroup[];
}

export const featuredLayers: Readonly<Record<string, FeaturedLayers>> = {
  railcite: {
    w: 1024,
    h: 688,
    bleed: 22,
    groups: [
      { depth: "bg", items: [{ name: "back" }] },
      { depth: "art", items: [{ name: "mid", sig: "train" }] },
      { depth: "fg", items: [{ name: "front", sig: "train" }] },
    ],
  },
  "slag-city": {
    w: 1152,
    h: 576,
    bleed: 24,
    groups: [
      { depth: "bg", items: [{ name: "back" }] },
      { depth: "art", items: [{ name: "mid", sig: "works" }] },
      { depth: "fg", items: [{ name: "front", sig: "slag" }] },
    ],
  },
  "campfire-board": {
    w: 1152,
    h: 576,
    bleed: 24,
    groups: [
      { depth: "bg", items: [{ name: "back" }] },
      { depth: "art", items: [{ name: "mid", sig: "board" }] },
      { depth: "fg", items: [{ name: "front", sig: "camp" }] },
    ],
  },
};

/** The published path (without extension) of one layer; the first layer of a card is its manifest file. */
export function featuredLayerSrc(slug: string, name: string, ext: "webp" | "avif" = "webp"): string {
  return `/media/illustrations/featured/featured-${slug}${name === "back" ? "" : `--${name}`}.${ext}`;
}
