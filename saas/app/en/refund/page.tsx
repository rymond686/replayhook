import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { CONTACT_EMAIL, PAID_PLAN_PRICE_USD, PRODUCT_NAME, REFUND_WINDOW } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "ReplayHook paid pilots are refundable within 48 hours of purchase.",
  alternates: { canonical: "/en/refund/" },
};

export default function RefundPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/refund/" />
      <h1>Refund Policy</h1>
      <p className="muted">Last updated: 19 November 2026 (Asia/Shanghai).</p>
      <p>
        The planned paid {PRODUCT_NAME} subscription costs {PAID_PLAN_PRICE_USD}, billed monthly. You may request
        a refund within {REFUND_WINDOW} of purchase by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address used in the
        purchase or application and including the purchase date and any payment reference you
        have.
      </p>
      <p>
        We will confirm the request and refund the eligible purchase amount through the same
        payment channel when possible. After {REFUND_WINDOW}, refunds are considered only where
        required by applicable consumer law or by the payment provider’s rules. This policy does
        not limit rights that cannot be excluded under applicable law.
      </p>
      <p>
        The public demo, event inspector, and documentation are free and are not purchased, so
        they are not subject to a refund.
      </p>
    </div>
  );
}
