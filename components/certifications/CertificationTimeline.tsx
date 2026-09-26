import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper";
import type { Certification } from "@/data/certifications";
import { CredentialLink } from "./CredentialLink";
import { deckle } from "./deckle";
import { Books, Chart, Cloud, Gear, IssuerIcon, Lightbulb, Mountain, People, Plane, Sparks, Star } from "./Doodles";

/**
 * CertificationTimeline (TKT-102, Tushar direction 2026-09-26 — docs/redesign-mockups/m-009/
 * tushar-2026-09-26/certifications-target.png + certifications-spec.md; Design.md §11 Dev-46/47).
 * Server component: the only client code is `CredentialLink` (click tracking).
 *
 * Per certification (an `<li>`, newest first): ONE `<a>` to its individual Credly credential that
 * holds the whole paper artifact — tinted year tape, the round deckled badge (the credential's own
 * artwork, Dev-56), the rail dot, the torn tinted card (name h2, issuer, rule, skills, the Caveat
 * "View credential ↗" micro-label) and the pinned sticky note ("applied in…", Tushar's copy). Hover /
 * focus lifts the paper (−4 px, −0.6°, a slightly deeper shadow) and nudges the ↗; reduced motion
 * gets the shadow only, no transform. Nothing is hover-only: the micro-label is always visible.
 *
 * EVAL-018 (Design.md §3.2) — `section#certifications` counts 4: the hand-lettered title strip
 * (`note`) · the aside (`annotation`) · ONE text-free collage (`collage`, Dev-40 kind: generated paper
 * scraps, leaf + fern, mountain, stars, sparks) · the footer (`note`: books, plane, "Continuous learning…" strip). The
 * visible title is decoration; the real `<h1>` is sr-only with the same word. The sticky notes are the
 * card's own annotation (Dev-46): `aria-hidden`, their words reach assistive tech through the link's
 * `aria-describedby`, so no information lives only in a decoration.
 */

type Tone = "sage" | "rose" | "blue" | "note";

interface Look {
  /** Year tape + rail dot. */
  tape: Tone;
  /** Card tint. */
  card: Tone | "plain";
  sticky: Tone;
  pin: "green" | "red";
  doodle: ReactNode;
}

/** The reference's colour + doodle per certification (by slug); unknown slugs cycle `FALLBACK`. */
const LOOKS: Record<string, Look> = {
  "gcp-generative-ai-leader": { tape: "sage", card: "sage", sticky: "rose", pin: "green", doodle: <Lightbulb /> },
  pmp: { tape: "blue", card: "plain", sticky: "blue", pin: "red", doodle: <People /> },
  "safe-6-agilist": { tape: "rose", card: "note", sticky: "sage", pin: "green", doodle: <Gear /> },
  "gcp-professional-cloud-architect": { tape: "blue", card: "plain", sticky: "rose", pin: "red", doodle: <Cloud /> },
  "pspo-i": { tape: "note", card: "plain", sticky: "blue", pin: "green", doodle: <Chart /> },
};
const FALLBACK: Look[] = Object.values(LOOKS);

/** Collage pieces cropped from the shared Higgsfield sprite sheets (`collage-<piece>.webp`). */
const COLLAGE_IMAGES = [
  { cls: "cert-scrap-sage", src: "/media/illustrations/collage-scrap-sage.webp", w: 280, h: 290 },
  { cls: "cert-scrap-kraft", src: "/media/illustrations/collage-scrap-kraft.webp", w: 280, h: 327 },
  { cls: "cert-leaf", src: "/media/illustrations/collage-leaf-1.webp", w: 120, h: 366 },
  { cls: "cert-fern", src: "/media/illustrations/collage-fern.webp", w: 120, h: 303 },
] as const;

function hashSeed(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 997;
}

/** A deckled circle (the round paper cut-out behind each badge) as a CSS `polygon()`. */
function deckleCircle(seed: number, points = 44, depth = 3.2): string {
  let a = seed >>> 0;
  const rand = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  const pts: string[] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    const r = 50 - rand() * depth;
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)}% ${(50 + r * Math.sin(t)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

const CARD_RIM = { across: 22, down: 10, depthX: 1.1, depthY: 2.6 };
const CARD_FACE = { across: 22, down: 10, depthX: 1.1, depthY: 2.6, insetX: 0.5, insetY: 1.3 };

function CertificationItem({ cert, index }: { cert: Certification; index: number }) {
  const look = LOOKS[cert.slug] ?? FALLBACK[index % FALLBACK.length]!;
  const seed = hashSeed(cert.slug);
  const ids = { issuer: `${cert.slug}-issuer`, skills: `${cert.slug}-skills`, applied: `${cert.slug}-applied` };
  const describedBy = [ids.issuer, cert.skills.length > 0 ? ids.skills : "", cert.applied ? ids.applied : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <li className="cert-item" data-tape={look.tape} data-card={look.card} data-sticky={look.sticky} data-pin={look.pin}>
      <CredentialLink
        name={cert.name}
        issuer={cert.issuer}
        year={cert.year}
        credentialUrl={cert.credentialUrl}
        describedBy={describedBy}
        className="cert-link focus-ring"
      >
        <div className="cert-when">
          <span className="cert-year" style={{ clipPath: deckle(seed + 3, { across: 8, down: 4, depthX: 3, depthY: 7 }) }}>
            <time dateTime={cert.issued}>{cert.year}</time>
          </span>
          <div className="cert-badge cert-lift">
            <span className="cert-badge-paper" style={{ clipPath: deckleCircle(seed) }} aria-hidden="true" />
            {/* Plain <img>: a 240 px WebP needs no optimiser; width/height reserve the box (no CLS). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cert-badge-img" src={cert.badge} alt="" width={240} height={240} loading="lazy" decoding="async" />
          </div>
        </div>

        <span className="cert-dot" aria-hidden="true" />

        <div className="cert-card cert-lift">
          <span className="cert-paper" aria-hidden="true">
            <i className="cert-paper-rim" style={{ clipPath: deckle(seed, CARD_RIM) }} />
            <i className="cert-paper-face" style={{ clipPath: deckle(seed + 1, CARD_FACE) }} />
          </span>
          <span className="cert-corner" aria-hidden="true">
            ↗
          </span>
          <h2 className="cert-name">{cert.name}</h2>
          <p id={ids.issuer} className="cert-issuer">
            <IssuerIcon />
            <span className="sr-only">Issued by </span>
            {cert.issuer}
          </p>
          <span className="cert-rule" aria-hidden="true" />
          {cert.skills.length > 0 ? (
            <p id={ids.skills} className="cert-skills">
              {cert.skills.join(" · ")}
            </p>
          ) : null}
          <p className="cert-cta font-hand" data-hand="cta">
            View credential <span className="cert-cta-arrow">↗</span>
          </p>
        </div>

        {cert.applied ? (
          <div className="cert-sticky cert-lift" aria-hidden="true">
            <span className="cert-sticky-pin" />
            <span id={ids.applied} className="cert-sticky-text font-hand">
              {cert.applied}
            </span>
            <span className="cert-sticky-doodle">{look.doodle}</span>
          </div>
        ) : null}
      </CredentialLink>
    </li>
  );
}

export interface CertificationTimelineProps {
  certifications: Certification[];
}

export function CertificationTimeline({ certifications }: CertificationTimelineProps) {
  return (
    <section id="certifications" aria-labelledby="certifications-heading" className="cert">
      <div className="cert-collage" data-decor="collage" aria-hidden="true">
        {/* Generated paper + botanical pieces (Higgsfield, Tushar-approved 2026-09-26; provenance in
            content/media/illustrations/README.md) and line doodles — all decorative, lazy, alt="". */}
        {COLLAGE_IMAGES.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.cls} className={`cert-piece ${img.cls}`} src={img.src} alt="" width={img.w} height={img.h} loading="lazy" decoding="async" />
        ))}
        <Mountain />
        <Sparks className="cert-collage-sparks" />
        <Star className="cert-star-a" />
        <Star className="cert-star-b" />
      </div>

      <Container className="cert-wrap">
        <div className="cert-head">
          <h1 id="certifications-heading" className="sr-only">
            Certifications
          </h1>
          <p className="cert-title font-hand" data-decor="note" aria-hidden="true">
            <span className="cert-title-tape" />
            <span className="cert-title-strip" style={{ clipPath: deckle(hashSeed("certifications"), { across: 18, down: 6, depthX: 2.2, depthY: 5 }) }} />
            <span className="cert-title-text">Certifications</span>
            <svg className="cert-title-stroke" viewBox="0 0 300 16" preserveAspectRatio="none" focusable="false">
              <path d="M4 11 C 70 5, 170 4, 296 8" />
            </svg>
            <Sparks className="cert-title-sparks" />
          </p>
          <Annotation size="lg" rotate={-4} className="cert-aside">
            Credentials are useful. Applied capability is better.
          </Annotation>
        </div>

        <ol className="cert-list">
          {certifications.map((cert, i) => (
            <CertificationItem key={cert.slug} cert={cert} index={i} />
          ))}
        </ol>

        <div className="cert-foot" data-decor="note" aria-hidden="true">
          <Books />
          <Plane />
          <p className="cert-foot-strip font-hand">
            <span className="cert-foot-paper" style={{ clipPath: deckle(hashSeed("foot"), { across: 14, down: 6, depthX: 2.4, depthY: 6 }) }} />
            <span className="cert-foot-text">Continuous learning for higher impact.</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
