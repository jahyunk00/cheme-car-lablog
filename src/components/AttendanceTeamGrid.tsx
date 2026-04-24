import { format, getDay, parseISO } from "date-fns";

import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export type TeamGridUser = { id: string; name: string; avatarId: number };
export type TeamGridEntry = { userId: string; attendedDate: string };

function isWeekend(isoDate: string): boolean {
  const d = getDay(parseISO(isoDate));
  return d === 0 || d === 6;
}

export function AttendanceTeamGrid({
  users,
  entries,
  dayLabels,
  today,
}: {
  users: TeamGridUser[];
  entries: TeamGridEntry[];
  dayLabels: string[];
  today: string;
}) {
  const presentByUser = new Map<string, Set<string>>();
  for (const e of entries) {
    if (!presentByUser.has(e.userId)) presentByUser.set(e.userId, new Set());
    presentByUser.get(e.userId)!.add(e.attendedDate);
  }

  const distinctDays = new Set(entries.map((e) => e.attendedDate)).size;
  const totalCheckIns = entries.length;

  return (
    <section className="rounded-2xl border border-border bg-card/50 p-4 font-sans antialiased sm:p-6">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" aria-hidden />
            Team attendance · 14 days
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Who was in lab?
          </h2>
          <p className="mt-1 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Weekends use a slightly stronger gray tint. Today’s column is outlined. Check-ins use the same accent as
            the rest of the app.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs sm:justify-end">
          <span className="rounded-lg border border-border bg-muted/30 px-3 py-2 font-medium text-foreground">
            {totalCheckIns} check-in{totalCheckIns === 1 ? "" : "s"}
          </span>
          <span className="rounded-lg border border-border bg-muted/30 px-3 py-2 font-medium text-foreground">
            {distinctDays} active day{distinctDays === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background/50">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <caption className="sr-only">
            Team attendance for the last fourteen days; columns are calendar days, rows are lab members.
          </caption>
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th
                scope="col"
                className="sticky left-0 z-20 border-b border-border bg-background/95 py-3 pl-3 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm sm:pl-4"
              >
                Teammate
              </th>
              {dayLabels.map((d) => {
                const weekend = isWeekend(d);
                const isToday = d === today;
                const dow = format(parseISO(d), "EEE");
                return (
                  <th
                    key={d}
                    scope="col"
                    className={cn(
                      "border-b border-border px-0.5 py-2.5 text-center align-bottom text-[10px] font-semibold leading-tight",
                      weekend ? "bg-muted/50 text-foreground" : "text-muted-foreground",
                      isToday && "bg-accent/40 text-foreground ring-1 ring-inset ring-border"
                    )}
                  >
                    <span className="sr-only">{d}</span>
                    <span aria-hidden className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {dow}
                      </span>
                      <span className="text-[11px] text-foreground">{d.slice(5, 7)}.{d.slice(8, 10)}</span>
                      {isToday ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-primary-foreground">
                          today
                        </span>
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {users.map((u, rowIdx) => {
              const set = presentByUser.get(u.id) ?? new Set();
              const n = set.size;
              return (
                <tr
                  key={u.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/25",
                    rowIdx % 2 === 1 && "bg-muted/10"
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 whitespace-nowrap border-r border-border bg-background/95 py-3 pl-3 pr-3 text-left font-normal backdrop-blur-sm sm:pl-4"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="rounded-full ring-1 ring-border">
                        <UserAvatar avatarId={u.avatarId} size={30} title={u.name} />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate font-semibold text-foreground">{u.name}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {n} day{n === 1 ? "" : "s"} in window
                        </span>
                      </span>
                      {n > 0 ? (
                        <span className="ml-1 hidden shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                          {n}/14
                        </span>
                      ) : null}
                    </span>
                  </th>
                  {dayLabels.map((d) => {
                    const on = set.has(d);
                    const weekend = isWeekend(d);
                    const isToday = d === today;
                    return (
                      <td
                        key={d}
                        className={cn(
                          "border-b border-border p-1 text-center align-middle",
                          weekend && "bg-muted/25",
                          isToday && "bg-accent/25",
                          on && "bg-primary/10"
                        )}
                      >
                        <div className="flex min-h-[2.75rem] items-center justify-center">
                          {on ? (
                            <span
                              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold leading-none text-primary-foreground ring-1 ring-border"
                              title={`${u.name} — in lab ${d}`}
                            >
                              <span className="sr-only">Present on {d}</span>
                              <span aria-hidden>✓</span>
                            </span>
                          ) : (
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-[11px] text-muted-foreground/40"
                              title={`No check-in — ${d}`}
                              aria-label={`No check-in on ${d}`}
                            >
                              ·
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              ✓
            </span>
            In lab
          </span>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground/40">
              ·
            </span>
            No mark
          </span>
        </div>
        <p className="text-[11px] leading-snug sm:text-right">Hover a cell for the exact date.</p>
      </div>
    </section>
  );
}
