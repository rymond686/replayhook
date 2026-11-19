import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ANALYTICS_EVENTS = [
  "page_view",
  "demo_completed",
  "inspector_completed",
  "pricing_view",
  "pilot_apply_click",
  "pilot_apply_submit",
  "workspace_activated",
  "first_payment",
] as const;

type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

type AnalyticsEvent = {
  event: AnalyticsEventName;
  path: string;
  source: string;
};

const ALLOWED_ANALYTICS_ORIGIN = "https://rymond686.github.io";
const MAX_ANALYTICS_BODY_BYTES = 2048;
const MAX_ANALYTICS_FIELD_LENGTH = 200;
const BLOCKED_KEY_PATTERN =
  /(secret|password|token|authorization|api[_-]?key|webhook|payload|raw|email|phone|name|customer|card)/i;
const SECRET_VALUE_PATTERN = /sk_live|sk_test|whsec_|rk_live|Bearer\s/i;
const PATH_PATTERN = /^\/[A-Za-z0-9._/-]*$/;
const SOURCE_PATTERN = /^[A-Za-z0-9._:+/-]+$/;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ANALYTICS_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function json(status: number, body: { ok: boolean; error?: string; persisted?: boolean }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function isAllowedEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

function sanitizeAnalyticsEvent(input: unknown): AnalyticsEvent | { error: string } {
  if (!input || typeof input !== "object") {
    return { error: "Event must be an object." };
  }

  const record = input as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (BLOCKED_KEY_PATTERN.test(key)) {
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

function parseAnalyticsRequestBody(raw: string): AnalyticsEvent | { error: string; status: number } {
  if (new TextEncoder().encode(raw).length > MAX_ANALYTICS_BODY_BYTES) {
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

function getServiceKey(): string | null {
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeysRaw) {
    try {
      const keys = JSON.parse(secretKeysRaw) as Record<string, unknown>;
      const named = keys.default;
      if (typeof named === "string" && named.length > 0) return named;
      const first = Object.values(keys).find((value) => typeof value === "string" && value.length > 0);
      if (typeof first === "string") return first;
    } catch {
      // Fall back to the legacy platform secret. Never log key material.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ANALYTICS_ORIGIN) {
    return json(403, { ok: false, error: "Origin is not allowed." });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_ANALYTICS_BODY_BYTES) {
    return json(413, { ok: false, error: "Request is too large." });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json(400, { ok: false, error: "Invalid JSON." });
  }

  const parsed = parseAnalyticsRequestBody(raw);
  if ("error" in parsed) {
    return json(parsed.status, { ok: false, error: parsed.error });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getServiceKey();
  if (!supabaseUrl || !serviceKey) {
    return json(503, { ok: false, error: "Unable to store event." });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("analytics_events").insert({
      event: parsed.event,
      path: parsed.path,
      source: parsed.source,
    });
    if (error) {
      return json(503, { ok: false, error: "Unable to store event." });
    }
    return json(200, { ok: true, persisted: true });
  } catch {
    return json(503, { ok: false, error: "Unable to store event." });
  }
});
