import { hashPassword } from "./auth";
import { countUsers, upsertUser } from "./db";
import type { User } from "./types";

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
  const board: User = {
    id: "user_board",
    name: "Board Member",
    email: "board@lablog.local",
    role: "board",
    passwordHash: await hashPassword("board123"),
    avatarId: 3,
  };
  const member: User = {
    id: "user_member",
    name: "Team Member",
    email: "member@lablog.local",
    role: "member",
    passwordHash: await hashPassword("member123"),
    avatarId: 2,
  };

  await upsertUser(admin);
  await upsertUser(board);
  await upsertUser(member);
}
