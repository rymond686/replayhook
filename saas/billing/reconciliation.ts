import {
  DEMO_WORKSPACE_ID,
  type AppOrderRecord,
  type ReconciliationReport,
  type ReconciliationResult,
  type StripePaymentRecord,
  type WorkspaceDataset,
} from "./types";

const PAID_ORDER_STATUSES = new Set(["paid", "fulfilled"]);

function normalizeId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function findOrders(
  payment: StripePaymentRecord,
  orders: AppOrderRecord[],
): { key: string; order: AppOrderRecord }[] {
  const paymentIntentId = normalizeId(payment.paymentIntentId);
  const chargeId = normalizeId(payment.chargeId);
  const hits: { key: string; order: AppOrderRecord }[] = [];

  for (const order of orders) {
    const orderPi = normalizeId(order.paymentIntentId);
    const orderCharge = normalizeId(order.chargeId);
    if (paymentIntentId && orderPi && paymentIntentId === orderPi) {
      hits.push({ key: "paymentIntentId", order });
      continue;
    }
    if (chargeId && orderCharge && chargeId === orderCharge) {
      hits.push({ key: "chargeId", order });
    }
  }
  return hits;
}

function uniqueOrders(hits: { key: string; order: AppOrderRecord }[]): AppOrderRecord[] {
  const seen = new Set<string>();
  const unique: AppOrderRecord[] = [];
  for (const hit of hits) {
    if (!seen.has(hit.order.orderId)) {
      seen.add(hit.order.orderId);
      unique.push(hit.order);
    }
  }
  return unique;
}

function amountsConflict(payment: StripePaymentRecord, order: AppOrderRecord): boolean {
  if (order.amount === undefined) return false;
  if (payment.amount !== order.amount) return true;
  if (order.currency && order.currency.toLowerCase() !== payment.currency.toLowerCase()) {
    return true;
  }
  return false;
}

/**
 * Read-only reconciliation: compare succeeded Stripe payments with
 * application orders. Never mutates the input collections or record status.
 */
export function reconcileDataset(dataset: WorkspaceDataset, now = new Date()): ReconciliationReport {
  const payments = dataset.payments.map((payment) => ({ ...payment }));
  const orders = dataset.orders.map((order) => ({ ...order }));
  const results: ReconciliationResult[] = [];

  for (const payment of payments) {
    if (payment.status !== "succeeded") {
      continue;
    }

    const paymentIntentId = normalizeId(payment.paymentIntentId);
    const chargeId = normalizeId(payment.chargeId);

    if (!paymentIntentId && !chargeId) {
      results.push({
        type: "needs_customer_review",
        evidence: {
          matchKeys: [],
          stripeRecordId: payment.id,
          notes: [
            "The Stripe payment is marked succeeded but has no PaymentIntent or Charge identifier to match against application orders.",
          ],
        },
      });
      continue;
    }

    const hits = findOrders(payment, orders);
    const matchedOrders = uniqueOrders(hits);
    const matchKeys = [...new Set(hits.map((hit) => hit.key))];

    if (matchedOrders.length === 0) {
      results.push({
        type: "missing_business_record",
        paymentIntentId,
        chargeId,
        evidence: {
          matchKeys,
          stripeRecordId: payment.id,
          notes: [
            "Stripe confirmed this payment, but no application order was found for the agreed identifiers.",
            paymentIntentId ? `Looked up PaymentIntent ${paymentIntentId}.` : "No PaymentIntent identifier was available.",
            chargeId ? `Looked up Charge ${chargeId}.` : "No Charge identifier was available.",
          ],
        },
      });
      continue;
    }

    if (matchedOrders.length > 1) {
      results.push({
        type: "needs_customer_review",
        paymentIntentId,
        chargeId,
        evidence: {
          matchKeys,
          stripeRecordId: payment.id,
          orderId: matchedOrders.map((order) => order.orderId).join(", "),
          notes: [
            "More than one application order shares the same payment identifier. A customer review is required before treating any row as authoritative.",
          ],
        },
      });
      continue;
    }

    const order = matchedOrders[0];
    if (amountsConflict(payment, order)) {
      results.push({
        type: "needs_customer_review",
        paymentIntentId,
        chargeId,
        evidence: {
          matchKeys,
          stripeRecordId: payment.id,
          orderId: order.orderId,
          notes: [
            `Identifiers match, but the amounts or currencies differ (Stripe ${payment.amount} ${payment.currency} vs order ${order.amount} ${order.currency ?? "unknown"}).`,
          ],
        },
      });
      continue;
    }

    if (PAID_ORDER_STATUSES.has(order.status)) {
      results.push({
        type: "matched",
        paymentIntentId,
        chargeId,
        evidence: {
          matchKeys,
          stripeRecordId: payment.id,
          orderId: order.orderId,
          notes: [
            `Stripe payment ${payment.id} is succeeded and application order ${order.orderId} is ${order.status}.`,
          ],
        },
      });
      continue;
    }

    results.push({
      type: "missing_business_record",
      paymentIntentId,
      chargeId,
      evidence: {
        matchKeys,
        stripeRecordId: payment.id,
        orderId: order.orderId,
        notes: [
          `Stripe confirmed payment ${payment.id}, but application order ${order.orderId} is still ${order.status}.`,
        ],
      },
    });
  }

  const completedAt = now.toISOString();
  return {
    workspaceId: dataset.workspaceId,
    source: dataset.source,
    startedAt: completedAt,
    completedAt,
    results,
  };
}

export function assertDemoIsolation(dataset: WorkspaceDataset): void {
  if (dataset.source === "synthetic_demo" && dataset.workspaceId !== DEMO_WORKSPACE_ID) {
    throw new Error("Synthetic demo data must stay in the isolated demo workspace.");
  }
  if (dataset.source !== "synthetic_demo" && dataset.workspaceId === DEMO_WORKSPACE_ID) {
    throw new Error("Customer or test-export data cannot use the synthetic demo workspace.");
  }
}

export function reconcileIsolated(dataset: WorkspaceDataset, now = new Date()): ReconciliationReport {
  assertDemoIsolation(dataset);
  return reconcileDataset(dataset, now);
}

/** Explicitly documents that this diagnostic never writes payment or order status. */
export function isReadOnlyDiagnostic(): true {
  return true;
}
