import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLog, getLog, replaceLogParticipants, saveLog } from "@/lib/db";
import { LOG_CATEGORIES } from "@/lib/log-categories";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
  hours: z.number().min(0).max(999).nullable().optional(),
  category: z.enum(LOG_CATEGORIES).optional(),
  participantUserIds: z.array(z.string().min(1)).max(50).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getLog(id);
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

  const p = parsed.data;
  const next = {
    ...existing,
    date: p.date ?? existing.date,
    title: p.title ?? existing.title,
    description: p.description !== undefined ? p.description : existing.description,
    tags: p.tags !== undefined ? p.tags : existing.tags,
    hours: p.hours !== undefined ? p.hours : existing.hours,
    category: p.category ?? existing.category,
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveLog(next, {
      type: "log_updated",
      userId: session.sub,
      logId: id,
      message: `${session.name} updated “${next.title}”`,
    });
    if (p.participantUserIds !== undefined) {
      await replaceLogParticipants(id, p.participantUserIds, existing.userId);
    }
  } catch (err) {
    console.error("[api/logs PATCH]", err);
    const message = err instanceof Error ? err.message : "Could not save to database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const saved = await getLog(id);
  return NextResponse.json({ log: saved });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getLog(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete logs." }, { status: 403 });
  }

  await deleteLog(id);

  return NextResponse.json({ ok: true });
}
