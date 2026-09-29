import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { IndependentProductsShowcase } from "@/components/portfolio/IndependentProductsShowcase";
import { EnterpriseClientWork } from "@/components/portfolio/EnterpriseClientWork";
import { buildPortfolioProducts, stepIndex, type PortfolioProduct } from "@/lib/portfolio";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { enterpriseCases } from "@/data/enterprise";
import { collections, validateAll } from "@/data/index";
import type { PortfolioEntry } from "@/data/schema";

/**
 * TASK-116 — the Portfolio showcase + data model (Tushar's spec 2026-09-28 §8–§12, §17–§23, §27–§35, §50).
 *
 * The media fixture is the proof that videos "light up without code changes": two fixture products
 * carry made-up YouTube / Vimeo ids (TASK-122 — jsdom never loads an embed), and the SAME components that render the real (video-less)
 * catalogue grow the Pitch / Demo actions, mount exactly one player on press, swap it on Pitch ↔ Demo
 * and drop it on a product change.
 */

const FIXTURE: PortfolioProduct[] = [
  {
    id: "alpha",
    name: "Alpha",
    tagline: "First fixture cover",
    description: "A fixture product with a YouTube pitch and a YouTube demo.",
    statusLabel: "Live",
    meta: "Live",
    lettering: "rounded",
    coverGlyph: "Film",
    art: { src: "/media/fixture-cover.svg", width: 1600, height: 900, alt: "Illustration of a fixture cover." },
    glyph: "Film",
    code: "AL-01",
    accent: "steel",
    position: 1,
    pitchVideo: { provider: "youtube", videoId: "abcdefghijk", title: "Alpha pitch video" },
    demoVideo: { provider: "youtube", videoId: "zyxwvutsrqp", title: "Alpha product demonstration" },
    productUrl: "https://alpha.example.com",
    githubUrl: "https://github.com/example/alpha",
    prdUrl: "https://docs.example.com/alpha-prd",
    caseStudyHref: "/work/alpha",
  },
  {
    id: "beta",
    name: "Beta",
    tagline: "Second fixture cover",
    description: "A fixture product with only a Vimeo demo and nothing else.",
    statusLabel: "Prototype",
    meta: "Prototype",
    lettering: "block",
    art: { src: "/media/fixture-cover-b.svg", width: 1600, height: 900, alt: "Illustration of a second fixture cover." },
    coverGlyph: "Monitor",
    glyph: "Users",
    code: "BE-01",
    accent: "rust",
    position: 2,
    demoVideo: { provider: "vimeo", videoId: "123456789", title: "Beta product demonstration" },
    caseStudyHref: "/work/beta",
  },
  {
    id: "gamma",
    name: "Gamma",
    tagline: "Third fixture cover",
    description: "A fixture product with no media and no links at all.",
    statusLabel: "Research",
    meta: "Research",
    lettering: "script",
    art: { src: "/media/fixture-cover-c.svg", width: 1600, height: 900, alt: "Illustration of a third fixture cover." },
    coverGlyph: "Brush",
    glyph: "Search",
    code: "GA-01",
    accent: "forest",
    position: 3,
    caseStudyHref: "/work/gamma",
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  window.history.replaceState(null, "", "/projects");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const panel = () => screen.getByRole("tabpanel");
const players = (root: HTMLElement) => root.querySelectorAll("video, iframe");

describe("IndependentProductsShowcase — media fixture (spec §8–§10, §22–§23)", () => {
  it("defaults to the first product in pitch mode, poster only, no player mounted", () => {
    render(<IndependentProductsShowcase products={FIXTURE} />);
    expect(panel()).toHaveAttribute("data-active-product", "alpha");
    expect(panel()).toHaveAttribute("data-media-mode", "pitch");
    expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveAttribute("aria-selected", "true");
    expect(players(document.body)).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Play Alpha pitch video" })).toBeInTheDocument();
  });

  it("renders all five actions when the data has them — Pitch/Demo switch the stage, links open a new tab", () => {
    render(<IndependentProductsShowcase products={FIXTURE} />);
    const actions = within(screen.getByRole("list", { name: "Alpha actions" }));
    expect(actions.getByRole("button", { name: "Pitch video" })).toHaveAttribute("aria-pressed", "true");
    expect(actions.getByRole("button", { name: "Demo video" })).toHaveAttribute("aria-pressed", "false");
    for (const name of [/^Product link: Alpha/, /^GitHub: Alpha/, /^PRD: Alpha/]) {
      const link = actions.getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("press play mounts exactly one privacy-enhanced iframe; Demo swaps it (poster first); Pitch restores the poster", () => {
    render(<IndependentProductsShowcase products={FIXTURE} />);
    fireEvent.click(screen.getByRole("button", { name: "Play Alpha pitch video" }));
    const pitch = screen.getByTitle("Alpha pitch video");
    expect(pitch.tagName).toBe("IFRAME");
    expect(pitch.getAttribute("src")).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/abcdefghijk\?/);
    expect(players(document.body)).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Demo video" }));
    expect(panel()).toHaveAttribute("data-media-mode", "demo");
    // Switching unmounts the pitch player; the demo starts at its poster (never autoplays).
    expect(players(document.body)).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Play Alpha product demonstration" }));
    const frame = screen.getByTitle("Alpha product demonstration");
    expect(frame.getAttribute("src")).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/zyxwvutsrqp\?/);
    expect(players(document.body)).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Pitch video" }));
    expect(panel()).toHaveAttribute("data-media-mode", "pitch");
    expect(players(document.body)).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Play Alpha pitch video" })).toBeInTheDocument();
  });

  it("changing product stops the player, resets to pitch and updates the panel + URL (replace, no push)", async () => {
    render(<IndependentProductsShowcase products={FIXTURE} />);
    fireEvent.click(screen.getByRole("button", { name: "Demo video" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Alpha product demonstration" }));
    await screen.findByTitle("Alpha product demonstration");
    const before = window.history.length;

    fireEvent.click(screen.getByRole("tab", { name: /Beta/ }));
    expect(panel()).toHaveAttribute("data-active-product", "beta");
    expect(panel()).toHaveAttribute("data-media-mode", "pitch");
    expect(players(document.body)).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 2, name: "Beta" })).toBeInTheDocument();
    expect(window.location.search).toBe("?product=beta");
    expect(window.history.length).toBe(before);

    // Beta has no pitch: no Pitch action, no play control on the pitch stage — a "coming" tag instead.
    expect(screen.queryByRole("button", { name: "Pitch video" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Play Beta pitch/ })).toBeNull();
    expect(screen.getByText("Pitch video coming")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Demo video" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Beta product demonstration" }));
    expect((await screen.findByTitle("Beta product demonstration")).getAttribute("src")).toMatch(/^https:\/\/player\.vimeo\.com\/video\/123456789\?/);
  });

  it("re-choosing the current product returns it to the pitch poster and stops the player (spec §18)", async () => {
    render(<IndependentProductsShowcase products={FIXTURE} />);
    fireEvent.click(screen.getByRole("button", { name: "Demo video" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Alpha product demonstration" }));
    await screen.findByTitle("Alpha product demonstration");
    fireEvent.click(screen.getByRole("tab", { name: /Alpha/ }));
    expect(panel()).toHaveAttribute("data-media-mode", "pitch");
    expect(players(document.body)).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Play Alpha pitch video" })).toBeInTheDocument();
  });

  it("hides every unavailable action — no disabled dead buttons (spec §22)", () => {
    render(<IndependentProductsShowcase products={FIXTURE} />);
    fireEvent.click(screen.getByRole("tab", { name: /Gamma/ }));
    const actions = screen.getByRole("list", { name: "Gamma actions" });
    expect(actions.children).toHaveLength(0);
    expect(document.querySelector("button[disabled], a[aria-disabled]")).toBeNull();
    expect(screen.getByRole("link", { name: /Read the case study/ })).toHaveAttribute("href", "/work/gamma");
  });

  it("a blocked embed shows the cover + 'Video unavailable here.' + Watch on YouTube (video-embed spec §17)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<IndependentProductsShowcase products={FIXTURE} />);
    fireEvent.click(screen.getByRole("button", { name: "Play Alpha pitch video" }));
    const frame = screen.getByTitle("Alpha pitch video") as HTMLIFrameElement;
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: JSON.stringify({ event: "onError", info: 150 }), origin: "https://www.youtube-nocookie.com", source: frame.contentWindow }),
      );
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Video unavailable here.");
    expect(screen.getByRole("link", { name: /^Watch on YouTube/ })).toHaveAttribute("href", "https://www.youtube.com/watch?v=abcdefghijk");
    expect(players(document.body)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
  });

  it("carousel: arrows + keyboard loop, roving tabindex, deep link read on mount", () => {
    window.history.replaceState(null, "", "/projects?product=gamma");
    render(<IndependentProductsShowcase products={FIXTURE} />);
    expect(panel()).toHaveAttribute("data-active-product", "gamma");
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, -1, 0]);

    fireEvent.click(screen.getByRole("button", { name: "Next product" })); // wraps gamma → alpha
    expect(panel()).toHaveAttribute("data-active-product", "alpha");
    fireEvent.click(screen.getByRole("button", { name: "Previous product" })); // wraps alpha → gamma
    expect(panel()).toHaveAttribute("data-active-product", "gamma");

    fireEvent.keyDown(screen.getByRole("tab", { name: /Gamma/ }), { key: "ArrowRight" });
    expect(panel()).toHaveAttribute("data-active-product", "alpha");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: /Alpha/ }));
    fireEvent.keyDown(document.activeElement as Element, { key: "End" });
    expect(panel()).toHaveAttribute("data-active-product", "gamma");
    fireEvent.keyDown(document.activeElement as Element, { key: "Home" });
    expect(panel()).toHaveAttribute("data-active-product", "alpha");
  });

  it("an unknown deep link falls back to the default product", () => {
    window.history.replaceState(null, "", "/projects?product=vendor-passport");
    render(<IndependentProductsShowcase products={FIXTURE} />);
    expect(panel()).toHaveAttribute("data-active-product", "alpha");
  });

  it("stepIndex wraps both ways", () => {
    expect(stepIndex(0, -1, 3)).toBe(2);
    expect(stepIndex(2, 1, 3)).toBe(0);
    expect(stepIndex(1, 1, 3)).toBe(2);
  });
});

/** Stand-in for the page's manifest lookup (app/projects/page.tsx). */
const resolveArt = (id: string) => ({ src: `/media/illustrations/covers/${id}.svg`, width: 1600, height: 900, alt: `Illustration of ${id}.` });

describe("Portfolio data model (spec §5, §21)", () => {
  const products = buildPortfolioProducts(projects, portfolioEntries, resolveArt);
  const personal = projects.filter((p) => p.category === "personal");

  it("lists every personal build once, in data order — never a professional entry", () => {
    expect(products.map((p) => p.id)).toEqual(personal.map((p) => p.slug));
    expect(products.some((p) => p.id === "vendor-passport")).toBe(false);
  });

  it("derives facts from data/projects.ts: live link, public repo only, local demo MP4", () => {
    for (const product of products) {
      const project = personal.find((p) => p.slug === product.id)!;
      expect(product.name).toBe(project.name);
      expect(product.description).toBe(project.tagline);
      expect(product.productUrl).toBe(project.links.live);
      expect(product.githubUrl).toBe(project.links.repoPublic ? project.links.github : undefined);
    }
    const [first] = personal;
    // TASK-122: the portfolio plays provider videos only — a local MP4 stays on the /work case study.
    const withLocal = buildPortfolioProducts(
      [{ ...first!, links: { ...first!.links, demoVideo: { src: "/video/fixture-tiny.mp4", poster: "/video/fixture-tiny-poster.webp", durationSec: 10 } } }],
      portfolioEntries,
      resolveArt,
    );
    expect(withLocal[0]?.demoVideo).toBeUndefined();
    // TASK-125: RailCite carries Tushar's YouTube pitch + demo.
    const railcite = products.find((p) => p.id === "railcite");
    expect(railcite?.pitchVideo).toMatchObject({ provider: "youtube", videoId: "nI3EqDXd5Io", title: "RailCite pitch video" });
    expect(railcite?.demoVideo).toMatchObject({ provider: "youtube", videoId: "B3x-I1J8JW8", title: "RailCite product demonstration" });
    // TASK-124: Campfire Board carries its pitch + demo (YouTube, default titles); every
    // other product still shows the "coming" state.
    const campfire = products.find((p) => p.id === "campfire-board");
    expect(campfire?.pitchVideo).toEqual({ provider: "youtube", videoId: "K_-510L6e7g", title: "Campfire Board pitch video", poster: undefined });
    expect(campfire?.demoVideo).toEqual({ provider: "youtube", videoId: "DkxDQji3dz8", title: "Campfire Board product demonstration", poster: undefined });
    expect(campfire?.productUrl).toBeUndefined(); // a local tool — no product link
    expect(campfire?.githubUrl).toBe("https://github.com/007U5H4R/pm-dashboard"); // public repo (2026-09-28)
    // TASK-129: Slag City carries its launch pitch + demo, a live product link and its public repo.
    const slag = products.find((p) => p.id === "slag-city");
    expect(slag?.pitchVideo).toEqual({ provider: "youtube", videoId: "1xvj8j79Svs", title: "Slag City pitch video", poster: undefined });
    expect(slag?.demoVideo).toEqual({ provider: "youtube", videoId: "tc4QDVl8NJM", title: "Slag City product demonstration", poster: undefined });
    expect(slag?.productUrl).toBe("https://slag-city.vercel.app");
    expect(slag?.githubUrl).toBe("https://github.com/007U5H4R/slag-city"); // public repo (2026-09-29)
    expect(products.filter((p) => !["railcite", "campfire-board", "slag-city"].includes(p.id)).every((p) => !p.pitchVideo && !p.demoVideo)).toBe(true);
    // An entry's { provider, videoId } becomes the player's media with the default title (spec §15).
    const withPitch = buildPortfolioProducts(
      [first!],
      portfolioEntries.map((e) => (e.slug === first!.slug ? { ...e, pitchVideo: { provider: "youtube" as const, videoId: "abcdefghijk" } } : e)),
      resolveArt,
    );
    expect(withPitch[0]?.pitchVideo).toEqual({ provider: "youtube", videoId: "abcdefghijk", title: `${first!.name} pitch video`, poster: undefined });
  });

  it("TASK-127: every product carries its own hand-authored SVG cover; a cover-art id without a resolver throws", () => {
    // every personal build names a distinct `cover-<slug>` art (one artwork per product, spec §10: no repeated artwork)
    expect(portfolioEntries.map((e) => e.coverArt)).toEqual(portfolioEntries.map((e) => `cover-${e.slug}`));
    const sources = products.map((p) => p.art.src);
    expect(new Set(sources).size).toBe(products.length);
    for (const product of products) expect(product.art.src).toBe(`/media/illustrations/covers/cover-${product.id}.svg`);
    expect(() => buildPortfolioProducts(projects, portfolioEntries)).toThrow(/needs a resolver/);
  });

  it("TASK-121: the info-sheet metadata is short and only shortens the project's own status label", () => {
    for (const product of products) {
      expect(product.meta.length, product.id).toBeLessThanOrEqual(40);
      // every word of the short label already appears in the full status label (or the tagline for "team PRD" / "patent record")
      const source = `${product.statusLabel} ${product.description}`.toLowerCase();
      for (const word of product.meta.toLowerCase().split(/[\s·]+/).filter(Boolean)) {
        expect(source, `${product.id}: "${word}"`).toContain(word);
      }
    }
  });

  it("TASK-121: the stage shows the short metadata, never the full operational sentence", () => {
    render(<IndependentProductsShowcase products={products} />);
    expect(screen.getByText("Live pilot · Twilio sandbox")).toBeInTheDocument();
    expect(screen.queryByText(/uptime after/)).toBeNull();
  });

  it("the content gate rejects a missing entry and a demo set in two places", () => {
    const missing = validateAll({ ...collections, portfolio: portfolioEntries.slice(1) });
    expect(missing.ok).toBe(false);
    const [first, ...rest] = collections.projects;
    const doubled: PortfolioEntry[] = portfolioEntries.map((e, i) => (i === 0 ? { ...e, demoVideo: { provider: "youtube", videoId: "abcdefghijk" } } : e));
    const twoSources = validateAll({
      ...collections,
      projects: [{ ...first!, links: { ...first!.links, demoVideo: { src: "/video/x.mp4", poster: "/video/x-poster.webp", durationSec: 10 } } }, ...rest],
      portfolio: doubled,
    });
    expect(twoSources.ok).toBe(false);
    if (!twoSources.ok) expect(twoSources.issues.join("\n")).toMatch(/keep one source/);
  });
});

describe("Enterprise case files (spec §27–§35)", () => {
  it("is exactly the six grouped cards, in the spec's order, and passes the content gate", () => {
    expect(enterpriseCases.map((c) => c.client)).toEqual([
      "Pear Health Labs",
      "Mojix",
      "Google Cloud",
      "Telus Health / LifeWorks",
      "LifePoint Health",
      "Indiana University Health",
    ]);
    expect(validateAll().ok).toBe(true);
  });

  it("groups Pear (3 programs) and LifePoint (3 engagements); Google HMLE and IU Health stay separate", () => {
    const byId = Object.fromEntries(enterpriseCases.map((c) => [c.id, c]));
    expect(byId["pear-health-labs"]?.workstreams.map((w) => w.name)).toEqual([
      "AWS → GCP foundation",
      "Enterprise API migration",
      "Snowflake → BigQuery",
    ]);
    expect(byId["lifepoint-health"]?.workstreams.map((w) => w.name)).toEqual([
      "FHIR reconciliation & testing",
      "Verato SFTP → GCS",
      "HDE managed services",
    ]);
    expect(byId["google-cloud-hmle"]?.summary).not.toMatch(/Indiana|IU Health/);
  });

  it("never carries a budget, commercial figure or file path — and the gate rejects one", () => {
    const text = JSON.stringify(enterpriseCases);
    expect(text).not.toMatch(/[$€£₹]|budget|\.pdf|\/Users\/|Downloads|Desktop/i);
    const leaked = validateAll({ ...collections, enterprise: [{ ...enterpriseCases[0]!, summary: `${enterpriseCases[0]!.summary} Budget: $143,887.` }] });
    expect(leaked.ok).toBe(false);
  });

  it("renders six case files with no links (no detail pages exist — spec §34) and no Source line (TASK-131)", () => {
    const { container } = render(<EnterpriseClientWork cases={enterpriseCases} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(screen.queryAllByText(/^Source:/)).toHaveLength(0);
    expect(container.textContent).not.toMatch(/Project Manager portfolio|Résumé, p/);
    expect(container.querySelector("[data-decor]")).not.toBeNull();
  });
});

describe("performance guard (spec §24, §48)", () => {
  it("the portfolio components never import motion (the old WorkIndex AnimatePresence cost ~51 kB gz)", () => {
    const dir = resolve(process.cwd(), "components/portfolio");
    for (const file of readdirSync(dir)) {
      const src = readFileSync(resolve(dir, file), "utf8");
      expect(src, file).not.toMatch(/from ["']motion|from ["']framer-motion/);
    }
  });
});
