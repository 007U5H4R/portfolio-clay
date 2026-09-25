import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "About — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "About",
    title: "Senior Product Manager. Product Thinker · AI Builder · Problem Solver.",
    subtitle:
      "The career arc from enterprise programs to AI-native products — the experience, capabilities, and proof behind it.",
    caption: "coffee first. then the roadmap.",
  });
}
