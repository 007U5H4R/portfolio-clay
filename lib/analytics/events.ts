/**
 * The analytics event catalogue (TASK-194, docs/analytics.md). EVERY event the site can send is defined
 * once here — name, trigger, group and a closed property schema — and `track()` only accepts these names
 * with exactly these properties (compile time), while the runtime validates the same schema before
 * anything reaches the SDK. Unit tests (tests/unit/analytics-events.test.ts) pin the catalogue.
 *
 * Naming: `snake_case`, one reusable event per behaviour with descriptive properties (never one event
 * per page, project or button). Privacy: no property can hold free text. Enums are closed, `slug`s are
 * `[a-z0-9_.-]` and length-bounded, numbers are bounded integers (see `schema.ts`).
 *
 * Not implemented, on purpose (the site has no such UI; spec: "do not implement fictional events"):
 * `contact_form_started`, `contact_form_submitted` (the /contact page has no form),
 * `meeting_link_clicked` (no scheduling link), `resume_downloaded` (the résumé is a Google Drive view
 * link that opens in a new tab: an open, never a verifiable download).
 */
import { bool, int, oneOf, optEnum, optInt, optSlug, path, slug, type PropsOf } from "./schema";

/** Bump when a property is renamed/removed or an event's meaning changes; sent as `schema_version`. */
export const SCHEMA_VERSION = 1;

export const PAGE_NAMES = [
  "home", "experience", "portfolio", "case_study", "about", "contact", "thinking", "essay",
  "playground", "certifications", "card", "gummy_lab", "not_found", "other",
] as const;
export type PageName = (typeof PAGE_NAMES)[number];

export const CTA_LOCATIONS = ["header", "hero", "footer", "contact_page", "about", "case_study", "projects", "card", "ask_tushky", "other"] as const;
export type CtaLocation = (typeof CTA_LOCATIONS)[number];

export const CHATBOT_CATEGORIES = ["projects", "experience", "ai_product_management", "cloud_architecture", "contact", "other"] as const;
export type ChatbotCategory = (typeof CHATBOT_CATEGORIES)[number];

export const DESTINATION_TYPES = ["case_study", "project", "page", "external", "contact", "resume"] as const;

const VIDEO_TYPES = ["pitch", "demo"] as const;
const THEMES = ["light", "dark"] as const;

export type EventGroup = "website" | "projects" | "conversion" | "chatbot" | "game";

interface EventDef {
  readonly group: EventGroup;
  readonly trigger: string;
  /** Where the call lives (docs event→component map; a test checks the file exists). */
  readonly where: string;
  /** Counted in the primary success metric (a professional conversion action). */
  readonly conversion?: true;
  readonly props: Parameters<typeof define>[0];
}

function define<const S extends Record<string, ReturnType<typeof oneOf> | ReturnType<typeof optEnum> | ReturnType<typeof slug> | ReturnType<typeof optSlug> | ReturnType<typeof path> | ReturnType<typeof int> | ReturnType<typeof optInt> | ReturnType<typeof bool>>>(props: S): S {
  return props;
}

export const EVENTS = {
  // ---- Group A: website and navigation ------------------------------------------------------------
  page_viewed: {
    group: "website",
    trigger: "A route becomes active: the first load, and each client-side route change (once per transition).",
    where: "lib/analytics/runtime.ts",
    props: define({
      page_name: oneOf(...PAGE_NAMES),
      page_path: path(120),
      navigation_type: oneOf("direct", "client_navigation", "back_forward", "reload"),
      is_landing: bool(),
      session_type: oneOf("new", "returning"),
      theme: optEnum(...THEMES),
    }),
  },
  section_viewed: {
    group: "website",
    trigger: "A `main section[id]` is at least 40% visible: once per section per page view.",
    where: "lib/analytics/runtime.ts",
    props: define({ section_name: slug(40), section_index: int(0, 60), page_name: oneOf(...PAGE_NAMES) }),
  },
  navigation_clicked: {
    group: "website",
    trigger: "An internal link is activated in the header or the footer band.",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({ destination: path(120), navigation_location: oneOf("header", "footer", "other") }),
  },
  outbound_link_clicked: {
    group: "website",
    trigger: "A link to another site is activated (any external anchor, including those that also fire a conversion event).",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({
      destination_domain: slug(80),
      link_type: oneOf("linkedin", "resume", "github", "product", "prd", "video_provider", "credential", "other"),
      cta_location: oneOf(...CTA_LOCATIONS),
    }),
  },
  scroll_depth_reached: {
    group: "website",
    trigger: "25 / 50 / 75 / 90 % of the page has been scrolled past: once per milestone per page view.",
    where: "lib/analytics/runtime.ts",
    props: define({ depth_percent: int(25, 90), page_name: oneOf(...PAGE_NAMES) }),
  },
  theme_changed: {
    group: "website",
    trigger: "The visitor presses the theme switch. Never the initial theme, never a system-preference flip.",
    where: "lib/analytics/runtime.ts (click delegation on [data-theme-toggle])",
    props: define({ theme_from: oneOf(...THEMES), theme_to: oneOf(...THEMES) }),
  },

  // ---- Group B: project explorer ------------------------------------------------------------------
  project_carousel_viewed: {
    group: "projects",
    trigger: "The product carousel is at least 50% visible: once per page view.",
    where: "lib/analytics/runtime.ts",
    props: define({ project_count: int(0, 50), page_name: oneOf(...PAGE_NAMES) }),
  },
  project_selected: {
    group: "projects",
    trigger: "A different product is chosen in the carousel (never on init, never the already-active product).",
    where: "components/portfolio/IndependentProductsShowcase.tsx",
    props: define({ project_id: slug(40), selection_method: oneOf("arrow", "keyboard", "direct_selection") }),
  },
  project_asset_opened: {
    group: "projects",
    trigger: "A product asset is opened: pitch or demo video chosen, product link or case study followed.",
    where: "components/portfolio/IndependentProductsShowcase.tsx; lib/analytics/runtime.ts (click delegation)",
    props: define({ project_id: slug(40), asset_type: oneOf("pitch_video", "demo_video", "product_link", "case_study") }),
  },
  project_video_started: {
    group: "projects",
    trigger: "The embedded player REPORTS playback (YouTube playerState 1). Pressing Play alone does not count.",
    where: "components/portfolio/ProductMediaPlayer.tsx → lib/analytics/use-video-analytics.ts",
    props: define({ project_id: slug(40), video_type: oneOf(...VIDEO_TYPES) }),
  },
  project_video_progressed: {
    group: "projects",
    trigger: "Playback passes 25 / 50 / 75 / 100 % by watching (seeks do not credit), once per milestone per play session.",
    where: "components/portfolio/ProductMediaPlayer.tsx → lib/analytics/use-video-analytics.ts",
    props: define({ project_id: slug(40), video_type: oneOf(...VIDEO_TYPES), progress_percent: int(25, 100) }),
  },
  case_study_viewed: {
    group: "projects",
    trigger: "A /work/<slug> case-study page becomes active (once per page view).",
    where: "lib/analytics/runtime.ts",
    props: define({
      project_id: slug(40),
      entry_point: oneOf("portfolio_page", "experience_page", "home_page", "other_internal", "external_or_direct"),
    }),
  },
  product_link_clicked: {
    group: "projects",
    trigger: "A product / GitHub / PRD link on the portfolio sheet is activated.",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({ project_id: slug(40), destination_domain: slug(80) }),
  },

  // ---- Group C: professional conversion -----------------------------------------------------------
  professional_cta_clicked: {
    group: "conversion",
    conversion: true,
    trigger: "The résumé, LinkedIn or email CTA is activated (the umbrella event: count unique visitors, not events).",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({
      cta_type: oneOf("resume", "linkedin", "email", "contact_page"),
      cta_location: oneOf(...CTA_LOCATIONS),
      destination_type: oneOf("external_document", "external_profile", "email_client", "internal_page"),
    }),
  },
  resume_opened: {
    group: "conversion",
    trigger: "The résumé link (Google Drive viewer, new tab) is activated. An open, not a download or a read.",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({ cta_location: oneOf(...CTA_LOCATIONS), open_method: oneOf("external_viewer") }),
  },
  linkedin_profile_clicked: {
    group: "conversion",
    trigger: "A link to Tushar's LinkedIn profile is activated.",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({ cta_location: oneOf(...CTA_LOCATIONS) }),
  },
  email_contact_clicked: {
    group: "conversion",
    trigger: "A mailto: link is activated. Not proof an email was written or sent.",
    where: "lib/analytics/runtime.ts (click delegation)",
    props: define({ cta_location: oneOf(...CTA_LOCATIONS) }),
  },

  // ---- Group D: Ask Tushky ------------------------------------------------------------------------
  chatbot_opened: {
    group: "chatbot",
    trigger: "The Ask Tushky drawer opens.",
    where: "components/ai/AskPanel.tsx",
    props: define({ entry_point: oneOf("header_button", "hero_cta", "home_section", "other") }),
  },
  chatbot_prompt_selected: {
    group: "chatbot",
    trigger: "A suggested question or follow-up chip is chosen (the text itself is never sent).",
    where: "components/ai/AskPanel.tsx",
    props: define({ prompt_category: oneOf(...CHATBOT_CATEGORIES) }),
  },
  chatbot_message_sent: {
    group: "chatbot",
    trigger: "A typed message is submitted. Only a locally derived category leaves the browser.",
    where: "components/ai/AskPanel.tsx",
    props: define({ message_category: oneOf(...CHATBOT_CATEGORIES) }),
  },
  chatbot_response_received: {
    group: "chatbot",
    trigger: "A turn resolves with an answer or an honest \"no match\": once per turn, retries do not repeat it.",
    where: "components/ai/AskProvider.tsx",
    props: define({ response_status: oneOf("answered_faq", "answered_index", "no_match"), latency_ms: int(0, 600_000) }),
  },
  chatbot_response_failed: {
    group: "chatbot",
    trigger: "A turn ends in the error state (provider threw). Kept apart from successful responses.",
    where: "components/ai/AskProvider.tsx",
    props: define({ latency_ms: int(0, 600_000) }),
  },
  chatbot_cta_clicked: {
    group: "chatbot",
    trigger: "A source / recommended destination link inside the drawer is activated.",
    where: "lib/analytics/runtime.ts (click delegation on .ask-panel)",
    props: define({ destination_type: oneOf(...DESTINATION_TYPES) }),
  },
  chatbot_closed: {
    group: "chatbot",
    trigger: "The drawer closes. `session_message_count` is the number of questions asked in that session.",
    where: "components/ai/AskPanel.tsx",
    props: define({ session_message_count: int(0, 500) }),
  },

  // ---- Group E: Gummy Lab -------------------------------------------------------------------------
  easter_egg_discovered: {
    group: "game",
    trigger: "The hidden five-click brand sequence fires and the Lab is entered.",
    where: "components/easter-egg/SecretTrigger.tsx",
    props: define({ trigger_type: oneOf("brand_click_sequence") }),
  },
  game_intro_viewed: {
    group: "game",
    trigger: "The Lab's intro card is shown (state INTRO): once per Lab visit.",
    where: "lib/analytics/lab.ts",
    props: define({ game_version: oneOf("pinball_v1") }),
  },
  game_started: {
    group: "game",
    trigger: "A first run reaches PLAYING (the countdown ended).",
    where: "lib/analytics/lab.ts",
    props: define({ input_method: oneOf("touch", "pointer"), device_type: oneOf("mobile", "tablet", "desktop") }),
  },
  game_interaction_performed: {
    group: "game",
    trigger: "First time per run a mechanic is used (launch, nudge, power-up, escaping the danger zone). Bounded: 4 per run at most.",
    where: "lib/analytics/lab.ts",
    props: define({ interaction_type: oneOf("launch", "nudge", "power_up", "danger_escape") }),
  },
  game_milestone_reached: {
    group: "game",
    trigger: "Once per run each: 30 s survived, 60 s survived, combo x5, all four targets (TP MODE).",
    where: "lib/analytics/lab.ts",
    props: define({ milestone_type: oneOf("survived_30s", "survived_60s", "combo_5", "tp_mode") }),
  },
  game_over: {
    group: "game",
    trigger: "A run ends (the gummy drained). Exactly once per run.",
    where: "lib/analytics/lab.ts",
    props: define({ survival_time_seconds: int(0, 86_400), score: int(0, 100_000_000), end_reason: oneOf("drained") }),
  },
  game_replayed: {
    group: "game",
    trigger: "A new run starts from the results screen.",
    where: "lib/analytics/lab.ts",
    props: define({ previous_score: int(0, 100_000_000) }),
  },
  game_exited_to_portfolio: {
    group: "game",
    trigger: "The visitor leaves the Lab for the portfolio.",
    where: "components/lab/LabApp.tsx → lib/analytics/lab.ts",
    props: define({ exit_location: oneOf("portal", "intro", "playing", "paused", "results", "fallback") }),
  },
} as const satisfies Record<string, EventDef>;

export type EventName = keyof typeof EVENTS;
export type EventProps<N extends EventName> = PropsOf<(typeof EVENTS)[N]["props"]>;
export const EVENT_NAMES = Object.keys(EVENTS) as EventName[];

export function isEventName(value: unknown): value is EventName {
  return typeof value === "string" && Object.hasOwn(EVENTS, value);
}

/** The cta_type → event(s) the click delegation emits; one place so docs and tests agree. */
export const CONVERSION_EVENTS: readonly EventName[] = EVENT_NAMES.filter((n) => (EVENTS[n] as { conversion?: true }).conversion);
