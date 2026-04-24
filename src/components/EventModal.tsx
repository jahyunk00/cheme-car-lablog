"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import type { CalendarEventEntry } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  /** When null id, creates; otherwise edits existing. */
  initial: Pick<
    CalendarEventEntry,
    "title" | "description" | "startDate" | "endDate" | "completedAt" | "completedByUserId"
  > & {
    id: string | null;
    completedByName?: string | null;
  };
  currentUserId: string;
  role: string;
  eventOwnerId?: string;
  onSaved: () => void;
};

function formatCompletedAt(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}

async function readApiError(res: Response, fallback: string) {
  const raw = await res.text();
  try {
    const data = JSON.parse(raw) as { error?: string };
    if (typeof data.error === "string") return data.error;
  } catch {
    if (raw.trim()) return raw.slice(0, 400);
  }
  return fallback + ` (${res.status})`;
}

export function EventModal({
  open,
  onClose,
  initial,
  currentUserId,
  role,
  eventOwnerId,
  onSaved,
}: Props) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial.title);
    setDescription(initial.description);
    setStartDate(initial.startDate);
    setEndDate(initial.endDate ?? "");
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const isEdit = Boolean(initial.id);
  const isOwner = eventOwnerId === undefined || eventOwnerId === currentUserId;
  const readOnly = isEdit && role !== "admin" && !isOwner;
  const canDelete =
    isEdit && !readOnly && (role === "admin" || (eventOwnerId !== undefined && eventOwnerId === currentUserId));

  async function save() {
    setError(null);
    setLoading(true);
    try {
      const body = {
        title,
        description,
        startDate,
        endDate: endDate.trim() === "" ? null : endDate.trim(),
      };
      let res: Response;
      try {
        res = await fetch(isEdit ? `/api/calendar-events/${initial.id}` : "/api/calendar-events", {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(body),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error.");
        return;
      }
      if (!res.ok) {
        setError(await readApiError(res, "Could not save"));
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!initial.id || !canDelete) return;
    if (!confirm("Delete this calendar event?")) return;
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch(`/api/calendar-events/${initial.id}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error.");
        return;
      }
      if (!res.ok) {
        setError(await readApiError(res, "Could not delete"));
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function setCompleted(completed: boolean) {
    if (!initial.id) return;
    setError(null);
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch(`/api/calendar-events/${initial.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ completed }),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error.");
        return;
      }
      if (!res.ok) {
        setError(await readApiError(res, "Could not update status"));
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const isComplete = Boolean(initial.completedAt);
  const canReopen = isEdit && isComplete && (role === "admin" || eventOwnerId === currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div
        className="max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))] w-full max-w-md space-y-4 overflow-y-auto rounded-t-xl border border-lab-border bg-lab-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-xl sm:rounded-xl sm:p-6 sm:pb-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
      >
        <div className="flex justify-between items-start gap-2">
          <h2 id="event-modal-title" className="text-lg font-semibold text-white">
            {isEdit ? "Edit event" : "New calendar event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            Close
          </button>
        </div>
        <p className="text-xs text-slate-500">
          All-day events for deadlines, meetings, or milestones. Daily work still goes in{" "}
          <span className="text-slate-400">Logs</span>. Anyone signed in can mark a deadline complete; only the
          creator (or an admin) can reopen it.
        </p>
        {isEdit && isComplete ? (
          <div className="rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200">
            <span className="font-medium text-emerald-300/95">Completed</span>
            {initial.completedByName || initial.completedByUserId ? (
              <>
                {" "}
                by{" "}
                <span className="font-medium text-white">
                  {initial.completedByName ?? initial.completedByUserId}
                </span>
              </>
            ) : null}
            {initial.completedAt ? (
              <>
                {" "}
                · {formatCompletedAt(initial.completedAt)}
              </>
            ) : null}
          </div>
        ) : null}
        {readOnly ? (
          <p className="text-sm text-amber-200/90 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
            You can view this event, but only the creator (or an admin) can edit it.
          </p>
        ) : null}
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Title</label>
          <input
            className="w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Description (optional)</label>
          <textarea
            className="w-full min-h-[80px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Start date</label>
            <input
              type="date"
              className="w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">End date (optional)</label>
            <input
              type="date"
              className="w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              disabled={readOnly}
            />
          </div>
        </div>
        <p className="text-xs text-slate-600">End date is inclusive (last day of the event).</p>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {isEdit && !isComplete ? (
          <button
            type="button"
            onClick={() => void setCompleted(true)}
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50"
          >
            Mark complete
          </button>
        ) : null}
        {canReopen ? (
          <button
            type="button"
            onClick={() => void setCompleted(false)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-500 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800/80 disabled:opacity-50"
          >
            Reopen task
          </button>
        ) : null}
        <div className="flex flex-col gap-2 pt-2 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:justify-end">
          {canDelete ? (
            <button
              type="button"
              onClick={remove}
              disabled={loading}
              className="order-last w-full rounded-lg border border-red-900/50 px-3 py-2.5 text-sm text-red-300 hover:bg-red-950/40 min-[420px]:order-first min-[420px]:mr-auto min-[420px]:w-auto"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-lab-border px-4 py-2.5 text-sm text-slate-300 hover:bg-lab-border/30 min-[420px]:w-auto"
          >
            Cancel
          </button>
          {!readOnly ? (
            <button
              type="button"
              onClick={save}
              disabled={loading || !title.trim()}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50 min-[420px]:w-auto"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
