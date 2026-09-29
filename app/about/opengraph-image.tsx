import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "About — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "About",
    title: "A builder who connects deep tech to real-world impact.",
    subtitle:
      "From research labs to production systems — turning complex problems into products people actually use.",
    caption: "Different chapters. Same curiosity.",
  });
}
