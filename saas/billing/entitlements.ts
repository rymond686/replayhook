/**
 * Billing and entitlement map for a later paid-pilot phase.
 * This phase does not charge, refund, or provision live access.
 */

export type EntitlementStatus = "none" | "pilot_pending" | "pilot_active" | "refunded";

export type Entitlement = {
  workspaceId: string;
  product: "paid_pilot";
  status: EntitlementStatus;
  priceRangeUsd: "19-99";
};

export function defaultEntitlement(workspaceId: string): Entitlement {
  return {
    workspaceId,
    product: "paid_pilot",
    status: "none",
    priceRangeUsd: "19-99",
  };
}

export const PAYMENT_EVENT_MAP = {
  // Recorded for a later phase. Not ingested in phase 1.
  purchaseConfirmed: ["transaction.completed", "invoice.paid"],
  purchaseFailed: ["invoice.payment_failed"],
  subscriptionUpdated: ["customer.subscription.updated"],
} as const;
