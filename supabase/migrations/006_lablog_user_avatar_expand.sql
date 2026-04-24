-- Allow additional preset avatars (5–8) from the app picker.
alter table public.lablog_users drop constraint if exists lablog_users_avatar_id_check;

alter table public.lablog_users
  add constraint lablog_users_avatar_id_check
  check (avatar_id >= 1 and avatar_id <= 8);
