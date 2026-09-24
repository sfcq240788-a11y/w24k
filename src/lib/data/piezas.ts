import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { PiezaCard } from "@/lib/types/tienda";
import { resolveImageUrl } from "@/lib/media-url";

export type PiezaRow = Database["public"]["Tables"]["piezas"]["Row"];
export type MetalRow = Database["public"]["Tables"]["metales"]["Row"] & { slug: string };
export type TipoPiezaRow = Database["public"]["Tables"]["tipos_pieza"]["Row"] & { slug: string; nombre_plural: string };

// Mapeador central de BD a PiezaCard
function mapToPiezaCard(row: any): PiezaCard | null {
  const media = Array.isArray(row.piezas_media) ? row.piezas_media : [];
  const sortedMedia = [...media].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  
  const fotoPrincipal = sortedMedia.length > 0 ? resolveImageUrl(sortedMedia[0], "600") : null;
  const fotoHover = sortedMedia.length > 1 ? resolveImageUrl(sortedMedia[1], "600") : null;

  if (!fotoPrincipal) return null;

  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    precio: row.precio,
    metal: row.metales?.nombre ?? "Metal",
    tipoPieza: row.tipos_pieza?.nombre_plural ?? "Pieza",
    estadoInventario: row.estado_inventario,
    fotoPrincipal,
    fotoHover,
  };
}

export async function getFeaturedPieces(): Promise<PiezaCard[]> {
  const { data, error } = await supabase
    .from("piezas")
    .select(`
      id, nombre, precio, slug, estado_inventario,
      metales ( nombre ),
      tipos_pieza ( nombre_plural ),
      piezas_media(url, ruta_600, orden)
    `)
    .eq("estado_publicacion", "publicada")
    .eq("destacada", true)
    .limit(8);

  if (error || !data) {
    console.error("Error fetching featured pieces:", error);
    return [];
  }
  
  return data
    .map(mapToPiezaCard)
    .filter((c): c is PiezaCard => c !== null);
}

export async function getStorefrontData() {
  const { data: pieces, error } = await supabase
    .from("piezas")
    .select(`
      id, slug, nombre, precio, estado_inventario, created_at,
      metales ( id, nombre, slug ),
      tipos_pieza ( id, nombre, slug, nombre_plural ),
      piezas_media(url, ruta_600, orden)
    `)
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible");

  if (error || !pieces) {
    console.error("Error fetching storefront data:", error);
    return { pieces: [], types: [], metals: [] };
  }

  // Mapeamos para ordenar por created_at desc (las más recientes primero)
  const sortedPieces = pieces.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const cardsMap = new Map<string, PiezaCard>();
  const typesMap = new Map<string, { slug: string; nombre_plural: string; foto: string; total: number }>();
  const metalsMap = new Map<string, { slug: string; nombre: string; foto: string; total: number }>();

  for (const row of sortedPieces) {
    const card = mapToPiezaCard(row);
    if (!card) continue; // Salta piezas sin foto
    
    cardsMap.set(card.id, card);

    if (row.tipos_pieza) {
      const tp = row.tipos_pieza as any;
      if (!typesMap.has(tp.slug)) {
        typesMap.set(tp.slug, { slug: tp.slug, nombre_plural: tp.nombre_plural, foto: card.fotoPrincipal!, total: 1 });
      } else {
        typesMap.get(tp.slug)!.total++;
      }
    }

    if (row.metales) {
      const mt = row.metales as any;
      if (!metalsMap.has(mt.slug)) {
        metalsMap.set(mt.slug, { slug: mt.slug, nombre: mt.nombre, foto: card.fotoPrincipal!, total: 1 });
      } else {
        metalsMap.get(mt.slug)!.total++;
      }
    }
  }

  return {
    pieces: Array.from(cardsMap.values()),
    types: Array.from(typesMap.values()),
    metals: Array.from(metalsMap.values()),
  };
}

export async function getCatalogData() {
  const { data: pieces } = await supabase
    .from("piezas")
    .select("id, slug, nombre, precio, tipo_pieza_id, metal_id, estado_publicacion, piezas_piedras(piedra_id, corte_id), piezas_media(url, ruta_600, orden)")
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible");

  const { data: types } = await supabase
    .from("tipos_pieza")
    .select("id, nombre");
  const { data: metals } = await supabase
    .from("metales")
    .select("id, nombre");
  const { data: stones } = await supabase
    .from("piedras")
    .select("id, nombre");
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
    .select(
      `
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
      piezas_media ( url, ruta_1200, ruta_600, tipo_toma, orden )
    `
    )
    .eq("slug", slug)
    .eq("estado_publicacion", "publicada")
    .single();

  return { piece: data, error };
}
