/**
 * Site identity constants + the single source of truth for the resume control (PB5).
 *
 * Every resume affordance in the UI — hero CTA, mobile menu, contact page — must derive
 * its label / href / download behaviour from `resumeAction()`; nothing hard-codes a resume
 * link. Flip `site.resumeAvailable` to `true` once a sanitised `public/resume.pdf` exists
 * (TKT-08) and every control updates in one place.
 */
export const site = {
  name: "Tushar Pathak",
  title: "Senior Product Manager",
  tagline: "Product Thinker · AI Builder · Problem Solver",
  email: "Tushar_Pathak@outlook.com",
  linkedin: "https://www.linkedin.com/in/pathaktushar",
  github: "https://github.com/007U5H4R",
  priorSite: "https://tushar-pathak.vercel.app/",
  resumeAvailable: false as boolean,
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
  note?: string;
}

export function resumeAction(): ResumeAction {
  if (site.resumeAvailable) {
    return { label: "Download Resume ↓", href: "/resume.pdf", download: true };
  }
  return {
    label: "Resume — updating",
    href: "/contact#resume",
    download: false,
    note: "Sanitised resume coming — email me for a copy",
  };
}

/**
 * The `/contact` card's résumé link (TASK-113, Tushar's contact spec 2026-09-27 §13). Same single
 * flag as `resumeAction()` (PB5): once `site.resumeAvailable` flips true it is that download
 * ("Resume ↓", `resumeAction().href`). Until then it is never unfinished-state copy — it asks for
 * the résumé by email ("Resume — available on request", a `mailto:` with a subject line).
 */
export function contactResumeLink(): ResumeAction {
  if (site.resumeAvailable) {
    const { href } = resumeAction();
    return { label: "Resume ↓", href, download: true };
  }
  return {
    label: "Resume — available on request",
    href: `mailto:${site.email}?subject=${encodeURIComponent("Resume request")}`,
    download: false,
  };
}
