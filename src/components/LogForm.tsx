"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOG_CATEGORIES, type LogCategory } from "@/lib/log-categories";

export type LogPayload = {
  id?: string;
  date: string;
  category: LogCategory;
  title: string;
  description: string;
  hours: string;
};

export function LogForm({
  initial,
  onDone,
  isAdmin = false,
}: {
  initial: LogPayload;
  onDone?: () => void;
  /** When true, editing shows a Delete log control (API allows delete for admins only). */
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initial.date);
  const [category, setCategory] = useState<LogCategory>(initial.category);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [hours, setHours] = useState(initial.hours);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const hoursNum = hours.trim() === "" ? null : Number(hours);
      if (hours.trim() !== "" && (Number.isNaN(hoursNum) || hoursNum! < 0)) {
        setError("Hours must be a non-negative number.");
        return;
      }

      const isEdit = Boolean(initial.id);
      const body = { date, category, title, description, hours: hoursNum };
      const res = await fetch(isEdit ? `/api/logs/${initial.id}` : "/api/logs", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save log");
        return;
      }
      onDone?.();
      router.push("/logs");
    } finally {
      setLoading(false);
    }
  }

  async function removeLog() {
    if (!initial.id || !isAdmin) return;
    if (!confirm("Permanently delete this log? This cannot be undone.")) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/logs/${initial.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not delete log");
        return;
      }
      onDone?.();
      router.push("/logs");
    } finally {
      setDeleting(false);
    }
  }

  const showDelete = Boolean(isAdmin && initial.id);

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-medium text-foreground">{initial.id ? "Edit log" : "New log"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="field-label">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full" />
        </div>
        <div className="space-y-1">
          <label className="field-label">Hours (optional)</label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 2.5"
            className="w-full"
          />
        </div>
      </div>
      <div className="space-y-1">
        <span className="field-label">Log for</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full justify-between border-input bg-background px-3 py-2 font-normal text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              <span className="truncate">{category}</span>
              <ChevronDown className="ms-2 size-4 shrink-0 opacity-60" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuLabel>Subsystem</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={category}
              onValueChange={(v) => setCategory(v as LogCategory)}
            >
              {LOG_CATEGORIES.map((c) => (
                <DropdownMenuRadioItem key={c} value={c}>
                  {c}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-xs text-muted-foreground">Which subsystem this entry is about.</p>
      </div>
      <div className="space-y-1">
        <label className="field-label">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full" />
      </div>
      <div className="space-y-1">
        <label className="field-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full resize-y min-h-[100px]"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading || deleting} className="btn-primary px-4 py-2">
          {loading ? "Saving…" : "Save log"}
        </button>
        {showDelete ? (
          <Button
            type="button"
            variant="destructive"
            disabled={loading || deleting}
            onClick={() => void removeLog()}
          >
            {deleting ? "Deleting…" : "Delete log"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
