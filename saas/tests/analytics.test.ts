import { describe, expect, it } from "vitest";
import {
  resolveSource,
  sanitizeAnalyticsEvent,
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

  it("rejects secrets, raw payloads, and identifiable fields", () => {
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
  });
});
