import type { Page } from "@playwright/test";

/**
 * TASK-196 — the "hero and footer are unchanged" fingerprint. For the opener scene, the About hero and
 * the band footer it hashes (a) the normalised outer HTML (React `useId` tokens stripped) and (b) every
 * element's computed style plus its size, with reduced motion on so one-shot reveals have settled.
 * Positions are left out (a longer body moves the footer; its look must not change).
 * The committed baseline (`about-paper-baseline.json`) is a snapshot of main (its `_capturedFrom` key names the
 * commit). main's hero/footer change in later releases, so a snapshot goes stale: at merge time either point
 * ABOUT_BASELINE_URL at a running build of origin/main (the spec then fingerprints that live), or recapture the
 * JSON from an origin/main build:
 *   ABOUT_BASELINE_OUT=tests/e2e/about-paper-baseline.json ABOUT_BASELINE_FROM=$(git rev-parse --short origin/main) \
 *     PW_BASE_URL=http://127.0.0.1:<port> pnpm test:e2e tests/e2e/about-paper-capture.spec.ts   # run inside an origin/main checkout
 * Origin-free: computed `url(...)` values are absolute (`http://127.0.0.1:<port>/...`), so the page's origin is stripped
 * and a build served on another port fingerprints the same.
 * Custom properties are not hashed (see the TASK-324 note in the loop): only resolved properties are.
 * Computed-style rows list their properties sorted by name: Chrome enumerates custom properties (`--*`) in an
 * order that changes from one page load to the next, so an unsorted hash differs between two loads of the same build.
 */
export const REGIONS = {
  opener: '[data-opener="scene-about"]',
  hero: 'section[aria-labelledby="about-hero-heading"]',
  footer: "footer.band",
} as const;

export type Fingerprint = Record<keyof typeof REGIONS, { html: string; style: string; elements: number }>;

export async function fingerprint(page: Page, origin = ""): Promise<Fingerprint> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${origin}/about`, { waitUntil: "load" });
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  return page.evaluate((regions) => {
    const hash = (text: string) => {
      let h1 = 0xdeadbeef ^ text.length;
      let h2 = 0x41c6ce57 ^ text.length;
      for (let i = 0; i < text.length; i++) {
        const c = text.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    };
    const out: Record<string, { html: string; style: string; elements: number }> = {};
    for (const [name, selector] of Object.entries(regions)) {
      const root = document.querySelector(selector);
      if (!root) {
        out[name] = { html: "missing", style: "missing", elements: 0 };
        continue;
      }
      const html = root.outerHTML.replace(/_R_[A-Za-z0-9_]+_/g, "_ID_");
      const els = [root, ...root.querySelectorAll("*")];
      let style = "";
      for (const el of els) {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        let row = `${el.tagName}|${Math.round(rect.width)}x${Math.round(rect.height)}`;
        const props = Array.from({ length: cs.length }, (_, i) => cs.item(i)).sort();
        for (const prop of props) {
          // layout-derived values depend on position/viewport content, not on the element's own look
          // TASK-324: custom properties (`--*`) are inherited, so every token added to :root (TASK-304/307 --pp-* / --lit-*,
          // TASK-301 --pc-*, ...) lands in every element's computed list and flipped this hash while nothing visible changed (proved
          // pixel-identical, light and dark, and zero non-custom computed-style differences, against the build before TASK-307).
          // What a custom property does shows up in the properties that read it, which stay hashed.
          if (prop.startsWith("--")) continue;
          if (/^(perspective-origin|transform-origin|block-size|inline-size|inset|top|left|right|bottom)/.test(prop)) continue;
          // url(...) values (background-image, ...) come back absolute; the server's origin is not part of the look
          row += `|${prop}:${cs.getPropertyValue(prop).split(location.origin).join("")}`;
        }
        style += row + "\n";
      }
      out[name] = { html: hash(html), style: hash(style), elements: els.length };
    }
    return out;
  }, REGIONS) as Promise<Fingerprint>;
}
