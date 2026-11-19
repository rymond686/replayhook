import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { PilotCta } from "@/app/components/PilotCta";
import { CONTACT_EMAIL, PRICE_RANGE_USD, REFUND_WINDOW } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "ReplayHook paid pilots are priced in the $19–$99 USD range. Refundable within 48 hours of purchase.",
  alternates: { canonical: "/en/pricing/" },
};

export default function PricingPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/pricing/" />
      <AnalyticsBeacon event="pricing_view" path="/en/pricing/" />
      <p className="eyebrow">Pricing</p>
      <h1>Paid pilot pricing</h1>
      <p className="lede">
        A ReplayHook paid pilot is priced in the {PRICE_RANGE_USD} range (USD). The exact amount
        depends on the agreed sample and review scope. This is a price range, not a list of
        separate pre-defined plans.
      </p>
      <div className="panel">
        <h2>What the paid pilot includes</h2>
        <ul>
          <li>A read-only reconciliation of agreed Stripe test data or an authorized redacted export</li>
          <li>A report with matched, missing business processing, and needs-review results, plus evidence</li>
          <li>A review of the findings with you</li>
        </ul>
        <p>
          Refunds are available within {REFUND_WINDOW} of purchase. See the{" "}
          <a href="/en/refund/">Refund Policy</a>.
        </p>
      </div>
      <p>
        The public demo and inspector remain free. Questions:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <PilotCta />
    </div>
  );
}
