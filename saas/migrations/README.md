# Database migrations

PostgreSQL schema for ReplayHook, intended to be applied to a Supabase project when one is available.

This phase does not require credentials for the public demo or unit tests. The public demo uses in-repo synthetic data.

`002_analytics_events.sql` is the minimal analytics table used by the public GitHub Pages collector (Supabase Edge Function `track`). It enables Row Level Security, grants no public or anonymous read/write, and is the only schema applied for analytics. Do not apply `001_init.sql` solely to stand up event collection; that file also defines unrelated product tables that are not required for this collector.

Never commit `.env` files, service role keys, or other secrets.
