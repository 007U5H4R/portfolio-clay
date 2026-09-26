/**
 * Organisation logos for the `/work` Experience timeline (TKT-101). Tushar's call (2026-09-26): use
 * the real company / institution marks — an EVAL-021 exception recorded in Design.md §11 Dev-92. Every
 * file under `public/media/logos/` is the official artwork fetched from Wikimedia (source URL, licence
 * and trademark note per file in `content/media/logos/README.md`), svgo-optimised, never redrawn.
 *
 * An organisation with no official file on Wikimedia Commons (Shellkode, Quantiphi, Bhilai Institute
 * of Technology) has no entry here: the timeline sets its name in type on the taped label instead —
 * a logo is never invented. `width`/`height` are the SVG viewBox, so the `<img>` reserves its box (no CLS).
 */
export interface OrgLogo {
  src: string;
  /** The organisation's name — the logo is content (it identifies the card), so it gets real alt text. */
  alt: string;
  width: number;
  height: number;
}

export const ORG_LOGOS: Record<string, OrgLogo> = {
  amex: { src: "/media/logos/american-express.svg", alt: "American Express", width: 1000, height: 998 },
  godrej: { src: "/media/logos/godrej.svg", alt: "Godrej", width: 398, height: 192 },
  "mtech-nitc": { src: "/media/logos/nit-calicut.svg", alt: "National Institute of Technology Calicut", width: 275, height: 335 },
};

/** Cloud-platform marks used inside the (aria-hidden) collage doodles — decorative there, so `alt=""`. */
export const PLATFORM_MARKS = {
  aws: { src: "/media/logos/aws.svg", width: 304, height: 182 },
  googleCloud: { src: "/media/logos/google-cloud.svg", width: 181, height: 28 },
} as const;

/**
 * The generated, unbranded building / campus vignette behind each logo card (Tushar approved the
 * Higgsfield spend 2026-09-26; job ids + crop/encode record in content/media/illustrations/README.md
 * "TKT-101"). No text or logo in the art. Decorative — rendered inside the aria-hidden collage with
 * `alt=""`, lazy, 480 px wide (≈ 2× its display width). Keyed by entry id.
 */
export const ENTRY_ART: Record<string, { src: string; width: number; height: number }> = {
  amex: { src: "/media/illustrations/office-amex.webp", width: 480, height: 384 },
  shellkode: { src: "/media/illustrations/office-shellkode.webp", width: 480, height: 357 },
  quantiphi: { src: "/media/illustrations/office-quantiphi.webp", width: 480, height: 361 },
  godrej: { src: "/media/illustrations/office-godrej.webp", width: 480, height: 346 },
  "mtech-nitc": { src: "/media/illustrations/campus-nitc.webp", width: 480, height: 352 },
  "be-bitd": { src: "/media/illustrations/campus-bit.webp", width: 480, height: 353 },
};
