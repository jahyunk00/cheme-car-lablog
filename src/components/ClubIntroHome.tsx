"use client";

import { BarChart2, Calendar, ChevronRight, FileText, LayoutDashboard, ShoppingCart } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";

import { clubBrandLogo, clubIntro } from "@/lib/club-intro";

const appLinks = [
  { href: "/dashboard", label: "Dashboard", description: "Overview, feed, and quick week snapshot.", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", description: "Meetings, deadlines, and lab milestones.", icon: Calendar },
  { href: "/logs", label: "Logs", description: "Team lab log and your entries.", icon: FileText },
  { href: "/item-requests", label: "Item requests", description: "Parts and supplies: quantity, price, link, and use.", icon: ShoppingCart },
  { href: "/weekly-summary", label: "Weekly summary", description: "Roll-up of the week for meetings.", icon: BarChart2 },
] as const;

export function ClubIntroHome({ isAuthed, userName }: { isAuthed: boolean; userName: string | null }) {
  return (
    <div className="relative min-h-screen bg-lab-bg text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-lab-border/80 bg-lab-bg/90 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] backdrop-blur-md sm:px-4">
        <NextLink
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-foreground hover:text-primary"
        >
          <Image
            src={clubBrandLogo.src}
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 rounded-md border border-lab-border bg-background object-contain"
            aria-hidden
          />
          <span>LabLog</span>
        </NextLink>
        <nav className="flex items-center gap-2 sm:gap-3 text-sm">
          {isAuthed ? (
            <>
              {userName ? (
                <span className="hidden max-w-[10rem] truncate text-muted-foreground sm:inline">{userName}</span>
              ) : null}
              <NextLink
                href="/dashboard"
                className="rounded-md border border-lab-border px-3 py-1.5 text-foreground hover:bg-muted/30"
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
              <NextLink href="/login" className="px-2 py-1.5 text-muted-foreground hover:text-foreground">
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

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-[calc(5rem+env(safe-area-inset-top,0px))] sm:max-w-3xl sm:pt-24">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clubIntro.kicker}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{clubIntro.clubName}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{clubIntro.tagline}</p>

        <div className="mt-10 space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
          {clubIntro.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <h2 className="mt-12 text-lg font-semibold text-foreground">What we focus on</h2>
        <ul className="mt-4 space-y-4">
          {clubIntro.focusAreas.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-lab-border bg-card/40 px-4 py-4 sm:px-5"
            >
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-xl border border-lab-border bg-muted/15 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">LabLog</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This site is our shared logbook and schedule: experiment notes, calendar events, item requests, and weekly
            summaries for members and board. Sign in to see everything your role allows.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {appLinks.map(({ href, label, description, icon: Icon }) => (
              <NextLink
                key={href}
                href={href}
                className="group flex gap-3 rounded-lg border border-lab-border bg-lab-bg/50 p-4 transition-colors hover:bg-muted/25"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-lab-border bg-muted/30 text-foreground">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {label}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{description}</span>
                </span>
              </NextLink>
            ))}
          </div>

          {!isAuthed ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <NextLink href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign in
              </NextLink>{" "}
              or{" "}
              <NextLink href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
                create an account
              </NextLink>{" "}
              to use these pages.
            </p>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <NextLink
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Go to dashboard
              </NextLink>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
