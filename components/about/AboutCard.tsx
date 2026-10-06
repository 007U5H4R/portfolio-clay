import { CardScene } from "@/components/card/CardScene";
import { Container } from "@/components/layout/Container";
import { cardUrl } from "@/lib/card/vcard";

/**
 * The paper-cut digital business card inside About (TASK-146, card-updated.md §29): the card is the hero
 * of its own section, with its "Keep me in your pocket." line on the back. Same component as `/card`;
 * the QR on its back still encodes `${siteUrl()}/card`. No decorations are added here (EVAL-018).
 */
export function AboutCard() {
  return (
    <section id="about-card" aria-labelledby="about-card-heading" className="py-[var(--section-gap-mobile)] md:py-[var(--section-gap-tablet)]">
      <Container>
        <h2 id="about-card-heading" className="text-center font-[family-name:var(--font-display)] text-[length:var(--text-h3)] text-[color:var(--color-navy)]">
          Keep me in your pocket.
        </h2>
        <CardScene url={cardUrl()} compact />
      </Container>
    </section>
  );
}
