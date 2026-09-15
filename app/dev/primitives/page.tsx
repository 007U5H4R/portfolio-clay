import { Sparkles } from "lucide-react";
import { devOnly } from "@/lib/dev-only";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayButton } from "@/components/clay/ClayButton";
import { ClayTile } from "@/components/clay/ClayTile";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { Icon } from "@/components/common/Icon";
import { Tag } from "@/components/common/Tag";
import { StatusBadge } from "@/components/projects/StatusBadge";

/**
 * Minimal smoke page for the tracer's clay primitives (S03.06). Not linked from the site nav
 * and excluded from the sitemap; 404s in production unless `ALLOW_DEV_ROUTES` is set. Extended
 * into the full primitive board in TKT-04 — this page stays minimal until then.
 */
export default function PrimitivesDevPage() {
  devOnly();

  return (
    <main className="min-h-screen bg-bg p-[var(--space-8)] text-ink">
      <h1 className="text-h2">Clay primitives</h1>

      <section className="mt-[var(--space-8)] flex flex-wrap items-start gap-[var(--space-6)]">
        <ClayCard tier="hero" padding="hero">
          Hero card
        </ClayCard>
        <ClayCard tier="card" padding="card" interactive>
          Card (interactive)
        </ClayCard>
        <ClayCard tier="utility">Utility card</ClayCard>
        <ClayCard tier="flat">Flat card</ClayCard>

        <ClayButton>Primary</ClayButton>
        <ClayButton variant="secondary">Secondary</ClayButton>
        <ClayButton variant="ghost" iconOnly aria-label="Sparkle action">
          <Icon icon={Sparkles} />
        </ClayButton>

        <ClayTile tone="lavender">56</ClayTile>
        <ClayFrame ratio="4/5" tone="sky" tone2="lavender" className="w-[120px]">
          <span className="sr-only">Frame preview</span>
        </ClayFrame>
        <ClayIcon icon={Sparkles} tone="butter" />

        <Tag>AI</Tag>
        <StatusBadge status="live" statusLabel="Live" />
      </section>
    </main>
  );
}
