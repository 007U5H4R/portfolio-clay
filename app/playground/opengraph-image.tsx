import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Product Playground — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Product Playground",
    title: "Small experiments. Big questions.",
    subtitle: "Four shipped experiments — Pratyasa, Tegaki, Dino Arcade and Cinematic Portfolio.",
    caption: "the bench, most evenings",
  });
}
