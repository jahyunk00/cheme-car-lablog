import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById, updateUserMemberBoardRole } from "@/lib/db";
import { isAdmin } from "@/lib/roles";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  role: z.enum(["member", "board"]),
});

const ROLE_CHECK_DB_FIX =
  "Your Supabase project still has an old check on lablog_users.role that does not allow 'board'. In Supabase → SQL Editor, run:\n\n" +
  "alter table public.lablog_users drop constraint if exists lablog_users_role_check;\n" +
  "alter table public.lablog_users add constraint lablog_users_role_check check (role in ('admin', 'board', 'member'));\n\n" +
  "Then try again. If you have not applied board role SQL yet, run migration 007 or 008 from the repo in Supabase.";

function isRoleCheckViolation(message: string): boolean {
  return /lablog_users_role_check|23514|role_check/i.test(message);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.role)) {
    return NextResponse.json({ error: "Only admins can change roles." }, { status: 403 });
  }

  const { id: targetId } = await context.params;
  if (targetId === session.sub) {
    const self = await getUserById(session.sub);
    if (self?.role === "admin") {
      return NextResponse.json(
        { error: "You cannot change your own role here. Use the database if you need to transfer admin." },
        { status: 403 }
      );
    }
  }

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Body must be { \"role\": \"member\" | \"board\" }." }, { status: 400 });
  }

  try {
    await updateUserMemberBoardRole(targetId, parsed.data.role);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (msg === "ADMIN_ROLE_LOCKED") {
      return NextResponse.json(
        { error: "Admin accounts cannot be changed from the app. Update role in Supabase if needed." },
        { status: 403 }
      );
    }
    if (isRoleCheckViolation(msg)) {
      return NextResponse.json({ error: ROLE_CHECK_DB_FIX }, { status: 400 });
    }
    console.error("[api/users PATCH]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: targetId, role: parsed.data.role });
}
