"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

export function Header({
  mostrarCompra = false,
  navItems = [],
}: {
  mostrarCompra?: boolean;
  navItems?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Barra de anuncio */}
      {siteConfig.textoBarraAnuncio && (
        <div className="bg-onyx px-4 py-2 text-center text-[10px] uppercase tracking-[0.22em] text-ivory/80">
          {siteConfig.textoBarraAnuncio}
          {siteConfig.ciudad && <> · {siteConfig.ciudad}</>}
        </div>
      )}

      {/* Header principal */}
      <header className="border-b border-onyx/10 bg-ivory">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 lg:justify-center">
          {/* Hamburguesa móvil */}
          <button
            className="text-onyx lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} strokeWidth={1.4} />
          </button>

          {/* Logo */}
          <Link href="/" aria-label="Workshop 24K, inicio" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/workshop24k-horizontal.svg"
              alt="Workshop 24K Joyería"
              className="h-auto w-[180px]"
            />
          </Link>

          {/* Contenedor derecho (búsqueda y carrito) */}
          <div className="absolute right-5 flex items-center gap-4 lg:right-8">
            <button aria-label="Buscar" className="text-onyx">
              <Search size={19} strokeWidth={1.4} />
            </button>
            {mostrarCompra && (
              <Link href="/carrito" aria-label="Carrito" className="text-onyx">
                <ShoppingBag size={19} strokeWidth={1.4} />
              </Link>
            )}
          </div>
        </div>

        {/* Nav desktop */}
        <nav className="hidden h-12 items-center justify-center gap-10 border-t border-onyx/10 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.18em] text-onyx/75 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Menú móvil */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-onyx/20 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-[82%] max-w-sm bg-ivory px-6 py-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link
                href="/"
                aria-label="Workshop 24K, inicio"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/workshop24k-horizontal.svg"
                  alt="Workshop 24K Joyería"
                  className="h-auto w-[180px]"
                />
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={22} strokeWidth={1.4} />
              </button>
            </div>
            <nav className="mt-20 flex flex-col gap-7">
              {navItems.map((item) => (
                <Link
                  onClick={() => setOpen(false)}
                  key={item.label}
                  href={item.href}
                  className="font-serif text-3xl text-onyx"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {siteConfig.textoMenuMovil && (
              <p className="mt-20 text-[10px] uppercase tracking-[0.2em] text-onyx/45">
                {siteConfig.textoMenuMovil}
              </p>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
