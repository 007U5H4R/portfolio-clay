import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { hero } from "@/data/hero";
import { PII_PATTERNS } from "@/scripts/forbidden-strings";

/**
 * TKT-72 — `BandFooter` (Design.md §4.2; S16, S18, S5, EXE-8).
 *   TC-135 (S18 regression, kept permanently): `hero.tagline.text` renders exactly once, in the © bar,
 *          inside `[data-hand="quote"]` with an sr-only "Source:" sibling (the §3.4 quote rule).
 *   TC-136: location behind `site.showLocation` (module mock), GitHub circle only with `site.github`
 *          AND a `links.repoPublic` project, résumé circle from `resumeAction()` (PB5 placeholder),
 *          the DRAFT hiring tag in its on-band tone.
 *   TC-137: the band's rendered text carries no phone / DOB / street-address pattern.
 *
 * Each case re-imports the component after `vi.doMock` so the mocked module is the one it closes over.
 */

type SiteModule = typeof import("@/lib/site");
type ProjectsModule = typeof import("@/data/projects");

async function renderBand(opts: {
  site?: Partial<SiteModule["site"]>;
  repoPublic?: boolean;
  tagline?: string;
} = {}) {
  vi.resetModules();
  if (opts.site) {
    const overrides = opts.site;
    vi.doMock("@/lib/site", async (importOriginal) => {
      const actual = await importOriginal<SiteModule>();
      return { ...actual, site: { ...actual.site, ...overrides } };
    });
  }
  if (opts.repoPublic !== undefined) {
    const repoPublic = opts.repoPublic;
    vi.doMock("@/data/projects", async (importOriginal) => {
      const actual = await importOriginal<ProjectsModule>();
      return {
        ...actual,
        projects: actual.projects.map((p) => ({ ...p, links: { ...p.links, repoPublic } })),
      };
    });
  }
  if (opts.tagline !== undefined) {
    const text = opts.tagline;
    vi.doMock("@/data/hero", async (importOriginal) => {
      const actual = await importOriginal<typeof import("@/data/hero")>();
      return { ...actual, hero: { ...actual.hero, tagline: { ...actual.hero.tagline, text } } };
    });
  }
  const { BandFooter } = await import("@/components/layout/BandFooter");
  return render(<BandFooter />);
}

afterEach(() => {
  vi.doUnmock("@/lib/site");
  vi.doUnmock("@/data/projects");
  vi.doUnmock("@/data/hero");
  vi.resetModules();
});

describe("BandFooter — landmark + markup (§4.2)", () => {
  it("is one <footer> labelled by h2#band-h, with exactly one counted decoration (torn)", async () => {
    const { container } = await renderBand();
    const footers = container.querySelectorAll("footer");
    expect(footers).toHaveLength(1);
    const footer = footers[0]!;
    expect(footer.getAttribute("aria-labelledby")).toBe("band-h");
    // TASK-118: the heading's accessible text stays one stable sentence (the cycling verbs are aria-hidden).
    expect(screen.getByRole("heading", { level: 2 })).toHaveAccessibleName(/^Let's build\s*something people can use\.$/);
    const decor = footer.querySelectorAll("[data-decor]");
    expect(decor).toHaveLength(1);
    expect(decor[0]!.getAttribute("data-decor")).toBe("torn");
    expect(footer.querySelector(".band-bar")?.textContent).toContain(
      "© 2026 Tushar Pathak. Built with curiosity, chai & Claude Code.",
    );
  });

  it("links email to /contact; the hiring line is signed off, so it carries no draft tag (TASK-167)", async () => {
    const { container } = await renderBand();
    const { site } = await import("@/lib/site");
    const email = screen.getByRole("link", { name: site.email });
    expect(email.getAttribute("href")).toBe("/contact");
    expect(container.querySelector(".band-hire")?.textContent).toContain("Hiring for PM, AI PM or AI-builder roles? Say hi.");
    expect(container.querySelector(".band-hire [data-paper='tag']")).toBeNull();
  });
});

describe("TC-135 · S18 regression — hero.tagline rendered exactly once, as a sourced hand quote", () => {
  it("renders hero.tagline.text once, inside [data-hand=quote] in the © bar, with an sr-only Source: sibling", async () => {
    const { container } = await renderBand();
    const matches = screen.getAllByText(hero.tagline.text);
    expect(matches).toHaveLength(1);
    const quote = matches[0]!;
    expect(quote.getAttribute("data-hand")).toBe("quote");
    expect(quote.closest(".band-bar")).not.toBeNull();
    expect(container.querySelectorAll('[data-hand="quote"]')).toHaveLength(1);
    const sibling = quote.nextElementSibling;
    expect(sibling).not.toBeNull();
    expect(sibling).toHaveClass("sr-only");
    // The attribution names the author, never the internal provenance string (`hero.tagline.source`
    // is a PORT reference that would read the quote twice to screen readers — Design.md §11 Dev-20).
    expect(sibling!.textContent).toBe("Source: Tushar Pathak");
    expect(sibling!.textContent).not.toContain(hero.tagline.text);
  });

  it("negative control: a blanked tagline fails the count", async () => {
    await renderBand({ tagline: "" });
    expect(screen.queryAllByText(hero.tagline.text)).toHaveLength(0);
  });
});

describe("TC-136 · conditionals follow their single sources", () => {
  it('"Bengaluru, India" is absent with showLocation false (default) and present in the © bar when true', async () => {
    const off = await renderBand();
    expect(off.container.textContent).not.toContain("Bengaluru, India");
    off.unmount();

    const on = await renderBand({ site: { showLocation: true } });
    const bar = on.container.querySelector(".band-bar") as HTMLElement;
    expect(within(bar).getByText("Bengaluru, India")).toBeTruthy();
  });

  it("GitHub circle: present with site.github + a public repo; absent when either is missing", async () => {
    const both = await renderBand();
    expect(screen.queryByRole("link", { name: "GitHub" })).not.toBeNull();
    both.unmount();

    const noPublic = await renderBand({ repoPublic: false });
    expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull();
    noPublic.unmount();

    await renderBand({ site: { github: "" } });
    expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull();
  });

  it("résumé circle derives from resumeAction(): PB5 placeholder label + /contact#resume", async () => {
    await renderBand();
    const { resumeAction } = await import("@/lib/site");
    const resume = resumeAction();
    expect(resume.label).toBe("Resume — updating");
    const link = screen.getByRole("link", { name: resume.label });
    expect(link.getAttribute("href")).toBe("/contact#resume");
    expect(link.hasAttribute("download")).toBe(false);
  });

  it("every social circle carries an aria-label; external ones open safely", async () => {
    const { container } = await renderBand();
    const circles = Array.from(container.querySelectorAll(".band-social a"));
    expect(circles).toHaveLength(4); // LinkedIn, GitHub, résumé, digital card (TASK-166)
    for (const a of circles) expect(a.getAttribute("aria-label")).toBeTruthy();
    for (const name of ["LinkedIn", "GitHub"]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toMatch(/noopener/);
    }
  });

  it("TASK-166: the digital business card circle links to /card in the same tab", async () => {
    await renderBand();
    const card = screen.getByRole("link", { name: "Digital business card" });
    expect(card.getAttribute("href")).toBe("/card");
    expect(card.hasAttribute("target")).toBe(false);
  });
});

describe("TC-137 · the band adds the approved public contact and no PII", () => {
  it("rendered text (location flag on, worst case) matches no PII_PATTERNS rule", async () => {
    const { container } = await renderBand({ site: { showLocation: true } });
    const text = container.textContent ?? "";
    for (const [name, re] of Object.entries(PII_PATTERNS)) {
      expect(re.test(text), `${name} matched band text`).toBe(false);
    }
  });

  it("positive control: the same rules catch a planted phone number", () => {
    expect(PII_PATTERNS.PHONE.test("call +91 98765 43210")).toBe(true);
  });
});

describe("TASK-118 · the band headline's cycling italic verb", () => {
  type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
  let ioCallback: IOCallback | null = null;

  function stubBrowser(reduce: boolean) {
    ioCallback = null;
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: reduce && query.includes("reduce"), media: query })),
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IOCallback) {
          ioCallback ??= cb; // the first observer is the verb cycler's; OceanGate (M-011) creates a later one
        }
        observe() {}
        disconnect() {}
      },
    );
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stacks the six verbs in order (build → ship → design → fix → create → rethink), all aria-hidden", async () => {
    const { BAND_VERBS } = await import("@/components/layout/BandVerb");
    expect(BAND_VERBS).toEqual(["build", "ship", "design", "fix", "create", "rethink"]);
    const { container } = await renderBand();
    const h2 = container.querySelector("h2#band-h")!;
    const stack = h2.querySelector("em .band-verbs")!;
    expect(stack.getAttribute("aria-hidden")).toBe("true");
    expect(Array.from(stack.querySelectorAll(".band-verbs-word")).map((w) => w.textContent)).toEqual([...BAND_VERBS]);
    expect(h2.querySelector("em > .sr-only")?.textContent).toBe("build");
    expect(h2.querySelector("[aria-live]")).toBeNull();
    expect(h2.querySelector(".dim")?.textContent).toBe("something people can use.");
  });

  it("starts cycling only once in view, and pauses when it leaves", async () => {
    stubBrowser(false);
    const { container } = await renderBand();
    const stack = container.querySelector<HTMLElement>(".band-verbs")!;
    expect(stack.dataset.cycle, "nothing runs before the band is in view").toBeUndefined();
    act(() => ioCallback!([{ isIntersecting: true }]));
    expect(stack.dataset.cycle).toBe("run");
    act(() => ioCallback!([{ isIntersecting: false }]));
    expect(stack.dataset.cycle).toBe("paused");
  });

  it("reduced motion: static 'build', never cycles, heading text unchanged", async () => {
    stubBrowser(true);
    const { container } = await renderBand();
    const stack = container.querySelector<HTMLElement>(".band-verbs")!;
    expect(ioCallback, "no observer is created under reduced motion").toBeNull();
    expect(stack.dataset.cycle).toBeUndefined();
    expect(screen.getByRole("heading", { level: 2 })).toHaveAccessibleName(/^Let's build\s*something people can use\.$/);
  });
});
