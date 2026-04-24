import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const url = new URL("/login", request.url);
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(sessionCookieName(), "", { path: "/", maxAge: 0 });
  return res;
}
