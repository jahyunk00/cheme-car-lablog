import type { UserRole } from "./types";

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isBoard(role: UserRole): boolean {
  return role === "board";
}

/** Board members and admins can see team-wide metrics, attendance rollups, and activity feed. */
export function canViewTeamMetrics(role: UserRole): boolean {
  return role === "admin" || role === "board";
}
