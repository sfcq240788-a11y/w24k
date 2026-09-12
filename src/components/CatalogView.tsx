"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ChevronDown, ChevronUp } from "lucide-react";

import { type getCatalogData } from "@/lib/data/piezas";

type CatalogData = Awaited<ReturnType<typeof getCatalogData>>;

export function CatalogView({ data }: { data: CatalogData }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [selectedStones, setSelectedStones] = useState<string[]>([]);
  const [selectedCuts, setSelectedCuts] = useState<string[]>([]);
  
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Filtering logic
  const filteredPieces = useMemo(() => {
    return data.pieces.filter((piece) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(piece.tipo_pieza_id || "")) return false;
      if (selectedMetals.length > 0 && !selectedMetals.includes(piece.metal_id || "")) return false;
      
      // If we had the data joined, we would filter stones and cuts here.
      // For this visual test, if the arrays aren't joined properly, we might just mock the filter.
      // Assuming 'piezas_piedras' array might be joined:
      if (selectedStones.length > 0) {
        const hasStone = piece.piezas_piedras?.some((p) => p.piedra_id && selectedStones.includes(p.piedra_id)) || false;
        if (!hasStone) return false;
      }
      if (selectedCuts.length > 0) {
        const hasCut = piece.piezas_piedras?.some((p) => p.corte_id && selectedCuts.includes(p.corte_id)) || false;
        if (!hasCut) return false;
      }

      return true;
    });
  }, [data.pieces, selectedTypes, selectedMetals, selectedStones, selectedCuts]);

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[], id: string) => {
    if (current.includes(id)) {
      setter(current.filter((v) => v !== id));
    } else {
      setter([...current, id]);
    }
  };

  const FilterCheckbox = ({ id, label, current, setter }: { id: string; label: string; current: string[]; setter: React.Dispatch<React.SetStateAction<string[]>> }) => (
    <label className="flex items-center space-x-3 cursor-pointer group mb-3">
      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${current.includes(id) ? 'bg-gold border-gold' : 'border-line group-hover:border-gold'}`}>
        {current.includes(id) && (
          <svg className="w-3 h-3 text-onyx" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="font-sans text-sm text-onyx group-hover:text-gold transition-colors">{label}</span>
    </label>
  );

  return (
    <div className="flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-24 gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <h2 className="font-serif text-2xl text-onyx mb-8 tracking-wide">Filtros</h2>
        
        {/* Basic Filters (Always visible) */}
        <div className="mb-8 border-b border-line border-opacity-30 pb-6">
          <h3 className="font-sans text-xs uppercase tracking-widest text-taupe mb-5">Categoría</h3>
          <div className="space-y-1">
            {data.types.map(t => (
              <FilterCheckbox key={t.id} id={t.id} label={t.nombre} current={selectedTypes} setter={setSelectedTypes} />
            ))}
            {data.types.length === 0 && <span className="text-sm text-taupe">No hay datos</span>}
          </div>
        </div>

        <div className="mb-8 border-b border-line border-opacity-30 pb-6">
          <h3 className="font-sans text-xs uppercase tracking-widest text-taupe mb-5">Metal</h3>
          <div className="space-y-1">
            {data.metals.map(m => (
              <FilterCheckbox key={m.id} id={m.id} label={m.nombre} current={selectedMetals} setter={setSelectedMetals} />
            ))}
            {data.metals.length === 0 && <span className="text-sm text-taupe">No hay datos</span>}
          </div>
        </div>
        
        {/* Advanced Filters (Accordion) */}
        <div className="border-b border-line border-opacity-30">
          <button 
            className="w-full flex items-center justify-between py-5 group"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <h3 className="font-sans text-xs uppercase tracking-widest text-taupe group-hover:text-gold transition-colors">Filtros Avanzados</h3>
            {advancedOpen ? <ChevronUp className="w-4 h-4 text-taupe" /> : <ChevronDown className="w-4 h-4 text-taupe" />}
          </button>
          
          {advancedOpen && (
            <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mb-6">
                <h4 className="font-sans text-[11px] uppercase tracking-wider text-taupe mb-3 opacity-80">Piedra</h4>
                <div className="space-y-1">
                  {data.stones.map(s => (
                    <FilterCheckbox key={s.id} id={s.id} label={s.nombre} current={selectedStones} setter={setSelectedStones} />
                  ))}
                  {data.stones.length === 0 && <span className="text-sm text-taupe">No hay datos</span>}
                </div>
              </div>
              <div>
                <h4 className="font-sans text-[11px] uppercase tracking-wider text-taupe mb-3 opacity-80">Corte</h4>
                <div className="space-y-1">
                  {data.cuts.map(c => (
                    <FilterCheckbox key={c.id} id={c.id} label={c.nombre} current={selectedCuts} setter={setSelectedCuts} />
                  ))}
                  {data.cuts.length === 0 && <span className="text-sm text-taupe">No hay datos</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Grid */}
      <main className="flex-grow">
        <div className="flex justify-between items-center mb-8 border-b border-line border-opacity-20 pb-4">
          <span className="font-sans text-sm text-taupe">
            {filteredPieces.length} {filteredPieces.length === 1 ? 'pieza' : 'piezas'}
          </span>
          <div className="font-sans text-xs uppercase tracking-widest text-taupe">
            Ordenar por
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
          {filteredPieces.map((piece) => (
            <ProductCard
              key={piece.id}
              slug={piece.slug}
              name={piece.nombre}
              price={piece.precio}
              imageUrl={piece.piezas_media && piece.piezas_media.length > 0 ? piece.piezas_media[0].url : undefined}
            />
          ))}
          {filteredPieces.length === 0 && (
            <div className="col-span-full py-20 text-center text-taupe font-sans text-lg">
              No se encontraron piezas con estos filtros.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
