-- Treasurer: board-like lab visibility; manages item-request "ordered" state (app-enforced).
alter table public.lablog_users drop constraint if exists lablog_users_role_check;

alter table public.lablog_users
  add constraint lablog_users_role_check
  check (role in ('admin', 'board', 'member', 'treasurer'));
