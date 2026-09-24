import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";
import * as paper from "@/components/paper";
import {
  Annotation,
  DraftTag,
  FlatZone,
  Hand,
  Illustration,
  Note,
  Pin,
  Sheet,
  Sketch,
  Sticky,
  Tape,
  TornEdge,
  type AnnotationProps,
  type PinProps,
  type SheetVariant,
  type NoteProps,
  type SketchProps,
  type SketchVariant,
  type StickyProps,
  type TapeProps,
  type TornEdgeProps,
  type TornFill,
} from "@/components/paper";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";
import { ILLUSTRATION_IDS, illustration, type IllustrationId } from "@/lib/illustrations";
import { Prose } from "@/components/common/Prose";
import { Tag } from "@/components/common/Tag";
import { StatusBadge } from "@/components/projects/StatusBadge";

// Until TSK-36 the manifest is a stub with no served files. Give one scene a `publicSrc` here so the
// `<img>` path is exercised; every other id keeps the stub's no-source (fallback caption) path.
vi.mock("@/content/media/illustrations/manifest", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/content/media/illustrations/manifest")>();
  return {
    ...original,
    ILLUSTRATIONS: original.ILLUSTRATIONS.map((e) => (e.id === "scene-work" ? { ...e, publicSrc: "/media/illustrations/scene-work.jpg" } : e)),
  };
});

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
// Counted decorations (TSK-33): exactly one `data-decor` each.
const FIXTURES: Record<string, () => ReactElement> = {
  TornEdge: () => <TornEdge />,
  Sticky: () => <Sticky>Capability, not dependency.</Sticky>,
  Annotation: () => <Annotation>start here</Annotation>,
  Sketch: () => <Sketch variant="underline" />,
  Note: () => <Note>TP</Note>,
  Tape: () => <Tape free />,
};

// Content paper, fasteners, flat zone, hand (TSK-34): zero `data-decor`; the root carries `attrs`.
const CONTENT_FIXTURES: Record<string, { make: () => ReactElement; attrs: Record<string, string> }> = {
  Sheet: { make: () => <Sheet variant="card">A card</Sheet>, attrs: { "data-paper": "card" } },
  Pin: {
    make: () => (
      <Sheet variant="index">
        <Pin />
        An index card
      </Sheet>
    ),
    attrs: { "data-paper": "index" },
  },
  Illustration: {
    make: () => <Illustration id="scene-contact" placement="photo" sizes="100vw" />,
    attrs: { "data-paper": "photo", "data-illustration": "scene-contact" },
  },
  FlatZone: { make: () => <FlatZone>reading</FlatZone>, attrs: { "data-flat": "" } },
  Hand: { make: () => <Hand kind="label">Chosen</Hand>, attrs: { "data-hand": "label" } },
  DraftTag: { make: () => <DraftTag />, attrs: { "data-paper": "tag" } },
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
    expect(exported).toEqual([...Object.keys(FIXTURES), ...Object.keys(CONTENT_FIXTURES)].sort());
  });

  it.each(Object.entries(CONTENT_FIXTURES))("%s with defaults: no data-decor anywhere; the root carries its contract attribute", (_name, { make, attrs }) => {
    const { container } = render(make());
    expect(container.querySelectorAll("[data-decor]")).toHaveLength(0);
    const el = container.firstElementChild as HTMLElement;
    for (const [name, value] of Object.entries(attrs)) expect(el.getAttribute(name)).toBe(value);
    expect(el.getAttribute("aria-hidden")).toBeNull();
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

/* ── TSK-34 · content paper (technical-plan.md S70.05–S70.08; TC-126 steps 1, 3, 4, 6) ─────────── */

describe("dev-time enforcement per environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const threeTapes = () => (
    <Sheet variant="card">
      <Tape />
      <Tape side="l" />
      <Pin />
      x
    </Sheet>
  );

  it("test env: a violation throws", () => {
    expect(() => render(threeTapes())).toThrow(/3 fasteners/);
  });

  it("development: a violation is console.error'd and the element still renders", () => {
    vi.stubEnv("NODE_ENV", "development");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(threeTapes());
    expect(container.querySelectorAll("[data-fastener]")).toHaveLength(3);
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[paper\] <Sheet> has 3 fasteners/));
  });

  it("production: inert — no throw, no log", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(threeTapes())).not.toThrow();
    expect(() => render(<Hand kind="label">four words here now</Hand>)).not.toThrow();
    expect(() => render(<Pin />)).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("S70.05 Sheet + fasteners", () => {
  afterEach(() => vi.restoreAllMocks());
  const variants: SheetVariant[] = ["card", "index", "postcard", "notebook", "photo", "tag"];

  it.each(variants)("variant=%s renders data-paper=%s, never data-decor, never aria-hidden", (variant) => {
    const el = root(<Sheet variant={variant}>content</Sheet>);
    expect(el.getAttribute("data-paper")).toBe(variant);
    expect(el).toHaveClass("paper-sheet");
    expect(el.hasAttribute("aria-hidden")).toBe(false);
    expect(el.querySelectorAll("[data-decor]")).toHaveLength(0);
  });

  it("renders as the requested element", () => {
    for (const as of ["article", "div", "figure", "section"] as const) {
      expect(root(<Sheet as={as} variant="card">x</Sheet>).tagName.toLowerCase()).toBe(as);
    }
  });

  it("clamps rotation: ±0.9 for content sheets, ±2.4 for a photo", () => {
    expect(root(<Sheet variant="card" rotate={5}>x</Sheet>).style.getPropertyValue("--rot")).toBe("0.9deg");
    expect(root(<Sheet variant="notebook" rotate={-5}>x</Sheet>).style.getPropertyValue("--rot")).toBe("-0.9deg");
    expect(root(<Sheet variant="photo" rotate={5}>x</Sheet>).style.getPropertyValue("--rot")).toBe("2.4deg");
    expect(root(<Sheet variant="card" rotate={0.5}>x</Sheet>).style.getPropertyValue("--rot")).toBe("0.5deg");
  });

  it("notebook carries five punched holes; postcard renders its stamp chrome aria-hidden", () => {
    expect(root(<Sheet variant="notebook">x</Sheet>).querySelectorAll(".paper-holes i")).toHaveLength(5);
    const stamp = root(
      <Sheet variant="postcard" stamp="TP">
        x
      </Sheet>,
    ).querySelector(".paper-stamp");
    expect(stamp?.textContent).toBe("TP");
    expect(stamp?.getAttribute("aria-hidden")).toBe("true");
  });

  it("three fasteners throw in test (TC-126 step 3)", () => {
    expect(() =>
      render(
        <Sheet variant="card">
          <Tape />
          <Tape side="r" />
          <Tape side="l" />
          x
        </Sheet>,
      ),
    ).toThrow(/\[paper\] <Sheet> has 3 fasteners; a host carries at most 2/);
  });

  it("two fasteners render inside the host, uncounted and aria-hidden, without a warning", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const el = root(
      <Sheet variant="photo">
        <Tape side="l" />
        <Pin tone="forest" />
        x
      </Sheet>,
    );
    const fasteners = [...el.querySelectorAll("[data-fastener]")];
    expect(fasteners.map((f) => f.getAttribute("data-fastener"))).toEqual(["tape", "pin"]);
    for (const f of fasteners) {
      expect(f.getAttribute("aria-hidden")).toBe("true");
      expect(f.hasAttribute("data-decor")).toBe(false);
    }
    expect(el.querySelectorAll("[data-decor]")).toHaveLength(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it("free tape inside a Sheet is a decoration, not a fastener (it does not count toward the 2)", () => {
    const el = root(
      <Sheet variant="card">
        <Tape />
        <Tape side="r" />
        <Tape free />
        x
      </Sheet>,
    );
    expect(el.querySelectorAll("[data-fastener]")).toHaveLength(2);
    expect(el.querySelectorAll('[data-decor="tape"]')).toHaveLength(1);
  });

  it.each([
    ["Tape", () => <Tape />],
    ["Pin", () => <Pin />],
  ] as const)("a fastener %s rendered outside a Sheet logs a dev warning", (name, make) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const el = root(make());
    expect(el.getAttribute("data-fastener")).toBe(name.toLowerCase());
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`\\[paper\\] A fastener <${name}/> was rendered outside a <Sheet>`)));
  });

  it("a fastener nested below a direct child is outside its host (must be a direct child)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Sheet variant="card">
        <div>
          <Pin />
        </div>
      </Sheet>,
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("fastener tape: side positions + rotation clamp; pins never rotate", () => {
    const tape = (props: { side?: "l" | "c" | "r"; rotate?: number }) =>
      root(
        <Sheet variant="card">
          <Tape {...props} />
        </Sheet>,
      ).querySelector("[data-fastener]") as HTMLElement;
    expect(tape({}).getAttribute("data-side")).toBe("c");
    expect(tape({}).style.getPropertyValue("--rot")).toBe("-3deg");
    expect(tape({ side: "l" }).style.getPropertyValue("--rot")).toBe("-9deg");
    expect(tape({ side: "r" }).style.getPropertyValue("--rot")).toBe("7deg");
    expect(tape({ rotate: 40 }).style.getPropertyValue("--rot")).toBe("12deg");
    const pin = root(
      <Sheet variant="card">
        <Pin />
      </Sheet>,
    ).querySelector("[data-fastener]") as HTMLElement;
    expect(pin.style.getPropertyValue("--rot")).toBe("");
    expect(pin.getAttribute("data-tone")).toBe("rust");
  });

  it("Pin props omit aria-hidden (type-level)", () => {
    // @ts-expect-error — Pin has no aria-hidden prop
    const p: PinProps = { "aria-hidden": false };
    expect(p).toBeDefined();
  });
});

describe("S70.06 Illustration + lib/illustrations", () => {
  /** Design.md §6.3 — the authoritative alt strings, parsed from the table (parenthetical notes dropped). */
  const designAlts = (): Map<string, string> => {
    const md = readFileSync(join(process.cwd(), "Design.md"), "utf8");
    const section = md.slice(md.indexOf("### 6.3"), md.indexOf("### 6.4"));
    const rows = [...section.matchAll(/^\| `([a-z0-9-]+)`[^|]*\| (.+) \|$/gm)];
    return new Map(rows.map(([, id, cell]) => [id as string, (cell as string).replace(/ \([^)]*\)$/, "")]));
  };

  it("the stub manifest has the nine §6.1 ids with the exact §6.3 alt strings", () => {
    const alts = designAlts();
    expect(alts.size).toBe(9);
    expect([...ILLUSTRATION_IDS]).toEqual([...alts.keys()]);
    for (const entry of ILLUSTRATIONS) expect(entry.alt).toBe(alts.get(entry.id));
  });

  it("an unknown id throws (in every environment)", () => {
    expect(() => illustration("scene-garden" as IllustrationId)).toThrow(/Unknown illustration id "scene-garden"/);
    expect(() => render(<Illustration id={"scene-garden" as IllustrationId} placement="bleed" sizes="100vw" />)).toThrow(
      /Unknown illustration id/,
    );
  });

  it("bleed renders exactly one <img> whose alt equals the manifest string byte for byte", () => {
    const el = root(<Illustration id="scene-work" placement="bleed" sizes="(min-width: 1024px) 62vw, 100vw" />);
    expect(el.tagName).toBe("FIGURE");
    expect(el.getAttribute("data-illustration")).toBe("scene-work");
    expect(el.hasAttribute("data-paper")).toBe(false);
    const imgs = el.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    expect(imgs[0]?.getAttribute("alt")).toBe(illustration("scene-work").alt);
    expect(imgs[0]?.getAttribute("alt")).toBe(designAlts().get("scene-work"));
    expect(imgs[0]?.getAttribute("loading")).toBe("lazy");
  });

  it("photo placement is content paper hosting ≤ 2 fasteners, the image, then the caption", () => {
    const el = root(
      <Illustration id="scene-work" placement="photo" sizes="100vw" rotate={9} caption={<Annotation as="figcaption">the board</Annotation>}>
        <Tape side="l" />
        <Tape side="r" />
      </Illustration>,
    );
    expect(el.getAttribute("data-paper")).toBe("photo");
    expect(el.style.getPropertyValue("--rot")).toBe("2.4deg");
    expect([...el.children].map((c) => c.tagName)).toEqual(["SPAN", "SPAN", "IMG", "FIGCAPTION"]);
    expect(() =>
      render(
        <Illustration id="scene-work" placement="photo" sizes="100vw">
          <Tape />
          <Tape />
          <Pin />
        </Illustration>,
      ),
    ).toThrow(/<Illustration> has 3 fasteners/);
  });

  it("priority → eager + fetchpriority=high", () => {
    const img = root(<Illustration id="scene-work" placement="bleed" sizes="100vw" priority />).querySelector("img");
    expect(img?.getAttribute("loading")).toBe("eager");
    expect(img?.getAttribute("fetchpriority")).toBe("high");
  });

  it("no source yet (stub) or a load error → the alt as visible caption text, never a broken <img>", () => {
    const stub = root(<Illustration id="scene-about" placement="bleed" sizes="100vw" />);
    expect(stub.querySelector("img")).toBeNull();
    expect(stub.querySelector(".illustration-fallback")?.textContent).toBe(illustration("scene-about").alt);

    const el = root(<Illustration id="scene-work" placement="bleed" sizes="100vw" />);
    fireEvent.error(el.querySelector("img") as HTMLImageElement);
    expect(el.querySelector("img")).toBeNull();
    expect(el.querySelector(".illustration-fallback")?.textContent).toBe(illustration("scene-work").alt);
  });
});

describe("S70.07 FlatZone · Hand · DraftTag · Prose · Tag · StatusBadge", () => {
  const LONG_QUOTE = "a".repeat(241);

  it("FlatZone renders <{as} data-flat>", () => {
    expect(contractAttrs(root(<FlatZone>x</FlatZone>))).toEqual({ "data-flat": "" });
    expect(root(<FlatZone as="dl">x</FlatZone>).tagName).toBe("DL");
  });

  it("Hand renders a plain element with data-hand in font-hand (quote → blockquote, else span)", () => {
    const quote = render(<Hand kind="quote" cite="TeachSpark Solution-Space PRD">“Capability, not dependency.”</Hand>).container;
    const bq = quote.querySelector("blockquote") as HTMLElement;
    expect(contractAttrs(bq)).toEqual({ "data-hand": "quote" });
    expect(bq).toHaveClass("font-hand");
    expect(bq.textContent).toBe("“Capability, not dependency.”");
    expect(bq.nextElementSibling?.tagName).toBe("CITE");
    expect(bq.nextElementSibling?.textContent).toBe("TeachSpark Solution-Space PRD");
    expect(root(<Hand kind="cta">View my work →</Hand>).tagName).toBe("SPAN");
    expect(root(<Hand kind="label" as="dt">Method</Hand>).tagName).toBe("DT");
  });

  it("an element cite renders as given (e.g. an sr-only Source: line)", () => {
    const { container } = render(
      <Hand kind="quote" as="span" cite={<span className="sr-only">Source: hero.tagline</span>}>
        Observing what others overlook.
      </Hand>,
    );
    expect(container.querySelector("[data-hand]")?.nextElementSibling?.outerHTML).toBe('<span class="sr-only">Source: hero.tagline</span>');
  });

  it.each([
    ["label", "Chosen"],
    ["label", "We'll know when"],
    ["label", "01"],
    ["cta", "Read the case study →"],
    ["cta", "one two three four five six"],
    ["cta", "← Thinking"],
  ] as const)("within limits: kind=%s %j renders", (kind, text) => {
    expect(root(<Hand kind={kind}>{text}</Hand>).getAttribute("data-hand")).toBe(kind);
  });

  it("a 240-character quote with a cite renders", () => {
    const { container } = render(
      <Hand kind="quote" cite="Source">
        {"a".repeat(240)}
      </Hand>,
    );
    expect(container.querySelector("[data-hand=quote]")).not.toBeNull();
  });

  it.each([
    ["label with 4 words", () => <Hand kind="label">four words here now</Hand>, /label is 4 words; the limit is 3/],
    ["label with a non-2-digit number", () => <Hand kind="label">2024</Hand>, /digits other than a 2-digit numeral/],
    ["cta with 7 words", () => <Hand kind="cta">one two three four five six seven</Hand>, /cta is 7 words; the limit is 6/],
    [
      "quote with 241 characters",
      () => (
        <Hand kind="quote" cite="Source">
          {LONG_QUOTE}
        </Hand>
      ),
      /quote is 241 characters; the limit is 240/,
    ],
    ["quote without cite", () => <Hand kind="quote">Capability, not dependency.</Hand>, /quote has no cite/],
    [
      "limit counted through nested elements",
      () => (
        <Hand kind="label">
          <b>one</b> two <i>three four</i>
        </Hand>
      ),
      /label is 4 words/,
    ],
  ] as const)("throws in test: %s (TC-126 step 4)", (_name, make, message) => {
    expect(() => render(make())).toThrow(message);
  });

  it("DraftTag: default text, data-paper=tag, Inter (never Caveat), ±4° clamp", () => {
    const el = root(<DraftTag />);
    expect(el.textContent).toBe("Draft — pending sign-off");
    expect(contractAttrs(el)).toEqual({ "data-paper": "tag" });
    expect(el).toHaveClass("font-body", "text-[12px]", "uppercase", "text-terracotta");
    expect(el).not.toHaveClass("font-hand");
    expect(root(<DraftTag rotate={-9} />).style.getPropertyValue("--rot")).toBe("-4deg");
    expect(root(<DraftTag>Draft</DraftTag>).textContent).toBe("Draft");
  });

  it("Prose is a data-flat zone at a 68ch measure", () => {
    const el = root(
      <Prose>
        <p>body</p>
      </Prose>,
    );
    expect(el.getAttribute("data-flat")).toBe("");
    expect(el.className).toMatch(/max-w-\[68ch\]/);
  });

  it("Tag is an Inter 12 px pill and no longer imports ClayPill", () => {
    const el = root(<Tag>AI</Tag>);
    expect(el).toHaveClass("font-body", "text-[12px]", "rounded-full");
    expect(el).not.toHaveClass("font-hand");
    expect(readFileSync(join(process.cwd(), "components/common/Tag.tsx"), "utf8")).not.toMatch(/ClayPill/);
  });

  it("StatusBadge: ivory pill, steel border, icon + text; data-paper=tag only when onPaper", () => {
    const off = root(<StatusBadge status="live" statusLabel="Live" />);
    expect(off).toHaveClass("bg-ivory", "border-steel", "text-[12px]");
    expect(off.querySelector("svg")).not.toBeNull();
    expect(off.textContent).toBe("Live");
    expect(off.hasAttribute("data-paper")).toBe(false);
    expect(root(<StatusBadge status="pilot" statusLabel="Pilot" onPaper />).getAttribute("data-paper")).toBe("tag");
  });
});

describe("S70.08 DraftTag swap", () => {
  it('no `<Tag>Draft` remains in components/ or app/ (grep gate)', () => {
    let out = "";
    try {
      out = execFileSync("grep", ["-rn", "<Tag>Draft", "components", "app"], { cwd: process.cwd(), encoding: "utf8" });
    } catch (error) {
      // grep exits 1 when nothing matches — the pass case.
      if ((error as { status?: number }).status !== 1) throw error;
    }
    expect(out).toBe("");
  });
});
