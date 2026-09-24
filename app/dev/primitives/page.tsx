import { Sparkles, Mail, Download } from "lucide-react";
import { devOnly } from "@/lib/dev-only";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayPill } from "@/components/clay/ClayPill";
import { ClayTile } from "@/components/clay/ClayTile";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { Icon } from "@/components/common/Icon";
import { Tag } from "@/components/common/Tag";
import { ExternalLink } from "@/components/common/ExternalLink";
import { CopyButton } from "@/components/common/CopyButton";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Prose } from "@/components/common/Prose";
import { StatusBadge, type ProjectStatus } from "@/components/projects/StatusBadge";
import type { Tone } from "@/components/clay/tiers";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Reveal } from "@/components/interactions/Reveal";

/**
 * /dev/primitives (S04.07) — the full clay + common primitive board. Every primitive is shown
 * across its tiers, tones and states so the design system can be QA'd in one place. Not linked
 * from the site nav, excluded from the sitemap, and 404s in a production build unless
 * `ALLOW_DEV_ROUTES` is set at build time (see lib/dev-only.ts). QA-only route (TSK-09 routes.json).
 */

const TONES: Tone[] = ["neutral", "lavender", "sky", "mint", "blush", "peach", "butter"];
const STATUSES: { status: ProjectStatus; label: string }[] = [
  { status: "live", label: "Live" },
  { status: "pilot", label: "Pilot" },
  { status: "prototype", label: "Prototype" },
  { status: "research", label: "Research" },
  { status: "archived", label: "Archived" },
];

function Board({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-[var(--space-10)]">
      <h2 id={id} className="text-h3 mb-[var(--space-5)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PrimitivesDevPage() {
  devOnly();

  return (
    <main className="min-h-screen bg-paper px-[var(--gutter-mobile)] py-[var(--space-9)] text-navy md:px-[var(--gutter-tablet)]">
      <header>
        <p className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-soft">
          Dev board · QA only
        </p>
        <h1 className="text-h2">Clay primitive system</h1>
      </header>

      {/* ClayCard — tier × tone matrix */}
      <Board id="board-claycard" title="ClayCard — tier × tone">
        {(["hero", "card"] as const).map((tier) => (
          <div key={tier} className="mb-[var(--space-6)]">
            <p className="text-caption font-semibold text-ink-soft mb-[var(--space-3)]">{tier} tier</p>
            <div className="flex flex-wrap gap-[var(--space-4)]">
              {TONES.map((tone) => (
                <ClayCard
                  key={tone}
                  tier={tier}
                  tone={tone}
                  padding="card"
                  interactive={tier === "card"}
                  data-state="rest"
                  className="w-[150px]"
                >
                  <span className="text-caption font-semibold">{tone}</span>
                </ClayCard>
              ))}
            </div>
          </div>
        ))}
        <div className="mb-[var(--space-4)]">
          <p className="text-caption font-semibold text-ink-soft mb-[var(--space-3)]">
            utility &amp; flat tiers (no volume, neutral only)
          </p>
          <div className="flex flex-wrap gap-[var(--space-4)]">
            <ClayCard tier="utility" padding="card" data-state="rest" className="w-[150px]">
              <span className="text-caption font-semibold text-navy-2">utility</span>
            </ClayCard>
            <ClayCard tier="flat" padding="card" data-state="rest" className="w-[150px]">
              <span className="text-caption font-semibold text-navy-2">flat</span>
            </ClayCard>
          </div>
        </div>
      </Board>

      {/* ClayButton — variant × size × state */}
      <Board id="board-claybutton" title="ClayButton — variant · size · state">
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <ClayButton variant="primary" data-state="rest">
            Primary
          </ClayButton>
          <ClayButton variant="primary" size="lg" data-state="rest">
            Primary large
          </ClayButton>
          <ClayButton variant="secondary" data-state="rest">
            Secondary
          </ClayButton>
          <ClayButton variant="ghost" data-state="rest">
            Ghost
          </ClayButton>
          <ClayButton variant="primary" trailingIcon={<Icon icon={Sparkles} size={20} />} data-state="rest">
            Trailing icon
          </ClayButton>
          <ClayButton variant="primary" loading data-state="loading">
            Loading
          </ClayButton>
          <ClayButton variant="ghost" iconOnly aria-label="Sparkle action" data-state="rest">
            <Icon icon={Sparkles} size={20} />
          </ClayButton>
          <ClayButton href="/resume.pdf" download variant="secondary" data-state="rest">
            <Icon icon={Download} size={20} />
            Download link
          </ClayButton>
          <ClayButton
            href="https://www.linkedin.com/in/pathaktushar"
            external
            variant="secondary"
            data-state="rest"
          >
            External link
          </ClayButton>
        </div>
      </Board>

      {/* ClayPill — filter / tag / link */}
      <Board id="board-claypill" title="ClayPill — filter · tag · link">
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <ClayPill variant="filter" data-testid="pill-filter" data-state="rest">
            Filter (rest)
          </ClayPill>
          <ClayPill variant="filter" active data-state="active">
            Filter (active)
          </ClayPill>
          <ClayPill variant="tag" data-testid="pill-tag">
            Tag (static)
          </ClayPill>
          <ClayPill variant="link" href="/work/teachspark" data-state="rest">
            View TeachSpark
          </ClayPill>
        </div>
      </Board>

      {/* ClayTile / ClayFrame / ClayIcon */}
      <Board id="board-claytile" title="ClayTile · ClayFrame · ClayIcon">
        <div className="flex flex-wrap items-end gap-[var(--space-5)]">
          <ClayTile size={56} tone="lavender">
            <span className="text-caption font-semibold">56</span>
          </ClayTile>
          <ClayTile size={120} tone="mint">
            <span className="text-caption font-semibold">120</span>
          </ClayTile>
          <ClayTile size={180} tier="card" tone="peach" interactive data-state="rest">
            <span className="text-caption font-semibold">180 · card · interactive</span>
          </ClayTile>
          <ClayFrame ratio="4/5" tone="sky" tone2="lavender" className="w-[120px]">
            <VisuallyHidden>4:5 avatar frame preview</VisuallyHidden>
          </ClayFrame>
          <ClayFrame ratio="16/9" tier="card" tone="mint" bezel className="w-[200px]">
            <VisuallyHidden>16:9 media frame preview with bezel</VisuallyHidden>
          </ClayFrame>
          <ClayIcon icon={Sparkles} size={40} tone="butter" />
          <ClayIcon icon={Sparkles} size={56} tone="blush" />
        </div>
      </Board>

      {/* StatusBadge — every status */}
      <Board id="board-statusbadge" title="StatusBadge — colour never alone">
        <div className="flex flex-wrap gap-[var(--space-4)]">
          {STATUSES.map(({ status, label }) => (
            <StatusBadge key={status} status={status} statusLabel={label} />
          ))}
        </div>
      </Board>

      {/* Common primitives */}
      <Board id="board-common" title="Common primitives">
        <div className="flex flex-wrap items-center gap-[var(--space-4)] mb-[var(--space-5)]">
          <Tag>AI</Tag>
          <Tag>Product</Tag>
          <CopyButton value="Tushar_Pathak@outlook.com" state="idle" data-state="idle" />
          <CopyButton value="Tushar_Pathak@outlook.com" state="copied" data-state="copied" />
          <CopyButton value="Tushar_Pathak@outlook.com" state="error" data-state="error" />
          <ClayButton href="mailto:Tushar_Pathak@outlook.com" variant="secondary">
            <Icon icon={Mail} size={20} />
            Email me
          </ClayButton>
        </div>
        <Prose>
          <p>
            This is the flat <code>Prose</code> measure (60ch). It reads with no clay at all — for
            an inline link that leaves the site, use{" "}
            <ExternalLink href="https://github.com/007U5H4R">the GitHub profile</ExternalLink> which
            opens in a new tab.
          </p>
          <p>
            A second paragraph proves the <code>p + p</code> spacing rhythm the essay and chapter
            bodies rely on.
          </p>
        </Prose>
      </Board>

      {/* Layout system — Container / Section / SectionHeading / Reveal (S05.01/S05.02, TKT-05).
          `tests/e2e/layout.spec.ts` measures the two data-testid nodes directly; this board is the
          documented "≥2 sections" precondition for TC-027/TC-028 before a real page adopts them
          (TKT-14+). QA-only, same ALLOW_DEV_ROUTES gate as the rest of this route. */}
      <Board id="board-layout" title="Layout system — Container · Section · SectionHeading · Reveal">
        <Container data-testid="layout-demo-container" className="border border-dashed border-navy/20 py-[var(--space-4)]">
          <p className="text-caption text-ink-soft">Container gutter/max-width demo</p>
        </Container>
        <Section
          data-testid="layout-demo-section"
          tone="lavender"
          aria-labelledby="layout-demo-heading"
        >
          <SectionHeading
            id="layout-demo-heading"
            eyebrow="Demo"
            title="Section rhythm"
            lead="Vertical padding follows the 72/96/128 token ladder; tone is the one-accent-per-section mechanism."
          />
          <Reveal data-testid="reveal-demo" className="mt-[var(--space-5)]">
            <p className="text-caption text-navy-2">
              Reveal fires once via IntersectionObserver, then disconnects.
            </p>
          </Reveal>
        </Section>
      </Board>
    </main>
  );
}
