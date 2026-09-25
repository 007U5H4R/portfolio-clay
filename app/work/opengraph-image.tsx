import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Selected Work — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Selected Work",
    // SITEMAP.md §/work WorkHero copy — reused verbatim ahead of TKT-16's real WorkHero component.
    title: "Real problems. Thoughtful bets. Products that ship.",
    subtitle: "Personal AI builds and professional platform work — filterable by AI, Enterprise, Cloud and Experiments.",
    caption: "the pinboard",
  });
}
