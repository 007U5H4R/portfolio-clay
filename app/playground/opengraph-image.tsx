import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Product Playground — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Product Playground",
    title: "Small experiments. Big questions.",
    subtitle: "Four shipped experiments — Pratyasa, Tegaki, Dino Arcade and Cinematic Portfolio.",
    // "butter" (not the lavender every other page's OG uses) — Design.md §3: this is the one page
    // where the 70/20/10 professional/playful/experimental ratio tips toward playful, and butter
    // is the first of the 4 tile tones the grid itself carries.
    tone: "butter",
  });
}
