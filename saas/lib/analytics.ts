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

const BLOCKED_KEY_PATTERN =
  /(secret|password|token|authorization|api[_-]?key|webhook|payload|raw|email|phone|name|customer|card)/i;

export function isAllowedEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
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
    return ["utm", utmSource || "unknown", utmMedium || "-", utmCampaign || "-"].join(":");
  }

  const referrer = input.referrer?.trim();
  if (referrer) {
    try {
      const host = new URL(referrer).host;
      return host ? `referrer:${host}` : "referrer:unknown";
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

  const event = record.event;
  if (typeof event !== "string" || !isAllowedEventName(event)) {
    return { error: "Unknown or missing event name." };
  }

  const path = typeof record.path === "string" ? record.path.slice(0, 200) : "";
  if (!path.startsWith("/")) {
    return { error: "Path must be a site-relative path." };
  }

  const sourceRaw = typeof record.source === "string" ? record.source.trim() : "";
  const source = sourceRaw ? sourceRaw.slice(0, 200) : "unknown";

  // Reject string values that look like secrets or raw payloads.
  for (const value of [path, source]) {
    if (/sk_live|sk_test|whsec_|rk_live|Bearer\s/i.test(value)) {
      return { error: "Event value looks like a secret." };
    }
  }

  return { event, path, source };
}
