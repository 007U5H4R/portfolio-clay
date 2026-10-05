import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Product Thinking — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Product Thinking",
    title: "Thinking",
    subtitle: "An honest editorial list — five DRAFT essays, each backed by a real quoted passage.",
    caption: "notes first. essays later.",
  });
}
