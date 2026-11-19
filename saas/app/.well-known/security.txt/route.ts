import { absoluteUrl, CONTACT_EMAIL } from "@/lib/site";

export function GET() {
  const body = [
    `Contact: mailto:${CONTACT_EMAIL}`,
    "Expires: 2027-11-18T00:00:00Z",
    "Preferred-Languages: en",
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    `Policy: ${absoluteUrl("/en/security/")}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
