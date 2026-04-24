import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { hashPassword, sessionCookieName, signSession } from "@/lib/auth";
import { parseLablogAvatarId } from "@/lib/avatar-ids";
import { getUserByEmail, insertUser } from "@/lib/db";
import type { User } from "@/lib/types";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters").max(200),
  avatarId: z.number().int().min(1).max(8).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first =
        msg.name?.[0] ?? msg.email?.[0] ?? msg.password?.[0] ?? "Invalid input";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const avatarId = parseLablogAvatarId(parsed.data.avatarId);
    const user: User = {
      id: randomUUID(),
      name: parsed.data.name.trim(),
      email,
      role: "member",
      passwordHash,
      avatarId,
    };

    try {
      await insertUser(user);
    } catch (e) {
      if (e instanceof Error && e.message === "EMAIL_TAKEN") {
        return NextResponse.json(
          { error: "An account with this email already exists. Try signing in." },
          { status: 409 }
        );
      }
      throw e;
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarId: user.avatarId,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("[auth/register]", err);
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
