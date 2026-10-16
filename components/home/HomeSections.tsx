import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { MobileCarousel } from "./MobileCarousel";
import { Reveal } from "@/components/interactions/Reveal";
import { Sheet, TornEdge } from "@/components/paper";
import {
  AWARD_TILES,
  CREDENTIAL_CARDS,
  WORK_CARDS,
  type Art,
  type AwardTile,
  type CredentialCard,
  type WorkCard,
} from "./home-content";

/**
 * Home's three replacement sections (TASK-211): Credentials → Selected Work → Awards & Recognition.
 * Server components; `Reveal` is the only client leaf (the same one-shot reveal the old sections used, a
 * no-op under reduced motion). Each section opens with its torn edge (the one counted decoration, EVAL-018);
 * the cards are content paper, not decorations.
 *
 * Every Credentials / Selected Work card carries exactly ONE link (the heading's link, stretched over the card
 * with a ::after), so the whole card is the target without nesting interactive elements. Award tiles are not
 * links. The art is generated paper-cut (public/media/home/, provenance in docs/reports/TASK-211.md); it is
 * decorative (`alt=""`) because the heading beside it names the same thing. Real logos come from
 * `components/experience/logos.ts`; an organisation with no logo shows its name in type, never an invented mark.
 */

/** Below-the-fold art: lazy, decoded off-thread, with its intrinsic size so the box is reserved (no CLS). */
function ArtImg({ art, alt = "", className }: { art: Art; alt?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP written by the sharp pipeline; the optimizer would only re-encode it
    <img src={art.src} width={art.width} height={art.height} alt={alt} loading="lazy" decoding="async" className={className} />
  );
}

function Head({
  id,
  eyebrow,
  title,
  accent,
  sub,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  accent: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="hs-head" index={0}>
      <p className="hs-eyebrow" data-micro-label="">
        {eyebrow}
      </p>
      <h2 id={id} className="hs-h2">
        {title} <em>{accent}</em>
      </h2>
      <p className="hs-sub">{sub}</p>
      {children}
    </Reveal>
  );
}

function CredentialItem({ card, index }: { card: CredentialCard; index: number }) {
  return (
    <Reveal index={index + 1} className="hs-slot">
      <Sheet as="article" variant="card" className="hs-card hs-cred">
        <div className="hs-art">
          <ArtImg art={card.art} />
          {card.logo ? (
            <span className="hs-plaque" style={{ "--logo-h": `${card.logo.width / card.logo.height < 1.5 ? 30 : 18}px` } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the official logo file, fixed size */}
              <img src={card.logo.src} width={card.logo.width} height={card.logo.height} alt={card.logo.alt} loading="lazy" decoding="async" />
            </span>
          ) : (
            <span className="hs-plaque hs-plaque-text" aria-hidden="true">
              {card.org}
            </span>
          )}
        </div>
        <div className="hs-copy">
          <h3 className="hs-name">
            <Link href={card.href} aria-label={card.label} className="hs-link focus-ring">
              {card.org}
            </Link>
          </h3>
          <p className="hs-role">{card.role}</p>
          {card.dates ? <p className="hs-dates">{card.dates}</p> : null}
          <ul className="hs-tags" aria-label="Focus">
            {card.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
        <span className="hs-go" aria-hidden="true">
          <ArrowRight size={18} strokeWidth={1.8} />
        </span>
      </Sheet>
    </Reveal>
  );
}

export function CredentialsSection() {
  return (
    <section id="credentials" aria-labelledby="credentials-heading" className="hs hs-credentials">
      <TornEdge fill="paper-2" className="hs-torn" />
      <div className="hs-body">
        <div className="hs-wrap hs-split">
          <Head
            id="credentials-heading"
            eyebrow="Credentials"
            title="Where I’ve made an"
            accent="impact."
            sub="Enterprise experience. Real-world execution. Independent building."
          />
          <MobileCarousel noun="credential" label="Credentials" count={CREDENTIAL_CARDS.length}>
            <ul className="hs-grid hs-grid-4" aria-label="Credentials">
              {CREDENTIAL_CARDS.map((card, i) => (
                <li key={card.id} className="hs-li" data-credential={card.id}>
                  <CredentialItem card={card} index={i} />
                </li>
              ))}
            </ul>
          </MobileCarousel>
        </div>
      </div>
    </section>
  );
}

function WorkItem({ card, index }: { card: WorkCard; index: number }) {
  return (
    <Reveal index={index + 1} className="hs-slot">
      <Sheet as="article" variant="card" className="hs-card hs-work">
        <div className="hs-art">
          <ArtImg art={card.art} />
        </div>
        <div className="hs-copy">
          <ul className="hs-tags" aria-label="Tags">
            {card.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <h3 className="hs-name">
            <Link href={card.href} aria-label={card.label} className="hs-link focus-ring">
              {card.name}
            </Link>
          </h3>
          <p className="hs-desc">{card.description}</p>
        </div>
        <span className="hs-go" aria-hidden="true">
          <ArrowRight size={18} strokeWidth={1.8} />
        </span>
      </Sheet>
    </Reveal>
  );
}

export function SelectedWorkSection() {
  return (
    <section id="selected-work" aria-labelledby="selected-work-heading" className="hs hs-work-section">
      <TornEdge fill="paper-2" className="hs-torn" />
      <div className="hs-body">
        <div className="hs-wrap hs-split">
          <Head
            id="selected-work-heading"
            eyebrow="Selected work"
            title="A few things"
            accent="I’ve built."
            sub="From enterprise systems to personal products."
          >
            <Link href="/projects" className="hs-all focus-ring">
              <span>View all work</span>
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </Head>
          <MobileCarousel noun="project" label="Selected work" count={WORK_CARDS.length}>
            <ul className="hs-grid hs-grid-3" aria-label="Selected work">
              {WORK_CARDS.map((card, i) => (
                <li key={card.id} className="hs-li" data-work={card.id}>
                  <WorkItem card={card} index={i} />
                </li>
              ))}
            </ul>
          </MobileCarousel>
        </div>
      </div>
    </section>
  );
}

function AwardItem({ tile, index }: { tile: AwardTile; index: number }) {
  return (
    <Reveal index={index + 1} className="hs-slot">
      <div className="hs-award" data-award={tile.id}>
        <div className="hs-trophy">
          <ArtImg art={tile.art} />
        </div>
        <h3 className="hs-award-name">{tile.name}</h3>
        <p className="hs-award-detail">{tile.detail}</p>
      </div>
    </Reveal>
  );
}

/** `id` defaults to Home's `#awards`; /about passes its own anchor. Everything else is identical on both pages.
 *  `carousel` (Home only, TASK-228) turns the phone-width grid into a one-award swipe carousel; /about keeps the grid. */
export function AwardsSection({ id = "awards", carousel = false }: { id?: string; carousel?: boolean } = {}) {
  const grid = (
    <ul className="hs-grid hs-grid-awards" aria-label="Awards">
      {AWARD_TILES.map((tile, i) => (
        <li key={tile.id} className="hs-li">
          <AwardItem tile={tile} index={i} />
        </li>
      ))}
    </ul>
  );
  return (
    <section id={id} aria-labelledby="awards-heading" className="hs hs-awards">
      <TornEdge fill="paper" className="hs-torn" />
      <div className="hs-body">
        <div className="hs-wrap hs-split">
          <Head
            id="awards-heading"
            eyebrow="Awards & Recognition"
            title="Recognized for"
            accent="impact."
            sub="Recognition for contributions across cloud, product delivery, and AI."
          />
          {carousel ? (
            <MobileCarousel noun="award" label="Awards" count={AWARD_TILES.length}>
              {grid}
            </MobileCarousel>
          ) : (
            grid
          )}
        </div>
      </div>
    </section>
  );
}
