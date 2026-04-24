import { NextResponse } from "next/server";
import { z } from "zod";
import type { CalendarEventEntry } from "@/lib/types";
import { deleteCalendarEvent, getCalendarEvent, saveCalendarEvent } from "@/lib/db";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getCalendarEvent(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.role === "admin";
  if (existing.userId !== session.sub && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const startDate = parsed.data.startDate ?? existing.startDate;
  let endDate = existing.endDate;
  if (parsed.data.endDate !== undefined) {
    endDate = parsed.data.endDate;
  }
  if (endDate === startDate) endDate = null;
  if (endDate && endDate < startDate) {
    return NextResponse.json({ error: "End date must be on or after start date." }, { status: 400 });
  }

  const next: CalendarEventEntry = {
    ...existing,
    title: parsed.data.title ?? existing.title,
    description: parsed.data.description ?? existing.description,
    startDate,
    endDate,
    completedAt: existing.completedAt,
    completedByUserId: existing.completedByUserId,
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveCalendarEvent(next);
  } catch (err) {
    console.error("[api/calendar-events PATCH]", err);
    const message = err instanceof Error ? err.message : "Could not save event.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  return NextResponse.json({ event: next });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getCalendarEvent(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.role === "admin";
  if (existing.userId !== session.sub && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteCalendarEvent(id);
  return NextResponse.json({ ok: true });
}
