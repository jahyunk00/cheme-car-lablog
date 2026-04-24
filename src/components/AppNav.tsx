"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AppNavLink = { href: string; label: string };

export function AppNav({ links }: { links: AppNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-max max-w-full flex-nowrap gap-1 text-xs sm:w-auto sm:flex-wrap sm:text-sm">
      {links.map((l) => {
        const active =
          pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              active
                ? "rounded-md border border-border bg-accent px-2 py-1.5 text-accent-foreground sm:px-3"
                : "rounded-md border border-transparent px-2 py-1.5 text-muted-foreground hover:bg-accent/60 hover:text-foreground sm:px-3"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
