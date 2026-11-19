-- ReplayHook phase 1 schema
-- Apply against PostgreSQL / Supabase. Safe to review before running.

create table if not exists workspaces (
  id text primary key,
  name text not null,
  source text not null check (source in ('synthetic_demo', 'stripe_test', 'authorized_export')),
  created_at timestamptz not null default now(),
  constraint demo_source_isolation check (
    (source = 'synthetic_demo' and id = 'workspace_demo_synthetic')
    or (source <> 'synthetic_demo' and id <> 'workspace_demo_synthetic')
  )
);

create table if not exists analytics_events (
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
  path text not null,
  source text not null default 'unknown',
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);

create table if not exists pilot_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  message text,
  source text not null default 'unknown',
  created_at timestamptz not null default now()
);

create table if not exists reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references workspaces (id),
  source text not null check (source in ('synthetic_demo', 'stripe_test', 'authorized_export')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint run_workspace_isolation check (
    (source = 'synthetic_demo' and workspace_id = 'workspace_demo_synthetic')
    or (source <> 'synthetic_demo' and workspace_id <> 'workspace_demo_synthetic')
  )
);

create table if not exists reconciliation_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references reconciliation_runs (id) on delete cascade,
  result_type text not null check (result_type in (
    'matched',
    'missing_business_record',
    'needs_customer_review'
  )),
  payment_intent_id text,
  charge_id text,
  evidence jsonb not null default '{}'::jsonb
);

create table if not exists billing_entitlements (
  workspace_id text primary key references workspaces (id),
  product text not null default 'paid_pilot',
  status text not null default 'none' check (status in ('none', 'pilot_pending', 'pilot_active', 'refunded')),
  price_range_usd text not null default '19-99',
  updated_at timestamptz not null default now()
);

-- Payment events are recorded here in a later phase. Phase 1 does not ingest
-- production webhooks or mutate payment / order status.
create table if not exists billing_payment_events (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  event_id text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  unique (channel, event_id)
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  last_error text,
  workspace_id text references workspaces (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workspaces enable row level security;
alter table analytics_events enable row level security;
alter table pilot_applications enable row level security;
alter table reconciliation_runs enable row level security;
alter table reconciliation_results enable row level security;
alter table billing_entitlements enable row level security;
alter table billing_payment_events enable row level security;
alter table jobs enable row level security;

-- Analytics inserts from the public site use the anon key and never include
-- secrets or identifiable customer payloads.
drop policy if exists analytics_events_insert_anon on analytics_events;
create policy analytics_events_insert_anon
  on analytics_events for insert
  to anon
  with check (
    event in (
      'page_view',
      'demo_completed',
      'inspector_completed',
      'pricing_view',
      'pilot_apply_click',
      'pilot_apply_submit'
    )
    and path like '/%'
  );

drop policy if exists pilot_applications_insert_anon on pilot_applications;
create policy pilot_applications_insert_anon
  on pilot_applications for insert
  to anon
  with check (email is not null);

-- Tenant isolation for reconciliation data: a workspace role may only see
-- its own rows. The synthetic demo workspace cannot be mixed with customer data.
drop policy if exists reconciliation_runs_tenant_select on reconciliation_runs;
create policy reconciliation_runs_tenant_select
  on reconciliation_runs for select
  to authenticated
  using (workspace_id = auth.jwt() ->> 'workspace_id');

insert into workspaces (id, name, source)
values ('workspace_demo_synthetic', 'Synthetic demo', 'synthetic_demo')
on conflict (id) do nothing;
