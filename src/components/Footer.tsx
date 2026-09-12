import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-onyx text-ivory py-16 px-6 md:px-12 mt-auto border-t border-line border-opacity-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h2 className="font-serif text-2xl text-gold-light mb-6">W24K</h2>
          <p className="font-sans text-sm text-taupe leading-relaxed max-w-xs">
            Taller de joyería de talla internacional. Piezas curadas y creadas con los más altos estándares de calidad.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-lg mb-6 tracking-wide">Colecciones</h3>
          <ul className="space-y-4 font-sans text-sm text-taupe">
            <li><Link href="/catalogo" className="hover:text-gold transition-colors">Ver Todo</Link></li>
            <li><Link href="#" className="hover:text-gold transition-colors">Anillos de Compromiso</Link></li>
            <li><Link href="#" className="hover:text-gold transition-colors">Alta Joyería</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-lg mb-6 tracking-wide">Atención al Cliente</h3>
          <ul className="space-y-4 font-sans text-sm text-taupe">
            <li><Link href="#" className="hover:text-gold transition-colors">Contacto</Link></li>
            <li><Link href="#" className="hover:text-gold transition-colors">Envíos y Devoluciones</Link></li>
            <li><Link href="#" className="hover:text-gold transition-colors">Guía de Tallas</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-line border-opacity-20 text-center text-xs text-taupe font-sans">
        &copy; {new Date().getFullYear()} W24K Taller de Joyería. Todos los derechos reservados.
      </div>
    </footer>
  );
}
