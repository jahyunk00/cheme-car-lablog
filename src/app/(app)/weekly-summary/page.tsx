import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { redirect } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";
import { listAllLogs, listDirectoryUsers } from "@/lib/db";
import { canAccessWeeklySummary } from "@/lib/roles";
import { getSession } from "@/lib/session";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function WeeklySummaryPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;
  if (!canAccessWeeklySummary(session.role)) redirect("/dashboard");

  const sp = await searchParams;
  const anchor =
    sp?.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)
      ? new Date(sp.date + "T12:00:00")
      : new Date();
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const [allLogs, directory] = await Promise.all([listAllLogs(), listDirectoryUsers()]);
  const logs = allLogs.filter((l) => l.date >= startStr && l.date <= endStr);
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));
  const avatarById = Object.fromEntries(directory.map((u) => [u.id, u.avatarId]));

  const byUser: Record<string, { name: string; count: number; hours: number; avatarId: number }> = {};
  const tagCounts: Record<string, number> = {};

  for (const log of logs) {
    const name = nameById[log.userId] ?? log.userId;
    const avatarId = avatarById[log.userId] ?? 1;
    if (!byUser[log.userId]) byUser[log.userId] = { name, count: 0, hours: 0, avatarId };
    byUser[log.userId].count += 1;
    if (log.hours != null) byUser[log.userId].hours += log.hours;
    for (const t of log.tags) {
      const k = t.toLowerCase();
      tagCounts[k] = (tagCounts[k] ?? 0) + 1;
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const prev = format(subWeeks(anchor, 1), "yyyy-MM-dd");
  const next = format(addWeeks(anchor, 1), "yyyy-MM-dd");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Weekly summary</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Week of {startStr} – {endStr}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <a
            href={`/weekly-summary?date=${prev}`}
            className="px-3 py-1.5 rounded-md border border-lab-border text-slate-300 hover:bg-lab-border/40"
          >
            ← Previous week
          </a>
          <a
            href={`/weekly-summary?date=${next}`}
            className="px-3 py-1.5 rounded-md border border-lab-border text-slate-300 hover:bg-lab-border/40"
          >
            Next week →
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-lab-border bg-lab-surface p-6">
        <p className="text-sm text-slate-400 uppercase tracking-wide">Total logs</p>
        <p className="text-4xl font-semibold text-white mt-1">{logs.length}</p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-white mb-4">By teammate</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(byUser).map(([id, v]) => (
            <div key={id} className="rounded-lg border border-lab-border bg-lab-bg/30 p-4">
              <p className="flex items-center gap-2 font-medium text-white">
                <UserAvatar avatarId={v.avatarId} size={28} title={v.name} className="border-lab-border bg-lab-bg" />
                {v.name}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {v.count} log{v.count === 1 ? "" : "s"}
                {v.hours > 0 ? ` · ${v.hours}h tracked` : ""}
              </p>
            </div>
          ))}
          {Object.keys(byUser).length === 0 ? (
            <p className="text-slate-500 text-sm">No logs this week.</p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white mb-4">Key tags</h2>
        {topTags.length === 0 ? (
          <p className="text-slate-500 text-sm">No tags recorded this week.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, n]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full border border-lab-border bg-lab-surface px-3 py-1 text-sm text-slate-200"
              >
                {tag}
                <span className="text-slate-500">{n}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-white mb-4">Timeline</h2>
        <ul className="space-y-2 text-sm border-l border-lab-border ml-2 pl-4">
          {[...logs]
            .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
            .map((log) => (
              <li key={log.id} className="relative flex gap-2">
                <UserAvatar
                  avatarId={avatarById[log.userId] ?? 1}
                  size={20}
                  title={nameById[log.userId] ?? log.userId}
                  className="mt-0.5 shrink-0 border-lab-border bg-lab-bg"
                />
                <div className="min-w-0">
                  <span className="text-slate-500">{log.date}</span>{" "}
                  <span className="text-slate-400">[{log.category}]</span>{" "}
                  <span className="text-slate-200">{log.title}</span>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
