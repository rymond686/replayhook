import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/app/components/Analytics";
import { CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ReplayHook collects only the minimum information needed to provide the service and public site.",
  alternates: { canonical: "/en/privacy/" },
};

export default function PrivacyPage() {
  return (
    <div className="shell page prose">
      <AnalyticsBeacon path="/en/privacy/" />
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: 19 November 2026 (Asia/Shanghai).</p>
      <p>
        {PRODUCT_NAME} collects only the minimum information needed to provide the public site, to
        understand anonymous use of the funnel, and to respond to a paid-pilot application. The
        operator is an independent developer reachable at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. A legal entity name has not been
        confirmed yet.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Pilot applications.</strong> If you apply, you choose to send a work email and
          an optional description of the reconciliation you need. If you use the mailto form, that
          message stays in your email client until you send it.
        </li>
        <li>
          <strong>First-party analytics.</strong> The site records public page views, demo
          completion (<span className="mono">demo_completed</span>), completed inspector use,
          pricing page views, paid-pilot apply clicks or submissions, and a traffic source (UTM
          parameters or referrer). If the source is not available, the value <span className="mono">unknown</span> is
          stored. These events do not include secrets, raw production webhook payloads, email
          addresses, or other identifiable customer data.
        </li>
        <li>
          <strong>Security and operations logs.</strong> Standard request logs may include IP
          address and user agent for a short period to keep the site working and to investigate
          abuse.
        </li>
      </ul>
      <p>
        The public demo and event inspector run in your browser on synthetic sample data. Pasted
        JSON is not uploaded. Authorized customer data for a paid pilot is used only to produce
        the agreed report and is kept separate from demo data.
      </p>
      <h2>What we do not collect in analytics</h2>
      <p>
        Analytics events are not used to store API keys, webhook signing secrets, production
        webhook request bodies, or records that identify your customers. Demo completion is
        recorded separately from any later workspace activation.
      </p>
      <h2>Use and retention</h2>
      <p>
        Application email is used only to reply about a pilot. Analytics are used to understand
        which public pages and tools lead to a pilot inquiry. We keep application messages and
        analytics only as long as needed for those purposes or as required by law, then delete or
        aggregate them.
      </p>
      <h2>Sharing</h2>
      <p>
        We do not sell this information. It may be processed by infrastructure providers that host
        the site or, when configured, store data in a PostgreSQL database (Supabase). Those
        providers process data on our instructions.
      </p>
      <h2>Requests</h2>
      <p>
        To ask a question, request access, correction, or deletion, or to object to processing
        where applicable law allows, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
