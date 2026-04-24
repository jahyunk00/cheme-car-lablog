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
                ? "rounded-md border border-border bg-accent px-3 py-1.5 text-accent-foreground"
                : "rounded-md border border-transparent px-3 py-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
