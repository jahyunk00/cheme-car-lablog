import { format, getDay, parseISO } from "date-fns";

import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export type TeamGridUser = { id: string; name: string; avatarId: number };
export type TeamGridEntry = { userId: string; attendedDate: string };

/** Index from user id (same for all arrays below). */
function styleIndex(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  return h % 8;
}

/** Inner “orb” when present (Tailwind must see full strings). */
const PRESENT_MARKERS = [
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold leading-none text-emerald-950 shadow-[0_0_16px_rgba(52,211,153,0.55)] ring-2 ring-emerald-200/50",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-400 text-[10px] font-bold leading-none text-sky-950 shadow-[0_0_16px_rgba(56,189,248,0.55)] ring-2 ring-sky-200/50",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-400 text-[10px] font-bold leading-none text-violet-950 shadow-[0_0_16px_rgba(167,139,250,0.55)] ring-2 ring-violet-200/50",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold leading-none text-amber-950 shadow-[0_0_16px_rgba(251,191,36,0.5)] ring-2 ring-amber-100/60",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-400 text-[10px] font-bold leading-none text-rose-950 shadow-[0_0_16px_rgba(251,113,133,0.5)] ring-2 ring-rose-200/50",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold leading-none text-cyan-950 shadow-[0_0_16px_rgba(34,211,238,0.5)] ring-2 ring-cyan-100/50",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-fuchsia-400 text-[10px] font-bold leading-none text-fuchsia-950 shadow-[0_0_16px_rgba(232,121,249,0.5)] ring-2 ring-fuchsia-200/50",
  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400 text-[10px] font-bold leading-none text-lime-950 shadow-[0_0_16px_rgba(163,230,53,0.45)] ring-2 ring-lime-100/60",
] as const;

const ROW_ACCENT = [
  "border-l-emerald-500/70",
  "border-l-sky-500/70",
  "border-l-violet-500/70",
  "border-l-amber-500/70",
  "border-l-rose-500/70",
  "border-l-cyan-500/70",
  "border-l-fuchsia-500/70",
  "border-l-lime-500/70",
] as const;

const PRESENT_CELL = [
  "bg-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-sky-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-violet-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-amber-500/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-rose-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-cyan-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-fuchsia-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  "bg-lime-500/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
] as const;

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
    <section className="relative overflow-hidden rounded-2xl border border-violet-300/40 bg-gradient-to-br from-violet-100/80 via-card to-cyan-100/70 p-4 font-sans antialiased shadow-md sm:p-6 dark:border-violet-500/20 dark:from-violet-950/35 dark:via-card dark:to-cyan-950/30 dark:shadow-lg dark:shadow-violet-950/20">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl dark:bg-fuchsia-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/15"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-800 dark:border-violet-400/25 dark:bg-violet-500/10 dark:text-violet-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399] dark:bg-emerald-400" />
              Team attendance · 14 days
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Who was in lab?
            </h2>
            <p className="mt-1 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-amber-700 dark:text-amber-200/90">Weekends</span> are tinted.{" "}
              <span className="font-medium text-cyan-700 dark:text-cyan-200/90">Today</span> is highlighted. Each
              person keeps the same accent color for check-ins.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs sm:justify-end">
            <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 font-medium text-cyan-900 shadow-sm dark:text-cyan-100">
              {totalCheckIns} check-in{totalCheckIns === 1 ? "" : "s"}
            </span>
            <span className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 font-medium text-violet-900 shadow-sm dark:text-violet-100">
              {distinctDays} active day{distinctDays === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border/80 bg-muted/20 shadow-inner dark:border-white/10 dark:bg-black/30">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
            <caption className="sr-only">
              Team attendance for the last fourteen days; columns are calendar days, rows are lab members.
            </caption>
            <thead>
              <tr className="border-b border-border/60 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 dark:border-white/10 dark:from-violet-600/15 dark:to-cyan-600/15">
                <th
                  scope="col"
                  className="sticky left-0 z-20 rounded-tl-xl border-b border-border/60 bg-background/98 py-3 pl-3 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-md dark:border-white/10 dark:bg-card/98 sm:pl-4"
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
                        "border-b border-border/60 px-0.5 py-2.5 text-center align-bottom text-[10px] font-semibold leading-tight dark:border-white/10",
                        weekend
                          ? "bg-amber-500/12 text-amber-900 dark:text-amber-100/95"
                          : "text-muted-foreground",
                        isToday &&
                          "bg-gradient-to-b from-cyan-500/25 to-cyan-500/5 text-cyan-900 ring-1 ring-inset ring-cyan-400/40 dark:from-cyan-500/20 dark:to-transparent dark:text-cyan-50"
                      )}
                    >
                      <span className="sr-only">{d}</span>
                      <span aria-hidden className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 dark:text-muted-foreground/70">
                          {dow}
                        </span>
                        <span className="text-[11px] text-foreground">
                          {d.slice(5, 7)}.{d.slice(8, 10)}
                        </span>
                        {isToday ? (
                          <span className="rounded-full bg-cyan-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-cyan-950 dark:bg-cyan-400 dark:text-cyan-950">
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
                const idx = styleIndex(u.id);
                const marker = PRESENT_MARKERS[idx];
                const rowAccent = ROW_ACCENT[idx];
                const n = set.size;
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "border-b border-border/40 transition-colors hover:bg-violet-500/[0.04] dark:border-white/[0.06] dark:hover:bg-white/[0.04]",
                      rowIdx % 2 === 1 && "bg-muted/15 dark:bg-white/[0.02]",
                      "border-l-4",
                      rowAccent
                    )}
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 whitespace-nowrap border-r border-border/50 bg-background/98 py-3 pl-3 pr-3 text-left font-normal backdrop-blur-md dark:border-white/10 dark:bg-card/95 sm:pl-4"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="ring-2 ring-violet-400/25 rounded-full shadow-sm dark:ring-violet-400/20">
                          <UserAvatar avatarId={u.avatarId} size={30} title={u.name} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-semibold text-foreground">{u.name}</span>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {n} day{n === 1 ? "" : "s"} in window
                          </span>
                        </span>
                        {n > 0 ? (
                          <span className="ml-1 hidden shrink-0 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-foreground ring-1 ring-border/50 sm:inline">
                            {n}/14
                          </span>
                        ) : null}
                      </span>
                    </th>
                    {dayLabels.map((d) => {
                      const on = set.has(d);
                      const weekend = isWeekend(d);
                      const isToday = d === today;
                      const cellIdx = styleIndex(u.id);
                      return (
                        <td
                          key={d}
                          className={cn(
                            "border-b border-border/30 p-1 text-center align-middle dark:border-white/[0.05]",
                            weekend && "bg-amber-500/[0.07] dark:bg-amber-500/[0.08]",
                            isToday && "bg-cyan-500/[0.08] dark:bg-cyan-500/10",
                            on && PRESENT_CELL[cellIdx]
                          )}
                        >
                          <div className="flex min-h-[2.75rem] items-center justify-center">
                            {on ? (
                              <span className={marker} title={`${u.name} — in lab ${d}`}>
                                <span className="sr-only">Present on {d}</span>
                                <span aria-hidden>✓</span>
                              </span>
                            ) : (
                              <span
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 text-[11px] text-muted-foreground/35 dark:border-white/15 dark:bg-white/[0.04] dark:text-white/20"
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

        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-black/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-emerald-950">✓</span>
              In lab
            </span>
            <span className="text-border dark:text-white/20">|</span>
            <span className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 text-muted-foreground/40">
                ·
              </span>
              No mark
            </span>
          </div>
          <p className="text-[11px] leading-snug sm:text-right">Hover ✓ or an empty slot for the exact date.</p>
        </div>
      </div>
    </section>
  );
}
