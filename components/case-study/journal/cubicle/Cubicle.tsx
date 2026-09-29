import type { CSSProperties, ReactNode } from "react";
import type { CaseImage, CaseSection, CaseStudy } from "@/data/schema";
import { CaseImageFrame } from "@/components/case-study/system/CaseImageFrame";
import { MetricCard } from "@/components/case-study/system/MetricCard";
import { Glyph } from "../glyphs";

/**
 * TASK-130 journal · Cubicle (Tushar's redesign brief §9–§21): "visible reasoning creates trust".
 * A 1990s startup cubicle — beige CRT, partition fabric, folder tabs, printed deliverables, office
 * memos. The real UI is always the product proof; the drawing only frames it.
 */

const TEAM = [
  { role: "PM", act: "propose" },
  { role: "Researcher", act: "question" },
  { role: "Designer", act: "objection" },
  { role: "Developer", act: "agree" },
] as const;

const PROBLEM_GLYPHS = ["idea", "prompt", "doc", "lowtrust", "nothing"];
const RUN_GLYPHS = ["idea", "orchestrator", "team", "stop", "artifacts"];
const SYSTEM_GLYPHS = ["idea", "orchestrator", "team", "stop", "artifacts", "database", "browser"];
const LEARNING_GLYPHS = ["eye", "bounded", "diff"];

const idx = (i: number) => ({ "--i": i }) as CSSProperties;

/** The hero composition: the scene with the real run screen in its CRT, the teammates' speech acts
 *  rising from it, and three handwritten desk notes. Everything but the screen is aria-hidden. */
export function CubicleHeroArt({ study }: { study: CaseStudy }) {
  const scene = study.hero.scene;
  const screen = study.hero.media as CaseImage;
  return (
    <div className="jx-scene jx-cub-scene">
      {scene ? (
        // eslint-disable-next-line @next/next/no-img-element -- static hand-authored SVG scene from public/
        <img className="jx-scene-bg" src={scene.src} alt="" width={scene.width} height={scene.height} decoding="async" fetchPriority="high" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- the real product UI, laid into the CRT */}
      <img className="jx-cub-screen" src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} decoding="async" fetchPriority="high" />
      <span className="jx-cub-glare" aria-hidden="true" />
      <ul className="jx-cub-bubbles" aria-hidden="true">
        {TEAM.map((member, i) => (
          <li key={member.role} className="jx-cub-bubble" data-role={member.role.toLowerCase()} style={idx(i)}>
            <span className="jx-cub-bubble-role">{member.role}</span>
            <span className="jx-cub-bubble-act">{member.act}</span>
          </li>
        ))}
      </ul>
      {study.hero.notes.map((note, i) => (
        <p key={note} className="jx-note jx-cub-note" data-n={i + 1} data-decor="sticky" aria-hidden="true">
          {note}
        </p>
      ))}
    </div>
  );
}

function Problem({ section }: { section: Extract<CaseSection, { kind: "problem" }> }) {
  return (
    <div className="jx-cub-problem jx-flat">
      <p className="jx-lede">{section.context}</p>
      {section.flow ? (
        <figure className="jx-slips" aria-labelledby="problem-flow-cap">
          <figcaption id="problem-flow-cap" className="jx-cap" data-micro-label="">
            {section.flow.caption}
          </figcaption>
          <ol className="jx-slip-row">
            {section.flow.steps.map((step, i) => (
              <li key={step.label} className="jx-slip" data-last={i === section.flow!.steps.length - 1 ? "" : undefined} style={idx(i)}>
                <Glyph name={PROBLEM_GLYPHS[i] ?? "doc"} />
                <span className="jx-slip-label">{step.label}</span>
                {step.note ? <span className="jx-slip-note">{step.note}</span> : null}
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
      {section.quote ? (
        <figure className="jx-pinned jx-cub-persona" data-paper="card">
          <span className="jx-pin" aria-hidden="true" />
          <blockquote>
            <p>“{section.quote.text}”</p>
          </blockquote>
          <figcaption>{section.quote.attribution}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}

function Product({ section }: { section: Extract<CaseSection, { kind: "product" }> }) {
  const [idle, done] = section.shots;
  return (
    <div className="jx-cub-product jx-flat">
      <p className="jx-lede">{section.summary}</p>
      <div className="jx-cub-desk">
        {idle ? <CaseImageFrame image={idle} className="jx-ui jx-ui-idle" /> : null}
        {section.flow ? (
          <figure className="jx-cub-run" aria-labelledby="run-cap">
            <figcaption id="run-cap" className="jx-cap" data-micro-label="">
              {section.flow.caption}
            </figcaption>
            <ol>
              {section.flow.steps.map((step, i) => (
                <li key={step.label} className="jx-cub-run-step" style={idx(i)}>
                  <Glyph name={RUN_GLYPHS[i] ?? "doc"} />
                  <span className="jx-cub-run-label">{step.label}</span>
                  {step.note ? <span className="jx-cub-run-note">{step.note}</span> : null}
                  {i === 2 ? (
                    <span className="jx-cub-chips" aria-hidden="true">
                      {TEAM.map((member) => (
                        <span key={member.role} data-role={member.role.toLowerCase()} />
                      ))}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </figure>
        ) : null}
        {done ? <CaseImageFrame image={done} className="jx-ui jx-ui-done" /> : null}
      </div>
      {section.outputs.length > 0 ? (
        <div className="jx-cub-print">
          <p className="jx-cap" data-micro-label="" id="outputs-cap">
            What every run prints
          </p>
          <ul className="jx-cub-sheets" aria-labelledby="outputs-cap">
            {section.outputs.map((output, i) => (
              <li key={output.name} className="jx-cub-sheet" data-owner={output.owner.toLowerCase()} style={idx(i)}>
                <p className="jx-cub-sheet-name">{output.name}</p>
                <p className="jx-cub-sheet-owner">by the {output.owner}</p>
                <ul className="jx-cub-sheet-lines">
                  {output.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TrustSystem({ section }: { section: Extract<CaseSection, { kind: "system" }> }) {
  const order = ["first", "second", "last"];
  return (
    <div className="jx-cub-trust jx-flat">
      {section.ladder ? (
        <ol className="jx-cub-ladder" aria-label="The sequencing bet">
          {section.ladder.map((rung, i) => (
            <li key={rung} className="jx-cub-rung" style={idx(i)}>
              <span className="jx-cub-rung-order" data-micro-label="">
                {order[i] ?? ""}
              </span>
              <span className="jx-cub-rung-word">{rung}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {section.decision ? (
        <dl className="jx-cub-decision">
          <div className="jx-memo" data-tone="could">
            <dt data-micro-label="">Could have</dt>
            <dd>{section.decision.could}</dd>
          </div>
          <div className="jx-memo" data-tone="chose">
            <dt data-micro-label="">Chose</dt>
            <dd>{section.decision.chose}</dd>
          </div>
          <div className="jx-memo" data-tone="because">
            <dt data-micro-label="">Because</dt>
            <dd>{section.decision.because}</dd>
          </div>
        </dl>
      ) : null}
      <figure className="jx-cub-arch" aria-labelledby="system-cap">
        <figcaption id="system-cap" className="jx-cap" data-micro-label="">
          {section.caption}
        </figcaption>
        <ol className="jx-cub-folders">
          {section.steps.map((step, i) => (
            <li key={step.label} className="jx-cub-folder" style={idx(i)}>
              <Glyph name={SYSTEM_GLYPHS[i] ?? "doc"} />
              <span className="jx-cub-folder-label">{step.label}</span>
              {step.note ? <span className="jx-cub-folder-note">{step.note}</span> : null}
            </li>
          ))}
        </ol>
      </figure>
      {section.rules.length > 0 ? (
        <aside className="jx-cub-rules" aria-labelledby="rules-h" data-paper="card">
          <span className="jx-clip" aria-hidden="true" />
          <h3 id="rules-h" className="jx-cub-rules-h">
            Key rules
          </h3>
          <ul>
            {section.rules.map((rule) => (
              <li key={rule}>
                <Glyph name="check" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
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

function Evidence({ section }: { section: Extract<CaseSection, { kind: "outcome" }> }) {
  return (
    <div className="jx-outcome jx-cub-outcome jx-flat">
      {section.intro ? <p className="jx-lede">{section.intro}</p> : null}
      <ul className="csx-proofs jx-outcome-proofs" data-count={section.proofs.length}>
        {section.proofs.map((proof) => (
          <li key={`${proof.value}-${proof.label}`}>
            <MetricCard proof={proof} />
          </li>
        ))}
      </ul>
      {section.gaps.length > 0 ? (
        <div className="jx-notmeasured" data-paper="card">
          <h3 className="jx-notmeasured-h" data-micro-label="">
            Not measured yet
          </h3>
          <ul>
            {section.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {section.stamp ? (
        <p className="jx-stamp">
          {section.stamp.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export function renderCubicleSection(section: CaseSection): ReactNode {
  switch (section.kind) {
    case "problem":
      return <Problem section={section} />;
    case "product":
      return <Product section={section} />;
    case "system":
      return <TrustSystem section={section} />;
    case "learnings":
      return <Learnings section={section} />;
    case "outcome":
      return <Evidence section={section} />;
    default:
      return null;
  }
}
