# Certifications — Tushar's interaction spec (2026-09-26, verbatim)

Update the Certifications section of my portfolio so that every certification badge/card is directly clickable and opens the corresponding Credly credential URL in a new tab.

Requirements:

- Do not use a generic "Verify" button.
- Make the entire certification badge or certification card clickable.
- Preserve the current paper-cutout / scrapbook visual style.
- The interaction should feel subtle and premium, not like a normal button.
- On hover:
  - slightly lift the paper card
  - increase the shadow very subtly
  - optionally rotate by 0.5–1 degree
  - show a small external-link / verification cue
- Use `cursor: pointer`.
- Add a small handwritten-style micro-label such as:
  - "View credential ↗"
  - "Verified on Credly ↗"
  - or "Open credential ↗"
- Keep this label visually secondary to the certification name.
- Do not clutter the card with extra CTAs.

Accessibility:
- The clickable card must be keyboard accessible.
- Use a proper `<a>` element rather than an `onClick` handler where possible.
- Add meaningful `aria-label`, for example:
  `View Google Cloud Professional Cloud Architect credential on Credly`
- Open external credential links using:
  `target="_blank"`
  `rel="noopener noreferrer"`
- Ensure visible focus states for keyboard users.

Interaction structure:

Certification Card
├── Year
├── Paper-cutout badge/logo
├── Certification name
├── Issuing organization
├── Capability / skill description
├── "Applied in..." sticky-note annotation
└── Small "View credential ↗" affordance

The entire card should link to its credential URL.

Example structure:

<a
  href="CREDLY_CREDENTIAL_URL"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="View PMP credential on Credly"
  className="certification-card"
>
  ...
  <span className="credential-link">
    View credential ↗
  </span>
</a>

Important:
- Use the exact individual credential URL for each certification, not my general Credly profile URL.
- Store certification information in a reusable data structure rather than hardcoding separate components.

Example:

const certifications = [
  {
    name: "Google Cloud Generative AI Leader",
    issuer: "Google Cloud",
    year: "2025",
    badge: "...",
    credentialUrl: "...",
    skills: ["GenAI Strategy", "Use Cases", "Responsible Adoption"],
    applied: "Applied directly in AI-native product initiatives."
  },
  {
    name: "Project Management Professional (PMP)",
    issuer: "Project Management Institute",
    year: "2025",
    badge: "...",
    credentialUrl: "...",
    skills: ["Program Governance", "Risk", "Stakeholder Alignment", "Delivery"],
    applied: "Applied across enterprise programs."
  }
];

Render the cards using `.map()`.

Also add analytics tracking for each credential click.

If Mixpanel already exists in the project, track:

Event:
`Certification Credential Clicked`

Properties:
{
  certification_name,
  issuer,
  certification_year,
  credential_provider: "Credly",
  credential_url,
  page: "portfolio",
  section: "certifications"
}

Do not block navigation if analytics fails.

Visual objective:
The user should feel like they are clicking a physical certification artifact pinned onto the portfolio, and the click reveals its verified digital credential.

Think:
paper credential → hover/lift → click → Credly verification

Maintain the current portfolio typography, spacing, responsive behavior, paper textures, torn edges, pushpins, tape, handwritten annotations, and color system.

On mobile, keep the full card tappable with at least a 44px effective touch target and avoid hover-dependent information.
