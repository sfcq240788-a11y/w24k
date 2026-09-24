"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const piezaSchema = z.object({
  nombre: z.string().min(3),
  sku: z.string().min(1),
  slug: z.string().min(3),
  descripcion: z.string().min(10),
  precio: z.coerce.number().positive(),
  precio_mayoreo: z.coerce.number().positive(),
  peso_gramos: z.coerce.number().positive(),
  tipo_pieza_id: z.string().uuid(),
  metal_id: z.string().uuid(),
  estado_publicacion: z
    .enum(["borrador", "publicada", "archivada"])
    .default("borrador"),
});

export async function createPieceAction(
  prevState: { error: string } | void,
  formData: FormData
): Promise<{ error: string } | void> {
  // Verificar admin antes de cualquier operación
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const rawData: Record<string, any> = {
    nombre: formData.get("nombre"),
    sku: formData.get("sku"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion"),
    precio: formData.get("precio"),
    precio_mayoreo: formData.get("precio_mayoreo"),
    peso_gramos: formData.get("peso_gramos"),
    tipo_pieza_id: formData.get("tipo_pieza_id"),
    metal_id: formData.get("metal_id"),
  };

  if (formData.get("estado_publicacion") !== null) {
    rawData.estado_publicacion = formData.get("estado_publicacion");
  }

  const parseResult = piezaSchema.safeParse(rawData);

  if (!parseResult.success) {
    // Zod v4: issues live at error.issues, not error.errors
    const issues = parseResult.error.issues ?? (parseResult.error as any).errors ?? [];
    return {
      error: issues.map((e: { message: string }) => e.message).join(", "),
    };
  }

  const supabase = await createAdminClient();

  const { data: newPiece, error: insertError } = await supabase
    .from("piezas")
    .insert(parseResult.data)
    .select("id")
    .single();

  if (insertError || !newPiece) {
    return {
      error: `Error al crear la pieza: ${insertError?.message}`,
    };
  }

  // Las fotos se gestionan desde /admin/piezas/[id]
  revalidatePath("/admin/piezas");
  redirect(`/admin/piezas/${newPiece.id}`);
}

export async function togglePublicacion(
  id: string,
  actual: string
): Promise<{ error: string } | void> {
  // Verificar admin en el servidor — el middleware ya protege la ruta,
  // pero las funciones de datos se verifican de forma independiente
  // porque los layouts no se re-ejecutan en navegación entre páginas hermanas.
  const guard = await assertAdmin();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createAdminClient();
  const nuevo = actual === "publicada" ? "borrador" : "publicada";

  const { error } = await supabase
    .from("piezas")
    .update({ estado_publicacion: nuevo })
    .eq("id", id);

  if (error) {
    return { error: `Error al cambiar el estado: ${error.message}` };
  }

  revalidatePath("/admin/piezas");
}
