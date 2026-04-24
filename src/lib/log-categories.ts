export const LOG_CATEGORIES = ["Propulsion", "Stopping", "Car Design", "Other"] as const;

export type LogCategory = (typeof LOG_CATEGORIES)[number];

/** Logs page filter: one category or every subsystem. */
export type LogsCategoryFilterValue = LogCategory | "all";

export function isLogCategory(value: string): value is LogCategory {
  return (LOG_CATEGORIES as readonly string[]).includes(value);
}

export function parseLogCategory(value: string | null | undefined): LogCategory {
  if (value && isLogCategory(value)) return value;
  return "Other";
}
