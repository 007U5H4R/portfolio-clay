/**
 * The `/about` hero collage (TASK-136, spec §3–§4): four modular cut-paper pieces the page lays out in
 * HTML, so the collage recomposes per width (spec §45: fewer objects on phones) instead of shipping one
 * flattened picture. Each piece reinforces research → systems → products → impact:
 *
 *   research-sketches  a graph-paper notebook page (gears, a node network, a small bar chart) under an
 *                      engineering drawing fragment (a sectioned device with centre lines + dimensions)
 *   systems-collage    the terracotta cut-paper sun behind a generic city of towers and a dusty-blue
 *                      mountain horizon (enterprise scale)
 *   books-stack        four stacked books — AI · Systems · Products · Impact on the spines — with a sage sprig
 *   product-desk       an open notebook of product sketches, a laptop showing a mountain horizon, a mug
 */
import { circle, el, g, line, path, pine, poly, rect, smooth, type P } from "../portfolio-art/kit";
import { box, collageSvg, piece, ridgePts, ring, screens, strokes, torn, type Collage } from "../portfolio-art/collage";
import { C, dimension, gear, grid, inkLine, onSheet, ruled, sheet, sprig, tape } from "./shared";

export const researchSketches: Collage = {
  slug: "research-sketches",
  render() {
    const W = 760;
    const H = 640;
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];

    // A · the graph-paper notebook page (left, behind)
    const a = [40, 90, 400, 500] as const;
    out.push(sheet(defs, "rs-a", a, -6, 3, C.grid, { screen: ["hl", 0.2] }));
    out.push(
      onSheet(
        a,
        -6,
        grid(60, 110, 360, 460, 24),
        // gears meshing (the "how things work" sketch)
        gear(170, 230, 58, 10),
        gear(262, 190, 34, 8, { "stroke-width": 2.6 }),
        // a node network (systems)
        ...([[300, 300], [360, 262], [372, 342], [312, 380]] as P[]).map(([x, y]) => circle(x, y, 12, { fill: C.rim, stroke: C.navy2, "stroke-width": 3 })),
        strokes(
          [
            [[300, 300], [360, 262]],
            [[300, 300], [372, 342]],
            [[360, 262], [372, 342]],
            [[372, 342], [312, 380]],
            [[300, 300], [312, 380]],
          ],
          { stroke: C.navy2, "stroke-width": 2.4, "stroke-dasharray": "2 6", "stroke-linecap": "round" },
        ),
        circle(360, 262, 5, { fill: C.rust }),
        // a hand-drawn bar chart
        inkLine([[88, 540], [88, 400]], { "stroke-width": 2.6 }),
        inkLine([[88, 540], [250, 540]], { "stroke-width": 2.6 }),
        rect(104, 494, 22, 46, { fill: C.dusty, stroke: C.navy2, "stroke-width": 2.4 }),
        rect(140, 470, 22, 70, { fill: C.dusty, stroke: C.navy2, "stroke-width": 2.4 }),
        rect(176, 440, 22, 100, { fill: C.sun, stroke: C.navy2, "stroke-width": 2.4 }),
        rect(212, 420, 22, 120, { fill: C.dusty, stroke: C.navy2, "stroke-width": 2.4 }),
        inkLine([[100, 480], [150, 452], [188, 420], [236, 396]], { stroke: C.rust, "stroke-width": 2.6 }),
        // an arrow from the gears to the network (idea → system)
        inkLine([[222, 262], [262, 286], [282, 296]], { "stroke-width": 2.4 }),
        path("M270,300L284,297L276,285", { fill: "none", stroke: C.navy2, "stroke-width": 2.4, "stroke-linejoin": "round" }),
        ruled(290, 440, 110, 90, 22, 7, { "stroke-width": 2.6, opacity: 0.8 }),
      ),
    );
    out.push(tape(defs, "rs-ta", 170, 70, 120, 34, -9, 11));

    // B · the engineering drawing fragment (right, front): a sectioned cylinder with a piston
    const b = [330, 40, 390, 330] as const;
    out.push(sheet(defs, "rs-b", b, 5, 17, C.cream, { screen: ["hl", 0.25] }));
    const hatch: [P, P][] = [];
    for (let x = 420; x < 640; x += 12) hatch.push([[x, 150], [x + 16, 134]], [[x, 262], [x + 16, 246]]);
    out.push(
      onSheet(
        b,
        5,
        // centre line
        line([380, 198], [690, 198], { stroke: C.rust, "stroke-width": 1.8, "stroke-dasharray": "22 6 4 6" }),
        // the cylinder walls (sectioned)
        rect(412, 132, 236, 20, { fill: "none", stroke: C.navy2, "stroke-width": 3 }),
        rect(412, 244, 236, 20, { fill: "none", stroke: C.navy2, "stroke-width": 3 }),
        el("clipPath", { id: "rs-hc" }, rect(412, 132, 236, 20) + rect(412, 244, 236, 20)),
        g({ "clip-path": "url(#rs-hc)" }, strokes(hatch, { stroke: C.navy2, "stroke-width": 1.6 })),
        // the piston + rod
        rect(470, 156, 60, 84, { rx: 4, fill: C.dustyLight, stroke: C.navy2, "stroke-width": 3 }),
        line([470, 176], [530, 176], { stroke: C.navy2, "stroke-width": 1.6 }),
        line([470, 220], [530, 220], { stroke: C.navy2, "stroke-width": 1.6 }),
        rect(530, 188, 150, 20, { fill: "none", stroke: C.navy2, "stroke-width": 3 }),
        circle(686, 198, 14, { fill: "none", stroke: C.navy2, "stroke-width": 3 }),
        // dimensions + a detail circle
        dimension([412, 300], [648, 300]),
        line([412, 268], [412, 312], { stroke: C.navy2, "stroke-width": 1.4 }),
        line([648, 268], [648, 312], { stroke: C.navy2, "stroke-width": 1.4 }),
        dimension([380, 132], [380, 264]),
        circle(500, 198, 78, { fill: "none", stroke: C.steel, "stroke-width": 1.6, "stroke-dasharray": "6 6" }),
        ruled(560, 330, 110, 16, 16, 3, { "stroke-width": 2.4 }),
      ),
    );
    out.push(tape(defs, "rs-tb", 500, 22, 110, 32, 6, 23));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const systemsCollage: Collage = {
  slug: "systems-collage",
  render() {
    const W = 900;
    const H = 700;
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    // the terracotta sun (spec §4), cut from paper
    out.push(piece(defs, "sc-sun", torn(ring(640, 220, 170, 44), 5, 4, 14), { fill: C.sun, screen: ["hl", 0.2] }, C.shade));
    // the mountain horizon (dusty blue, subtle)
    out.push(
      piece(
        defs,
        "sc-far",
        torn(ridgePts([[60, 520], [170, 430], [260, 470], [380, 380], [470, 450], [600, 400], [720, 470], [860, 410]], 720), 13, 4, 12, 3),
        { fill: C.dustyLight, rim: C.rim, rimWidth: 4, screen: ["hs", 0.08] },
        C.shade,
      ),
    );
    // a generic city: back towers (steel), front towers (navy / slate), window grids
    const towers: [x: number, w: number, top: number, fill: string, spire?: boolean][] = [
      [120, 70, 330, C.steel],
      [200, 56, 270, C.dusty],
      [268, 84, 170, C.navy2, true],
      [364, 66, 250, C.steel],
      [442, 80, 300, C.navy],
      [534, 70, 390, C.navy2],
      [616, 60, 430, C.steel],
      [690, 64, 360, C.dusty],
      [766, 60, 450, C.steel],
    ];
    towers.forEach(([x, w, top, fill, spire], i) => {
      out.push(piece(defs, `sc-t${i}`, torn(box(x, top, w, 690 - top), 30 + i, 1.6, 12), { fill, rim: C.rim, rimWidth: 3, shadow: 0.7 }, C.shade));
      if (spire) out.push(poly([[x + w / 2 - 6, top], [x + w / 2, top - 70], [x + w / 2 + 6, top]], { fill }), line([x + w / 2, top - 70], [x + w / 2, top - 96], { stroke: fill, "stroke-width": 3 }));
      const wins: [P, P][] = [];
      for (let y = top + 24; y < 660; y += 22) for (let xx = x + 12; xx < x + w - 12; xx += 16) wins.push([[xx, y], [xx + 7, y]]);
      out.push(strokes(wins, { stroke: i % 3 === 1 ? C.note : C.rim, "stroke-width": 7, opacity: fill === C.navy || fill === C.navy2 ? 0.55 : 0.4 }));
    });
    // a low foreground block + street torn edge
    out.push(piece(defs, "sc-ground", torn(box(80, 640, 800, 70), 71, 4, 12), { fill: C.navy2, rim: C.rim, rimWidth: 4 }, C.shade));
    // two small birds
    out.push(inkLine([[250, 150], [262, 142], [272, 152]], { "stroke-width": 2.4 }), inkLine([[282, 130], [292, 124], [300, 132]], { "stroke-width": 2 }));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const booksStack: Collage = {
  slug: "books-stack",
  render() {
    const W = 640;
    const H = 520;
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    // the sprig behind the stack (left)
    out.push(sprig([96, 470], 330, -24, C.sage), sprig([150, 480], 250, -8, C.sageLight));
    // books, top → bottom: spine box, page-block end, bands, the lettered title (the only text in the About art)
    const books: [x: number, y: number, w: number, h: number, cover: string, title: string, size: number][] = [
      [150, 110, 330, 76, C.navy2, "AI", 40],
      [128, 186, 364, 80, C.terracotta, "Systems", 36],
      [150, 266, 350, 80, C.forest, "Products", 36],
      [118, 346, 390, 86, "#7a5a3a", "Impact", 38],
    ];
    books.forEach(([x, y, w, h, cover, title, size], i) => {
      const tilt = [-2.2, 1.2, -1, 0.6][i]!;
      const cx = x + w / 2;
      const cy = y + h / 2;
      out.push(
        g(
          { transform: `rotate(${tilt} ${cx} ${cy})` },
          // page block (cream) peeking at the right end
          rect(x + w - 16, y + 6, 40, h - 12, { rx: 6, fill: C.cream, stroke: C.navy, "stroke-width": 2.6 }),
          strokes(
            Array.from({ length: 5 }, (_, k) => [[x + w - 4, y + 14 + k * ((h - 28) / 4)], [x + w + 20, y + 14 + k * ((h - 28) / 4)]] as [P, P]),
            { stroke: C.rule, "stroke-width": 1.6 },
          ),
          // the spine
          rect(x, y, w, h, { rx: 10, fill: cover, stroke: C.navy, "stroke-width": 3 }),
          rect(x, y, w, h, { rx: 10, fill: "url(#hs)", opacity: 0.12 }),
          rect(x + 26, y + 10, 5, h - 20, { fill: C.kraft, opacity: 0.8 }),
          rect(x + 38, y + 10, 2.5, h - 20, { fill: C.kraft, opacity: 0.6 }),
          rect(x + w - 44, y + 10, 5, h - 20, { fill: C.kraft, opacity: 0.8 }),
          el(
            "text",
            {
              x: cx - 8,
              y: cy + size * 0.34,
              "text-anchor": "middle",
              "font-family": "Georgia, 'Times New Roman', serif",
              "font-size": size,
              fill: C.cream,
              "letter-spacing": 1,
            },
            title,
          ),
        ),
      );
    });
    // a pencil across the top book
    out.push(
      g(
        { transform: "rotate(-8 330 96)" },
        rect(220, 88, 210, 16, { rx: 3, fill: C.yellow, stroke: C.navy, "stroke-width": 2.4 }),
        poly([[430, 88], [462, 96], [430, 104]], { fill: C.kraft, stroke: C.navy, "stroke-width": 2.4, "stroke-linejoin": "round" }),
        poly([[452, 93.5], [462, 96], [452, 98.5]], { fill: C.navy }),
        rect(206, 88, 16, 16, { rx: 3, fill: C.rust, stroke: C.navy, "stroke-width": 2.4 }),
      ),
    );
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const productDesk: Collage = {
  slug: "product-desk",
  render() {
    const W = 900;
    const H = 500;
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    // the open notebook (left): two torn pages with a spine shadow
    out.push(sheet(defs, "pd-l", [40, 150, 230, 300], -4, 41, C.cream, { screen: ["hl", 0.25] }));
    out.push(sheet(defs, "pd-r", [262, 144, 230, 300], 3, 43, C.cream, { screen: ["hl", 0.25] }));
    out.push(
      onSheet(
        [40, 150, 230, 300],
        -4,
        // a product map: a blob "territory" with a route and pins (no lettering)
        path(smooth([[80, 220], [150, 190], [220, 214], [240, 280], [190, 330], [110, 318], [74, 268]], true), { fill: C.sageLight, stroke: C.navy2, "stroke-width": 2.6 }),
        inkLine([[100, 300], [140, 262], [184, 276], [214, 232]], { stroke: C.rust, "stroke-dasharray": "8 7" }),
        circle(100, 300, 7, { fill: C.rust }),
        circle(214, 232, 7, { fill: C.navy2 }),
        ruled(70, 370, 170, 50, 18, 5, { "stroke-width": 2.4 }),
      ),
      onSheet(
        [262, 144, 230, 300],
        3,
        // a flow sketch: three boxes and arrows (problem → build → learn)
        ...[0, 1, 2].map((k) => rect(292, 184 + k * 74, 90, 44, { rx: 6, fill: k === 1 ? C.note : "none", stroke: C.navy2, "stroke-width": 2.6 })),
        inkLine([[337, 228], [337, 256]], { "stroke-width": 2.4 }),
        inkLine([[337, 302], [337, 330]], { "stroke-width": 2.4 }),
        inkLine([[382, 354], [440, 330], [442, 220], [384, 206]], { "stroke-width": 2.2, stroke: C.rust }),
        ruled(404, 380, 64, 34, 16, 9, { "stroke-width": 2.2 }),
      ),
    );
    out.push(line([266, 156], [258, 448], { stroke: C.shade, "stroke-width": 4, opacity: 0.18 }));

    // the laptop (right): screen with a mountain horizon, then the base
    const scr = { x: 520, y: 90, w: 330, h: 214 };
    out.push(
      rect(scr.x - 14, scr.y - 14, scr.w + 28, scr.h + 28, { rx: 14, fill: C.navy2, stroke: C.navy, "stroke-width": 3 }),
      el("clipPath", { id: "pd-screen" }, rect(scr.x, scr.y, scr.w, scr.h, { rx: 4 })),
      g(
        { "clip-path": "url(#pd-screen)" },
        rect(scr.x, scr.y, scr.w, scr.h, { fill: "#f4dcc4" }),
        circle(scr.x + 236, scr.y + 88, 34, { fill: C.sun, opacity: 0.9 }),
        path(`M${scr.x},${scr.y + 170}L${scr.x + 60},${scr.y + 104}L${scr.x + 110},${scr.y + 140}L${scr.x + 180},${scr.y + 70}L${scr.x + 250},${scr.y + 140}L${scr.x + 330},${scr.y + 96}L${scr.x + 330},${scr.y + 214}L${scr.x},${scr.y + 214}Z`, { fill: C.dusty }),
        path(`M${scr.x + 160},${scr.y + 90}L${scr.x + 180},${scr.y + 70}L${scr.x + 202},${scr.y + 92}L${scr.x + 190},${scr.y + 88}L${scr.x + 180},${scr.y + 96}L${scr.x + 170},${scr.y + 88}Z`, { fill: C.rim }),
        path(`M${scr.x},${scr.y + 214}L${scr.x},${scr.y + 170}L${scr.x + 90},${scr.y + 150}L${scr.x + 170},${scr.y + 178}L${scr.x + 260},${scr.y + 150}L${scr.x + 330},${scr.y + 170}L${scr.x + 330},${scr.y + 214}Z`, { fill: C.steel }),
        ...[0, 1, 2, 3, 4].map((k) => pine(scr.x + 30 + k * 64, scr.y + 214, 60 + (k % 2) * 18, 30, { fill: C.forest })),
      ),
      path(`M${scr.x - 44},${scr.y + scr.h + 16}L${scr.x + scr.w + 44},${scr.y + scr.h + 16}L${scr.x + scr.w + 70},${scr.y + scr.h + 48}L${scr.x - 70},${scr.y + scr.h + 48}Z`, {
        fill: C.dustyLight,
        stroke: C.navy,
        "stroke-width": 3,
        "stroke-linejoin": "round",
      }),
      rect(scr.x + scr.w / 2 - 44, scr.y + scr.h + 36, 88, 8, { rx: 4, fill: C.steel }),
    );
    // the mug (front right)
    out.push(
      path("M786,370L786,448Q786,468 806,468L846,468Q866,468 866,448L866,370Z", { fill: C.cream, stroke: C.navy, "stroke-width": 3, "stroke-linejoin": "round" }),
      el("ellipse", { cx: 826, cy: 370, rx: 40, ry: 9, fill: "#6b4a33", stroke: C.navy, "stroke-width": 3 }),
      path("M866,392Q896,394 894,420Q892,444 866,442", { fill: "none", stroke: C.navy, "stroke-width": 3 }),
      rect(786, 400, 80, 10, { fill: C.dusty }),
      inkLine([[812, 352], [806, 334], [814, 318]], { stroke: C.inkSoft, "stroke-width": 2, opacity: 0.6 }),
    );
    out.push(tape(defs, "pd-t", 200, 128, 104, 30, -5, 47));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const heroPieces: readonly Collage[] = [researchSketches, systemsCollage, booksStack, productDesk];
