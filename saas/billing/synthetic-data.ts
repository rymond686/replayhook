import { DEMO_WORKSPACE_ID, type WorkspaceDataset } from "./types";

/**
 * In-repo synthetic sample used by the no-login demo and tests.
 * Labeled as sample data only. Isolated from any customer workspace.
 */
export function createSyntheticDemoDataset(): WorkspaceDataset {
  return {
    workspaceId: DEMO_WORKSPACE_ID,
    source: "synthetic_demo",
    payments: [
      {
        id: "evt_demo_matched_001",
        paymentIntentId: "pi_demo_matched_001",
        chargeId: "ch_demo_matched_001",
        amount: 4900,
        currency: "usd",
        status: "succeeded",
        createdAt: "2026-11-01T10:00:00.000Z",
      },
      {
        id: "evt_demo_missing_002",
        paymentIntentId: "pi_demo_missing_002",
        chargeId: "ch_demo_missing_002",
        amount: 1900,
        currency: "usd",
        status: "succeeded",
        createdAt: "2026-11-01T10:05:00.000Z",
      },
      {
        id: "evt_demo_pending_003",
        paymentIntentId: "pi_demo_pending_003",
        chargeId: "ch_demo_pending_003",
        amount: 9900,
        currency: "usd",
        status: "succeeded",
        createdAt: "2026-11-01T10:10:00.000Z",
      },
      {
        id: "evt_demo_review_004",
        paymentIntentId: "pi_demo_review_004",
        chargeId: "ch_demo_review_004",
        amount: 2500,
        currency: "usd",
        status: "succeeded",
        createdAt: "2026-11-01T10:15:00.000Z",
      },
      {
        id: "evt_demo_ambiguous_005",
        paymentIntentId: "pi_demo_ambiguous_005",
        chargeId: "ch_demo_ambiguous_005",
        amount: 1200,
        currency: "usd",
        status: "succeeded",
        createdAt: "2026-11-01T10:20:00.000Z",
      },
    ],
    orders: [
      {
        orderId: "ord_demo_1001",
        paymentIntentId: "pi_demo_matched_001",
        chargeId: "ch_demo_matched_001",
        status: "paid",
        amount: 4900,
        currency: "usd",
      },
      {
        orderId: "ord_demo_1003",
        paymentIntentId: "pi_demo_pending_003",
        chargeId: "ch_demo_pending_003",
        status: "pending",
        amount: 9900,
        currency: "usd",
      },
      {
        orderId: "ord_demo_1004",
        paymentIntentId: "pi_demo_review_004",
        chargeId: "ch_demo_review_004",
        status: "paid",
        amount: 9999,
        currency: "usd",
      },
      {
        orderId: "ord_demo_1005a",
        paymentIntentId: "pi_demo_ambiguous_005",
        status: "paid",
        amount: 1200,
        currency: "usd",
      },
      {
        orderId: "ord_demo_1005b",
        paymentIntentId: "pi_demo_ambiguous_005",
        status: "pending",
        amount: 1200,
        currency: "usd",
      },
    ],
  };
}

export const SAMPLE_STRIPE_EVENTS = [
  {
    id: "evt_demo_inspector_ok",
    type: "payment_intent.succeeded",
    label: "Complete PaymentIntent (sample)",
    event: {
      id: "evt_demo_inspector_ok",
      object: "event",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_demo_matched_001",
          object: "payment_intent",
          amount: 4900,
          currency: "usd",
          status: "succeeded",
          latest_charge: "ch_demo_matched_001",
          metadata: { order_id: "ord_demo_1001" },
        },
      },
    },
  },
  {
    id: "evt_demo_inspector_missing",
    type: "payment_intent.succeeded",
    label: "Succeeded payment with missing identifiers (sample)",
    event: {
      id: "evt_demo_inspector_missing",
      object: "event",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "",
          object: "payment_intent",
          amount: 1900,
          currency: "usd",
          status: "succeeded",
          latest_charge: null,
          metadata: {},
        },
      },
    },
  },
] as const;
