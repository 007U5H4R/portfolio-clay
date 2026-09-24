import { Sparkles } from "lucide-react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayPill } from "@/components/clay/ClayPill";
import { ClayTile } from "@/components/clay/ClayTile";
import { CopyButton } from "@/components/common/CopyButton";
import { ExternalLink } from "@/components/common/ExternalLink";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Prose } from "@/components/common/Prose";
import { Icon } from "@/components/common/Icon";
import type { Tone } from "@/components/clay/tiers";

const TONES: Tone[] = ["neutral", "lavender", "sky", "mint", "blush", "peach", "butter"];

describe("ClayCard — S04.02 full contract", () => {
  it("renders the tone matrix on every volume/utility tier without throwing", () => {
    for (const tier of ["hero", "card", "utility"] as const) {
      for (const tone of TONES) {
        const { container } = render(
          <ClayCard tier={tier} tone={tone} padding="card">
            {tier}-{tone}
          </ClayCard>,
        );
        expect(container.firstElementChild).toBeTruthy();
      }
    }
  });

  it("flat tier (neutral only) has zero shadow and zero bg-image classes", () => {
    const { container } = render(
      <ClayCard tier="flat" padding="card">
        flat
      </ClayCard>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toMatch(/shadow/);
    expect(el.className).not.toMatch(/bg-\[image/);
    expect(el.className).not.toMatch(/gradient/);
  });

  it("volume tiers carry the after: tone-gradient overlay; flat/utility do not", () => {
    const { container: cardC } = render(<ClayCard tier="card">c</ClayCard>);
    expect((cardC.firstElementChild as HTMLElement).className).toMatch(
      /after:bg-\[image:var\(--gradient-clay-volume\)\]/,
    );
    const { container: flatC } = render(<ClayCard tier="flat">f</ClayCard>);
    expect((flatC.firstElementChild as HTMLElement).className).not.toMatch(/after:bg-\[image/);
  });
});

describe("ClayButton — S04.03 full", () => {
  it("loading sets aria-busy, disables the button and renders a spinner", () => {
    const { container } = render(<ClayButton loading>Save</ClayButton>);
    const el = container.firstElementChild as HTMLButtonElement;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.disabled).toBe(true);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("external link gets target/rel and a VisuallyHidden 'opens in new tab' note", () => {
    const { container } = render(
      <ClayButton href="https://example.test" external>
        Visit
      </ClayButton>,
    );
    const el = container.firstElementChild as HTMLAnchorElement;
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.getAttribute("rel")).toContain("noopener");
    expect(container.textContent).toContain("(opens in new tab)");
  });

  it("size lg applies the larger token classes", () => {
    const { container } = render(<ClayButton size="lg">Big</ClayButton>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/min-h-12/);
    expect(el.className).toMatch(/px-8/);
  });
});

describe("ClayPill — S04.04 variants", () => {
  it("filter is a button with a hover state; active marks it selected", () => {
    const { container } = render(<ClayPill variant="filter">All</ClayPill>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("BUTTON");
    expect(el.className).toMatch(/hover:bg-paper-2/);
    expect(el.className).toMatch(/min-h-11/);

    const { container: activeC } = render(
      <ClayPill variant="filter" active>
        All
      </ClayPill>,
    );
    const activeEl = activeC.firstElementChild as HTMLElement;
    expect(activeEl.className).toMatch(/\bbg-paper-2\b/);
    expect(activeEl.getAttribute("aria-pressed")).toBe("true");
  });

  it("tag is a static span with NO hover state", () => {
    const { container } = render(<ClayPill variant="tag">AI</ClayPill>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el.className).not.toMatch(/hover:/);
  });

  it("link is an anchor with a trailing arrow icon", () => {
    const { container } = render(
      <ClayPill variant="link" href="/work/x">
        View X
      </ClayPill>,
    );
    const el = container.firstElementChild as HTMLAnchorElement;
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/work/x");
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("ClayTile — S04.05 interactive on card tier only", () => {
  it("card + interactive gets the hover lift; utility default does not", () => {
    const { container } = render(
      <ClayTile tier="card" interactive>
        <Icon icon={Sparkles} size={20} />
      </ClayTile>,
    );
    expect((container.firstElementChild as HTMLElement).className).toMatch(/hover:-translate-y-\[5px\]/);

    const { container: plain } = render(<ClayTile>56</ClayTile>);
    expect((plain.firstElementChild as HTMLElement).className).not.toMatch(/hover:-translate-y/);
  });
});

describe("Common primitives — S04.06", () => {
  it("VisuallyHidden renders sr-only text", () => {
    const { container } = render(<VisuallyHidden>note</VisuallyHidden>);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\bsr-only\b/);
  });

  it("Prose is a flat 60ch measure (no tier prop, no clay classes)", () => {
    const { container } = render(
      <Prose>
        <p>body</p>
      </Prose>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/max-w-\[60ch\]/);
    expect(el.className).not.toMatch(/shadow/);
  });

  it("ExternalLink opens a new tab, is marked inline, and announces it", () => {
    const { container } = render(
      <ExternalLink href="https://example.test">docs</ExternalLink>,
    );
    const el = container.firstElementChild as HTMLAnchorElement;
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.getAttribute("rel")).toContain("noopener");
    expect(el.hasAttribute("data-inline-link")).toBe(true);
    expect(container.textContent).toContain("(opens in new tab)");
  });

  it("CopyButton renders each designed state label", () => {
    expect(render(<CopyButton value="x" state="idle" />).container.textContent).toContain("Copy");
    expect(render(<CopyButton value="x" state="copied" />).container.textContent).toContain("Copied");
    expect(render(<CopyButton value="x" state="error" />).container.textContent).toContain(
      "Copy failed",
    );
  });
});
