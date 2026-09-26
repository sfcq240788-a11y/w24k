import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { TarjetaPieza } from '@/components/tienda/tarjeta-pieza'
import { GaleriaPieza } from '@/components/tienda/galeria-pieza'
import { DetalleCompra } from '@/components/tienda/detalle-compra'
import { formatoMXN } from '@/lib/types/tienda'
import { getPieceBySlug, getRelatedPieces } from '@/lib/data/piezas'
import { Metadata } from 'next'

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { piece } = await getPieceBySlug(slug);

  if (!piece) return {};

  const descripcionCorta = piece.descripcion ? piece.descripcion.substring(0, 155) : '';

  return {
    title: piece.nombre,
    description: descripcionCorta,
    openGraph: {
      images: piece.fotoPrincipal ? [piece.fotoPrincipal] : [],
    },
  };
}

export default async function PiezaPage({ params }: { params: Params }) {
  const { slug } = await params
  const { piece: pieza, error } = await getPieceBySlug(slug)
  
  if (error || !pieza) notFound()

  const relacionadas = await getRelatedPieces(pieza)
  const vendida = pieza.estadoInventario === 'vendida'

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-8 md:px-12 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-onyx/45">
        <Link href="/" className="hover:text-gold">Inicio</Link>
        <ChevronRight size={12} />
        <Link href="/catalogo" className="hover:text-gold">Catálogo</Link>
        <ChevronRight size={12} />
        <span className="max-w-[180px] truncate text-onyx/75">{pieza.nombre}</span>
      </nav>
      
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:gap-20">
        <GaleriaPieza nombre={pieza.nombre} fotos={pieza.fotos} />
        
        <section className="self-start lg:sticky lg:top-8">
          {vendida && (
            <div className="mb-6 border-y border-gold/50 bg-gold/10 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Pieza vendida</p>
              <p className="mt-2 font-editorial text-lg text-onyx/70">Esta pieza ya encontró dueño.</p>
            </div>
          )}
          
          <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-onyx/45">{pieza.tipoPieza}</p>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] md:text-6xl">{pieza.nombre}</h1>
          <p className="mt-6 text-xl text-onyx/80">{formatoMXN.format(pieza.precio)}</p>
          
          <div className="mt-8 border-y border-onyx/12 py-6">
            <dl className="grid grid-cols-2 gap-y-5 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.15em] text-onyx/45">Metal</dt>
                <dd className="mt-1 text-onyx/80">{pieza.metal}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.15em] text-onyx/45">Peso</dt>
                <dd className="mt-1 text-onyx/80">{pieza.pesoGramos ? `${pieza.pesoGramos} g` : 'Por confirmar'}</dd>
              </div>
            </dl>
            
            {pieza.piedras.length > 0 && (
              <div className="mt-6">
                <dt className="text-[10px] uppercase tracking-[0.15em] text-onyx/45">Piedras</dt>
                <ul className="mt-2 space-y-1 text-sm text-onyx/80">
                  {pieza.piedras.map((piedra) => (
                    <li key={piedra.nombre}>
                      {piedra.cantidad ? `${piedra.cantidad} × ` : ''}{piedra.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {pieza.descripcion && (
            <div className="pt-7">
              <h2 className="font-serif text-2xl">Sobre la pieza</h2>
              <p className="mt-4 font-editorial text-xl leading-relaxed text-onyx/65">{pieza.descripcion}</p>
            </div>
          )}
          
          <DetalleCompra pieza={pieza} />
        </section>
      </div>
      
      {relacionadas.length > 0 && (
        <section className="mt-24 border-t border-onyx/12 pt-12 md:mt-32">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-gold">Descubre más</p>
              <h2 className="font-serif text-4xl">También te puede gustar</h2>
            </div>
            <Link href="/catalogo" className="hidden text-[10px] uppercase tracking-[0.15em] text-onyx/55 underline underline-offset-4 md:block">
              Ver catálogo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {relacionadas.map((item) => (
              <TarjetaPieza key={item.id} pieza={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
