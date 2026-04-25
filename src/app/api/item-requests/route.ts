import { NextResponse } from "next/server";
import { z } from "zod";
import { insertItemRequest, listItemRequestsBetween, listRecentItemRequests } from "@/lib/db";
import { ITEM_REQUEST_PURPOSES } from "@/lib/item-request-purpose";
import { getSession } from "@/lib/session";
import type { ItemRequestEntry } from "@/lib/types";

const createSchema = z.object({
  name: z.string().min(1).max(300),
  quantity: z.coerce.number().int().min(1).max(999_999),
  price: z.string().max(200).default(""),
  link: z.string().max(4000).default(""),
  purpose: z.enum(ITEM_REQUEST_PURPOSES),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && to && /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    const requests = await listItemRequestsBetween(`${from}T00:00:00.000Z`, `${to}T23:59:59.999Z`);
    return NextResponse.json({ requests });
  }

  const requests = await listRecentItemRequests(100);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const entry: ItemRequestEntry = {
    id,
    userId: session.sub,
    name: parsed.data.name.trim(),
    quantity: parsed.data.quantity,
    price: parsed.data.price.trim(),
    link: parsed.data.link.trim(),
    purpose: parsed.data.purpose,
    createdAt: now,
    orderedAt: null,
  };

  try {
    await insertItemRequest(entry);
  } catch (err) {
    console.error("[api/item-requests POST]", err);
    const message = err instanceof Error ? err.message : "Could not save request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ request: entry });
}
