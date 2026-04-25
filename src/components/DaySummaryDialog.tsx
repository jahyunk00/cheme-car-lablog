"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";

import { UserAvatar } from "@/components/UserAvatar";
import type { LogCategory } from "@/lib/log-categories";

export type DayLogRow = {
  id: string;
  title: string;
  userName: string;
  userAvatarId: number;
  description: string;
  tags: string[];
  category: LogCategory;
  participantNames: string[];
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[61] max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))] w-full max-w-lg rounded-t-xl border border-lab-border bg-lab-surface shadow-xl sm:max-h-[min(85vh,32rem)] sm:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-summary-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-lab-border px-4 py-3 sm:px-5 sm:py-4">
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

        <div className="max-h-[min(50vh,320px)] overflow-y-auto px-4 py-3 sm:max-h-[min(60vh,420px)] sm:px-5 sm:py-4">
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
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
                    <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-foreground">
                      {log.category}
                    </span>
                    <span className="mx-0.5">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <UserAvatar avatarId={log.userAvatarId} size={18} title={log.userName} />
                      {log.userName}
                    </span>
                  </p>
                  {log.tags.length > 0 ? (
                    <p className="text-xs text-blue-300/90 mt-2">{log.tags.join(" · ")}</p>
                  ) : null}
                  {log.description ? (
                    <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{log.description}</p>
                  ) : null}
                  {log.participantNames.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-500">With: {log.participantNames.join(", ")}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-lab-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:flex-row sm:flex-wrap sm:justify-end sm:px-5 sm:py-4 sm:pb-4">
          <Link
            href="/logs"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:bg-accent sm:flex-initial"
            onClick={onClose}
          >
            View all logs
          </Link>
          <button
            type="button"
            onClick={() => {
              onAddEvent();
            }}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 sm:flex-initial"
          >
            Add event this day
          </button>
        </div>
      </div>
    </div>
  );
}
