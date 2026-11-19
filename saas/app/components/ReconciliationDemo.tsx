"use client";

import Link from "next/link";

import { useMemo, useState } from "react";
import { reconcileIsolated } from "@/billing/reconciliation";
import { createSyntheticDemoDataset } from "@/billing/synthetic-data";
import type { ReconciliationReport, ResultType } from "@/billing/types";
import { track } from "./Analytics";

const STEPS = [
  "Load synthetic Stripe payments",
  "Load synthetic application orders",
  "Match agreed identifiers",
  "Classify results and attach evidence",
];

const LABELS: Record<ResultType, string> = {
  matched: "Matched",
  missing_business_record: "Missing business processing record",
  needs_customer_review: "Needs customer review",
};

export function ReconciliationDemo() {
  const dataset = useMemo(() => createSyntheticDemoDataset(), []);
  const [step, setStep] = useState(-1);
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [running, setRunning] = useState(false);

  async function runDemo() {
    if (running) return;
    setRunning(true);
    setReport(null);
    for (let index = 0; index < STEPS.length; index += 1) {
      setStep(index);
      await new Promise((resolve) => window.setTimeout(resolve, 450));
    }
    const next = reconcileIsolated(dataset);
    setReport(next);
    setRunning(false);
    void track("demo_completed", "/en/");
  }

  return (
    <section className="section" id="demo">
      <h2>Try a 30-second synthetic reconciliation</h2>
      <p className="muted">
        This demo uses in-repo sample payments and orders only. It runs in your browser, does not
        require an account, and does not collect API keys or production webhook payloads. Demo
        completion is recorded separately from any future workspace activation.
      </p>
      <div className="panel">
        <ol className="demo-steps">
          {STEPS.map((label, index) => {
            const className = report || (running && index < step) ? "done" : index === step ? "active" : "";
            return (
              <li key={label} className={className}>
                {label}
              </li>
            );
          })}
        </ol>
        <button className="button" type="button" onClick={() => void runDemo()} disabled={running}>
          {running ? "Running sample reconciliation…" : "Run sample reconciliation"}
        </button>
        {report ? (
          <div style={{ marginTop: "1.25rem" }}>
            <p className="mono muted">
              Workspace {report.workspaceId} · source {report.source} · {report.results.length} results
            </p>
            <table>
              <thead>
                <tr>
                  <th>Result</th>
                  <th>Identifiers</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {report.results.map((result, index) => (
                  <tr key={`${result.paymentIntentId ?? result.evidence.stripeRecordId}-${index}`}>
                    <td>
                      <span className={`badge ${result.type}`}>{LABELS[result.type]}</span>
                    </td>
                    <td className="mono">
                      {result.paymentIntentId ?? result.chargeId ?? result.evidence.stripeRecordId}
                    </td>
                    <td>
                      {result.evidence.matchKeys.length ? (
                        <div className="mono">Keys: {result.evidence.matchKeys.join(", ")}</div>
                      ) : null}
                      {result.evidence.orderId ? (
                        <div className="mono">Order: {result.evidence.orderId}</div>
                      ) : null}
                      <ul className="evidence">
                        {result.evidence.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="actions">
              <Link className="button" href="/en/pricing/#apply">
                Apply for a paid pilot
              </Link>
              <Link className="button secondary" href="/en/pricing/">
                See pricing
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
