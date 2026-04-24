"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  type DayPickerProps,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";
import type * as React from "react";

import "react-day-picker/style.css";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: DayPickerProps): React.ReactElement {
  const base = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm",
        "[--cell-size:2.25rem] sm:[--cell-size:2rem]",
        "[&_.rdp-week]:flex [&_.rdp-week]:w-full",
        className
      )}
      classNames={{
        ...base,
        root: cn(base.root, "w-fit"),
        months: cn(base.months, "relative flex flex-col gap-4 sm:flex-row"),
        month: cn(base.month, "flex w-full flex-col gap-2"),
        month_caption: cn(
          base.month_caption,
          "relative mx-2 mb-1 flex h-9 items-center justify-center px-1 text-sm font-medium sm:text-sm"
        ),
        nav: cn(base.nav, "absolute inset-x-0 top-0 z-[1] flex w-full items-center justify-between"),
        button_previous: cn(
          base.button_previous,
          "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent sm:size-8"
        ),
        button_next: cn(
          base.button_next,
          "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent sm:size-8"
        ),
        weekdays: cn(base.weekdays, "flex"),
        weekday: cn(
          base.weekday,
          "flex size-[var(--cell-size)] items-center justify-center p-0 text-xs font-medium text-muted-foreground"
        ),
        week: cn(base.week, "mt-1 flex w-full"),
        day: cn(base.day, "relative size-[var(--cell-size)] p-0 text-center text-sm"),
        day_button: cn(
          base.day_button,
          "inline-flex size-[var(--cell-size)] items-center justify-center rounded-lg font-normal text-foreground",
          "hover:bg-accent/50",
          "[.rdp-day.rdp-selected_&]:bg-primary [.rdp-day.rdp-selected_&]:text-primary-foreground [.rdp-day.rdp-selected_&]:hover:opacity-90",
          "[.rdp-day.rdp-today_&]:font-semibold [.rdp-day.rdp-today_&]:text-primary",
          "[.rdp-day.rdp-outside_&]:text-muted-foreground [.rdp-day.rdp-outside_&]:opacity-70",
          "[.rdp-day.rdp-disabled_&]:pointer-events-none [.rdp-day.rdp-disabled_&]:opacity-30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        outside: cn(base.outside, "text-muted-foreground"),
        today: cn(base.today, "text-primary"),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chClass, orientation, ...rest }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", chClass)} {...rest} aria-hidden />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", chClass)} {...rest} aria-hidden />
            );
          }
          return <ChevronDownIcon className={cn("size-4", chClass)} {...rest} aria-hidden />;
        },
        ...userComponents,
      }}
      {...props}
    />
  );
}
