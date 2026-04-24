"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type LogPayload = {
  id?: string;
  date: string;
  title: string;
  description: string;
  tags: string;
  hours: string;
};

export function LogForm({
  initial,
  onDone,
}: {
  initial: LogPayload;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initial.date);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.tags);
  const [hours, setHours] = useState(initial.hours);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const hoursNum = hours.trim() === "" ? null : Number(hours);
      if (hours.trim() !== "" && (Number.isNaN(hoursNum) || hoursNum! < 0)) {
        setError("Hours must be a non-negative number.");
        return;
      }

      const body = {
        date,
        title,
        description,
        tags: tagList,
        hours: hoursNum,
      };

      const isEdit = Boolean(initial.id);
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
      <div className="space-y-1">
        <label className="field-label">Tags (comma-separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="battery, testing, design"
          className="w-full"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
        {loading ? "Saving…" : "Save log"}
      </button>
    </form>
  );
}
