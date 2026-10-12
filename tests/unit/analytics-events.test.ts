import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { EVENTS, EVENT_NAMES, SCHEMA_VERSION, isEventName, type EventName } from "@/lib/analytics/events";
import { validateProps, type PropSpec, type Schema } from "@/lib/analytics/schema";

/**
 * TASK-194 — the event catalogue is the contract with Mixpanel. These tests pin it: naming, the spec's
 * taxonomy, a closed property vocabulary with no room for free text or PII, and the validators.
 */
const schemaOf = (name: EventName): Schema => EVENTS[name].props as Schema;

/** The smallest valid value for a property spec. */
function sample(spec: PropSpec): string | number | boolean {
  switch (spec.kind) {
    case "enum": return spec.values[0]!;
    case "slug": return "sample";
    case "int": return spec.min;
    case "bool": return true;
  }
}
function validInput(name: EventName): Record<string, string | number | boolean> {
  return Object.fromEntries(Object.entries(schemaOf(name)).map(([k, spec]) => [k, sample(spec)]));
}

// The taxonomy of the spec (docs/specs/TASK-194-mixpanel-spec.md §5) and what was deliberately not built.
const SPEC_EVENTS = [
  "page_viewed", "section_viewed", "navigation_clicked", "outbound_link_clicked", "scroll_depth_reached", "theme_changed",
  "project_carousel_viewed", "project_selected", "project_asset_opened", "project_video_started", "project_video_progressed", "case_study_viewed", "product_link_clicked",
  "professional_cta_clicked", "resume_opened", "resume_downloaded", "linkedin_profile_clicked", "email_contact_clicked", "meeting_link_clicked", "contact_form_started", "contact_form_submitted",
  "chatbot_opened", "chatbot_prompt_selected", "chatbot_message_sent", "chatbot_response_received", "chatbot_cta_clicked", "chatbot_closed",
  "easter_egg_discovered", "game_intro_viewed", "game_started", "game_interaction_performed", "game_milestone_reached", "game_over", "game_replayed", "game_exited_to_portfolio",
] as const;
const NOT_BUILT = ["resume_downloaded", "meeting_link_clicked", "contact_form_started", "contact_form_submitted"] as const;
const ADDED = ["chatbot_response_failed"] as const;

describe("event catalogue (TASK-194)", () => {
  it("defines every spec event except the four the site has no UI for, plus one documented addition", () => {
    const expected = [...SPEC_EVENTS.filter((e) => !(NOT_BUILT as readonly string[]).includes(e)), ...ADDED].sort();
    expect([...EVENT_NAMES].sort()).toEqual(expected);
  });

  it("names every event in snake_case, once", () => {
    for (const name of EVENT_NAMES) expect(name).toMatch(/^[a-z]+(_[a-z]+)+$/);
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
  });

  it("carries the spec's required properties on each event", () => {
    const required: Record<string, string[]> = {
      page_viewed: ["page_name", "page_path", "navigation_type"],
      section_viewed: ["section_name", "section_index"],
      navigation_clicked: ["destination", "navigation_location"],
      outbound_link_clicked: ["destination_domain", "link_type", "cta_location"],
      scroll_depth_reached: ["depth_percent", "page_name"],
      theme_changed: ["theme_from", "theme_to"],
      project_carousel_viewed: ["project_count", "page_name"],
      project_selected: ["project_id", "selection_method"],
      project_asset_opened: ["project_id", "asset_type"],
      project_video_started: ["project_id", "video_type"],
      project_video_progressed: ["project_id", "video_type", "progress_percent"],
      case_study_viewed: ["project_id", "entry_point"],
      product_link_clicked: ["project_id", "destination_domain"],
      professional_cta_clicked: ["cta_type", "cta_location", "destination_type"],
      resume_opened: ["cta_location", "open_method"],
      linkedin_profile_clicked: ["cta_location"],
      email_contact_clicked: ["cta_location"],
      chatbot_opened: ["entry_point"],
      chatbot_prompt_selected: ["prompt_category"],
      chatbot_message_sent: ["message_category"],
      chatbot_response_received: ["response_status", "latency_ms"],
      chatbot_cta_clicked: ["destination_type"],
      chatbot_closed: ["session_message_count"],
      easter_egg_discovered: ["trigger_type"],
      game_intro_viewed: ["game_version"],
      game_started: ["input_method", "device_type"],
      game_interaction_performed: ["interaction_type"],
      game_milestone_reached: ["milestone_type"],
      game_over: ["survival_time_seconds", "score", "end_reason"],
      game_replayed: ["previous_score"],
      game_exited_to_portfolio: ["exit_location"],
    };
    for (const [name, props] of Object.entries(required)) {
      const schema = schemaOf(name as EventName);
      for (const p of props) {
        expect(schema[p], `${name}.${p}`).toBeDefined();
        expect((schema[p] as { optional?: true }).optional, `${name}.${p} must be required`).toBeUndefined();
      }
    }
  });

  it("uses only the spec's allowed values for the constrained enums", () => {
    const values = (n: EventName, p: string) => (schemaOf(n)[p] as { values: readonly string[] }).values;
    expect([...values("project_asset_opened", "asset_type")].sort()).toEqual(["case_study", "demo_video", "pitch_video", "product_link"]);
    expect([...values("chatbot_prompt_selected", "prompt_category")].sort()).toEqual(["ai_product_management", "cloud_architecture", "contact", "experience", "other", "projects"]);
    // selection_method: only what the carousel supports (arrows, keyboard, tap/click). Swipe is a native scroll with no selection.
    expect([...values("project_selected", "selection_method")].sort()).toEqual(["arrow", "direct_selection", "keyboard"]);
    // interaction_type: only mechanics that exist in the pinball lab (no drag / flick / squish).
    expect([...values("game_interaction_performed", "interaction_type")].sort()).toEqual(["danger_escape", "launch", "nudge", "power_up"]);
  });

  it("has no property that could hold free text, a URL or personal data", () => {
    const forbiddenNames = /^(email|name|message|text|query|question|answer|prompt|url|href|ip|phone|address|title|content|body|referrer|user_id|distinct_id)$/;
    for (const name of EVENT_NAMES) {
      for (const [prop, spec] of Object.entries(schemaOf(name))) {
        expect(prop, `${name}.${prop}`).not.toMatch(forbiddenNames);
        if (spec.kind === "slug") expect(spec.max, `${name}.${prop} must be length-bounded`).toBeLessThanOrEqual(120);
      }
    }
  });

  it("documents each event: trigger, group, and an implementation file that exists", () => {
    for (const name of EVENT_NAMES) {
      const def = EVENTS[name];
      expect(def.trigger.length, name).toBeGreaterThan(20);
      expect(["website", "projects", "conversion", "chatbot", "game"]).toContain(def.group);
      for (const part of def.where.split(/;|→/)) {
        const file = part.trim().replace(/\s*\(.*$/, "");
        expect(existsSync(resolve(process.cwd(), file)), `${name}: ${file} must exist`).toBe(true);
      }
    }
  });

  it("is versioned", () => {
    expect(SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });

  it("recognises event names exactly", () => {
    expect(isEventName("page_viewed")).toBe(true);
    expect(isEventName("PageViewed")).toBe(false);
    expect(isEventName("toString")).toBe(false);
    expect(isEventName(undefined)).toBe(false);
  });
});

describe("property validation", () => {
  it.each(EVENT_NAMES)("accepts a complete valid payload for %s", (name) => {
    const result = validateProps(schemaOf(name), validInput(name));
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(Object.keys(result.props).sort()).toEqual(Object.keys(validInput(name)).sort());
  });

  it.each(EVENT_NAMES.filter((n) => Object.values(schemaOf(n)).some((s) => !(s as { optional?: true }).optional)))("rejects %s when a required property is missing", (name) => {
    const input = validInput(name);
    const required = Object.entries(schemaOf(name)).find(([, s]) => !(s as { optional?: true }).optional)![0];
    delete input[required];
    const result = validateProps(schemaOf(name), input);
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain(required);
    expect(result.props).toEqual({});
  });

  it("rejects unknown properties (nothing extra can ride along)", () => {
    const result = validateProps(schemaOf("linkedin_profile_clicked"), { cta_location: "hero", email: "a@b.co" });
    expect(result.ok).toBe(false);
    expect(result.errors.join()).toContain('unknown property "email"');
  });

  it("rejects values outside an enum, wrong types and out-of-range numbers", () => {
    const s = schemaOf("page_viewed");
    const base = validInput("page_viewed");
    expect(validateProps(s, { ...base, page_name: "somewhere" }).ok).toBe(false);
    expect(validateProps(s, { ...base, is_landing: "yes" }).ok).toBe(false);
    expect(validateProps(schemaOf("chatbot_response_received"), { response_status: "answered_faq", latency_ms: -1 }).ok).toBe(false);
    expect(validateProps(schemaOf("chatbot_response_received"), { response_status: "answered_faq", latency_ms: 1.5 }).ok).toBe(false);
    expect(validateProps(schemaOf("chatbot_response_received"), { response_status: "answered_faq", latency_ms: "12" }).ok).toBe(false);
  });

  it("slugs accept identifiers and reject free text, URLs, emails and over-long values", () => {
    const s = schemaOf("project_selected");
    const ok = (project_id: string) => validateProps(s, { project_id, selection_method: "arrow" }).ok;
    expect(ok("teachspark")).toBe(true);
    expect(ok("slag-city")).toBe(true);
    for (const bad of ["Tell me about X", "someone@example.com", "https://x.test/a?b=1", "TeachSpark", "a b", "", "x".repeat(41), "-start"]) {
      expect(ok(bad), bad).toBe(false);
    }
  });
});
