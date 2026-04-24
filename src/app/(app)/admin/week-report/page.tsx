import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CopyTextButton } from "@/components/CopyTextButton";
import {
  listAllCalendarEvents,
  listAllLogs,
  listAttendanceBetween,
  listDirectoryUsers,
} from "@/lib/db";
import { isAdmin } from "@/lib/roles";
import { getSession } from "@/lib/session";
import { buildWeeklyNarrativeReport } from "@/lib/weekly-narrative-report";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function AdminWeekReportPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session.role)) redirect("/dashboard");

  const sp = await searchParams;
  const anchor =
    sp?.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)
      ? new Date(sp.date + "T12:00:00")
      : new Date();
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const [allLogs, directory, allEvents] = await Promise.all([
    listAllLogs(),
    listDirectoryUsers(),
    listAllCalendarEvents(),
  ]);
  const logs = allLogs.filter((l) => l.date >= startStr && l.date <= endStr);
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));

  let attendance: Awaited<ReturnType<typeof listAttendanceBetween>> = [];
  try {
    attendance = await listAttendanceBetween(startStr, endStr);
  } catch {
    attendance = [];
  }

  const report = buildWeeklyNarrativeReport({
    weekStart: startStr,
    weekEnd: endStr,
    logs,
    nameById,
    events: allEvents,
    attendance,
  });

  const prev = format(subWeeks(anchor, 1), "yyyy-MM-dd");
  const next = format(addWeeks(anchor, 1), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Weekly narrative report</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty max-w-prose">
            Admin-only. This page builds a written summary of the selected week from logs, calendar items that touch
            the week, lab check-ins, and who contributed—no external AI required.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/admin/week-report?date=${prev}`}
            className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          >
            ← Previous week
          </Link>
          <Link
            href={`/admin/week-report?date=${next}`}
            className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          >
            Next week →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CopyTextButton text={report} />
        <Link href="/admin/roles" className="text-sm text-primary hover:underline">
          Team roles
        </Link>
        <Link href="/weekly-summary" className="text-sm text-primary hover:underline">
          Weekly summary (charts)
        </Link>
      </div>

      <pre className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground sm:p-5">
        {report}
      </pre>
    </div>
  );
}
