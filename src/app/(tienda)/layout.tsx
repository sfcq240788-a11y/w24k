import { Header } from "@/components/tienda/header";
import { Footer } from "@/components/tienda/footer";
import { COMPRA_EN_LINEA_HABILITADA } from "@/lib/features";
import { getStorefrontData } from "@/lib/data/piezas";
import { siteConfig } from "@/lib/site-config";

export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getStorefrontData();

  const order = siteConfig.ordenCategorias;

  const navItems = data.types
    .sort((a, b) => {
      const indexA = order.indexOf(a.slug as any);
      const indexB = order.indexOf(b.slug as any);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.slug.localeCompare(b.slug);
    })
    .map((t) => ({
      label: t.nombre_plural,
      href: `/catalogo?tipo=${t.slug}`,
    }));

  return (
    <>
      <Header
        mostrarCompra={COMPRA_EN_LINEA_HABILITADA}
        navItems={navItems}
      />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
