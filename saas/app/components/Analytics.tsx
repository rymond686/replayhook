"use client";

import { useEffect } from "react";
import { resolveSource, type AnalyticsEventName } from "@/lib/analytics";

const SOURCE_KEY = "replayhook_source";

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

export async function track(event: AnalyticsEventName, path?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const source = readPersistedSource();
  await fetch("/api/track/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      path: path ?? `${window.location.pathname}${window.location.pathname.endsWith("/") ? "" : "/"}`,
      source,
    }),
    keepalive: true,
  });
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
