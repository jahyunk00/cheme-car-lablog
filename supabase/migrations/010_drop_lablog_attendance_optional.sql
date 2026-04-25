-- Optional: remove lab check-in storage if you are not using it anymore.
-- Safe to skip. If the table never existed, this is a no-op.

drop table if exists public.lablog_attendance;
