import { COMPRA_EN_LINEA_HABILITADA } from "@/lib/features";
import type { PiezaDetalle } from "@/lib/types/tienda";

export function DetalleCompra({ pieza }: { pieza: PiezaDetalle }) {
  if (!COMPRA_EN_LINEA_HABILITADA || pieza.estadoInventario !== "disponible") {
    return null;
  }

  return (
    <div className="pt-7">
      <form action={async () => {
        "use server";
        const { createClient } = await import('@/lib/supabase/server');
        const { addPieceToCart } = await import('@/app/(tienda)/carrito/actions');
        const { redirect } = await import('next/navigation');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          redirect('/login?message=Debes+iniciar+sesión+para+añadir+al+carrito');
        }
        
        const formData = new FormData();
        formData.append('pieza_id', pieza.id);
        await addPieceToCart(formData);
        redirect('/carrito');
      }}>
        <button 
          type="submit" 
          className="mt-8 w-full bg-onyx px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold"
        >
          Agregar al carrito
        </button>
        <div className="text-center mt-4 font-sans text-[10px] text-taupe uppercase tracking-widest">
          • Certificado de autenticidad incluido
        </div>
      </form>
    </div>
  );
}
