import { NextResponse } from "next/server";
import { listDirectoryUsers } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await listDirectoryUsers();
  return NextResponse.json({ users });
}
