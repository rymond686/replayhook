# ReplayHook

ReplayHook is a read-only payment and order reconciliation diagnostic for small SaaS teams that use Stripe. It helps investigate cases such as “Stripe confirmed the payment, but the application order is still pending.”

This repository contains the first-phase public site, a no-login synthetic-data demo, and the schema needed to wire a Supabase (PostgreSQL) project later. A static preview is published to GitHub Pages at [https://rymond686.github.io/replayhook/en/](https://rymond686.github.io/replayhook/en/).

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
- A server-hosted deploy with API persistence (Vercel or Cloudflare). GitHub Pages is a static preview only

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

See `.env.example`. Leave `SUPABASE_URL` and `SUPABASE_ANON_KEY` unset to run the in-repo synthetic demo. The GitHub Pages preview uses `NEXT_PUBLIC_SITE_URL=https://rymond686.github.io/replayhook` and `NEXT_PUBLIC_BASE_PATH=/replayhook`. Local development leaves these unset so the site is served at `http://localhost:3000/en/`. The GitHub Pages preview posts sanitized first-party analytics events to a Supabase Edge Function collector (`NEXT_PUBLIC_ANALYTICS_ENDPOINT`). A browser session record is only a local aid and is not treated as collection success. The optional `server/optional-api/track` route is not deployed on Pages; if used on a later Node host, it returns success only after the event is persisted and fails when credentials are missing.

## Repository layout

```text
saas/
├── app/           # marketing site, console placeholders, auth, and API
├── billing/       # reconciliation engine, entitlements, payment-event types
├── jobs/          # background worker and failed-job recovery
├── migrations/    # PostgreSQL / Supabase schema
├── public/        # public static files
└── tests/         # core delivery, tenant isolation, and read-only tests
supabase/functions/track/  # public GitHub Pages analytics collector
```

## Contact

Questions and paid-pilot applications: [lovelycat8528@gmail.com](mailto:lovelycat8528@gmail.com).

The operator / legal entity name has not been confirmed yet and is not invented in the legal pages. Contact is identified by the email address above until that name is confirmed.
