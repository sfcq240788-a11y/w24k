import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import { createPieceAction } from "@/lib/data/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CrearPiezaPage() {
  // Protección de datos: verificar admin
  const guard = await assertAdmin();
  if (!guard.ok) redirect("/");

  const supabase = await createClient();
  const { data: metales } = await supabase
    .from("metales")
    .select("id, nombre");
  const { data: tipos } = await supabase
    .from("tipos_pieza")
    .select("id, nombre");

  // Wrapper void para satisfacer el tipo de form action en Next.js 16
  async function handleCreate(formData: FormData): Promise<void> {
    "use server";
    await createPieceAction(formData);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/piezas"
          className="text-taupe hover:text-gold uppercase tracking-widest text-xs mb-4 inline-block"
        >
          &larr; Volver
        </Link>
        <h1 className="font-serif text-3xl text-onyx">Nueva Pieza</h1>
        <p className="font-sans text-sm text-taupe mt-2">
          Las fotos se gestionan desde la página de edición de cada pieza, después de crearla.
        </p>
      </div>

      <form
        action={handleCreate}
        className="flex flex-col gap-6 bg-white p-8 border border-line shadow-sm"
      >
        <div>
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Nombre
          </label>
          <input
            required
            name="nombre"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              Slug
            </label>
            <input
              required
              name="slug"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              SKU
            </label>
            <input
              required
              name="sku"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Descripción
          </label>
          <textarea
            required
            name="descripcion"
            rows={4}
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              Precio MXN
            </label>
            <input
              required
              type="number"
              step="0.01"
              name="precio"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              Precio Mayoreo MXN
            </label>
            <input
              required
              type="number"
              step="0.01"
              name="precio_mayoreo"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              Peso (Gramos)
            </label>
            <input
              required
              type="number"
              step="0.01"
              name="peso_gramos"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              Metal
            </label>
            <select
              required
              name="metal_id"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold bg-white"
            >
              <option value="">Selecciona...</option>
              {metales?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
              Tipo de Pieza
            </label>
            <select
              required
              name="tipo_pieza_id"
              className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold bg-white"
            >
              <option value="">Selecciona...</option>
              {tipos?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-onyx text-ivory uppercase font-sans tracking-widest py-4 hover:bg-gold transition-colors"
        >
          Crear y agregar fotos
        </button>
      </form>
    </div>
  );
}
