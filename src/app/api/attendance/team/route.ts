import { NextResponse } from "next/server";
import { listAttendanceBetween } from "@/lib/db";
import { canViewTeamMetrics } from "@/lib/roles";
import { getSession } from "@/lib/session";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!canViewTeamMetrics(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    const entries = await listAttendanceBetween(from, to);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[api/attendance/team GET]", err);
    const message = err instanceof Error ? err.message : "Could not load team attendance.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
