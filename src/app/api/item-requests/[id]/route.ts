import { NextResponse } from "next/server";
import { z } from "zod";
import { getItemRequestById, updateItemRequestOrderedAt } from "@/lib/db";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  ordered: z.boolean(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await getItemRequestById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const orderedAt = parsed.data.ordered ? new Date().toISOString() : null;

  try {
    await updateItemRequestOrderedAt(id, orderedAt);
  } catch (err) {
    console.error("[api/item-requests PATCH]", err);
    const message = err instanceof Error ? err.message : "Could not update request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const next = { ...existing, orderedAt };
  return NextResponse.json({ request: next });
}
