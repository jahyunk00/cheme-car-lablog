-- Track who finished a deadline-style calendar event and when.

alter table public.lablog_calendar_events
  add column if not exists completed_at timestamptz null,
  add column if not exists completed_by_user_id text null references public.lablog_users (id) on delete set null;

create index if not exists lablog_calendar_events_completed_at_idx
  on public.lablog_calendar_events (completed_at desc nulls last);
