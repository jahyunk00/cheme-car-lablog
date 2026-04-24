import type { LablogAvatarId } from "@/lib/avatar-ids";
import type { LogCategory } from "@/lib/log-categories";

export type UserRole = "admin" | "board" | "member";

/** One lab check-in for a calendar day (user marked present). */
export type AttendanceEntry = {
  id: string;
  userId: string;
  attendedDate: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  avatarId: LablogAvatarId;
};

export type LogEntry = {
  id: string;
  userId: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  hours: number | null;
  category: LogCategory;
  createdAt: string;
  updatedAt: string;
};

export type FeedItem = {
  id: string;
  type: "log_created" | "log_updated";
  userId: string;
  logId: string;
  message: string;
  createdAt: string;
};

/** All-day scheduled items on the shared calendar (not the same as daily lab logs). */
export type CalendarEventEntry = {
  id: string;
  userId: string;
  title: string;
  description: string;
  /** Inclusive first day (YYYY-MM-DD). */
  startDate: string;
  /** Inclusive last day, or null for a single-day event. */
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  /** When set, the deadline was marked done (see `completedByUserId`). */
  completedAt: string | null;
  /** User who clicked “Mark complete” (not necessarily the event creator). */
  completedByUserId: string | null;
  /** Resolved on the server for display; not stored in DB. */
  completedByName?: string | null;
};
