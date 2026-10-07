/**
 * Site identity constants + the single source of truth for the resume control (PB5).
 *
 * Every resume affordance in the UI (band footer, contact card) derives its label / href from
 * `resumeAction()` / `contactResumeLink()`; nothing hard-codes a resume link. The resume is Tushar's
 * Google Drive file (TASK-175, 2026-10-07) - an external link that opens in a new tab, like LinkedIn and GitHub.
 * No resume PDF is committed to `public/` (guarded by predeploy-check, forbidden-strings and resume-pii).
 */
export const site = {
  name: "Tushar Pathak",
  title: "Senior Product Manager",
  tagline: "Product Thinker · AI Builder · Problem Solver",
  email: "Tushar_Pathak@outlook.com",
  linkedin: "https://www.linkedin.com/in/pathaktushar",
  github: "https://github.com/007U5H4R",
  priorSite: "https://tushar-pathak.vercel.app/",
  /** Tushar's resume on Google Drive (TASK-175) - the one place the URL lives. Must stay https on drive.google.com. */
  resumeUrl: "https://drive.google.com/file/d/1hqDF4-YlcdaoIRLBzKwI4D8pUWQ7ELJ_/view?usp=sharing",
  /**
   * Whether the band footer's © bar shows "Bengaluru, India" (Design.md §4.2, TKT-72). Default
   * `false`: flip to true once Tushar confirms — HANDOFF §6. One edit; `BandFooter` reads it.
   */
  showLocation: false as boolean,
};

export interface ResumeAction {
  label: string;
  href: string;
  download: boolean;
}

export function resumeAction(): ResumeAction {
  return { label: "Resume ↗", href: site.resumeUrl, download: false };
}

/** The `/contact` card's resume link (TASK-113, TASK-175): the same Drive link and label as `resumeAction()`. */
export function contactResumeLink(): ResumeAction {
  return resumeAction();
}
