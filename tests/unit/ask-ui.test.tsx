import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { Answer } from "@/lib/ask";
import { SuggestedPrompts } from "@/components/ai/SuggestedPrompts";
import { EvidenceLinks } from "@/components/ai/EvidenceLinks";
import { AnswerView, ASK_MICROCOPY, LOADING_LABEL } from "@/components/ai/AnswerView";

/**
 * The Ask leaf components (technical-plan.md §B S10.02 / S10.03): SuggestedPrompts renders one
 * button per prompt; EvidenceLinks marks external links `rel="noopener"`; AnswerView renders all
 * four states from props with the S7 honesty microcopy present in idle + answer but not error.
 */

const noop = () => {};

const ANSWER: Extract<Answer, { kind: "answer" }> = {
  kind: "answer",
  text: "RailCite is the most technical build — a RAG pipeline over thousands of circulars.",
  evidence: [
    { label: "RailCite", href: "/work/railcite" },
    { label: "railcite.vercel.app", href: "https://railcite.vercel.app" },
  ],
  matched: ["most-technical"], // a real draft:true entry → DRAFT badge
  score: 1,
};

const EMPTY: Extract<Answer, { kind: "empty" }> = {
  kind: "empty",
  text: "I only answer from the sourced facts on this site — try one of the prompts, or email me.",
  evidence: [],
  matched: [],
  suggestions: ["What impact have you created?", "What AI products have you worked on?", "Show me your most technical project."],
};

describe("SuggestedPrompts", () => {
  it("renders one button per prompt inside a labelled list and fires onSelect", () => {
    const onSelect = vi.fn();
    const prompts = ["A?", "B?", "C?", "D?", "E?"];
    render(<SuggestedPrompts prompts={prompts} onSelect={onSelect} />);

    const list = screen.getByRole("list", { name: "Suggested questions" });
    const buttons = within(list).getAllByRole("button");
    expect(buttons).toHaveLength(5);

    fireEvent.click(buttons[2]!);
    expect(onSelect).toHaveBeenCalledWith("C?");
  });
});

describe("EvidenceLinks", () => {
  it("renders each evidence link; https links open in a new tab with rel=noopener", () => {
    render(<EvidenceLinks evidence={ANSWER.evidence} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);

    const internal = screen.getByRole("link", { name: /RailCite$/ });
    expect(internal).toHaveAttribute("href", "/work/railcite");
    expect(internal).not.toHaveAttribute("target");

    const external = screen.getByRole("link", { name: /railcite\.vercel\.app/ });
    expect(external).toHaveAttribute("href", "https://railcite.vercel.app");
    expect(external).toHaveAttribute("target", "_blank");
    expect(external.getAttribute("rel")).toContain("noopener");
  });
});

describe("AnswerView states", () => {
  const base = {
    prompts: ["One?", "Two?", "Three?", "Four?", "Five?"],
    onSelectPrompt: noop,
    onAskAnother: noop,
    onRetry: noop,
  };

  it("idle: shows the honesty microcopy + all suggested prompts", () => {
    render(<AnswerView status="idle" answer={null} {...base} />);
    expect(screen.getByText(ASK_MICROCOPY)).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Suggested questions" })).getAllByRole("button")).toHaveLength(5);
  });

  it("loading: shows an aria-busy status region announcing the search", () => {
    render(<AnswerView status="loading" answer={null} {...base} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(LOADING_LABEL)).toBeInTheDocument();
  });

  it("answer: heading focus target, verbatim text, evidence, DRAFT badge and microcopy", () => {
    render(<AnswerView status="answer" answer={ANSWER} {...base} />);
    const heading = screen.getByRole("heading", { level: 3, name: "Answer" });
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText(ANSWER.text)).toBeInTheDocument();
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByText(ASK_MICROCOPY)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask another" })).toBeInTheDocument();
  });

  it("empty: shows the fallback text + fresh prompts, never an answer heading", () => {
    render(<AnswerView status="empty" answer={EMPTY} {...base} />);
    expect(screen.getByText(EMPTY.text)).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Suggested questions" })).getAllByRole("button")).toHaveLength(3);
    expect(screen.queryByRole("heading", { level: 3, name: "Answer" })).not.toBeInTheDocument();
  });

  it("error: alert icon + text + Try again, and NO honesty microcopy (S10.03 gate)", () => {
    render(<AnswerView status="error" answer={null} {...base} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText(ASK_MICROCOPY)).not.toBeInTheDocument();
  });

  it("error → retry fires onRetry", () => {
    const onRetry = vi.fn();
    render(<AnswerView status="error" answer={null} {...base} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
