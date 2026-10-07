/**
 * The Research & Intellectual Work artifacts (TASK-136, spec §19–§22), 520 × 400 each, text-free:
 *
 *   research-nano    a microscope field of a nanoparticle monolayer — two close-packed domains meeting at
 *                    a grain boundary (the Soft Matter paper's subject: coexisting phases in monolayers),
 *                    printed as a photo with a white border
 *   patent-sheet     a patent drawing of a portable point-of-care analyser: a handheld reader with a
 *                    screen, an electrode test strip inserted, leader lines to blank callouts, a dimension
 *                    line; a ruled sheet with a rust seal behind (no legal text)
 *   research-papers  a fanned stack of three article pages: title bars, two ruled columns, a figure with
 *                    a sigmoid response curve and data points (the aptasensor paper's kind of figure)
 */
import { circle, el, g, line, rect, type P } from "../portfolio-art/kit";
import { collageSvg, prng, screens, strokes, type Collage } from "../portfolio-art/collage";
import { C, dimension, inkLine, onSheet, ruled, seal, sheet, tape } from "./shared";

const W = 520;
const H = 400;

export const researchNano: Collage = {
  slug: "research-nano",
  render() {
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    const photo = [70, 40, 380, 320] as const;
    out.push(sheet(defs, "rn-photo", photo, -3, 61, C.rim, { depth: 2.5 }));
    const cx = 260;
    const cy = 190;
    const r = 132;
    defs.push(el("clipPath", { id: "rn-field" }, circle(cx, cy, r)));
    const rand = prng(19);
    const dots: string[] = [];
    // two hexagonal domains, rotated against each other, meeting along a wavy boundary
    const domain = (deg: number, keep: (x: number, y: number) => boolean) => {
      const a = (deg * Math.PI) / 180;
      const s = 17;
      for (let i = -12; i <= 12; i += 1) {
        for (let j = -12; j <= 12; j += 1) {
          const lx = i * s + (j % 2 ? s / 2 : 0);
          const ly = j * s * 0.866;
          const x = cx + lx * Math.cos(a) - ly * Math.sin(a);
          const y = cy + lx * Math.sin(a) + ly * Math.cos(a);
          if (Math.hypot(x - cx, y - cy) > r + 10 || !keep(x, y)) continue;
          if (rand() < 0.035) continue; // a vacancy
          dots.push(circle(x + (rand() - 0.5) * 1.6, y + (rand() - 0.5) * 1.6, 6.6, { fill: "url(#rn-dot)" }));
        }
      }
    };
    const boundary = (x: number) => cy + 26 * Math.sin((x - cx) / 46) - (x - cx) * 0.32;
    domain(0, (x, y) => y < boundary(x) - 4);
    domain(17, (x, y) => y > boundary(x) + 4);
    defs.push(
      el(
        "radialGradient",
        { id: "rn-dot", cx: 0.38, cy: 0.35, r: 0.7 },
        el("stop", { offset: 0, "stop-color": "#eef1f6" }) + el("stop", { offset: 0.55, "stop-color": C.dusty }) + el("stop", { offset: 1, "stop-color": C.steel }),
      ),
    );
    out.push(
      onSheet(
        photo,
        -3,
        circle(cx, cy, r + 8, { fill: C.navy }),
        g({ "clip-path": "url(#rn-field)" }, circle(cx, cy, r, { fill: "#1a2442" }), ...dots),
        circle(cx, cy, r, { fill: "none", stroke: C.navy, "stroke-width": 6 }),
        // a scale bar (no label)
        rect(cx + 56, cy + r - 34, 44, 6, { fill: C.rim }),
      ),
    );
    out.push(tape(defs, "rn-t", 200, 24, 110, 30, -6, 67));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const patentSheet: Collage = {
  slug: "patent-sheet",
  render() {
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    // back sheet: ruled text + a rust seal
    const back = [250, 30, 230, 300] as const;
    out.push(sheet(defs, "ps-back", back, 6, 71, C.cream, { screen: ["hl", 0.25] }));
    out.push(onSheet(back, 6, rect(280, 60, 120, 10, { rx: 3, fill: C.navy2, opacity: 0.7 }), ruled(280, 94, 170, 150, 18, 5, { "stroke-width": 2.6 }), seal(420, 280, 26)));
    // front sheet: the device drawing
    const front = [40, 50, 290, 330] as const;
    out.push(sheet(defs, "ps-front", front, -4, 73, C.rim, { screen: ["hl", 0.2] }));
    const ink = { fill: "none", stroke: C.navy2, "stroke-width": 3, "stroke-linejoin": "round" } as const;
    out.push(
      onSheet(
        front,
        -4,
        // the electrode test strip entering from the top
        rect(160, 80, 44, 110, { rx: 4, ...ink, fill: C.cream }),
        strokes([[[172, 90], [172, 160]], [[182, 90], [182, 160]], [[192, 90], [192, 160]]], { stroke: C.rust, "stroke-width": 2.4 }),
        ...[172, 182, 192].map((x) => circle(x, 90, 3.2, { fill: C.rust })),
        // the handheld reader body, screen, buttons
        rect(110, 160, 144, 190, { rx: 26, ...ink, fill: C.dustyLight }),
        rect(132, 188, 100, 64, { rx: 8, ...ink, fill: C.cream }),
        inkLine([[142, 236], [162, 226], [182, 230], [200, 206], [222, 202]], { stroke: C.steel, "stroke-width": 2.4 }),
        ...[150, 182, 214].map((x) => circle(x, 290, 11, { ...ink, fill: C.cream })),
        rect(148, 318, 68, 8, { rx: 4, fill: C.navy2, opacity: 0.6 }),
        // hatched section of the slot
        strokes([[[164, 168], [176, 160]], [[176, 168], [188, 160]], [[188, 168], [200, 160]]], { stroke: C.navy2, "stroke-width": 1.4 }),
        // leader lines to blank callout circles
        line([204, 110], [262, 92], { stroke: C.navy2, "stroke-width": 1.6 }),
        circle(272, 90, 10, { ...ink, "stroke-width": 2 }),
        line([232, 214], [276, 200], { stroke: C.navy2, "stroke-width": 1.6 }),
        circle(286, 198, 10, { ...ink, "stroke-width": 2 }),
        line([118, 300], [80, 318], { stroke: C.navy2, "stroke-width": 1.6 }),
        circle(70, 322, 10, { ...ink, "stroke-width": 2 }),
        // overall height dimension
        dimension([284, 160], [284, 350]),
        line([256, 160], [296, 160], { stroke: C.navy2, "stroke-width": 1.2 }),
        line([256, 350], [296, 350], { stroke: C.navy2, "stroke-width": 1.2 }),
      ),
    );
    out.push(tape(defs, "ps-t", 136, 34, 100, 28, 5, 79));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const researchPapers: Collage = {
  slug: "research-papers",
  render() {
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    const page = (id: string, rectangle: readonly [number, number, number, number], deg: number, seed: number, figure: boolean) => {
      const [x, y, w] = rectangle;
      out.push(sheet(defs, id, rectangle, deg, seed, C.rim, { screen: ["hl", 0.2] }));
      const col = (w - 60) / 2;
      const body: string[] = [
        rect(x + 24, y + 24, w * 0.66, 10, { rx: 3, fill: C.navy2, opacity: 0.85 }),
        rect(x + 24, y + 42, w * 0.44, 7, { rx: 3, fill: C.navy2, opacity: 0.45 }),
        line([x + 22, y + 60], [x + w - 22, y + 60], { stroke: C.navy2, "stroke-width": 1.6 }),
        ruled(x + 24, y + 76, col - 6, 150, 13, seed, { "stroke-width": 2.2, opacity: 0.8 }),
      ];
      if (figure) {
        const fx = x + 36 + col;
        const fy = y + 76;
        body.push(
          rect(fx, fy, col - 10, 98, { fill: C.paper, stroke: C.navy2, "stroke-width": 1.6 }),
          inkLine([[fx + 10, fy + 12], [fx + 10, fy + 86], [fx + col - 20, fy + 86]], { "stroke-width": 1.8 }),
          inkLine([[fx + 12, fy + 80], [fx + 36, fy + 76], [fx + 56, fy + 52], [fx + 74, fy + 26], [fx + col - 22, fy + 20]], { stroke: C.rust, "stroke-width": 2.4 }),
          ...([[fx + 24, fy + 78], [fx + 46, fy + 66], [fx + 64, fy + 38], [fx + 84, fy + 22]] as P[]).map(([cx, cy]) => circle(cx, cy, 3.4, { fill: C.navy2 })),
          ruled(fx, fy + 112, col - 10, 40, 13, seed + 3, { "stroke-width": 2.2, opacity: 0.8 }),
        );
      } else {
        body.push(ruled(x + 36 + col, y + 76, col - 6, 150, 13, seed + 5, { "stroke-width": 2.2, opacity: 0.8 }));
      }
      out.push(onSheet(rectangle, deg, ...body));
    };
    page("rp-a", [60, 70, 250, 300], -9, 83, false);
    page("rp-b", [150, 50, 250, 300], 2, 89, false);
    page("rp-c", [230, 76, 250, 300], 8, 97, true);
    out.push(tape(defs, "rp-t", 318, 58, 96, 28, 10, 101));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};

export const researchArtifacts: readonly Collage[] = [researchNano, patentSheet, researchPapers];
