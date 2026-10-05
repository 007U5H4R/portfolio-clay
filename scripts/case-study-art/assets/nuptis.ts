import { INK, svg, type Asset } from "../kit";

/**
 * Nuptis (a wedding planner's run-sheet): a swagged marigold garland strung with small leaves —
 * the edge of the hero. Flowers are simple layered discs; no venue, brand or religious emblem.
 */
function garland(): string {
  const w = 1200;
  const parts: string[] = [];
  const swags = 4;
  const span = w / swags;
  for (let s = 0; s < swags; s++) {
    for (let i = 0; i <= 18; i++) {
      const t = i / 18;
      const x = s * span + t * span;
      const y = 18 + Math.sin(t * Math.PI) * 46;
      const r = 11 + ((i * 7) % 3);
      const c = i % 3 === 0 ? INK.terracotta : INK.note;
      parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 0.45).toFixed(1)}" fill="${i % 3 === 0 ? INK.note : INK.rust}" opacity="0.8"/>`);
      if (i % 6 === 3) parts.push(`<path d="M${(x - 4).toFixed(1)} ${(y + 10).toFixed(1)} q -10 16 -2 28 q 10 -12 2 -28z" fill="${INK.forest}"/>`);
    }
  }
  return svg(w, 90, `<path d="M0 18 ${Array.from({ length: swags }, (_, s) => `Q ${s * span + span / 2} 110 ${(s + 1) * span} 18`).join(" ")}" fill="none" stroke="${INK.forest}" stroke-width="2"/>${parts.join("")}`);
}

export const nuptisAssets: Asset[] = [{ file: "garland.svg", svg: garland() }];
