"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";

export type DayLogRow = {
  id: string;
  title: string;
  userName: string;
  description: string;
  tags: string[];
};

export function DaySummaryDialog({
  open,
  dateStr,
  logs,
  onClose,
  onAddEvent,
}: {
  open: boolean;
  dateStr: string | null;
  logs: DayLogRow[];
  onClose: () => void;
  onAddEvent: () => void;
}) {
  if (!open || !dateStr) return null;

  let label = dateStr;
  try {
    label = format(parseISO(`${dateStr}T12:00:00`), "EEEE, MMM d, yyyy");
  } catch {
    /* keep raw */
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[61] w-full max-w-lg rounded-xl border border-lab-border bg-lab-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-summary-title"
      >
        <div className="border-b border-lab-border px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="day-summary-title" className="text-lg font-semibold text-white">
              Work logged
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-lab-border/40 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto px-5 py-4">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">No lab logs for this day yet.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-lg border border-lab-border bg-lab-bg/50 px-4 py-3 text-left"
                >
                  <p className="font-medium text-white">{log.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{log.userName}</p>
                  {log.tags.length > 0 ? (
                    <p className="text-xs text-blue-300/90 mt-2">{log.tags.join(" · ")}</p>
                  ) : null}
                  {log.description ? (
                    <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{log.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end border-t border-lab-border px-5 py-4">
          <Link
            href={`/logs?date=${dateStr}`}
            className="inline-flex items-center rounded-lg border border-lab-border px-4 py-2 text-sm text-slate-200 hover:bg-lab-border/30"
            onClick={onClose}
          >
            Open in Logs
          </Link>
          <button
            type="button"
            onClick={() => {
              onAddEvent();
            }}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Add event this day
          </button>
        </div>
      </div>
    </div>
  );
}
