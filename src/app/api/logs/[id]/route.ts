import { NextResponse } from "next/server";
import { z } from "zod";
import { getLog, readStore, saveLog, writeStore } from "@/lib/db";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).optional(),
  hours: z.number().min(0).max(999).nullable().optional(),
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

  const next: typeof existing = {
    ...existing,
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  await saveLog(next, {
    type: "log_updated",
    userId: session.sub,
    logId: id,
    message: `${session.name} updated “${next.title}”`,
  });

  return NextResponse.json({ log: next });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getLog(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.role === "admin";
  if (existing.userId !== session.sub && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const store = await readStore();
  store.logs = store.logs.filter((l) => l.id !== id);
  await writeStore(store);

  return NextResponse.json({ ok: true });
}
