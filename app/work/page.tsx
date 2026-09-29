import type { Metadata } from "next";
import { CollageTimeline, type TimelineEntry, type TimelineTone } from "@/components/experience/CollageTimeline";
import { EDU_DOODLES, WORK_DOODLES } from "@/components/experience/Doodles";
import { ORG_LOGOS } from "@/components/experience/logos";
import { Skills } from "@/components/experience/Skills";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { education } from "@/data/credentials";
import { experience } from "@/data/experience";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Experience · ${site.name}`,
  description:
    "Work experience — American Express (via IntraEdge), Shellkode, Quantiphi Analytics, Godrej Infotech — and education at NIT Calicut and Bhilai Institute of Technology.",
  path: "/work",
  ogFamily: "Experience",
});

/**
 * `/work` — the Experience page (TKT-101, Tushar direction 2026-09-26; Design.md §7.2, §11 Dev-90/43).
 * Replaces the project index (moved to `/projects`; case studies keep `/work/<slug>`). The pinboard scene
 * moved with the index (`scene-work` → `/projects`); since TASK-114 (Tushar 2026-09-27, Design.md §11 Dev-103,
 * superseding Dev-90's "no scene opener") the page opens on its own scene, `scene-experience`, in the
 * shared `SceneOpener` — sized, cropped and parallaxed exactly like every other tab's.
 *
 * Opener → Work Experience (newest first) → the torn paper cut-out → Education on the `paper-2` tone → Skills
 * (TASK-136: moved from `/about`, with the languages line). On scroll
 * the Education sheet slides up over the Work section: while Education enters the viewport, the Work
 * content drifts down at half speed (the TKT-96 mechanism — CSS scroll-driven, `@supports`-guarded,
 * off under reduced motion; app/globals.css TKT-101 block).
 *
 * Every date, role, bullet and name comes verbatim from `data/experience.ts` / `data/credentials.ts`
 * (TASK-136: `/about` no longer repeats them — each role card carries its full record in a closed "Scope &
 * outcomes" disclosure). Mismatches against the reference images are listed for Tushar
 * in docs/reports/TKT-101.md — the data is never edited to match a picture.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-06" → "Jun 2026" (data/schema.ts YearMonth). */
function monthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

const WORK_TONES: TimelineTone[] = ["rust", "steel", "green", "rose"];
const EDU_TONES: TimelineTone[] = ["sage", "blue"];

/** Newest first, as the reference reads (data/experience.ts is stored oldest first for `/about`). */
const workEntries: TimelineEntry[] = [...experience]
  .sort((a, b) => b.dates.start.localeCompare(a.dates.start))
  .map((role, i) => {
    const kinds = new Set(role.outcomes.map((o) => o.kind));
    return {
      id: role.id,
      when: {
        start: role.dates.start,
        end: role.dates.end,
        startLabel: monthLabel(role.dates.start),
        endLabel: role.dates.end ? monthLabel(role.dates.end) : "Present",
      },
      name: role.company,
      nameNote: role.companyNote,
      role: role.title,
      city: role.location,
      // TKT-101 r2: Tushar's card wording (`highlights`, "image wins") when present; otherwise the
      // structured résumé fields + outcomes, as round 1 rendered them.
      bullets:
        role.highlights ??
        [role.context, role.responsibility, ...(role.scale === "not recorded" ? [] : [role.scale]), role.whatChanged],
      outcomes: role.highlights
        ? undefined
        : {
            label: kinds.size === 1 && kinds.has("self-reported") ? "Outcomes · self-reported" : "Outcomes",
            items: role.outcomes.map((o) => o.text),
          },
      // TASK-136: the full role record that used to sit in `/about`'s experience timeline, in a closed
      // disclosure so the approved card stays compact. Verbatim fields; "not recorded" scale is omitted.
      details: {
        summary: "Scope & outcomes",
        rows: [
          { term: "Context", items: [role.context] },
          { term: "Role", items: [role.responsibility] },
          ...(role.scale === "not recorded" ? [] : [{ term: "Scale", items: [role.scale] }]),
          { term: "What changed", items: [role.whatChanged] },
          {
            term: kinds.size === 1 && kinds.has("self-reported") ? "Outcomes · self-reported" : "Outcomes",
            items: role.outcomes.map((o) => o.text),
          },
        ],
      },
      logo: ORG_LOGOS[role.id],
      labelText: role.company,
      tone: WORK_TONES[i % WORK_TONES.length]!,
    };
  });

/** "National Institute of Technology Calicut, Kozhikode" → name + city (the résumé's own comma). */
function splitInstitution(institution: string): { name: string; city?: string } {
  const at = institution.lastIndexOf(", ");
  return at === -1 ? { name: institution } : { name: institution.slice(0, at), city: institution.slice(at + 2) };
}

const eduEntries: TimelineEntry[] = education.map((entry, i) => {
  const { name, city } = splitInstitution(entry.institution);
  return {
    id: entry.id,
    when: { start: entry.year, startLabel: entry.year },
    name,
    role: entry.degree,
    city,
    bullets: entry.highlights ?? [],
    logo: ORG_LOGOS[entry.id],
    labelText: name,
    tone: EDU_TONES[i % EDU_TONES.length]!,
  };
});

export default function ExperiencePage() {
  return (
    <>
      {/* TASK-114 scene opener (Dev-103): the first child of <main>, as on every other tab. */}
      <SceneOpener id="scene-experience" priority />
      <div className="xp">
        <h1 className="sr-only">Experience</h1>
        <CollageTimeline
          id="work-experience"
          className="xp-work"
          title="Work Experience"
          aside="Different problems. Same curiosity. Bigger impact."
          entries={workEntries}
          doodles={WORK_DOODLES}
        />
        <CollageTimeline
          id="education"
          className="xp-edu"
          title="Education"
          aside="From engineering foundations to research-driven thinking."
          entries={eduEntries}
          doodles={EDU_DOODLES}
          torn
        />
      </div>
      <Skills />
    </>
  );
}
