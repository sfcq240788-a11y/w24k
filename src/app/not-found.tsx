import Link from "next/link";

export default function NotFound() {
  return (
    <div className="border-y border-onyx/15 py-24 text-center">
      <h2 className="font-serif text-3xl text-onyx mb-4">No encontramos esta página</h2>
      <p className="text-onyx/60 mb-8">Lo sentimos, la página que buscas no existe o fue movida.</p>
      <Link href="/catalogo" className="text-[11px] uppercase tracking-widest text-onyx underline underline-offset-4 hover:text-gold">
        Volver al catálogo
      </Link>
    </div>
  );
}
