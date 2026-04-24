"use client";

import { useEffect, useState } from "react";
import type { CalendarEventEntry } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  /** When null id, creates; otherwise edits existing. */
  initial: Pick<CalendarEventEntry, "title" | "description" | "startDate" | "endDate"> & {
    id: string | null;
  };
  currentUserId: string;
  role: string;
  eventOwnerId?: string;
  onSaved: () => void;
};

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
      const res = await fetch(
        isEdit ? `/api/calendar-events/${initial.id}` : "/api/calendar-events",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save");
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
      const res = await fetch(`/api/calendar-events/${initial.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete");
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="w-full max-w-md rounded-xl border border-lab-border bg-lab-surface p-6 shadow-xl space-y-4"
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
          <span className="text-slate-400">Logs</span>.
        </p>
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
        <div className="grid grid-cols-2 gap-3">
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
        <div className="flex flex-wrap gap-2 justify-end pt-2">
          {canDelete ? (
            <button
              type="button"
              onClick={remove}
              disabled={loading}
              className="px-3 py-2 text-sm text-red-300 border border-red-900/50 hover:bg-red-950/40 rounded-lg mr-auto"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 border border-lab-border rounded-lg hover:bg-lab-border/30"
          >
            Cancel
          </button>
          {!readOnly ? (
            <button
              type="button"
              onClick={save}
              disabled={loading || !title.trim()}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
