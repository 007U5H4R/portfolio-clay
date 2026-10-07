import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import ExperiencePage from "@/app/work/page";
import { education, languages } from "@/data/credentials";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";

// TKT-101 (Tushar direction 2026-09-26; Design.md §7.2, §11 Dev-90…45): `/work` is the Experience page —
// Work Experience then Education, as collage timelines. Copy is the data's, verbatim (D7): every name,
// role, date, city and bullet below is read from data/experience.ts + data/credentials.ts, never retyped.

afterEach(cleanup);

// TASK-114 (Dev-103): the page opens on `SceneOpener`, whose static image import is a bare URL under jsdom
// (next/image rejects it — the reason SceneBanner is not in the paper barrel). Stub it to its outer contract;
// the real opener is covered by tests/e2e/scene-opener.spec.ts.
vi.mock("@/components/paper/SceneOpener", () => ({
  SceneOpener: ({ id, priority }: { id: string; priority?: boolean }) => <section data-opener={id} data-priority={String(Boolean(priority))} />,
}));

const section = (container: HTMLElement, id: string) => {
  const el = container.querySelector<HTMLElement>(`section#${id}`);
  if (!el) throw new Error(`section#${id} missing`);
  return el;
};

describe("/work Experience page (TKT-101)", () => {
  it("opens on its own scene, `scene-experience`, as the LCP-priority opener (TASK-114, Dev-103)", () => {
    const { container } = render(<ExperiencePage />);
    const first = container.firstElementChild as HTMLElement;
    expect(first.getAttribute("data-opener")).toBe("scene-experience");
    expect(first.getAttribute("data-priority")).toBe("true");
  });

  it("has one sr-only h1 and the three section headings in order (Skills moved here from /about, TASK-136)", () => {
    const { container } = render(<ExperiencePage />);
    const headings = Array.from(container.querySelectorAll("h1, h2")).map((h) => `${h.tagName}:${h.textContent}`);
    expect(headings).toEqual(["H1:Experience", "H2:Work Experience", "H2:Education", "H2:What I Bring"]);
  });

  it("Work Experience lists every role newest first, as an ordered list of h3 cards", () => {
    const { container } = render(<ExperiencePage />);
    const work = section(container, "work-experience");
    const items = Array.from(work.querySelectorAll("ol.ct-list > li"));
    const newestFirst = [...experience].sort((a, b) => b.dates.start.localeCompare(a.dates.start));
    expect(items).toHaveLength(experience.length);
    items.forEach((li, i) => {
      const role = newestFirst[i]!;
      const card = within(li as HTMLElement);
      expect(card.getByRole("heading", { level: 3 }).textContent).toBe(
        role.companyNote ? `${role.company} (${role.companyNote})` : role.company,
      );
      expect(card.getByText(role.title)).toBeTruthy();
      // bullets are the data's `highlights` verbatim (TKT-101 r2, Tushar's wording); every figure keeps its label
      expect(role.highlights, `${role.id} has highlights`).toBeDefined();
      expect(Array.from(li.querySelectorAll(".ct-bullets li")).map((b) => b.textContent)).toEqual(role.highlights);
      for (const h of role.highlights!) if (/\d+%|\d+ (?:high-impact )?features/.test(h)) expect(h).toMatch(/\(self-reported\)\.$/);
      // dates are machine-readable from the data
      expect(li.querySelector(`time[datetime="${role.dates.start}"]`)).not.toBeNull();
      if (role.dates.end) expect(li.querySelector(`time[datetime="${role.dates.end}"]`)).not.toBeNull();
      else expect(li.querySelector(".ct-date")?.textContent).toContain("Present");
      // the city chip (Dev-93) is the data's location
      expect(li.querySelector(".ct-city")?.textContent).toBe(`Location: ${role.location}`);
    });
  });

  it("Education lists degree, institution, year and city from data/credentials.ts", () => {
    const { container } = render(<ExperiencePage />);
    const edu = section(container, "education");
    const items = Array.from(edu.querySelectorAll("ol.ct-list > li"));
    expect(items).toHaveLength(education.length);
    items.forEach((li, i) => {
      const entry = education[i]!;
      const at = entry.institution.lastIndexOf(", ");
      const card = within(li as HTMLElement);
      expect(card.getByRole("heading", { level: 3 }).textContent).toBe(entry.institution.slice(0, at));
      expect(li.querySelector(".ct-city")?.textContent).toBe(`Location: ${entry.institution.slice(at + 2)}`);
      expect(card.getByText(entry.degree)).toBeTruthy();
      expect(li.querySelector(`time[datetime="${entry.year}"]`)?.textContent).toBe(entry.year);
      expect(Array.from(li.querySelectorAll(".ct-bullets li")).map((b) => b.textContent)).toEqual(entry.highlights);
    });
  });

  it("logos are content with the organisation's name as alt; every organisation shows its official mark", () => {
    const { container } = render(<ExperiencePage />);
    const alts = Array.from(container.querySelectorAll<HTMLImageElement>(".ct-logo img")).map((img) => img.alt);
    expect(alts).toEqual([
      "American Express",
      "Shellkode",
      "Quantiphi",
      "Godrej",
      "National Institute of Technology Calicut",
      "Bhilai Institute of Technology, Durg",
    ]);
    for (const img of Array.from(container.querySelectorAll<HTMLImageElement>(".ct-logo img"))) {
      // Wikimedia SVGs, or the raster files Tushar supplied (TASK-153) — always from the logos folder.
      expect(img.getAttribute("src")).toMatch(/^\/media\/logos\/[a-z-]+\.(svg|webp)$/);
    }
    // No organisation falls back to its name set in type any more.
    expect(container.querySelectorAll(".ct-logo-type")).toHaveLength(0);
  });

  it("EVAL-018: Work = note · annotation · collage (3); Education = torn · note · annotation · collage (4)", () => {
    const { container } = render(<ExperiencePage />);
    const decor = (id: string) =>
      Array.from(section(container, id).querySelectorAll("[data-decor]")).map((el) => el.getAttribute("data-decor"));
    expect(decor("work-experience")).toEqual(["note", "annotation", "collage"]);
    expect(decor("education")).toEqual(["torn", "note", "annotation", "collage"]);
    // every decoration is out of the a11y tree; the collage holds no focusable element
    for (const el of Array.from(container.querySelectorAll("[data-decor]"))) {
      expect(el.getAttribute("aria-hidden")).toBe("true");
      expect(el.querySelector("a, button, input, [tabindex]")).toBeNull();
    }
  });

  it("the collage has one row per entry (subgrid rows line up with the cards)", () => {
    const { container } = render(<ExperiencePage />);
    expect(section(container, "work-experience").querySelectorAll(".ct-collage > .ct-row")).toHaveLength(experience.length);
    expect(section(container, "education").querySelectorAll(".ct-collage > .ct-row")).toHaveLength(education.length);
  });

  // TASK-136: `/about` stopped repeating the résumé, so everything its experience timeline, impact résumé
  // figures, skills and languages showed must be here. Every string is read from the data, never retyped.
  it("each role card carries its full record in a closed 'Scope & outcomes' disclosure, verbatim (TASK-136)", () => {
    const { container } = render(<ExperiencePage />);
    const work = section(container, "work-experience");
    for (const role of experience) {
      const details = work.querySelector<HTMLDetailsElement>(`details[data-details="${role.id}"]`);
      expect(details, `${role.id} disclosure`).not.toBeNull();
      expect(details!.open).toBe(false);
      expect(details!.querySelector("summary")?.textContent).toBe("Scope & outcomes");
      const dl = details!.querySelector("dl")!;
      expect(dl.hasAttribute("data-flat")).toBe(true);
      expect(dl.querySelector("[data-decor]")).toBeNull();
      const dds = Array.from(dl.querySelectorAll("dd")).map((dd) => dd.textContent);
      expect(dds).toContain(role.context);
      expect(dds).toContain(role.responsibility);
      expect(dds).toContain(role.whatChanged);
      if (role.scale === "not recorded") expect(dl.textContent).not.toContain("not recorded");
      else expect(dds).toContain(role.scale);
      for (const outcome of role.outcomes) expect(dds).toContain(outcome.text);
      expect(Array.from(dl.querySelectorAll("dt")).map((dt) => dt.textContent)).toContain("Outcomes · self-reported");
    }
  });

  it("Skills lists the four data/skills.ts clusters verbatim, then the languages line; torn = its one decoration", () => {
    const { container } = render(<ExperiencePage />);
    const skillsSection = section(container, "skills");
    const sheets = Array.from(skillsSection.querySelectorAll("article"));
    expect(sheets).toHaveLength(skills.length);
    sheets.forEach((sheet, i) => {
      expect(sheet.querySelector("h3")?.textContent).toBe(skills[i]!.name);
      expect(Array.from(sheet.querySelectorAll("li")).map((li) => li.textContent)).toEqual(skills[i]!.items);
    });
    expect(skillsSection.querySelector(".acap-langs")?.textContent).toBe(`Languages: ${languages.join(", ")}.`);
    expect(Array.from(skillsSection.querySelectorAll("[data-decor]")).map((el) => el.getAttribute("data-decor"))).toEqual(["torn"]);
  });
});
