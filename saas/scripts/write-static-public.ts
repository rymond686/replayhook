import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { absoluteUrl, CONTACT_EMAIL, PRODUCT_NAME } from "../lib/site";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const securityTxt = [
  `Contact: mailto:${CONTACT_EMAIL}`,
  "Expires: 2027-11-18T00:00:00Z",
  "Preferred-Languages: en",
  `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
  `Policy: ${absoluteUrl("/en/security/")}`,
  "",
].join("\n");

const llmsTxt = `# ${PRODUCT_NAME}

> ${PRODUCT_NAME} is a read-only Stripe payment and order reconciliation and diagnostics pilot for small SaaS teams.

## Product and integration

- [Pilot overview](${absoluteUrl("/en/")}): Current capabilities, synthetic demo, and pilot access.
- [Stripe integration](${absoluteUrl("/en/integrations/stripe/")}): Supported inputs, data coverage, permissions, and a synthetic report.
- [Pricing](${absoluteUrl("/en/pricing/")}): Paid-pilot price range and how to apply.

## Diagnostic guides and tools

- [Troubleshoot a failed Stripe webhook delivery](${absoluteUrl("/en/guides/stripe-webhook-delivery-failed/")}): Check delivery evidence and compare it with order records.
- [Stripe event inspector](${absoluteUrl("/en/tools/stripe-event-inspector/")}): Inspect sample Stripe event fields in the browser.
`;

function write(relativePath: string, content: string) {
  const target = join(publicDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

write(".nojekyll", "");
write(".well-known/security.txt", securityTxt);
write("llms.txt", llmsTxt);
