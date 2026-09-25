import { createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import { togglePublicacion } from "@/lib/data/admin";
import Link from "next/link";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/media-url";
import { redirect } from "next/navigation";
import { Plus, Eye, EyeOff, Edit2 } from "lucide-react";

export default async function AdminPiezasPage() {
  const guard = await assertAdmin();
  if (!guard.ok) redirect("/");

  const supabase = createAdminClient();
  const { data: piezas } = await supabase
    .from("piezas")
    .select("id, nombre, precio, estado_publicacion, slug, piezas_media(url, ruta_600, orden)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-editorial text-4xl text-onyx md:text-5xl">Catálogo</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-onyx/50">
            Administración de Piezas
          </p>
        </div>
        <Link
          href="/admin/piezas/crear"
          className="group flex w-max items-center gap-2 bg-onyx px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-ivory transition-all hover:bg-gold"
        >
          <Plus size={14} className="transition-transform group-hover:rotate-90" />
          Nueva Pieza
        </Link>
      </div>

      <div className="w-full">
        <table className="w-full text-left font-sans text-sm text-onyx">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-[0.15em] text-onyx/50">
              <th className="pb-4 font-normal pl-4">Pieza</th>
              <th className="pb-4 font-normal">Precio</th>
              <th className="pb-4 font-normal">Estado</th>
              <th className="pb-4 pr-4 text-right font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {piezas?.map((p) => {
              const sortedMedia = [...(p.piezas_media ?? [])].sort(
                (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
              );
              const thumbUrl = sortedMedia[0]
                ? resolveImageUrl(sortedMedia[0], "600")
                : null;
                
              const isPublicada = p.estado_publicacion === "publicada";

              return (
                <tr 
                  key={p.id} 
                  className="group border-b border-line transition-colors hover:bg-surface-alt/50"
                >
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-6">
                      <div className="relative h-16 w-16 flex-shrink-0 bg-surface-muted overflow-hidden">
                        {thumbUrl ? (
                          <Image
                            src={thumbUrl}
                            alt={p.nombre}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-line/20 text-[10px] uppercase text-onyx/30 tracking-widest">
                            No IMG
                          </div>
                        )}
                      </div>
                      <span className="font-editorial text-xl md:text-2xl">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm tracking-wide">
                    ${p.precio.toLocaleString("es-MX")}
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPublicada ? "bg-green-600" : "bg-onyx/30"
                        }`}
                      />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-onyx/70">
                        {p.estado_publicacion}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-6">
                      <Link
                        href={`/admin/piezas/${p.id}`}
                        className="text-onyx/40 transition-colors hover:text-gold"
                        title="Editar pieza"
                        aria-label="Editar pieza"
                      >
                        <Edit2 size={16} strokeWidth={1.5} />
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
                          title={isPublicada ? "Ocultar" : "Publicar"}
                          aria-label={isPublicada ? "Ocultar pieza" : "Publicar pieza"}
                          className="text-onyx/40 transition-colors hover:text-gold"
                        >
                          {isPublicada ? (
                            <EyeOff size={16} strokeWidth={1.5} />
                          ) : (
                            <Eye size={16} strokeWidth={1.5} />
                          )}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {piezas?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-20 text-center text-[10px] uppercase tracking-widest text-onyx/40">
                  El catálogo está vacío.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
