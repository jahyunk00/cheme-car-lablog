"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<LogRow | null>(null);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (from && l.date < from) return false;
      if (to && l.date > to) return false;
      return true;
    });
  }, [logs, from, to]);

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
          <h2 className="text-lg font-medium text-white">Filters</h2>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="text-sm text-primary hover:underline"
          >
            New log for selected day
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="field-label">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full" />
          </div>
          <div className="space-y-1">
            <label className="field-label">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full" />
          </div>
        </div>

        <LogForm
          key={editing?.id ?? `new-${initialDate}`}
          initial={initialForm}
          onDone={() => setEditing(null)}
        />
      </div>

      <div>
        <h2 className="text-lg font-medium text-white mb-3">
          Results <span className="text-slate-500 text-sm font-normal">({filtered.length})</span>
        </h2>
        <ul className="space-y-3">
          {filtered.map((log) => {
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
        {filtered.length === 0 ? <p className="text-slate-500 text-sm mt-4">No logs match these filters.</p> : null}
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
