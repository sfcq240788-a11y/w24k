import "server-only";

import { createClient } from "@/lib/supabase/server";

type AdminGuardSuccess = { ok: true; userId: string; email: string };
type AdminGuardFailure = { ok: false; error: string };
export type AdminGuardResult = AdminGuardSuccess | AdminGuardFailure;

/**
 * Verifica que la petición viene de un usuario admin.
 *
 * Devuelve { ok: true, userId, email } si la verificación pasa.
 * Devuelve { ok: false, error } (nunca lanza) si:
 *   - No hay sesión activa
 *   - El email no está en la lista ADMIN_EMAILS
 *
 * Uso dentro de una Server Action:
 *   const guard = await assertAdmin();
 *   if (!guard.ok) return guard;  // { ok: false, error: "..." }
 *
 * La normalización (trim + toLowerCase) se aplica en ambos lados para evitar
 * falsos negativos por espacios o diferencias de casing en el .env.
 */
export async function assertAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "No autorizado: debes iniciar sesión." };
  }

  const rawList = process.env.ADMIN_EMAILS ?? "";
  const adminEmails = rawList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (user.email ?? "").trim().toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return {
      ok: false,
      error: "No autorizado: tu cuenta no tiene acceso al panel de administración.",
    };
  }

  return { ok: true, userId: user.id, email: userEmail };
}
