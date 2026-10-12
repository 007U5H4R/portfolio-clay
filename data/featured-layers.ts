/**
 * The depth layers of the three Featured Work collages (M-012 P2, TASK-181.2; generator and rest-pose proof:
 * `scripts/portfolio-art/featured/`, `tests/unit/featured-layers.test.ts`). Each item is one transparent SVG,
 * `featured-<slug>.svg` for the first (the manifest entry, the only one with alt text) and
 * `featured-<slug>--<name>.svg` for the rest; items stack in this order inside their depth group, groups in
 * back-to-front order. `depth` picks the parallax range (bg 2 · art 4 · fg 6 · top 8 px, `--hx/--hy` × range);
 * `sig` names the hover/focus signature the item belongs to (`[data-sig~=…]` in `app/globals.css`) — an item with
 * `extra` is an overlay that exists only for the signature and rests at opacity 0.
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

const BLEED = 32;

export const featuredLayers: Readonly<Record<string, FeaturedLayers>> = {
  railcite: {
    w: 1450,
    h: 1000,
    bleed: BLEED,
    groups: [
      { depth: "bg", items: [{ name: "back" }] },
      { depth: "art", items: [{ name: "land" }] },
      { depth: "fg", items: [{ name: "train", sig: "train" }, { name: "halo", sig: "train halo", extra: true }] },
      { depth: "top", items: [{ name: "scraps" }] },
    ],
  },
  "slag-city": {
    w: 1240,
    h: 620,
    bleed: BLEED,
    groups: [
      { depth: "bg", items: [{ name: "back" }] },
      {
        depth: "art",
        items: [
          { name: "glow", sig: "glow", extra: true },
          { name: "works" },
          { name: "lit", sig: "lit", extra: true },
          { name: "puff1", sig: "puff puff1", extra: true },
          { name: "puff2", sig: "puff puff2", extra: true },
          { name: "puff3", sig: "puff puff3", extra: true },
        ],
      },
      { depth: "fg", items: [{ name: "front" }, { name: "slaghot", sig: "hot", extra: true }] },
    ],
  },
  "campfire-board": {
    w: 1240,
    h: 640,
    bleed: BLEED,
    groups: [
      { depth: "bg", items: [{ name: "back" }] },
      {
        depth: "art",
        items: [
          { name: "board" },
          { name: "note0", sig: "note note0" },
          { name: "note1", sig: "note note1" },
          { name: "note2", sig: "note note2" },
          { name: "note3", sig: "note note3" },
        ],
      },
      {
        depth: "fg",
        items: [{ name: "camp" }, { name: "firebase" }, { name: "flames", sig: "flames" }, { name: "front" }],
      },
    ],
  },
};

/** The published path of one layer (the first layer of a card is its manifest file). */
export function featuredLayerSrc(slug: string, name: string): string {
  return `/media/illustrations/featured/featured-${slug}${name === "back" ? "" : `--${name}`}.svg`;
}
