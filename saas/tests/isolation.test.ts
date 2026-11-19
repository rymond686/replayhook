import { describe, expect, it } from "vitest";
import { assertDemoIsolation, reconcileIsolated } from "../billing/reconciliation";
import { createSyntheticDemoDataset } from "../billing/synthetic-data";
import { DEMO_WORKSPACE_ID, type WorkspaceDataset } from "../billing/types";

describe("tenant and demo isolation", () => {
  it("keeps the synthetic demo in its own workspace and source", () => {
    const demo = createSyntheticDemoDataset();
    expect(demo.workspaceId).toBe(DEMO_WORKSPACE_ID);
    expect(demo.source).toBe("synthetic_demo");
    expect(() => assertDemoIsolation(demo)).not.toThrow();
  });

  it("rejects synthetic data attached to a customer workspace", () => {
    const mixed: WorkspaceDataset = {
      ...createSyntheticDemoDataset(),
      workspaceId: "workspace_customer_acme",
    };
    expect(() => reconcileIsolated(mixed)).toThrow(/isolated demo workspace/i);
  });

  it("rejects customer or authorized-export data in the demo workspace", () => {
    const mixed: WorkspaceDataset = {
      workspaceId: DEMO_WORKSPACE_ID,
      source: "authorized_export",
      payments: [],
      orders: [],
    };
    expect(() => reconcileIsolated(mixed)).toThrow(/cannot use the synthetic demo workspace/i);
  });

  it("does not mix demo records into a separate customer dataset", () => {
    const demo = createSyntheticDemoDataset();
    const customer: WorkspaceDataset = {
      workspaceId: "workspace_customer_acme",
      source: "stripe_test",
      payments: [
        {
          id: "evt_cust_1",
          paymentIntentId: "pi_cust_1",
          amount: 2000,
          currency: "usd",
          status: "succeeded",
          createdAt: "2026-11-02T00:00:00.000Z",
        },
      ],
      orders: [],
    };

    const demoIds = new Set(demo.payments.map((payment) => payment.id));
    const report = reconcileIsolated(customer);
    expect(report.workspaceId).toBe("workspace_customer_acme");
    expect(report.source).toBe("stripe_test");
    expect(report.results).toHaveLength(1);
    expect(demoIds.has(report.results[0]?.evidence.stripeRecordId ?? "")).toBe(false);
  });
});
