import { Container } from "@/components/layout/Container";
import { TornEdge } from "@/components/paper";
import type { Certification } from "@/data/certifications";
import { CredentialLink } from "./CredentialLink";
import { IssuerIcon } from "./Doodles";

/**
 * MoreCredentials (TKT-102) — every other badge on Tushar's Credly profile (the reference image shows
 * five; Credly lists 22). Two labelled shelves, newest first — certifications, then Google Cloud skill
 * badges — of small paper tiles. Same interaction contract as the timeline: each tile IS the `<a>` to
 * its individual credential (new tab, `aria-label`, focus ring, ≥ 44 px, always-visible "View
 * credential ↗"). No sticky notes here: these badges carry no "applied" copy (`applied: null`), and
 * their skills are a verbatim subset of Credly's list.
 *
 * EVAL-018: `section#more-credentials` counts 1 (the torn top). The tiles are content paper.
 */

function Tile({ cert }: { cert: Certification }) {
  const skillsId = `${cert.slug}-skills`;
  const metaId = `${cert.slug}-meta`;
  return (
    <li className="certm-item">
      <CredentialLink
        name={cert.name}
        issuer={cert.issuer}
        year={cert.year}
        credentialUrl={cert.credentialUrl}
        describedBy={[metaId, cert.skills.length > 0 ? skillsId : ""].filter(Boolean).join(" ")}
        className="certm-tile focus-ring"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="certm-badge" src={cert.badge} alt="" width={240} height={240} loading="lazy" decoding="async" />
        <div className="certm-text">
          <h4 className="certm-name">{cert.name}</h4>
          <p id={metaId} className="certm-meta">
            <IssuerIcon />
            <span className="sr-only">Issued by </span>
            {cert.issuer} · <time dateTime={cert.issued}>{cert.year}</time>
          </p>
          {cert.skills.length > 0 ? (
            <p id={skillsId} className="certm-skills">
              {cert.skills.join(" · ")}
            </p>
          ) : null}
          <p className="cert-cta font-hand" data-hand="cta">
            View credential <span className="cert-cta-arrow">↗</span>
          </p>
        </div>
      </CredentialLink>
    </li>
  );
}

export interface MoreCredentialsProps {
  certifications: Certification[];
}

export function MoreCredentials({ certifications }: MoreCredentialsProps) {
  const groups = [
    { id: "more-certifications", title: "Certifications", items: certifications.filter((c) => c.kind === "certification") },
    { id: "skill-badges", title: "Skill badges", items: certifications.filter((c) => c.kind === "skill-badge") },
  ].filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <section id="more-credentials" aria-labelledby="more-credentials-heading" className="certm">
      <TornEdge fill="paper-2" />
      <div className="certm-body">
        <Container className="certm-wrap">
          <h2 id="more-credentials-heading" className="certm-heading">
            More on Credly
          </h2>
          <p className="certm-lead">Every other badge on my Credly profile, newest first. Each one opens its credential.</p>
          {groups.map((g) => (
            <div key={g.id} className="certm-group">
              <h3 id={`${g.id}-heading`} className="certm-group-title" data-micro-label="">
                {g.title} · {g.items.length}
              </h3>
              <ul className="certm-grid" aria-labelledby={`${g.id}-heading`}>
                {g.items.map((c) => (
                  <Tile key={c.slug} cert={c} />
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
}
