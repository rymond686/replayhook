export const RESULT_TYPES = [
  "matched",
  "missing_business_record",
  "needs_customer_review",
] as const;

export type ResultType = (typeof RESULT_TYPES)[number];

export const DATA_SOURCES = ["synthetic_demo", "stripe_test", "authorized_export"] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

export const DEMO_WORKSPACE_ID = "workspace_demo_synthetic";

export type StripePaymentRecord = {
  id: string;
  paymentIntentId?: string;
  chargeId?: string;
  amount: number;
  currency: string;
  status: "succeeded" | "processing" | "failed" | "canceled";
  createdAt: string;
};

export type AppOrderRecord = {
  orderId: string;
  paymentIntentId?: string;
  chargeId?: string;
  status: "pending" | "paid" | "fulfilled" | "canceled" | "failed";
  amount?: number;
  currency?: string;
};

export type WorkspaceDataset = {
  workspaceId: string;
  source: DataSource;
  payments: StripePaymentRecord[];
  orders: AppOrderRecord[];
};

export type MatchEvidence = {
  matchKeys: string[];
  stripeRecordId?: string;
  orderId?: string;
  notes: string[];
};

export type ReconciliationResult = {
  type: ResultType;
  paymentIntentId?: string;
  chargeId?: string;
  evidence: MatchEvidence;
};

export type ReconciliationReport = {
  workspaceId: string;
  source: DataSource;
  startedAt: string;
  completedAt: string;
  results: ReconciliationResult[];
};
