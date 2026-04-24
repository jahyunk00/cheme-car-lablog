import { listAllLogs } from "@/lib/db";
import dynamic from "next/dynamic";

const LabCalendar = dynamic(() => import("@/components/LabCalendar").then((m) => m.LabCalendar), {
  ssr: false,
  loading: () => <p className="text-slate-500 text-sm">Loading calendar…</p>,
});

export default async function CalendarPage() {
  const logs = await listAllLogs();
  const slim = logs.map((l) => ({ id: l.id, date: l.date, title: l.title, userId: l.userId }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Month and week views; days with logs are highlighted. Click a day to add or review logs.
        </p>
      </div>
      <LabCalendar logs={slim} />
    </div>
  );
}
