import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type PiezaRow = Database["public"]["Tables"]["piezas"]["Row"];
export type MetalRow = Database["public"]["Tables"]["metales"]["Row"];
export type TipoPiezaRow = Database["public"]["Tables"]["tipos_pieza"]["Row"];
export type PiedraRow = Database["public"]["Tables"]["piedras"]["Row"];
export type CorteRow = Database["public"]["Tables"]["cortes"]["Row"];

export async function getFeaturedPieces() {
  const { data, error } = await supabase
    .from("piezas")
    .select("id, nombre, precio, slug")
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible")
    .eq("destacada", true)
    .limit(2);

  if (error) {
    console.error("Error fetching featured pieces:", error);
    return [];
  }
  return data;
}

export async function getCatalogData() {
  const { data: pieces } = await supabase
    .from("piezas")
    .select("id, slug, nombre, precio, tipo_pieza_id, metal_id, estado_publicacion, piezas_piedras(piedra_id, corte_id), piezas_media(url, orden)")
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible");

  const { data: types } = await supabase.from("tipos_pieza").select("id, nombre");
  const { data: metals } = await supabase.from("metales").select("id, nombre");
  const { data: stones } = await supabase.from("piedras").select("id, nombre");
  const { data: cuts } = await supabase.from("cortes").select("id, nombre");

  return {
    pieces: pieces || [],
    types: types || [],
    metals: metals || [],
    stones: stones || [],
    cuts: cuts || [],
  };
}

export async function getPieceBySlug(slug: string) {
  const { data, error } = await supabase
    .from("piezas")
    .select(`
      id, 
      slug, 
      nombre, 
      descripcion, 
      precio, 
      peso_gramos, 
      metal_id,
      metales ( nombre ),
      piezas_piedras (
        cantidad,
        kilataje_piedra,
        color,
        claridad,
        piedras ( nombre ),
        cortes ( nombre )
      ),
      piezas_media ( url, orden )
    `)
    .eq("slug", slug)
    .eq("estado_publicacion", "publicada")
    .single();

  return { piece: data, error };
}
