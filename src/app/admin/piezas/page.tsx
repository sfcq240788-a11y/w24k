import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import { togglePublicacion } from "@/lib/data/admin";
import Link from "next/link";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/media-url";
import { redirect } from "next/navigation";

export default async function AdminPiezasPage() {
  // Nivel 3 de protección en datos: los datos del admin incluyen piezas no
  // publicadas y precios de mayoreo — se verifica antes de mostrarlos.
  const guard = await assertAdmin();
  if (!guard.ok) redirect("/");

  // Usamos el cliente admin para leer todas las piezas sin filtro de RLS
  const supabase = createAdminClient();
  const { data: piezas } = await supabase
    .from("piezas")
    .select("id, nombre, precio, estado_publicacion, slug, piezas_media(url, ruta_600, orden)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-onyx">Catálogo (Admin)</h1>
        <Link
          href="/admin/piezas/crear"
          className="bg-onyx text-ivory px-6 py-2 uppercase font-sans tracking-widest text-sm hover:bg-gold transition-colors"
        >
          + Nueva Pieza
        </Link>
      </div>

      <div className="overflow-x-auto bg-white border border-line p-4 shadow-sm">
        <table className="w-full text-left font-sans text-sm text-onyx">
          <thead>
            <tr className="border-b border-line text-taupe uppercase tracking-widest text-xs">
              <th className="pb-4 font-normal">Imagen</th>
              <th className="pb-4 font-normal">Nombre</th>
              <th className="pb-4 font-normal">Precio</th>
              <th className="pb-4 font-normal">Estado</th>
              <th className="pb-4 font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {piezas?.map((p) => {
              // Miniatura: variante 600 de la foto de menor orden
              const sortedMedia = [...(p.piezas_media ?? [])].sort(
                (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
              );
              const thumbUrl = sortedMedia[0]
                ? resolveImageUrl(sortedMedia[0], "600")
                : null;

              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="py-4">
                    <div className="relative w-12 h-12 bg-ivory overflow-hidden">
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={p.nombre}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-onyx opacity-40" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 font-serif text-base">{p.nombre}</td>
                  <td className="py-4">${p.precio.toLocaleString("es-MX")}</td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-1 text-xs uppercase tracking-widest ${
                        p.estado_publicacion === "publicada"
                          ? "bg-green-100 text-green-800"
                          : p.estado_publicacion === "archivada"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {p.estado_publicacion}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-4">
                    <Link
                      href={`/admin/piezas/${p.id}`}
                      className="text-gold hover:text-onyx underline"
                    >
                      Editar / Fotos
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await togglePublicacion(p.id, p.estado_publicacion);
                      }}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-taupe hover:text-onyx underline"
                      >
                        {p.estado_publicacion === "publicada"
                          ? "Despublicar"
                          : "Publicar"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {piezas?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-taupe">
                  No hay piezas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
