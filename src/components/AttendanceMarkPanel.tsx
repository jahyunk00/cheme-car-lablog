"use client";

import { format } from "date-fns";
import { CalendarCheck2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function AttendanceMarkPanel({
  defaultDate,
  markedDates,
}: {
  defaultDate: string;
  /** Dates (YYYY-MM-DD) the user already marked in the loaded window. */
  markedDates: string[];
}) {
  const router = useRouter();
  const marked = new Set(markedDates);
  const [date, setDate] = useState(defaultDate);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isMarked = marked.has(date);

  async function markPresent() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ date }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : `Could not save (${res.status}).`);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function clearDay() {
    setError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/attendance?date=${encodeURIComponent(date)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : `Could not remove (${res.status}).`);
        return;
      }
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
            <CalendarCheck2 className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mark lab day</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Record that you were in lab on a given day. This is separate from writing a log entry.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-background/60 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 space-y-1.5">
          <label className="field-label" htmlFor="attendance-date">
            Date
          </label>
          <input
            id="attendance-date"
            type="date"
            className="w-full max-w-[12rem] sm:w-auto"
            value={date}
            max={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={markPresent} disabled={loading || isMarked}>
            {loading ? "Saving…" : isMarked ? "Already marked" : "Mark present"}
          </Button>
          {isMarked ? (
            <Button type="button" variant="outline" onClick={clearDay} disabled={removing}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5 opacity-70" aria-hidden />
              {removing ? "Removing…" : "Remove this day"}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
