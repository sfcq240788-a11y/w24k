import Link from "next/link";

/**
 * Logo de Workshop 24K.
 *
 * Server Component que renderiza el SVG desde /public como <img>.
 * fill="currentColor" en el SVG funciona como negro por defecto con <img>,
 * lo cual coincide con el uso de v0 (sobre fondo marfil = texto onyx).
 * Para el footer (sobre fondo marfil igualmente), se ve idéntico.
 */
export function Logo({ className = "h-auto w-[180px]" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Workshop 24K, inicio" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/workshop24k-horizontal.svg"
        alt="Workshop 24K Joyería"
        className={className}
      />
    </Link>
  );
}
