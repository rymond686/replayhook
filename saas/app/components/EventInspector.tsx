"use client";

import { useMemo, useState } from "react";
import { SAMPLE_STRIPE_EVENTS } from "@/billing/synthetic-data";
import { track } from "./Analytics";

type Finding = {
  field: string;
  present: boolean;
  value: string;
  note: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function inspectEvent(raw: unknown): { findings: Finding[]; error?: string } {
  const event = asRecord(raw);
  if (!event) return { findings: [], error: "The input is not a JSON object." };
  const data = asRecord(event.data);
  const object = asRecord(data?.object);
  if (!object) {
    return {
      findings: [
        {
          field: "data.object",
          present: false,
          value: "",
          note: "This sample is missing the Stripe event object, so identifiers cannot be read.",
        },
      ],
    };
  }

  const paymentIntentId =
    (typeof object.id === "string" && object.object === "payment_intent" && object.id) ||
    (typeof object.payment_intent === "string" && object.payment_intent) ||
    "";
  const chargeId =
    (typeof object.latest_charge === "string" && object.latest_charge) ||
    (typeof object.id === "string" && object.object === "charge" && object.id) ||
    "";
  const status = typeof object.status === "string" ? object.status : "";
  const metadata = asRecord(object.metadata);
  const orderId = typeof metadata?.order_id === "string" ? metadata.order_id : "";

  const findings: Finding[] = [
    {
      field: "type",
      present: typeof event.type === "string",
      value: typeof event.type === "string" ? event.type : "",
      note: "Event type helps confirm this is a payment confirmation rather than a delivery receipt.",
    },
    {
      field: "data.object.id (PaymentIntent)",
      present: Boolean(paymentIntentId),
      value: paymentIntentId || "missing",
      note: paymentIntentId
        ? "This identifier can be used as an agreed match key."
        : "Without a PaymentIntent ID, the payment may need customer review.",
    },
    {
      field: "latest_charge / Charge ID",
      present: Boolean(chargeId),
      value: chargeId || "missing",
      note: chargeId
        ? "A Charge ID can be used as a secondary match key."
        : "No Charge ID is available in this sample.",
    },
    {
      field: "status",
      present: Boolean(status),
      value: status || "missing",
      note: status === "succeeded"
        ? "Stripe marks this payment as succeeded."
        : "This event is not a succeeded payment confirmation.",
    },
    {
      field: "metadata.order_id",
      present: Boolean(orderId),
      value: orderId || "missing",
      note: orderId
        ? "Optional application metadata is present. ReplayHook still treats PaymentIntent or Charge IDs as the primary agreed identifiers."
        : "No order metadata is present. Matching can still use PaymentIntent or Charge IDs.",
    },
  ];
  return { findings };
}

export function EventInspector() {
  const [sampleId, setSampleId] = useState<string>(SAMPLE_STRIPE_EVENTS[0].id);
  const [draft, setDraft] = useState(
    JSON.stringify(SAMPLE_STRIPE_EVENTS[0].event, null, 2),
  );
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => SAMPLE_STRIPE_EVENTS.find((item) => item.id === sampleId) ?? SAMPLE_STRIPE_EVENTS[0],
    [sampleId],
  );

  function loadSample(id: string) {
    const sample = SAMPLE_STRIPE_EVENTS.find((item) => item.id === id) ?? SAMPLE_STRIPE_EVENTS[0];
    setSampleId(sample.id);
    setDraft(JSON.stringify(sample.event, null, 2));
    setFindings(null);
    setError(null);
  }

  function inspect() {
    try {
      const parsed = JSON.parse(draft) as unknown;
      const result = inspectEvent(parsed);
      setError(result.error ?? null);
      setFindings(result.findings);
      if (!result.error) {
        void track("inspector_completed", "/en/tools/stripe-event-inspector/");
      }
    } catch {
      setFindings(null);
      setError("The input is not valid JSON. Nothing was sent to the server.");
    }
  }

  return (
    <div className="panel">
      <p className="muted">
        Inspection happens in your browser. Sample events never leave this page, and pasted JSON is
        not uploaded or stored. Do not paste live secrets.
      </p>
      <div className="form">
        <label>
          Sample event
          <select
            value={selected.id}
            onChange={(event) => loadSample(event.target.value)}
          >
            {SAMPLE_STRIPE_EVENTS.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Event JSON
          <textarea className="mono" value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button className="button" type="button" onClick={inspect}>
          Inspect event fields
        </button>
      </div>
      {error ? <p className="notice">{error}</p> : null}
      {findings ? (
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Present</th>
              <th>Value</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding) => (
              <tr key={finding.field}>
                <td className="mono">{finding.field}</td>
                <td>{finding.present ? "Yes" : "No"}</td>
                <td className="mono">{finding.value}</td>
                <td>{finding.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
