"use client";

import Link from "next/link";
import { useState } from "react";
import { LogForm, type LogPayload } from "./LogForm";

export type LogRow = {
  id: string;
  userId: string;
  userName: string;
  date: string;
  title: string;
  description: string;
  tags: string[];
  hours: number | null;
  createdAt: string;
};

export function LogsExplorer({
  logs,
  initialDate,
  currentUserId,
  role,
}: {
  logs: LogRow[];
  initialDate: string;
  currentUserId: string;
  role: string;
}) {
  const [editing, setEditing] = useState<LogRow | null>(null);

  const initialForm: LogPayload = editing
    ? {
        id: editing.id,
        date: editing.date,
        title: editing.title,
        description: editing.description,
        tags: editing.tags.join(", "),
        hours: editing.hours != null ? String(editing.hours) : "",
      }
    : {
        date: initialDate,
        title: "",
        description: "",
        tags: "",
        hours: "",
      };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium text-white">New log</h2>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="text-sm text-primary hover:underline"
          >
            Clear selection (new entry)
          </button>
        </div>

        <LogForm
          key={editing?.id ?? `new-${initialDate}`}
          initial={initialForm}
          onDone={() => setEditing(null)}
        />
      </div>

      <div>
        <h2 className="text-lg font-medium text-white mb-3">
          All logs <span className="text-slate-500 text-sm font-normal">({logs.length})</span>
        </h2>
        <ul className="space-y-3">
          {logs.map((log) => {
            const canEdit = log.userId === currentUserId || role === "admin";
            return (
              <li key={log.id} className="rounded-lg border border-lab-border bg-lab-surface/60 p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{log.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {log.date} · {log.userName}
                      {log.hours != null ? ` · ${log.hours}h` : ""}
                    </p>
                    {log.tags.length ? (
                      <p className="text-xs text-blue-300/90 mt-2">{log.tags.join(" · ")}</p>
                    ) : null}
                    {log.description ? (
                      <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{log.description}</p>
                    ) : null}
                  </div>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => setEditing(log)}
                      className="h-fit shrink-0 text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        {logs.length === 0 ? <p className="text-slate-500 text-sm mt-4">No logs yet.</p> : null}
        <p className="text-xs text-slate-600 mt-6">
          Tip: open the{" "}
          <Link href="/calendar" className="text-primary">
            calendar
          </Link>{" "}
          and click a day to jump here with that date prefilled.
        </p>
      </div>
    </div>
  );
}
