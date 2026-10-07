import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import AboutPage from "@/app/about/page";
import { ABOUT_CTA, CHAPTERS, ERAS, PRINCIPLES } from "@/components/about/about-content";
import { awards, papers, patent, researchDisclaimer } from "@/data/credentials";
import { experience } from "@/data/experience";
import { recommendationsHref, testimonials } from "@/data/testimonials";

// TASK-136 (Tushar's About redesign spec 2026-09-29): `/about` is WHO Tushar is — hero → Three Chapters →
// Career Across Contexts → Research + What Drives Me → Recognition → the dark Experience strip. Facts come
// from data/*.ts; the reference image's placeholders (companies, awards, "1 patent filed", "2010–2013") must
// never appear, and nothing duplicates Experience (no role cards, dates, bullets, metrics, education, badges).

// The page opens on `SceneOpener`, whose static image import is a bare URL under jsdom (next/image rejects
// it). Stub it to its outer contract; the real opener is covered by tests/e2e/scene-opener.spec.ts. Same for
// the polaroid `Illustration` (next/image + a static import).
vi.mock("@/components/paper/SceneOpener", () => ({
  SceneOpener: ({ id, priority }: { id: string; priority?: boolean }) => <section data-opener={id} data-priority={String(Boolean(priority))} />,
}));

beforeEach(() => {
  // `Reveal` observes on mount; jsdom has no IntersectionObserver.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

/** EVAL-018 count: `data-decor` objects whose nearest section is `section` (Design §3.2 rule 1). */
function decor(section: Element): string[] {
  return Array.from(section.querySelectorAll("[data-decor]"))
    .filter((el) => el.closest("section") === section)
    .map((el) => el.getAttribute("data-decor") ?? "");
}

const PLACEHOLDERS = [/\bIIT\b/, /\bGoogle\b(?! Cloud)/, /\bAIG\b/, /\bHSBC\b/, /Nvidia/i, /Star of the Month/i, /Spot Award/i, /patent filed/i, /2010/, /2013/, /2009/];

describe("/about (TASK-136)", () => {
  it("renders the five areas in spec order after the scene opener; the headings alone tell the story (spec §60)", () => {
    const { container } = render(<AboutPage />);
    expect((container.firstElementChild as HTMLElement).getAttribute("data-opener")).toBe("scene-about");
    const ids = Array.from(container.querySelectorAll(":scope > section")).map((s) => s.id || s.getAttribute("aria-labelledby"));
    expect(ids).toEqual([null, "about-hero-heading", "chapters", "career", "research-values", "recognition", "testimonials", "about-cta"]);
    const headings = Array.from(container.querySelectorAll("h1, h2")).map((h) => h.textContent);
    expect(headings).toEqual([
      "A builder who connects deep tech to real-world impact.",
      "The arc of my journey.",
      "Different problems, common thread.",
      "From labs to lasting ideas.",
      "Curiosity, impact and continuous learning.",
      "A few milestones along the way.",
      "In their words.",
      ABOUT_CTA.title,
    ]);
  });

  it("hero: eyebrow ABOUT, the approved h1 + copy, the collage and two notes are decoration only (EVAL-018 = 4)", () => {
    const { container } = render(<AboutPage />);
    const hero = container.querySelector('section[aria-labelledby="about-hero-heading"]')!;
    expect(hero.querySelector(".ab-eyebrow")).toHaveTextContent(/^About$/);
    expect(hero.querySelector(".abh-lead")).toHaveTextContent(
      "From research labs to production systems, I’ve always been drawn to solving complex problems and turning them into products people actually use.",
    );
    expect(decor(hero).sort()).toEqual(["annotation", "annotation", "collage", "sketch"]);
    const collage = hero.querySelector('[data-decor="collage"]')!;
    expect(collage.getAttribute("aria-hidden")).toBe("true");
    const imgs = Array.from(collage.querySelectorAll("img"));
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([
      "/about/research-sketches.svg",
      "/about/systems-collage.svg",
      "/about/product-desk.svg",
      "/about/books-stack.svg",
    ]);
    for (const img of imgs) expect(img.getAttribute("alt")).toBe("");
  });

  it("Three Chapters: exactly three torn cards 01 Builder · 02 Operator · 03 Researcher (Still), each one art print + the spec lines", () => {
    const { container } = render(<AboutPage />);
    const section = container.querySelector("section#chapters")!;
    const cards = Array.from(section.querySelectorAll("ol > li article[data-paper='card']"));
    expect(cards).toHaveLength(3);
    cards.forEach((card, i) => {
      const chapter = CHAPTERS[i]!;
      expect(within(card as HTMLElement).getByRole("heading", { level: 3 }).textContent).toBe(`${chapter.number}${chapter.title}`);
      expect(card.querySelector(".chx-text")?.textContent).toBe(chapter.body);
      expect(card.querySelectorAll("img")).toHaveLength(1);
      expect(card.querySelector("img")?.getAttribute("alt")).toBe("");
      expect(card.querySelectorAll('[data-fastener="tape"]')).toHaveLength(1);
    });
    expect(CHAPTERS.map((c) => `${c.number} ${c.title}`)).toEqual(["01 Builder", "02 Operator", "03 Researcher (Still)"]);
    expect(decor(section)).toEqual(["torn", "annotation"]);
  });

  it("Career Across Contexts: four eras (not employers), one descriptor each, the real employers only as small refs, no dates", () => {
    const { container } = render(<AboutPage />);
    const section = container.querySelector("section#career")!;
    const eras = Array.from(section.querySelectorAll("ol.crx-list > li"));
    expect(eras.map((li) => li.querySelector("h3")?.textContent)).toEqual([
      "Research & Engineering",
      "Cloud & Data",
      "Enterprise Platforms",
      "AI Products",
    ]);
    expect(eras.map((li) => li.querySelector(".crx-desc")?.textContent)).toEqual([
      "First principles",
      "Systems at scale",
      "Complex coordination",
      "Fast learning loops",
    ]);
    expect(ERAS).toHaveLength(4);
    const text = section.textContent ?? "";
    // every employer named is a real one from data/experience.ts; no years, no job titles
    for (const name of ["Quantiphi", "Shellkode", "Godrej Infotech", "American Express"]) {
      expect(experience.some((role) => role.company.startsWith(name))).toBe(true);
      expect(text).toContain(name);
    }
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
    for (const role of experience) expect(text).not.toContain(role.title);
    expect(decor(section)).toEqual(["torn", "sketch"]);
  });

  it("Research: three artifacts from data/credentials.ts — the GRANTED patent IN 429867, the paper count, no invented DOI", () => {
    const { container } = render(<AboutPage />);
    const research = container.querySelector("#research")!;
    const artifacts = Array.from(research.querySelectorAll(".rvx-artifacts > li"));
    expect(artifacts).toHaveLength(3);
    expect(artifacts.map((a) => a.querySelector("h3")?.textContent)).toEqual([
      "Nanotechnology research",
      "Granted patent",
      `${papers.length} peer-reviewed papers`,
    ]);
    expect(artifacts[1]!.textContent).toContain(patent.title);
    expect(artifacts[1]!.querySelector(".rvx-meta")?.textContent).toBe(`${patent.number} · co-inventor · granted ${patent.granted.slice(-4)}`);
    expect(research.textContent).toContain(researchDisclaimer);
    expect(research.querySelector(`a[href="${patent.href}"]`)).not.toBeNull();
    for (const paper of papers) {
      expect(research.textContent).toContain(paper.title);
      if (paper.doiHref) expect(research.querySelector(`a[href="${paper.doiHref}"]`)).not.toBeNull();
    }
    expect(research.textContent).not.toContain("DOI pending"); // both papers now carry a real DOI (TASK-163)
    expect(research.querySelector('a[href="https://doi.org/10.1039/d3sm00290j"]')).not.toBeNull();
    expect(research.textContent).not.toMatch(/044152784/); // the résumé's SL No. is never the patent number
    // spec §23: not an education block
    expect(research.textContent).not.toMatch(/B\.E\.|M\.Tech|CGPA|Bhilai|Institute of Technology/);
  });

  it("What Drives Me: one card with exactly three principles and hand-drawn icons, beside the polaroid", () => {
    const { container } = render(<AboutPage />);
    const values = container.querySelector("#values")!;
    const items = Array.from(values.querySelectorAll(".rvx-plist > li"));
    expect(items.map((li) => li.textContent)).toEqual(PRINCIPLES.map((p) => p.text));
    for (const li of items) expect(li.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(values.querySelector('[data-illustration="polaroid-sunrise"]')).not.toBeNull();
    const section = container.querySelector("section#research-values")!;
    expect(decor(section)).toEqual(["torn", "annotation"]);
  });

  it("Recognition: exactly the awards data/credentials.ts records (name + year), never a placeholder", () => {
    const { container } = render(<AboutPage />);
    const section = container.querySelector("section#recognition")!;
    const items = Array.from(section.querySelectorAll(".rcx-list > li"));
    expect(items.map((li) => [li.querySelector("h3")?.textContent, li.querySelector(".rcx-year")?.textContent])).toEqual(
      awards.map((a) => [a.title, a.year]),
    );
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.length).toBeLessThanOrEqual(4);
    expect(decor(section)).toEqual(["torn", "annotation"]);
  });

  it("In their words: Tushar's three picks, public on LinkedIn only, verbatim excerpts, no photos (TASK-136 follow-up)", () => {
    expect(testimonials.map((t) => t.id)).toEqual(["jay-mundhara", "shivali-sharma", "sumeet-chaurasia"]);
    for (const t of testimonials) {
      expect(t.publicOnLinkedIn, t.id).toBe(true);
      // every shown fragment is a verbatim substring of the full recommendation
      for (const fragment of t.excerpt) expect(t.text, t.id).toContain(fragment);
      // the display role is cut from the author's own headline
      for (const part of t.role.split(/,\s*|\s·\s/)) expect(t.headline, t.id).toContain(part);
    }
    const { container } = render(<AboutPage />);
    const section = container.querySelector("section#testimonials")!;
    const cards = Array.from(section.querySelectorAll("figure[data-paper='card']"));
    expect(cards).toHaveLength(testimonials.length);
    cards.forEach((card, i) => {
      const t = testimonials[i]!;
      expect(card.querySelector("blockquote p")?.textContent).toBe(t.excerpt.join(" … "));
      expect(card.querySelector("blockquote")?.getAttribute("cite")).toBe(recommendationsHref);
      expect(card.querySelector(".tsx-name")?.textContent).toBe(t.name);
      expect(card.querySelector("time")?.getAttribute("datetime")).toBe(t.date);
      expect(card.querySelector("img")).toBeNull();
    });
    expect(section.querySelector(`a[href="${recommendationsHref}"]`)).not.toBeNull();
    expect(decor(section)).toEqual(["torn"]);
  });

  it("the dark strip links to the existing Experience and Certifications tabs — no contact CTA, no second route", () => {
    const { container } = render(<AboutPage />);
    const cta = container.querySelector("section#about-cta")!;
    const links = Array.from(cta.querySelectorAll("a")).map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links).toEqual([
      ["See full experience", "/work"],
      ["View certifications", "/certifications"],
    ]);
    expect(decor(cta)).toEqual(["collage"]);
  });

  it("does not duplicate Experience or Certifications, and no reference placeholder survives (spec §30–§33, §49–§52)", () => {
    const { container } = render(<AboutPage />);
    const text = container.textContent ?? "";
    for (const role of experience) {
      expect(text).not.toContain(role.title);
      for (const h of role.highlights ?? []) expect(text).not.toContain(h);
      for (const o of role.outcomes) expect(text).not.toContain(o.text);
    }
    expect(text).not.toMatch(/self-reported|Languages:|What I Bring/);
    expect(container.querySelector('a[href^="/certifications/"], [data-credential]')).toBeNull();
    for (const re of PLACEHOLDERS) expect(text, String(re)).not.toMatch(re);
    // every text-bearing decoration is out of the a11y tree
    for (const el of Array.from(container.querySelectorAll("[data-decor]"))) expect(el.getAttribute("aria-hidden")).toBe("true");
  });
});
