import Image from "next/image";
import Link from "next/link";
import { getFeaturedPieces } from "@/lib/data/piezas";
import { ProductCard } from "@/components/ProductCard";
import { resolveImageUrl } from "@/lib/media-url";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const featuredPieces = await getFeaturedPieces();

  // Hero: primera pieza destacada con foto real.
  // Si no hay ninguna, se muestra solo el degradado onyx sin imagen.
  const heroPiece = featuredPieces[0] ?? null;
  const heroMedia = heroPiece?.piezas_media
    ? [...(Array.isArray(heroPiece.piezas_media) ? heroPiece.piezas_media : [heroPiece.piezas_media])]
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0] ?? null
    : null;
  const heroImageUrl = heroMedia ? resolveImageUrl(heroMedia, "1200") : null;

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] md:h-[90vh] bg-onyx flex items-center justify-center overflow-hidden">
        {/* Degradado base siempre presente */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a241b] to-onyx opacity-80" />

        {/* Imagen de la pieza destacada como fondo del hero */}
        {heroImageUrl && (
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <Image
              src={heroImageUrl}
              alt="Joyería fina W24K"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
          <h1 className="font-serif text-[clamp(32px,5vw,56px)] text-ivory leading-tight mb-6">
            Elegancia que <span className="text-gold-light italic font-cormorant font-normal">trasciende</span> el tiempo
          </h1>
          <p className="font-sans text-ivory text-opacity-80 max-w-lg mb-12 text-sm md:text-base leading-relaxed tracking-wide">
            Creaciones exclusivas de alta joyería. Cada pieza es el resultado de la maestría artesanal y el diseño contemporáneo.
          </p>
          <Link
            href="/catalogo"
            className="bg-gold text-onyx font-sans uppercase tracking-[0.1em] text-xs font-semibold py-4 px-10 hover:bg-gold-light transition-colors duration-300"
          >
            Explorar Colección
          </Link>
        </div>
      </section>

      {/* Featured Section */}
      {featuredPieces && featuredPieces.length > 0 && (
        <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-onyx mb-4">Obras Destacadas</h2>
              <p className="font-sans text-taupe text-sm max-w-md leading-relaxed">
                Una selección de nuestras piezas más excepcionales, donde el diseño se encuentra con la perfección artesanal.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="hidden md:inline-block mt-8 md:mt-0 font-sans text-xs uppercase tracking-widest text-onyx border-b border-gold pb-1 hover:text-gold transition-colors"
            >
              Ver Todas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {featuredPieces.map((piece, idx) => {
              const sortedMedia = [
                ...(Array.isArray(piece.piezas_media) ? piece.piezas_media : []),
              ].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
              const firstMedia = sortedMedia[0] ?? null;
              return (
                <ProductCard
                  key={piece.id}
                  slug={piece.slug}
                  name={piece.nombre}
                  price={piece.precio}
                  media={firstMedia}
                  priority={idx === 0}
                />
              );
            })}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link
              href="/catalogo"
              className="inline-block font-sans text-xs uppercase tracking-widest text-onyx border-b border-gold pb-1 hover:text-gold transition-colors"
            >
              Ver Todas
            </Link>
          </div>
        </section>
      )}

      {/* Workshop Presentation Block */}
      <section className="bg-onyx text-ivory py-24 md:py-32 px-6 md:px-12 text-center relative overflow-hidden">
        {/* Subtle decorative line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gold opacity-50" />

        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gold-light mb-8">El Taller W24K</h2>
          <p className="font-cormorant italic text-xl md:text-2xl text-ivory text-opacity-90 leading-relaxed mb-10 max-w-2xl">
            &ldquo;No creamos joyas, forjamos legados.&rdquo;
          </p>
          <div className="space-y-6 font-sans text-sm md:text-base text-taupe leading-loose max-w-2xl text-left md:text-center">
            <p>
              Fundado bajo la premisa de la perfección absoluta, nuestro taller reúne a maestros orfebres de talla internacional. Cada corte, cada engaste y cada pulido es ejecutado con una precisión meticulosa.
            </p>
            <p>
              Seleccionamos únicamente metales de la más alta pureza y gemas con certificaciones de excelencia. En W24K, la tradición orfebre se fusiona con la innovación técnica para dar vida a creaciones que desafían lo ordinario.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gold opacity-50" />
      </section>
    </div>
  );
}
