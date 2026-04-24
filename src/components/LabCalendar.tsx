"use client";

import "@fullcalendar/core/index.css";
import "@fullcalendar/daygrid/index.css";

import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export type CalendarLog = {
  id: string;
  date: string;
  title: string;
  userId: string;
};

export function LabCalendar({ logs }: { logs: CalendarLog[] }) {
  const router = useRouter();

  const events: EventInput[] = useMemo(() => {
    const byDay: Record<string, { titles: string[]; ids: string[] }> = {};
    for (const log of logs) {
      if (!byDay[log.date]) byDay[log.date] = { titles: [], ids: [] };
      byDay[log.date].titles.push(log.title);
      byDay[log.date].ids.push(log.id);
    }
    return Object.entries(byDay).map(([date, v]) => ({
      id: date,
      title: `${v.titles.length} log${v.titles.length === 1 ? "" : "s"}`,
      start: date,
      allDay: true,
      extendedProps: { logIds: v.ids },
    }));
  }, [logs]);

  const dayCellClassNames = useCallback((arg: { date: Date }) => {
    const y = arg.date.getFullYear();
    const m = String(arg.date.getMonth() + 1).padStart(2, "0");
    const d = String(arg.date.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    return logs.some((l) => l.date === key) ? ["has-logs"] : [];
  }, [logs]);

  return (
    <div className="lab-calendar rounded-xl border border-lab-border bg-lab-surface p-3">
      <style jsx global>{`
        .lab-calendar .fc {
          --fc-border-color: #2d3a4d;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #1a2332;
          --fc-today-bg-color: rgba(59, 130, 246, 0.12);
          --fc-button-bg-color: #1e293b;
          --fc-button-border-color: #334155;
          --fc-button-text-color: #e2e8f0;
          --fc-button-hover-bg-color: #334155;
          --fc-button-hover-border-color: #475569;
        }
        .lab-calendar .fc .fc-toolbar-title {
          color: #f8fafc;
          font-size: 1.1rem;
        }
        .lab-calendar .fc-daygrid-day.has-logs .fc-daygrid-day-number {
          color: #60a5fa;
          font-weight: 600;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        dayCellClassNames={dayCellClassNames}
        dateClick={(info) => {
          const y = info.date.getFullYear();
          const m = String(info.date.getMonth() + 1).padStart(2, "0");
          const d = String(info.date.getDate()).padStart(2, "0");
          router.push(`/logs?date=${y}-${m}-${d}`);
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
      />
    </div>
  );
}
