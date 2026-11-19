import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { CONTACT_EMAIL, PAID_PLAN_PRICE_USD, PRODUCT_NAME, REFUND_WINDOW } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for the ReplayHook paid-pilot diagnostic.",
  alternates: { canonical: "/en/terms/" },
};

export default function TermsPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/terms/" />
      <h1>Terms of Service</h1>
      <p className="muted">Last updated: 19 November 2026 (Asia/Shanghai).</p>
      <p>
        These terms apply to the public {PRODUCT_NAME} website and to a paid pilot, if one is
        agreed. {PRODUCT_NAME} is offered by an independent developer. The legal entity or operator
        name has not been confirmed yet and is not stated here. Until that name is confirmed,
        contact the operator at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <h2>The service</h2>
      <p>
        {PRODUCT_NAME} is a read-only payment and order reconciliation diagnostic for small SaaS
        teams that use Stripe. A paid pilot compares agreed Stripe test data or a
        customer-authorized redacted export with application order records and returns a report
        with evidence. The public demo and inspector use synthetic sample data only.
      </p>
      <p>
        The service does not take over production webhooks, charge or refund your customers, or
        change payment or order status.
      </p>
      <h2>Pilots, pricing, and payment</h2>
      <p>
        The planned paid plan is a monthly subscription at {PAID_PLAN_PRICE_USD}.
        The Free plan costs US$0. Callback counting and limit reset periods remain to be confirmed.
        These plans are not yet available in this static preview. Refunds are described
        in the <Link href="/en/refund/">Refund Policy</Link> and are available within {REFUND_WINDOW} of
        purchase.
      </p>
      <h2>Your responsibilities</h2>
      <p>
        You must have the right to provide any data you send, including authorization to share a
        redacted export. Do not send live secrets or unredacted production webhook payloads. You
        remain responsible for your Stripe account, your application, and any action you take
        after reading a report.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may not use the service to attempt unauthorized access, to interfere with the site, or
        to submit unlawful content. Access to later workspace features, when offered, may be
        suspended if these terms are violated.
      </p>
      <h2>Support</h2>
      <p>
        Contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Support is provided on a
        reasonable-efforts basis for the public site and agreed pilots. No specific uptime
        commitment is offered in this phase.
      </p>
      <h2>Disclaimer and limitation</h2>
      <p>
        Reports are diagnostic aids based on the data you provide. They are not a guarantee that
        every mismatch will be found, and they are not legal, accounting, or payment-processing
        advice. To the extent permitted by law, the operator is not liable for indirect or
        consequential losses, and total liability for a paid pilot is limited to the amount you
        paid for that pilot. These terms do not exclude rights that cannot be excluded under
        applicable law.
      </p>
      <h2>Changes</h2>
      <p>
        If these terms change, the updated date above will change and the new terms will apply to
        later use of the site and to later pilots.
      </p>
    </div>
  );
}
