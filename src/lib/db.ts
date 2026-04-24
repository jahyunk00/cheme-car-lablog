import { parseLablogAvatarId } from "./avatar-ids";
import type { AttendanceEntry, CalendarEventEntry, FeedItem, LogEntry, User, UserRole } from "./types";
import { parseLogCategory } from "./log-categories";
import { createAdminClient } from "@/utils/supabase/admin";

function admin() {
  return createAdminClient();
}

/** Full text from PostgREST / Supabase errors (message is not always enough). */
function supabaseErrorText(err: unknown): string {
  if (err == null) return "";
  if (typeof err === "string") return err;
  if (typeof err !== "object") return String(err);
  const o = err as Record<string, unknown>;
  const chunks: string[] = [];
  for (const k of ["message", "details", "hint", "code"]) {
    const v = o[k];
    if (typeof v === "string" && v.length) chunks.push(v);
  }
  if (o.cause != null) {
    const nested = supabaseErrorText(o.cause);
    if (nested) chunks.push(nested);
  }
  if (!chunks.length) {
    try {
      return JSON.stringify(o);
    } catch {
      return String(o);
    }
  }
  return chunks.join("\n");
}

function isMissingLablogCategoryColumnError(err: unknown): boolean {
  const t = supabaseErrorText(err);
  if (!t) return false;
  const lower = t.toLowerCase();
  if (!lower.includes("category")) return false;
  if (lower.includes("lablog_logs")) return true;
  if (lower.includes("schema cache")) return true;
  if (lower.includes("column")) return true;
  return false;
}

function parseUserRole(value: string): UserRole {
  if (value === "admin" || value === "board" || value === "member") return value;
  return "member";
}

function isMissingUserAvatarColumnError(err: unknown): boolean {
  const t = supabaseErrorText(err);
  if (!t) return false;
  const lower = t.toLowerCase();
  if (!lower.includes("avatar_id")) return false;
  if (lower.includes("lablog_users")) return true;
  if (lower.includes("schema cache")) return true;
  if (lower.includes("column")) return true;
  return false;
}

function mapUser(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
  avatar_id?: number | null;
}): User {
  const role = parseUserRole(row.role);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    passwordHash: row.password_hash,
    avatarId: parseLablogAvatarId(row.avatar_id),
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
  category?: string | null;
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
    category: parseLogCategory(row.category ?? undefined),
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
  { id: string; name: string; email: string; role: UserRole; avatarId: number }[]
> {
  const { data, error } = await admin().from("lablog_users").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: parseUserRole(row.role as string),
    avatarId: parseLablogAvatarId((row as { avatar_id?: unknown }).avatar_id),
  }));
}

/** Set a user to member or board. Admins cannot be changed here (use database for admin accounts). */
export async function updateUserMemberBoardRole(userId: string, role: "member" | "board") {
  const existing = await getUserById(userId);
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.role === "admin") throw new Error("ADMIN_ROLE_LOCKED");
  const { error } = await admin().from("lablog_users").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
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
  const client = admin();
  const withAvatar = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password_hash: user.passwordHash,
    avatar_id: user.avatarId,
  };
  const legacyNoAvatar = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password_hash: user.passwordHash,
  };
  let { error } = await client.from("lablog_users").upsert(withAvatar, { onConflict: "id" });
  if (error && isMissingUserAvatarColumnError(error)) {
    ({ error } = await client.from("lablog_users").upsert(legacyNoAvatar, { onConflict: "id" }));
  }
  if (error) throw new Error(error.message);
}

/** Insert a new user (registration). Fails if email already exists. */
export async function insertUser(user: User) {
  const email = user.email.trim().toLowerCase();
  const client = admin();
  const withAvatar = {
    id: user.id,
    name: user.name.trim(),
    email,
    role: user.role,
    password_hash: user.passwordHash,
    avatar_id: user.avatarId,
  };
  const legacyNoAvatar = {
    id: user.id,
    name: user.name.trim(),
    email,
    role: user.role,
    password_hash: user.passwordHash,
  };
  let { error } = await client.from("lablog_users").insert(withAvatar);
  if (error && isMissingUserAvatarColumnError(error)) {
    ({ error } = await client.from("lablog_users").insert(legacyNoAvatar));
  }
  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505" || /duplicate|unique/i.test(error.message)) {
      throw new Error("EMAIL_TAKEN");
    }
    throw new Error(error.message);
  }
}

export async function saveLog(
  log: LogEntry,
  feedItem: Omit<FeedItem, "id" | "createdAt"> & { id?: string }
) {
  const client = admin();
  const withCategory = {
    id: log.id,
    user_id: log.userId,
    log_date: log.date,
    title: log.title,
    description: log.description,
    tags: log.tags,
    hours: log.hours,
    category: log.category,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
  };
  const legacyNoCategory = {
    id: log.id,
    user_id: log.userId,
    log_date: log.date,
    title: log.title,
    description: log.description,
    tags: log.tags,
    hours: log.hours,
    created_at: log.createdAt,
    updated_at: log.updatedAt,
  };

  let { error: logErr } = await client.from("lablog_logs").upsert(withCategory, { onConflict: "id" });

  if (logErr && isMissingLablogCategoryColumnError(logErr)) {
    ({ error: logErr } = await client.from("lablog_logs").upsert(legacyNoCategory, { onConflict: "id" }));
  }

  if (logErr) {
    if (isMissingLablogCategoryColumnError(logErr)) {
      throw new Error(
        "The database is still rejecting log writes related to `category`. In Supabase → SQL Editor, run the full contents of `supabase/migrations/003_lablog_log_category.sql`, then wait ~1 minute for the API schema cache to refresh. Raw error: " +
          supabaseErrorText(logErr)
      );
    }
    throw new Error(supabaseErrorText(logErr) || "Could not save log.");
  }

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

function mapAttendance(row: {
  id: string;
  user_id: string;
  attended_date: string;
  created_at: string;
}): AttendanceEntry {
  const d = row.attended_date;
  const dateStr = typeof d === "string" && d.length >= 10 ? d.slice(0, 10) : String(d).slice(0, 10);
  return {
    id: row.id,
    userId: row.user_id,
    attendedDate: dateStr,
    createdAt: row.created_at,
  };
}

/** Stable primary key for upserts (user + calendar day). */
export function attendanceRowId(userId: string, attendedDate: string) {
  return `${userId}__${attendedDate}`;
}

export async function recordAttendance(userId: string, attendedDate: string): Promise<AttendanceEntry> {
  const id = attendanceRowId(userId, attendedDate);
  const now = new Date().toISOString();
  const { error } = await admin().from("lablog_attendance").upsert(
    {
      id,
      user_id: userId,
      attended_date: attendedDate,
      created_at: now,
    },
    { onConflict: "user_id,attended_date" }
  );
  if (error) throw new Error(error.message);
  const row = await getAttendanceDay(userId, attendedDate);
  if (!row) throw new Error("Could not read attendance after save.");
  return row;
}

export async function getAttendanceDay(
  userId: string,
  attendedDate: string
): Promise<AttendanceEntry | undefined> {
  const { data, error } = await admin()
    .from("lablog_attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("attended_date", attendedDate)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapAttendance(data as Parameters<typeof mapAttendance>[0]);
}

export async function removeAttendance(userId: string, attendedDate: string) {
  const { error } = await admin()
    .from("lablog_attendance")
    .delete()
    .eq("user_id", userId)
    .eq("attended_date", attendedDate);
  if (error) throw new Error(error.message);
}

export async function listAttendanceForUser(
  userId: string,
  from: string,
  to: string
): Promise<AttendanceEntry[]> {
  const { data, error } = await admin()
    .from("lablog_attendance")
    .select("*")
    .eq("user_id", userId)
    .gte("attended_date", from)
    .lte("attended_date", to)
    .order("attended_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapAttendance(r as Parameters<typeof mapAttendance>[0]));
}

export async function listAttendanceBetween(from: string, to: string): Promise<AttendanceEntry[]> {
  const { data, error } = await admin()
    .from("lablog_attendance")
    .select("*")
    .gte("attended_date", from)
    .lte("attended_date", to)
    .order("attended_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapAttendance(r as Parameters<typeof mapAttendance>[0]));
}

/** If `lablog_attendance` is missing or PostgREST errors, return [] (prevents 500 on /attendance). */
export async function listAttendanceForUserSafe(
  userId: string,
  from: string,
  to: string
): Promise<AttendanceEntry[]> {
  try {
    return await listAttendanceForUser(userId, from, to);
  } catch (e) {
    console.warn("[lablog] listAttendanceForUser:", e);
    return [];
  }
}

export async function listAttendanceBetweenSafe(from: string, to: string): Promise<AttendanceEntry[]> {
  try {
    return await listAttendanceBetween(from, to);
  } catch (e) {
    console.warn("[lablog] listAttendanceBetween:", e);
    return [];
  }
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
  completed_at?: string | null;
  completed_by_user_id?: string | null;
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
    completedAt: row.completed_at ?? null,
    completedByUserId: row.completed_by_user_id ?? null,
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

function calendarCompletionColumnMissing(msg: string) {
  return /completed_at|completed_by_user_id|schema cache|Could not find the .*column/i.test(msg);
}

export async function saveCalendarEvent(entry: CalendarEventEntry) {
  const client = admin();
  const withCompletion = {
    id: entry.id,
    user_id: entry.userId,
    title: entry.title,
    description: entry.description,
    start_date: entry.startDate,
    end_date: entry.endDate,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    completed_at: entry.completedAt,
    completed_by_user_id: entry.completedByUserId,
  };
  const legacy = {
    id: entry.id,
    user_id: entry.userId,
    title: entry.title,
    description: entry.description,
    start_date: entry.startDate,
    end_date: entry.endDate,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };

  const hasCompletionData = entry.completedAt != null || entry.completedByUserId != null;
  let { error } = await client.from("lablog_calendar_events").upsert(withCompletion, { onConflict: "id" });

  if (error && hasCompletionData && calendarCompletionColumnMissing(error.message)) {
    throw new Error(
      "This database is missing the calendar completion columns. In Supabase, run `supabase/migrations/004_lablog_calendar_event_completion.sql` (or `supabase db push`), then try again."
    );
  }

  if (error && !hasCompletionData && calendarCompletionColumnMissing(error.message)) {
    ({ error } = await client.from("lablog_calendar_events").upsert(legacy, { onConflict: "id" }));
  }

  if (error) throw new Error(error.message);
}

export async function deleteCalendarEvent(id: string) {
  const { error } = await admin().from("lablog_calendar_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
