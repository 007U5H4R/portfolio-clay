import { OG_SIZE, renderOgCard } from "@/lib/og";
import { hero } from "@/data/hero";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${site.name} — ${site.title}`;

export default async function Image() {
  return renderOgCard({
    eyebrow: site.tagline,
    title: `${hero.headline.before}${hero.headline.highlight}${hero.headline.after}`,
    subtitle: site.title,
    tone: "lavender",
    avatar: true,
  });
}
