import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PiezaCard } from "@/lib/types/tienda";
import { estadoLabel, formatoMXN } from "@/lib/types/tienda";

export function TarjetaPieza({ pieza }: { pieza: PiezaCard }) {
  const estado = estadoLabel(pieza.estadoInventario);
  return (
    <Link href={`/pieza/${pieza.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          src="/placeholder.svg"
          alt={pieza.nombre}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <Image
          src="/placeholder.svg"
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {estado && (
          <span className="absolute left-3 top-3 bg-ivory px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-onyx">
            {estado}
          </span>
        )}
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-tight text-onyx">
            {pieza.nombre}
          </h3>
          <ArrowUpRight
            size={15}
            className="mt-1 shrink-0 text-onyx/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-onyx/50">
          {pieza.metal}
        </p>
        <p className="mt-3 text-sm text-onyx/80">
          {formatoMXN.format(pieza.precio)}
        </p>
      </div>
    </Link>
  );
}
