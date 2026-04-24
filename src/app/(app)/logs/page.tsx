import { listAllLogs, listDirectoryUsers } from "@/lib/db";
import { LogsList, type LogRow } from "@/components/LogsList";
import { getSession } from "@/lib/session";

export default async function LogsPage() {
  const session = await getSession();
  if (!session) return null;

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
    category: l.category,
    createdAt: l.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse everything the team has logged.</p>
      </div>
      <LogsList logs={logs} currentUserId={session.sub} role={session.role} />
    </div>
  );
}
