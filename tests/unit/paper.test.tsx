import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import * as paper from "@/components/paper";
import {
  Annotation,
  Note,
  Sketch,
  Sticky,
  Tape,
  TornEdge,
  type AnnotationProps,
  type NoteProps,
  type SketchProps,
  type SketchVariant,
  type StickyProps,
  type TapeProps,
  type TornEdgeProps,
  type TornFill,
} from "@/components/paper";

/**
 * Paper decoration contract (TSK-33 · technical-plan.md S70.01–S70.04; TC-126 parts for the
 * counted decorations, TC-128 steps 3–4 for the CSS). EVAL-018 counts `data-decor` per section, so
 * a primitive that can render without its attribute — or leak a second one — makes it meaningless.
 */

const DECOR_VALUES = ["torn", "sticky", "annotation", "sketch", "note", "tape"];

/** The `data-*` and `aria-*` attributes an element carries. */
function contractAttrs(el: Element): Record<string, string> {
  return Object.fromEntries(
    [...el.attributes].filter((a) => a.name.startsWith("data-") || a.name.startsWith("aria-")).map((a) => [a.name, a.value]),
  );
}

function root(ui: ReactElement): HTMLElement {
  const { container } = render(ui);
  expect(container.children).toHaveLength(1);
  return container.firstElementChild as HTMLElement;
}

// One default render per barrel export. Adding an export without a fixture fails the barrel check.
const FIXTURES: Record<string, () => ReactElement> = {
  TornEdge: () => <TornEdge />,
  Sticky: () => <Sticky>Capability, not dependency.</Sticky>,
  Annotation: () => <Annotation>start here</Annotation>,
  Sketch: () => <Sketch variant="underline" />,
  Note: () => <Note>TP</Note>,
  Tape: () => <Tape free />,
};

describe("S70.01 TornEdge", () => {
  const fills: TornFill[] = ["paper", "paper-2", "terracotta", "navy"];

  it.each(fills)("fill=%s renders exactly {data-decor: torn, aria-hidden: true} and matches its snapshot", (fill) => {
    const el = root(<TornEdge fill={fill} />);
    expect(el.tagName.toLowerCase()).toBe("svg");
    expect(contractAttrs(el)).toEqual({ "data-decor": "torn", "aria-hidden": "true" });
    expect(el.getAttribute("preserveAspectRatio")).toBe("none");
    expect(el.getAttribute("viewBox")).toBe("0 0 1440 46");
    expect(el.outerHTML).toMatchSnapshot();
  });

  it("is 44 px for paper fills and 46 px for the terracotta band", () => {
    expect(root(<TornEdge fill="paper-2" />).getAttribute("class")).toContain("h-[44px]");
    expect(root(<TornEdge fill="terracotta" />).getAttribute("class")).toContain("h-[46px]");
  });
});

describe("S70.02 Sticky · Annotation · Note · free Tape", () => {
  it("Sticky renders <p data-decor=sticky aria-hidden=true> in Caveat", () => {
    const el = root(<Sticky tone="kraft">trust is the product.</Sticky>);
    expect(el.tagName).toBe("P");
    expect(contractAttrs(el)).toEqual({ "data-decor": "sticky", "aria-hidden": "true", "data-tone": "kraft" });
    expect(el).toHaveClass("font-hand");
  });

  it.each([
    ["Sticky", (r: number) => <Sticky rotate={r}>x</Sticky>, 5],
    ["Annotation", (r: number) => <Annotation rotate={r}>x</Annotation>, 4],
    ["Note", (r: number) => <Note rotate={r}>x</Note>, 6],
    ["Tape", (r: number) => <Tape free rotate={r} />, 12],
  ] as const)("%s clamps rotate to its cap via --rot", (_name, make, cap) => {
    expect(root(make(30)).style.getPropertyValue("--rot")).toBe(`${cap}deg`);
    expect(root(make(-30)).style.getPropertyValue("--rot")).toBe(`-${cap}deg`);
    expect(root(make(1.5)).style.getPropertyValue("--rot")).toBe("1.5deg");
  });

  it("Sticky rotate={30} renders --rot: 5deg (TC-126 step 2)", () => {
    expect(root(<Sticky rotate={30}>x</Sticky>).style.getPropertyValue("--rot")).toBe("5deg");
  });

  it("always sets --rot inline (never inherits a host's), and a non-finite rotate falls back", () => {
    expect(root(<Sticky>x</Sticky>).style.getPropertyValue("--rot")).toBe("4deg");
    expect(root(<Annotation>x</Annotation>).style.getPropertyValue("--rot")).toBe("0deg");
    expect(root(<Sticky rotate={Number.NaN}>x</Sticky>).style.getPropertyValue("--rot")).toBe("4deg");
  });

  it("Annotation renders <p data-decor=annotation> with the arrow <svg> inside and uncounted", () => {
    const el = root(
      <Annotation arrow="down" size="sm">
        start here ↓
      </Annotation>,
    );
    expect(el.tagName).toBe("P");
    expect(contractAttrs(el)).toEqual({ "data-decor": "annotation", "aria-hidden": "true", "data-size": "sm" });
    const svg = el.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("data-arrow")).toBe("down");
    expect(svg?.hasAttribute("data-decor")).toBe(false);
    expect(el).toHaveClass("font-hand");
  });

  it.each(["up", "down", "left", "right", "dashed"] as const)("Annotation arrow=%s draws a dashed shaft + solid head", (arrow) => {
    const svg = root(<Annotation arrow={arrow}>x</Annotation>).querySelector("svg");
    expect(svg?.querySelector("path.shaft")).not.toBeNull();
    expect(svg?.querySelector("path.head")).not.toBeNull();
  });

  it('Annotation as="figcaption" renders a figcaption with the same contract', () => {
    const el = root(<Annotation as="figcaption">the desk</Annotation>);
    expect(el.tagName).toBe("FIGCAPTION");
    expect(el.getAttribute("data-decor")).toBe("annotation");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("Note renders <span data-decor=note>; free Tape renders <span data-decor=tape>", () => {
    const note = root(<Note stamp>TP</Note>);
    expect(note.tagName).toBe("SPAN");
    expect(contractAttrs(note)).toEqual({ "data-decor": "note", "aria-hidden": "true", "data-tone": "paper-2", "data-stamp": "" });
    const tape = root(<Tape free />);
    expect(tape.tagName).toBe("SPAN");
    expect(contractAttrs(tape)).toEqual({ "data-decor": "tape", "aria-hidden": "true" });
    expect(tape.hasAttribute("data-fastener")).toBe(false);
  });

  it("no prop can remove aria-hidden: a smuggled aria-hidden={false} is ignored at runtime", () => {
    const smuggled = { "aria-hidden": false } as object;
    const els = [
      root(<Sticky {...smuggled}>x</Sticky>),
      root(<Annotation {...smuggled}>x</Annotation>),
      root(<Note {...smuggled}>x</Note>),
      root(<Tape free {...smuggled} />),
      root(<Sketch variant="flow" {...smuggled} />),
      root(<TornEdge {...smuggled} />),
    ];
    for (const el of els) expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("the props types omit aria-hidden (TC-126 step 5 — type-level)", () => {
    // Why not `<Sticky aria-hidden={false}>` as TC-126 words it: TypeScript never checks a
    // hyphenated JSX attribute against a component's props type, so that line compiles whatever
    // the props say and an `@ts-expect-error` on it is itself an error (TS2578). The type-level
    // guarantee is proven on the props objects instead (excess-property check), and the runtime
    // guarantee — the smuggled-prop test above — is what actually protects the DOM.
    type HasAriaHidden<T> = "aria-hidden" extends keyof T ? true : false;
    const absent: [
      HasAriaHidden<StickyProps>,
      HasAriaHidden<AnnotationProps>,
      HasAriaHidden<NoteProps>,
      HasAriaHidden<TapeProps>,
      HasAriaHidden<SketchProps>,
      HasAriaHidden<TornEdgeProps>,
    ] = [false, false, false, false, false, false];
    // Each line must be a TypeScript error; `pnpm typecheck` fails if any of them compiles.
    // @ts-expect-error — Sticky has no aria-hidden prop
    const a: StickyProps = { children: "x", "aria-hidden": false };
    // @ts-expect-error — Annotation has no aria-hidden prop
    const b: AnnotationProps = { children: "x", "aria-hidden": false };
    // @ts-expect-error — Note has no aria-hidden prop
    const c: NoteProps = { children: "x", "aria-hidden": false };
    // @ts-expect-error — Tape has no aria-hidden prop
    const d: TapeProps = { free: true, "aria-hidden": false };
    // @ts-expect-error — Sketch has no aria-hidden prop
    const e: SketchProps = { variant: "spark", "aria-hidden": false };
    expect([absent, a, b, c, d, e]).toHaveLength(6);
  });
});

describe("S70.03 Sketch (7 variants)", () => {
  const lineVariants: SketchVariant[] = ["underline", "spark", "path", "chain", "tools", "arrow"];

  it.each(lineVariants)("variant=%s renders <svg data-decor=sketch aria-hidden class=sketch> and matches its snapshot", (variant) => {
    const el = root(<Sketch variant={variant} />);
    expect(el.tagName.toLowerCase()).toBe("svg");
    expect(el.getAttribute("data-decor")).toBe("sketch");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("data-sketch")).toBe(variant);
    expect(el).toHaveClass("sketch");
    expect(el.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(el.outerHTML).toMatchSnapshot();
  });

  it("variant=flow renders <div data-decor=sketch> with Caveat box labels and matches its snapshot", () => {
    const el = root(<Sketch variant="flow" />);
    expect(el.tagName).toBe("DIV");
    expect(contractAttrs(el)).toEqual({ "data-decor": "sketch", "aria-hidden": "true", "data-sketch": "flow" });
    expect(el).toHaveClass("sketch", "sketch-flow", "font-hand");
    expect([...el.querySelectorAll(".flow-box")].map((b) => b.textContent)).toEqual([
      "teacher on WhatsApp",
      "question paper",
      "QC pass",
      "back in minutes",
    ]);
    expect(el.outerHTML).toMatchSnapshot();
  });

  it("flow accepts its own rows", () => {
    const el = root(<Sketch variant="flow" rows={[{ boxes: [{ label: "a" }, { label: "b", tone: "rust" }] }]} />);
    expect(el.querySelectorAll(".flow-box")).toHaveLength(2);
    expect(el.querySelectorAll(".flow-arr")).toHaveLength(1);
  });

  it("only the headline underline carries data-drawin (Design.md §8)", () => {
    expect(root(<Sketch variant="underline" />).hasAttribute("data-drawin")).toBe(true);
    for (const v of ["spark", "path", "chain", "tools", "arrow"] as const) {
      expect(root(<Sketch variant={v} />).hasAttribute("data-drawin")).toBe(false);
    }
  });
});

describe("S70.04 barrel", () => {
  it("every exported primitive has a default-render fixture", () => {
    const exported = Object.entries(paper)
      .filter(([, v]) => typeof v === "function")
      .map(([k]) => k)
      .sort();
    expect(exported).toEqual(Object.keys(FIXTURES).sort());
  });

  it.each(Object.entries(FIXTURES))("%s with defaults: data-decor ∈ the six values and nothing else carries data-decor", (_name, make) => {
    const { container } = render(make());
    const decorated = container.querySelectorAll("[data-decor]");
    expect(decorated).toHaveLength(1);
    expect(decorated[0]).toBe(container.firstElementChild);
    expect(DECOR_VALUES).toContain(decorated[0]?.getAttribute("data-decor"));
    expect(decorated[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll("[data-fastener], [data-paper], [data-flat], [data-hand]")).toHaveLength(0);
  });
});

describe("TC-128 CSS: draw-in and Reveal (steps 3–4, static half)", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

  it("draw-in is stroke-dashoffset 400 → 0 over 1.1 s ease-out after 0.5 s, once", () => {
    expect(css).toMatch(/\.sketch\[data-drawin\]\s*\{[^}]*stroke-dasharray:\s*400;[^}]*stroke-dashoffset:\s*400;[^}]*animation:\s*drawin 1\.1s ease-out 0\.5s forwards;/);
    expect(css).toMatch(/@keyframes drawin\s*\{\s*to\s*\{\s*stroke-dashoffset:\s*0;/);
  });

  it("reduced motion renders the draw-in complete with no animation", () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.sketch\[data-drawin\]\s*\{\s*stroke-dashoffset:\s*0;\s*animation:\s*none;/,
    );
  });

  it(".reveal starts at opacity 0 / translateY(12px) and never scales", () => {
    expect(css).toMatch(/\.reveal\s*\{[^}]*opacity:\s*0;[^}]*transform:\s*translateY\(12px\);/);
    const revealRules = [...css.matchAll(/\.reveal[^{]*\{[^}]*\}/g)].map((m) => m[0]);
    expect(revealRules.length).toBeGreaterThan(0);
    expect(revealRules.filter((r) => /scale\(/.test(r))).toEqual([]);
  });
});
