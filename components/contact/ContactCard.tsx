import Image from "next/image";
import { ArrowUpRight, Download, FileText, Mail, MapPin } from "lucide-react";
import { CopyButton } from "@/components/common/CopyButton";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { showGithub } from "@/components/layout/BandFooter";
import { deckle } from "@/components/home/deckle";
import { Hand } from "@/components/paper/Hand";
import { Sheet } from "@/components/paper/Sheet";
import { contactResumeLink, site } from "@/lib/site";
import portrait from "@/content/media/portrait/tushar-stamp.webp";

/** Seeded torn outlines (rim + face) for the card — stable across renders, like every deckled card. */
const EDGES = {
  rim: deckle(1131, { across: 22, down: 12, depthX: 0.9, depthY: 1.6 }),
  face: deckle(1137, { across: 22, down: 12, depthX: 1, depthY: 1.8, insetX: 0.8, insetY: 1.4 }),
};

/**
 * EMAIL block (spec §9–§10): the address from the single source (`site.email`, never hard-coded),
 * in Fraunces, with the compact `CopyButton` on its right (idle "Copy" → "Copied" + check 2 s →
 * idle; error → "Copy failed" + the selectable fallback; sr-only live region — unchanged machine).
 */
export function EmailBlock() {
  return (
    <div className="cx-email">
      <p className="cx-label">
        <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
        Email
      </p>
      <div className="cx-email-row">
        <span className="cx-addr">{site.email}</span>
        <CopyButton value={site.email} name="email address" className="cx-copy" />
      </div>
    </div>
  );
}

/** The primary action (spec §11): a real `mailto:` in the rust CTA pill, Caveat `data-hand="cta"`. */
export function PrimaryContactCTA() {
  return (
    <a className="cx-btn cx-btn-primary focus-ring" href={`mailto:${site.email}`}>
      <Hand kind="cta">
        Email me <span className="cx-btn-arrow">→</span>
      </Hand>
    </a>
  );
}

/**
 * Secondary actions (spec §12–§13): LinkedIn (external, `target=_blank rel="noopener noreferrer"` +
 * sr-only "(opens in new tab)") and the résumé from `contactResumeLink()` — "Resume ↓" once
 * `site.resumeAvailable` flips, "Resume — available on request" (mailto with a subject) until then.
 * GitHub joins only under the band's S5 rule (`showGithub()`). `#resume` stays the target the
 * site-wide résumé placeholder (`resumeAction()` → `/contact#resume`) lands on.
 */
export function SecondaryContactLinks() {
  const resume = contactResumeLink();
  const github = showGithub();

  return (
    <div className="cx-secondary" data-contact-secondary="">
      <a
        className="cx-btn cx-btn-secondary focus-ring"
        data-link="linkedin"
        href={site.linkedin}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="cx-in" aria-hidden="true">
          in
        </span>
        <span className="cx-btn-text">LinkedIn ↗</span>
        <VisuallyHidden>(opens in new tab)</VisuallyHidden>
      </a>
      <a
        id="resume"
        className="cx-btn cx-btn-secondary focus-ring"
        data-link="resume"
        href={resume.href}
        download={resume.download || undefined}
      >
        {resume.download ? (
          <Download className="cx-btn-down" size={18} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
        <span className="cx-btn-text">{resume.label}</span>
      </a>
      {github ? (
        <a
          className="cx-btn cx-btn-secondary focus-ring"
          data-link="github"
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="cx-btn-text">GitHub ↗</span>
          <VisuallyHidden>(opens in new tab)</VisuallyHidden>
        </a>
      ) : null}
    </div>
  );
}

/**
 * The postage stamp on the card (TASK-111, Tushar 2026-09-27: "replace contact postcard stamp with my
 * original image and put post card stamp border as my image border"): his real headshot
 * (`content/media/portrait/tushar-stamp.webp`, re-encoded from `portfolio/photo.jpg` with no metadata)
 * inside a perforated stamp margin, top-right, +5°. A real portrait, so it is content — a named
 * `<img>`, not `aria-hidden`, never an EVAL-018 decoration (Design.md §11 Dev-101). The wrapper
 * carries the paper shadow (a `drop-shadow` on the masked stamp would be masked away).
 */
export function PortraitStamp() {
  return (
    <span className="cx-stamp-wrap">
      <span className="cx-stamp">
        <Image src={portrait} alt="Photo of Tushar Pathak" sizes="(max-width: 559px) 52px, 72px" className="cx-stamp-img" />
      </span>
    </span>
  );
}

/**
 * The functional contact card (spec §8): one torn, handmade ivory sheet (`data-paper="card"` —
 * content paper, never counted; the deckled rim/face layers and the paperclip are its own material,
 * `aria-hidden`), and Tushar's portrait postage stamp (content, TASK-111). Email block → primary CTA → divider → secondary links; the location line only
 * behind `site.showLocation` (default `false`, TKT-72). No form (S10), no phone / DOB / address (EXE-8).
 */
export function ContactCard() {
  return (
    <Sheet variant="card" className="cx-card">
      <span className="cx-card-paper" aria-hidden="true">
        <span className="cx-card-shade" style={{ clipPath: EDGES.rim }} />
        <span className="cx-card-rim" style={{ clipPath: EDGES.rim }} />
        <span className="cx-card-face" style={{ clipPath: EDGES.face }} />
      </span>
      <svg className="cx-clip" viewBox="0 0 28 72" aria-hidden="true" focusable="false">
        <path d="M9 60 V14 a6 6 0 0 1 12 0 V56 a9 9 0 0 1 -18 0 V20" />
      </svg>
      <PortraitStamp />

      <EmailBlock />
      <PrimaryContactCTA />
      <hr className="cx-divider" />
      <SecondaryContactLinks />

      {site.showLocation ? (
        <p className="contact-location">
          <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
          Bengaluru, India
        </p>
      ) : null}
    </Sheet>
  );
}
