import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la service-role key: ignora RLS por diseño. Es el único
 * cliente que deben usar las Server Actions y las queries del servidor —
 * `import "server-only"` hace que el build falle si algo del cliente
 * intenta importarlo, para que la clave nunca llegue al navegador.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
