import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-guard";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioPieza from "./FormularioPieza";
import { ArrowLeft } from "lucide-react";

export default async function CrearPiezaPage() {
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
    <div className="mx-auto max-w-2xl animate-in fade-in duration-700">
      <div className="mb-10">
        <Link
          href="/admin/piezas"
          className="group mb-8 flex w-max items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-onyx/50 transition-colors hover:text-gold"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Volver al Catálogo
        </Link>
        <h1 className="font-editorial text-4xl text-onyx md:text-5xl">Nueva Pieza</h1>
        <p className="mt-4 text-xs tracking-widest text-onyx/50 uppercase">
          Detalles de la joya
        </p>
      </div>

      <div className="bg-white p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] border border-line/40">
        <div className="mb-8 border-b border-line pb-6">
          <p className="text-xs text-onyx/60 leading-relaxed text-pretty">
            Registra los datos iniciales de la pieza. Las fotografías y el orden visual 
            se podrán gestionar desde la página de edición una vez guardados estos datos básicos.
          </p>
        </div>
        
        <FormularioPieza metales={metales} tipos={tipos} />
      </div>
    </div>
  );
}
