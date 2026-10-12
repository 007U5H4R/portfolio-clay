import type { Page } from "@playwright/test";

/**
 * TASK-196 — the "hero and footer are unchanged" fingerprint. For the opener scene, the About hero and
 * the band footer it hashes (a) the normalised outer HTML (React `useId` tokens stripped) and (b) every
 * element's computed style plus its size, with reduced motion on so one-shot reveals have settled.
 * Positions are left out (a longer body moves the footer; its look must not change).
 * The committed baseline (`about-paper-baseline.json`) was captured from main at ef4c36c, before the redesign.
 */
export const REGIONS = {
  opener: '[data-opener="scene-about"]',
  hero: 'section[aria-labelledby="about-hero-heading"]',
  footer: "footer.band",
} as const;

export type Fingerprint = Record<keyof typeof REGIONS, { html: string; style: string; elements: number }>;

export async function fingerprint(page: Page): Promise<Fingerprint> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about", { waitUntil: "load" });
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
        for (let i = 0; i < cs.length; i++) {
          const prop = cs.item(i);
          // layout-derived values depend on position/viewport content, not on the element's own look
          if (/^(perspective-origin|transform-origin|block-size|inline-size|inset|top|left|right|bottom)/.test(prop)) continue;
          row += `|${prop}:${cs.getPropertyValue(prop)}`;
        }
        style += row + "\n";
      }
      out[name] = { html: hash(html), style: hash(style), elements: els.length };
    }
    return out;
  }, REGIONS) as Promise<Fingerprint>;
}
