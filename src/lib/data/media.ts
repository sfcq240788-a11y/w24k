"use server";

import { assertAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { randomBytes } from "crypto";

// ── Constantes ────────────────────────────────────────────────────────────────

const BUCKET = "piezas";
const TARGET_RATIO = 4 / 5; // 0.8
const RATIO_TOLERANCE = 0.02; // ±2%
const MIN_WIDTH = 1200;

const TIPOS_TOMA_VALIDOS = ["f", "d", "i", "m", "e"] as const;
type TipoToma = (typeof TIPOS_TOMA_VALIDOS)[number];

// ── Tipos de retorno ──────────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true } & T)
  | { ok: false; error: string };

// ── Helper: genera hash de 8 caracteres ──────────────────────────────────────

function hash8(): string {
  return randomBytes(4).toString("hex");
}

// ── Helper: sincroniza es_principal con la foto de menor orden ───────────────
// Debe llamarse después de cualquier cambio en piezas_media (subida, borrado,
// reordenamiento). Usa createAdminClient para saltar RLS.

async function syncEsPrincipal(piezaId: string): Promise<void> {
  const supabase = createAdminClient();

  // Obtenemos todas las fotos de la pieza ordenadas por orden ASC
  const { data: fotos } = await supabase
    .from("piezas_media")
    .select("id, orden")
    .eq("pieza_id", piezaId)
    .order("orden", { ascending: true });

  if (!fotos || fotos.length === 0) return;

  // Primero ponemos es_principal = false en todas
  await supabase
    .from("piezas_media")
    .update({ es_principal: false })
    .eq("pieza_id", piezaId);

  // Luego marcamos la de menor orden como principal
  await supabase
    .from("piezas_media")
    .update({ es_principal: true })
    .eq("id", fotos[0].id);
}

// ── Action: subir foto ────────────────────────────────────────────────────────

export async function uploadFotoAction(
  formData: FormData
): Promise<ActionResult<{ mediaId: string }>> {
  // 1. Verificar admin
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  // 2. Extraer y validar parámetros básicos
  const piezaId = (formData.get("pieza_id") as string | null)?.trim();
  const tipoToma = (formData.get("tipo_toma") as string | null)?.trim();
  const file = formData.get("foto") as File | null;

  if (!piezaId) {
    return { ok: false, error: "Falta el ID de la pieza." };
  }
  if (!tipoToma || !TIPOS_TOMA_VALIDOS.includes(tipoToma as TipoToma)) {
    return {
      ok: false,
      error: `Tipo de toma inválido. Valores permitidos: ${TIPOS_TOMA_VALIDOS.join(", ")}.`,
    };
  }
  if (!file || file.size === 0) {
    return { ok: false, error: "No se recibió ningún archivo." };
  }

  // 3. Leer bytes y validar con sharp ANTES de cualquier procesamiento
  const buffer = Buffer.from(await file.arrayBuffer());
  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return {
      ok: false,
      error:
        "El archivo no es una imagen válida o está dañado. Sube un JPEG, PNG o WebP.",
    };
  }

  const { width, height } = metadata;
  if (!width || !height) {
    return {
      ok: false,
      error: "No se pudo determinar las dimensiones de la imagen.",
    };
  }

  // Validación de proporción 4:5 (±2%)
  const ratio = width / height;
  if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
    const ratioStr = ratio.toFixed(2);
    return {
      ok: false,
      error:
        `La proporción de la imagen (${ratioStr}:1) no es 4:5. ` +
        `Sube una imagen con proporción 4:5 (ancho:alto = 4:5, tolerancia ±2%).`,
    };
  }

  // Validación de ancho mínimo
  if (width < MIN_WIDTH) {
    return {
      ok: false,
      error:
        `La imagen debe tener al menos ${MIN_WIDTH} px de ancho ` +
        `(la tuya tiene ${width} px). Sube una imagen de mayor resolución.`,
    };
  }

  // 4. Procesar con sharp: dos variantes WebP, sin metadatos EXIF
  const h = hash8();
  const ruta1200 = `${piezaId}/${tipoToma}-${h}-1200.webp`;
  const ruta600 = `${piezaId}/${tipoToma}-${h}-600.webp`;

  let buf1200: Buffer;
  let buf600: Buffer;
  try {
    // sharp().rotate() aplica la rotación EXIF y luego withMetadata(false)
    // elimina todos los metadatos (incluyendo GPS, cámara, etc.)
    buf1200 = await sharp(buffer)
      .rotate() // aplica orientación EXIF correctamente antes de quitar metadatos
      .resize(1200, 1500, { fit: "fill" })
      .webp({ quality: 82 })
      // No llamar withMetadata(): el comportamiento por defecto de sharp
      // ya elimina todos los metadatos EXIF (incluyendo GPS, cámara, etc.)
      .toBuffer();

    buf600 = await sharp(buffer)
      .rotate()
      .resize(600, 750, { fit: "fill" })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `Error al procesar la imagen: ${msg}`,
    };
  }

  // 5. Subir ambas variantes al bucket (usa service_role para saltarse RLS)
  const supabase = createAdminClient();

  const { error: err1200 } = await supabase.storage
    .from(BUCKET)
    .upload(ruta1200, buf1200, {
      contentType: "image/webp",
      upsert: false,
    });

  if (err1200) {
    return {
      ok: false,
      error: `Error al subir la variante 1200px: ${err1200.message}`,
    };
  }

  const { error: err600 } = await supabase.storage
    .from(BUCKET)
    .upload(ruta600, buf600, {
      contentType: "image/webp",
      upsert: false,
    });

  if (err600) {
    // Limpiar el archivo 1200 ya subido
    await supabase.storage.from(BUCKET).remove([ruta1200]);
    return {
      ok: false,
      error: `Error al subir la variante 600px: ${err600.message}`,
    };
  }

  // 6. Construir URL pública de la variante 1200 (se guarda en `url` para
  //    compatibilidad con el código que solo lee esa columna)
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(ruta1200);

  // 7. Determinar el orden: máximo actual + 1
  const { data: maxRow } = await supabase
    .from("piezas_media")
    .select("orden")
    .eq("pieza_id", piezaId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const orden = (maxRow?.orden ?? 0) + 1;

  // 8. Insertar fila en piezas_media
  const { data: newMedia, error: insertError } = await supabase
    .from("piezas_media")
    .insert({
      pieza_id: piezaId,
      tipo: "foto",
      tipo_toma: tipoToma,
      url: publicUrl,        // URL absoluta de la variante 1200 (compatibilidad)
      ruta_1200: ruta1200,
      ruta_600: ruta600,
      orden,
      es_principal: false,   // syncEsPrincipal lo actualizará
    })
    .select("id")
    .single();

  if (insertError || !newMedia) {
    // Limpiar los archivos subidos
    await supabase.storage.from(BUCKET).remove([ruta1200, ruta600]);
    return {
      ok: false,
      error: `Error al guardar el registro en la base de datos: ${insertError?.message}`,
    };
  }

  // 9. Mantener es_principal sincronizado con la foto de menor orden
  await syncEsPrincipal(piezaId);

  revalidatePath(`/admin/piezas/${piezaId}`);
  revalidatePath("/admin/piezas");
  revalidatePath("/catalogo");
  revalidatePath(`/pieza`, "layout");

  return { ok: true, mediaId: newMedia.id };
}

// ── Action: eliminar foto ─────────────────────────────────────────────────────

export async function deleteFotoAction(
  mediaId: string
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  const supabase = createAdminClient();

  // Obtener la fila primero (necesitamos pieza_id y las rutas)
  const { data: media, error: fetchError } = await supabase
    .from("piezas_media")
    .select("id, pieza_id, ruta_1200, ruta_600")
    .eq("id", mediaId)
    .single();

  if (fetchError || !media) {
    return {
      ok: false,
      error: `No se encontró el registro de media: ${fetchError?.message ?? "ID no existe"}`,
    };
  }

  // Eliminar archivos de Storage (si existen rutas)
  const archivos: string[] = [
    media.ruta_1200,
    media.ruta_600,
  ].filter(Boolean) as string[];

  if (archivos.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(archivos);

    if (storageError) {
      return {
        ok: false,
        error: `Error al eliminar los archivos de Storage: ${storageError.message}`,
      };
    }
  }

  // Eliminar la fila
  const { error: deleteError } = await supabase
    .from("piezas_media")
    .delete()
    .eq("id", mediaId);

  if (deleteError) {
    return {
      ok: false,
      error: `Error al eliminar el registro: ${deleteError.message}`,
    };
  }

  // Resincronizar es_principal para la pieza
  await syncEsPrincipal(media.pieza_id);

  revalidatePath(`/admin/piezas/${media.pieza_id}`);
  revalidatePath("/admin/piezas");
  revalidatePath("/catalogo");
  revalidatePath(`/pieza`, "layout");

  return { ok: true };
}

// ── Action: reordenar fotos ───────────────────────────────────────────────────

/**
 * Recibe un array de IDs en el nuevo orden deseado y reescribe la secuencia
 * orden = 1..n de forma contigua.
 */
export async function reorderFotosAction(
  piezaId: string,
  ordenadoIds: string[]
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  if (!piezaId || ordenadoIds.length === 0) {
    return { ok: false, error: "Parámetros inválidos para reordenar." };
  }

  const supabase = createAdminClient();

  // Actualizar orden = posición + 1 (secuencia contigua 1..n)
  const updates = ordenadoIds.map((id, idx) =>
    supabase
      .from("piezas_media")
      .update({ orden: idx + 1 })
      .eq("id", id)
      .eq("pieza_id", piezaId) // guard extra: solo filas de esta pieza
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return {
      ok: false,
      error: `Error al reordenar: ${firstError.error.message}`,
    };
  }

  await syncEsPrincipal(piezaId);

  revalidatePath(`/admin/piezas/${piezaId}`);
  revalidatePath("/catalogo");
  revalidatePath(`/pieza`, "layout");

  return { ok: true };
}
