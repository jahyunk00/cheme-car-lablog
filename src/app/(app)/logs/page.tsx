import { format } from "date-fns";
import { listAllLogs, listDirectoryUsers } from "@/lib/db";
import { LogsExplorer, type LogRow } from "@/components/LogsExplorer";
import { getSession } from "@/lib/session";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function LogsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;

  const sp = await searchParams;
  const initialDate =
    sp?.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : format(new Date(), "yyyy-MM-dd");

  const directory = await listDirectoryUsers();
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));

  const logs: LogRow[] = (await listAllLogs()).map((l) => ({
    id: l.id,
    userId: l.userId,
    userName: nameById[l.userId] ?? l.userId,
    date: l.date,
    title: l.title,
    description: l.description,
    tags: l.tags,
    hours: l.hours,
    createdAt: l.createdAt,
  }));

  const users = directory.map((u) => ({ id: u.id, name: u.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Logs</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Create and edit entries, filter by teammate, tag, or date range.
        </p>
      </div>
      <LogsExplorer
        logs={logs}
        users={users}
        initialDate={initialDate}
        currentUserId={session.sub}
        role={session.role}
      />
    </div>
  );
}
