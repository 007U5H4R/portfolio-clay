import { recommendationsHref, testimonials } from "@/data/testimonials";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Sheet, Tape, TornEdge, type TapeSide } from "@/components/paper";
import { TESTIMONIALS_HEAD } from "./about-content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-01-25" → "Jan 2026". */
function monthYear(iso: string): string {
  const [year, month] = iso.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "Jay Mundhara" → "JM" (no photos: the authors' LinkedIn images are theirs). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const PLACEMENT: readonly { rotate: number; tape: TapeSide; tint: "note" | "blue" | "sage" }[] = [
  { rotate: -0.6, tape: "l", tint: "note" },
  { rotate: 0.5, tape: "c", tint: "blue" },
  { rotate: -0.3, tape: "r", tint: "sage" },
];

/**
 * IN THEIR WORDS (TASK-136 follow-up, Tushar 2026-10-05) — `section#testimonials` on `paper-2` under its
 * torn edge, between Recognition and the Experience strip: three LinkedIn recommendations Tushar picked
 * (`data/testimonials.ts`, public on LinkedIn only). Each is a taped, tinted paper card (`data-paper="card"`)
 * holding a `<figure>`: the verbatim excerpt in a `<blockquote cite>` (fragments joined with " … "), then
 * initials, the author's name, a short role from their own headline, and LinkedIn's relationship line +
 * month. One link to read them all on LinkedIn.
 *
 * ≥ 900 three columns; stacked below. EVAL-018: torn = 1. Motion: cards settle in 90 ms apart, once.
 */
export function Testimonials() {
  const shown = testimonials.filter((t) => t.publicOnLinkedIn);
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="tsx">
      <TornEdge fill="paper-2" />
      <div className="tsx-body">
        <Container className="tsx-wrap">
          <div className="ab-head">
            <div>
              <p className="ab-eyebrow">{TESTIMONIALS_HEAD.eyebrow}</p>
              <h2 id="testimonials-heading" className="ab-h2">
                {TESTIMONIALS_HEAD.title}
              </h2>
            </div>
          </div>
          <ul className="tsx-list">
            {shown.map((t, index) => {
              const place = PLACEMENT[index % PLACEMENT.length]!;
              return (
                <li key={t.id} className="tsx-slot">
                  <Reveal index={index} className="tsx-rv">
                    <Sheet as="figure" variant="card" rotate={place.rotate} className="tsx-card">
                      <Tape side={place.tape} />
                      <div className="tsx-paper" data-tint={place.tint} data-testimonial={t.id}>
                        <blockquote className="tsx-quote" cite={recommendationsHref}>
                          <p>{t.excerpt.join(" … ")}</p>
                        </blockquote>
                        <figcaption className="tsx-by">
                          <span className="tsx-initials" aria-hidden="true">
                            {initials(t.name)}
                          </span>
                          <span className="tsx-who">
                            <b className="tsx-name">{t.name}</b>
                            <span className="tsx-role">{t.role}</span>
                            <span className="tsx-rel">
                              {t.relationship} · <time dateTime={t.date}>{monthYear(t.date)}</time>
                            </span>
                          </span>
                        </figcaption>
                      </div>
                    </Sheet>
                  </Reveal>
                </li>
              );
            })}
          </ul>
          <p className="tsx-more">
            <ExternalLink href={recommendationsHref} className="tsx-more-link">
              {TESTIMONIALS_HEAD.more}
            </ExternalLink>
          </p>
        </Container>
      </div>
    </section>
  );
}
