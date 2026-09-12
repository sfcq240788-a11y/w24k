import Link from "next/link";
import { Header } from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Header />
      <div className="flex flex-1">
        <aside className="w-64 bg-onyx text-ivory p-6">
          <h2 className="font-serif text-2xl mb-8">Admin</h2>
          <nav className="flex flex-col gap-4 font-sans text-sm tracking-widest uppercase">
            <Link href="/admin/piezas" className="hover:text-gold transition-colors">Piezas</Link>
            <Link href="/admin/pedidos" className="hover:text-gold transition-colors">Pedidos</Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
