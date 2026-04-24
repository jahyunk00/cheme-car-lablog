"use client";

import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { addDays, format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export type CalendarLog = {
  id: string;
  date: string;
  title: string;
  userId: string;
};

export type CalendarScheduledSlim = {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
};

export function LabCalendar({
  logs,
  scheduledEvents,
  onPickDateForEvent,
  onDayClick,
  onEditScheduledEvent,
}: {
  logs: CalendarLog[];
  scheduledEvents: CalendarScheduledSlim[];
  onPickDateForEvent: (dateStr: string) => void;
  /** Fired when the user clicks a day cell (opens day summary with logs). */
  onDayClick: (dateStr: string) => void;
  onEditScheduledEvent: (eventId: string) => void;
}) {
  const router = useRouter();

  const fcEvents: EventInput[] = useMemo(() => {
    const scheduled: EventInput[] = scheduledEvents.map((e) => {
      const single = !e.endDate || e.endDate === e.startDate;
      const endExclusive =
        !single && e.endDate
          ? format(addDays(parseISO(`${e.endDate}T12:00:00`), 1), "yyyy-MM-dd")
          : undefined;
      return {
        id: `cal-${e.id}`,
        title: e.title,
        start: e.startDate,
        end: endExclusive,
        allDay: true,
        backgroundColor: "rgba(5, 150, 105, 0.45)",
        borderColor: "#34d399",
        textColor: "#ecfdf5",
        extendedProps: { kind: "event" as const, eventId: e.id },
      };
    });

    const byDay: Record<string, { titles: string[]; ids: string[] }> = {};
    for (const log of logs) {
      if (!byDay[log.date]) byDay[log.date] = { titles: [], ids: [] };
      byDay[log.date].titles.push(log.title);
      byDay[log.date].ids.push(log.id);
    }
    const logBlocks: EventInput[] = Object.entries(byDay).map(([date, v]) => ({
      id: `logs-${date}`,
      title: `${v.titles.length} log${v.titles.length === 1 ? "" : "s"}`,
      start: date,
      allDay: true,
      backgroundColor: "rgba(59, 130, 246, 0.35)",
      borderColor: "#3b82f6",
      textColor: "#e0f2fe",
      extendedProps: { kind: "logs" as const, logIds: v.ids },
    }));

    return [...scheduled, ...logBlocks];
  }, [logs, scheduledEvents]);

  const dayCellClassNames = useCallback(
    (arg: { date: Date }) => {
      const y = arg.date.getFullYear();
      const m = String(arg.date.getMonth() + 1).padStart(2, "0");
      const d = String(arg.date.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const hasLog = logs.some((l) => l.date === key);
      const hasEvent = scheduledEvents.some((e) => {
        if (!e.endDate || e.endDate === e.startDate) return e.startDate === key;
        return key >= e.startDate && key <= e.endDate;
      });
      const classes: string[] = [];
      if (hasLog) classes.push("has-logs");
      if (hasEvent) classes.push("has-events");
      return classes;
    },
    [logs, scheduledEvents]
  );

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
        .lab-calendar .fc-daygrid-day.has-events .fc-daygrid-day-number {
          text-decoration: underline;
          text-decoration-color: #34d399;
          text-underline-offset: 3px;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={fcEvents}
        dayCellClassNames={dayCellClassNames}
        customButtons={{
          addEvent: {
            text: "+ Event",
            hint: "Add a scheduled calendar event",
            click: () => onPickDateForEvent(format(new Date(), "yyyy-MM-dd")),
          },
        }}
        dateClick={(info) => {
          info.jsEvent.preventDefault();
          onDayClick(info.dateStr);
        }}
        eventClick={(info) => {
          const kind = info.event.extendedProps?.kind as string | undefined;
          if (kind === "event") {
            info.jsEvent.preventDefault();
            onEditScheduledEvent(info.event.extendedProps.eventId as string);
            return;
          }
          info.jsEvent.preventDefault();
          const d = info.event.startStr.slice(0, 10);
          router.push(`/logs?date=${d}`);
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "addEvent dayGridMonth,dayGridWeek",
        }}
      />
    </div>
  );
}
