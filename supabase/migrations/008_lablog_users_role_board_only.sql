-- If promoting someone to Board fails with: lablog_users_role_check
-- run this in Supabase SQL Editor (safe if 007 already ran — same constraint).
-- Full feature set still needs 007 for lablog_attendance.

alter table public.lablog_users drop constraint if exists lablog_users_role_check;

alter table public.lablog_users
  add constraint lablog_users_role_check
  check (role in ('admin', 'board', 'member'));
