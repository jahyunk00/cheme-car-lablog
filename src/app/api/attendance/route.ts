import { NextResponse } from "next/server";
import { z } from "zod";
import { getAttendanceDay, recordAttendance, removeAttendance } from "@/lib/db";
import { getSession } from "@/lib/session";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

const ATTENDANCE_TABLE_HINT =
  "Table lablog_attendance is missing or not exposed. In Supabase → SQL Editor, run migration 007 from the repo (creates lablog_attendance and updates roles), or at minimum the create table block from 007_lablog_board_role_and_attendance.sql.";

function attendanceSetupMissing(message: string): boolean {
  return /lablog_attendance|schema cache|Could not find the .*relation|42P01|does not exist/i.test(message);
}

const postSchema = z.object({
  date: z.string().regex(dateRe).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const date =
    parsed.data.date ?? new Date().toISOString().slice(0, 10);

  try {
    const entry = await recordAttendance(session.sub, date);
    return NextResponse.json({ entry });
  } catch (err) {
    console.error("[api/attendance POST]", err);
    const message = err instanceof Error ? err.message : "Could not save attendance.";
    if (attendanceSetupMissing(message)) {
      return NextResponse.json({ error: ATTENDANCE_TABLE_HINT }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date || !dateRe.test(date)) {
    return NextResponse.json({ error: "Query ?date=YYYY-MM-DD is required." }, { status: 400 });
  }

  try {
    const existing = await getAttendanceDay(session.sub, date);
    if (!existing) {
      return NextResponse.json({ ok: true, removed: false });
    }
    await removeAttendance(session.sub, date);
    return NextResponse.json({ ok: true, removed: true });
  } catch (err) {
    console.error("[api/attendance DELETE]", err);
    const message = err instanceof Error ? err.message : "Could not remove attendance.";
    if (attendanceSetupMissing(message)) {
      return NextResponse.json({ error: ATTENDANCE_TABLE_HINT }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
