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
const LIMIT_PIXELS = 50_000_000; // 50 MP — tope antes de decodificar
const FORMATOS_ADMITIDOS = new Set(["jpeg", "png", "webp"]);

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
  const { data: fotos, error: fetchError } = await supabase
    .from("piezas_media")
    .select("id, orden")
    .eq("pieza_id", piezaId)
    .order("orden", { ascending: true });

  if (fetchError) {
    throw new Error(`syncEsPrincipal(${piezaId}): ${fetchError.message}`);
  }

  if (!fotos || fotos.length === 0) return;

  // Primero ponemos es_principal = false en todas
  const { error: updateAllError } = await supabase
    .from("piezas_media")
    .update({ es_principal: false })
    .eq("pieza_id", piezaId);

  if (updateAllError) {
    throw new Error(`syncEsPrincipal(${piezaId}): ${updateAllError.message}`);
  }

  // Luego marcamos la de menor orden como principal
  const { error: updatePrincipalError } = await supabase
    .from("piezas_media")
    .update({ es_principal: true })
    .eq("id", fotos[0].id);

  if (updatePrincipalError) {
    throw new Error(`syncEsPrincipal(${piezaId}): ${updatePrincipalError.message}`);
  }
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

  // 3. Leer metadata del buffer crudo sin decodificar píxeles.
  //    .metadata() lee solo las cabeceras del archivo; no hay decodificación
  //    de píxeles en este paso. Se usa limitInputPixels:false para que una
  //    imagen > 50 MP llegue a nuestra validación con el mensaje de megapíxeles
  //    en lugar de caer en el catch genérico.
  const buffer = Buffer.from(await file.arrayBuffer());

  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    metadata = await sharp(buffer, { limitInputPixels: false }).metadata();
  } catch {
    return {
      ok: false,
      error:
        "El archivo no es una imagen válida o está dañado. Sube un JPEG, PNG o WebP.",
    };
  }

  // Validar formato admitido
  if (!metadata.format || !FORMATOS_ADMITIDOS.has(metadata.format)) {
    return {
      ok: false,
      error: "Formato no admitido: sube un JPEG, PNG o WebP.",
    };
  }

  // Dimensiones visuales: las orientaciones EXIF 5-8 intercambian ejes físicos
  // (el sensor estaba girado al capturar). Si no hay tag EXIF, orientation es
  // undefined y tratamos como 1 (sin giro) → no hay intercambio.
  const swapAxes = (metadata.orientation ?? 1) >= 5;
  const width  = swapAxes ? metadata.height : metadata.width;
  const height = swapAxes ? metadata.width  : metadata.height;

  if (!width || !height) {
    return {
      ok: false,
      error: "No se pudo determinar las dimensiones de la imagen.",
    };
  }

  // Tope de píxeles antes de decodificar
  const totalPixels = width * height;
  if (totalPixels > LIMIT_PIXELS) {
    const mpRecibidos = (totalPixels / 1_000_000).toFixed(1);
    return {
      ok: false,
      error:
        `La imagen es demasiado grande (${mpRecibidos} MP). ` +
        `El máximo admitido es ${LIMIT_PIXELS / 1_000_000} MP.`,
    };
  }

  // Validación de proporción 4:5 (±2%) — sobre dimensiones ya orientadas
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

  // Validación de ancho mínimo — sobre dimensiones ya orientadas
  if (width < MIN_WIDTH) {
    return {
      ok: false,
      error:
        `La imagen debe tener al menos ${MIN_WIDTH} px de ancho ` +
        `(la tuya tiene ${width} px). Sube una imagen de mayor resolución.`,
    };
  }

  // 4. Procesar con sharp: dos variantes WebP en serie, sin metadatos EXIF.
  //    sharp(buffer, {limitInputPixels}) → .rotate() aplica y descarta la tag
  //    EXIF de orientación. El comportamiento por defecto de sharp elimina
  //    todos los metadatos al convertir (GPS, cámara, timestamps); no se
  //    llama withMetadata() porque eso los conservaría.
  //    await secuencial (no Promise.all) para controlar el pico de memoria.
  const h = hash8();
  const ruta1200 = `${piezaId}/${tipoToma}-${h}-1200.webp`;
  const ruta600  = `${piezaId}/${tipoToma}-${h}-600.webp`;

  let buf1200: Buffer;
  let buf600: Buffer;
  try {
    buf1200 = await sharp(buffer, { limitInputPixels: LIMIT_PIXELS })
      .rotate()
      .resize(1200, 1500, { fit: "fill" })
      .webp({ quality: 82 })
      .toBuffer();

    buf600 = await sharp(buffer, { limitInputPixels: LIMIT_PIXELS })
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

  // 5. Determinar el orden ANTES de subir archivos a Storage.
  //    Máximo actual + 1
  const supabase = createAdminClient();

  const { data: maxRow, error: maxError } = await supabase
    .from("piezas_media")
    .select("orden")
    .eq("pieza_id", piezaId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    return {
      ok: false,
      error: "No se pudo calcular el orden de la foto. Intenta de nuevo.",
    };
  }

  const orden = (maxRow?.orden ?? 0) + 1;

  // 6. Subir ambas variantes al bucket (usa service_role para saltarse RLS)
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
    const { error: removeErr } = await supabase.storage.from(BUCKET).remove([ruta1200]);
    if (removeErr) {
      console.error("[HUERFANOS]", [ruta1200], removeErr.message);
    }
    return {
      ok: false,
      error: `Error al subir la variante 600px: ${err600.message}`,
    };
  }

  // 7. Construir URL pública de la variante 1200 (se guarda en `url` para
  //    compatibilidad con el código que solo lee esa columna)
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(ruta1200);

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
    const { error: removeErr } = await supabase.storage.from(BUCKET).remove([ruta1200, ruta600]);
    if (removeErr) {
      console.error("[HUERFANOS]", [ruta1200, ruta600], removeErr.message);
    }
    return {
      ok: false,
      error: `Error al guardar el registro en la base de datos: ${insertError?.message}`,
    };
  }

  // 9. Mantener es_principal sincronizado con la foto de menor orden
  try {
    await syncEsPrincipal(piezaId);
  } catch (syncErr) {
    console.error("[SYNC_PRINCIPAL]", piezaId, syncErr);
    revalidatePath(`/admin/piezas/${piezaId}`);
    revalidatePath("/admin/piezas");
    revalidatePath("/catalogo");
    revalidatePath(`/pieza`, "layout");
    return {
      ok: false,
      error:
        "La operación se completó, pero no se pudo actualizar la foto principal. Recarga la página.",
    };
  }

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

  // Eliminar primero la fila (operación crítica).
  // Si falla, los archivos siguen intactos → no hay URLs rotas.
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

  // Eliminar archivos de Storage DESPUÉS de que la fila ya no existe.
  // Un archivo huérfano es inofensivo; se registra pero no falla la acción
  // (el usuario ya no puede ver el registro y no hay URLs rotas).
  const archivos: string[] = [
    media.ruta_1200,
    media.ruta_600,
  ].filter(Boolean) as string[];

  if (archivos.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove(archivos);

    if (storageError) {
      console.error(
        `[HUERFANOS] mediaId=${mediaId} rutas=[${archivos.join(", ")}]:`,
        storageError.message,
      );
    }
  }

  // Resincronizar es_principal para la pieza.
  // Se ejecuta siempre, aunque el remove de Storage haya fallado.
  try {
    await syncEsPrincipal(media.pieza_id);
  } catch (syncErr) {
    console.error("[SYNC_PRINCIPAL]", media.pieza_id, syncErr);
    revalidatePath(`/admin/piezas/${media.pieza_id}`);
    revalidatePath("/admin/piezas");
    revalidatePath("/catalogo");
    revalidatePath(`/pieza`, "layout");
    return {
      ok: false,
      error:
        "La operación se completó, pero no se pudo actualizar la foto principal. Recarga la página.",
    };
  }

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

  try {
    await syncEsPrincipal(piezaId);
  } catch (syncErr) {
    console.error("[SYNC_PRINCIPAL]", piezaId, syncErr);
    revalidatePath(`/admin/piezas/${piezaId}`);
    revalidatePath("/catalogo");
    revalidatePath(`/pieza`, "layout");
    return {
      ok: false,
      error:
        "La operación se completó, pero no se pudo actualizar la foto principal. Recarga la página.",
    };
  }

  revalidatePath(`/admin/piezas/${piezaId}`);
  revalidatePath("/catalogo");
  revalidatePath(`/pieza`, "layout");

  return { ok: true };
}
