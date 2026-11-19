# Database migrations

PostgreSQL schema for ReplayHook, intended to be applied to a Supabase project when one is available.

This phase does not require credentials. The public demo uses in-repo synthetic data. Apply `001_init.sql` in the Supabase SQL editor (or your migration runner) after creating a project, then set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the environment. Never commit `.env` files or keys.

Row Level Security (RLS) isolates customer workspaces from the synthetic demo workspace (`workspace_demo_synthetic`).
