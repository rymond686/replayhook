-- Minimal first-party analytics events table for the public site collector.
-- Do not apply 001_init.sql here; this migration intentionally excludes
-- unrelated product tables (workspaces, pilots, reconciliation, billing, jobs).

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null check (event in (
    'page_view',
    'demo_completed',
    'inspector_completed',
    'pricing_view',
    'pilot_apply_click',
    'pilot_apply_submit',
    'workspace_activated',
    'first_payment'
  )),
  path text not null check (
    char_length(path) between 1 and 200
    and path like '/%'
    and path !~ '[?#@:[:space:]]'
    and position('//' in path) = 0
  ),
  source text not null default 'unknown' check (
    char_length(source) between 1 and 200
    and source ~ '^[A-Za-z0-9._:+/-]+$'
  ),
  created_at timestamptz not null default now()
);

create index analytics_events_event_created_at_idx
  on public.analytics_events (event, created_at desc);

create index analytics_events_source_created_at_idx
  on public.analytics_events (source, created_at desc);

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from public, anon, authenticated, service_role;
grant insert on table public.analytics_events to service_role;

comment on table public.analytics_events is
  'Sanitized first-party funnel events. No public read or write; inserts go through the Edge Function collector only.';

do $$
begin
  if exists (
    select 1
    from pg_publication_rel pr
    join pg_publication p on p.oid = pr.prpubid
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where p.pubname = 'supabase_realtime'
      and n.nspname = 'public'
      and c.relname = 'analytics_events'
  ) then
    execute 'alter publication supabase_realtime drop table public.analytics_events';
  end if;
end
$$;
