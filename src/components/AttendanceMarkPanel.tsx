"use client";

import { format } from "date-fns";
import { CalendarCheck2, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-600/[0.06] via-card to-violet-600/[0.07] p-5 shadow-md dark:from-teal-950/35 dark:via-card/90 dark:to-violet-950/35 dark:shadow-lg dark:shadow-teal-950/20 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-teal-400/15 blur-2xl dark:bg-teal-400/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl dark:bg-violet-500/20"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25">
            <CalendarCheck2 className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Mark lab day</h2>
              <Sparkles className="h-4 w-4 text-amber-400 dark:text-amber-300/90" aria-hidden />
            </div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Record that you were in lab on a given day—separate from writing a log entry. Your dot in the team grid
              lights up in your color.
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex flex-col gap-4 rounded-xl border border-border/60 bg-background/40 p-4 backdrop-blur-sm dark:bg-black/20 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 space-y-1.5">
          <label className="field-label" htmlFor="attendance-date">
            Date
          </label>
          <input
            id="attendance-date"
            type="date"
            className="w-full max-w-[12rem] rounded-lg border border-cyan-500/20 bg-background/80 sm:w-auto dark:border-cyan-500/25"
            value={date}
            max={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className={cn(
              "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/25 hover:from-teal-500 hover:to-cyan-500 dark:from-teal-500 dark:to-cyan-500",
              (loading || isMarked) && "opacity-80"
            )}
            onClick={markPresent}
            disabled={loading || isMarked}
          >
            {loading ? "Saving…" : isMarked ? "Already marked" : "Mark present"}
          </Button>
          {isMarked ? (
            <Button
              type="button"
              variant="outline"
              className="border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-200"
              onClick={clearDay}
              disabled={removing}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5 opacity-80" aria-hidden />
              {removing ? "Removing…" : "Remove this day"}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="relative mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
