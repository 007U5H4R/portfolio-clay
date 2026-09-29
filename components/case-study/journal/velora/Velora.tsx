import type { CSSProperties, ReactNode } from "react";
import type { CaseImage, CaseSection, CaseStudy } from "@/data/schema";
import { Glyph } from "../glyphs";
import { JournalLearnings, JournalOutcome } from "../parts";

/**
 * TASK-130 journal · Nuptis → Velora (Tushar's redesign brief §34–§45): nine days, two products, one
 * survived. A fashion-sourcing studio — linen moodboard, swatches, garment tags, a stitched rail,
 * sample-tag markers. The pivot is the centrepiece. Trust scores are always labelled authored
 * prototype data; team research is always labelled team research.
 */

const idx = (i: number) => ({ "--i": i }) as CSSProperties;
const JOURNEY_GLYPHS = ["bizcard", "badge", "directory", "unverified", "notravel"];
const FLOW_GLYPHS = ["match", "rfp", "bid"];
const LEARNING_GLYPHS = ["scissors", "handoff", "label"];
const AUTHORED = "Trust score · authored prototype data";

function Phone({ image, className, eager = false, children }: { image: CaseImage; className?: string; eager?: boolean; children?: ReactNode }) {
  return (
    <figure className={["jx-vl-phone", className].filter(Boolean).join(" ")}>
      <span className="jx-vl-phone-body">
        {/* eslint-disable-next-line @next/next/no-img-element -- a real Velora screen (mock data) */}
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading={eager ? "eager" : "lazy"} decoding="async" />
      </span>
      {children}
    </figure>
  );
}

export function VeloraHeroArt({ study }: { study: CaseStudy }) {
  const scene = study.hero.scene;
  const main = study.hero.media as CaseImage;
  const killed = study.hero.pivotFrom;
  const product = study.sections.find((s) => s.kind === "product");
  const profile = product && product.kind === "product" ? product.shots[0] : undefined;
  const pivot = study.sections.find((s) => s.kind === "pivot");
  const stamp = pivot && pivot.kind === "pivot" ? pivot.stamp : undefined;
  return (
    <div className="jx-scene jx-vl-scene">
      {scene ? (
        // eslint-disable-next-line @next/next/no-img-element -- static hand-authored SVG scene from public/
        <img className="jx-scene-bg" src={scene.src} alt="" width={scene.width} height={scene.height} decoding="async" fetchPriority="high" />
      ) : null}
      {killed ? (
        <figure className="jx-vl-killed">
          {/* eslint-disable-next-line @next/next/no-img-element -- the real (killed) Nuptis dashboard */}
          <img src={killed.src} alt={killed.alt} width={killed.width} height={killed.height} decoding="async" />
          <span className="jx-vl-strike" aria-hidden="true" />
          {stamp ? (
            <span className="jx-stamp jx-vl-killed-stamp" aria-hidden="true">
              {stamp}
            </span>
          ) : null}
        </figure>
      ) : null}
      <svg className="jx-vl-arrow" viewBox="0 0 220 120" aria-hidden="true" focusable="false">
        <path d="M8 96C60 110 120 96 150 60S190 16 206 14" />
        <path d="M190 6l18 8-12 16" />
      </svg>
      {profile ? (
        <Phone image={profile} className="jx-vl-back">
          <figcaption className="jx-vl-authored">{AUTHORED}</figcaption>
        </Phone>
      ) : null}
      <Phone image={main} className="jx-vl-front" eager />
      {study.hero.notes.map((note, i) => (
        <p key={note} className="jx-note jx-vl-note" data-n={i + 1} data-decor="sticky" aria-hidden="true">
          {note}
        </p>
      ))}
    </div>
  );
}

function Problem({ section }: { section: Extract<CaseSection, { kind: "problem" }> }) {
  return (
    <div className="jx-vl-problem jx-flat">
      <p className="jx-lede">{section.context}</p>
      {section.flow ? (
        <figure className="jx-vl-journey" aria-labelledby="vl-journey-cap">
          <figcaption id="vl-journey-cap" className="jx-cap" data-micro-label="">
            {section.flow.caption}
          </figcaption>
          <ol>
            {section.flow.steps.map((step, i) => (
              <li key={step.label} className="jx-vl-card" data-late={i >= 3 ? "" : undefined} style={idx(i)}>
                <Glyph name={JOURNEY_GLYPHS[i] ?? "bizcard"} />
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
    </div>
  );
}

function Research({ section }: { section: Extract<CaseSection, { kind: "research" }> }) {
  const t = section.timeline;
  return (
    <div className="jx-vl-research jx-flat">
      {section.intro ? <p className="jx-lede">{section.intro}</p> : null}
      {t ? (
        <figure className="jx-vl-wait" aria-labelledby="vl-wait-cap">
          <figcaption id="vl-wait-cap" className="jx-cap" data-micro-label="">
            Where onboarding time goes
          </figcaption>
          {t.figure ? <p className="jx-vl-wait-figure">{t.figure}</p> : null}
          <div className="jx-vl-bar" aria-hidden="true">
            <span className="jx-vl-bar-active" />
            <span className="jx-vl-bar-waiting" />
          </div>
          <p className="jx-vl-legend">
            <span data-seg="active">{t.active}</span>
            <span data-seg="waiting">{t.waiting}</span>
          </p>
          <p className="jx-vl-wait-note">{t.note}</p>
        </figure>
      ) : null}
      <ul className="jx-vl-quotes">
        {section.quotes.map((quote) => (
          <li key={quote.text}>
            <figure className="jx-vl-quote">
              <blockquote>
                <p>“{quote.text}”</p>
              </blockquote>
              <figcaption>{quote.attribution}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pivot({ section, killed, survivor }: { section: Extract<CaseSection, { kind: "pivot" }>; killed?: CaseImage | undefined; survivor?: CaseImage | undefined }) {
  return (
    <ol className="jx-vl-timeline" aria-label="Nine days, two products">
      <li className="jx-vl-step" data-step="from">
        {section.from.when ? <p className="jx-vl-when" data-micro-label="">{section.from.when}</p> : null}
        <div className="jx-vl-concept">
          {killed ? (
            // eslint-disable-next-line @next/next/no-img-element -- the real Nuptis dashboard, struck
            <img src={killed.src} alt="" width={killed.width} height={killed.height} loading="lazy" decoding="async" />
          ) : null}
          <span className="jx-vl-strike" aria-hidden="true" />
        </div>
        <p className="jx-vl-name">{section.from.name}</p>
        <p className="jx-vl-line">{section.from.line}</p>
        {section.stamp ? <p className="jx-stamp jx-vl-kill">{section.stamp}</p> : null}
      </li>
      <li className="jx-vl-step" data-step="evidence">
        <Glyph name="unverified" />
        <p className="jx-vl-name">The evidence</p>
        {section.evidence.map((item) => (
          <p key={item.text} className="jx-vl-line">
            {item.text}
          </p>
        ))}
      </li>
      <li className="jx-vl-step" data-step="keep">
        <Glyph name="scissors" />
        <p className="jx-vl-name">Keep the insight</p>
        <p className="jx-vl-line">{section.decision.text}</p>
      </li>
      <li className="jx-vl-step" data-step="to">
        {section.to.when ? <p className="jx-vl-when" data-micro-label="">{section.to.when}</p> : null}
        {survivor ? (
          <div className="jx-vl-survivor">
            {/* eslint-disable-next-line @next/next/no-img-element -- the real Velora first screen */}
            <img src={survivor.src} alt="" width={survivor.width} height={survivor.height} loading="lazy" decoding="async" />
          </div>
        ) : null}
        <p className="jx-vl-name">{section.to.name}</p>
        <p className="jx-vl-line">{section.to.line}</p>
      </li>
    </ol>
  );
}

function PortableTrust({ section }: { section: Extract<CaseSection, { kind: "product" }> }) {
  return (
    <div className="jx-vl-bet jx-flat">
      <p className="jx-lede">{section.summary}</p>
      {section.flow ? (
        <figure className="jx-vl-flow" aria-labelledby="vl-flow-cap">
          <figcaption id="vl-flow-cap" className="jx-vl-sides">
            <span>Brand</span>
            <span aria-hidden="true">⇄</span>
            <span>Manufacturer</span>
          </figcaption>
          <ol>
            {section.flow.steps.map((step, i) => (
              <li key={step.label} className="jx-vl-flowstep" style={idx(i)}>
                <Glyph name={FLOW_GLYPHS[i] ?? "rfp"} />
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
      <div className="jx-vl-phones">
        {section.shots.map((shot, i) => (
          <Phone key={shot.src} image={shot} className={`jx-vl-shot jx-vl-shot-${i + 1}`}>
            {i === 0 ? <p className="jx-vl-authored jx-vl-authored-tag">{AUTHORED}</p> : null}
            {shot.caption ? <figcaption className="csx-frame-cap">{shot.caption}</figcaption> : null}
          </Phone>
        ))}
      </div>
    </div>
  );
}

export function veloraSectionRenderer(study: CaseStudy) {
  const killed = study.hero.pivotFrom;
  const survivor = study.hero.media as CaseImage;
  return function renderVeloraSection(section: CaseSection): ReactNode {
    switch (section.kind) {
      case "problem":
        return <Problem section={section} />;
      case "research":
        return <Research section={section} />;
      case "pivot":
        return <Pivot section={section} killed={killed} survivor={survivor} />;
      case "product":
        return <PortableTrust section={section} />;
      case "learnings":
        return <JournalLearnings section={section} glyphs={LEARNING_GLYPHS} />;
      case "outcome":
        return <JournalOutcome section={section} className="jx-vl-outcome" />;
      default:
        return null;
    }
  };
}
