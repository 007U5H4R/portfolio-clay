import { describe, expect, it, vi } from "vitest";
import { createTracker, type Sink } from "@/lib/analytics/tracker";

const fakeSink = () => {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const sink: Sink = { track: (name, props) => void calls.push([name, props]) };
  return { sink, calls };
};

describe("tracker (TASK-194)", () => {
  it("validates and forwards a known event with exactly its schema's properties", () => {
    const { sink, calls } = fakeSink();
    const t = createTracker({ sink });
    expect(t.track("linkedin_profile_clicked", { cta_location: "hero" })).toBe(true);
    expect(calls).toEqual([["linkedin_profile_clicked", { cta_location: "hero" }]]);
  });

  it("drops an unknown event silently in production mode and throws in test mode", () => {
    const { sink, calls } = fakeSink();
    expect(createTracker({ sink, onInvalid: "silent" }).track("not_an_event" as never, {} as never)).toBe(false);
    expect(calls).toHaveLength(0);
    expect(() => createTracker({ sink, onInvalid: "throw" }).track("not_an_event" as never, {} as never)).toThrow(/unknown event/);
  });

  it("warns (development mode) about missing required properties and sends nothing", () => {
    const { sink, calls } = fakeSink();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const t = createTracker({ sink, onInvalid: "warn" });
    expect(t.track("project_selected", { project_id: "teachspark" } as never)).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("missing required property"));
    expect(calls).toHaveLength(0);
    warn.mockRestore();
  });

  it("refuses free text smuggled into an enum or slug property", () => {
    const { sink, calls } = fakeSink();
    const t = createTracker({ sink });
    expect(t.track("chatbot_message_sent", { message_category: "My email is jane@example.com" } as never)).toBe(false);
    expect(t.track("project_selected", { project_id: "https://example.com/?token=abc", selection_method: "arrow" })).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("never lets a failing sink throw into the caller", () => {
    const t = createTracker({ sink: { track: () => { throw new Error("blocked"); } }, onInvalid: "throw" });
    expect(() => t.track("linkedin_profile_clicked", { cta_location: "hero" })).not.toThrow();
    expect(t.track("linkedin_profile_clicked", { cta_location: "hero" })).toBe(false);
  });

  it("trackOnce sends a key once; resetOnce re-arms by prefix", () => {
    const { sink, calls } = fakeSink();
    const t = createTracker({ sink });
    const send = (key: string) => t.trackOnce(key, "scroll_depth_reached", { depth_percent: 25, page_name: "home" });
    expect(send("v1:depth:25")).toBe(true);
    expect(send("v1:depth:25")).toBe(false);
    expect(send("v2:depth:25")).toBe(true);
    t.resetOnce("v1:");
    expect(send("v1:depth:25")).toBe(true);
    expect(send("v2:depth:25")).toBe(false);
    expect(calls).toHaveLength(3);
  });
});
