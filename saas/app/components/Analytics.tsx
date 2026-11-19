"use client";

import { useEffect } from "react";
import {
  getAnalyticsCollectorUrl,
  getAnalyticsPublishableKey,
  resolveSource,
  sanitizeAnalyticsEvent,
  submitAnalyticsEvent,
  type AnalyticsEventName,
} from "@/lib/analytics";

const SOURCE_KEY = "replayhook_source";
const EVENTS_KEY = "replayhook_events";

function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

function sitePathFromLocation(): string {
  const base = getBasePath();
  let path = window.location.pathname || "/";
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length) || "/";
  }
  if (!path.endsWith("/")) path += "/";
  return path;
}

function readPersistedSource(): string {
  const params = new URLSearchParams(window.location.search);
  const resolved = resolveSource({
    searchParams: params,
    referrer: document.referrer || null,
  });
  try {
    const existing = window.sessionStorage.getItem(SOURCE_KEY);
    if (params.get("utm_source") || params.get("utm_medium") || params.get("utm_campaign")) {
      window.sessionStorage.setItem(SOURCE_KEY, resolved);
      return resolved;
    }
    if (existing) return existing;
    window.sessionStorage.setItem(SOURCE_KEY, resolved);
  } catch {
    return resolved;
  }
  return resolved;
}

function recordLocally(event: { event: AnalyticsEventName; path: string; source: string }) {
  const sanitized = sanitizeAnalyticsEvent(event);
  if ("error" in sanitized) return;
  try {
    const existingRaw = window.sessionStorage.getItem(EVENTS_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as unknown) : [];
    const list = Array.isArray(existing) ? existing : [];
    list.push({ ...sanitized, at: new Date().toISOString() });
    window.sessionStorage.setItem(EVENTS_KEY, JSON.stringify(list));
    (window as typeof window & { __REPLAYHOOK_EVENTS?: unknown }).__REPLAYHOOK_EVENTS = list;
  } catch {
    // sessionStorage may be unavailable. A local record is never collection success.
  }
}

export async function track(event: AnalyticsEventName, path?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const source = readPersistedSource();
  const payload = {
    event,
    path: path ?? sitePathFromLocation(),
    source,
  };
  // Local session history is only for in-page inspection. It is not proof of collection.
  recordLocally(payload);

  const endpoint = getAnalyticsCollectorUrl();
  const headers: Record<string, string> = {};
  const publishableKey = getAnalyticsPublishableKey();
  if (publishableKey) {
    headers.apikey = publishableKey;
    headers.Authorization = `Bearer ${publishableKey}`;
  }
  await submitAnalyticsEvent(payload, { endpoint, headers });
}

export function AnalyticsBeacon({
  event = "page_view",
  path,
}: {
  event?: AnalyticsEventName;
  path: string;
}) {
  useEffect(() => {
    void track(event, path);
  }, [event, path]);
  return null;
}
