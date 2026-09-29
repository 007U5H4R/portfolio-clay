import { INK, ringText, stampFilter, svg, type Asset } from "../kit";

/**
 * RailCite (railway field notebook / circular archive): a round "circular · cited · checked"
 * office stamp around a document glyph, and a rectangular "Refusal = success" stamp. Generic
 * office stamps — no railway emblem, logo or organisation name.
 */
const circular = svg(
  200,
  200,
  `<defs>${stampFilter("rs", 4)}</defs><g filter="url(#rs)" fill="none" stroke="${INK.rust}" stroke-width="4"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="66" stroke-width="2.5"/></g><g filter="url(#rs)">${ringText(
    "ring",
    100,
    100,
    74,
    "CIRCULAR ✦ CITED ✦ CHECKED ✦ ON RECORD ✦",
    `font-family="Georgia, serif" font-size="15.5" font-weight="700" letter-spacing="2.1" fill="${INK.rust}"`,
  )}<g stroke="${INK.rust}" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"><path d="M80 66h30l14 14v52H80z"/><path d="M110 66v14h14"/><path d="M88 94h26M88 104h26M88 114h16"/><path d="M104 126l7 7 14-15" stroke-width="4.5"/></g></g>`,
);

const refusal = svg(
  260,
  130,
  `<defs>${stampFilter("rf", 9)}</defs><g filter="url(#rf)"><rect x="6" y="6" width="248" height="118" rx="10" fill="none" stroke="${INK.rust}" stroke-width="5"/><rect x="16" y="16" width="228" height="98" rx="6" fill="none" stroke="${INK.rust}" stroke-width="2"/><text x="130" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="700" letter-spacing="3" fill="${INK.rust}">REFUSAL</text><text x="130" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" letter-spacing="2" fill="${INK.rust}">= SUCCESS</text></g>`,
);

/** Ruled page with a title bar and n lines, rotated about its centre. */
function page(x: number, y: number, w: number, h: number, rot: number, lines: number, tone: string, mark = ""): string {
  const rows = Array.from({ length: lines }, (_, i) => {
    const ly = y + 70 + i * 26;
    const lw = i % 4 === 3 ? w * 0.45 : w * 0.72;
    return `<rect x="${x + 34}" y="${ly}" width="${lw.toFixed(0)}" height="7" rx="3.5" fill="${INK.steel}" opacity="0.38"/>`;
  }).join("");
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x + 8}" y="${y + 12}" width="${w}" height="${h}" rx="4" fill="${INK.navy}" opacity="0.28"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${tone}" stroke="${INK.navy}" stroke-width="3"/><rect x="${x + 34}" y="${y + 30}" width="${(w * 0.42).toFixed(0)}" height="14" rx="3" fill="${INK.navy2}"/><rect x="${x + w - 96}" y="${y + 28}" width="62" height="18" rx="3" fill="none" stroke="${INK.rust}" stroke-width="3"/>${rows}${mark}</g>`;
}

/** The product-demo poster: a desk of circulars under a magnifier, one page ticked "cited". Text-free. */
const demoPoster = svg(
  1600,
  900,
  `<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${INK.steel}" stroke-opacity="0.22" stroke-width="1.5"/></pattern><radialGradient id="lamp" cx="0.62" cy="0.3" r="0.75"><stop offset="0" stop-color="${INK.note}" stop-opacity="0.55"/><stop offset="1" stop-color="${INK.note}" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="${INK.navy2}"/><rect width="1600" height="900" fill="url(#grid)"/><rect width="1600" height="900" fill="url(#lamp)"/>
<path d="M0 640 C 400 610 1200 610 1600 640 V900 H0Z" fill="${INK.kraft}"/><path d="M0 640 C 400 610 1200 610 1600 640" fill="none" stroke="${INK.navy}" stroke-width="4"/>
<g stroke="${INK.navy}" stroke-width="4"><rect x="120" y="470" width="300" height="46" rx="4" fill="${INK.rust}"/><rect x="132" y="516" width="286" height="44" rx="4" fill="${INK.steel}"/><rect x="112" y="560" width="316" height="50" rx="4" fill="${INK.forest}"/></g>
<g fill="${INK.note}" opacity="0.9"><rect x="150" y="486" width="120" height="8" rx="4"/><rect x="160" y="532" width="90" height="8" rx="4"/><rect x="146" y="578" width="140" height="8" rx="4"/></g>
${page(470, 250, 380, 470, -7, 12, INK.paper2)}
${page(620, 210, 400, 500, 4, 13, INK.ivory, `<g fill="none" stroke="${INK.forest}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><circle cx="930" cy="610" r="52" stroke-width="7"/><path d="M905 610l18 20 34-40"/></g>`)}
<g transform="rotate(-24 1160 470)"><circle cx="1160" cy="420" r="118" fill="${INK.note}" fill-opacity="0.18" stroke="${INK.navy}" stroke-width="14"/><circle cx="1160" cy="420" r="96" fill="none" stroke="${INK.ivory}" stroke-opacity="0.5" stroke-width="5" stroke-dasharray="60 400"/><rect x="1146" y="536" width="28" height="170" rx="12" fill="${INK.terracotta}" stroke="${INK.navy}" stroke-width="5"/></g>
<g fill="${INK.note}"><circle cx="1330" cy="120" r="5"/><circle cx="1420" cy="80" r="3"/><circle cx="1250" cy="170" r="3"/></g>`,
);

export const railciteAssets: Asset[] = [
  { file: "demo-poster.svg", svg: demoPoster },
  { file: "stamp-circular.svg", svg: circular },
  { file: "stamp-refusal.svg", svg: refusal },
];
