"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DaySummaryDialog, type DayLogRow } from "@/components/DaySummaryDialog";
import { EventModal } from "@/components/EventModal";
import type { CalendarLog, CalendarScheduledSlim } from "@/components/LabCalendar";
import type { CalendarEventEntry } from "@/lib/types";

const LabCalendar = dynamic(() => import("@/components/LabCalendar").then((m) => m.LabCalendar), {
  ssr: false,
  loading: () => <p className="text-slate-500 text-sm">Loading calendar…</p>,
});

function freshDraft() {
  return {
    id: null as string | null,
    title: "",
    description: "",
    startDate: "",
    endDate: null as string | null,
  };
}

export function CalendarClient({
  logs,
  logDetails,
  events,
  currentUserId,
  role,
}: {
  logs: CalendarLog[];
  logDetails: (DayLogRow & { date: string })[];
  events: CalendarEventEntry[];
  currentUserId: string;
  role: string;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(freshDraft);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryDateStr, setSummaryDateStr] = useState<string | null>(null);

  const scheduled: CalendarScheduledSlim[] = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        userId: e.userId,
        title: e.title,
        description: e.description,
        startDate: e.startDate,
        endDate: e.endDate,
      })),
    [events]
  );

  const openNew = useCallback((dateStr: string) => {
    setDraft({
      id: null,
      title: "",
      description: "",
      startDate: dateStr,
      endDate: null,
    });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback(
    (id: string) => {
      const e = events.find((x) => x.id === id);
      if (!e) return;
      setDraft({
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.startDate,
        endDate: e.endDate,
      });
      setModalOpen(true);
    },
    [events]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setDraft(freshDraft());
  }, []);

  const onSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  const editingOwner = events.find((e) => e.id === draft.id)?.userId;

  const openDaySummary = useCallback((dateStr: string) => {
    setSummaryDateStr(dateStr);
    setSummaryOpen(true);
  }, []);

  const logsForSummary: DayLogRow[] = useMemo(() => {
    if (!summaryDateStr) return [];
    return logDetails
      .filter((l) => l.date === summaryDateStr)
      .map((l) => ({
        id: l.id,
        title: l.title,
        userName: l.userName,
        description: l.description,
        tags: l.tags,
        category: l.category,
      }));
  }, [logDetails, summaryDateStr]);

  const closeSummary = useCallback(() => {
    setSummaryOpen(false);
    setSummaryDateStr(null);
  }, []);

  const addEventFromSummary = useCallback(() => {
    if (!summaryDateStr) return;
    closeSummary();
    openNew(summaryDateStr);
  }, [closeSummary, openNew, summaryDateStr]);

  return (
    <>
      <div className="space-y-4">
        <LabCalendar
          logs={logs}
          scheduledEvents={scheduled}
          onPickDateForEvent={openNew}
          onDayClick={openDaySummary}
          onEditScheduledEvent={openEdit}
        />
      </div>
      <DaySummaryDialog
        open={summaryOpen}
        dateStr={summaryDateStr}
        logs={logsForSummary}
        onClose={closeSummary}
        onAddEvent={addEventFromSummary}
      />
      <EventModal
        open={modalOpen}
        onClose={closeModal}
        initial={{
          id: draft.id,
          title: draft.title,
          description: draft.description,
          startDate: draft.startDate || new Date().toISOString().slice(0, 10),
          endDate: draft.endDate,
        }}
        currentUserId={currentUserId}
        role={role}
        eventOwnerId={editingOwner}
        onSaved={onSaved}
      />
    </>
  );
}
