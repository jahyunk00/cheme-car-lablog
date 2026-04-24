"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/** In-section switcher for the unified Logs area (browse vs add/edit). */
export function LogsSectionTabs() {
  const pathname = usePathname();
  const uploadActive = pathname.startsWith("/logs/upload");

  return (
    <div
      className="flex w-full max-w-md rounded-lg border border-border bg-muted/50 p-1 text-sm sm:w-fit"
      role="tablist"
      aria-label="Logs section"
    >
      <Link
        href="/logs"
        role="tab"
        aria-selected={!uploadActive}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-center font-medium transition-colors sm:flex-none",
          !uploadActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        )}
      >
        View logs
      </Link>
      <Link
        href="/logs/upload"
        role="tab"
        aria-selected={uploadActive}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-center font-medium transition-colors sm:flex-none",
          uploadActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        )}
      >
        Upload log
      </Link>
    </div>
  );
}
