import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import ExperiencePage from "@/app/work/page";
import { education } from "@/data/credentials";
import { experience } from "@/data/experience";

// TKT-101 (Tushar direction 2026-09-26; Design.md §7.2, §11 Dev-42…45): `/work` is the Experience page —
// Work Experience then Education, as collage timelines. Copy is the data's, verbatim (D7): every name,
// role, date, city and bullet below is read from data/experience.ts + data/credentials.ts, never retyped.

afterEach(cleanup);

const section = (container: HTMLElement, id: string) => {
  const el = container.querySelector<HTMLElement>(`section#${id}`);
  if (!el) throw new Error(`section#${id} missing`);
  return el;
};

describe("/work Experience page (TKT-101)", () => {
  it("has one sr-only h1 and the two section headings in order", () => {
    const { container } = render(<ExperiencePage />);
    const headings = Array.from(container.querySelectorAll("h1, h2")).map((h) => `${h.tagName}:${h.textContent}`);
    expect(headings).toEqual(["H1:Experience", "H2:Work Experience", "H2:Education"]);
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
      // the city chip (Dev-45) is the data's location
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

  it("logos are content with the organisation's name as alt; no official file → the name set in type", () => {
    const { container } = render(<ExperiencePage />);
    const alts = Array.from(container.querySelectorAll<HTMLImageElement>(".ct-logo img")).map((img) => img.alt);
    expect(alts).toEqual(["American Express", "Godrej", "National Institute of Technology Calicut"]);
    for (const img of Array.from(container.querySelectorAll<HTMLImageElement>(".ct-logo img"))) {
      expect(img.getAttribute("src")).toMatch(/^\/media\/logos\/[a-z-]+\.svg$/);
    }
    const typed = Array.from(container.querySelectorAll(".ct-logo-type")).map((el) => el.getAttribute("aria-label"));
    expect(typed).toEqual(["Shellkode", "Quantiphi Analytics Solutions Pvt. Ltd.", "Bhilai Institute of Technology"]);
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
});
