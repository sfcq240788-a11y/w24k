import Link from "next/link";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { getCatalogData, getCatalogOptions, PAGE_SIZE } from "@/lib/data/piezas";
import { TarjetaPieza } from "@/components/tienda/tarjeta-pieza";
import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildUrl(
  current: Record<string, string | undefined>,
  changes: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  Object.entries({ ...current, ...changes }).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

function FilterGroup({
  title,
  options,
  current,
  param,
}: {
  title: string;
  options: { slug: string; nombre: string }[];
  current: Record<string, string | undefined>;
  param: string;
}) {
  if (!options || options.length === 0) return null;

  return (
    <details open className="border-b border-onyx/12 py-5 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] uppercase tracking-[0.16em] text-onyx">
        <span>{title}</span>
        <ChevronDown size={15} strokeWidth={1.3} />
      </summary>
      <div className="mt-5 flex flex-col gap-3">
        {options.map((option) => (
          <Link
            key={option.slug}
            href={buildUrl(current, {
              [param]: current[param] === option.slug ? undefined : option.slug,
              page: undefined,
            })}
            className={`text-sm transition-colors hover:text-gold ${
              current[param] === option.slug ? "text-gold" : "text-onyx/65"
            }`}
          >
            {option.nombre}
            {current[param] === option.slug && (
              <span className="ml-2 text-[10px]">—</span>
            )}
          </Link>
        ))}
      </div>
    </details>
  );
}

function Filters({
  current,
  options,
  mobile = false,
}: {
  current: Record<string, string | undefined>;
  options: {
    types: { slug: string; nombre: string }[];
    metals: { slug: string; nombre: string }[];
    stones: { slug: string; nombre: string }[];
    prices: { slug: string; nombre: string }[];
  };
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? "bg-ivory p-6" : "bg-ivory"}>
      {mobile && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Filtrar piezas</h2>
          <Link href={buildUrl(current, {})} aria-label="Cerrar filtros">
            <X size={20} />
          </Link>
        </div>
      )}
      <FilterGroup
        title="Tipo de pieza"
        options={options.types}
        current={current}
        param="tipo"
      />
      <FilterGroup
        title="Metal"
        options={options.metals}
        current={current}
        param="metal"
      />
      <FilterGroup
        title="Piedra"
        options={options.stones}
        current={current}
        param="piedra"
      />
      <FilterGroup
        title="Rango de precio"
        options={options.prices}
        current={current}
        param="precio"
      />
    </div>
  );
}

function ActiveFilters({
  current,
  options,
}: {
  current: Record<string, string | undefined>;
  options: {
    types: { slug: string; nombre: string }[];
    metals: { slug: string; nombre: string }[];
    stones: { slug: string; nombre: string }[];
    prices: { slug: string; nombre: string }[];
  };
}) {
  const getLabelName = (key: string, slug: string) => {
    if (key === "tipo") return options.types.find((o) => o.slug === slug)?.nombre || slug;
    if (key === "metal") return options.metals.find((o) => o.slug === slug)?.nombre || slug;
    if (key === "piedra") return options.stones.find((o) => o.slug === slug)?.nombre || slug;
    if (key === "precio") return options.prices.find((o) => o.slug === slug)?.nombre || slug;
    return slug;
  };

  const activeFilters = (["tipo", "metal", "piedra", "precio"] as const).filter(
    (key) => current[key]
  );

  if (!activeFilters.length) return null;

  return (
    <div className="mb-7 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] uppercase tracking-[0.15em] text-onyx/45">
        Filtrado por
      </span>
      {activeFilters.map((key) => {
        const slug = current[key]!;
        const labelName = getLabelName(key, slug);
        const prefix = key.charAt(0).toUpperCase() + key.slice(1);
        return (
          <Link
            key={key}
            href={buildUrl(current, { [key]: undefined, page: undefined })}
            className="border border-onyx/20 px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-onyx/75 hover:border-gold hover:text-gold"
          >
            {prefix}: {labelName} —
          </Link>
        );
      })}
      <Link
        href="/catalogo"
        className="ml-2 text-[10px] uppercase tracking-[0.14em] text-gold underline underline-offset-4"
      >
        Limpiar todo
      </Link>
    </div>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const current = {
    tipo: valueOf(raw.tipo),
    metal: valueOf(raw.metal),
    piedra: valueOf(raw.piedra),
    precio: valueOf(raw.precio),
    orden: valueOf(raw.orden),
    page: valueOf(raw.page),
  };

  const pageNum = Math.max(1, Number(current.page) || 1);

  const [options, { pieces: visible, count: filteredCount }] = await Promise.all([
    getCatalogOptions(),
    getCatalogData({
      tipo: current.tipo,
      metal: current.metal,
      piedra: current.piedra,
      precio: current.precio,
      orden: current.orden,
      page: pageNum,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  if (pageNum > totalPages && filteredCount > 0) {
    redirect(buildUrl(current, { page: String(totalPages) }));
  }

  const basePath = { ...current, page: undefined };
  const orderOptions = [
    { label: "Destacadas", value: undefined },
    { label: "Precio menor a mayor", value: "precio-asc" },
    { label: "Precio mayor a menor", value: "precio-desc" },
    { label: "Novedades", value: "novedades" },
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-8 md:px-12 md:py-12 w-full">
      <nav
        aria-label="Breadcrumb"
        className="mb-10 text-[10px] uppercase tracking-[0.16em] text-onyx/45"
      >
        <Link href="/" className="hover:text-gold">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-onyx/75">Catálogo</span>
      </nav>
      
      <div className="mb-10 flex flex-col gap-5 border-b border-onyx/12 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-gold">
            Workshop 24K
          </p>
          <h1 className="font-serif text-5xl tracking-[-0.03em] md:text-7xl">
            Colección
          </h1>
          <p className="mt-3 text-sm text-onyx/55">{options.totalCount} piezas</p>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span className="text-[10px] uppercase tracking-[0.15em] text-onyx/45">
            Ordenar por
          </span>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-5 border-b border-onyx/25 py-2 text-sm">
              {orderOptions.find((option) => option.value === current.orden)
                ?.label ?? "Destacadas"}
              <ChevronDown size={14} />
            </summary>
            <div className="absolute right-0 top-full z-20 mt-2 min-w-52 border border-onyx/12 bg-ivory p-2 shadow-lg">
              {orderOptions.map((option) => (
                <Link
                  key={option.label}
                  href={buildUrl(basePath, {
                    orden: option.value,
                    page: undefined,
                  })}
                  className="block px-3 py-2 text-xs hover:bg-surface"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>

      <div className="mb-6 md:hidden">
        <details>
          <summary className="flex cursor-pointer items-center justify-center gap-2 border border-onyx/25 py-3 text-[10px] uppercase tracking-[0.18em] list-none">
            <SlidersHorizontal size={15} /> Filtrar
          </summary>
          <div className="mt-3 border border-onyx/12">
            <Filters current={current} options={options} mobile />
          </div>
        </details>
      </div>

      <div className="grid gap-10 lg:grid-cols-[210px_1fr]">
        <aside className="hidden lg:block">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-onyx/45">
            Filtros
          </p>
          <Filters current={current} options={options} />
        </aside>
        
        <section aria-label="Resultados del catálogo">
          <ActiveFilters current={current} options={options} />
          
          <div className="mb-7 flex items-center justify-between">
            <p className="text-sm text-onyx/55">
              {filteredCount} {filteredCount === 1 ? "pieza" : "piezas"}
            </p>
            <div className="hidden gap-2 md:flex">
              {orderOptions.map((option) => (
                <Link
                  key={option.label}
                  href={buildUrl(basePath, {
                    orden: option.value,
                    page: undefined,
                  })}
                  className={`border px-3 py-2 text-[10px] uppercase tracking-[0.1em] ${
                    current.orden === option.value ||
                    (!current.orden && !option.value)
                      ? "border-onyx bg-onyx text-ivory"
                      : "border-onyx/15 text-onyx/55 hover:border-onyx/40"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
          
          {visible.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
              {visible.map((pieza) => (
                <TarjetaPieza key={pieza.id} pieza={pieza} />
              ))}
            </div>
          ) : (
            <div className="border-y border-onyx/12 py-24 text-center">
              <h2 className="font-serif text-3xl">
                No hay piezas con estos filtros
              </h2>
              <Link
                href="/catalogo"
                className="mt-6 inline-block text-[10px] uppercase tracking-[0.16em] text-gold underline underline-offset-4"
              >
                Limpiar filtros
              </Link>
            </div>
          )}

          {visible.length > 0 && totalPages > 1 && (
            <nav aria-label="Paginación" className="mt-16 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <Link
                    key={number}
                    href={buildUrl(current, { page: String(number) })}
                    aria-current={number === pageNum ? "page" : undefined}
                    className={`flex h-9 w-9 items-center justify-center text-sm ${
                      number === pageNum
                        ? "bg-onyx text-ivory"
                        : "border border-onyx/15 text-onyx/60 hover:border-onyx"
                    }`}
                  >
                    {number}
                  </Link>
                )
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
