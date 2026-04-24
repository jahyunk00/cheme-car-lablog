"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/logs", label: "Logs" },
  { href: "/weekly-summary", label: "Weekly summary" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              active
                ? "px-3 py-1.5 rounded-md bg-blue-600/20 text-white border border-blue-500/30"
                : "px-3 py-1.5 rounded-md text-slate-300 hover:bg-lab-border/60 hover:text-white border border-transparent"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
