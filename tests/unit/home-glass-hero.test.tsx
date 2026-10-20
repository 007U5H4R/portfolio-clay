// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { hero } from "@/data/hero";
import { HERO_GLASS_COPY } from "@/components/hero/HeroGlass";

/**
 * TASK-289 test: `HOME_GLASS_HERO_ENABLED` is the one kill switch for the frosted-glass home hero. With it ON the
 * hero renders exactly the specified glass copy (one h1, one panel, nothing else); with it OFF the previous hero
 * renders — its copy, its "View my work" / "Ask Tushky" CTAs, its sheet and its intro video — and none of the
 * glass markup or the `hero-glass-on` scope class exists.
 */
// `lib/illustrations` carries static image imports Vitest cannot load; the hero only needs the src strings.
vi.mock("@/lib/illustrations", () => ({
  sceneImage: (id: string) => ({ src: `/media/${id}.webp`, width: 400, height: 400 }),
  darkSceneImage: (id: string) => ({ src: `/media/${id}-dark.webp`, width: 400, height: 400 }),
}));
vi.mock("@/components/ai/AskProvider", () => ({ useAskContext: () => ({ openPanel: () => {}, panelOpen: false }) }));

async function renderHero(enabled: boolean): Promise<Document> {
  vi.resetModules();
  vi.doMock("@/components/hero/home-glass-flag", () => ({ HOME_GLASS_HERO_ENABLED: enabled }));
  const { Hero } = await import("@/components/hero/Hero");
  const doc = document.implementation.createHTMLDocument("t");
  doc.body.innerHTML = renderToStaticMarkup(<Hero />);
  return doc;
}

afterEach(() => {
  vi.doUnmock("@/components/hero/home-glass-flag");
});

describe("HOME_GLASS_HERO_ENABLED — flag ON", () => {
  it("renders the glass panel with exactly the specified copy and its own unique h1", async () => {
    const doc = await renderHero(true);
    expect(doc.querySelector("section.hero")?.classList.contains("hero-glass-on")).toBe(true);
    // Both variants are in the HTML (CSS shows the glass one from 1024 up, the previous hero below), so the ids must be unique
    // and the section is named by neither h1.
    expect(doc.querySelector("section.hero")?.hasAttribute("aria-labelledby")).toBe(false);
    const ids = [...doc.querySelectorAll("[id]")].map((e) => e.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    expect(doc.querySelectorAll("[data-hero-glass] h1")).toHaveLength(1);
    expect(doc.querySelector("[data-hero-glass] h1")?.id).toBe("hero-glass-h");
    expect(doc.querySelectorAll("[data-hero-glass]")).toHaveLength(1);
    const panel = doc.querySelector("[data-hero-glass]")!;
    expect(panel.closest(".hero-banner")).not.toBeNull(); // rides the banner's parallax; the art layers are siblings
    expect(panel.querySelector(".hero-glass-eyebrow")?.textContent).toBe("PRODUCT MANAGER · AI BUILDER");
    expect(panel.querySelector("h1")?.textContent).toBe("I turn complex ideas into products that matter.");
    expect(panel.querySelector(".hero-glass-support")?.textContent).toBe(
      "Building AI-powered products for real people, from enterprise systems to indie experiments.",
    );
    const links = [...panel.querySelectorAll("a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links).toEqual([
      ["Explore my work →", "#credentials"],
      ["Let's connect", "/contact"],
    ]);
    expect(HERO_GLASS_COPY.eyebrow).toBe("PRODUCT MANAGER · AI BUILDER");
  });

  it("keeps the previous hero's sheet in the HTML (shown below 1024 by CSS), the art and a single torn edge", async () => {
    const doc = await renderHero(true);
    expect(doc.querySelector("h1#hero-h")?.textContent).toBe("I turn messy problems into AI-native products people actually use.");
    expect(doc.querySelector("section.hero-sheet#hero-copy")).not.toBeNull();
    expect(doc.querySelector("[data-paper-scene]")).not.toBeNull();
    expect(doc.querySelectorAll(".hero-polaroid")).toHaveLength(3);
    expect(doc.querySelectorAll(".hero-sheet [data-decor='torn']")).toHaveLength(1); // one torn edge, no second sheet
  });
});

describe("HOME_GLASS_HERO_ENABLED — flag OFF (the previous hero, exactly)", () => {
  it("renders the old copy, old CTAs, intro video and sheet; no glass markup or scope class", async () => {
    const doc = await renderHero(false);
    const section = doc.querySelector("section.hero")!;
    expect(section.getAttribute("aria-labelledby")).toBe("hero-h");
    expect(section.getAttribute("class")).toBe("hero"); // no hero-glass-on scope: every glass CSS rule is inert
    expect(doc.querySelector("[data-hero-glass]")).toBeNull();
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("h1#hero-h")?.textContent).toBe("I turn messy problems into AI-native products people actually use.");
    expect(doc.querySelector(".hero-eyebrow")?.textContent).toBe(hero.eyebrow.text);
    expect(doc.querySelector(".hero-support")?.textContent).toBe(hero.support.text);
    expect(doc.querySelector(".hero-cta-row a[href='/projects']")?.textContent).toContain("View my work");
    expect(doc.querySelector(".hero-cta-row a[href='#ask']")?.textContent).toContain("Ask Tushky");
    expect(doc.querySelector("section.hero-sheet#hero-copy")).not.toBeNull();
    expect(doc.querySelector(".hero-intro")).not.toBeNull();
  });
});
