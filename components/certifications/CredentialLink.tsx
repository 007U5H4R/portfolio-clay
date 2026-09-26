"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

/**
 * CredentialLink (TKT-102, certifications-spec.md) — the ONE interactive element per certification:
 * a real `<a>` to the individual Credly credential, opened in a new tab. The whole card (year, badge,
 * name, issuer, skills, sticky note, "View credential ↗") is its content, so the entire paper
 * artifact is the click / tap / Enter target — no separate "Verify" button.
 *
 * Client only for the click tracking (`@vercel/analytics` — the project has no Mixpanel): the event
 * fires on click and NEVER blocks navigation — no `preventDefault`, and any analytics failure is
 * swallowed. The children are server-rendered and passed through unchanged.
 */
export interface CredentialLinkProps {
  name: string;
  issuer: string;
  year: string;
  credentialUrl: string;
  className?: string | undefined;
  /** Ids of the visible text that describes the credential (issuer, skills, applied note). */
  describedBy?: string | undefined;
  children: ReactNode;
}

export function CredentialLink({ name, issuer, year, credentialUrl, className, describedBy, children }: CredentialLinkProps) {
  const onClick = () => {
    try {
      track("Certification Credential Clicked", {
        certification_name: name,
        issuer,
        certification_year: year,
        credential_provider: "Credly",
        credential_url: credentialUrl,
        page: "portfolio",
        section: "certifications",
      });
    } catch {
      // Analytics must never block opening the credential.
    }
  };
  return (
    <a
      href={credentialUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View ${name} credential on Credly`}
      aria-describedby={describedBy}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
