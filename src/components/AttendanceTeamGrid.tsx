import { getDay, parseISO } from "date-fns";

import { UserAvatar } from "@/components/UserAvatar";

export type TeamGridUser = { id: string; name: string; avatarId: number };
export type TeamGridEntry = { userId: string; attendedDate: string };

/** Stable, distinct “glow” styles per teammate (Tailwind must see full strings). */
const PRESENT_MARKERS = [
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[8px] shadow-[0_0_14px_rgba(52,211,153,0.55)] ring-2 ring-emerald-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-sky-400 text-[8px] shadow-[0_0_14px_rgba(56,189,248,0.55)] ring-2 ring-sky-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-violet-400 text-[8px] shadow-[0_0_14px_rgba(167,139,250,0.55)] ring-2 ring-violet-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[8px] shadow-[0_0_14px_rgba(251,191,36,0.5)] ring-2 ring-amber-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-rose-400 text-[8px] shadow-[0_0_14px_rgba(251,113,133,0.55)] ring-2 ring-rose-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[8px] shadow-[0_0_14px_rgba(34,211,238,0.55)] ring-2 ring-cyan-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-fuchsia-400 text-[8px] shadow-[0_0_14px_rgba(232,121,249,0.55)] ring-2 ring-fuchsia-300/40",
  "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-lime-400 text-[8px] shadow-[0_0_14px_rgba(163,230,53,0.5)] ring-2 ring-lime-300/40",
] as const;

function markerClassForUser(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  return PRESENT_MARKERS[h % PRESENT_MARKERS.length];
}

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

  return (
    <section className="relative overflow-hidden rounded-2xl border border-violet-300/40 bg-gradient-to-br from-violet-100/80 via-card to-cyan-100/70 p-4 shadow-md sm:p-6 dark:border-violet-500/20 dark:from-violet-950/35 dark:via-card dark:to-cyan-950/30 dark:shadow-lg dark:shadow-violet-950/20">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-400/25 blur-3xl dark:bg-fuchsia-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/15"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-800 dark:border-violet-400/25 dark:bg-violet-500/10 dark:text-violet-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399] dark:bg-emerald-400" />
          Team pulse · last 14 days
        </div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Who was in lab?
        </h2>
        <p className="mt-1 max-w-prose text-pretty text-sm text-muted-foreground">
          Each column is one day. <span className="text-amber-600/90 dark:text-amber-300/90">Amber-tinted</span>{" "}
          headers are weekends. Glowing dots are check-ins — color is unique per teammate.
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border/80 bg-muted/25 dark:border-white/10 dark:bg-black/25">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 dark:border-white/10 dark:from-violet-600/15 dark:to-cyan-600/15">
                <th className="sticky left-0 z-10 bg-background/95 py-3 pl-3 pr-3 font-medium text-foreground backdrop-blur-sm dark:bg-card/95 sm:pl-4">
                  Teammate
                </th>
                {dayLabels.map((d) => {
                  const weekend = isWeekend(d);
                  const isToday = d === today;
                  return (
                    <th
                      key={d}
                      className={`px-0.5 py-3 text-center text-[10px] font-medium leading-tight ${
                        weekend
                          ? "bg-amber-500/10 text-amber-800 dark:text-amber-200/90"
                          : "text-muted-foreground"
                      } ${isToday ? "ring-1 ring-inset ring-cyan-400/50 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100" : ""}`}
                    >
                      <span className="sr-only">{d}</span>
                      <span aria-hidden className="flex flex-col items-center gap-0.5">
                        <span>{d.slice(5, 7)}</span>
                        <span className="opacity-80">/{d.slice(8, 10)}</span>
                        {isToday ? (
                          <span className="text-[8px] font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                            now
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
                const marker = markerClassForUser(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.04] ${
                      rowIdx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    }`}
                  >
                    <td className="sticky left-0 z-10 whitespace-nowrap border-r border-border/60 bg-background/95 py-2.5 pl-3 pr-3 backdrop-blur-sm dark:border-white/5 dark:bg-card/90 sm:pl-4">
                      <span className="inline-flex items-center gap-2.5">
                        <span className="ring-2 ring-violet-400/20 rounded-full">
                          <UserAvatar avatarId={u.avatarId} size={26} title={u.name} />
                        </span>
                        <span className="font-medium text-foreground">{u.name}</span>
                      </span>
                    </td>
                    {dayLabels.map((d) => {
                      const on = set.has(d);
                      const weekend = isWeekend(d);
                      const isToday = d === today;
                      return (
                        <td
                          key={d}
                          className={`py-2 text-center align-middle ${
                            weekend ? "bg-amber-500/[0.06]" : ""
                          } ${isToday ? "bg-cyan-500/[0.07]" : ""}`}
                        >
                          {on ? (
                            <span className={marker} title={`${u.name} — ${d}`}>
                              <span className="sr-only">Present</span>
                            </span>
                          ) : (
                            <span
                              className="mx-auto inline-block h-2 w-2 rounded-full bg-muted/35 ring-1 ring-border/50"
                              title={d}
                              aria-label={`No check-in ${d}`}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: hover a glowing dot to see the exact date. Your row color stays the same every visit.
        </p>
      </div>
    </section>
  );
}
