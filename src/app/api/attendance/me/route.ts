import { NextResponse } from "next/server";
import { listAttendanceForUser } from "@/lib/db";
import { getSession } from "@/lib/session";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to || !dateRe.test(from) || !dateRe.test(to)) {
    return NextResponse.json(
      { error: "Query from=YYYY-MM-DD and to=YYYY-MM-DD are required." },
      { status: 400 }
    );
  }

  try {
    const entries = await listAttendanceForUser(session.sub, from, to);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[api/attendance/me GET]", err);
    const message = err instanceof Error ? err.message : "Could not load attendance.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
