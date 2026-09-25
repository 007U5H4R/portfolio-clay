import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
    expect(footer.querySelector("h2#band-h")?.textContent).toMatch(/^Let's build\s*something people can use\.$/);
    const decor = footer.querySelectorAll("[data-decor]");
    expect(decor).toHaveLength(1);
    expect(decor[0]!.getAttribute("data-decor")).toBe("torn");
    expect(footer.querySelector(".band-bar")?.textContent).toContain(
      "© 2026 Tushar Pathak. Built with curiosity, chai & Claude Code.",
    );
  });

  it("links email to /contact and renders the DRAFT hiring tag in the on-band tone", async () => {
    const { container } = await renderBand();
    const { site } = await import("@/lib/site");
    const email = screen.getByRole("link", { name: site.email });
    expect(email.getAttribute("href")).toBe("/contact");
    const tag = container.querySelector(".band-hire [data-paper='tag']")!;
    expect(tag.textContent).toBe("Draft — pending sign-off");
    expect(tag).toHaveClass("text-ivory", "draft-tag-on-band");
    expect(tag).not.toHaveClass("text-terracotta");
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
    expect(sibling!.textContent).toBe(`Source: ${hero.tagline.source}`);
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
    expect(circles).toHaveLength(3);
    for (const a of circles) expect(a.getAttribute("aria-label")).toBeTruthy();
    for (const name of ["LinkedIn", "GitHub"]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toMatch(/noopener/);
    }
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
