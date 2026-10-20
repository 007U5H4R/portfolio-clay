import type { NextProjectArt, NextProjectTone } from "./NextProject";
import { CAMPFIRE_NEXT_ART } from "./pratyasa/copy";
import { SLAG_NEXT_ART } from "./campfire/copy";
import { SHRAVAN_NEXT_ART } from "./slag-city/copy";
import { URJA_NEXT_ART } from "./shravans-round/copy";
import { TEACHSPARK_NEXT_ART } from "./urja/copy";

/** TASK-275 (Tushar 2026-10-19): the Bhakti Vilas band artwork. */
const BHAKTI_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/nuptis/bhakti-next-light.webp",
  dark: "/media/case-studies/nuptis/bhakti-next-dark.webp",
  alt: "A paper-craft miniature of an elderly devotee playing a harmonium beside a golden retriever, with a diya and a small heart-pulse care card joined by a paper ribbon: devotion-led wellness and care.",
  width: 1600,
  height: 1062,
};

/** The Pratyasa band artwork: the paper biosensor miniature (a transparent cut-out; `x0` trims its empty left half). */
const PRATYASA_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/bhakti-vilas/art/footer-light.webp",
  dark: "/media/case-studies/bhakti-vilas/art/footer-dark.webp",
  alt: "A paper-craft miniature of a portable biosensor beside a phone showing a rising chart.",
  width: 2400,
  height: 1018,
  x0: 0.5,
};

/** The Nuptis band artwork: the Velora page's wedding-vendor paper scene (a tight transparent cut-out, no trim needed). */
const NUPTIS_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/velora/art/footer-light.webp",
  dark: "/media/case-studies/velora/art/footer-dark.webp",
  alt: "A paper-craft wedding scene: a floral arch over an aisle with chairs, seating charts, a clipboard checklist and a place setting.",
  width: 2600,
  height: 1666,
};

/**
 * TASK-290 (Tushar 2026-10-20): ONE band per product, whichever case study it follows. The NextProject band reads the NEXT product's
 * artwork (and the light-mode tone it was painted for) from here, so Campfire Board's band, say, looks the same on Cubicle, Dino
 * Arcade, Cinematic and Pratyasa. A product with no entry gets a band without art (none today: see the spec).
 */
export const NEXT_BAND_ART: Record<string, { art: NextProjectArt; tone?: NextProjectTone }> = {
  "bhakti-vilas": { art: BHAKTI_NEXT_ART, tone: "cream" },
  "campfire-board": { art: CAMPFIRE_NEXT_ART, tone: "cream" },
  "slag-city": { art: SLAG_NEXT_ART },
  "shravans-round": { art: SHRAVAN_NEXT_ART },
  urja: { art: URJA_NEXT_ART, tone: "cream" },
  teachspark: { art: TEACHSPARK_NEXT_ART, tone: "cream" },
  pratyasa: { art: PRATYASA_NEXT_ART, tone: "cream" },
  nuptis: { art: NUPTIS_NEXT_ART, tone: "cream" },
};
