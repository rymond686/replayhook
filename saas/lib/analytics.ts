export const ANALYTICS_EVENTS = [
  "page_view",
  "demo_completed",
  "inspector_completed",
  "pricing_view",
  "pilot_apply_click",
  "pilot_apply_submit",
  "workspace_activated",
  "first_payment",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsEvent = {
  event: AnalyticsEventName;
  path: string;
  source: string;
};

export const ALLOWED_ANALYTICS_ORIGIN = "https://rymond686.github.io";
export const MAX_ANALYTICS_BODY_BYTES = 2048;
export const MAX_ANALYTICS_FIELD_LENGTH = 200;

export const ANALYTICS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ANALYTICS_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

const BLOCKED_KEY_PATTERN =
  /(secret|password|token|authorization|api[_-]?key|webhook|payload|raw|email|phone|name|customer|card)/i;

const SECRET_VALUE_PATTERN = /sk_live|sk_test|whsec_|rk_live|Bearer\s/i;
const PATH_PATTERN = /^\/[A-Za-z0-9._/-]*$/;
const SOURCE_PATTERN = /^[A-Za-z0-9._:+/-]+$/;

export function isAllowedEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

function safeSourceToken(value: string, fallback = "unknown"): string {
  const cleaned = value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return cleaned || fallback;
}

/**
 * Resolve a traffic source. Always returns a value, including when the
 * source is unknown. UTM parameters take precedence over the referrer.
 */
export function resolveSource(input: {
  searchParams?: URLSearchParams | Record<string, string | undefined> | null;
  referrer?: string | null;
}): string {
  const params =
    input.searchParams instanceof URLSearchParams
      ? input.searchParams
      : new URLSearchParams(
          Object.entries(input.searchParams ?? {}).flatMap(([k, v]) =>
            v ? [[k, v]] : [],
          ),
        );

  const utmSource = params.get("utm_source")?.trim();
  const utmMedium = params.get("utm_medium")?.trim();
  const utmCampaign = params.get("utm_campaign")?.trim();
  if (utmSource || utmMedium || utmCampaign) {
    return [
      "utm",
      safeSourceToken(utmSource || "unknown"),
      safeSourceToken(utmMedium || "-", "-"),
      safeSourceToken(utmCampaign || "-", "-"),
    ].join(":");
  }

  const referrer = input.referrer?.trim();
  if (referrer) {
    try {
      const host = safeSourceToken(new URL(referrer).host, "unknown");
      return `referrer:${host}`;
    } catch {
      return "referrer:unknown";
    }
  }

  return "unknown";
}

export function looksLikeSensitiveKey(key: string): boolean {
  return BLOCKED_KEY_PATTERN.test(key);
}

export function sanitizeAnalyticsEvent(input: unknown): AnalyticsEvent | { error: string } {
  if (!input || typeof input !== "object") {
    return { error: "Event must be an object." };
  }

  const record = input as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (looksLikeSensitiveKey(key)) {
      return { error: "Event contains a disallowed field." };
    }
  }

  const allowedKeys = new Set(["event", "path", "source"]);
  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      return { error: "Event contains a disallowed field." };
    }
  }

  const event = record.event;
  if (typeof event !== "string" || !isAllowedEventName(event)) {
    return { error: "Unknown or missing event name." };
  }

  if (typeof record.path !== "string") {
    return { error: "Path must be a site-relative path." };
  }
  const path = record.path.trim().slice(0, MAX_ANALYTICS_FIELD_LENGTH);
  if (
    !path.startsWith("/") ||
    path.includes("?") ||
    path.includes("#") ||
    path.includes("@") ||
    path.includes("//") ||
    !PATH_PATTERN.test(path)
  ) {
    return { error: "Path must be a site-relative path." };
  }

  const sourceRaw = typeof record.source === "string" ? record.source.trim() : "";
  const source = sourceRaw ? sourceRaw.slice(0, MAX_ANALYTICS_FIELD_LENGTH) : "unknown";
  if (!SOURCE_PATTERN.test(source) || source.includes("?") || source.includes("#") || source.includes("@")) {
    return { error: "Source is not allowed." };
  }

  for (const value of [path, source]) {
    if (SECRET_VALUE_PATTERN.test(value)) {
      return { error: "Event value looks like a secret." };
    }
  }

  return { event, path, source };
}

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function parseAnalyticsRequestBody(
  raw: string,
): AnalyticsEvent | { error: string; status: number } {
  if (byteLength(raw) > MAX_ANALYTICS_BODY_BYTES) {
    return { error: "Request is too large.", status: 413 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON.", status: 400 };
  }

  const sanitized = sanitizeAnalyticsEvent(parsed);
  if ("error" in sanitized) {
    return { error: sanitized.error, status: 400 };
  }
  return sanitized;
}

export function inspectAnalyticsHttpRequest(input: {
  method: string;
  origin?: string | null;
  bodyText?: string;
}):
  | { kind: "preflight" }
  | { kind: "accepted"; event: AnalyticsEvent }
  | { kind: "reject"; status: number; error: string } {
  const origin = input.origin ?? null;
  if (origin && origin !== ALLOWED_ANALYTICS_ORIGIN) {
    return { kind: "reject", status: 403, error: "Origin is not allowed." };
  }
  if (input.method === "OPTIONS") {
    return { kind: "preflight" };
  }
  if (input.method !== "POST") {
    return { kind: "reject", status: 405, error: "Method not allowed." };
  }
  const parsed = parseAnalyticsRequestBody(input.bodyText ?? "");
  if ("error" in parsed) {
    return { kind: "reject", status: parsed.status, error: parsed.error };
  }
  return { kind: "accepted", event: parsed };
}

export type AnalyticsSubmitResult =
  | { ok: true; status: number }
  | { ok: false; status: number | null; error: string };

/**
 * POST a sanitized event to the collector. Local session storage is not
 * treated as success; only a 2xx `response.ok` counts as collected.
 */
export async function submitAnalyticsEvent(
  event: AnalyticsEvent,
  options: {
    endpoint: string | null;
    fetchImpl?: typeof fetch;
    headers?: Record<string, string>;
  },
): Promise<AnalyticsSubmitResult> {
  if (!options.endpoint) {
    return { ok: false, status: null, error: "Analytics collector is not configured." };
  }

  const sanitized = sanitizeAnalyticsEvent(event);
  if ("error" in sanitized) {
    return { ok: false, status: 400, error: sanitized.error };
  }

  try {
    const fetchImpl = options.fetchImpl ?? fetch;
    const response = await fetchImpl(options.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      body: JSON.stringify(sanitized),
      keepalive: true,
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: "Collector rejected the event.",
      };
    }
    return { ok: true, status: response.status };
  } catch {
    return { ok: false, status: null, error: "Network error contacting the collector." };
  }
}

export function getAnalyticsCollectorUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT?.trim();
  return url || null;
}

export function getAnalyticsPublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return key || null;
}
