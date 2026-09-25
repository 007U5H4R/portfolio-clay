import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Contact — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Contact",
    title: "Still curious?",
    subtitle: "Email, LinkedIn, or a resume — the fastest ways to reach Tushar Pathak.",
    caption: "waving from the window seat",
  });
}
