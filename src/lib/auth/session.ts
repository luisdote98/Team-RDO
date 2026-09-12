import "server-only";

import { cookies } from "next/headers";

import { demoMembers } from "@/features/events/data/demo-event";

export const SESSION_COOKIE = "rodeo_session";

/** Prototipo: la cookie guarda el id de socio en claro, sin firmar. */
export async function getCurrentUser() {
  const store = await cookies();
  const personId = store.get(SESSION_COOKIE)?.value;
  return demoMembers.find((member) => member.id === personId) ?? null;
}
