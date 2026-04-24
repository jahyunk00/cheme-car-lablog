import { format, parseISO } from "date-fns";

import type { AttendanceEntry, CalendarEventEntry, LogEntry } from "./types";

export function formatWeekRangeTitle(startStr: string, endStr: string): string {
  const a = parseISO(`${startStr}T12:00:00`);
  const b = parseISO(`${endStr}T12:00:00`);
  if (format(a, "yyyy-MM") === format(b, "yyyy-MM")) {
    return `${format(a, "MMMM d")}–${format(b, "d, yyyy")}`;
  }
  return `${format(a, "MMMM d, yyyy")} – ${format(b, "MMMM d, yyyy")}`;
}

function eventTouchesWeek(e: CalendarEventEntry, weekStart: string, weekEnd: string): boolean {
  const eEnd = e.endDate ?? e.startDate;
  return e.startDate <= weekEnd && eEnd >= weekStart;
}

/**
 * Plain-text narrative for admins: what happened in the lab week and who contributed.
 * Built from logs, optional calendar events and attendance (no external AI).
 */
export function buildWeeklyNarrativeReport(options: {
  weekStart: string;
  weekEnd: string;
  logs: LogEntry[];
  nameById: Record<string, string>;
  events: CalendarEventEntry[];
  attendance: AttendanceEntry[];
}): string {
  const { weekStart, weekEnd, logs, nameById, events, attendance } = options;
  const title = formatWeekRangeTitle(weekStart, weekEnd);
  const lines: string[] = [];

  lines.push(`WEEKLY LAB REPORT: ${title}`);
  lines.push(`Reporting window: ${weekStart} through ${weekEnd} (inclusive).`);
  lines.push("");

  const sortedLogs = [...logs].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );

  const contributorIds = new Set(sortedLogs.map((l) => l.userId));
  const totalHours = sortedLogs.reduce((s, l) => s + (l.hours != null && Number.isFinite(l.hours) ? l.hours : 0), 0);

  lines.push("SUMMARY");
  if (sortedLogs.length === 0) {
    lines.push(
      "No lab log entries were recorded for this week in LabLog. If work happened off-system, consider backfilling logs for the record."
    );
  } else {
    lines.push(
      `The team filed ${sortedLogs.length} log ${sortedLogs.length === 1 ? "entry" : "entries"} across ${contributorIds.size} contributor${contributorIds.size === 1 ? "" : "s"}.` +
        (totalHours > 0
          ? ` Reported time on logs totals about ${totalHours.toFixed(1)} hours (sum of hours fields where provided).`
          : "")
    );
  }
  lines.push("");

  if (sortedLogs.length > 0) {
    lines.push("CONTRIBUTIONS BY TEAMMATE");
    const byUser = new Map<string, LogEntry[]>();
    for (const log of sortedLogs) {
      if (!byUser.has(log.userId)) byUser.set(log.userId, []);
      byUser.get(log.userId)!.push(log);
    }
    const sortedUsers = [...contributorIds].sort(
      (a, b) => (byUser.get(b)?.length ?? 0) - (byUser.get(a)?.length ?? 0)
    );
    for (const uid of sortedUsers) {
      const name = nameById[uid] ?? uid;
      const userLogs = byUser.get(uid) ?? [];
      const hours = userLogs.reduce((s, l) => s + (l.hours != null && Number.isFinite(l.hours) ? l.hours : 0), 0);
      lines.push(`• ${name} — ${userLogs.length} log${userLogs.length === 1 ? "" : "s"}` + (hours > 0 ? `, ~${hours.toFixed(1)}h logged` : ""));
      const titles = userLogs.map((l) => `  – ${l.date} [${l.category}] ${l.title}`);
      const max = 14;
      lines.push(...titles.slice(0, max));
      if (titles.length > max) {
        lines.push(`  …and ${titles.length - max} more entr${titles.length - max === 1 ? "y" : "ies"}.`);
      }
      lines.push("");
    }
  }

  const tagCounts: Record<string, number> = {};
  for (const log of sortedLogs) {
    for (const t of log.tags) {
      const k = t.trim().toLowerCase();
      if (!k) continue;
      tagCounts[k] = (tagCounts[k] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  if (topTags.length > 0) {
    lines.push("TAGS & THEMES");
    lines.push(
      "Frequent tags on logs this week suggest where attention went: " +
        topTags.map(([t, n]) => `"${t}" (${n})`).join(", ") +
        "."
    );
    lines.push("");
  }

  const weekEvents = events.filter((e) => eventTouchesWeek(e, weekStart, weekEnd));
  if (weekEvents.length > 0) {
    lines.push("CALENDAR & DEADLINES (touching this week)");
    for (const e of weekEvents.slice(0, 20)) {
      const owner = nameById[e.userId] ?? "Teammate";
      const span = e.endDate && e.endDate !== e.startDate ? `${e.startDate} → ${e.endDate}` : e.startDate;
      const status = e.completedAt ? "completed" : "open";
      lines.push(`• ${e.title} (${span}, ${status}) — scheduled by ${owner}`);
      if (e.description?.trim()) {
        const short = e.description.trim().slice(0, 160);
        lines.push(`  ${short}${e.description.trim().length > 160 ? "…" : ""}`);
      }
    }
    if (weekEvents.length > 20) {
      lines.push(`…and ${weekEvents.length - 20} additional calendar item(s) overlap this week.`);
    }
    lines.push("");
  }

  if (attendance.length > 0) {
    lines.push("LAB CHECK-INS");
    const byAtt = new Map<string, Set<string>>();
    for (const a of attendance) {
      if (a.attendedDate < weekStart || a.attendedDate > weekEnd) continue;
      if (!byAtt.has(a.userId)) byAtt.set(a.userId, new Set());
      byAtt.get(a.userId)!.add(a.attendedDate);
    }
    const rows = [...byAtt.entries()].sort((a, b) => b[1].size - a[1].size);
    for (const [uid, days] of rows) {
      const name = nameById[uid] ?? uid;
      lines.push(`• ${name} marked present on ${days.size} day${days.size === 1 ? "" : "s"} this week.`);
    }
    lines.push("");
  }

  lines.push("—");
  lines.push("Generated in LabLog from team logs and related records. It is not legal advice or a formal lab notebook export.");

  return lines.join("\n");
}
