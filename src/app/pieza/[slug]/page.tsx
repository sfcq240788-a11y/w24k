import { getPieceBySlug } from "@/lib/data/piezas";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const revalidate = 60;

export default async function PiezaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const { piece, error } = await getPieceBySlug(resolvedParams.slug);

  if (error || !piece) {
    notFound();
  }

  // Extract images, sort by 'orden' if available
  const media = piece.piezas_media ? (Array.isArray(piece.piezas_media) ? piece.piezas_media : [piece.piezas_media]) : [];
  const images = media
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map((m) => m.url)
    .filter(Boolean);

  const metalName = piece.metales ? (Array.isArray(piece.metales) ? piece.metales[0]?.nombre : piece.metales.nombre) : 'Oro';
  const piedras = piece.piezas_piedras ? (Array.isArray(piece.piezas_piedras) ? piece.piezas_piedras : [piece.piezas_piedras]) : [];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12">
      {/* Back link */}
      <Link href="/catalogo" className="inline-flex items-center space-x-2 text-taupe hover:text-gold transition-colors mb-10 group">
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-sans text-xs uppercase tracking-widest">Volver al catálogo</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Gallery */}
        <div className="w-full lg:w-3/5">
          <ProductGallery images={images} alt={piece.nombre} />
        </div>

        {/* Specs and details */}
        <div className="w-full lg:w-2/5 flex flex-col">
          <div className="mb-4">
            <h1 className="font-serif text-3xl md:text-4xl text-onyx mb-2 leading-tight">
              {piece.nombre}
            </h1>
            <p className="font-sans text-sm text-taupe uppercase tracking-widest">Ref: {piece.slug}</p>
          </div>

          <div className="my-8 pb-8 border-b border-line border-opacity-30">
            <p className="font-serif font-semibold text-3xl text-onyx tracking-wide">
              ${piece.precio.toLocaleString('es-MX')}
            </p>
          </div>

          {/* Description */}
          <div className="mb-12">
            <p className="font-sans text-onyx text-opacity-80 leading-relaxed text-sm">
              {piece.descripcion || "Una pieza de excepcional belleza y diseño artesanal, forjada con los más altos estándares de calidad."}
            </p>
          </div>

          {/* Specs Table */}
          <div className="flex-grow">
            <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-onyx mb-6 font-semibold">Especificaciones</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-line border-opacity-20">
                <span className="font-sans text-xs uppercase text-taupe">Metal</span>
                <span className="font-sans text-sm text-onyx">{metalName || '-'}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-line border-opacity-20">
                <span className="font-sans text-xs uppercase text-taupe">Peso Estimado</span>
                <span className="font-sans text-sm text-onyx">{piece.peso_gramos ? `${piece.peso_gramos}g` : '-'}</span>
              </div>

              {/* Stones Loop */}
              {piedras.map((p, idx: number) => {
                const stoneName = p.piedras ? (Array.isArray(p.piedras) ? p.piedras[0]?.nombre : p.piedras.nombre) : '-';
                const cutName = p.cortes ? (Array.isArray(p.cortes) ? p.cortes[0]?.nombre : p.cortes.nombre) : '';
                return (
                  <div key={idx} className="flex justify-between py-2 border-b border-line border-opacity-20">
                    <span className="font-sans text-xs uppercase text-taupe">Piedra {piedras.length > 1 ? idx + 1 : ''}</span>
                    <div className="text-right">
                      <div className="font-sans text-sm text-onyx">{stoneName} {cutName ? `(${cutName})` : ''}</div>
                      {(p.cantidad || p.kilataje_piedra) && (
                        <div className="font-sans text-xs text-taupe mt-1">
                          {p.cantidad ? `${p.cantidad} pz` : ''} {p.cantidad && p.kilataje_piedra ? '•' : ''} {p.kilataje_piedra ? `${p.kilataje_piedra} ct` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-line">
            <form action={async () => {
              "use server";
              const { createClient } = await import('@/lib/supabase/server');
              const { addPieceToCart } = await import('@/app/carrito/actions');
              const { redirect } = await import('next/navigation');
              const supabase = await createClient();
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) {
                redirect('/login?message=Debes+iniciar+sesión+para+añadir+al+carrito');
              }
              
              const formData = new FormData();
              formData.append('pieza_id', piece.id);
              await addPieceToCart(formData);
              redirect('/carrito');
            }}>
              <button type="submit" className="w-full bg-onyx text-ivory font-sans uppercase tracking-[0.15em] text-sm py-4 hover:bg-gold transition-colors">
                Añadir al Carrito
              </button>
            </form>
            <div className="text-center mt-4 font-sans text-xs text-taupe uppercase tracking-widest">
              • Certificado de autenticidad incluido
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
