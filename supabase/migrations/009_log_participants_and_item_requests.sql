-- Log participants: teammates attached to a log (beyond the author who filed it).
create table if not exists public.lablog_log_participants (
  log_id text not null references public.lablog_logs (id) on delete cascade,
  user_id text not null references public.lablog_users (id) on delete cascade,
  primary key (log_id, user_id)
);

create index if not exists lablog_log_participants_user_idx on public.lablog_log_participants (user_id);

alter table public.lablog_log_participants enable row level security;

-- Item / parts requests (e.g. propulsion, stopping, car design).
create table if not exists public.lablog_item_requests (
  id text primary key,
  user_id text not null references public.lablog_users (id) on delete cascade,
  name text not null,
  quantity integer not null check (quantity > 0),
  price text not null default '',
  link text not null default '',
  purpose text not null check (purpose in ('propulsion', 'stopping', 'car_design', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists lablog_item_requests_created_idx on public.lablog_item_requests (created_at desc);

alter table public.lablog_item_requests enable row level security;
