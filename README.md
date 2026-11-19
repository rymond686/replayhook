# ReplayHook

ReplayHook is a read-only payment and order reconciliation diagnostic for small SaaS teams that use Stripe. It helps investigate cases such as “Stripe confirmed the payment, but the application order is still pending.”

This repository contains the first-phase public site, a no-login synthetic-data demo, and the schema needed to wire a Supabase (PostgreSQL) project later. **Public production deploy is intentionally not enabled.** Review the pull request before publishing.

## What this phase includes

- A public English marketing site under `/en/`
- A no-login synthetic reconciliation demo (about 30 seconds) and a Stripe event inspector
- Three result types with inspectable evidence: matched, missing business processing record, and needs customer review
- Draft Terms of Service, Privacy Policy, and Refund Policy (refundable within 48 hours of purchase)
- First-party analytics for funnel events (no secrets, no raw production webhook payloads, no identifiable customer data)
- PostgreSQL/Supabase migrations and the official Supabase client, used only when environment variables are set

## What this phase does not include

- Taking over production webhooks
- Charging or refunding customers
- Automatically changing payment or order status
- Cross-source aggregation
- Payment-channel webhook ingest (signature verification, persistence, acknowledgement, deduplication)
- A published OpenAPI document
- A production deploy (GitHub Pages, Vercel, or Cloudflare)

## Local development

Requirements: Node.js 20 or later. No Supabase credentials are required for the demo or unit tests.

```bash
cd saas
cp ../.env.example .env.local   # optional; the demo runs without secrets
npm install
npm test
npm run dev
```

Open [http://localhost:3000/en/](http://localhost:3000/en/). The worker process, used later for background jobs and failed-job recovery, can be started with `npm run worker`.

### Environment variables

See `.env.example`. Leave `SUPABASE_URL` and `SUPABASE_ANON_KEY` unset to run the in-repo synthetic demo. Set `NEXT_PUBLIC_SITE_URL` to the public origin before any future deploy so `robots.txt`, `sitemap.xml`, and `security.txt` use the real canonical host.

## Repository layout

```text
saas/
├── app/           # marketing site, console placeholders, auth, and API
├── billing/       # reconciliation engine, entitlements, payment-event types
├── jobs/          # background worker and failed-job recovery
├── migrations/    # PostgreSQL / Supabase schema
├── public/        # public static files
└── tests/         # core delivery, tenant isolation, and read-only tests
```

## Contact

Questions and paid-pilot applications: [lovelycat8528@gmail.com](mailto:lovelycat8528@gmail.com).

The operator / legal entity name has not been confirmed yet and is not invented in the legal pages. Contact is identified by the email address above until that name is confirmed.
