import { getCatalogData } from "@/lib/data/piezas";
import { CatalogView } from "@/components/CatalogView";

export const revalidate = 60;

export default async function CatalogoPage() {
  const catalogData = await getCatalogData();

  return (
    <div className="bg-white min-h-screen">
      {/* Header section for catalog */}
      <div className="bg-onyx text-ivory py-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-gold-light">Colección</h1>
        <p className="font-sans text-sm tracking-widest uppercase text-taupe">Todas las creaciones</p>
      </div>
      
      <CatalogView data={catalogData} />
    </div>
  );
}
