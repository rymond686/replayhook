import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";

export const metadata: Metadata = {
  title: "Changelog",
  description: "User-visible changes to ReplayHook.",
  alternates: { canonical: "/en/changelog/" },
};

export default function ChangelogPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/changelog/" />
      <p className="eyebrow">Changelog</p>
      <h1>Changelog</h1>
      <p className="muted">Dates use the Asia/Shanghai calendar day of the change.</p>

      <h2>0.1.0 — 2026-11-19</h2>
      <h3>Added</h3>
      <ul>
        <li>Published the public preview on GitHub Pages.</li>
        <li>Updated the pricing page with planned Free and US$19.90 tiers, callback limits, retention periods, and audit-log information. These backend capabilities are not yet available in the public preview.</li>
        <li>
          Public English site describing ReplayHook as a read-only Stripe payment and order
          reconciliation diagnostic for small SaaS teams.
        </li>
        <li>
          No-login synthetic reconciliation demo and Stripe event inspector, with inspectable
          evidence for matched, missing business processing, and needs-review results.
        </li>
        <li>
          Stripe integration overview, delivery troubleshooting guide, pricing for the $19–$99
          paid-pilot range, and draft legal and security pages.
        </li>
        <li>
          First-party funnel analytics that do not collect secrets, raw production webhook
          payloads, or identifiable customer data.
        </li>
      </ul>
    </div>
  );
}
