"use client";

import { format } from "date-fns";
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
    <div className="rounded-xl border border-border bg-card/60 p-4 sm:p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Mark lab day</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record that you were in lab on a given day. This is separate from writing a log entry.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <label className="field-label" htmlFor="attendance-date">
            Date
          </label>
          <input
            id="attendance-date"
            type="date"
            className="w-full sm:w-auto"
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
              {removing ? "Removing…" : "Remove for this day"}
            </Button>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
