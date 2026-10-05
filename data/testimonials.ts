import { site } from "@/lib/site";

/**
 * `/about` "In their words" — three LinkedIn recommendations (TASK-136 follow-up, Tushar 2026-10-05).
 *
 * Source: Tushar's LinkedIn "Recommendations → Received" screenshots (`Recommendations.docx`, 2026-10-05).
 * He picked these three, and only recommendations he shows publicly on LinkedIn ("All LinkedIn members:
 * On") are used — the ones he has switched Off there are never published here.
 *
 * Truth rules (the `data/credentials.ts` discipline):
 *   - `text` is the full recommendation, transcribed verbatim (spelling and punctuation untouched).
 *   - `excerpt` is what the page shows: verbatim fragments of `text`, joined with " … " on the page.
 *     Never reworded; `tests/unit/about.test.tsx` asserts every fragment is a substring of `text`.
 *   - `headline` is the author's own LinkedIn headline, verbatim; `role` is a short display form taken
 *     from it (no location). `relationship` + `date` are LinkedIn's own line for the recommendation.
 *   - No photos (the authors' LinkedIn images are theirs): the card shows initials instead.
 */
export interface Testimonial {
  id: string;
  name: string;
  /** The author's LinkedIn headline, verbatim. */
  headline: string;
  /** Short display role, cut from `headline`. */
  role: string;
  /** LinkedIn's relationship line for the recommendation. */
  relationship: string;
  /** ISO date LinkedIn shows for the recommendation. */
  date: string;
  excerpt: string[];
  text: string;
  /** LinkedIn visibility toggle at transcription time — only `true` may render. */
  publicOnLinkedIn: boolean;
  source: string;
}

const SOURCE = "Tushar's LinkedIn Recommendations (Received), screenshots in Recommendations.docx, 2026-10-05";

export const testimonials: Testimonial[] = [
  {
    id: "jay-mundhara",
    name: "Jay Mundhara",
    headline: "Senior Technical Program Manager at Quantiphi",
    role: "Senior Technical Program Manager, Quantiphi",
    relationship: "Jay managed Tushar directly",
    date: "2026-01-25",
    excerpt: [
      "He is pro-active in nature, always thinks 2 steps ahead.",
      "He is technically strong and is not afraid to get his hands dirty to help out the team.",
    ],
    text: "Tushar is one of the most enthusiastic PM's I've worked with. He is pro-active in nature, always thinks 2 steps ahead. He brings energy to his team with his enthusiasm. He is technically strong and is not afraid to get his hands dirty to help out the team. He is hard working, customer oriented, critical thinker, team player and a great communicator.  He is an asset to the team and any organization.",
    publicOnLinkedIn: true,
    source: SOURCE,
  },
  {
    id: "shivali-sharma",
    name: "Shivali Sharma",
    headline: "Finance brain. Product thinker. Building ideas with code. | Product Management | SaaS & Fintech",
    role: "Product Management · SaaS & Fintech",
    relationship: "Shivali worked with Tushar but they were at different companies",
    date: "2026-09-16",
    excerpt: [
      "He will keep exploring, questioning, and improving things instead of settling for the first version.",
    ],
    text: "Working with Tushar during the Buildathon at Rethink systems gave me a chance to see how he actually works, and that is what stood out to me the most.\n\nHe brings so much energy into the room, pays attention to the smallest details, and always pushes the work a little further. What I really like about his way of working is that he does not get stuck thinking, “What if this doesn’t work?” His mindset is more like, get your hands dirty, try it, build it, learn from it, and keep moving.\n\nThere is also this curiosity in the way he works. He will keep exploring, questioning, and improving things instead of settling for the first version. And when you are building something together, that energy automatically pushes everyone around him to think and do better too.\n\nHe has already built some amazing products, and the best part is that he is still constantly building, experimenting, and learning.\n\nThere is a lot to learn from the way you approach building. Keep building ❤️",
    publicOnLinkedIn: true,
    source: SOURCE,
  },
  {
    id: "sumeet-chaurasia",
    name: "Sumeet Chaurasia",
    headline: "Senior Cloud & AI Infrastructure Architect | Google Cloud | 8x GCP + HashiCorp certified | Toronto, Ontario",
    role: "Senior Cloud & AI Infrastructure Architect, Google Cloud",
    relationship: "Sumeet worked with Tushar on the same team",
    date: "2025-12-10",
    excerpt: [
      "His ability to convert a problem statement into clear, structured information benefits the entire team.",
    ],
    text: "I've witnessed Tushar dive into the midst of a project and help the team steer its focus toward the most important aspects and deliverables. His ability to convert a problem statement into clear, structured information benefits the entire team. He has also contributed valuable technical insights whenever needed, which the team greatly appreciates.",
    publicOnLinkedIn: true,
    source: SOURCE,
  },
];

/** Where every recommendation can be read in full (his LinkedIn "Recommendations → Received" tab). */
export const recommendationsHref = `${site.linkedin}/details/recommendations/?detailScreenTabIndex=0`;
