import type { CSSProperties, ReactNode } from "react";
import type { CaseImage, CaseSection, CaseStudy } from "@/data/schema";
import { caseStudyLinkAttrs } from "@/lib/case-study-link";
import { NewTabHint } from "@/components/common/NewTabHint";
import { Glyph } from "../glyphs";

/**
 * TASK-130 journal · Dino Arcade (Tushar's redesign brief §22–§33): a legal/content constraint became
 * the product architecture — and led to Slag City. A retro arcade poster on a desert road-trip
 * postcard; the editorial paper page underneath stays (no all-pixel-art page). The real captured
 * cabinet screen and the real app icon are the product proof.
 */

const idx = (i: number) => ({ "--i": i }) as CSSProperties;
const FLOW_GLYPHS = ["homescreen", "file", "slot", "offline"];
const DECISION_GLYPHS = ["cartridgeX", "serverX"];
const PART_GLYPHS = ["power", "slot", "board", "bezel", "joystick"];
const LEARNING_GLYPHS = ["cartridgeX", "offline", "coin"];
const SLAG_CITY = "/work/slag-city";

export function DinoHeroArt({ study }: { study: CaseStudy }) {
  const scene = study.hero.scene;
  const screen = study.hero.media as CaseImage;
  const product = study.sections.find((s) => s.kind === "product");
  const icon = product && product.kind === "product" ? product.shots[1] : undefined;
  return (
    <div className="jx-scene jx-dn-scene">
      {scene ? (
        // eslint-disable-next-line @next/next/no-img-element -- static hand-authored SVG scene from public/
        <img className="jx-scene-bg" src={scene.src} alt="" width={scene.width} height={scene.height} decoding="async" fetchPriority="high" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- the real captured cabinet screen */}
      <img className="jx-dn-screen" src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} decoding="async" fetchPriority="high" />
      <span className="jx-dn-scan" aria-hidden="true" />
      {icon ? (
        <span className="jx-dn-stamp">
          {/* eslint-disable-next-line @next/next/no-img-element -- the real home-screen icon as the postcard's stamp */}
          <img src={icon.src} alt={icon.alt} width={icon.width} height={icon.height} decoding="async" />
        </span>
      ) : null}
      {study.hero.notes.map((note, i) => (
        <p key={note} className="jx-note jx-dn-ticket" data-n={i + 1} data-decor="sticky" aria-hidden="true">
          {note}
        </p>
      ))}
    </div>
  );
}

function Product({ section }: { section: Extract<CaseSection, { kind: "product" }> }) {
  const [cabinet, icon] = section.shots;
  return (
    <div className="jx-dn-product jx-flat">
      <p className="jx-lede">{section.summary}</p>
      {section.flow ? (
        <figure className="jx-dn-flow" aria-labelledby="dn-flow-cap">
          <figcaption id="dn-flow-cap" className="jx-cap" data-micro-label="">
            {section.flow.caption}
          </figcaption>
          <ol>
            {section.flow.steps.map((step, i) => (
              <li key={step.label} className="jx-dn-ticketstep" style={idx(i)}>
                <span className="jx-dn-step-n" aria-hidden="true">
                  {i + 1}
                </span>
                <Glyph name={FLOW_GLYPHS[i] ?? "file"} />
                <span className="jx-dn-step-label">{step.label}</span>
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
      <div className="jx-dn-phones">
        {cabinet ? (
          <figure className="jx-dn-phone" data-orient="landscape">
            <div className="jx-dn-phone-body">
              {/* eslint-disable-next-line @next/next/no-img-element -- the real captured cabinet screen */}
              <img src={cabinet.src} alt={cabinet.alt} width={cabinet.width} height={cabinet.height} loading="lazy" decoding="async" />
            </div>
            {cabinet.caption ? <figcaption className="csx-frame-cap">{cabinet.caption}</figcaption> : null}
          </figure>
        ) : null}
        {icon ? (
          <figure className="jx-dn-phone" data-orient="portrait">
            <div className="jx-dn-phone-body">
              <div className="jx-dn-home" aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} className="jx-dn-app" />
                ))}
              </div>
              <span className="jx-dn-icon">
                {/* eslint-disable-next-line @next/next/no-img-element -- the real home-screen icon */}
                <img src={icon.src} alt={icon.alt} width={icon.width} height={icon.height} loading="lazy" decoding="async" />
                <span className="jx-dn-icon-name" aria-hidden="true">
                  Dino Arcade
                </span>
              </span>
            </div>
            {icon.caption ? <figcaption className="csx-frame-cap">{icon.caption}</figcaption> : null}
          </figure>
        ) : null}
      </div>
    </div>
  );
}

function Decisions({ section }: { section: Extract<CaseSection, { kind: "decisions" }> }) {
  return (
    <ul className="jx-dn-decisions" data-count={section.items.length}>
      {section.items.map((decision, i) => (
        <li key={decision.chose} className="jx-dn-placard" style={idx(i)}>
          <p className="jx-dn-placard-h" aria-hidden="true">
            {`Rule ${i + 1}`}
          </p>
          <Glyph name={DECISION_GLYPHS[i] ?? "cartridgeX"} />
          <dl>
            <div data-tone="could">
              <dt data-micro-label="">Could have</dt>
              <dd>{decision.could}</dd>
            </div>
            <div data-tone="chose">
              <dt data-micro-label="">Chose</dt>
              <dd>{decision.chose}</dd>
            </div>
            <div data-tone="because">
              <dt data-micro-label="">Because</dt>
              <dd>{decision.because}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function System({ section }: { section: Extract<CaseSection, { kind: "system" }> }) {
  return (
    <figure className="jx-dn-machine" aria-labelledby="dn-machine-cap">
      <figcaption id="dn-machine-cap" className="jx-cap" data-micro-label="">
        {section.caption}
      </figcaption>
      <ol>
        {section.steps.map((step, i) => (
          <li key={step.label} className="jx-dn-part" style={idx(i)}>
            <Glyph name={PART_GLYPHS[i] ?? "board"} />
            <span className="jx-dn-part-label">{step.label}</span>
            {step.note ? <span className="jx-dn-part-note">{step.note}</span> : null}
          </li>
        ))}
      </ol>
      <p className="jx-dn-machine-edge" aria-hidden="true">
        on the phone · no server
      </p>
    </figure>
  );
}

function Outcome({ section }: { section: Extract<CaseSection, { kind: "pivot" }> }) {
  return (
    <ol className="jx-dn-road" aria-label="How one project created the next">
      <li className="jx-dn-stop" data-stop="from">
        <Glyph name="bezel" />
        <p className="jx-dn-stop-name">{section.from.name}</p>
        <p className="jx-dn-stop-line">{section.from.line}</p>
      </li>
      <li className="jx-dn-stop" data-stop="limit">
        <Glyph name="barrier" />
        <p className="jx-dn-stop-name">The limit</p>
        {section.evidence.map((item) => (
          <p key={item.text} className="jx-dn-stop-line">
            {item.text}
          </p>
        ))}
        {section.stamp ? <p className="jx-stamp jx-dn-limit-stamp">{section.stamp}</p> : null}
      </li>
      <li className="jx-dn-stop" data-stop="decision">
        <Glyph name="idea" />
        <p className="jx-dn-stop-name">An original game</p>
        <p className="jx-dn-stop-line">{section.decision.text}</p>
      </li>
      <li className="jx-dn-stop" data-stop="to">
        <Glyph name="joystick" />
        <p className="jx-dn-stop-name">{section.to.name}</p>
        <p className="jx-dn-stop-line">{section.to.line}</p>
        <a href={SLAG_CITY} {...caseStudyLinkAttrs(SLAG_CITY)} className="jx-dn-next focus-ring" data-inline-link="">
          Read the Slag City case study
          <NewTabHint href={SLAG_CITY} />
        </a>
      </li>
    </ol>
  );
}

function Learnings({ section }: { section: Extract<CaseSection, { kind: "learnings" }> }) {
  return (
    <ul className="jx-learnings" data-count={section.items.length}>
      {section.items.map((item, i) => (
        <li key={item.title} className="jx-learning" style={idx(i)}>
          <Glyph name={LEARNING_GLYPHS[i] ?? "check"} />
          <span className="jx-learning-n" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="jx-learning-h">{item.title}</h3>
          <p className="jx-learning-body">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function renderDinoSection(section: CaseSection): ReactNode {
  switch (section.kind) {
    case "product":
      return <Product section={section} />;
    case "decisions":
      return <Decisions section={section} />;
    case "system":
      return <System section={section} />;
    case "pivot":
      return <Outcome section={section} />;
    case "learnings":
      return <Learnings section={section} />;
    default:
      return null;
  }
}
