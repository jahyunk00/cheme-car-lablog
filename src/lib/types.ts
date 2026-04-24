export type UserRole = "admin" | "member";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
};

import type { LogCategory } from "@/lib/log-categories";

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
};
