import type { UserRole } from "./types";

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isBoard(role: UserRole): boolean {
  return role === "board";
}

export function isTreasurer(role: UserRole): boolean {
  return role === "treasurer";
}

/**
 * Board, treasurer, and admin see team-wide dashboard counts, today’s team logs, and the activity feed.
 * (Treasurer does not get the separate Weekly summary page — see `canAccessWeeklySummary`.)
 */
export function canViewTeamMetrics(role: UserRole): boolean {
  return role === "admin" || role === "board" || role === "treasurer";
}

/** Charts-style weekly summary route: board and admin only (not treasurer). */
export function canAccessWeeklySummary(role: UserRole): boolean {
  return role === "admin" || role === "board";
}

/** Mark / clear “ordered” on item requests: treasurer and admin. */
export function canManageItemRequestOrders(role: UserRole): boolean {
  return role === "admin" || role === "treasurer";
}
