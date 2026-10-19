import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, AudioWaveform, Cpu, Dices, GitBranch, Gamepad2, Globe, Keyboard, Layers, Lock, MonitorPlay, PlayCircle, Rocket } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows } from "@/components/case-study/system/case-context";
import { NextProject } from "@/components/case-study/NextProject";
import { SgNav } from "./SgNav";
import { ART, DECISIONS, EVIDENCE, HERO, NAV, SECTION, SHOTS, SHRAVAN_NEXT_ART, SHRAVAN_NEXT_LINE, SOURCES, SYSTEM, WHY } from "./copy";

const ART_DIR = "/media/case-studies/slag-city/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** A decorative paper-craft rendition per theme, painted on that theme's page colour; the inactive one is display:none. */
function ThemeArt({ name, w, h, eager = false }: { name: "hero" | "sign"; w: number; h: number; eager?: boolean }) {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static pre-sized WebP from public/, one per theme
        <img
          key={theme}
          src={`${ART_DIR}/${name}-${theme}.webp`}
          data-theme-art={theme}
          alt=""
          aria-hidden="true"
          width={w}
          height={h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="sgp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered chapter: a folded-paper rosette on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`sgp-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="sgp-num" aria-hidden="true">
        {n}
      </span>
      <div className="sgp-sec-in">
        <p className="sgp-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="sgp-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const DECISION_ICONS = [Dices, Gamepad2, AudioWaveform] as const;
const SYSTEM_ICONS = [Keyboard, Layers, Cpu, MonitorPlay, AudioWaveform] as const;

function Stat({ proof }: { proof: CaseProof }) {
  return (
    <div className="sgp-stat" data-kind={proof.kind}>
      <p className="sgp-stat-value">{proof.value}</p>
      <p className="sgp-stat-label">{proof.label}</p>
      <p className="sgp-stat-foot">
        <EvidenceBadge kind={proof.kind} />
      </p>
    </div>
  );
}

export interface SlagCityViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Slag City's arcade paper-craft case study (TASK-282; Tushar's brief sc.md + mockups). A Slag City-only layout, chosen by
 * `study.layout === "slagcity"` in app/work/[slug]/page.tsx (same architecture as Nuptis, TASK-278). Facts come from the record;
 * the real game screenshots are the record's own files (never redrawn). The arcade cabinet frame is CSS around the real attract
 * screen; the scenery is decorative art painted on each theme's exact page colour. The next-project band is the shared
 * NextProject with The Shravan's Round artwork.
 */
export function SlagCityView({ project, study, portfolio, next }: SlagCityViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const product = sec("product");
  const decisions = sec("decisions");
  const system = sec("system");
  const outcome = sec("outcome");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const github = actions.find((a) => a.kind === "github");
  const rows = evidenceRows(project, study);
  const heroMedia = study.hero.media;
  const heroShot = heroMedia && "poster" in heroMedia ? heroMedia.poster : heroMedia && "src" in heroMedia ? heroMedia : undefined;
  const [combat, cont, phone] = product?.shots ?? [];
  const galleryShots = [combat, cont, phone];
  const quote = problem?.quote;
  const chips = study.evidence.map((item) => item.type);

  return (
    <>
      <article id={rootId} className="sgp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ── */}
        <section id="sgp-overview" className="sgp-hero" aria-labelledby="cs-h">
          <Container className="sgp-hero-in">
            <div className="sgp-hero-copy">
              <p className="sgp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="sgp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="sgp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                {project.name}
              </h1>
              <p className="sgp-tagline">{HERO.tagline}</p>
              <p className="sgp-lede">{HERO.lede}</p>
              <ul className="sgp-stats" aria-label="Slag City in numbers">
                {study.hero.proofs.map((proof) => (
                  <li key={proof.label}>
                    <Stat proof={proof} />
                  </li>
                ))}
              </ul>
              <div className="sgp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="sgp-btn sgp-btn-primary focus-ring" data-action="live">
                    Play Slag City
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
                {github ? (
                  <a href={github.href} target="_blank" rel="noopener noreferrer" className="sgp-btn sgp-btn-ghost focus-ring" data-action="github">
                    View source
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="sgp-hero-visual" style={{ "--ar": `${ART.hero.w} / ${ART.hero.h}` } as CSSProperties}>
              {heroShot ? (
                <figure className="sgp-cabinet">
                  <div className="sgp-marquee" aria-hidden="true">
                    SLAG CITY
                  </div>
                  <div className="sgp-bezel">
                    {/* eslint-disable-next-line @next/next/no-img-element -- the real Slag City attract screen, unmodified */}
                    <img src={heroShot.src} alt={heroShot.alt} width={heroShot.width} height={heroShot.height} loading="eager" decoding="async" fetchPriority="high" />
                  </div>
                  <div className="sgp-deck" aria-hidden="true">
                    <span className="sgp-stick" />
                    <span className="sgp-btnrow">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </figure>
              ) : null}
              <div className="sgp-hero-art">
                <ThemeArt name="hero" w={ART.hero.w} h={ART.hero.h} eager />
              </div>
            </div>
          </Container>
        </section>

        <SgNav items={NAV} name={project.name} />

        <Container className="sgp-body">
          {/* 01 · Why it exists */}
          {problem ? (
            <Sec section={problem} n="01">
              <p className="sgp-p">{problem.context}</p>
              <div className="sgp-why">
                <div className="sgp-why-flow">
                  <div className="sgp-why-card" data-side="constraint">
                    <span className="sgp-tile" aria-hidden="true">
                      <Lock size={22} strokeWidth={1.6} />
                    </span>
                    <p className="sgp-why-tag">{WHY.constraint.tag}</p>
                    <h3 className="sgp-h3">{WHY.constraint.title}</h3>
                    <p className="sgp-card-p">{WHY.constraint.note}</p>
                  </div>
                  <span className="sgp-why-arrow" aria-hidden="true">
                    <ArrowRight size={22} strokeWidth={2} />
                  </span>
                  <div className="sgp-why-card" data-side="decision">
                    <span className="sgp-tile" aria-hidden="true">
                      <Rocket size={22} strokeWidth={1.6} />
                    </span>
                    <p className="sgp-why-tag">{WHY.decision.tag}</p>
                    <h3 className="sgp-h3">{WHY.decision.title}</h3>
                    <p className="sgp-card-p">{WHY.decision.note}</p>
                  </div>
                </div>
                <div className="sgp-why-side">
                  {quote ? (
                    <figure className="sgp-quote">
                      <blockquote>
                        <p>{quote.text}</p>
                      </blockquote>
                      <figcaption>— {quote.attribution}</figcaption>
                    </figure>
                  ) : null}
                  <div className="sgp-sign">
                    <ThemeArt name="sign" w={ART.sign.w} h={ART.sign.h} />
                  </div>
                </div>
              </div>
            </Sec>
          ) : null}

          {/* 02 · The game: the record's real screenshots */}
          {product ? (
            <Sec section={product} n="02">
              <p className="sgp-p">{product.summary}</p>
              <div className="sgp-shots">
                {galleryShots.map((shot, index) =>
                  shot ? (
                    <figure key={shot.src} className="sgp-shot" data-i={index + 1}>
                      <div className="sgp-frame" data-frame={shot.frame}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- the real game screenshot, unmodified, sized */}
                        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                      </div>
                      <figcaption className="sgp-cap">
                        <span className="sgp-cap-t">{SHOTS[index]?.title ?? shot.caption}</span>
                        <span className="sgp-cap-d">{SHOTS[index]?.note ?? ""}</span>
                      </figcaption>
                    </figure>
                  ) : null,
                )}
              </div>
            </Sec>
          ) : null}

          {/* 03 · Decisions */}
          {decisions ? (
            <Sec section={decisions} n="03">
              <ol className="sgp-cards">
                {decisions.items.map((item, index) => {
                  const Icon = DECISION_ICONS[index] ?? Dices;
                  return (
                    <li key={item.chose} className="sgp-card" data-i={index + 1}>
                      <span className="sgp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <h3 className="sgp-h3">{DECISIONS[index]?.title ?? item.chose}</h3>
                      <dl className="sgp-dl">
                        <div>
                          <dt>Could have</dt>
                          <dd>{item.could}</dd>
                        </div>
                        <div>
                          <dt>Chose</dt>
                          <dd>{item.chose}</dd>
                        </div>
                        <div>
                          <dt>Because</dt>
                          <dd>{item.because}</dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* 04 · How it works */}
          {system ? (
            <Sec section={system} n="04">
              <div className="sgp-system">
                <ol className="sgp-flow" aria-label="A button press through Slag City">
                  {system.steps.map((step, index) => {
                    const Icon = SYSTEM_ICONS[index] ?? Cpu;
                    const copy = SYSTEM.steps[index];
                    return (
                      <li key={step.label} className="sgp-flow-step" data-i={index + 1}>
                        <span className="sgp-flow-n" aria-hidden="true">
                          {index + 1}
                        </span>
                        <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.6} />
                        <span className="sgp-flow-k">{copy?.label ?? step.label}</span>
                        <span className="sgp-flow-v">{copy?.note ?? step.note}</span>
                      </li>
                    );
                  })}
                </ol>
                <div className="sgp-rules">
                  <h3 className="sgp-h3">{SYSTEM.rules}</h3>
                  <ul>
                    {system.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Sec>
          ) : null}

          {/* 05 · Evidence */}
          {outcome ? (
            <Sec section={outcome} n="05" className="sgp-evidence">
              <div className="sgp-evidence-grid">
                <p className="sgp-p">{outcome.intro}</p>
                {outcome.gaps.length > 0 ? (
                  <div className="sgp-gaps">
                    <h3 className="sgp-h3">{EVIDENCE.gaps}</h3>
                    <ul>
                      {outcome.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Sec>
          ) : null}

          {/* Sources and links */}
          <section id="explore" className="sgp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="sgp-label">{SOURCES.eyebrow}</p>
            <h2 id="explore-h" className="sgp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="sgp-chips" aria-label="Artifact types behind this page">
              {chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
            <p className="sgp-label sgp-label-2">{SOURCES.links}</p>
            <ul className="sgp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : action.kind === "github" ? GitBranch : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="sgp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="sgp-tile-icon" />
                      <span className="sgp-tile-text">
                        <span className="sgp-tile-label">{action.label}</span>
                        <span className="sgp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="sgp-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="sgp-small sgp-meta">{[project.role, project.duration, portfolio.meta].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* Next project: the shared band with The Shravan's Round artwork */}
      <NextProject project={next} art={next.slug === "shravans-round" ? SHRAVAN_NEXT_ART : undefined} line={next.slug === "shravans-round" ? SHRAVAN_NEXT_LINE : undefined} />
    </>
  );
}
