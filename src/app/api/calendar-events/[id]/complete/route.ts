import { NextResponse } from "next/server";
import { z } from "zod";
import type { CalendarEventEntry } from "@/lib/types";
import { getCalendarEvent, saveCalendarEvent } from "@/lib/db";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  completed: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getCalendarEvent(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { completed } = parsed.data;
  const isAdmin = session.role === "admin";
  const isCreator = existing.userId === session.sub;

  if (completed) {
    if (existing.completedAt) {
      return NextResponse.json({ event: existing });
    }
    const next: CalendarEventEntry = {
      ...existing,
      completedAt: new Date().toISOString(),
      completedByUserId: session.sub,
      updatedAt: new Date().toISOString(),
    };
    await saveCalendarEvent(next);
    return NextResponse.json({ event: next });
  }

  if (!existing.completedAt) {
    return NextResponse.json({ error: "This task is not marked complete." }, { status: 400 });
  }

  if (!isAdmin && !isCreator) {
    return NextResponse.json({ error: "Only the event creator or an admin can reopen this task." }, { status: 403 });
  }

  const next: CalendarEventEntry = {
    ...existing,
    completedAt: null,
    completedByUserId: null,
    updatedAt: new Date().toISOString(),
  };
  await saveCalendarEvent(next);
  return NextResponse.json({ event: next });
}
