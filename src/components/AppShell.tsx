import Image from "next/image";
import Link from "next/link";

import { AppNav, type AppNavLink } from "@/components/AppNav";
import { clubBrandLogo } from "@/lib/club-intro";
import { UserAvatar } from "@/components/UserAvatar";
import { canViewTeamMetrics, isAdmin } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

function roleLabel(role: UserRole) {
  if (role === "admin") return "Admin";
  if (role === "board") return "Board";
  return "Member";
}

function buildNavLinks(role: UserRole): AppNavLink[] {
  const core: AppNavLink[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/logs", label: "Logs" },
    { href: "/attendance", label: "Lab check-in" },
  ];
  if (canViewTeamMetrics(role)) {
    core.push({ href: "/weekly-summary", label: "Weekly summary" });
  }
  if (isAdmin(role)) {
    core.push({ href: "/admin/week-report", label: "Week report" });
    core.push({ href: "/admin/roles", label: "Team roles" });
  }
  return core;
}

export function AppShell({
  userName,
  role,
  avatarId,
  children,
}: {
  userName: string;
  role: UserRole;
  avatarId: number;
  children: React.ReactNode;
}) {
  const navLinks = buildNavLinks(role);
  return (
    <div className="flex min-h-dvh min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-lab-border bg-lab-surface/80 pt-[env(safe-area-inset-top,0px)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-white hover:text-blue-200"
            >
              <Image
                src={clubBrandLogo.src}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-md border border-lab-border bg-lab-bg object-contain"
                aria-hidden
                priority
              />
              <span>LabLog</span>
            </Link>
            <div className="-mx-3 overflow-x-auto px-3 pb-0.5 scrollbar-none sm:mx-0 sm:px-0 lg:pb-0">
              <AppNav links={navLinks} />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-lab-border/60 pt-3 text-sm text-slate-400 lg:border-t-0 lg:pt-0">
            <span className="flex min-w-0 max-w-full items-center gap-2 truncate sm:max-w-[14rem] lg:max-w-none">
              <UserAvatar avatarId={avatarId} size={36} title={userName} className="border-lab-border bg-lab-bg" />
              <span className="min-w-0 truncate">
                {userName}
                <span className="text-slate-600"> · </span>
                <span>{roleLabel(role)}</span>
              </span>
            </span>
            <form action="/api/auth/logout" method="post" className="shrink-0">
              <button type="submit" className="btn-ghost text-sm">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-6 sm:px-4 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
        {children}
      </main>
    </div>
  );
}
