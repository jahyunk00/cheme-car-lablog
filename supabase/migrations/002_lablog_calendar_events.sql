-- Scheduled calendar events (meetings, deadlines, milestones) — separate from daily logs.

create table if not exists public.lablog_calendar_events (
  id text primary key,
  user_id text not null references public.lablog_users (id) on delete cascade,
  title text not null,
  description text not null default '',
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lablog_calendar_events_end_after_start check (end_date is null or end_date >= start_date)
);

create index if not exists lablog_calendar_events_start_idx on public.lablog_calendar_events (start_date);
create index if not exists lablog_calendar_events_user_idx on public.lablog_calendar_events (user_id);

alter table public.lablog_calendar_events enable row level security;
