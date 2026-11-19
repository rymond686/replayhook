import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { PilotCta } from "@/app/components/PilotCta";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Troubleshoot a failed Stripe webhook delivery",
  description:
    "Separate Stripe event creation, endpoint delivery, and downstream order processing when a webhook appears to have failed.",
  alternates: { canonical: "/en/guides/stripe-webhook-delivery-failed/" },
};

export default function GuidePage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/guides/stripe-webhook-delivery-failed/" />
      <p className="eyebrow">Guide</p>
      <h1>Troubleshoot a failed Stripe webhook delivery</h1>
      <p className="lede">
        A missing order update is not always a failed webhook delivery. This guide separates
        Stripe event creation, delivery to your endpoint, and downstream business processing, then
        shows how a read-only reconciliation report can help with the last step.
      </p>

      <h2>1. Confirm the event was created</h2>
      <p>
        In the Stripe Dashboard or a test export, confirm that the PaymentIntent or Charge exists
        and that its status is the one you expect, usually <span className="mono">succeeded</span>.
        If Stripe never created a succeeded payment, the application cannot have a corresponding
        paid order. Official reference:{" "}
        <a href="https://docs.stripe.com/webhooks">Stripe webhook documentation</a>.
      </p>

      <h2>2. Check delivery to your endpoint</h2>
      <p>
        Delivery is Stripe’s attempt to send the event to your webhook endpoint. According to{" "}
        <a href="https://docs.stripe.com/webhooks#event-delivery-behaviors">
          Stripe event delivery behavior
        </a>
        , Stripe automatically retries failed deliveries for up to three days, and the Dashboard
        manual resend window is 15 days (the Stripe CLI resend window is 30 days). Confirm these
        windows against the current Stripe documentation before you rely on them. Evidence at this
        step comes from Stripe delivery logs, not from your order database.
      </p>

      <h2>3. Check downstream business processing</h2>
      <p>
        Even when Stripe has delivered the event, your application may still have failed to create
        or update the order. ReplayHook’s first phase focuses on this comparison: a confirmed
        Stripe payment versus the application order status. It does not take over the production
        webhook endpoint or resend events for you.
      </p>

      <h2>A synthetic example</h2>
      <p>
        In the public demo, payment <span className="mono">pi_demo_pending_003</span> is succeeded
        in Stripe, but application order <span className="mono">ord_demo_1003</span> is still
        pending. The report labels this as a missing business processing record and keeps the
        identifiers and notes as evidence. Payment{" "}
        <span className="mono">pi_demo_matched_001</span> is succeeded and the matching order is
        paid, so it is labeled matched. Ambiguous or conflicting rows are labeled needs customer
        review.
      </p>
      <p>
        Run the <Link href="/en/#demo">sample reconciliation</Link> or the{" "}
        <Link href="/en/tools/stripe-event-inspector/">event inspector</Link> to see these fields
        without logging in. If you need the same check on authorized data, see{" "}
        <Link href="/en/pricing/">pricing</Link> and apply for a paid pilot.
      </p>
      <PilotCta />
    </div>
  );
}
