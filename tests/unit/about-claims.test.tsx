import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import AboutPage from "@/app/about/page";
import { CHAPTERS, DESK, ERAS, PINBOARD_CENTER } from "@/components/about/about-content";
import { PAPER_ART, THEMED_ART } from "@/components/about/about-paper-art";
import { awards, papers, patent } from "@/data/credentials";
import { testimonials } from "@/data/testimonials";

// TASK-196 — truth over mockup. The redesign mockup carries placeholders (a mistyped patent number, "Product
// Thinker", "Tushar's Operating System", reviewer roles, tags); none may reach the page. Every claim the About
// body shows must exist in `data/*` or in the page's own approved copy (`about-content.ts`).
vi.mock("@/components/paper/SceneOpener", () => ({ SceneOpener: () => <section data-opener="scene-about" /> }));
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
});
afterEach(() => vi.unstubAllGlobals());

const body = () => {
  const { container } = render(<AboutPage />);
  const ids = ["desk", "chapters", "career", "research-values", "recognition", "testimonials"];
  return ids.map((id) => container.querySelector(`section#${id}`)!.textContent ?? "").join("\n");
};

describe("About body claims exist in the data (TASK-196)", () => {
  it("patent: the granted patent number is the certificate's IN 429867 — never the mockup's 429667", () => {
    const text = body();
    expect(text).toContain(patent.number);
    expect(patent.number).toBe("IN 429867");
    expect(text).not.toContain("429667");
  });

  it("papers: Langmuir 2025 and Soft Matter 2023 come from data/credentials.ts, with their real titles and DOIs", () => {
    const text = body();
    expect(papers.map((p) => `${p.journal.split(",")[0]} ${p.year}`)).toEqual(["Langmuir 2025", "Soft Matter 2023"]);
    for (const p of papers) {
      expect(text).toContain(`${p.journal} ${p.year}`);
      expect(text).toContain(p.title);
    }
    expect(text).not.toMatch(/Peer reviewed paper/i);
  });

  it("recognition: exactly the three awards on record, each with its year", () => {
    const text = body();
    expect(awards.map((a) => [a.title, a.year])).toEqual([
      ["Google Cloud Partner All-Star: Delivery Excellence", "2024"],
      ["Annual Unsung Hero Award, Quantiphi Analytics Solutions", "2024"],
      ["12 in 11 Award, Godrej Infotech", "2018"],
    ]);
    for (const a of awards) {
      expect(text).toContain(a.title);
      expect(text).toContain(a.year);
    }
  });

  it("recommendations: only the verbatim excerpts, names and initials of the recorded recommenders", () => {
    const { container } = render(<AboutPage />);
    const cards = Array.from(container.querySelectorAll("section#testimonials figure"));
    expect(cards).toHaveLength(testimonials.length);
    cards.forEach((card, i) => {
      const t = testimonials[i]!;
      for (const fragment of t.excerpt) expect(t.text).toContain(fragment);
      const initials = t.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
      expect(card.querySelector(".tsx-initials")?.textContent).toBe(initials);
      expect(card.querySelector(".tsx-name")?.textContent).toBe(t.name);
      expect(card.querySelector(".tsx-role")?.textContent).toBe(t.role);
    });
    expect(testimonials.map((t) => t.name.split(/\s+/).map((p) => p[0]).join(""))).toEqual(["JM", "SS", "SC"]);
  });

  it("desk and chapter words are already said by the data or the approved copy", () => {
    const said = [
      ...ERAS.flatMap((e) => [e.name, e.descriptor, e.focus, e.refs]),
      ...CHAPTERS.map((c) => c.body),
      "deep tech",
    ]
      .join(" ")
      .toLowerCase();
    for (const word of DESK.disciplines) expect(said, `desk discipline ${word}`).toContain(word.toLowerCase());
    for (const chapter of CHAPTERS) for (const tag of chapter.tags) expect(said, `${chapter.id} tag ${tag}`).toContain(tag.toLowerCase());
    expect(DESK.route).toBe("Research → products → real-world impact.");
    expect(PINBOARD_CENTER.toLowerCase()).toBe("common thread");
  });

  it("none of the mockup's placeholder claims appear", () => {
    const text = body();
    for (const banned of [/Operating System/i, /Product Thinker/i, /Former Manager/i, /Stakeholder\b/, /Chai\b/, /Proactive|Curious|Analytical|Impactful/, /Beyond the formal role/i, /Delivery excellence for real-world impact/i]) {
      expect(text, String(banned)).not.toMatch(banned);
    }
  });
});

describe("About body art budget (TASK-196)", () => {
  const dir = join(process.cwd(), "public", "media", "about-paper");
  it("ships exactly the registered WebP files at their registered pixel size, ≤ 320 kB each, ≤ 1.6 MB in all", async () => {
    const files = readdirSync(dir).filter((f) => f.endsWith(".webp")).sort();
    expect(files).toEqual(Object.keys(PAPER_ART).map((id) => `${id}.webp`).sort());
    expect(readdirSync(dir).filter((f) => !f.endsWith(".webp"))).toEqual([]);
    let total = 0;
    for (const [id, art] of Object.entries(PAPER_ART)) {
      const file = join(dir, `${id}.webp`);
      const meta = await sharp(readFileSync(file)).metadata();
      expect([id, meta.width, meta.height]).toEqual([id, art.width, art.height]);
      const size = statSync(file).size;
      expect(size, id).toBeLessThanOrEqual(320_000);
      total += size;
    }
    expect(total).toBeLessThanOrEqual(1_600_000);
  });

  it("every light/dark pair is registered, and the dark file differs from the light one", () => {
    for (const [name, [light, dark]] of Object.entries(THEMED_ART)) {
      expect(PAPER_ART[light].src, name).toContain("light");
      expect(PAPER_ART[dark].src, name).toContain("dark");
      expect(readFileSync(join(dir, `${light}.webp`)).equals(readFileSync(join(dir, `${dark}.webp`)))).toBe(false);
    }
  });
});
