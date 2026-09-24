import Link from "next/link";
import { Camera } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const navItemsFooter = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "El taller", href: "/taller" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { email, ciudad, instagram } = siteConfig;

  return (
    <footer className="bg-ivory px-5 py-14 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 border-b border-onyx/15 pb-14 md:grid-cols-4">
          {/* Logo + tagline */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="mb-5 block"
              aria-label="Workshop 24K, inicio"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/workshop24k-horizontal.svg"
                alt="Workshop 24K Joyería"
                className="h-auto w-[190px]"
              />
            </Link>
            <p className="max-w-xs font-editorial text-xl text-onyx/65">
              Joyería de alta gama, hecha en taller propio.
            </p>
          </div>

          {/* Explora */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-onyx/45">
              Explora
            </p>
            <div className="flex flex-col gap-3 text-sm">
              {navItemsFooter.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-onyx/45">
              Contacto
            </p>
            <div className="flex flex-col gap-3 text-sm text-onyx/75">
              {email && <span>{email}</span>}
              {ciudad && <span>{ciudad}</span>}
              {instagram && (
                <span className="flex items-center gap-2">
                  <Camera size={15} /> @{instagram}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col justify-between gap-3 pt-6 text-[10px] uppercase tracking-[0.15em] text-onyx/40 md:flex-row">
          <span>© {year} Workshop 24K</span>
          <span>Privacidad · Términos</span>
        </div>
      </div>
    </footer>
  );
}
