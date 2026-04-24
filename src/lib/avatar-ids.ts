export const LABLOG_AVATAR_IDS = [1, 2, 3, 4] as const;

export type LablogAvatarId = (typeof LABLOG_AVATAR_IDS)[number];

export const DEFAULT_AVATAR_ID: LablogAvatarId = 1;

export function parseLablogAvatarId(value: unknown): LablogAvatarId {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return DEFAULT_AVATAR_ID;
}
