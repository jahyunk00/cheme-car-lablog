-- Three roles: admin, board (extra visibility), member (lab access without team metrics / attendance rollups).
alter table public.lablog_users drop constraint if exists lablog_users_role_check;

alter table public.lablog_users
  add constraint lablog_users_role_check
  check (role in ('admin', 'board', 'member'));

-- One row per user per calendar day they marked present in the lab.
create table if not exists public.lablog_attendance (
  id text primary key,
  user_id text not null references public.lablog_users (id) on delete cascade,
  attended_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, attended_date)
);

create index if not exists lablog_attendance_date_idx on public.lablog_attendance (attended_date desc);
create index if not exists lablog_attendance_user_date_idx on public.lablog_attendance (user_id, attended_date desc);

alter table public.lablog_attendance enable row level security;
