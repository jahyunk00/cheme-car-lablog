export const LABLOG_AVATAR_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type LablogAvatarId = (typeof LABLOG_AVATAR_IDS)[number];

export const DEFAULT_AVATAR_ID: LablogAvatarId = 1;

const VALID = new Set<number>(LABLOG_AVATAR_IDS);

export function parseLablogAvatarId(value: unknown): LablogAvatarId {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (Number.isInteger(n) && VALID.has(n)) return n as LablogAvatarId;
  return DEFAULT_AVATAR_ID;
}
