import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { getFeaturedPieces, getStorefrontData } from "@/lib/data/piezas";
import { TarjetaPieza } from "@/components/tienda/tarjeta-pieza";

import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

function VisualTile({
  image,
  label,
  href,
}: {
  image: string;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative aspect-[4/5] overflow-hidden bg-surface"
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-ivory">
        <span className="font-serif text-2xl">{label}</span>
        <ArrowUpRight size={18} strokeWidth={1.2} />
      </div>
    </Link>
  );
}

export default async function TiendaPage() {
  const [featuredPieces, storefrontData] = await Promise.all([
    getFeaturedPieces(),
    getStorefrontData(),
  ]);

  const order = siteConfig.ordenCategorias;

  const topCategories = storefrontData.types
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      
      const indexA = order.indexOf(a.slug as any);
      const indexB = order.indexOf(b.slug as any);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, 4);

  const topMetals = storefrontData.metals.slice(0, 4);

  return (
    <>
      <section className="relative flex min-h-[600px] items-end overflow-hidden bg-hero-fallback md:min-h-[calc(100vh-136px)]">
        <Image
          src="/placeholder.svg"
          alt="Pieza de joyería artesanal del Workshop 24K"
          fill
          priority
          className="object-cover opacity-75"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/65 via-onyx/10 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-14 md:px-12 md:pb-20">
          <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-ivory/75">
            Joyería de alta gama · Hecha en taller propio
          </p>
          <h1 className="max-w-2xl font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-ivory md:text-8xl">
            El lujo de lo
            <br />
            <em className="font-editorial font-normal">hecho a mano.</em>
          </h1>
          <Link
            href="/catalogo"
            className="mt-9 inline-flex items-center gap-3 border border-ivory/60 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-ivory hover:text-onyx"
          >
            Ver catálogo <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="absolute bottom-7 right-8 hidden items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-ivory/70 md:flex">
          <ArrowDown size={14} /> Explora
        </div>
      </section>

      {topCategories.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-12 md:py-32">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-gold">
                01 / Selección
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.02em] md:text-5xl">
                Explora por categoría
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden text-[10px] uppercase tracking-[0.2em] text-onyx/55 hover:text-gold md:block"
            >
              Ver todo <ArrowUpRight size={13} className="ml-1 inline" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {topCategories.map((item) => (
              <VisualTile
                key={item.slug}
                image={item.foto || "/placeholder.svg"}
                label={item.nombre_plural}
                href={`/catalogo?tipo=${item.slug}`}
              />
            ))}
          </div>
        </section>
      )}

      {topMetals.length > 0 && (
        <section className="border-y border-onyx/10 bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 md:px-12">
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-gold">
              02 / Materiales
            </p>
            <h2 className="font-serif text-4xl tracking-[-0.02em] md:text-5xl">
              Explora por metal
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
              {topMetals.map((item) => (
                <Link
                  key={item.slug}
                  href={`/catalogo?metal=${item.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-full bg-surface-deep">
                    <Image
                      src={item.foto || "/placeholder.svg"}
                      alt=""
                      fill
                      sizes="25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-b border-onyx/20 pb-3">
                    <span className="font-serif text-xl">{item.nombre}</span>
                    <ArrowUpRight size={16} className="text-onyx/45" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredPieces.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-12 md:py-32">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-gold">
                03 / En el taller
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.02em] md:text-5xl">
                Piezas destacadas
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden text-[10px] uppercase tracking-[0.2em] text-onyx/55 hover:text-gold md:block"
            >
              Descubrir piezas <ArrowUpRight size={13} className="ml-1 inline" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
            {featuredPieces.map((pieza) => (
              <TarjetaPieza key={pieza.id} pieza={pieza} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-onyx text-ivory">
        <div className="mx-auto grid max-w-[1400px] md:grid-cols-2">
          <div className="relative min-h-[420px] bg-dark-fallback">
            <Image
              src="/placeholder.svg"
              alt="Manos trabajando una pieza de joyería en el taller"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-65"
            />
          </div>
          <div className="flex flex-col justify-center px-7 py-16 md:px-16 md:py-24">
            <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-gold">
              04 / Nuestro oficio
            </p>
            <h2 className="max-w-md font-serif text-4xl leading-[1.05] md:text-6xl">
              Cada pieza guarda el tiempo de unas manos.
            </h2>
            <p className="mt-7 max-w-md font-editorial text-xl leading-relaxed text-ivory/65">
              En nuestro taller, cada joya toma forma con calma, atención y una
              mirada contemporánea sobre el oficio. Esta es una historia que se
              escribe pieza por pieza.
            </p>
            <Link
              href="/taller"
              className="mt-9 flex w-fit items-center gap-3 border-b border-gold pb-2 text-[10px] uppercase tracking-[0.2em] text-ivory"
            >
              Conoce el taller <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
