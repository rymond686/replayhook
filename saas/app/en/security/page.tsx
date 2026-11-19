import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security",
  description: "How to report a security issue for ReplayHook and what this phase collects.",
  alternates: { canonical: "/en/security/" },
};

export default function SecurityPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/security/" />
      <p className="eyebrow">Security</p>
      <h1>Security policy</h1>
      <p>
        If you believe you have found a security issue in ReplayHook, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Please include enough detail to
        reproduce the issue and avoid sending live secrets or production customer data unless we
        ask for a redacted sample.
      </p>
      <h2>Scope for this phase</h2>
      <ul>
        <li>The public site, synthetic demo, and event inspector in this repository</li>
        <li>First-party analytics that record page and funnel events without secrets or identifiers</li>
      </ul>
      <p>
        This phase does not ingest production webhooks and does not store raw webhook payloads.
        The machine-readable policy is published at <span className="mono">/.well-known/security.txt</span>.
      </p>
      <h2>What to expect</h2>
      <p>
        We will acknowledge reports sent to the contact address above and follow up as we
        investigate. There is no paid bug bounty announced at this time.
      </p>
    </div>
  );
}
