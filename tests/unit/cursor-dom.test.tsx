/** TASK-142.2/142.4 — DOM-dependent cursor logic: exclusion zones and semantic labels (jsdom). */
import { describe, expect, it } from "vitest";
import { ZONE_SELECTOR, isExcludedTarget } from "@/lib/cursor/gate";
import { labelFor } from "@/lib/cursor/labels";

describe("exclusion zones", () => {
  it("lists exactly the spec zones", () => {
    expect(ZONE_SELECTOR.split(",").map((s) => s.trim())).toEqual([
      "input", "textarea", "select", "button", "video", "iframe", "[contenteditable]", "[data-no-trail]", "dialog[open]",
    ]);
  });
  it("excludes descendants of a zone, not plain content", () => {
    document.body.innerHTML = `<div data-no-trail><span id="in">x</span></div><button><b id="b">y</b></button><p id="p">z</p>`;
    expect(isExcludedTarget(document.getElementById("in"))).toBe(true);
    expect(isExcludedTarget(document.getElementById("b"))).toBe(true);
    expect(isExcludedTarget(document.getElementById("p"))).toBe(false);
    expect(isExcludedTarget(null)).toBe(false);
  });
});

describe("semantic labels (cursor.md §2)", () => {
  const el = (html: string) => {
    document.body.innerHTML = html;
    return document.body.firstElementChild as Element;
  };
  it("honours an explicit data-cursor", () => {
    expect(labelFor(el(`<a href="/x" data-cursor="CASE STUDY →">a</a>`))).toBe("CASE STUDY →");
  });
  it("no label for plain content, plain buttons or in-page links", () => {
    expect(labelFor(el(`<p>hi</p>`))).toBeNull();
    expect(labelFor(el(`<button>x</button>`))).toBeNull();
    expect(labelFor(el(`<a href="#ask">x</a>`))).toBeNull();
  });
  it("derives OPEN → / OPEN ↗ / CODE ↗ / PRD ↗ for links", () => {
    expect(labelFor(el(`<a href="/about">x</a>`))).toBe("OPEN →");
    expect(labelFor(el(`<a href="https://example.com">x</a>`))).toBe("OPEN ↗");
    expect(labelFor(el(`<a href="https://github.com/a/b">x</a>`))).toBe("CODE ↗");
    expect(labelFor(el(`<a href="https://example.com/prd.pdf" data-cursor-kind="prd">x</a>`))).toBe("PRD ↗");
    expect(labelFor(el(`<a href="/projects"><span>x</span></a>`).firstElementChild!)).toBe("VIEW →");
    expect(labelFor(el(`<a href="/work/railcite">x</a>`))).toBe("CASE STUDY →");
    expect(labelFor(el(`<a href="/work">x</a>`))).toBe("OPEN →");
  });
});
