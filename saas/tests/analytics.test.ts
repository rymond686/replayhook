import { describe, expect, it, vi } from "vitest";
import {
  inspectAnalyticsHttpRequest,
  MAX_ANALYTICS_BODY_BYTES,
  parseAnalyticsRequestBody,
  resolveSource,
  sanitizeAnalyticsEvent,
  submitAnalyticsEvent,
} from "../lib/analytics";

describe("first-party analytics sanitization", () => {
  it("accepts allowlisted funnel events and keeps an unknown source", () => {
    const result = sanitizeAnalyticsEvent({
      event: "demo_completed",
      path: "/en/",
    });
    expect(result).toEqual({
      event: "demo_completed",
      path: "/en/",
      source: "unknown",
    });
  });

  it("keeps demo_completed distinct from workspace_activated", () => {
    expect(
      sanitizeAnalyticsEvent({ event: "demo_completed", path: "/en/", source: "unknown" }),
    ).toEqual({ event: "demo_completed", path: "/en/", source: "unknown" });
    expect(
      sanitizeAnalyticsEvent({ event: "workspace_activated", path: "/en/", source: "unknown" }),
    ).toEqual({ event: "workspace_activated", path: "/en/", source: "unknown" });
    expect(sanitizeAnalyticsEvent({ event: "demo_completed", path: "/en/" })).not.toEqual(
      sanitizeAnalyticsEvent({ event: "workspace_activated", path: "/en/" }),
    );
  });

  it("prefers UTM parameters and falls back to the referrer or unknown", () => {
    expect(
      resolveSource({
        searchParams: { utm_source: "newsletter", utm_medium: "email" },
        referrer: "https://example.com/blog",
      }),
    ).toBe("utm:newsletter:email:-");

    expect(
      resolveSource({
        searchParams: {},
        referrer: "https://news.ycombinator.com/item?id=1",
      }),
    ).toBe("referrer:news.ycombinator.com");

    expect(resolveSource({ searchParams: {}, referrer: null })).toBe("unknown");
  });

  it("strips unsafe characters from UTM values before they become a source", () => {
    expect(
      resolveSource({
        searchParams: { utm_source: "qa ac7", utm_medium: "email@x", utm_campaign: "a?b=c" },
      }),
    ).toBe("utm:qa-ac7:email-x:a-b-c");
  });

  it("rejects secrets, raw payloads, identifiable fields, and query strings", () => {
    expect(
      sanitizeAnalyticsEvent({
        event: "page_view",
        path: "/en/",
        api_key: "sk_test_123",
      }),
    ).toEqual({ error: "Event contains a disallowed field." });

    expect(
      sanitizeAnalyticsEvent({
        event: "page_view",
        path: "/en/",
        payload: { raw: "webhook body" },
      }),
    ).toEqual({ error: "Event contains a disallowed field." });

    expect(
      sanitizeAnalyticsEvent({
        event: "pilot_apply_submit",
        path: "/en/pricing/",
        email: "person@example.com",
      }),
    ).toEqual({ error: "Event contains a disallowed field." });

    expect(
      sanitizeAnalyticsEvent({
        event: "page_view",
        path: "/en/",
        source: "sk_live_example",
      }),
    ).toEqual({ error: "Event value looks like a secret." });

    expect(
      sanitizeAnalyticsEvent({
        event: "page_view",
        path: "/en/?utm_source=x&email=person@example.com",
        source: "unknown",
      }),
    ).toEqual({ error: "Path must be a site-relative path." });

    expect(
      sanitizeAnalyticsEvent({
        event: "page_view",
        path: "/en/",
        source: "referrer:evil.example?q=1",
      }),
    ).toEqual({ error: "Source is not allowed." });
  });
});

describe("collector request inspection", () => {
  const validBody = JSON.stringify({
    event: "pricing_view",
    path: "/en/pricing/",
    source: "utm:qa-ac7-test:synthetic:-",
  });

  it("accepts a sanitized POST and OPTIONS preflight from the site origin", () => {
    expect(
      inspectAnalyticsHttpRequest({
        method: "POST",
        origin: "https://rymond686.github.io",
        bodyText: validBody,
      }),
    ).toEqual({
      kind: "accepted",
      event: {
        event: "pricing_view",
        path: "/en/pricing/",
        source: "utm:qa-ac7-test:synthetic:-",
      },
    });

    expect(
      inspectAnalyticsHttpRequest({
        method: "OPTIONS",
        origin: "https://rymond686.github.io",
      }),
    ).toEqual({ kind: "preflight" });
  });

  it("rejects disallowed origins, methods, invalid JSON, and oversized bodies", () => {
    expect(
      inspectAnalyticsHttpRequest({
        method: "POST",
        origin: "https://evil.example",
        bodyText: validBody,
      }),
    ).toEqual({ kind: "reject", status: 403, error: "Origin is not allowed." });

    expect(
      inspectAnalyticsHttpRequest({
        method: "GET",
        origin: "https://rymond686.github.io",
      }),
    ).toEqual({ kind: "reject", status: 405, error: "Method not allowed." });

    expect(
      inspectAnalyticsHttpRequest({
        method: "POST",
        bodyText: "{not-json",
      }),
    ).toEqual({ kind: "reject", status: 400, error: "Invalid JSON." });

    const oversized = `{"event":"page_view","path":"/en/","source":"${"a".repeat(MAX_ANALYTICS_BODY_BYTES)}"}`;
    expect(parseAnalyticsRequestBody(oversized)).toEqual({
      error: "Request is too large.",
      status: 413,
    });
    expect(
      inspectAnalyticsHttpRequest({
        method: "POST",
        bodyText: oversized,
      }),
    ).toEqual({ kind: "reject", status: 413, error: "Request is too large." });
  });
});

describe("collector submission status handling", () => {
  const event = {
    event: "page_view" as const,
    path: "/en/",
    source: "utm:qa-ac7-test:synthetic:-",
  };

  it("treats only response.ok as success and reports HTTP failures honestly", async () => {
    const okFetch = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(
      submitAnalyticsEvent(event, { endpoint: "https://example.test/track", fetchImpl: okFetch }),
    ).resolves.toEqual({ ok: true, status: 200 });

    const failedFetch = vi.fn(async () => new Response("Method Not Allowed", { status: 405 }));
    await expect(
      submitAnalyticsEvent(event, { endpoint: "https://example.test/track", fetchImpl: failedFetch }),
    ).resolves.toEqual({ ok: false, status: 405, error: "Collector rejected the event." });

    const serviceDown = vi.fn(async () => new Response("{}", { status: 503 }));
    await expect(
      submitAnalyticsEvent(event, { endpoint: "https://example.test/track", fetchImpl: serviceDown }),
    ).resolves.toEqual({ ok: false, status: 503, error: "Collector rejected the event." });
  });

  it("does not treat a missing endpoint or a local-only record as collection success", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(submitAnalyticsEvent(event, { endpoint: null, fetchImpl })).resolves.toEqual({
      ok: false,
      status: null,
      error: "Analytics collector is not configured.",
    });
    expect(fetchImpl).not.toHaveBeenCalled();

    const networkError = vi.fn(async () => {
      throw new Error("offline");
    });
    await expect(
      submitAnalyticsEvent(event, { endpoint: "https://example.test/track", fetchImpl: networkError }),
    ).resolves.toEqual({
      ok: false,
      status: null,
      error: "Network error contacting the collector.",
    });
  });
});
