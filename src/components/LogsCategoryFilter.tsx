"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOG_CATEGORIES, type LogsCategoryFilterValue } from "@/lib/log-categories";

export function LogsCategoryFilter({ value }: { value: LogsCategoryFilterValue }) {
  const router = useRouter();
  const radioValue = value === "all" ? "all" : value;

  function onValueChange(v: string) {
    if (v === "all") {
      router.push("/logs");
      return;
    }
    router.push(`/logs?category=${encodeURIComponent(v)}`);
  }

  const triggerLabel = value === "all" ? "All subsystems" : value;

  return (
    <div className="space-y-1 w-full sm:max-w-xs">
      <span className="field-label">Log for</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 w-full justify-between border-input bg-background px-3 py-2 font-normal text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="ms-2 size-4 shrink-0 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuLabel>Subsystem</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={radioValue} onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="all">All subsystems</DropdownMenuRadioItem>
            {LOG_CATEGORIES.map((c) => (
              <DropdownMenuRadioItem key={c} value={c}>
                {c}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-xs text-muted-foreground">Which subsystem this entry is about.</p>
    </div>
  );
}
