import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await readStore();
  const users = store.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  return NextResponse.json({ users });
}
