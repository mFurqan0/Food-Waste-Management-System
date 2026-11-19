import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { signToken, verifyToken, type Role } from "@/lib/token";

export const SESSION_COOKIE = "sm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters in .env");
  }
  return s;
}

/** Call only from server actions (cookies can only be set there). */
export function createSessionCookie(userId: string, role: Role) {
  const token = signToken({ uid: userId, role, exp: Date.now() + MAX_AGE_SECONDS * 1000 }, secret());
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

/** Returns the logged-in user, reading the role from the database so demotions take effect at once. */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token, secret());
  if (!payload) return null;
  return db.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, name: true, email: true, role: true, roomNo: true },
  });
}

/** Use at the top of every protected page, layout, and server action. */
export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(user.role === "ADMIN" ? "/admin" : "/student");
  return user;
}

export function getCurrentStudent() {
  return requireRole("STUDENT");
}
