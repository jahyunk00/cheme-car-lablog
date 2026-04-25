import { NextResponse } from "next/server";

/** Public uptime probe; does not require auth or database. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "lablog" }, { status: 200 });
}
