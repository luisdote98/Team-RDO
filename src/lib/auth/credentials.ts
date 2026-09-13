import "server-only";

import bcrypt from "bcryptjs";

import { createServiceClient } from "@/lib/supabase/service";

/**
 * Verifica la contraseña de un socio contra el hash guardado en `members`.
 * Solo se importa desde Server Actions — nunca desde un componente de
 * cliente, para que el hash y la clave de servicio no viajen al navegador.
 */
export async function verifyPassword(
  personId: string,
  password: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data: member } = await supabase
    .from("members")
    .select("password_hash")
    .eq("id", personId)
    .maybeSingle();

  if (!member) return false;
  return bcrypt.compare(password, member.password_hash);
}
