import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Container } from "@/components/layout/Container";
import { showGithub } from "@/components/layout/BandFooter";
import { Annotation } from "@/components/paper/Annotation";
import { Hand } from "@/components/paper/Hand";
import { Sheet } from "@/components/paper/Sheet";
import { Sketch } from "@/components/paper/Sketch";
import { TornEdge } from "@/components/paper/TornEdge";
import { site } from "@/lib/site";

/** "https://www.linkedin.com/in/pathaktushar" → "/in/pathaktushar" (the postcard's short form). */
function linkedinShort(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

/** "https://github.com/007U5H4R" → "@007U5H4R". */
function githubShort(url: string): string {
  try {
    return `@${new URL(url).pathname.replace(/^\/|\/$/g, "")}`;
  } catch {
    return url;
  }
}

/**
 * `/contact` details (TSK-46, Design.md §7.8): a `paper-2` section with a torn top — eyebrow "The
 * details, on a card" (the section's `h2`), the hand-line annotation "A more human approach to an
 * AI-driven world." + a free arrow sketch, and the **postcard** (`Sheet variant="postcard"`, +1.5°,
 * "TP" stamp as postcard chrome — not a decoration, §3.1).
 *
 * Unit count (EVAL-018, §3.3 `/contact` details = 3): torn · annotation · arrow sketch. The arrow is
 * CSS-hidden < 900 but stays in the DOM, so it counts at every width (§3.2 rule 3).
 *
 * Postcard rows: Caveat labels `data-hand="label"` (≤ 3 words, inside the `data-paper` object —
 * §3.4) and Inter values. Only approved public contact (EXE-8): **email** and **linkedin** always;
 * **github** only under the band's own S5 rule (`showGithub()` — a project links a public repo), and
 * **from** "Bengaluru, India" only behind `site.showLocation` (default `false`). The first row keeps
 * 76 px clear of the stamp (CSS).
 */
export function ContactDetails() {
  const github = showGithub();

  return (
    <section className="contact-details" aria-labelledby="contact-details-h">
      <TornEdge fill="paper-2" />
      <div className="contact-details-body">
        <Container className="contact-details-grid">
          <div className="contact-details-lead">
            <h2 id="contact-details-h" className="contact-eyebrow">
              The details, on a card
            </h2>
            <Annotation rotate={-1.2} className="contact-hand-line">
              A more human approach to an AI-driven world.
            </Annotation>
            <Sketch variant="arrow" className="contact-details-arrow" />
          </div>

          <Sheet variant="postcard" rotate={1.5} stamp="TP" className="contact-postcard">
            <div className="contact-postcard-row">
              <Hand kind="label">email</Hand>
              <a className="contact-postcard-value focus-ring" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
            <div className="contact-postcard-row">
              <Hand kind="label">linkedin</Hand>
              <a
                className="contact-postcard-value focus-ring"
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkedinShort(site.linkedin)}
                <VisuallyHidden> (opens in new tab)</VisuallyHidden>
              </a>
            </div>
            {github ? (
              <div className="contact-postcard-row">
                <Hand kind="label">github</Hand>
                <a
                  className="contact-postcard-value focus-ring"
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {githubShort(site.github)}
                  <VisuallyHidden> (opens in new tab)</VisuallyHidden>
                </a>
              </div>
            ) : null}
            {site.showLocation ? (
              <div className="contact-postcard-row">
                <Hand kind="label">from</Hand>
                <span className="contact-postcard-value">Bengaluru, India</span>
              </div>
            ) : null}
          </Sheet>
        </Container>
      </div>
    </section>
  );
}
