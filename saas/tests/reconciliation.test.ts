import { describe, expect, it } from "vitest";
import { reconcileDataset, reconcileIsolated } from "../billing/reconciliation";
import { createSyntheticDemoDataset } from "../billing/synthetic-data";
import { DEMO_WORKSPACE_ID, type WorkspaceDataset } from "../billing/types";

describe("reconciliation result types and evidence", () => {
  it("returns matched, missing business record, and needs-review results from the synthetic sample", () => {
    const report = reconcileIsolated(createSyntheticDemoDataset());
    const types = report.results.map((result) => result.type);

    expect(report.source).toBe("synthetic_demo");
    expect(report.workspaceId).toBe(DEMO_WORKSPACE_ID);
    expect(types).toContain("matched");
    expect(types).toContain("missing_business_record");
    expect(types).toContain("needs_customer_review");

    const matched = report.results.find((result) => result.type === "matched");
    expect(matched?.evidence.orderId).toBe("ord_demo_1001");
    expect(matched?.evidence.matchKeys).toContain("paymentIntentId");
    expect(matched?.evidence.notes.length).toBeGreaterThan(0);

    const missingNoOrder = report.results.find(
      (result) => result.paymentIntentId === "pi_demo_missing_002",
    );
    expect(missingNoOrder?.type).toBe("missing_business_record");
    expect(missingNoOrder?.evidence.notes.join(" ")).toMatch(/no application order/i);

    const missingPending = report.results.find(
      (result) => result.paymentIntentId === "pi_demo_pending_003",
    );
    expect(missingPending?.type).toBe("missing_business_record");
    expect(missingPending?.evidence.orderId).toBe("ord_demo_1003");
    expect(missingPending?.evidence.notes.join(" ")).toMatch(/pending/);

    const amountConflict = report.results.find(
      (result) => result.paymentIntentId === "pi_demo_review_004",
    );
    expect(amountConflict?.type).toBe("needs_customer_review");
    expect(amountConflict?.evidence.notes.join(" ")).toMatch(/amounts or currencies differ/);

    const ambiguous = report.results.find(
      (result) => result.paymentIntentId === "pi_demo_ambiguous_005",
    );
    expect(ambiguous?.type).toBe("needs_customer_review");
    expect(ambiguous?.evidence.notes.join(" ")).toMatch(/more than one application order/i);
  });

  it("flags a succeeded payment that has no match identifiers as needs review", () => {
    const dataset: WorkspaceDataset = {
      workspaceId: DEMO_WORKSPACE_ID,
      source: "synthetic_demo",
      payments: [
        {
          id: "evt_no_ids",
          amount: 1000,
          currency: "usd",
          status: "succeeded",
          createdAt: "2026-11-01T00:00:00.000Z",
        },
      ],
      orders: [],
    };

    const [result] = reconcileDataset(dataset).results;
    expect(result.type).toBe("needs_customer_review");
    expect(result.evidence.matchKeys).toEqual([]);
    expect(result.evidence.stripeRecordId).toBe("evt_no_ids");
  });

  it("ignores Stripe payments that are not succeeded", () => {
    const dataset: WorkspaceDataset = {
      workspaceId: DEMO_WORKSPACE_ID,
      source: "synthetic_demo",
      payments: [
        {
          id: "evt_failed",
          paymentIntentId: "pi_failed",
          amount: 1000,
          currency: "usd",
          status: "failed",
          createdAt: "2026-11-01T00:00:00.000Z",
        },
      ],
      orders: [
        {
          orderId: "ord_failed",
          paymentIntentId: "pi_failed",
          status: "failed",
          amount: 1000,
          currency: "usd",
        },
      ],
    };

    expect(reconcileDataset(dataset).results).toEqual([]);
  });
});
