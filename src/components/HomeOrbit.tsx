"use client";

import { BarChart2, Calendar, FileText, LayoutDashboard } from "lucide-react";
import NextLink from "next/link";
import { RadialOrbitalTimeline, type OrbitalTimelineItem } from "@/components/ui/radial-orbital-timeline";
import { DottedSurface } from "@/components/ui/dotted-surface";

const NAV_ORBIT: OrbitalTimelineItem[] = [
  {
    id: 1,
    title: "Dashboard",
    date: "Overview",
    content: "Today’s logs, live feed, and a quick snapshot of the week for your team.",
    category: "Hub",
    icon: LayoutDashboard,
    relatedIds: [2, 4],
    status: "completed",
    energy: 100,
    href: "/dashboard",
  },
  {
    id: 2,
    title: "Calendar",
    date: "Schedule",
    content: "Month and week views, scheduled events, and log density by day.",
    category: "Time",
    icon: Calendar,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 88,
    href: "/calendar",
  },
  {
    id: 3,
    title: "Logs",
    date: "Records",
    content: "Browse and add lab log entries with dates, tags, and descriptions.",
    category: "Work",
    icon: FileText,
    relatedIds: [2, 4],
    status: "completed",
    energy: 92,
    href: "/logs",
  },
  {
    id: 4,
    title: "Weekly summary",
    date: "Insights",
    content: "Roll-up of the week’s activity—great for group meetings.",
    category: "Reports",
    icon: BarChart2,
    relatedIds: [1, 3],
    status: "pending",
    energy: 72,
    href: "/weekly-summary",
  },
];

export function HomeOrbit({ isAuthed, userName }: { isAuthed: boolean; userName: string | null }) {
  return (
    <div className="relative min-h-screen bg-lab-bg">
      <DottedSurface />
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-lab-border/80 bg-lab-bg/75 px-4 py-3 backdrop-blur-md">
        <NextLink href="/" className="text-lg font-semibold tracking-tight text-foreground hover:text-primary">
          LabLog
        </NextLink>
        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          {isAuthed ? (
            <>
              {userName ? (
                <span className="hidden max-w-[10rem] truncate text-slate-400 sm:inline">{userName}</span>
              ) : null}
              <NextLink
                href="/dashboard"
                className="rounded-md border border-lab-border px-3 py-1.5 text-slate-200 hover:bg-lab-border/40"
              >
                Dashboard
              </NextLink>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn-ghost border-0 px-3 py-1.5 text-sm">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <NextLink href="/login" className="px-2 py-1.5 text-slate-300 hover:text-white">
                Sign in
              </NextLink>
              <NextLink
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
              >
                Register
              </NextLink>
            </>
          )}
        </nav>
      </header>
      <div className="relative z-10">
        <RadialOrbitalTimeline timelineData={NAV_ORBIT} />
      </div>
    </div>
  );
}
