import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Certifications — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Certifications",
    title: "Credentials are useful. Applied capability is better.",
    subtitle:
      "Google Cloud, PMI, Scaled Agile, Scrum.org and AWS certifications — each verified on Credly, with where it was applied.",
    caption: "continuous learning, higher impact.",
  });
}
