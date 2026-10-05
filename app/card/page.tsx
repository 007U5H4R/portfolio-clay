import type { Metadata } from "next";
import { CardScene } from "@/components/card/CardScene";
import { cardUrl } from "@/lib/card/vcard";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Digital business card · ${site.name}`,
  description: "A paper-cut digital business card for Tushar Pathak. Flip it for the QR code, a contact file and the links worth keeping.",
  path: "/card",
  ogFamily: "Business card",
});

/**
 * `/card` (TASK-146, S27): the paper-cut digital business card. Static (TP1). The QR on the back
 * encodes `${siteUrl()}/card`; "Save contact" is the `/card/vcard` route. No Apple Wallet (S27).
 */
export default function CardPage() {
  return (
    <div className="px-[var(--gutter-mobile)]">
      <h1 className="sr-only">{site.name} — digital business card</h1>
      <CardScene url={cardUrl()} />
    </div>
  );
}
