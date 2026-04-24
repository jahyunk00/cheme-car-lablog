-- Area / subsystem for each lab log (dropdown in UI).
alter table public.lablog_logs
  add column if not exists category text not null default 'Other';

alter table public.lablog_logs drop constraint if exists lablog_logs_category_check;

alter table public.lablog_logs
  add constraint lablog_logs_category_check
  check (
    category in ('Propulsion', 'Stopping', 'Car Design', 'Other')
  );
