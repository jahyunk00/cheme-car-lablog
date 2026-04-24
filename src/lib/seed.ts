import { hashPassword } from "./auth";
import { countUsers, upsertUser } from "./db";
import type { User } from "./types";

function isRoleConstraintError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /lablog_users_role_check|role_check|check constraint|23514/i.test(msg);
}

/** Demo accounts for local MVP; change passwords in production. */
export async function ensureSeedUsers() {
  if ((await countUsers()) > 0) return;

  const admin: User = {
    id: "user_admin",
    name: "Lab Admin",
    email: "admin@lablog.local",
    role: "admin",
    passwordHash: await hashPassword("admin123"),
    avatarId: 1,
  };
  const member: User = {
    id: "user_member",
    name: "Team Member",
    email: "member@lablog.local",
    role: "member",
    passwordHash: await hashPassword("member123"),
    avatarId: 2,
  };
  const board: User = {
    id: "user_board",
    name: "Board Member",
    email: "board@lablog.local",
    role: "board",
    passwordHash: await hashPassword("board123"),
    avatarId: 3,
  };

  await upsertUser(admin);
  await upsertUser(member);

  try {
    await upsertUser(board);
  } catch (err) {
    if (isRoleConstraintError(err)) {
      console.warn(
        "[lablog seed] Skipped demo board user: `lablog_users` does not allow role 'board' yet. " +
          "In Supabase SQL Editor, run `supabase/migrations/007_lablog_board_role_and_attendance.sql` (at least the ALTER TABLE … role_check lines)."
      );
      return;
    }
    throw err;
  }
}
