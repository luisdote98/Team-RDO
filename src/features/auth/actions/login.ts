"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoMembers } from "@/features/events/data/demo-event";
import { verifyPassword } from "@/lib/auth/credentials";
import { ROUTES } from "@/lib/constants";
import { SESSION_COOKIE, signSession } from "@/lib/auth/session";

export type LoginState = { error: string | null };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const personId = String(formData.get("personId") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  const member = demoMembers.find((m) => m.id === personId);
  if (!member) {
    return { error: "Elige quién eres." };
  }

  if (!(await verifyPassword(personId, password))) {
    return { error: "Contraseña incorrecta." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(personId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(redirectTo);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect(ROUTES.login);
}
