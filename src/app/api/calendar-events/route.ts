import { NextResponse } from "next/server";
import { z } from "zod";
import type { CalendarEventEntry } from "@/lib/types";
import { listAllCalendarEvents, saveCalendarEvent } from "@/lib/db";
import { getSession } from "@/lib/session";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await listAllCalendarEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const { startDate, endDate } = parsed.data;
  let end: string | null = endDate ?? null;
  if (end && end < startDate) {
    return NextResponse.json({ error: "End date must be on or after start date." }, { status: 400 });
  }
  if (end === startDate) end = null;

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const entry: CalendarEventEntry = {
    id,
    userId: session.sub,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    startDate,
    endDate: end,
    createdAt: now,
    updatedAt: now,
  };

  await saveCalendarEvent(entry);
  return NextResponse.json({ event: entry });
}
