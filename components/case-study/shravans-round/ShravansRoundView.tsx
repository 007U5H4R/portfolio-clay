import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BrainCircuit, ClipboardCheck, Database, FileCheck2, GitBranch, Globe, ListChecks, MessageSquareQuote, MessagesSquare, Mic, PlayCircle, Quote, ScrollText, ShieldCheck, Sparkles, X } from "lucide-react";
import type { CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows } from "@/components/case-study/system/case-context";
import { NextProject } from "@/components/case-study/NextProject";
import { CaseName } from "@/components/case-study/CaseName";
import { SrpNav } from "./SrpNav";
import { ART, DECISIONS, EVIDENCE, HERO, NAV, PRODUCT, PROMISES, ROUND, SECTION, SOURCES, SYSTEM, URJA_NEXT_ART } from "./copy";

const ART_DIR = "/media/case-studies/shravans-round/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** The hero diorama: two renditions painted on each theme's own page colour; the inactive one is display:none. */
function HeroArt() {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static pre-sized WebP from public/, one per theme
        <img
          key={theme}
          src={`${ART_DIR}/hero-${theme}.webp`}
          data-theme-art={theme}
          alt=""
          aria-hidden="true"
          width={ART.hero[theme].w}
          height={ART.hero[theme].h}
          loading={theme === "light" ? "eager" : "lazy"}
          decoding="async"
          {...(theme === "light" ? { fetchPriority: "high" as const } : {})}
        />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="srp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered chapter: a folded-paper rosette on the dashed line, label, the brief's heading as the h2. */
function Sec({ id, anchors, n, children, className = "" }: { id: string; anchors: readonly string[]; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[id]!;
  return (
    <section id={id} className={`srp-sec ${className}`.trim()} aria-labelledby={`${id}-h`} data-cs-reveal="">
      <Anchors ids={anchors} />
      <span className="srp-num" aria-hidden="true">
        {n}
      </span>
      <div className="srp-sec-in">
        <p className="srp-label">{copy.eyebrow}</p>
        <h2 id={`${id}-h`} className="srp-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const PROMISE_ICONS = [ScrollText, Mic, MessagesSquare, FileCheck2] as const;
const ROUND_ICONS = [ListChecks, Mic, MessageSquareQuote, ClipboardCheck] as const;
const SYSTEM_ICONS = [Mic, BrainCircuit, Database, MessageSquareQuote, ClipboardCheck] as const;

export interface ShravansRoundViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * The Shravan's Round origami paper-craft case study (TASK-283; Tushar's brief SR.md + mockup). A layout of its own, chosen by
 * `study.layout === "shravans-round"` in app/work/[slug]/page.tsx (same architecture as Nuptis, TASK-278). Facts come from the
 * records; the product screenshots are the record's own files (never redrawn). Art is decorative, painted on each theme's exact
 * page/band colour. The next-project band is the shared NextProject with the Urja artwork, supporting line and cream light tone passed through its props (TASK-279).
 */
export function ShravansRoundView({ project, study, portfolio, next }: ShravansRoundViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const rows = evidenceRows(project, study);
  const heroMedia = study.hero.media;
  const landing = heroMedia && "poster" in heroMedia ? heroMedia.poster : undefined;
  const shots = product?.shots ?? [];
  const scoreCard = shots[0];
  const phone = shots[1];
  const quote = problem && "quote" in problem ? problem.quote : undefined;
  const trial = study.hero.proofs.find((p) => p.kind === "measured");
  const productShots = [
    scoreCard && { ...scoreCard, key: "score", wide: true },
    landing && { ...landing, key: "landing", wide: false },
    phone && { ...phone, key: "phone", wide: false },
  ].filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <article id={rootId} className="srp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ── */}
        <section id="srp-overview" className="srp-hero" aria-labelledby="cs-h">
          <Container className="srp-hero-in">
            <div className="srp-hero-copy">
              <p className="srp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="srp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="srp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} />
              </h1>
              <p className="srp-tagline">{HERO.tagline}</p>
              <p className="srp-lede">{HERO.lede}</p>
              <div className="srp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="srp-btn srp-btn-primary focus-ring" data-action="live">
                    {HERO.primary}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                <a href="#product" className="srp-btn srp-btn-ghost focus-ring" data-action="see-product">
                  {HERO.secondary}
                </a>
              </div>
            </div>
            <div className="srp-hero-art" style={{ "--ar-l": `${ART.hero.light.w} / ${ART.hero.light.h}`, "--ar-d": `${ART.hero.dark.w} / ${ART.hero.dark.h}` } as CSSProperties}>
              <HeroArt />
            </div>
          </Container>
          <Container>
            <ul className="srp-promises" aria-label="What the round offers">
              {PROMISES.map((item, index) => {
                const Icon = PROMISE_ICONS[index]!;
                return (
                  <li key={item.title} className="srp-promise" data-i={(index % 3) + 1}>
                    <span className="srp-tile" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <span className="srp-promise-t">{item.title}</span>
                    <span className="srp-promise-d">{item.line}</span>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>

        <SrpNav items={NAV} name={project.name} />

        <Container className="srp-body">
          {/* 01 · The product: the record's real screenshots */}
          <Sec id="product" anchors={product?.anchors ?? []} n="01">
            <p className="srp-p">{PRODUCT.lede}</p>
            <div className="srp-shots">
              {productShots.map((shot, index) => (
                <figure key={shot.key} className={`srp-shot${shot.wide ? " srp-shot-wide" : ""}`} data-i={index + 1} data-shot={shot.key}>
                  <div className={`srp-frame${shot.key === "phone" ? " srp-frame-phone" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- the real product screenshot, unmodified, sized */}
                    <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                  </div>
                  <figcaption className="srp-cap">
                    <span className="srp-cap-n" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className="srp-cap-t">{PRODUCT.shots[index]?.title}</span>
                    <span className="srp-cap-d">{PRODUCT.shots[index]?.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Sec>

          {/* 02 · How it works: four folded-paper nodes on a route line */}
          <Sec id="round" anchors={[]} n="02">
            <ol className="srp-route" aria-label="How a round runs">
              {ROUND.map((step, index) => {
                const Icon = ROUND_ICONS[index]!;
                return (
                  <li key={step.title} className="srp-node" data-i={(index % 3) + 1}>
                    <span className="srp-node-n" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="srp-tile" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.6} />
                    </span>
                    <span className="srp-node-t">{step.title}</span>
                    <span className="srp-node-d">{step.line}</span>
                  </li>
                );
              })}
            </ol>
          </Sec>

          {/* 03 · The design decision */}
          <Sec id="decisions" anchors={[...(problem?.anchors ?? []), ...(decisions?.anchors ?? [])]} n="03">
            {quote ? (
              <figure className="srp-quote">
                <Quote aria-hidden="true" focusable="false" size={22} strokeWidth={1.6} className="srp-quote-icon" />
                <blockquote>
                  <p>“{quote.text}”</p>
                </blockquote>
                <figcaption>— {quote.attribution}</figcaption>
              </figure>
            ) : null}
            <ol className="srp-options" aria-label="The avatar options">
              {DECISIONS.considered.map((item) => (
                <li key={item.title} className="srp-option" data-chosen={item.tag === "Chosen" ? "" : undefined}>
                  <span className="srp-option-tag">
                    {item.tag === "Chosen" ? <ShieldCheck aria-hidden="true" focusable="false" size={15} strokeWidth={2} /> : <X aria-hidden="true" focusable="false" size={15} strokeWidth={2} />}
                    {item.tag}
                  </span>
                  <span className="srp-option-t">{item.title}</span>
                </li>
              ))}
            </ol>
            <p className="srp-p">{DECISIONS.reason}</p>
            <div className="srp-decision-foot">
              {trial ? (
                <div className="srp-trial" data-kind={trial.kind}>
                  <p className="srp-trial-v">{DECISIONS.score.value}</p>
                  <p className="srp-trial-l">{DECISIONS.score.label}</p>
                  <p className="srp-trial-f">
                    <EvidenceBadge kind={trial.kind} />
                  </p>
                  <p className="srp-small">{DECISIONS.score.note}</p>
                </div>
              ) : null}
              <aside className="srp-ring" aria-label="Brand cue">
                <span className="srp-wave" aria-hidden="true">
                  {Array.from({ length: 9 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as CSSProperties} />
                  ))}
                </span>
                <div>
                  <p className="srp-ring-t">{DECISIONS.brand.title}</p>
                  <p className="srp-ring-d">{DECISIONS.brand.body}</p>
                </div>
              </aside>
            </div>
          </Sec>

          {/* 04 · System */}
          <Sec id="system" anchors={system?.anchors ?? []} n="04">
            <ol className="srp-flow" aria-label="From a spoken answer to the next question">
              {SYSTEM.steps.map((step, index) => {
                const Icon = SYSTEM_ICONS[index]!;
                return (
                  <li key={step.label} className="srp-flow-step" data-i={(index % 3) + 1}>
                    <Icon aria-hidden="true" focusable="false" size={20} strokeWidth={1.6} />
                    <span className="srp-flow-k">{step.label}</span>
                    <span className="srp-flow-v">{step.note}</span>
                  </li>
                );
              })}
            </ol>
            <div className="srp-system-foot">
              <ul className="srp-chips" aria-label="Stack">
                {SYSTEM.stack.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
              <div className="srp-rules">
                <h3 className="srp-h3">{SYSTEM.rules}</h3>
                <ul>
                  {SYSTEM.ruleLines.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Sec>

          {/* 05 · Evidence */}
          <Sec id="evidence" anchors={outcome?.anchors ?? []} n="05" className="srp-evidence">
            <p className="srp-p">{EVIDENCE.body}</p>
            <div className="srp-evidence-grid">
              <div className="srp-ev srp-ev-yes">
                <h3 className="srp-h3">{EVIDENCE.verified.title}</h3>
                <ul>
                  {EVIDENCE.verified.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="srp-ev srp-ev-no srp-gaps">
                <h3 className="srp-h3">{EVIDENCE.unmeasured.title}</h3>
                <ul>
                  {EVIDENCE.unmeasured.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {outcome && outcome.gaps.length > 1 ? (
              <p className="srp-small srp-limit">
                <Sparkles aria-hidden="true" focusable="false" size={14} strokeWidth={1.8} /> Known limit: {outcome.gaps[1]}
              </p>
            ) : null}
          </Sec>

          {/* Sources and links */}
          <section id="explore" className="srp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="srp-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="srp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="srp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="srp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="srp-tile-icon" />
                      <span className="srp-tile-text">
                        <span className="srp-tile-label">{action.label}</span>
                        <span className="srp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="srp-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            {/* role already says "Team build", so drop meta parts it repeats */}
            <p className="srp-small srp-meta">
              {[
                project.role,
                project.duration,
                ...portfolio.meta.split(" · ").filter((part) => !project.role.toLowerCase().includes(part.toLowerCase())),
              ].join(" · ")}
            </p>
          </section>
        </Container>
      </article>

      {/* Next project: the shared band with the Urja artwork */}
      <NextProject
        project={next}
        art={next.slug === "urja" ? URJA_NEXT_ART : undefined}
        tone={next.slug === "urja" ? "cream" : undefined}
      />
    </>
  );
}
