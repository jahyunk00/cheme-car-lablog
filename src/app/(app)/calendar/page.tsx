import { listAllCalendarEvents, listAllLogs, listDirectoryUsers } from "@/lib/db";
import { getSession } from "@/lib/session";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) return null;

  const [logs, events, directory] = await Promise.all([
    listAllLogs(),
    listAllCalendarEvents(),
    listDirectoryUsers(),
  ]);
  const nameById = Object.fromEntries(directory.map((u) => [u.id, u.name]));
  const slim = logs.map((l) => ({ id: l.id, date: l.date, title: l.title, userId: l.userId }));
  const logDetails = logs.map((l) => ({
    id: l.id,
    date: l.date,
    title: l.title,
    userName: nameById[l.userId] ?? l.userId,
    description: l.description,
    tags: l.tags,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Calendar</h1>
        <p className="text-slate-400 mt-1 text-sm">
          <span className="text-emerald-400/90">Green</span> blocks are scheduled events (click to edit).{" "}
          <span className="text-blue-300/90">Blue</span> shows how many lab logs that day (click to open the full Logs
          view). <strong className="text-slate-300">Click a day</strong> on the month grid or the small calendar to see
          what was logged that day. Use <strong className="text-slate-300">+ Event</strong> to schedule on the grid.
        </p>
      </div>
      <CalendarClient
        logs={slim}
        logDetails={logDetails}
        events={events}
        currentUserId={session.sub}
        role={session.role}
      />
    </div>
  );
}
