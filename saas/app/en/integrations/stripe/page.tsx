import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { PilotCta } from "@/app/components/PilotCta";

export const metadata: Metadata = {
  title: "Stripe integration",
  description:
    "How ReplayHook uses Stripe test data or a customer-authorized redacted export for read-only payment and order reconciliation.",
  alternates: { canonical: "/en/integrations/stripe/" },
};

export default function StripeIntegrationPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/integrations/stripe/" />
      <p className="eyebrow">Integration</p>
      <h1>Stripe integration</h1>
      <p className="lede">
        ReplayHook’s first phase is a read-only comparison between Stripe payment records and
        application orders. It does not connect to your production webhook endpoint.
      </p>

      <h2>Supported inputs</h2>
      <ul>
        <li>Stripe test-environment payment records, or</li>
        <li>A customer-authorized redacted export of payment and order records</li>
      </ul>
      <p>
        Records are matched on agreed identifiers, typically a PaymentIntent ID or Charge ID. Only
        the fields required for reconciliation are used.
      </p>

      <h2>Permissions and data scope</h2>
      <p>
        The diagnostic is read-only. ReplayHook does not take over production webhooks, initiate
        charges or refunds, or change payment or order status. Sample data used in the public demo
        is isolated from any future customer workspace.
      </p>

      <h2>How a paid pilot works</h2>
      <ol>
        <li>You apply and agree the identifiers and sample scope.</li>
        <li>You provide Stripe test data or an authorized redacted export.</li>
        <li>
          ReplayHook returns a report with matched rows, missing business processing records, and
          items that need your review, each with evidence.
        </li>
        <li>You confirm which findings are useful for investigation.</li>
      </ol>
      <p>
        See a <a href="/en/#demo">synthetic sample report</a> first, or review{" "}
        <a href="/en/pricing/">pricing</a> and apply for a paid pilot.
      </p>
      <PilotCta />
    </div>
  );
}
