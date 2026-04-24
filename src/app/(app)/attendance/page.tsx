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
  "border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 text-emerald-950 dark:border-emerald-400/30 dark:from-emerald-500/20 dark:to-transparent dark:text-emerald-50",
  "border-sky-500/40 bg-gradient-to-br from-sky-500/20 to-sky-600/5 text-sky-950 dark:border-sky-400/30 dark:from-sky-500/20 dark:to-transparent dark:text-sky-50",
  "border-violet-500/40 bg-gradient-to-br from-violet-500/20 to-fuchsia-600/5 text-violet-950 dark:border-violet-400/30 dark:from-violet-500/20 dark:to-transparent dark:text-violet-50",
  "border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-orange-600/5 text-amber-950 dark:border-amber-400/30 dark:from-amber-500/15 dark:to-transparent dark:text-amber-50",
  "border-rose-500/40 bg-gradient-to-br from-rose-500/15 to-pink-600/5 text-rose-950 dark:border-rose-400/30 dark:from-rose-500/15 dark:to-transparent dark:text-rose-50",
  "border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-teal-600/5 text-cyan-950 dark:border-cyan-400/30 dark:from-cyan-500/20 dark:to-transparent dark:text-cyan-50",
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
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-violet-600/[0.07] via-background to-cyan-600/[0.08] p-6 shadow-md sm:p-8 dark:from-violet-950/50 dark:via-card dark:to-teal-950/40 dark:shadow-lg dark:shadow-violet-950/20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20"
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-teal-300/90">
          Presence
        </p>
        <h1 className="relative mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-violet-700 via-foreground to-cyan-700 bg-clip-text text-transparent dark:from-violet-200 dark:via-white dark:to-cyan-200">
            Lab check-in
          </span>
        </h1>
        <p className="relative mt-3 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Mark the days you were physically in lab. The team grid uses bright, per-person colors for check-ins.{" "}
          {showTeam
            ? "As board or admin you see the whole lab at a glance."
            : "Board and admins see the team strip below."}
        </p>
      </div>

      <AttendanceMarkPanel defaultDate={today} markedDates={markedDates} />

      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 sm:p-6">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
        />
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
