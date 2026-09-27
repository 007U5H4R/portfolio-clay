/**
 * fallback-glyphs.spec.ts — no system-wide font-fallback search on the Lighthouse-gated pages
 * (TKT-92 r4, TASK-88).
 *
 * The web fonts are subset to `latin`. When a glyph is outside every family in an element's
 * `font-family` stack, Chrome searches the installed system fonts for it. That search runs at first
 * layout and again after the web-font swap. On `/` two such glyphs, "✦" (hero CTA) and "↳" (the
 * featured flow sketch), made the first two layouts ≈ 56 + 76 ms instead of ≈ 12. Lighthouse's
 * mobile CPU model multiplies that by 4, which was most of the page's ~600 ms TBT on the preview.
 *
 * The rule: every platform font that renders text on the page is either named in that element's
 * computed `font-family` or is the browser's default face for the stack's generic family (Times New
 * Roman / Helvetica / Apple Chancery on macOS, cheap because they are tried before any search). A
 * glyph resolved any other way came from the system search. To fix it, name the family that
 * supplies it (see `.hero-btn-spark` in app/globals.css) or use a glyph the web fonts carry.
 */
import { test, expect } from "./fixtures";

const ROUTES = ["/", "/work/teachspark"] as const;
/** Chrome's per-generic default faces (checked before any system search), by platform. */
const GENERIC_DEFAULTS = new Set([
  // macOS
  "Times New Roman",
  "Times",
  "Helvetica",
  "Apple Chancery",
  "Courier",
  // Linux / Windows CI equivalents
  "DejaVu Serif",
  "DejaVu Sans",
  "Liberation Serif",
  "Liberation Sans",
  "Arial",
  "Comic Sans MS",
]);

const families = (stack: string) =>
  stack
    .split(",")
    .map((f) => f.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

type DomNode = { nodeId: number; nodeType: number; nodeName: string; children?: DomNode[]; nodeValue?: string };

for (const route of ROUTES) {
  test(`${route}: every glyph resolves without a system font-fallback search`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "CSS.getPlatformFontsForNode is a Chromium DevTools API");
    const w = page.viewportSize()?.width ?? 0;
    test.skip(w !== 390 && w !== 1440, "text content is width-independent; 390 and 1440 cover the MediaGate splits");
    await page.goto(route, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = (await cdp.send("DOM.getDocument", { depth: -1 })) as { root: DomNode };

    // Elements with a non-blank direct text child, outside <head>/<script>/<style>.
    const textElements: DomNode[] = [];
    const walk = (n: DomNode) => {
      if (["HEAD", "SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(n.nodeName)) return;
      if (n.nodeType === 1 && n.children?.some((c) => c.nodeType === 3 && c.nodeValue?.trim())) textElements.push(n);
      n.children?.forEach(walk);
    };
    walk(root);
    expect(textElements.length).toBeGreaterThan(20);

    const stackOf = async (nodeId: number) => {
      const { computedStyle } = (await cdp.send("CSS.getComputedStyleForNode", { nodeId })) as {
        computedStyle: { name: string; value: string }[];
      };
      return families(computedStyle.find((p) => p.name === "font-family")?.value ?? "");
    };
    const descendants = (n: DomNode): DomNode[] =>
      (n.children ?? []).filter((c) => c.nodeType === 1).flatMap((c) => [c, ...descendants(c)]);

    const offenders: string[] = [];
    for (const el of textElements) {
      // Chrome reports the fonts of the element's whole subtree, so a family named on a descendant
      // (e.g. `.hero-btn-spark` inside the Ask link) counts as named.
      const { fonts } = (await cdp.send("CSS.getPlatformFontsForNode", { nodeId: el.nodeId })) as {
        fonts: { familyName: string; isCustomFont: boolean }[];
      };
      const system = fonts.filter((f) => !f.isCustomFont).map((f) => f.familyName);
      if (!system.length) continue;
      const stack = new Set(await stackOf(el.nodeId));
      for (const d of descendants(el)) for (const f of await stackOf(d.nodeId)) stack.add(f);
      for (const fam of system) {
        if (!stack.has(fam) && !GENERIC_DEFAULTS.has(fam)) {
          const text = el.children?.find((c) => c.nodeType === 3)?.nodeValue?.trim().slice(0, 40);
          offenders.push(`<${el.nodeName.toLowerCase()}> "${text}" → system-search font "${fam}"`);
        }
      }
    }
    expect(offenders, "glyphs found by a system font-fallback search (name the family in CSS)").toEqual([]);
  });
}
