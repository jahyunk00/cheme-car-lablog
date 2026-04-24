import { cookies } from "next/headers";
import { sessionCookieName, verifySession, type SessionPayload } from "./auth";

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) return null;
  return verifySession(token);
}
