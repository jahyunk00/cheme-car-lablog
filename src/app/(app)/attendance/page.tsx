import { format, subDays } from "date-fns";
import { redirect } from "next/navigation";

import { AttendanceMarkPanel } from "@/components/AttendanceMarkPanel";
import { UserAvatar } from "@/components/UserAvatar";
import { listAttendanceBetween, listAttendanceForUser, listDirectoryUsers } from "@/lib/db";
import { canViewTeamMetrics } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");
  const from = format(subDays(new Date(), 89), "yyyy-MM-dd");
  const teamFrom = format(subDays(new Date(), 13), "yyyy-MM-dd");

  const myEntries = await listAttendanceForUser(session.sub, from, today);
  const markedDates = myEntries.map((e) => e.attendedDate);

  const showTeam = canViewTeamMetrics(session.role);
  const directory = showTeam ? await listDirectoryUsers() : [];
  const teamEntries = showTeam ? await listAttendanceBetween(teamFrom, today) : [];
  const presentByUser = new Map<string, Set<string>>();
  for (const e of teamEntries) {
    if (!presentByUser.has(e.userId)) presentByUser.set(e.userId, new Set());
    presentByUser.get(e.userId)!.add(e.attendedDate);
  }

  const dayLabels: string[] = [];
  for (let i = 0; i < 14; i++) {
    dayLabels.push(format(subDays(new Date(), 13 - i), "yyyy-MM-dd"));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Lab check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-prose text-pretty">
          Mark the days you are physically in lab.{" "}
          {showTeam
            ? "As a board member or admin you can see everyone’s recent check-ins below."
            : "Only board members and admins can see team-wide attendance and other lab metrics."}
        </p>
      </div>

      <AttendanceMarkPanel defaultDate={today} markedDates={markedDates} />

      <section className="rounded-xl border border-border bg-card/40 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-foreground">Your last 90 days</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {myEntries.length === 0
            ? "No check-ins recorded in this window yet."
            : `${myEntries.length} day${myEntries.length === 1 ? "" : "s"} marked.`}
        </p>
        {myEntries.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {myEntries.slice(0, 40).map((e) => (
              <li
                key={e.id}
                className="rounded-md border border-border bg-muted/50 px-2 py-1 text-foreground"
              >
                {e.attendedDate}
              </li>
            ))}
            {myEntries.length > 40 ? (
              <li className="text-muted-foreground px-1 py-1">+ {myEntries.length - 40} more</li>
            ) : null}
          </ul>
        ) : null}
      </section>

      {showTeam ? (
        <section className="rounded-xl border border-border bg-card/40 p-4 sm:p-5 overflow-x-auto">
          <h2 className="text-lg font-semibold text-foreground">Team (last 14 days)</h2>
          <p className="mt-1 text-sm text-muted-foreground mb-4">
            Each cell is one calendar day. Filled means that teammate checked in for that day.
          </p>
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium text-muted-foreground">Teammate</th>
                {dayLabels.map((d) => (
                  <th key={d} className="py-2 px-0.5 text-center font-normal text-muted-foreground w-8">
                    <span className="sr-only">{d}</span>
                    <span aria-hidden className="block text-[10px] leading-tight">
                      {d.slice(5, 7)}
                      <br />
                      {d.slice(8, 10)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {directory.map((u) => {
                const set = presentByUser.get(u.id) ?? new Set();
                return (
                  <tr key={u.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <UserAvatar avatarId={u.avatarId} size={22} title={u.name} />
                        <span className="text-foreground">{u.name}</span>
                      </span>
                    </td>
                    {dayLabels.map((d) => {
                      const on = set.has(d);
                      return (
                        <td key={d} className="py-1 px-0.5 text-center">
                          <span
                            className={
                              on
                                ? "inline-block h-3 w-3 rounded-sm bg-primary"
                                : "inline-block h-3 w-3 rounded-sm bg-muted/60"
                            }
                            title={on ? `${u.name} — ${d}` : d}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
