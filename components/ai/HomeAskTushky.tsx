import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { Sticky } from "@/components/paper/Sticky";
import { TornEdge } from "@/components/paper/TornEdge";
import { illustration } from "@/lib/illustrations";
import { HomeAskTushkyStage } from "./HomeAskTushkyStage";
import { Paw } from "./Paw";
import { TushkyLaunchPanel } from "./TushkyLaunchPanel";

const MASCOT = illustration("tushky-paws");

/**
 * HomeAskTushky (TKT-113, Tushar's spec 2026-09-26
 * `docs/redesign-mockups/m-009/tushar-2026-09-26/home-ask-tushky-spec.md`; Design.md §7.1 Ask, §11
 * Dev-64–69) — the Home `section#ask`, rebuilt as the "Ask Tushky" launcher. It never answers inline:
 * typing + send, or a suggestion card, opens the right-side drawer and asks there (`openPanel`).
 *
 *   <HomeAskTushky>                  server: section, torn edge, collage backdrop
 *     <HomeAskTushkyStage>           client: the one-shot entrance (IntersectionObserver + CSS)
 *       <TushkyIntro/>               eyebrow · "Ask Tushky" h2 · subtitle · the one grounding line
 *       <TushkyMascot/>              the paws-on-the-edge retriever + "That's Tushky!" annotation
 *       sticky                       "I sniff through Tushar's work so you don't have to."
 *       <TushkyLaunchPanel/>         client: notebook, composer, <SuggestedQuestions/>
 *
 * EVAL-018 (≤ 4 per section): torn · collage backdrop · annotation · sticky = 4. The notebook heading
 * and subtitle are Caveat, so each is an `aria-hidden` visual with an sr-only twin (rule 5), the same
 * pattern as the drawer's grounding note. The mascot is lazy and below the fold (never the LCP).
 */
export function HomeAskTushky() {
  return (
    <section id="ask" aria-labelledby="ask-heading" className="ask-section hat" data-cursor-theme="tushky">
      <TornEdge fill="paper-2" />
      <div className="ask-section-body hat-body">
        <TushkyCollage />
        <Container>
          <HomeAskTushkyStage className="hat-grid">
            <div className="hat-left">
              <TushkyIntro />
              <TushkyMascot />
              <Sticky rotate={-3} className="hat-sticky hat-in-note">
                I sniff through Tushar’s work so you don’t have to.
                <Paw className="hat-sticky-paw" />
              </Sticky>
            </div>
            <TushkyLaunchPanel />
          </HomeAskTushkyStage>
        </Container>
      </div>
    </section>
  );
}

function TushkyIntro() {
  return (
    <div className="hat-intro">
      <p className="ask-eyebrow hat-eyebrow">Ask</p>
      <h2 id="ask-heading" className="hat-title">
        Ask <span className="hat-title-accent">Tushky</span>
        <Paw className="hat-title-paw" />
      </h2>
      <p aria-hidden="true" className="hat-subtitle font-hand">
        Tushar’s Portfolio Assistant
      </p>
      <p className="sr-only">Tushar’s Portfolio Assistant</p>
      <p className="hat-lead">
        Ask anything about Tushar’s work, projects, experience, skills, product thinking, and learnings. Answers are
        grounded only in this portfolio.
      </p>
    </div>
  );
}

function TushkyMascot() {
  return (
    <div className="hat-mascot hat-in-dog">
      <Annotation arrow="down" rotate={-4} size="md" className="hat-callout">
        That’s Tushky! <Paw className="hat-callout-paw" />
      </Annotation>
      {/* eslint-disable-next-line @next/next/no-img-element -- a public/ WebP with alpha, served as-is (manifest §6.1), lazy below the fold */}
      <img
        src={MASCOT.publicSrc}
        alt={MASCOT.alt}
        width={MASCOT.width}
        height={MASCOT.height}
        loading="lazy"
        decoding="async"
        className="hat-dog"
      />
    </div>
  );
}

/**
 * The layered-paper accents (spec §16): a torn blue scrap, a muted terracotta scrap, a faint grid-paper
 * piece and one botanical sprig. ONE counted `collage` object (Design.md §3.1, Dev-41 kind); the pieces
 * carry no `data-decor`, no text, no motion. Two are CSS paper, two are the shared collage crops.
 */
function TushkyCollage() {
  return (
    <div data-decor="collage" aria-hidden="true" className="hat-collage">
      <i className="hat-scrap hat-scrap-blue" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative shared collage crop (TKT-99) */}
      <img src="/media/illustrations/collage-scrap-grid.webp" alt="" width={280} height={313} loading="lazy" decoding="async" className="hat-scrap hat-scrap-grid" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative shared collage crop (TKT-99) */}
      <img src="/media/illustrations/collage-scrap-rust.webp" alt="" width={280} height={282} loading="lazy" decoding="async" className="hat-scrap hat-scrap-rust" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative shared collage crop (TKT-99) */}
      <img src="/media/illustrations/collage-leaf-1.webp" alt="" width={120} height={366} loading="lazy" decoding="async" className="hat-scrap hat-leaf" />
    </div>
  );
}
