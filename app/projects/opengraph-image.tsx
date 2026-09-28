import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Portfolio — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Portfolio",
    // TASK-116: the Portfolio page's own headline + subline (Tushar's spec 2026-09-28 §4).
    title: "Products I’ve built, tested, and shipped.",
    subtitle: "Pick one. Watch the pitch. Open the demo. Explore the build.",
    caption: "choose your build",
  });
}
