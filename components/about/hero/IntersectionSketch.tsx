import { Sheet } from "@/components/paper/Sheet";
import { Tape } from "@/components/paper/Tape";
import { ABOUT_CHECKLIST, ABOUT_VENN } from "./about-hero-data";

/**
 * Spec §14, §16, §29: a torn notebook page holding a hand-sketched Venn — People · Products ·
 * Intelligent Systems, the centre where all three meet tinted terracotta — over a three-item
 * checklist, with a sage sprig taped to its edge.
 *
 * Accessibility / EVAL-018 (Design.md §3.2):
 *   - The Venn is a meaningful inline-SVG figure (`role="img"` + `<title>`), not a decoration: its
 *     labels are SVG text, so the "a sketch with text must be aria-hidden" rule does not apply.
 *   - The checklist is Caveat, so the visible list is `aria-hidden` and an sr-only twin carries the
 *     words (the Dev-69 Ask-heading precedent) — no information exists only in handwriting (spec §26).
 *   - The sprig is ONE `data-decor="collage"` object (a generated `collage-leaf-1` crop, `alt=""`) —
 *     the `/about` hero's fourth and last counted decoration. Its tape is the page's fastener.
 */

/** A hand-drawn circle: 10 points with a deterministic radius wobble, closing past its start. */
function sketchCircle(cx: number, cy: number, r: number, seed: number): string {
  const n = 10;
  const pts = Array.from({ length: n + 2 }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + seed;
    const wobble = 1 + 0.035 * Math.sin(i * 2.3 + seed * 5) + (i > n ? 0.05 : 0);
    return [cx + Math.cos(a) * r * wobble, cy + Math.sin(a) * r * wobble] as const;
  });
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0]![0])} ${f(pts[0]![1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!;
    const [x1, y1] = pts[i]!;
    // Catmull-Rom-ish midpoint smoothing: quadratic through the midpoint keeps it round but loose.
    d += ` Q${f(x0)} ${f(y0)} ${f((x0 + x1) / 2)} ${f((y0 + y1) / 2)}`;
  }
  return d;
}

const CIRCLES = [
  { cx: 82, cy: 66, r: 48, seed: 0.3 },
  { cx: 134, cy: 66, r: 48, seed: 1.7 },
  { cx: 108, cy: 110, r: 48, seed: 3.1 },
] as const;

const PATHS = CIRCLES.map((c) => sketchCircle(c.cx, c.cy, c.r, c.seed));

export function IntersectionSketch() {
  const [people, products, systems] = ABOUT_VENN;
  const [a, b, c] = CIRCLES;
  return (
    <div className="ahero-notebook-wrap" data-enter="notebook">
      <Sheet as="figure" variant="card" rotate={0.9} className="ahero-notebook">
        <Tape side="l" className="ahero-sprig-tape" />
        <span className="ahero-sprig" data-decor="collage" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 20 kB decorative collage crop, like the other collages */}
          <img src="/media/illustrations/collage-leaf-1.webp" alt="" width={120} height={366} loading="lazy" decoding="async" />
        </span>

        <svg className="ahero-venn" viewBox="22 10 178 160" role="img" aria-labelledby="ahero-venn-title" focusable="false">
          <title id="ahero-venn-title">
            {`Venn diagram: ${people}, ${products} and ${systems} overlap; the centre, where all three meet, is highlighted.`}
          </title>
          <defs>
            <clipPath id="ahero-venn-a">
              <circle cx={a.cx} cy={a.cy} r={a.r} />
            </clipPath>
            <clipPath id="ahero-venn-ab" clipPath="url(#ahero-venn-a)">
              <circle cx={b.cx} cy={b.cy} r={b.r} />
            </clipPath>
          </defs>
          <circle className="ahero-venn-core" cx={c.cx} cy={c.cy} r={c.r} clipPath="url(#ahero-venn-ab)" />
          {PATHS.map((d) => (
            <path key={d} className="ahero-venn-ring" d={d} />
          ))}
          <text className="ahero-venn-label" x={58} y={56} textAnchor="middle">
            {people}
          </text>
          <text className="ahero-venn-label" x={160} y={56} textAnchor="middle">
            {products}
          </text>
          <text className="ahero-venn-label" x={108} y={134} textAnchor="middle">
            <tspan x={108}>Intelligent</tspan>
            <tspan x={108} dy={17}>
              Systems
            </tspan>
          </text>
        </svg>

        <ul className="ahero-checklist font-hand" aria-hidden="true">
          {ABOUT_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul className="sr-only">
          {ABOUT_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
