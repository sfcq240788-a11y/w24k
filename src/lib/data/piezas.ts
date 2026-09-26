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
  const fotos = media.filter((m: any) => m.tipo === "foto");
  const sortedFotos = [...fotos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  
  const principalObj = sortedFotos.find((m: any) => m.es_principal) || sortedFotos[0];
  const hoverObj = sortedFotos.find((m: any) => m !== principalObj) || sortedFotos[1];

  const fotoPrincipal = principalObj ? resolveImageUrl(principalObj, "600") : null;
  const fotoHover = hoverObj ? resolveImageUrl(hoverObj, "600") : null;

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
      piezas_media!inner ( url, ruta_600, orden, tipo, es_principal )
    `)
    .eq("estado_publicacion", "publicada")
    .eq("destacada", true)
    .eq("piezas_media.tipo", "foto")
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
      piezas_media!inner ( url, ruta_600, orden, tipo, es_principal )
    `)
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible")
    .eq("piezas_media.tipo", "foto");

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

import { siteConfig } from "@/lib/site-config";

export const PAGE_SIZE = 24;

export async function getCatalogOptions() {
  // Fetch minimal data of all available pieces to compute active filter options
  const { data, error } = await supabase
    .from("piezas")
    .select(`
      precio,
      metales!inner ( slug, nombre ),
      tipos_pieza!inner ( slug, nombre_plural ),
      piezas_piedras (
        piedras ( slug, nombre )
      ),
      piezas_media!inner ( url, tipo, es_principal )
    `)
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible")
    .eq("piezas_media.tipo", "foto");

  if (error || !data) {
    return { types: [], metals: [], stones: [], prices: [] };
  }

  const typesMap = new Map<string, string>();
  const metalsMap = new Map<string, string>();
  const stonesMap = new Map<string, string>();
  const priceSet = new Set<string>();

  let totalCount = 0;

  for (const row of data) {
    // Regla A2: excluir si no tiene fotos
    if (!row.piezas_media || (Array.isArray(row.piezas_media) && row.piezas_media.length === 0)) {
      continue;
    }
    
    totalCount++;

    if (row.tipos_pieza) {
      const tp = row.tipos_pieza as any;
      typesMap.set(tp.slug, tp.nombre_plural);
    }
    if (row.metales) {
      const mt = row.metales as any;
      metalsMap.set(mt.slug, mt.nombre);
    }
    if (row.piezas_piedras && Array.isArray(row.piezas_piedras)) {
      for (const pp of row.piezas_piedras) {
        const p = (pp as any).piedras;
        if (p && p.slug !== "ninguna" && p.slug !== "sin-piedra") {
          stonesMap.set(p.slug, p.nombre);
        }
      }
    }
    for (const r of siteConfig.rangosPrecio) {
      if (row.precio >= r.min && row.precio <= r.max) {
        priceSet.add(r.slug);
      }
    }
  }

  return {
    types: Array.from(typesMap.entries()).map(([slug, nombre]) => ({ slug, nombre })),
    metals: Array.from(metalsMap.entries()).map(([slug, nombre]) => ({ slug, nombre })),
    stones: Array.from(stonesMap.entries()).map(([slug, nombre]) => ({ slug, nombre })),
    prices: siteConfig.rangosPrecio.filter((r) => priceSet.has(r.slug)),
    totalCount,
  };
}

export async function getCatalogData(params: {
  tipo?: string;
  metal?: string;
  piedra?: string;
  precio?: string;
  orden?: string;
  page?: number;
}) {
  let query = supabase
    .from("piezas")
    .select(`
      id, slug, nombre, precio, estado_inventario, created_at,
      metales!inner ( nombre, slug ),
      tipos_pieza!inner ( nombre_plural, slug ),
      piezas_media!inner ( url, ruta_600, orden, tipo, es_principal )
    `, { count: 'exact' })
    .eq("estado_publicacion", "publicada")
    .eq("estado_inventario", "disponible")
    .eq("piezas_media.tipo", "foto");

  if (params.tipo) {
    query = query.eq("tipos_pieza.slug", params.tipo);
  }
  if (params.metal) {
    query = query.eq("metales.slug", params.metal);
  }
  
  if (params.piedra) {
    // Filter by stone using an inner join on piezas_piedras -> piedras
    const { data: validPieceIds } = await supabase
      .from("piezas_piedras")
      .select("pieza_id, piedras!inner(slug)")
      .eq("piedras.slug", params.piedra);
      
    if (validPieceIds && validPieceIds.length > 0) {
      query = query.in("id", validPieceIds.map((p) => p.pieza_id));
    } else {
      // Si no hay piezas con esta piedra, forzar resultado vacío
      query = query.in("id", []);
    }
  }

  if (params.precio) {
    const range = siteConfig.rangosPrecio.find((r) => r.slug === params.precio);
    if (range) {
      if (range.min > 0) query = query.gte("precio", range.min);
      if (range.max < Infinity) query = query.lte("precio", range.max);
    }
  }

  if (params.orden === "precio-asc") {
    query = query.order("precio", { ascending: true });
  } else if (params.orden === "precio-desc") {
    query = query.order("precio", { ascending: false });
  } else if (params.orden === "novedades") {
    query = query.order("created_at", { ascending: false });
  } else {
    // Destacadas: true primero
    query = query.order("destacada", { ascending: false }).order("created_at", { ascending: false });
  }

  const page = Math.max(1, params.page || 1);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  query = query.range(start, end);

  const { data, count, error } = await query;

  if (error || !data) {
    console.error("Error fetching catalog data:", error);
    return { pieces: [], count: 0 };
  }

  // Filtrar en memoria por A2 (sin foto) por seguridad, aunque getCatalogOptions ya excluyó las opciones.
  // Es ideal tener un flag "tiene_fotos" en BD, pero lo filtramos post-query.
  const mapped = data.map(mapToPiezaCard).filter((c): c is PiezaCard => c !== null);

  return { pieces: mapped, count: count ?? 0 };
}

import type { PiezaDetalle } from "@/lib/types/tienda";

export async function getPieceBySlug(slug: string): Promise<{ piece: PiezaDetalle | null, error: any }> {
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
      estado_inventario,
      metales ( nombre ),
      tipos_pieza ( nombre_plural ),
      piezas_piedras (
        cantidad,
        kilataje_piedra,
        piedras ( nombre, slug )
      ),
      piezas_media ( url, ruta_1200, ruta_600, tipo_toma, orden, tipo, es_principal )
    `
    )
    .eq("slug", slug)
    .eq("estado_publicacion", "publicada")
    .eq("piezas_media.tipo", "foto")
    .single();

  if (error || !data) {
    return { piece: null, error };
  }

  // Type assertion or robust mapping
  const row = data as any;

  // Process photos
  const media = Array.isArray(row.piezas_media) ? row.piezas_media : [];
  const fotosRow = media.filter((m: any) => m.tipo === "foto");
  const sortedFotos = [...fotosRow].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  
  const principalObj = sortedFotos.find((m: any) => m.es_principal) || sortedFotos[0];
  const hoverObj = sortedFotos.find((m: any) => m !== principalObj) || sortedFotos[1];

  const fotoPrincipal = principalObj ? resolveImageUrl(principalObj, "1200") : null;
  const fotoHover = hoverObj ? resolveImageUrl(hoverObj, "600") : null;

  // Process stones (excluding "ninguna")
  const rawPiedras = Array.isArray(row.piezas_piedras) ? row.piezas_piedras : [];
  const piedras = rawPiedras
    .map((p: any) => {
      const pNameObj = Array.isArray(p.piedras) ? p.piedras[0] : p.piedras;
      return {
        nombre: pNameObj?.nombre || "",
        slug: pNameObj?.slug || "",
        cantidad: p.cantidad,
        kilataje: p.kilataje_piedra
      };
    })
    .filter((p: any) => p.slug !== "ninguna" && p.slug !== "sin-piedra" && p.nombre !== "");

  const piece: PiezaDetalle = {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    precio: row.precio,
    metal: row.metales ? (Array.isArray(row.metales) ? row.metales[0]?.nombre : row.metales.nombre) : "Metal",
    tipoPieza: row.tipos_pieza ? (Array.isArray(row.tipos_pieza) ? row.tipos_pieza[0]?.nombre_plural : row.tipos_pieza.nombre_plural) : "Pieza",
    estadoInventario: row.estado_inventario,
    fotoPrincipal,
    fotoHover,
    descripcion: row.descripcion,
    pesoGramos: row.peso_gramos,
    fotos: sortedFotos.map((m: any) => ({
      url: resolveImageUrl(m, "1200") || m.url,
      tipoToma: m.tipo_toma || "f",
      ruta1200: m.ruta_1200,
      ruta600: m.ruta_600
    })),
    piedras: piedras
  };

  return { piece, error: null };
}

export async function getRelatedPieces(pieza: PiezaDetalle): Promise<PiezaCard[]> {
  const { pieces } = await getStorefrontData();
  const available = pieces.filter((p: PiezaCard) => p.id !== pieza.id);
  const related = available.filter((p: PiezaCard) => p.metal === pieza.metal || p.tipoPieza === pieza.tipoPieza);
  
  if (related.length >= 4) {
    return related.slice(0, 4);
  }
  
  const others = available.filter((p: PiezaCard) => p.metal !== pieza.metal && p.tipoPieza !== pieza.tipoPieza);
  return [...related, ...others].slice(0, 4);
}
