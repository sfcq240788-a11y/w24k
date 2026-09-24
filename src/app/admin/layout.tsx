import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nivel 2 de protección: el middleware ya redirige si no es admin,
  // pero verificamos aquí también porque los layouts no se re-ejecutan
  // en la navegación entre páginas hermanas del mismo segmento.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = (user.email ?? "").trim().toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {/* Admin header bar */}
      <header className="w-full bg-onyx text-ivory py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-wider text-gold hover:text-gold-light transition-colors"
          >
            W24K
          </Link>
          <Link
            href="/admin/piezas"
            className="font-sans text-xs uppercase tracking-[0.1em] text-ivory hover:text-gold transition-colors"
          >
            Panel Admin
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs text-taupe">{user.email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="font-sans text-xs uppercase tracking-[0.1em] text-taupe hover:text-ivory transition-colors"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-onyx text-ivory p-6">
          <h2 className="font-serif text-2xl mb-8">Admin</h2>
          <nav className="flex flex-col gap-4 font-sans text-sm tracking-widest uppercase">
            <Link
              href="/admin/piezas"
              className="hover:text-gold transition-colors"
            >
              Piezas
            </Link>
            <Link
              href="/admin/pedidos"
              className="hover:text-gold transition-colors"
            >
              Pedidos
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
