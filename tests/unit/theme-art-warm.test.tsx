import { afterEach, describe, expect, it } from "vitest";
import { warmOppositeThemeArt } from "@/lib/theme-art-warm";

// TASK-155: the opposite-theme twin is warmed on INTENT (toggle hover / focus / pointerdown), never on idle,
// so a page does not download + decode two full scenes per slot.
function mount(html: string) {
  document.body.innerHTML = html;
}

describe("warmOppositeThemeArt", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("flips the inactive lazy twin to eager and leaves the active one alone", () => {
    document.documentElement.dataset.theme = "light";
    mount(
      `<img id="l" data-theme-art="light" loading="eager" /><img id="d" data-theme-art="dark" loading="lazy" />` +
        `<picture data-theme-art="dark"><img id="pd" loading="lazy" /></picture>`,
    );
    warmOppositeThemeArt();
    expect(document.getElementById("d")!.getAttribute("loading")).toBe("eager");
    expect(document.getElementById("pd")!.getAttribute("loading")).toBe("eager");
    expect(document.getElementById("l")!.getAttribute("loading")).toBe("eager");
  });

  it("warms the light twin when the page is dark", () => {
    document.documentElement.dataset.theme = "dark";
    mount(`<img id="l" data-theme-art="light" loading="lazy" /><img id="d" data-theme-art="dark" loading="lazy" />`);
    warmOppositeThemeArt();
    expect(document.getElementById("l")!.getAttribute("loading")).toBe("eager");
    expect(document.getElementById("d")!.getAttribute("loading")).toBe("lazy");
  });

  it("never touches an unpaired image (no data-theme-art)", () => {
    document.documentElement.dataset.theme = "light";
    mount(`<img id="u" loading="lazy" />`);
    warmOppositeThemeArt();
    expect(document.getElementById("u")!.getAttribute("loading")).toBe("lazy");
  });
});
