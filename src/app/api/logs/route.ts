import { NextResponse } from "next/server";
import { z } from "zod";
import { getLog, listAllLogs, replaceLogParticipants, saveLog } from "@/lib/db";
import { LOG_CATEGORIES } from "@/lib/log-categories";
import { getSession } from "@/lib/session";
import type { LogEntry } from "@/lib/types";

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  tags: z.array(z.string()).default([]),
  hours: z.number().min(0).max(999).nullable().optional(),
  category: z.enum(LOG_CATEGORIES),
  /** Teammate user IDs who also participated (author is the session user). */
  participantUserIds: z.array(z.string().min(1)).max(50).default([]),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const userId = searchParams.get("userId") ?? "";
  const tag = (searchParams.get("tag") ?? "").toLowerCase();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let logs = await listAllLogs();

  if (q) {
    logs = logs.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (userId) logs = logs.filter((l) => l.userId === userId);
  if (tag) logs = logs.filter((l) => l.tags.some((t) => t.toLowerCase() === tag));
  if (from) logs = logs.filter((l) => l.date >= from);
  if (to) logs = logs.filter((l) => l.date <= to);

  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const log: LogEntry = {
    id,
    userId: session.sub,
    date: parsed.data.date,
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    tags: parsed.data.tags ?? [],
    hours: parsed.data.hours ?? null,
    category: parsed.data.category,
    participantUserIds: [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    await saveLog(log, {
      type: "log_created",
      userId: session.sub,
      logId: id,
      message: `${session.name} logged “${log.title}”`,
    });
    await replaceLogParticipants(id, parsed.data.participantUserIds, session.sub);
  } catch (err) {
    console.error("[api/logs POST]", err);
    const message = err instanceof Error ? err.message : "Could not save to database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const saved = await getLog(id);
  return NextResponse.json({ log: saved });
}
