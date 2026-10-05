/**
 * contact.test.tsx (TASK-113) — the rebuilt `/contact` section's structure and copy (Tushar's contact
 * spec 2026-09-27, §24 component tree, §26 copy, §13 résumé state). Rendering also runs the paper
 * primitives' render-time enforcement (`Hand` limits, fasteners) in test mode, so a copy change that
 * breaks a §3.4 limit fails here first.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ContactSection } from "@/components/contact/ContactSection";
import { site } from "@/lib/site";

// Vite resolves a static image import to a bare URL string; Next resolves it to StaticImageData.
vi.mock("@/content/media/portrait/tushar-stamp.webp", () => ({
  default: { src: "/_next/static/media/tushar-stamp.webp", width: 256, height: 256 },
}));

describe("ContactSection (TASK-113)", () => {
  beforeAll(() => {
    // jsdom has no IntersectionObserver; `ContactEntrance` only needs one to arm its CSS entrance.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });
  afterEach(() => {
    site.resumeAvailable = false;
  });

  it("renders the spec copy: eyebrow, h1, subline, sticky, note, closing line", () => {
    const { container } = render(<ContactSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Still curious?");
    const text = container.textContent ?? "";
    for (const s of [
      "Contact",
      "Choose the easiest way to say hello ↓",
      "No forms.No funnels.Just say hello.",
      "Waving from the window seat —the coffee’s usually onand I’m always up fora good conversation.",
      "Good conversations usually startwith one message.",
    ]) {
      expect(text).toContain(s);
    }
    expect(text).not.toMatch(/whichever is easiest|Resume — updating|\b0[1-4]\b/);
  });

  it("is one section: head · card (EmailBlock → primary → secondary) · visual story", () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector("section#contact")!;
    expect(section.querySelectorAll("section")).toHaveLength(0);
    const card = section.querySelector('[data-paper="card"]') as HTMLElement;
    const order = Array.from(card.querySelectorAll(".cx-email, .cx-btn-primary, .cx-secondary")).map((el) => el.className);
    expect(order).toEqual([expect.stringContaining("cx-email"), expect.stringContaining("cx-btn-primary"), expect.stringContaining("cx-secondary")]);

    expect(within(card).getByText(site.email)).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: "Copy email address" })).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: "Email me →" })).toHaveAttribute("href", `mailto:${site.email}`);
    const linkedin = within(card).getByRole("link", { name: /LinkedIn/ });
    expect(linkedin).toHaveAttribute("href", site.linkedin);
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkedin).toHaveAccessibleName(/opens in new tab/);

    // EVAL-018: 4 decorations, all aria-hidden.
    const decor = Array.from(section.querySelectorAll("[data-decor]"));
    expect(decor.map((d) => d.getAttribute("data-decor")).sort()).toEqual(["annotation", "annotation", "collage", "sticky"]);
    for (const d of decor) expect(d).toHaveAttribute("aria-hidden", "true");
  });

  it("TASK-111: the card carries Tushar's portrait stamp as a named image (content, not decoration)", () => {
    const { container } = render(<ContactSection />);
    const img = screen.getByRole("img", { name: "Photo of Tushar Pathak" });
    expect(img.closest(".cx-stamp")).not.toBeNull();
    expect(img.closest('[aria-hidden="true"], [data-decor]')).toBeNull();
    expect(container.querySelector('[data-paper="card"]')!.contains(img)).toBe(true);
  });

  it("résumé: 'available on request' mailto while unavailable; 'Resume ↓' download once the flag flips", () => {
    site.resumeAvailable = false;
    const { container, unmount } = render(<ContactSection />);
    const onRequest = container.querySelector("a#resume")!;
    expect(onRequest).toHaveTextContent("Resume — available on request");
    expect(onRequest).toHaveAttribute("href", `mailto:${site.email}?subject=Resume%20request`);
    expect(onRequest).not.toHaveAttribute("download");
    unmount();

    site.resumeAvailable = true;
    const { container: after } = render(<ContactSection />);
    const download = after.querySelector("a#resume")!;
    expect(download).toHaveTextContent("Resume ↓");
    expect(download).toHaveAttribute("href", "/resume.pdf");
    expect(download).toHaveAttribute("download");
  });
});
