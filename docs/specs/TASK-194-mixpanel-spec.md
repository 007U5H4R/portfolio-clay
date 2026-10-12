# Claude Implementation Prompt: Mixpanel Analytics for TusharPathak.com

## 1. Role and objective

Act as a Senior Analytics Engineer, Technical Product Manager, and Frontend Architect.

Your task is to audit, design, implement, validate, and document a production-ready Mixpanel analytics system for **TusharPathak.com**, my personal portfolio website.

The website is an interactive, premium portfolio showcasing my work in AI product management, technical product development, cloud technologies, and experimentation. It includes a project explorer/carousel, pitch and demo videos, professional contact links, a light/dark theme system, an AI chatbot called Ask Tushky, and a hidden interactive Gummy Lab game.

The primary business objective is to understand whether the portfolio converts visitors into meaningful professional opportunities.

Do not treat this as a generic page-view tracking exercise. Implement a structured, privacy-conscious, evidence-driven analytics system that can answer:

1. Where do portfolio visitors come from?
2. What content attracts their attention?
3. Which projects demonstrate my capabilities most effectively?
4. Do visitors watch pitch and demo videos?
5. Do visitors click my resume, LinkedIn profile, email, or other professional CTAs?
6. Which acquisition sources and landing pages generate the strongest engagement?
7. How do mobile visitors interact with the portfolio compared with desktop visitors?
8. Does Ask Tushky help visitors discover relevant information?
9. How do visitors discover and interact with Gummy Lab?
10. Which improvements should I prioritize based on actual visitor behavior?

**Primary success metric:** Professional conversion actions per unique eligible visitor, with each conversion type reported separately.

Do not claim that a visitor is a recruiter, hiring manager, or qualified lead unless that status is established through an explicitly available and privacy-compliant source. Website behavior alone cannot establish professional intent with certainty.

---

## 2. Non-negotiable implementation principles

### 2.1 Audit before coding

Before modifying any file:

- Inspect the complete existing project structure.
- Identify the framework, language, package manager, build system, routing mechanism, and deployment setup.
- Identify the existing Mixpanel integration, if any.
- Inspect page components, navigation, project data, carousel implementation, video players, theme management, smooth scrolling, chatbot, and Gummy Lab.
- Identify existing analytics utilities, consent management, error handling, and environment variable conventions.
- Review current dependencies and reusable utilities before introducing anything new.
- Determine how external links, downloadable assets, embedded videos, and contact interactions currently work.

Do not assume the application uses Next.js, React, or any specific framework until the repository confirms it.

### 2.2 Preserve the existing website

Analytics implementation must not change:

- Existing page content, information architecture, or visual hierarchy.
- The desktop or mobile project carousel layout.
- The 3D origami and paper-cut visual language.
- Light/dark theme behavior, theme persistence, or theme-aware assets.
- Smooth scrolling, navigation transitions, cursor effects, or animations.
- Ask Tushky's conversation functionality or response behavior.
- Gummy Lab's physics, collisions, drag/flick mechanics, score, timer, game states, and replay functionality.
- Existing routes, product links, video playback, and external navigation.

Do not redesign components as part of this task. Do not add an animation framework, WebGL implementation, or unrelated dependencies. Analytics must remain independent of the visual layer and should have minimal runtime overhead.

### 2.3 Establish an analytics architecture

Create a centralized, typed analytics abstraction appropriate for the existing stack.

The preferred conceptual structure is:

- `analytics client`: Mixpanel initialization and configuration.
- `analytics events`: canonical event names and property schemas.
- `analytics tracking`: reusable tracking functions.
- `analytics context`: common page, device, theme, and attribution context.
- `analytics consent`: consent-aware initialization and tracking, integrated with the existing consent mechanism where available.
- `analytics tests`: unit tests and integration checks.

These are logical responsibilities, not mandatory filenames. Follow the existing repository conventions.

Use the official Mixpanel JavaScript SDK appropriate for the installed framework and current SDK documentation. Do not invent unsupported SDK methods. Verify the installed version and use its documented APIs.

All application-level tracking should go through the central analytics layer rather than direct `mixpanel.track()` calls scattered across UI components.

---

## 3. Phase 1 — Repository discovery and implementation plan

Start by producing a concise implementation audit.

Document:

1. Detected framework and package manager.
2. Current route and component structure.
3. Existing Mixpanel or other analytics integrations.
4. Current theme and consent mechanisms.
5. Existing project identifiers and project metadata.
6. How videos, external links, resume downloads, and contact interactions work.
7. How Ask Tushky and Gummy Lab are implemented.
8. Which events can be tracked reliably without modifying core functionality.
9. Any missing information or implementation blockers.

Then create a proposed implementation plan containing:

- Files to create.
- Files to modify.
- Dependencies to add, if necessary.
- Events and properties to implement.
- Privacy safeguards.
- Testing strategy.
- Environment configuration.

Do not stop after the audit. Once the relevant architecture is understood, proceed with implementation unless a genuine blocker requires clarification. Do not ask me to supply information that can be discovered by inspecting the repository.

---

## 4. Phase 2 — Mixpanel configuration

Configure Mixpanel using environment-specific settings.

Requirements:

- Use a dedicated development/test Mixpanel project and a separate production project where the deployment setup supports it.
- Never hardcode project tokens in application source code.
- Use the framework's correct public environment variable convention.
- Validate required configuration during development without crashing the production website when analytics configuration is absent.
- Do not expose private server-side credentials or administrative secrets.
- Initialize the client only once.
- Prevent duplicate initialization during hot reloads and framework development behavior.
- Ensure the application can operate normally when Mixpanel is blocked, unavailable, or not configured.
- Use HTTPS and the appropriate official SDK transport configuration.
- Do not load Mixpanel or transmit events before the required consent conditions are satisfied.

Create an environment configuration example file if the repository uses one. Never overwrite existing environment files or expose real credentials.

Use a clear setup guide describing how I should obtain the project token and configure each environment.

If a consent banner already exists, integrate with it. If there is no consent mechanism, assess the applicable requirements and implement or document the necessary consent behavior rather than silently assuming that tracking is permitted. Do not build an unnecessarily elaborate consent platform for this task.

---

## 5. Phase 3 — Canonical event taxonomy

Implement the following event taxonomy.

Use `snake_case` names consistently. Define each event once in a central event catalog. Use reusable event names with descriptive properties instead of generating separate event names for every page, project, or button.

### Group A: Website and navigation

| Event | Trigger | Required properties |
|---|---|---|
| `page_viewed` | A page or SPA route becomes active | `page_name`, `page_path`, `navigation_type` |
| `section_viewed` | A meaningful content section becomes visible | `section_name`, `section_index` |
| `navigation_clicked` | A navigation item is activated | `destination`, `navigation_location` |
| `outbound_link_clicked` | An external link is activated | `destination_domain`, `link_type`, `cta_location` |
| `scroll_depth_reached` | A scroll milestone is reached | `depth_percent`, `page_name` |
| `theme_changed` | The visitor changes theme | `theme_from`, `theme_to` |

Implementation requirements:

- Handle direct page loads and client-side route changes.
- Do not emit duplicate page views for the same route transition.
- Exclude URL fragments and transient query parameters from canonical page identity unless they materially identify distinct content.
- Use Intersection Observer or the existing equivalent for section visibility.
- Emit each section visibility event once per section per page view.
- Track scroll depth at 25%, 50%, 75%, and 90%.
- Emit each scroll milestone once per page view.
- Do not track raw scroll events, mouse movement, animation frames, or every intersection callback.
- Do not emit `theme_changed` during initial theme hydration. Only track an actual user-initiated change.
- Ensure route transitions work with the existing smooth-scroll implementation.

### Group B: Project explorer and carousel

The project explorer contains project cards, pitch/demo videos, and actions that allow visitors to explore each project.

| Event | Trigger | Required properties |
|---|---|---|
| `project_carousel_viewed` | The carousel enters meaningful visibility | `project_count`, `page_name` |
| `project_selected` | A visitor selects a different project | `project_id`, `selection_method` |
| `project_asset_opened` | A project asset is opened | `project_id`, `asset_type` |
| `project_video_started` | A video actually begins playback | `project_id`, `video_type` |
| `project_video_progressed` | A video reaches a supported milestone | `project_id`, `video_type`, `progress_percent` |
| `case_study_viewed` | A case study becomes meaningfully visible or opens | `project_id`, `entry_point` |
| `product_link_clicked` | A project product link is activated | `project_id`, `destination_domain` |

Allowed `asset_type` values:

- `pitch_video`
- `demo_video`
- `product_link`
- `case_study`

Allowed `selection_method` values should reflect the actual UI, for example:

- `arrow`
- `swipe`
- `pagination`
- `keyboard`
- `direct_selection`

Use only methods supported by the existing carousel.

Requirements:

- Use stable project IDs derived from the canonical project data.
- Do not use card indexes as project identities.
- Do not fire `project_selected` during initial carousel initialization.
- Do not emit duplicate selection events when the same project remains active.
- Ensure desktop arrows and mobile swipe gestures are both handled.
- Avoid modifying the carousel's visual or animation behavior.
- Track project video playback only when the player confirms that playback has started.
- Track progress milestones at 25%, 50%, 75%, and 100%, at most once per video play session.
- Handle seeking, pausing, replaying, and failed playback without generating false completion events.
- Use the existing video provider's supported playback events. Do not assume embedded players expose the same API.
- If a video provider does not expose reliable playback information, track the available interaction and document the limitation.
- Do not label a button click as a completed video view.

### Group C: Professional conversion

| Event | Trigger | Required properties |
|---|---|---|
| `professional_cta_clicked` | A professional CTA is activated | `cta_type`, `cta_location`, `destination_type` |
| `resume_opened` | A resume-viewing action is activated | `cta_location`, `open_method` |
| `resume_downloaded` | A real resume download is initiated | `file_type`, `cta_location` |
| `linkedin_profile_clicked` | The LinkedIn profile link is activated | `cta_location` |
| `email_contact_clicked` | An email contact link is activated | `cta_location` |
| `meeting_link_clicked` | An existing scheduling link is activated | `cta_location` |
| `contact_form_started` | A visitor begins interacting with an existing form | `form_location` |
| `contact_form_submitted` | An existing contact form submission succeeds | `form_location`, `submission_method` |

Use actual CTA locations such as `hero`, `navbar`, `footer`, `about`, or `contact`, depending on what exists.

Use a consistent `cta_type` taxonomy, for example:

- `resume`
- `linkedin`
- `email`
- `meeting`
- `contact_form`

Do not create UI elements or new conversion flows as part of analytics implementation.

Requirements:

- If multiple events describe the same action, avoid double-counting the same conversion in aggregate reports.
- Preserve default browser navigation and download behavior.
- Do not prevent a valid link action merely to wait for analytics transmission.
- Do not treat an email link click as a sent email.
- Do not treat a resume download initiation as proof that the file was successfully read.
- Do not treat an external scheduling link click as a completed booking.
- If a contact form does not exist, do not implement fictional form events.
- If a download cannot be reliably distinguished from opening a file, track the available behavior honestly.

### Group D: Ask Tushky chatbot

| Event | Trigger | Required properties |
|---|---|---|
| `chatbot_opened` | The chatbot is opened | `entry_point` |
| `chatbot_prompt_selected` | A suggested prompt is selected | `prompt_category` |
| `chatbot_message_sent` | A message is submitted | `message_category` |
| `chatbot_response_received` | A response is successfully returned | `response_status`, `latency_ms` |
| `chatbot_cta_clicked` | A recommended destination is activated | `destination_type` |
| `chatbot_closed` | The chatbot is closed | `session_message_count` |

Suggested prompt categories:

- `projects`
- `experience`
- `ai_product_management`
- `cloud_architecture`
- `contact`
- `other`

Requirements:

- Inspect the existing chatbot implementation before adding instrumentation.
- Preserve the chatbot's current interface, conversation behavior, API integration, and streaming responses.
- Do not send raw user messages, complete conversation transcripts, API prompts, model outputs, email addresses, or other personal information to Mixpanel.
- Categorize messages locally where possible using existing UI context or a small deterministic mapping. Do not introduce another LLM call just to categorize analytics events.
- Do not infer sensitive personal attributes.
- Track successful response completion separately from errors.
- Record response latency using an appropriate monotonic timing mechanism available in the existing runtime.
- Ensure retries do not create duplicate response-completion events.
- Do not track message content, response content, or sensitive error payloads in event properties.
- If categorization is unreliable, use `other` rather than inventing a category.

### Group E: Gummy Lab game

Gummy Lab is an interactive game within the portfolio. Track it as a distinct experience without affecting the core game loop.

| Event | Trigger | Required properties |
|---|---|---|
| `easter_egg_discovered` | The hidden trigger is activated | `trigger_type` |
| `game_intro_viewed` | The introduction is displayed | `game_version` |
| `game_started` | Gameplay actually starts | `input_method`, `device_type` |
| `game_interaction_performed` | A meaningful interaction occurs | `interaction_type` |
| `game_milestone_reached` | A defined gameplay milestone occurs | `milestone_type` |
| `game_over` | The current run ends | `survival_time_seconds`, `score`, `end_reason` |
| `game_replayed` | A new run starts after game over | `previous_score` |
| `game_exited_to_portfolio` | The visitor returns to the portfolio | `exit_location` |

Allowed `interaction_type` values should reflect existing mechanics, such as:

- `drag`
- `flick`
- `squish`
- `rescue`

Only instrument mechanics that actually exist.

Requirements:

- Inspect the existing game architecture and identify safe event boundaries before changing any code.
- Never instrument animation frames, physics ticks, collision loops, or every object movement.
- Do not add analytics calls inside high-frequency rendering or physics callbacks.
- Aggregate repetitive actions and emit only meaningful, bounded events.
- Define milestones using existing game states or meaningful score/survival thresholds.
- Avoid introducing new gameplay behavior to create analytics events.
- Prevent duplicate `game_over` events when multiple conditions cause a state transition.
- Ensure score, elapsed time, replay, and exit properties reflect the actual completed run.
- Preserve the hidden trigger and existing gameplay mechanics.
- If instrumentation risks changing physics or timing, use a lightweight event boundary or state-transition callback instead.

---

## 6. Phase 4 — Shared event properties and attribution

Create a controlled property schema.

### 6.1 Common properties

| Property | Description |
|---|---|
| `page_name` | Canonical page identifier |
| `page_path` | Normalized pathname |
| `section_name` | Canonical section identifier |
| `device_type` | `mobile`, `desktop`, or `tablet`, based on a documented classification |
| `theme` | `light` or `dark`, when available |
| `project_id` | Stable project identifier |
| `cta_location` | UI placement of the CTA |
| `session_type` | `new` or `returning`, only if reliably defined |
| `environment` | `development`, `staging`, or `production`, where applicable |

Do not attach irrelevant properties to every event. Prefer the smallest useful schema.

Use built-in Mixpanel properties where they provide the required information reliably. Avoid redundant custom copies of automatically collected properties.

### 6.2 UTM and referral attribution

Support standard campaign parameters:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Also preserve the available referrer context.

Requirements:

- Inspect the SDK's existing attribution behavior before implementing custom attribution.
- Avoid duplicating built-in properties or breaking Mixpanel's attribution model.
- If custom first-touch or last-touch attribution is required, define the semantics precisely.
- Persist attribution only using the site's approved storage and consent approach.
- Do not store arbitrary URL query strings or sensitive URL parameters.
- Exclude access tokens, authentication codes, email addresses, and other potentially sensitive query values.
- Support campaign links from LinkedIn and other external sources.
- Document how to create and test a UTM-tagged campaign URL.

Do not invent attribution data when no source is available.

### 6.3 Identity and sessions

Use anonymous visitor tracking by default.

- Follow Mixpanel's documented anonymous identity and session behavior.
- Avoid creating custom user IDs from email addresses, names, phone numbers, or other personal information.
- Do not identify visitors as recruiters or employers without verified, appropriate evidence.
- Do not implement fingerprinting.
- Do not add cross-device identity resolution.
- Do not use custom session IDs unless a concrete requirement justifies them.
- If anonymous identity is already managed by Mixpanel, do not create a competing identity system.

Document how anonymous visitors and returning visitors are represented.

---

## 7. Phase 5 — Analytics architecture and type safety

Create a central event catalog using the repository's existing language and conventions.

If the application uses TypeScript, define typed event names and property schemas. If it uses another language, implement equivalent validation using the existing tooling.

The abstraction should conceptually support:

- `initializeAnalytics()`
- `trackEvent(eventName, properties)`
- `trackPageView(pageContext)`
- `trackConversion(conversionType, context)`
- `setAnalyticsConsent(consentState)`, if needed by the existing consent architecture

These are suggested responsibilities, not mandatory function names.

Requirements:

1. Reject or catch unknown event names in development.
2. Validate required properties during development and testing.
3. Avoid throwing errors into the user-facing application when tracking fails.
4. Prevent duplicate initialization.
5. Prevent duplicate event emission.
6. Use consistent property types and controlled enum values.
7. Avoid `any` or unvalidated arbitrary objects where stronger typing is practical.
8. Avoid a generic API that allows any component to submit arbitrary user data.
9. Do not expose internal SDK objects throughout the application.
10. Ensure the tracking layer can be unit-tested independently of Mixpanel.

Add a small event registry or equivalent documentation that lists the canonical events, their triggers, required properties, and implementation locations.

Do not build an unnecessarily complicated event framework for a personal portfolio.

---

## 8. Phase 6 — Dashboards and analytical questions

Implement the event instrumentation so the following reports can be built in Mixpanel.

Do not assume that dashboard creation can be automated through the browser SDK. If a supported administrative integration or API is available and configured, use it appropriately; otherwise provide exact dashboard setup instructions.

### Dashboard A: Portfolio performance

Reports:

- Unique visitors over time.
- New versus returning visitors, with the definitions documented.
- Top landing pages.
- Traffic source and campaign breakdown.
- Section reach and scroll-depth distribution.
- Mobile versus desktop engagement.
- Light versus dark theme usage, interpreted as descriptive behavior rather than proof of preference.

Questions answered:

- Which channels attract visitors?
- Which pages and sections get meaningful attention?
- Does mobile behavior differ from desktop behavior?

### Dashboard B: Career conversion

Reports:

- Resume interaction rate.
- LinkedIn click rate.
- Email contact click rate.
- Contact form submission rate, if applicable.
- Conversion by CTA location.
- Conversion by landing page.
- Professional conversion actions by acquisition source.
- Project exploration followed by a professional CTA.

Define the denominator for every rate. Distinguish unique visitors from total events and avoid summing overlapping conversion actions into a misleading unique-lead count.

### Dashboard C: Project effectiveness

Reports:

- Project carousel reach.
- Project selection distribution.
- Pitch video starts and completion rates.
- Demo video starts and completion rates.
- Case study views.
- Product link clicks.
- Project-specific professional CTA conversion.

Use stable project IDs and human-readable project labels in the analysis layer.

Do not rank projects by raw event counts alone. Where appropriate, normalize engagement against unique visitors who had an opportunity to view the project.

### Dashboard D: Interactive experiences

Reports:

- Ask Tushky open rate.
- Suggested prompt selection.
- Successful chatbot response rate.
- Chatbot destination clicks.
- Gummy Lab discovery rate.
- Game start rate.
- Replay rate.
- Survival-time and score distributions.
- Theme changes and device breakdown.

Keep game engagement separate from professional conversion.

### Funnel definitions

Configure or document these funnels:

**Funnel 1: Portfolio to professional action**

`page_viewed` → `project_selected` → `project_video_started` or `case_study_viewed` → `professional_cta_clicked`

This is a diagnostic funnel. The middle steps are optional paths, so do not force every visitor to follow the same sequence.

**Funnel 2: Project effectiveness**

`project_selected` → `project_video_started` or `case_study_viewed` → `product_link_clicked` or `professional_cta_clicked`

Analyze the results by `project_id`.

**Funnel 3: Resume conversion**

`page_viewed` → `resume_opened` or `resume_downloaded`

Do not interpret a click as proof that the resume was read.

**Funnel 4: Ask Tushky effectiveness**

`chatbot_opened` → `chatbot_prompt_selected` or `chatbot_message_sent` → `chatbot_response_received` → `chatbot_cta_clicked`

Allow visitors to type a message without selecting a suggested prompt.

**Funnel 5: Gummy Lab engagement**

`easter_egg_discovered` → `game_started` → `game_over` → `game_replayed`

Treat the funnel as a sequence of observable events. A visitor leaving the game is not necessarily a failed session.

Where a funnel is configured using Mixpanel's native funnel builder, specify appropriate conversion windows and unique-user versus event-level counting rules.

---

## 9. Phase 7 — Privacy, consent, and data minimization

Privacy requirements are mandatory.

- Do not track form field contents.
- Do not send raw chatbot messages or AI responses.
- Do not send resume content, email addresses, phone numbers, names, or contact details.
- Do not track clipboard contents, keystrokes, or arbitrary DOM text.
- Do not transmit authentication tokens, secret query parameters, or private URLs.
- Do not capture complete URLs when they may contain sensitive query parameters.
- Avoid unnecessary geolocation or other invasive identification.
- Do not enable session replay or automatic DOM capture for this task.
- Do not introduce cross-site tracking.
- Do not bypass browser privacy controls.
- Respect applicable consent requirements and the site's existing consent preferences.
- Ensure consent withdrawal prevents subsequent tracking and follows the appropriate documented SDK behavior.
- Review whether analytics persistence must be cleared or restricted when consent is withdrawn.
- Ensure analytics failures do not block navigation, video playback, chatbot responses, or gameplay.

Document what data is collected, why it is collected, and which data is explicitly excluded.

---

## 10. Phase 8 — Performance and reliability

The portfolio contains interactive visuals, embedded media, and a game. Analytics must not materially degrade those experiences.

Requirements:

- Keep analytics initialization and event payloads lightweight.
- Avoid synchronous network requests.
- Do not introduce unnecessary blocking scripts.
- Avoid repeated serialization or expensive computation during rendering.
- Never await analytics transmission before allowing a normal navigation or game action to proceed.
- Use the SDK's supported transport, batching, and unload behavior.
- Handle blocked requests and network failures gracefully.
- Do not retry indefinitely.
- Prevent high-frequency game or scroll interactions from generating excessive event volume.
- Ensure analytics instrumentation does not change component rendering or cause layout shifts.
- Verify that production builds do not contain debug logging of user interactions.
- Keep the event schema stable and versioned when material changes are introduced.

If performance measurements are available, compare relevant build or runtime measurements before and after implementation rather than claiming an improvement without evidence.

---

## 11. Phase 9 — Testing and validation

Write tests using the testing framework already present in the repository.

If there is no test framework, first determine the smallest reasonable way to validate the implementation without introducing an unnecessarily large dependency.

### Unit tests

Test:

- Event name and property validation.
- Required property enforcement.
- Unknown event handling.
- Analytics initialization occurring only once.
- Common property construction.
- Attribution parameter sanitization.
- Consent-gated tracking.
- Duplicate event prevention.
- Video progress milestone deduplication.
- Chatbot response event handling.
- Game state-transition instrumentation.
- Error handling when the SDK is unavailable.

### Integration tests

Verify:

1. Initial page view is tracked correctly.
2. SPA navigation generates exactly one appropriate page-view event.
3. Section visibility events are not emitted repeatedly.
4. Scroll milestones are emitted once per page view.
5. Project selection works through both desktop and mobile interactions.
6. Video start and progress events reflect actual player state.
7. Resume, LinkedIn, email, and product links continue to work.
8. Theme changes are tracked without false initialization events.
9. Ask Tushky does not transmit raw conversation content.
10. Gummy Lab gameplay remains unchanged.
11. Game events correspond to actual game states.
12. No tracking occurs before the required consent is granted.
13. Analytics failures do not interrupt normal functionality.
14. Production configuration is distinct from development configuration.

### Manual Mixpanel validation

Provide a test plan for validating the implementation in Mixpanel's live event stream or equivalent debugging interface.

For every implemented event, document:

- The UI action that triggers it.
- The expected event name.
- Required properties.
- Expected behavior for repeat interactions.
- Relevant edge cases.

Do not claim that events have reached Mixpanel unless you have actually verified them using a working project configuration.

---

## 12. Phase 10 — Documentation and deliverables

Create documentation in the repository, following its existing documentation conventions.

At minimum, provide:

### A. `docs/analytics/mixpanel-implementation.md`

Include:

- Architecture overview.
- Initialization and environment setup.
- Event taxonomy.
- Event-to-component mapping.
- Common property definitions.
- Attribution rules.
- Identity and session behavior.
- Consent and privacy controls.
- Video tracking limitations.
- Known instrumentation gaps.

### B. `docs/analytics/mixpanel-dashboard-guide.md`

Include:

- Four dashboard definitions.
- Recommended reports and breakdowns.
- Funnel definitions.
- Conversion-rate formulas and denominators.
- Instructions for configuring reports in Mixpanel.
- Guidance for interpreting the results.

### C. `docs/analytics/mixpanel-qa-checklist.md`

Include:

- Automated test results.
- Manual test cases.
- Consent checks.
- Mobile and desktop checks.
- Event deduplication checks.
- Production configuration checks.
- Any remaining limitations.

### D. Environment example

Update the existing environment example with clearly named placeholder values for the Mixpanel configuration. Never place real tokens in committed source code.

### E. Code changes

Deliver the actual implementation, not just the documentation or a suggested code sample.

Use the smallest reasonable set of files and dependencies that fits the existing architecture.

---

## 13. Acceptance criteria

The implementation is complete only when the following are satisfied.

### Functional

- [ ] Mixpanel initializes correctly in the intended environment.
- [ ] Page views work for direct navigation and client-side route transitions.
- [ ] Section visibility and scroll milestones are deduplicated.
- [ ] Project interactions use stable project identifiers.
- [ ] Video events reflect actual playback where supported.
- [ ] Professional CTA events accurately represent the interaction.
- [ ] Ask Tushky instrumentation does not transmit raw conversation content.
- [ ] Gummy Lab analytics do not alter gameplay behavior.
- [ ] Theme switching and existing navigation continue to work.
- [ ] Missing analytics configuration does not break the website.

### Data quality

- [ ] Event names follow the canonical taxonomy.
- [ ] Required properties are consistently populated.
- [ ] Property types and enumerated values are validated.
- [ ] No duplicate initialization or avoidable duplicate events occur.
- [ ] Development and production data are separated.
- [ ] Campaign attribution is handled consistently.
- [ ] Sensitive information is excluded.

### Quality assurance

- [ ] Relevant unit tests pass.
- [ ] Relevant integration tests pass.
- [ ] Build succeeds.
- [ ] Lint and type checks pass where supported.
- [ ] Existing routes and interactive components are verified.
- [ ] Mobile and desktop layouts remain unchanged.
- [ ] Any unverified behavior or missing external configuration is explicitly documented.

### Documentation

- [ ] Implementation documentation exists.
- [ ] Dashboard setup documentation exists.
- [ ] QA checklist exists.
- [ ] Environment setup is documented.
- [ ] Remaining limitations are listed.

Do not mark an acceptance criterion as complete without evidence.

---

## 14. Execution workflow

Execute the work in the following order:

**Step 1 — Discover:** Inspect the repository, current architecture, components, environment setup, and dependencies.

**Step 2 — Plan:** Present a concise implementation plan with the proposed event catalog, integration points, and risks.

**Step 3 — Implement the foundation:** Configure Mixpanel, the event catalog, the tracking abstraction, consent behavior, and common context.

**Step 4 — Instrument the website:** Add page, section, navigation, project, video, and professional conversion events.

**Step 5 — Instrument interactive experiences:** Add Ask Tushky and Gummy Lab tracking through safe, existing event boundaries.

**Step 6 — Validate:** Run tests, build, lint, type checks, and available browser or integration checks.

**Step 7 — Document:** Create the three analytics documents and update environment examples.

**Step 8 — Report:** Summarize exactly what changed, what passed, what remains incomplete, and how I can verify the events in Mixpanel.

If a technical limitation prevents a specific event from being tracked accurately, implement the closest truthful alternative and document the limitation. Do not fabricate events or silently weaken their meaning.

---

## 15. Final response format

After implementation, provide a concise engineering handoff with these sections:

1. **Architecture discovered** — Actual framework, routing, analytics integration, and relevant components.
2. **Files created and modified** — File paths and their purpose.
3. **Events implemented** — Grouped by website, projects, conversion, chatbot, and game.
4. **Privacy safeguards** — Consent behavior, data exclusions, and identity configuration.
5. **Validation results** — Exact build, test, lint, and type-check outcomes.
6. **Mixpanel setup required from me** — Any project tokens, environment variables, or dashboard configuration I still need to provide.
7. **Dashboard instructions** — How to configure the four dashboards and five funnels.
8. **Known limitations** — Any event that cannot be verified or instrumented reliably.
9. **Recommended next step** — The highest-value analytics question to investigate once sufficient traffic has accumulated.

Start by inspecting the repository. Do not assume the stack, rewrite working components, or provide only a generic implementation guide. Implement the smallest production-ready solution that meets these requirements and preserves the existing portfolio experience.
