import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { siteConfig } from "@/lib/site-config";
import { Box, LogOut, FileText } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="flex min-h-screen flex-col bg-ivory md:flex-row">
      {/* Sidebar (Desktop) / Header (Mobile) */}
      <aside className="flex w-full flex-col border-r border-line bg-surface md:w-64 md:min-h-screen">
        <div className="flex items-center justify-between border-b border-line px-8 py-8 md:justify-center md:py-12">
          <Link
            href="/"
            className="font-serif text-2xl tracking-wider text-onyx transition-colors hover:text-gold"
          >
            W24K
            <span className="ml-2 font-sans text-[9px] uppercase tracking-widest text-gold md:block md:text-center md:ml-0 md:mt-2">
              Admin
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 flex-col justify-between px-6 py-8">
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin/piezas"
              className="group flex items-center gap-3 rounded-md px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-onyx/70 transition-colors hover:bg-ivory hover:text-onyx"
            >
              <Box size={14} className="text-gold transition-transform group-hover:scale-110" />
              Piezas
            </Link>
          </nav>

          <div className="mt-8 border-t border-line pt-8">
            <p className="mb-4 truncate px-4 text-[10px] uppercase tracking-[0.1em] text-onyx/40">
              {user.email}
            </p>
            <form action={logout}>
              <button
                type="submit"
                className="group flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-onyx/70 transition-colors hover:bg-ivory hover:text-onyx"
              >
                <LogOut size={14} className="text-gold transition-transform group-hover:-translate-x-1" />
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-ivory">
        {/* Top Spacer / Breadcrumb area (optional) */}
        <header className="hidden h-24 items-center justify-end border-b border-line px-10 md:flex">
          <p className="font-editorial text-sm italic text-onyx/50">
            {siteConfig.nombreMarca} — Workspace
          </p>
        </header>
        
        <div className="px-6 py-10 md:px-12 md:py-14">
          {children}
        </div>
      </main>
    </div>
  );
}
