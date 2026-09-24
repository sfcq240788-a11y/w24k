import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioPieza from "./FormularioPieza";

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

      <FormularioPieza metales={metales} tipos={tipos} />
    </div>
  );
}
