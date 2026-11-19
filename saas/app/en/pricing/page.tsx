import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { PilotCta } from "@/app/components/PilotCta";
import { CONTACT_EMAIL, REFUND_WINDOW } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore planned ReplayHook Free and US$19.90 plans, callback limits, data retention, and audit logs.",
  alternates: { canonical: "/en/pricing/" },
};

export default function PricingPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/pricing/" />
      <AnalyticsBeacon event="pricing_view" path="/en/pricing/" />
      <p className="eyebrow">Pricing</p>
      <h1>Free and paid plans</h1>
      <p className="lede">
        Choose the planned callback data limits and retention that fit your needs.
        These plans describe upcoming capabilities, not features available in the current public preview.
      </p>
      <div className="panel">
        <h2>Free — US$0</h2>
        <ul>
          <li>Callback data retained for 24 hours</li>
          <li>Limit of 10 callbacks per user</li>
        </ul>
      </div>
      <div className="panel">
        <h2>Paid — US$19.90</h2>
        <ul>
          <li>Callback data retained for 30 days</li>
          <li>Auditable log information</li>
          <li>Limit of 30 callbacks per user</li>
        </ul>
        <p>
          The billing period, what counts as a callback, and any limit reset period
          are not yet specified. Confirm these details before purchasing.
        </p>
        <p>
          Refunds are available within {REFUND_WINDOW} of purchase. See the{" "}
          <Link href="/en/refund/">Refund Policy</Link>.
        </p>
      </div>
      <p>
        This static preview does not yet provide customer callback ingestion,
        retention enforcement, or audit-log storage. Apply below to discuss availability;
        this page does not take payments.
      </p>
      <p>
        The public demo and inspector remain free. Questions:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <PilotCta />
    </div>
  );
}
