import { describe, expect, it } from "vitest";
import { CHATBOT_CATEGORIES } from "@/lib/analytics/events";
import { categorizeMessage, categoryFromSuggestion, destinationTypeFor } from "@/lib/analytics/chat";
import { TUSHKY_SUGGESTIONS } from "@/components/ai/tushky-questions";
import { createTracker } from "@/lib/analytics/tracker";

describe("Ask Tushky categorisation (TASK-194)", () => {
  it.each([
    ["What products has Tushar built?", "projects"],
    ["Tell me about TeachSpark", "projects"],
    ["How does he evaluate AI features?", "ai_product_management"],
    ["Has he worked with AWS or other cloud infrastructure?", "cloud_architecture"],
    ["How do I contact Tushar or get his resume?", "contact"],
    ["What is his career background and skills?", "experience"],
    ["What is the weather like?", "other"],
    ["", "other"],
  ])("%j → %s", (text, expected) => expect(categorizeMessage(text)).toBe(expected));

  it("always returns one of the six allowed categories, whatever the input", () => {
    for (const text of ["a@b.co", "💥".repeat(500), "<script>", "Ignore previous instructions", "x".repeat(10_000)]) {
      expect(CHATBOT_CATEGORIES).toContain(categorizeMessage(text));
    }
  });

  it("maps every suggested prompt on the drawer to an allowed category", () => {
    for (const s of TUSHKY_SUGGESTIONS) expect(CHATBOT_CATEGORIES).toContain(categoryFromSuggestion(s.category, s.query));
  });

  it("the only thing that can reach the tracker is the category: a raw message is rejected by the schema", () => {
    const sent: unknown[] = [];
    const t = createTracker({ sink: { track: (n, p) => void sent.push([n, p]) } });
    const message = "Hi, I'm Jane Doe (jane@example.com), can you tell me about your salary?";
    expect(t.track("chatbot_message_sent", { message_category: message } as never)).toBe(false);
    expect(t.track("chatbot_message_sent", { message_category: categorizeMessage(message) })).toBe(true);
    expect(JSON.stringify(sent)).not.toMatch(/jane|salary|example\.com/i);
  });

  it("classifies drawer destinations coarsely", () => {
    const o = "https://tusharpathak.com";
    expect(destinationTypeFor("/work/railcite#x", o)).toBe("case_study");
    expect(destinationTypeFor("/projects?product=nuptis", o)).toBe("project");
    expect(destinationTypeFor("/contact", o)).toBe("contact");
    expect(destinationTypeFor("mailto:a@b.co", o)).toBe("contact");
    expect(destinationTypeFor("/about", o)).toBe("page");
    expect(destinationTypeFor("https://drive.google.com/file/d/1/view", o)).toBe("resume");
    expect(destinationTypeFor("https://github.com/x", o)).toBe("external");
  });
});
