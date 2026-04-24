import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from "date-fns";
import { getUserById, listAllLogs } from "@/lib/db";
import { canViewTeamMetrics } from "@/lib/roles";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!canViewTeamMetrics(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const anchor = searchParams.get("date");
  const base = anchor ? new Date(anchor + "T12:00:00") : new Date();
  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const logs = (await listAllLogs()).filter((l) => l.date >= startStr && l.date <= endStr);

  const byUser: Record<string, { name: string; count: number; hours: number }> = {};
  const tagCounts: Record<string, number> = {};

  for (const log of logs) {
    const u = await getUserById(log.userId);
    const name = u?.name ?? log.userId;
    if (!byUser[log.userId]) {
      byUser[log.userId] = { name, count: 0, hours: 0 };
    }
    byUser[log.userId].count += 1;
    if (log.hours != null) byUser[log.userId].hours += log.hours;
    for (const t of log.tags) {
      const key = t.toLowerCase();
      tagCounts[key] = (tagCounts[key] ?? 0) + 1;
    }
  }

  const days = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
  const logsPerDay: Record<string, number> = {};
  for (const d of days) logsPerDay[d] = 0;
  for (const log of logs) {
    logsPerDay[log.date] = (logsPerDay[log.date] ?? 0) + 1;
  }

  return NextResponse.json({
    weekStart: startStr,
    weekEnd: endStr,
    totalLogs: logs.length,
    byUser: Object.entries(byUser).map(([userId, v]) => ({ userId, ...v })),
    tagCounts,
    logsPerDay,
  });
}
