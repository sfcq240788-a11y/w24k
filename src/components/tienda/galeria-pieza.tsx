"use client";

import Image from "next/image";
import { useState } from "react";

type Foto = { url: string; tipoToma: string };

const nombresToma: Record<string, string> = {
  f: "Frontal",
  d: "Tres cuartos derecha",
  i: "Tres cuartos izquierda",
  m: "Macro",
  e: "Escala",
};

export function GaleriaPieza({
  nombre,
  fotos,
}: {
  nombre: string;
  fotos: Foto[];
}) {
  const [active, setActive] = useState(0);
  const foto = fotos[active] ?? fotos[0];

  if (!foto) return null;

  return (
    <div className="grid gap-3 md:grid-cols-[78px_1fr] md:gap-5">
      {/* Thumbnails */}
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
        {fotos.map((item, index) => (
          <button
            key={`${item.tipoToma}-${index}`}
            onClick={() => setActive(index)}
            aria-label={`Ver foto ${nombresToma[item.tipoToma] ?? item.tipoToma}`}
            aria-current={active === index ? "true" : undefined}
            className={`relative h-20 w-16 shrink-0 overflow-hidden bg-surface md:h-[94px] md:w-[75px] ${
              active === index
                ? "ring-1 ring-onyx"
                : "opacity-65 hover:opacity-100"
            }`}
          >
            <Image
              src={item.url}
              alt=""
              fill
              sizes="75px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="order-1 group relative aspect-[4/5] overflow-hidden bg-surface md:order-2">
        <Image
          key={foto.url + active}
          src={foto.url}
          alt={foto.tipoToma ? `${nombre}, vista ${nombresToma[foto.tipoToma] ?? foto.tipoToma}` : `vista ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover transition-transform duration-700 md:group-hover:scale-150"
        />
      </div>
    </div>
  );
}
