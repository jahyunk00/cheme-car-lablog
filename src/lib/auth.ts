import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { UserRole } from "./types";

const COOKIE = "lablog_session";

function getSecret() {
  const fromEnv = process.env.LABLOG_SECRET;
  const secret =
    fromEnv && fromEnv.length >= 16
      ? fromEnv
      : process.env.NODE_ENV === "development"
        ? "lablog-dev-secret-min-16"
        : "";
  if (!secret) {
    throw new Error(
      "Set LABLOG_SECRET in .env.local (at least 16 characters) for production."
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : "";
    const role = payload.role === "admin" || payload.role === "member" ? payload.role : "member";
    if (!sub || !email) return null;
    return { sub, email, name, role };
  } catch {
    return null;
  }
}

export function sessionCookieName() {
  return COOKIE;
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
