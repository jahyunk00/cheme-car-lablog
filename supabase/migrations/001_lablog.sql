-- LabLog tables (used with service role from Next.js API / server components).
-- Run in Supabase SQL Editor once, or use Supabase CLI: supabase db push

create table if not exists public.lablog_users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'member')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lablog_logs (
  id text primary key,
  user_id text not null references public.lablog_users (id) on delete cascade,
  log_date date not null,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  hours numeric(12, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lablog_logs_log_date_idx on public.lablog_logs (log_date desc);
create index if not exists lablog_logs_user_id_idx on public.lablog_logs (user_id);

create table if not exists public.lablog_feed (
  id text primary key,
  type text not null check (type in ('log_created', 'log_updated')),
  user_id text not null,
  log_id text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists lablog_feed_created_at_idx on public.lablog_feed (created_at desc);

alter table public.lablog_users enable row level security;
alter table public.lablog_logs enable row level security;
alter table public.lablog_feed enable row level security;

-- No policies: anon/authenticated cannot read/write. Only service_role (server) accesses these tables.
