import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/auth/actions';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;

  return (
    <header className="w-full bg-onyx text-ivory py-6 px-6 md:px-12 border-b border-line border-opacity-20 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <Link href="/" className="font-serif text-2xl md:text-3xl font-semibold tracking-wider text-gold-light hover:text-gold transition-colors">
          W24K
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link href="/catalogo" className="font-sans text-sm uppercase tracking-[0.1em] text-ivory hover:text-gold transition-colors">
            Catálogo
          </Link>
          {isAdmin && (
            <Link href="/admin/piezas" className="font-sans text-sm uppercase tracking-[0.1em] text-gold hover:text-ivory transition-colors">
              Panel Admin
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/carrito" className="font-sans text-sm uppercase tracking-[0.1em] text-ivory hover:text-gold transition-colors">
          Carrito
        </Link>
        {user ? (
          <form action={logout}>
            <button type="submit" className="font-sans text-sm uppercase tracking-[0.1em] text-taupe hover:text-ivory transition-colors">
              Salir
            </button>
          </form>
        ) : (
          <Link href="/login" className="font-sans text-sm uppercase tracking-[0.1em] text-taupe hover:text-ivory transition-colors">
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
