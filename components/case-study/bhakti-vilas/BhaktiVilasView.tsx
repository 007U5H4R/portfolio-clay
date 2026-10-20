import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Eye, Globe, HeartHandshake, PlayCircle, Users } from "lucide-react";
import type { CaseProof, CaseSection, CaseStudy, PortfolioEntry, Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { CaseName } from "@/components/case-study/CaseName";
import { nextLineFor } from "@/components/case-study/NextProject";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import { formatAsOf } from "@/lib/format";
import { CaseMotion } from "@/components/case-study/system/CaseMotion";
import { BadgeLegend, EvidenceBadge } from "@/components/case-study/system/EvidenceBadge";
import { EvidenceDrawer } from "@/components/case-study/system/EvidenceDrawer";
import { accentVars, caseActions, evidenceRows, legendKinds } from "@/components/case-study/system/case-context";
import { BvNav } from "./BvNav";
import { APPROACH, ART, EVIDENCE, HERO, LEARNINGS, NAV, NEXT, PROBLEM, PROTOTYPE, SECTION, SOURCES } from "./copy";

const ART_DIR = "/media/case-studies/bhakti-vilas/art";

type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;

/** A themed pair of paper-craft renditions: the inactive one is `display: none` (never fetched while lazy). */
function ThemedArt({ name, size, eager = false }: { name: string; size: { w: number; h: number }; eager?: boolean }) {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- static feathered WebP from public/, sized, lazy below the fold
        <img
          key={theme}
          src={`${ART_DIR}/${name}-${theme}.webp`}
          data-theme-art={theme}
          alt=""
          aria-hidden="true"
          width={size.w}
          height={size.h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          {...(eager && theme === "light" ? { fetchPriority: "high" as const } : {})}
        />
      ))}
    </>
  );
}

function Anchors({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} id={id} className="bvp-anchor" aria-hidden="true" />
      ))}
    </>
  );
}

/** One numbered story section: number badge on the dashed line, label, the brief's heading as the h2. */
function Sec({ section, n, children, className = "" }: { section: { id: string; anchors: readonly string[] }; n: string; children: ReactNode; className?: string }) {
  const copy = SECTION[section.id]!;
  return (
    <section id={section.id} className={`bvp-sec ${className}`.trim()} aria-labelledby={`${section.id}-h`} data-cs-reveal="">
      <Anchors ids={section.anchors} />
      <span className="bvp-num" aria-hidden="true">
        {n}
      </span>
      <div className="bvp-sec-in">
        <p className="bvp-label">{copy.eyebrow}</p>
        <h2 id={`${section.id}-h`} className="bvp-h2">
          {copy.headline}
        </h2>
        {children}
      </div>
    </section>
  );
}

const LEARNING_ICONS = [Eye, HeartHandshake, Users] as const;

function Proof({ proof, label, className, note = true }: { proof: CaseProof; label: string; className: string; note?: boolean }) {
  return (
    <div className={className} data-kind={proof.kind}>
      <p className={`${className}-value`}>{proof.value}</p>
      <p className={`${className}-label`}>{label}</p>
      <p className="bvp-metric-foot">
        <EvidenceBadge kind={proof.kind} />
        {proof.asOf ? <span className="bvp-date">{formatAsOf(proof.asOf)}</span> : null}
      </p>
      {note && proof.note ? <p className="bvp-metric-note">{proof.note}</p> : null}
    </div>
  );
}

export interface BhaktiVilasViewProps {
  project: Project;
  study: CaseStudy;
  portfolio: PortfolioEntry;
  next: Pick<Project, "slug" | "name">;
}

/**
 * Bhakti Vilas's origami paper-craft case study (TASK-276; Tushar's brief bv.md + mockup). Chosen by
 * `study.layout === "bhakti"` in app/work/[slug]/page.tsx, so no other case study changes (same architecture as the
 * Velora layout, TASK-273). Facts come from the record; the real product screenshots are the record's own shots (never
 * redrawn); the Higgsfield art is decorative, generated on the exact page colour and feathered, two renditions per scene
 * swapped by `[data-theme]`. Only the next-project band names another product (the brief's hard rule).
 */
export function BhaktiVilasView({ project, study, portfolio, next }: BhaktiVilasViewProps) {
  const rootId = `case-${study.slug}`;
  const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind);
  const problem = sec("problem");
  const research = sec("research");
  const decisions = sec("decisions");
  const product = sec("product");
  const learnings = sec("learnings");
  const outcome = sec("outcome");
  const actions = caseActions(project, portfolio);
  const live = actions.find((a) => a.kind === "live");
  const kinds = legendKinds(study);
  const rows = evidenceRows(project, study);
  const heroMedia = study.hero.media;
  const heroShot = heroMedia && "src" in heroMedia ? heroMedia : undefined;
  const gallery = product?.shots.filter((shot) => shot.frame !== "print") ?? [];
  const funnel = product?.shots.find((shot) => shot.frame === "print");
  const types = [...new Set(study.evidence.map((item) => item.type))];

  return (
    <>
      <article id={rootId} className="bvp" data-motion-root="" style={accentVars(study.theme.accents)}>
        <CaseMotion rootId={rootId} />

        {/* ── Hero ─────────────────────────────────────────────────────────────────────────── */}
        <section id="bvp-overview" className="bvp-hero" aria-labelledby="cs-h">
          <Container className="bvp-hero-in">
            <div className="bvp-hero-copy">
              <p className="bvp-crumb">
                <Link href="/projects" className="focus-ring" data-inline-link="">
                  Portfolio
                </Link>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </p>
              <p className="bvp-kicker">{HERO.kicker}</p>
              <h1 id="cs-h" className="bvp-h1" style={{ viewTransitionName: `project-${project.slug}` }}>
                <CaseName slug={project.slug} name={project.name} />
              </h1>
              <p className="bvp-tagline">{study.hero.tagline}</p>
              <p className="bvp-lede">{HERO.description}</p>
              <ul className="bvp-tags" aria-label="Focus">
                {HERO.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="bvp-cta">
                {live ? (
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="bvp-btn bvp-btn-primary focus-ring" data-action="live">
                    {HERO.cta}
                    <ArrowRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="bvp-hero-art">
              <div className="bvp-hero-scene">
                <ThemedArt name="hero" size={ART.hero} eager />
                {heroShot ? (
                  <figure className="bvp-hero-screen">
                    <div className="bvp-bar" aria-hidden="true">
                      <i /> <i /> <i />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element -- the real Bhakti Vilas screenshot, unmodified */}
                    <img src={heroShot.src} alt={heroShot.alt} width={heroShot.width} height={heroShot.height} loading="eager" decoding="async" />
                  </figure>
                ) : null}
              </div>
            </div>
          </Container>
          <Container className="bvp-metrics-wrap">
            <ul className="bvp-metrics" aria-label="Bhakti Vilas in numbers">
              {study.hero.proofs.map((proof, index) => (
                <li key={proof.label}>
                  <Proof proof={proof} label={HERO.proofLabels[index] ?? proof.label} className="bvp-metric" />
                </li>
              ))}
            </ul>
            <BadgeLegend kinds={kinds} />
          </Container>
        </section>

        <BvNav items={NAV} name={project.name} />

        <Container className="bvp-body">
          {/* 01 · The problem (the team research sits inside it) */}
          {problem ? (
            <Sec section={problem} n="01">
              <ul className="bvp-pcards">
                {PROBLEM.cards.map((card, index) => (
                  <li key={card.k} className="bvp-pcard" data-i={index + 1}>
                    <h3 className="bvp-h3">{card.k}</h3>
                    <p className="bvp-card-p">{card.v}</p>
                  </li>
                ))}
              </ul>
              {problem.quote ? (
                <figure className="bvp-quote">
                  <blockquote>“{problem.quote.text}”</blockquote>
                  <figcaption>{PROBLEM.quoteLabel}</figcaption>
                </figure>
              ) : null}
              {research ? (
                <div id="research" className="bvp-research">
                  <Anchors ids={research.anchors} />
                </div>
              ) : null}
            </Sec>
          ) : null}

          {/* 02 · The approach: four paper steps, then the two decisions */}
          {decisions ? (
            <Sec section={decisions} n="02">
              <ol className="bvp-path" aria-label="How Bhakti Vilas works">
                {APPROACH.steps.map((step, index) => (
                  <li key={step.k} className="bvp-pstep" data-i={index + 1}>
                    <ThemedArt name={`obj-${step.art}`} size={ART.obj} />
                    <span className="bvp-pstep-k">{step.k}</span>
                    <span className="bvp-pstep-v">{step.v}</span>
                  </li>
                ))}
              </ol>
              <div className="bvp-coded">
                <h3 className="bvp-h3">{APPROACH.coded}</h3>
                <ul className="bvp-coded-list">
                  {decisions.items.map((item) => (
                    <li key={item.chose}>
                      <span className="bvp-coded-chose">{item.chose}</span>
                      <span className="bvp-coded-because">{item.because}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Sec>
          ) : null}

          {/* 03 · The prototype: the record's real screenshots */}
          {product ? (
            <Sec section={product} n="03">
              <p className="bvp-p">{PROTOTYPE.lede}</p>
              <ol className="bvp-flow" aria-label={PROTOTYPE.flowLabel}>
                {product.flow?.steps.map((step) => (
                  <li key={step.label} className="bvp-flow-step">
                    {step.label}
                  </li>
                ))}
              </ol>
              <div className="bvp-shots">
                {gallery.map((shot, index) => (
                  <figure key={shot.src} className="bvp-shot" data-i={index + 1} data-frame={shot.frame}>
                    <div className="bvp-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element -- the real product screenshot, unmodified, sized */}
                      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                    </div>
                    <figcaption className="bvp-cap">{PROTOTYPE.captions[index] ?? shot.caption}</figcaption>
                  </figure>
                ))}
              </div>
              {funnel ? (
                <figure className="bvp-funnel">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Tushar's own funnel diagram, unmodified */}
                  <img src={funnel.src} alt={funnel.alt} width={funnel.width} height={funnel.height} loading="lazy" decoding="async" />
                  <figcaption className="bvp-qualifier">{APPROACH.funnelLabel}</figcaption>
                </figure>
              ) : null}
              <p className="bvp-small">{product.summary}</p>
              {live ? (
                <p>
                  <a href={live.href} target="_blank" rel="noopener noreferrer" className="bvp-btn bvp-btn-primary focus-ring" data-action="live-proto">
                    {PROTOTYPE.cta}
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={2} />
                    <span className="sr-only"> {NEW_TAB_HINT}</span>
                  </a>
                </p>
              ) : null}
            </Sec>
          ) : null}

          {/* 04 · Evidence: research findings and prototype checks, kept apart */}
          {outcome ? (
            <Sec section={outcome} n="04" className="bvp-evidence">
              <p className="bvp-p">{outcome.intro}</p>
              <div className="bvp-evidence-grid">
                <div className="bvp-panel" data-panel="research">
                  <h3 className="bvp-h3">{EVIDENCE.researchTitle}</h3>
                  <p className="bvp-chip">{EVIDENCE.researchChip}</p>
                  <ul className="bvp-plist">
                    {research?.insight ? <li>{research.insight.text}</li> : null}
                    {research?.quotes[1] ? (
                      <li>
                        “{research.quotes[1].text}” <span className="bvp-small">{research.quotes[1].attribution}</span>
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className="bvp-panel" data-panel="prototype">
                  <h3 className="bvp-h3">{EVIDENCE.prototypeTitle}</h3>
                  <p className="bvp-chip">{EVIDENCE.prototypeChip}</p>
                  <ul className="bvp-stats">
                    {outcome.proofs.map((proof) => (
                      <li key={proof.label}>
                        <Proof proof={proof} label={proof.label} className="bvp-stat" />
                      </li>
                    ))}
                  </ul>
                  <p className="bvp-small">{EVIDENCE.checks}</p>
                </div>
                {outcome.gaps.length > 0 ? (
                  <div className="bvp-gaps">
                    <h3 className="bvp-h3">{EVIDENCE.gaps}</h3>
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

          {/* 05 · Learnings */}
          {learnings ? (
            <Sec section={learnings} n="05">
              <ol className="bvp-cards">
                {LEARNINGS.map((item, index) => {
                  const Icon = LEARNING_ICONS[index] ?? BadgeCheck;
                  return (
                    <li key={item.title} className="bvp-card" data-i={index + 1}>
                      <span className="bvp-tile" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <p className="bvp-card-n" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="bvp-h3">{item.title}</h3>
                      <p className="bvp-card-p">{item.body}</p>
                    </li>
                  );
                })}
              </ol>
            </Sec>
          ) : null}

          {/* Sources and artifacts */}
          <section id="explore" className="bvp-sources" aria-labelledby="explore-h" data-cs-reveal="">
            <p className="bvp-label">{SOURCES.chip}</p>
            <h2 id="explore-h" className="bvp-h2">
              {SOURCES.headline}
            </h2>
            <ul className="bvp-types" aria-label="Artifact types behind this page">
              {types.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
            <ul className="bvp-tiles">
              {actions.map((action) => {
                const Icon = action.kind === "live" ? Globe : PlayCircle;
                return (
                  <li key={action.kind}>
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="bvp-tile-link focus-ring" data-action={action.kind}>
                      <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="bvp-tile-icon" />
                      <span className="bvp-tile-text">
                        <span className="bvp-tile-label">{action.label}</span>
                        <span className="bvp-tile-hint">{action.hint}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                      <span className="sr-only"> {NEW_TAB_HINT}</span>
                    </a>
                  </li>
                );
              })}
              {rows.length > 0 ? (
                <li className="bvp-tile-drawer">
                  <EvidenceDrawer rows={rows} name={project.name} />
                </li>
              ) : null}
            </ul>
            <p className="bvp-small bvp-meta">{[project.role, project.duration, portfolio.meta].join(" · ")}</p>
          </section>
        </Container>
      </article>

      {/* ── Next project: the only place another product is named; a paper-craft biosensor for Pratyasa ── */}
      <section className="bvp-next next-band" aria-label="Next project">
        <div className="bvp-next-art next-band-art" aria-hidden="true">
          <ThemedArt name="footer" size={ART.footer} />
        </div>
        <Container className="bvp-next-in next-band-in">
          <ViewTransitionLink
            href={`/work/${next.slug}`}
            transitionName={`project-${next.slug}`}
            aria-label={`Next project: ${next.name} ${NEW_TAB_HINT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bvp-next-link next-band-link"
          >
            <span className="bvp-next-eyebrow next-band-eyebrow">{NEXT.eyebrow}</span>
            <h2 className="bvp-next-h next-band-h">
              <CaseName slug={next.slug} name={next.name} /> <span aria-hidden="true">→</span>
            </h2>
            {nextLineFor(next.slug) ? <span className="bvp-next-line next-band-line">{nextLineFor(next.slug)}</span> : null}
          </ViewTransitionLink>
        </Container>
      </section>
    </>
  );
}
