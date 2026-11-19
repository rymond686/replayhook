import { absoluteUrl, PRODUCT_NAME } from "@/lib/site";

export function GET() {
  const body = `# ${PRODUCT_NAME}

> ${PRODUCT_NAME} is a read-only Stripe payment and order reconciliation and diagnostics pilot for small SaaS teams.

## Product and integration

- [Pilot overview](${absoluteUrl("/en/")}): Current capabilities, synthetic demo, and pilot access.
- [Stripe integration](${absoluteUrl("/en/integrations/stripe/")}): Supported inputs, data coverage, permissions, and a synthetic report.
- [Pricing](${absoluteUrl("/en/pricing/")}): Paid-pilot price range and how to apply.

## Diagnostic guides and tools

- [Troubleshoot a failed Stripe webhook delivery](${absoluteUrl("/en/guides/stripe-webhook-delivery-failed/")}): Check delivery evidence and compare it with order records.
- [Stripe event inspector](${absoluteUrl("/en/tools/stripe-event-inspector/")}): Inspect sample Stripe event fields in the browser.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
