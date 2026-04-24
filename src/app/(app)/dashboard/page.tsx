import { format, startOfWeek, endOfWeek } from "date-fns";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { listAllLogs, listDirectoryUsers, listFeed } from "@/lib/db";
import { canViewTeamMetrics } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const showTeam = canViewTeamMetrics(session.role);
  const today = format(new Date(), "yyyy-MM-dd");
  const [logs, directory] = await Promise.all([listAllLogs(), listDirectoryUsers()]);
  const feed = showTeam ? await listFeed(12) : [];
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));
  const avatarById = Object.fromEntries(directory.map((u) => [u.id, u.avatarId]));
  const todayLogsAll = logs.filter((l) => l.date === today);
  const todayLogs = showTeam ? todayLogsAll : todayLogsAll.filter((l) => l.userId === session.sub);

  const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
  const we = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStart = format(ws, "yyyy-MM-dd");
  const weekEnd = format(we, "yyyy-MM-dd");
  const weekLogsAll = logs.filter((l) => l.date >= weekStart && l.date <= weekEnd);
  const weekLogs = showTeam ? weekLogsAll : weekLogsAll.filter((l) => l.userId === session.sub);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {showTeam
            ? "Today’s activity, a live feed, and a quick look at this week."
            : "Your logs today and a quick look at your week. Team metrics are available to board members and admins."}
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-lab-border bg-lab-surface p-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Today</h2>
          <p className="mt-2 text-3xl font-semibold text-white">{todayLogs.length}</p>
          <p className="text-sm text-slate-500 mt-1">
            {showTeam ? "team logs" : "your logs"} for {today}
          </p>
          <Link href="/logs" className="mt-4 inline-block text-sm text-primary">
            Add or view logs →
          </Link>
        </div>
        <div className="rounded-xl border border-lab-border bg-lab-surface p-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">This week</h2>
          <p className="mt-2 text-3xl font-semibold text-white">{weekLogs.length}</p>
          <p className="text-sm text-slate-500 mt-1">{showTeam ? "team logs" : "your logs"} (Mon–Sun)</p>
          {showTeam ? (
            <Link href="/weekly-summary" className="mt-4 inline-block text-sm text-primary">
              Open weekly summary →
            </Link>
          ) : (
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Weekly team summary is visible to board members and admins.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-lab-border bg-lab-surface p-5">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Calendar</h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            See which days have logs and jump in to add entries.
          </p>
          <Link href="/calendar" className="mt-4 inline-block text-sm text-primary">
            Open calendar →
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium text-white mb-3">
            {showTeam ? "Today’s logs" : "Your logs today"}
          </h2>
          {todayLogs.length === 0 ? (
            <p className="text-slate-500 text-sm">No logs yet for today.</p>
          ) : (
            <ul className="space-y-3">
              {todayLogs.map((log) => {
                const author = nameById[log.userId] ?? log.userId;
                return (
                  <li
                    key={log.id}
                    className="rounded-lg border border-lab-border bg-lab-bg/40 px-4 py-3"
                  >
                    <p className="font-medium text-white">{log.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
                      <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-slate-200">
                        {log.category}
                      </span>
                      <span className="mx-0.5">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <UserAvatar
                          avatarId={avatarById[log.userId] ?? 1}
                          size={20}
                          title={author}
                          className="border-lab-border bg-lab-bg"
                        />
                        {author}
                      </span>
                      {log.tags.length ? ` · ${log.tags.join(", ")}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-white mb-3">Activity feed</h2>
          {!showTeam ? (
            <p className="text-slate-500 text-sm leading-relaxed">
              The live team feed is available to board members and admins. You can still browse all shared logs under{" "}
              <Link href="/logs" className="text-primary hover:underline">
                Logs
              </Link>
              .
            </p>
          ) : feed.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {feed.map((item) => (
                <li key={item.id} className="flex gap-2 text-slate-400">
                  <UserAvatar
                    avatarId={avatarById[item.userId] ?? 1}
                    size={22}
                    title={nameById[item.userId] ?? item.userId}
                    className="mt-0.5 shrink-0 border-lab-border bg-lab-bg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-slate-600">
                      {format(new Date(item.createdAt), "MMM d HH:mm")}
                    </span>
                    <span className="text-slate-300">{item.message}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
