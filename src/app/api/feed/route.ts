import { NextResponse } from "next/server";
import { listFeed } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await listFeed(40);
  return NextResponse.json({ items });
}
