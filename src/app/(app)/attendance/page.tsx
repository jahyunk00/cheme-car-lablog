import { format, subDays } from "date-fns";
import { redirect } from "next/navigation";

import { AttendanceMarkPanel } from "@/components/AttendanceMarkPanel";
import { AttendanceTeamGrid } from "@/components/AttendanceTeamGrid";
import {
  listAttendanceBetweenSafe,
  listAttendanceForUserSafe,
  listDirectoryUsers,
} from "@/lib/db";
import { canViewTeamMetrics } from "@/lib/roles";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const chipPalette = [
  "border-border bg-muted/50 text-foreground",
  "border-border bg-muted/40 text-foreground",
  "border-border bg-muted/35 text-foreground",
  "border-border bg-muted/45 text-foreground",
] as const;

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");
  const from = format(subDays(new Date(), 89), "yyyy-MM-dd");
  const teamFrom = format(subDays(new Date(), 13), "yyyy-MM-dd");

  const myEntries = await listAttendanceForUserSafe(session.sub, from, today);
  const markedDates = myEntries.map((e) => e.attendedDate);

  const showTeam = canViewTeamMetrics(session.role);
  const directory = showTeam ? await listDirectoryUsers() : [];
  const teamEntries = showTeam ? await listAttendanceBetweenSafe(teamFrom, today) : [];

  const dayLabels: string[] = [];
  for (let i = 0; i < 14; i++) {
    dayLabels.push(format(subDays(new Date(), 13 - i), "yyyy-MM-dd"));
  }

  const teamPresence = teamEntries.map((e) => ({
    userId: e.userId,
    attendedDate: e.attendedDate,
  }));

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Presence</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Lab check-in</h1>
        <p className="mt-3 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Mark the days you were physically in lab.{" "}
          {showTeam
            ? "As board or admin you can review team attendance in the table below."
            : "Board and admins see the team table below."}
        </p>
      </div>

      <AttendanceMarkPanel defaultDate={today} markedDates={markedDates} />

      <section className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Your last 90 days</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {myEntries.length === 0
            ? "No check-ins in this window yet—use “Mark present” above."
            : `${myEntries.length} day${myEntries.length === 1 ? "" : "s"} on the books.`}
        </p>
        {myEntries.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
            {myEntries.slice(0, 40).map((e, i) => (
              <li
                key={e.id}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-medium shadow-sm backdrop-blur-sm",
                  chipPalette[i % chipPalette.length]
                )}
              >
                {e.attendedDate}
              </li>
            ))}
            {myEntries.length > 40 ? (
              <li className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-muted-foreground">
                + {myEntries.length - 40} more
              </li>
            ) : null}
          </ul>
        ) : null}
      </section>

      {showTeam ? (
        <AttendanceTeamGrid
          users={directory.map((u) => ({ id: u.id, name: u.name, avatarId: u.avatarId }))}
          entries={teamPresence}
          dayLabels={dayLabels}
          today={today}
        />
      ) : null}
    </div>
  );
}
