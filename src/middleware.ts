import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { updateSession } from "@/utils/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

function secretKey() {
  const fromEnv = process.env.LABLOG_SECRET;
  if (fromEnv && fromEnv.length >= 16) return new TextEncoder().encode(fromEnv);
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("lablog-dev-secret-min-16");
  }
  return null;
}

/** Preserve Supabase session cookies when issuing a LabLog redirect. */
function mergeSupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const supabaseResponse = await updateSession(request);

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return supabaseResponse;
  }

  if (pathname.startsWith("/api/auth/logout")) {
    return supabaseResponse;
  }

  const token = request.cookies.get("lablog_session")?.value;
  const key = secretKey();

  if (!token || !key) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(url);
    mergeSupabaseCookies(supabaseResponse, redirect);
    return redirect;
  }

  try {
    await jwtVerify(token, key);
    return supabaseResponse;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    mergeSupabaseCookies(supabaseResponse, redirect);
    return redirect;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
