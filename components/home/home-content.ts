import { awards } from "@/data/credentials";
import { experience } from "@/data/experience";
import { getProject } from "@/data/projects";
import { productHref } from "@/lib/portfolio";
import { ORG_LOGOS, type OrgLogo } from "@/components/experience/logos";

/**
 * Home's Credentials · Selected Work · Awards content (TASK-211). One fact, one place: every role title,
 * date, tagline and award name below is read from `data/experience.ts`, `data/projects.ts` or
 * `data/credentials.ts` — nothing is retyped. The only literals are presentation (the short focus tags, which
 * are words lifted from each role's recorded highlights) and the one award the site's data does not carry yet
 * (see `BUILDATHON_AWARD`). Brief wording that differs from the data is listed in the TASK-211 report.
 */

export interface Art {
  src: string;
  width: number;
  height: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-06" → "Jun 2026" (the same formatting `/work` uses). */
function monthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function role(id: string) {
  const found = experience.find((e) => e.id === id);
  if (!found) throw new Error(`home-content: data/experience.ts has no "${id}" role`);
  return found;
}

export interface CredentialCard {
  id: string;
  org: string;
  /** The role title and dates exactly as recorded; `undefined` for the independent card (not an employer). */
  role: string;
  dates?: string;
  tags: string[];
  logo?: OrgLogo;
  art: Art;
  href: string;
  /** Accessible name of the card's one link. */
  label: string;
}

function employer(id: "amex" | "quantiphi" | "godrej", shortOrg: string, art: Art, tags: string[]): CredentialCard {
  const r = role(id);
  const dates = `${monthLabel(r.dates.start)} – ${r.dates.end ? monthLabel(r.dates.end) : "Present"}`;
  return {
    id,
    org: shortOrg,
    role: r.title,
    dates,
    tags,
    logo: ORG_LOGOS[id]!,
    art,
    href: `/work#work-experience`,
    label: `${shortOrg}, ${r.title}, ${dates}. See the experience timeline`,
  };
}

export const CREDENTIAL_CARDS: CredentialCard[] = [
  employer("amex", "American Express", { src: "/media/home/amex.webp", width: 640, height: 482 }, [
    "Accounts Receivable",
    "MARS migration",
    "Devin GenAI",
  ]),
  employer("quantiphi", "Quantiphi Analytics", { src: "/media/home/quantiphi.webp", width: 640, height: 482 }, [
    "GCP",
    "Data engineering",
    "API modernization",
  ]),
  employer("godrej", "Godrej Infotech", { src: "/media/home/godrej.webp", width: 640, height: 482 }, [
    "Smartnet",
    "Product lifecycle",
    "Scrum",
  ]),
  {
    id: "independent",
    org: "Independent Builder",
    role: "Personal products & MVPs",
    tags: ["RailCite", "TeachSpark"],
    art: { src: "/media/home/independent.webp", width: 640, height: 482 },
    href: "/projects",
    label: "Independent Builder, personal products and MVPs including RailCite and TeachSpark. See the portfolio",
  },
];

export interface WorkCard {
  id: string;
  name: string;
  description: string;
  tags: string[];
  art: Art;
  href: string;
  label: string;
}

function project(slug: string) {
  const found = getProject(slug);
  if (!found) throw new Error(`home-content: data/projects.ts has no "${slug}" project`);
  return found;
}

/** Selected Work. RailCite and TeachSpark use their own record's tagline and tags; "Enterprise AI Products" is the
 *  brief's name for the enterprise section of `/projects` (there is no single project page), so its text comes from
 *  the American Express role's first recorded highlight and its tags from the MARS project record. */
export const WORK_CARDS: WorkCard[] = [
  {
    id: "railcite",
    name: project("railcite").name,
    description: project("railcite").tagline,
    tags: project("railcite").tags,
    art: { src: "/media/home/railcite.webp", width: 800, height: 603 },
    href: productHref("railcite"),
    label: "RailCite. Explore in Portfolio",
  },
  {
    id: "teachspark",
    name: project("teachspark").name,
    description: project("teachspark").tagline,
    tags: project("teachspark").tags,
    art: { src: "/media/home/teachspark.webp", width: 800, height: 603 },
    href: productHref("teachspark"),
    label: "TeachSpark. Explore in Portfolio",
  },
  {
    id: "enterprise-ai",
    name: "Enterprise AI Products",
    description: role("amex").highlights?.[0] ?? role("amex").context,
    tags: project("mars-ar-modernization").tags,
    art: { src: "/media/home/enterprise-ai.webp", width: 800, height: 603 },
    href: "/projects#enterprise",
    label: "Enterprise AI Products. See Enterprise and Client Work in Portfolio",
  },
];

export interface AwardTile {
  id: string;
  /** The award as named on the site. */
  name: string;
  /** Issuer (and year when recorded), as one line. */
  detail: string;
  art: Art & { slug: string };
}

/** "Google Cloud Partner All-Star: Delivery Excellence" → the name and the qualifier after the colon. */
function award(id: string) {
  const found = awards.find((a) => a.id === id);
  if (!found) throw new Error(`home-content: data/credentials.ts has no "${id}" award`);
  return found;
}

/**
 * Named by Tushar's TASK-211 brief but NOT in `data/credentials.ts` (the About page shows three awards;
 * TASK-136 left it out because the data did not record it). No year or issuer detail is recorded, so none is
 * shown beyond what the brief names. Move it into `data/credentials.ts` once confirmed and delete this constant.
 */
export const BUILDATHON_AWARD = { name: "Best AI Operator", detail: "ReThink System Buildathon" } as const;

const [allStarName, allStarQualifier] = award("gcp-partner-all-star").title.split(": ") as [string, string];
const [hero, heroOrg] = award("quantiphi-unsung-hero").title.split(", ") as [string, string];
const [cup, cupOrg] = award("godrej-12-in-11").title.split(", ") as [string, string];

export const AWARD_TILES: AwardTile[] = [
  {
    id: "gcp-partner-all-star",
    name: allStarName,
    detail: `${allStarQualifier} · ${award("gcp-partner-all-star").year}`,
    art: { slug: "star", src: "/media/home/trophy-star.webp", width: 284, height: 440 },
  },
  {
    id: "quantiphi-unsung-hero",
    name: hero,
    detail: `${heroOrg} · ${award("quantiphi-unsung-hero").year}`,
    art: { slug: "medallion", src: "/media/home/trophy-medallion.webp", width: 218, height: 440 },
  },
  {
    id: "godrej-12-in-11",
    name: cup,
    detail: `${cupOrg} · ${award("godrej-12-in-11").year}`,
    art: { slug: "cup", src: "/media/home/trophy-cup.webp", width: 366, height: 440 },
  },
  {
    id: "best-ai-operator",
    name: BUILDATHON_AWARD.name,
    detail: BUILDATHON_AWARD.detail,
    art: { slug: "geometric", src: "/media/home/trophy-geometric.webp", width: 213, height: 440 },
  },
];
