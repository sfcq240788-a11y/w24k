import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "El Taller | " + siteConfig.nombreMarca,
  description: "Conozca nuestro taller. Donde la materia encuentra su forma.",
};

export default function TallerPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative flex min-h-[78vh] items-end justify-center overflow-hidden bg-onyx text-ivory">
        <Image
          src="/workshop24k-horizontal.svg"
          alt="Detalle de una pieza de joyería en el taller"
          fill
          priority
          className="absolute inset-0 object-contain p-20 opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
        <div className="relative flex w-full max-w-4xl flex-col items-center px-5 pb-16 pt-36 text-center md:px-12 md:pb-24">
          <p className="mb-6 text-[10px] uppercase tracking-[0.28em] text-gold">
            Conozca nuestro taller
          </p>
          <h1 className="font-editorial text-5xl leading-[0.94] text-balance md:text-8xl">
            Donde la materia<br />
            <em className="text-ivory/90">encuentra su forma.</em>
          </h1>
          <div className="mt-12 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-ivory/70">
            <ArrowDown size={16} strokeWidth={1} /> Un oficio contemporáneo en Ciudad de México
          </div>
        </div>
      </section>

      {/* Introducción */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 py-20 text-center md:px-12 md:py-32">
        <p className="text-[10px] uppercase tracking-[0.25em] text-onyx/45">
          Nuestro enfoque
        </p>
        <h2 className="font-editorial text-4xl leading-tight text-balance md:text-6xl">
          Joyería con tiempo dentro.
        </h2>
        <p className="mt-4 font-editorial text-2xl leading-snug text-onyx/65 text-balance md:text-3xl">
          Workshop 24K nace de la convicción de que una joya no solo se lleva: se habita. Diseñamos y construimos cada pieza en nuestro propio taller, entre herramientas, fuego y paciencia.
        </p>
      </section>

      {/* Artículos Paso a Paso */}
      <section className="border-y border-onyx/10">
        <article className="mx-auto grid max-w-[1200px] gap-10 border-b border-onyx/10 px-5 py-16 last:border-0 md:grid-cols-2 md:items-center md:gap-20 md:px-12 md:py-24">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted">
            <Image
              src="/workshop24k-isotipo.svg"
              alt="Todo comienza con una elección consciente."
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 object-contain p-12 grayscale-[15%] transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="flex flex-col items-start justify-center md:pr-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">01 / La materia</p>
            <h2 className="mt-6 font-editorial text-4xl leading-tight text-balance md:text-5xl">
              Todo comienza con una elección consciente.
            </h2>
            <p className="mt-6 text-sm leading-7 text-onyx/60 text-pretty">
              Seleccionamos cada metal y cada piedra por su carácter, su origen y la forma en que podrá acompañarte con el tiempo.
            </p>
          </div>
        </article>

        <article className="mx-auto grid max-w-[1200px] gap-10 border-b border-onyx/10 px-5 py-16 last:border-0 md:grid-cols-2 md:items-center md:gap-20 md:px-12 md:py-24">
          <div className="order-2 flex flex-col items-start justify-center md:order-1 md:pl-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">02 / El gesto</p>
            <h2 className="mt-6 font-editorial text-4xl leading-tight text-balance md:text-5xl">
              La mano también diseña.
            </h2>
            <p className="mt-6 text-sm leading-7 text-onyx/60 text-pretty">
              En nuestro taller, el proceso no se apresura. Cada curva, textura y unión se trabaja a mano para preservar lo esencial: la intención.
            </p>
          </div>
          <div className="relative order-1 aspect-[4/5] w-full overflow-hidden bg-surface-muted md:order-2">
            <Image
              src="/workshop24k-isotipo.svg"
              alt="La mano también diseña."
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 object-contain p-12 grayscale-[15%] transition-transform duration-700 hover:scale-105"
            />
          </div>
        </article>

        <article className="mx-auto grid max-w-[1200px] gap-10 border-b border-onyx/10 px-5 py-16 last:border-0 md:grid-cols-2 md:items-center md:gap-20 md:px-12 md:py-24">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted">
            <Image
              src="/workshop24k-isotipo.svg"
              alt="Hecho para quedarse."
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 object-contain p-12 grayscale-[15%] transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="flex flex-col items-start justify-center md:pr-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">03 / La pieza</p>
            <h2 className="mt-6 font-editorial text-4xl leading-tight text-balance md:text-5xl">
              Hecho para quedarse.
            </h2>
            <p className="mt-6 text-sm leading-7 text-onyx/60 text-pretty">
              Pulimos cada detalle hasta encontrar el equilibrio entre presencia y ligereza. El resultado es una pieza que se vuelve parte de tu historia.
            </p>
          </div>
        </article>
      </section>

      {/* CTA Final */}
      <section className="mx-auto flex max-w-[900px] flex-col items-center px-5 py-20 text-center md:px-12 md:py-32">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Más que un objeto</p>
        <h2 className="mt-6 font-editorial text-5xl leading-none text-balance md:text-7xl">
          Diseñado para<br />
          <em>ser recordado.</em>
        </h2>
        <p className="mt-8 max-w-md text-sm leading-7 text-onyx/60 text-balance">
          Conoce las piezas que nacen de este lugar. Objetos únicos, hechos con intención y pensados para acompañarte por muchos años.
        </p>
        <Link
          href="/catalogo"
          className="group mt-12 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-onyx"
        >
          Explorar piezas{" "}
          <ArrowUpRight
            size={16}
            strokeWidth={1.2}
            className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </Link>
      </section>

      {/* Visítanos */}
      <section className="bg-surface-alt px-5 py-16 text-center md:px-12 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-onyx/45">Visítanos</p>
          <h2 className="font-editorial text-4xl text-balance md:text-5xl">
            Una conversación alrededor de una pieza.
          </h2>
          <Link
            href="/contacto"
            className="mt-4 inline-flex items-center gap-2 border-b border-onyx/20 pb-1 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-onyx"
          >
            Agenda una cita <ChevronRight size={16} strokeWidth={1.2} />
          </Link>
        </div>
      </section>
    </main>
  );
}
