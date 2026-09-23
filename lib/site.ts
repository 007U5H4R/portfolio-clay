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
  /** The only place this alt string lives (EVAL-013 alt rule) — every avatar <img> derives it from here. */
  avatarAlt: "Claymorphic portrait of Tushar Pathak, arms crossed in a grey blazer",
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
