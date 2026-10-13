"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { EnterpriseCase } from "@/data/schema";
import { enterpriseArt, enterpriseHeaderArt, type EnterpriseArt } from "@/data/enterprise-art";
import { Container } from "@/components/layout/Container";
import { Annotation, Sheet, TornEdge } from "@/components/paper";
import { formatRange } from "@/lib/format";

export interface EnterpriseClientWorkProps {
  cases: readonly EnterpriseCase[];
}

const MEDIA = "/media/enterprise-work";
/** The longest signature (last delay + its 900 ms ride + settle): after this the card is back at rest. */
const PLAY_MS = 1500;

/** The technical-scope line on a card face: the first three verified tags of the record (`data/enterprise.ts`). */
export function scopeTags(item: EnterpriseCase): string[] {
  return item.tags.slice(0, 3);
}

function pct(n: number): string {
  return `${n}%`;
}

/** `clip-path` that keeps only `rect` (a movable layer). */
function keep([x, y, w, h]: readonly [number, number, number, number]): string {
  return `inset(${pct(y)} ${pct(100 - x - w)} ${pct(100 - y - h)} ${pct(x)})`;
}

/** `clip-path` that removes `rect` from the still base (the lifted layer leaves open paper behind it). */
function punch([x, y, w, h]: readonly [number, number, number, number]): string {
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${pct(x)} ${pct(y)}, ${pct(x + w)} ${pct(y)}, ${pct(x + w)} ${pct(y + h)}, ${pct(x)} ${pct(y + h)}, ${pct(x)} ${pct(y)})`;
}

/** One theme pair of the same cutout: both are lazy, and only the one for the active theme is ever laid out (and fetched). */
function ArtImage({ dir, alt, className, style }: { dir: string; alt: string; className?: string; style?: CSSProperties }) {
  const decorative = alt === "";
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised WebP cutouts, no remote loader */}
      <img
        className={["ee-img", "ee-l", className].filter(Boolean).join(" ")}
        src={`${MEDIA}/${dir}/light.webp`}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={style}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={["ee-img", "ee-d", className].filter(Boolean).join(" ")}
        src={`${MEDIA}/${dir}/dark.webp`}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={style}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
    </>
  );
}

/** The miniature: a still base plus a few clipped copies that move on their own, SVG connectors that draw, restrained marks. */
function Miniature({ art }: { art: EnterpriseArt }) {
  const holes = art.parts.filter((p) => p.hole);
  const baseClip = holes.length > 0 ? punch(holes[0]!.rect) : undefined;
  return (
    <div className="ee-art" style={{ "--ar": art.ratio } as CSSProperties}>
      <ArtImage dir={art.dir} alt={art.alt} className="ee-base" {...(baseClip ? { style: { clipPath: baseClip } } : {})} />
      {art.parts.map((part, i) => (
        <span
          key={i}
          className="ee-part"
          aria-hidden="true"
          {...(part.hover ? { "data-hover": "" } : {})}
          style={
            {
              clipPath: keep(part.rect),
              "--dx": `${part.dx ?? 0}px`,
              "--dy": `${part.dy}px`,
              "--d": `${part.delay}ms`,
            } as CSSProperties
          }
        >
          <ArtImage dir={art.dir} alt="" />
        </span>
      ))}
      {art.connectors.length > 0 ? (
        <svg className="ee-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {art.connectors.map((c) => (
            <path key={c.d} d={c.d} pathLength={1} vectorEffect="non-scaling-stroke" style={{ "--d": `${c.delay}ms` } as CSSProperties} />
          ))}
        </svg>
      ) : null}
      {art.marks.map((m, i) => (
        <span
          key={i}
          className="ee-mark"
          aria-hidden="true"
          style={
            {
              left: pct(m.rect[0]),
              top: pct(m.rect[1]),
              width: pct(m.rect[2]),
              height: pct(m.rect[3]),
              "--d": `${m.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

interface CardProps {
  item: EnterpriseCase;
  index: number;
  open: boolean;
  onToggle: (id: string) => void;
}

function Card({ item, index, open, onToggle }: CardProps) {
  const art = enterpriseArt[item.id];
  const root = useRef<HTMLLIElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const num = String(index + 1).padStart(2, "0");
  const panelId = `ee-panel-${item.id}`;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Plays the signature once per activation; a repeat press restarts it cleanly (attribute off, reflow, on). */
  const play = useCallback(() => {
    const el = root.current;
    if (!el) return;
    window.clearTimeout(timer.current);
    el.removeAttribute("data-play");
    void el.offsetWidth;
    el.setAttribute("data-play", "");
    timer.current = window.setTimeout(() => el.removeAttribute("data-play"), PLAY_MS);
  }, []);

  return (
    <li ref={root} className="ee-item" data-case={item.id} {...(open ? { "data-open": "" } : {})}>
      <Sheet as="article" variant="card" className="ee-card">
        <span className="ee-shade" aria-hidden="true" />
        <span className="ee-pin" aria-hidden="true" />
        <div className="ee-face">
          <p className="ee-num">
            <span className="ee-num-label">No.</span> {num}
          </p>
          <div className="ee-stage">{art ? <Miniature art={art} /> : null}</div>
          <div className="ee-body">
            <h3 className="ee-client">{item.client}</h3>
            <p className="ee-program">{item.program}</p>
            <p className="ee-scope" aria-label="Technical scope">
              {scopeTags(item).map((tag, i) => (
                <span key={tag}>
                  {i > 0 ? <span aria-hidden="true"> · </span> : null}
                  {tag}
                </span>
              ))}
            </p>
            <button
              type="button"
              className="ee-open focus-ring"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => {
                if (!open) play();
                onToggle(item.id);
              }}
            >
              <span className="ee-open-label">{open ? "Close case file" : "Open case file"}</span>
              <span className="ee-open-arrow" aria-hidden="true">
                {open ? "−" : "→"}
              </span>
              <span className="sr-only"> — {item.client}</span>
            </button>
          </div>
        </div>
        <div id={panelId} className="ee-dossier" hidden={!open}>
          <p className="ee-role">
            <span className="ee-kicker">Role</span> {item.role} · {formatRange(item.period)}
          </p>
          <h4 className="ee-sub">Overview</h4>
          <p className="ee-summary">{item.summary}</p>
          {item.workstreams.length > 0 ? (
            <>
              <h4 className="ee-sub">Workstreams</h4>
              <ul className="pf-case-streams ee-streams" aria-label="Sub-projects">
                {item.workstreams.map((stream) => (
                  <li key={stream.name}>
                    <strong>{stream.name}</strong>
                    <span>{stream.detail}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <h4 className="ee-sub">Technical scope</h4>
          <ul className="pf-case-tags ee-tags" aria-label="Tags">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className="ee-concept">The paper model is a conceptual illustration, not the client&apos;s architecture.</p>
        </div>
      </Sheet>
    </li>
  );
}

/**
 * Section 2 — Enterprise & Client Work, the "Enterprise Field Journal" (TASK-204, Tushar's spec 2026-10-13; EXE-80).
 * A paper-dossier cover (category tab, heading, one supporting line, the existing description, a restrained paper
 * still life on wide screens) over six paper-craft case cards. Every fact on a card comes from `data/enterprise.ts`
 * (client, program, scope tags, role, dates, summary, workstreams); the art, its alt text and its motion come from
 * `data/enterprise-art.ts` and carry no facts.
 *
 * No case-study route exists for enterprise work (client names stay on /projects, TASK-116 spec §34), so State E is
 * an in-card dossier: the card's one action is a disclosure button (`aria-expanded`) that pins the card, plays its
 * signature once and opens the full record beside the art. It is not a modal and not a new navigation model; the
 * title and action are keyboard reachable and nothing is hover-only. Only one dossier is open at a time.
 *
 * EVAL-018 (Design.md §3.3 `/projects` enterprise): torn · annotation = 2 (the pin, tab and folded corner are the
 * card's own material, not decorations).
 */
export function EnterpriseClientWork({ cases }: EnterpriseClientWorkProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = useCallback((id: string) => setOpenId((current) => (current === id ? null : id)), []);
  return (
    <section id="enterprise" className="pf-enterprise ee-journal" aria-labelledby="pf-enterprise-h">
      <TornEdge fill="paper-2" />
      <Container className="pf-ent-wrap">
        <header className="pf-ent-intro ee-cover">
          <p className="pf-eyebrow ee-tab">Enterprise field journal</p>
          <h2 id="pf-enterprise-h" className="pf-ent-h">
            Enterprise &amp; Client Work
          </h2>
          <p className="ee-lede">Complex systems. Real delivery constraints.</p>
          <p className="pf-ent-sub">
            Cloud, data, APIs, healthcare, analytics and ML programs delivered across enterprise environments.
          </p>
          <Annotation arrow="down" rotate={-2} className="pf-ent-note">
            inside larger systems
          </Annotation>
          <div className="ee-cover-art" aria-hidden="true" style={{ "--ar": enterpriseHeaderArt.ratio } as CSSProperties}>
            <ArtImage dir={enterpriseHeaderArt.dir} alt="" />
          </div>
        </header>
        <ol className="pf-cases ee-grid" aria-label="Enterprise case files">
          {cases.map((item, index) => (
            <Card key={item.id} item={item} index={index} open={openId === item.id} onToggle={toggle} />
          ))}
        </ol>
      </Container>
    </section>
  );
}
