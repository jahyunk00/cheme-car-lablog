import { hashPassword } from "./auth";
import { readStore, upsertUser } from "./db";
import type { User } from "./types";

/** Demo accounts for local MVP; change passwords in production. */
export async function ensureSeedUsers() {
  const store = await readStore();
  if (store.users.length > 0) return;

  const admin: User = {
    id: "user_admin",
    name: "Lab Admin",
    email: "admin@lablog.local",
    role: "admin",
    passwordHash: await hashPassword("admin123"),
  };
  const member: User = {
    id: "user_member",
    name: "Team Member",
    email: "member@lablog.local",
    role: "member",
    passwordHash: await hashPassword("member123"),
  };

  await upsertUser(admin);
  await upsertUser(member);
}
