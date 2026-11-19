"use server";

import { compare, hashSync } from "bcryptjs";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { loginSchema } from "@/lib/login-schema";
import { flattenErrors } from "@/lib/validators";
import { db } from "@/server/db";
import { clearSessionCookie, createSessionCookie } from "@/server/session";

// Hashed once at startup so a wrong email takes as long to reject as a wrong password.
const DUMMY_HASH = hashSync("not-a-real-password", 10);

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Enter your email and password.", errors: flattenErrors(parsed.error) };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  const valid = await compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    return { ok: false, message: "Wrong email or password." };
  }

  createSessionCookie(user.id, user.role);
  redirect(user.role === "ADMIN" ? "/admin" : "/student");
}

export async function logoutAction() {
  clearSessionCookie();
  redirect("/login");
}
