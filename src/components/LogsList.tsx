import Link from "next/link";

import type { LogCategory, LogsCategoryFilterValue } from "@/lib/log-categories";

export type LogRow = {
  id: string;
  userId: string;
  userName: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  hours: number | null;
  category: LogCategory;
  createdAt: string;
};

export function LogsList({
  logs,
  currentUserId,
  role,
  categoryFilter = "all",
}: {
  logs: LogRow[];
  currentUserId: string;
  role: string;
  /** When not "all", empty list shows a category-specific message. */
  categoryFilter?: LogsCategoryFilterValue;
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {logs.map((log) => {
          const canEdit = log.userId === currentUserId || role === "admin";
          return (
            <li key={log.id} className="rounded-lg border border-border bg-card/60 p-3 sm:p-4">
              <div className="flex min-w-0 justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-foreground">{log.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-medium text-foreground">
                        {log.category}
                      </span>
                      <span className="mx-1.5">·</span>
                      {log.date} · {log.userName}
                    {log.hours != null ? ` · ${log.hours}h` : ""}
                  </p>
                  {log.tags.length ? (
                    <p className="mt-2 text-xs text-primary/90">{log.tags.join(" · ")}</p>
                  ) : null}
                  {log.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{log.description}</p>
                  ) : null}
                </div>
                {canEdit ? (
                  <Link
                    href={`/logs/upload?edit=${encodeURIComponent(log.id)}`}
                    className="h-fit shrink-0 text-sm text-primary hover:underline"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {categoryFilter !== "all"
            ? `No logs for “${categoryFilter}” yet.`
            : "No logs yet."}
        </p>
      ) : null}
      <p className="mt-6 text-xs text-muted-foreground">
        Add new logs from the{" "}
        <Link href="/logs/upload" className="text-primary hover:underline">
          Upload log
        </Link>{" "}
        tab. Open the{" "}
        <Link href="/calendar" className="text-primary hover:underline">
          calendar
        </Link>{" "}
        to pick a day and see logs for that day.
      </p>
    </div>
  );
}
