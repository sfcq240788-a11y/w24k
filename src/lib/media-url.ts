/**
 * Helper centralizado para construir URLs de imágenes de piezas.
 *
 * Regla única: si existe ruta_600 / ruta_1200, construimos la URL de
 * Supabase Storage. Si no (filas antiguas con picsum u otra URL absoluta),
 * devolvemos el campo `url` tal cual.
 *
 * Ningún componente construye URLs de Storage por su cuenta.
 */

const STORAGE_BASE =
  typeof process !== "undefined"
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    : "";

export type MediaForUrl = {
  url: string;
  ruta_1200?: string | null;
  ruta_600?: string | null;
};

/**
 * Devuelve la URL pública para un registro de piezas_media.
 *
 * @param media  Registro de piezas_media (o subconjunto con los campos necesarios)
 * @param size   "600" para miniaturas, "1200" para ficha o galería completa
 */
export function resolveImageUrl(
  media: MediaForUrl | null | undefined,
  size: "600" | "1200" = "1200"
): string | null {
  if (!media) return null;

  if (size === "600" && media.ruta_600) {
    return `${STORAGE_BASE}/storage/v1/object/public/piezas/${media.ruta_600}`;
  }
  if (size === "1200" && media.ruta_1200) {
    return `${STORAGE_BASE}/storage/v1/object/public/piezas/${media.ruta_1200}`;
  }

  // Fallback: URL absoluta heredada (picsum u otro).
  return media.url || null;
}
