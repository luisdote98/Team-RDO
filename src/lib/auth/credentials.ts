/**
 * PROTOTIPO DE ACCESO — NO ES SEGURIDAD DE PRODUCCIÓN.
 *
 * Contraseñas en texto plano y comprobadas a mano. Esto existe solo para que
 * cada socio pueda "entrar como sí mismo" mientras no hay backend real.
 * En la fase 2 esto se sustituye por completo por Supabase Auth (hash de
 * contraseña gestionado por Supabase, tabla `profiles`, tokens de sesión).
 *
 * Este archivo solo se importa desde Server Actions — nunca desde un
 * componente de cliente, para que las contraseñas no viajen al navegador.
 */

export type Credential = {
  personId: string;
  password: string;
};

/** Luis va primero: es quien más usa la app ahora mismo. */
export const CREDENTIALS: Credential[] = [
  { personId: "luis", password: "dote." },
  { personId: "oliver", password: "bort." },
  { personId: "guille", password: "glassis." },
];

export function checkCredentials(personId: string, password: string): boolean {
  return CREDENTIALS.some(
    (c) => c.personId === personId && c.password === password,
  );
}
