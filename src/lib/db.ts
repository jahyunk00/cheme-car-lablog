import type { CalendarEventEntry, FeedItem, LogEntry, User, UserRole } from "./types";
import { createAdminClient } from "@/utils/supabase/admin";

function admin() {
  return createAdminClient();
}

function mapUser(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
}): User {
  const role: UserRole = row.role === "admin" ? "admin" : "member";
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    passwordHash: row.password_hash,
  };
}

function mapLog(row: {
  id: string;
  user_id: string;
  log_date: string;
  title: string;
  description: string;
  tags: string[] | null;
  hours: string | number | null;
  created_at: string;
  updated_at: string;
}): LogEntry {
  const hours =
    row.hours === null || row.hours === undefined || row.hours === ""
      ? null
      : Number(row.hours);
  return {
    id: row.id,
    userId: row.user_id,
    date: row.log_date.slice(0, 10),
    title: row.title,
    description: row.description ?? "",
    tags: row.tags ?? [],
    hours: Number.isFinite(hours) ? hours : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFeed(row: {
  id: string;
  type: string;
  user_id: string;
  log_id: string;
  message: string;
  created_at: string;
}): FeedItem {
  const type = row.type === "log_updated" ? "log_updated" : "log_created";
  return {
    id: row.id,
    type,
    userId: row.user_id,
    logId: row.log_id,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function countUsers(): Promise<number> {
  const { count, error } = await admin()
    .from("lablog_users")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin()
    .from("lablog_users")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapUser(data as Parameters<typeof mapUser>[0]);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await admin().from("lablog_users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapUser(data as Parameters<typeof mapUser>[0]);
}

export async function listDirectoryUsers(): Promise<
  { id: string; name: string; email: string; role: UserRole }[]
> {
  const { data, error } = await admin().from("lablog_users").select("id, name, email, role");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role === "admin" ? "admin" : "member",
  }));
}

export async function listLogsForUser(userId: string): Promise<LogEntry[]> {
  const { data, error } = await admin()
    .from("lablog_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapLog(r as Parameters<typeof mapLog>[0]));
}

export async function listAllLogs(): Promise<LogEntry[]> {
  const { data, error } = await admin()
    .from("lablog_logs")
    .select("*")
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapLog(r as Parameters<typeof mapLog>[0]));
}

export async function getLog(id: string): Promise<LogEntry | undefined> {
  const { data, error } = await admin().from("lablog_logs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapLog(data as Parameters<typeof mapLog>[0]);
}

export async function upsertUser(user: User) {
  const { error } = await admin().from("lablog_users").upsert(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      password_hash: user.passwordHash,
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
}

export async function saveLog(
  log: LogEntry,
  feedItem: Omit<FeedItem, "id" | "createdAt"> & { id?: string }
) {
  const client = admin();
  const { error: logErr } = await client.from("lablog_logs").upsert(
    {
      id: log.id,
      user_id: log.userId,
      log_date: log.date,
      title: log.title,
      description: log.description,
      tags: log.tags,
      hours: log.hours,
      created_at: log.createdAt,
      updated_at: log.updatedAt,
    },
    { onConflict: "id" }
  );
  if (logErr) throw new Error(logErr.message);

  const feedId = feedItem.id ?? crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const { error: feedErr } = await client.from("lablog_feed").insert({
    id: feedId,
    type: feedItem.type,
    user_id: feedItem.userId,
    log_id: feedItem.logId,
    message: feedItem.message,
    created_at: createdAt,
  });
  if (feedErr) throw new Error(feedErr.message);
}

export async function deleteLog(id: string) {
  const { error } = await admin().from("lablog_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listFeed(limit = 30): Promise<FeedItem[]> {
  const { data, error } = await admin()
    .from("lablog_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapFeed(r as Parameters<typeof mapFeed>[0]));
}

function mapCalendarEvent(row: {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}): CalendarEventEntry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? "",
    startDate: row.start_date.slice(0, 10),
    endDate: row.end_date ? row.end_date.slice(0, 10) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAllCalendarEvents(): Promise<CalendarEventEntry[]> {
  const { data, error } = await admin()
    .from("lablog_calendar_events")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapCalendarEvent(r as Parameters<typeof mapCalendarEvent>[0]));
}

export async function getCalendarEvent(id: string): Promise<CalendarEventEntry | undefined> {
  const { data, error } = await admin()
    .from("lablog_calendar_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapCalendarEvent(data as Parameters<typeof mapCalendarEvent>[0]);
}

export async function saveCalendarEvent(entry: CalendarEventEntry) {
  const { error } = await admin().from("lablog_calendar_events").upsert(
    {
      id: entry.id,
      user_id: entry.userId,
      title: entry.title,
      description: entry.description,
      start_date: entry.startDate,
      end_date: entry.endDate,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
}

export async function deleteCalendarEvent(id: string) {
  const { error } = await admin().from("lablog_calendar_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
