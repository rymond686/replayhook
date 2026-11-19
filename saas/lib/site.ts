export const PRODUCT_NAME = "ReplayHook";
export const CONTACT_EMAIL = "lovelycat8528@gmail.com";
export const PAID_PLAN_PRICE_USD = "US$19.90/month";
export const REFUND_WINDOW = "48 hours";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${path}`;
}

export const PUBLIC_NAV = [
  { href: "/en/", label: "Overview" },
  { href: "/en/tools/stripe-event-inspector/", label: "Event inspector" },
  { href: "/en/integrations/stripe/", label: "Stripe integration" },
  { href: "/en/guides/stripe-webhook-delivery-failed/", label: "Delivery guide" },
  { href: "/en/pricing/", label: "Pricing" },
] as const;

export const LEGAL_NAV = [
  { href: "/en/terms/", label: "Terms of Service" },
  { href: "/en/privacy/", label: "Privacy Policy" },
  { href: "/en/refund/", label: "Refund Policy" },
  { href: "/en/security/", label: "Security" },
  { href: "/en/changelog/", label: "Changelog" },
] as const;

/** Indexable public canonical paths (trailing slashes). */
export const INDEXABLE_PATHS = [
  "/en/",
  "/en/tools/stripe-event-inspector/",
  "/en/integrations/stripe/",
  "/en/guides/stripe-webhook-delivery-failed/",
  "/en/pricing/",
  "/en/security/",
  "/en/changelog/",
  "/en/terms/",
  "/en/privacy/",
  "/en/refund/",
] as const;

export const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: PRODUCT_NAME,
  url: absoluteUrl("/en/"),
  applicationCategory: "DeveloperApplication",
  description:
    "Read-only Stripe payment and order reconciliation and diagnostics for small SaaS teams.",
} as const;
