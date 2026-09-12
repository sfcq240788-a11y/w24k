"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const piezaSchema = z.object({
  nombre: z.string().min(3),
  slug: z.string().min(3),
  descripcion: z.string().min(10),
  precio: z.coerce.number().positive(),
  precio_mayoreo: z.coerce.number().positive(),
  peso_gramos: z.coerce.number().positive(),
  tipo_pieza_id: z.string().uuid(),
  metal_id: z.string().uuid(),
  estado_publicacion: z.enum(["borrador", "publicada", "archivada"]).default("borrador"),
});

export async function createPieceAction(formData: FormData) {
  const supabase = await createClient();

  const parseResult = piezaSchema.safeParse({
    nombre: formData.get("nombre"),
    slug: formData.get("slug"),
    descripcion: formData.get("descripcion"),
    precio: formData.get("precio"),
    precio_mayoreo: formData.get("precio_mayoreo"),
    peso_gramos: formData.get("peso_gramos"),
    tipo_pieza_id: formData.get("tipo_pieza_id"),
    metal_id: formData.get("metal_id"),
    estado_publicacion: formData.get("estado_publicacion"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.errors.map(e => e.message).join(", ") };
  }

  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) {
    return { error: "Se requiere una foto." };
  }

  // Subir la foto al bucket
  const fileExt = file.name.split('.').pop();
  const fileName = `${parseResult.data.slug}-${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("piezas-fotos")
    .upload(fileName, file);

  if (uploadError) {
    return { error: "Error subiendo la foto: " + uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from("piezas-fotos")
    .getPublicUrl(fileName);

  const { data: newPiece, error: insertError } = await supabase
    .from("piezas")
    .insert(parseResult.data)
    .select()
    .single();

  if (insertError) {
    // Intentar limpiar la imagen
    await supabase.storage.from("piezas-fotos").remove([fileName]);
    return { error: "Error creando la pieza: " + insertError.message };
  }

  const { error: mediaError } = await supabase
    .from("piezas_media")
    .insert({
      pieza_id: newPiece.id,
      url: publicUrlData.publicUrl,
      tipo: "imagen",
      orden: 0,
      es_principal: true,
    });

  if (mediaError) {
    return { error: "Error guardando el media de la pieza: " + mediaError.message };
  }

  revalidatePath("/admin/piezas");
  redirect("/admin/piezas");
}

export async function togglePublicacion(id: string, actual: string) {
  const supabase = await createClient();
  const nuevo = actual === "publicada" ? "borrador" : "publicada";
  
  await supabase
    .from("piezas")
    .update({ estado_publicacion: nuevo })
    .eq("id", id);
    
  revalidatePath("/admin/piezas");
}
