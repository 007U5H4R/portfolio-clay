import { OG_SIZE, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Digital business card — Tushar Pathak";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Business card",
    title: "Keep me in your pocket.",
    subtitle: "A paper-cut digital business card — flip it for the QR code, a contact file and the links.",
    caption: "Cut from paper, kept on your phone.",
  });
}
