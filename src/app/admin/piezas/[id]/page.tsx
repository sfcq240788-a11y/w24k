import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FotoManager } from "./FotoManager";

export default async function EditarPiezaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Protección de datos nivel 3
  const guard = await assertAdmin();
  if (!guard.ok) redirect("/");

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: pieza, error } = await supabase
    .from("piezas")
    .select(
      `id, nombre, slug, estado_publicacion,
       piezas_media(id, url, ruta_1200, ruta_600, tipo_toma, orden)`
    )
    .eq("id", id)
    .single();

  if (error || !pieza) notFound();

  // Ordenar las fotos por orden ASC antes de pasarlas al componente cliente
  const fotosOrdenadas = [
    ...(Array.isArray(pieza.piezas_media)
      ? pieza.piezas_media
      : pieza.piezas_media
      ? [pieza.piezas_media]
      : []),
  ].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/piezas"
          className="text-taupe hover:text-gold uppercase tracking-widest text-xs mb-4 inline-block"
        >
          &larr; Volver al catálogo
        </Link>
        <h1 className="font-serif text-3xl text-onyx">{pieza.nombre}</h1>
        <p className="font-sans text-xs text-taupe uppercase tracking-widest mt-1">
          {pieza.slug} &bull; {pieza.estado_publicacion}
        </p>
      </div>

      {/* Separador */}
      <div className="border-t border-line mb-8" />

      {/* Gestión de fotos */}
      <section>
        <h2 className="font-serif text-xl text-onyx mb-6">Gestión de fotos</h2>
        <FotoManager piezaId={pieza.id} initialFotos={fotosOrdenadas} />
      </section>
    </div>
  );
}
