-- When set, the team has marked this request as ordered.
alter table public.lablog_item_requests
  add column if not exists ordered_at timestamptz;
