import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { createServiceClient } from "@/lib/supabase/service";
import type { DemoMember } from "@/features/events/data/demo-event";

export const SESSION_COOKIE = "rodeo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update(value)
    .digest("hex");
}

/** `personId.expiry.firma` — la firma cubre id y expiración, nada viaja sin verificar. */
export function signSession(personId: string): string {
  const expiry = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${personId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

function verifySession(cookieValue: string): string | null {
  const [personId, expiry, signature] = cookieValue.split(".");
  if (!personId || !expiry || !signature) return null;

  const payload = `${personId}.${expiry}`;
  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(signature);
  if (
    expectedBuf.length !== givenBuf.length ||
    !timingSafeEqual(expectedBuf, givenBuf)
  ) {
    return null;
  }

  if (Date.now() > Number(expiry)) return null;
  return personId;
}

export async function getCurrentUser(): Promise<DemoMember | null> {
  const store = await cookies();
  const cookieValue = store.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;

  const personId = verifySession(cookieValue);
  if (!personId) return null;

  const supabase = createServiceClient();
  const { data: member } = await supabase
    .from("members")
    .select("id, name, role, color, bg_color")
    .eq("id", personId)
    .maybeSingle();

  return member
    ? {
        id: member.id,
        name: member.name,
        role: member.role,
        color: member.color,
        bgColor: member.bg_color,
      }
    : null;
}
