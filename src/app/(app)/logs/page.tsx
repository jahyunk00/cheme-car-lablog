import { LogsCategoryFilter } from "@/components/LogsCategoryFilter";
import { LogsList, type LogRow } from "@/components/LogsList";
import { listAllLogs, listDirectoryUsers } from "@/lib/db";
import { isLogCategory, type LogsCategoryFilterValue } from "@/lib/log-categories";
import { getSession } from "@/lib/session";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function LogsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) return null;

  const sp = await searchParams;
  const rawCategory = sp?.category;
  const categoryFilter: LogsCategoryFilterValue =
    rawCategory && isLogCategory(rawCategory) ? rawCategory : "all";

  const directory = await listDirectoryUsers();
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));

  const allRows: LogRow[] = (await listAllLogs()).map((l) => ({
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

  const logs =
    categoryFilter === "all"
      ? allRows
      : allRows.filter((l) => l.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse everything the team has logged.</p>
        </div>
        <LogsCategoryFilter value={categoryFilter} />
      </div>
      <LogsList
        logs={logs}
        currentUserId={session.sub}
        role={session.role}
        categoryFilter={categoryFilter}
      />
    </div>
  );
}
