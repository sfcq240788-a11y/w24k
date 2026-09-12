/**
 * Devuelve la URL base del sitio sin trailing slash.
 *
 * Orden de resolución:
 *   1. NEXT_PUBLIC_SITE_URL  — variable explícita; siempre tiene precedencia.
 *   2. VERCEL_URL            — disponible automáticamente en todos los
 *                              despliegues de Vercel (producción y preview).
 *                              Se le antepone "https://" porque Vercel no lo
 *                              incluye en la variable.
 *   3. Fallback a "http://localhost:3000" — solo cuando NODE_ENV !== "production".
 *   4. Error explícito       — si NODE_ENV === "production" y ninguna de las
 *                              anteriores está definida. Es preferible que el
 *                              checkout no arranque a que arranque y redirija
 *                              al cliente a localhost tras haber cobrado.
 */
export function getSiteUrl(): string {
  // 1. Variable explícita (producción, staging, dev con tunel ngrok, etc.)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // 2. URL automática de Vercel (cubre producción y ramas de preview)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Fallback local — solo fuera de producción
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  // 4. Fallo ruidoso en producción sin URL configurada
  throw new Error(
    "No se pudo resolver la URL base del sitio. " +
      "Define NEXT_PUBLIC_SITE_URL en las variables de entorno de producción " +
      "antes de aceptar pagos (p. ej. https://www.w24k.com)."
  );
}
