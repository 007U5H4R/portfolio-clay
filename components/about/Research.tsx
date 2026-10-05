import { papers, patent, researchDisclaimer } from "@/data/credentials";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Tag } from "@/components/common/Tag";
import { Note, Sheet, Tape } from "@/components/paper";

/**
 * Research (TKT-42 → TKT-87, Design.md §7.4, CONTENT_INVENTORY §4.7) — the second `band` row of the
 * `/about` proof section: the granted patent on a taped ivory `Sheet card` with the "TP" stamp
 * (`Note stamp` — the proof section's one decoration besides its torn edge, §3.3), the two papers,
 * and the rights/safety disclaimer.
 *
 * Truth rules (unchanged from TKT-42):
 *   - `patent.number` ("IN 429867") is the only patent number rendered — never the résumé's SL No.
 *   - A paper with `doi` renders a real DOI pill link; one without renders the Inter `Tag`
 *     "DOI pending" (Dev-04: never Caveat), never a link, never a guessed identifier.
 *   - `researchDisclaimer` renders verbatim, unconditionally.
 * Server component.
 */
export function Research() {
  return (
    <div id="research" role="region" aria-labelledby="research-heading" className="proof-band">
      <div className="proof-head">
        <p className="proof-eyebrow" data-micro-label="">Before product management</p>
        <h2 id="research-heading">Research</h2>
        <p className="proof-lead">A granted patent and two peer-reviewed papers from the M.Tech years.</p>
      </div>

      <div>
        <Sheet as="article" variant="card" rotate={-0.5} className="proof-patent">
          <Tape side="r" />
          <Note stamp rotate={5} className="proof-pstamp">
            TP
          </Note>
          <h3>{patent.title}</h3>
          <p className="proof-ids">
            Patent {patent.number} · Application {patent.application} · Filed {patent.filed} · Granted{" "}
            {patent.granted}
          </p>
          <p className="proof-who">
            Patentee: {patent.patentee}. Inventors: {patent.inventors.join(", ")}.
          </p>
          <ExternalLink href={patent.href} className="proof-patent-link">
            View Pratyasa — the patent record
          </ExternalLink>
        </Sheet>

        <ul className="proof-papers">
          {papers.map((paper) => (
            <li key={paper.id}>
              <h3>{paper.title}</h3>
              <p className="proof-cite">
                {paper.authors ? `${paper.authors} ` : ""}
                {paper.journal} {paper.year}
                {paper.volumeIssue ? `, ${paper.volumeIssue}` : ""}
              </p>
              {paper.doi && paper.doiHref ? (
                <ExternalLink href={paper.doiHref} className="proof-doi">
                  DOI {paper.doi}
                </ExternalLink>
              ) : (
                <Tag className="proof-pending">DOI pending</Tag>
              )}
            </li>
          ))}
        </ul>

        <p className="proof-disclaimer">{researchDisclaimer}</p>
      </div>
    </div>
  );
}
