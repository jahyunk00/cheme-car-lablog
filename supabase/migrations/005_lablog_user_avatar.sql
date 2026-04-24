-- Profile avatar (1–4) chosen at registration; shown in header, logs, and feed.
alter table public.lablog_users
  add column if not exists avatar_id integer not null default 1;

alter table public.lablog_users drop constraint if exists lablog_users_avatar_id_check;

alter table public.lablog_users
  add constraint lablog_users_avatar_id_check
  check (avatar_id >= 1 and avatar_id <= 4);
