import { format, startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";
import { getUserById, listAllLogs, listFeed } from "@/lib/db";

export default async function DashboardPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const logs = await listAllLogs();
  const todayLogs = logs.filter((l) => l.date === today);
  const feed = await listFeed(12);

  const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
  const we = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStart = format(ws, "yyyy-MM-dd");
  const weekEnd = format(we, "yyyy-MM-dd");
  const weekLogs = logs.filter((l) => l.date >= weekStart && l.date <= weekEnd);

  async function nameFor(id: string) {
    const u = await getUserById(id);
    return u?.name ?? id;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Today&apos;s activity, a live feed, and a quick look at this week.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-lab-border bg-lab-surface p-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Today</h2>
          <p className="mt-2 text-3xl font-semibold text-white">{todayLogs.length}</p>
          <p className="text-sm text-slate-500 mt-1">logs for {today}</p>
          <Link href="/logs" className="inline-block mt-4 text-sm text-blue-400">
            Add or view logs →
          </Link>
        </div>
        <div className="rounded-xl border border-lab-border bg-lab-surface p-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">This week</h2>
          <p className="mt-2 text-3xl font-semibold text-white">{weekLogs.length}</p>
          <p className="text-sm text-slate-500 mt-1">team logs (Mon–Sun)</p>
          <Link href="/weekly-summary" className="inline-block mt-4 text-sm text-blue-400">
            Open weekly summary →
          </Link>
        </div>
        <div className="rounded-xl border border-lab-border bg-lab-surface p-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Calendar</h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            See which days have logs and jump in to add entries.
          </p>
          <Link href="/calendar" className="inline-block mt-4 text-sm text-blue-400">
            Open calendar →
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium text-white mb-3">Today&apos;s logs</h2>
          {todayLogs.length === 0 ? (
            <p className="text-slate-500 text-sm">No logs yet for today.</p>
          ) : (
            <ul className="space-y-3">
              {await Promise.all(
                todayLogs.map(async (log) => (
                  <li
                    key={log.id}
                    className="rounded-lg border border-lab-border bg-lab-bg/40 px-4 py-3"
                  >
                    <p className="font-medium text-white">{log.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(await nameFor(log.userId))}
                      {log.tags.length ? ` · ${log.tags.join(", ")}` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-white mb-3">Activity feed</h2>
          {feed.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {feed.map((item) => (
                <li key={item.id} className="text-slate-400 flex gap-2">
                  <span className="text-slate-600 shrink-0">
                    {format(new Date(item.createdAt), "MMM d HH:mm")}
                  </span>
                  <span className="text-slate-300">{item.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
