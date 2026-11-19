import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { PilotCta } from "@/app/components/PilotCta";
import { ReconciliationDemo } from "@/app/components/ReconciliationDemo";
import { CONTACT_EMAIL, JSON_LD, PRICE_RANGE_USD, PRODUCT_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} — read-only Stripe payment and order reconciliation`,
  description:
    "A read-only diagnostic for small SaaS teams that use Stripe. Reconcile confirmed payments with application orders and inspect the match evidence.",
  alternates: { canonical: "/en/" },
};

export default function HomePage() {
  return (
    <div className="shell page">
      <AnalyticsBeacon path="/en/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <section className="hero">
        <p className="eyebrow">Paid-pilot diagnostic</p>
        <h1>{PRODUCT_NAME} checks whether a Stripe payment made it into your orders.</h1>
        <p className="lede">
          ReplayHook is a read-only payment and order reconciliation diagnostic for small SaaS
          teams that use Stripe. It investigates cases such as “Stripe confirmed the payment, but
          the application order is still pending.”
        </p>
        <div className="actions">
          <a className="button" href="#demo">
            Run the sample reconciliation
          </a>
          <a className="button secondary" href="/en/pricing/#apply">
            Apply for a paid pilot
          </a>
        </div>
      </section>

      <section className="section">
        <div className="grid">
          <article className="card">
            <h2>Who it is for</h2>
            <p>
              Small SaaS teams that use Stripe and need a clear, inspectable comparison between
              confirmed payments and application order or entitlement records.
            </p>
          </article>
          <article className="card">
            <h2>When to use it</h2>
            <p>
              A customer appears to have paid, but access or the order is still pending. Stripe
              shows a succeeded payment, and your team needs to know whether the application
              processed it.
            </p>
          </article>
          <article className="card">
            <h2>What you get</h2>
            <p>
              A diagnostic report with three result types, each with match evidence: matched,
              missing business processing record, and needs customer review.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>How you can verify the result</h2>
        <p>
          Run the no-login synthetic demo below and review the evidence for each row. For a paid
          pilot, ReplayHook compares an agreed sample of Stripe test data or a customer-authorized
          redacted export against known differences, then you confirm which findings are useful.
        </p>
      </section>

      <section className="section">
        <h2>Data authorization and limits</h2>
        <p>
          This phase uses Stripe test data or a customer-authorized redacted export, matched on
          agreed identifiers such as PaymentIntent or Charge IDs. Only the fields needed for
          reconciliation are used.
        </p>
        <p>ReplayHook does not:</p>
        <ul>
          <li>Take over production webhooks</li>
          <li>Charge or refund customers</li>
          <li>Automatically change payment or order status</li>
          <li>Aggregate data across unrelated sources</li>
        </ul>
      </section>

      <ReconciliationDemo />

      <section className="section">
        <h2>Free tools and paid pilot</h2>
        <p>
          The homepage demo, the{" "}
          <a href="/en/tools/stripe-event-inspector/">Stripe event inspector</a>, the{" "}
          <a href="/en/integrations/stripe/">Stripe integration overview</a>, and the{" "}
          <a href="/en/guides/stripe-webhook-delivery-failed/">delivery troubleshooting guide</a>{" "}
          are free and do not require an account. When you need a reconciliation against your own
          authorized data, continue to <a href="/en/pricing/">pricing</a> or apply for a paid pilot.
        </p>
        <p>
          Paid pilots are priced in the {PRICE_RANGE_USD} range (USD). Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <PilotCta />
    </div>
  );
}
