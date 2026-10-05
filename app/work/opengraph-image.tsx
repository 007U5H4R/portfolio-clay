import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Experience — Tushar Pathak";

/**
 * `/work` link preview (TKT-101): the route is now the Experience page (the project index and its
 * "Selected Work" card moved to `/projects`). Copy = the page's own title + aside + the data's
 * organisation names — nothing authored for the card alone.
 */
export default async function Image() {
  return renderOgCard({
    eyebrow: "Experience",
    title: "Different problems. Same curiosity. Bigger impact.",
    subtitle:
      "American Express (via IntraEdge) · Shellkode · Quantiphi Analytics · Godrej Infotech — and NIT Calicut, Bhilai Institute of Technology.",
    caption: "work experience + education",
  });
}
