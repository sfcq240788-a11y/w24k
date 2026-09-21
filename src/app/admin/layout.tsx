import Link from "next/link";
import { Header } from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
      <Header />
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
