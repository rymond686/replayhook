import { describe, expect, it } from "vitest";
import {
  isReadOnlyDiagnostic,
  reconcileDataset,
} from "../billing/reconciliation";
import { createSyntheticDemoDataset } from "../billing/synthetic-data";
import { defaultEntitlement } from "../billing/entitlements";

describe("payment and order status are not mutated", () => {
  it("leaves input payment and order records unchanged", () => {
    const dataset = createSyntheticDemoDataset();
    const paymentsSnapshot = structuredClone(dataset.payments);
    const ordersSnapshot = structuredClone(dataset.orders);

    const report = reconcileDataset(dataset);

    expect(isReadOnlyDiagnostic()).toBe(true);
    expect(dataset.payments).toEqual(paymentsSnapshot);
    expect(dataset.orders).toEqual(ordersSnapshot);
    expect(report.results.length).toBeGreaterThan(0);
    for (const payment of dataset.payments) {
      const original = paymentsSnapshot.find((item) => item.id === payment.id);
      expect(payment.status).toBe(original?.status);
    }
    for (const order of dataset.orders) {
      const original = ordersSnapshot.find((item) => item.orderId === order.orderId);
      expect(order.status).toBe(original?.status);
    }
  });

  it("does not provision billing entitlements while reconciling", () => {
    const dataset = createSyntheticDemoDataset();
    const entitlement = defaultEntitlement(dataset.workspaceId);
    reconcileDataset(dataset);
    expect(entitlement.status).toBe("none");
  });
});
