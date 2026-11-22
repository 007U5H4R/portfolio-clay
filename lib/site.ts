/**
 * Site identity constants + the single source of truth for the resume control (PB5).
 *
 * Every resume affordance in the UI (band footer, contact card) derives its label / href from
 * resumeAction() / contactResumeLink(); nothing hard-codes a resume link.
 */
export const site = {
  name: "Tushar Pathak",
  title: "Senior Product Manager & AI Product Leader",
  tagline:
    "Tushar Pathak is a Senior Product Manager and AI Product Leader in Bengaluru, India, working across enterprise AI, generative AI, product strategy, cloud and data platforms.",
  email: "Tushar_Pathak@outlook.com",
  linkedin: "https://www.linkedin.com/in/pathaktushar",
  github: "https://github.com/007U5H4R",
  priorSite: "https://tushar-pathak.vercel.app/",
  /** Tushar's resume on Google Drive (TASK-175) - the one place the URL lives. Must stay https on drive.google.com. */
  resumeUrl: "https://drive.google.com/file/d/1uq6eHacLtZcvDRDJc9jMIKDMyUs24qcg/view?usp=share_link",
  /** Bengaluru, India is an intentionally public professional location. */
  showLocation: true as boolean,
};

export interface ResumeAction {
  label: string;
  href: string;
  download: boolean;
}

export function resumeAction(): ResumeAction {
  return { label: "Resume ↗", href: site.resumeUrl, download: false };
}

/** The /contact card's resume link (TASK-113, TASK-175): the same Drive link and label as resumeAction(). */
export function contactResumeLink(): ResumeAction {
  return resumeAction();
}
