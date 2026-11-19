import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { EventInspector } from "@/app/components/EventInspector";
import { PilotCta } from "@/app/components/PilotCta";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stripe event inspector",
  description:
    "Inspect the fields and identifiers on a sample Stripe payment event in your browser, without logging in.",
  alternates: { canonical: "/en/tools/stripe-event-inspector/" },
};

export default function InspectorPage() {
  return (
    <div className="shell page">
      <AnalyticsBeacon path="/en/tools/stripe-event-inspector/" />
      <p className="eyebrow">Free tool</p>
      <h1>Stripe event inspector</h1>
      <p className="lede">
        Check whether a Stripe event includes the identifiers ReplayHook uses to compare a
        confirmed payment with an application order. Use the built-in samples to complete an
        inspection in your browser.
      </p>
      <EventInspector />
      <section className="section prose">
        <h2>What to look for</h2>
        <p>
          A succeeded PaymentIntent or Charge is useful for reconciliation only if an agreed
          identifier is present. After you inspect a sample, see the{" "}
          <Link href="/en/guides/stripe-webhook-delivery-failed/">delivery troubleshooting guide</Link>{" "}
          to distinguish Stripe delivery from downstream order processing, or start a{" "}
          <Link href="/en/pricing/">paid pilot</Link> if you need a report against authorized data.
        </p>
      </section>
      <PilotCta heading="Need this check on your authorized data?" />
    </div>
  );
}
