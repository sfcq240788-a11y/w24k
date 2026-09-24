/** Tipo para las tarjetas del catálogo y la landing. */
export type PiezaCard = {
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  metal: string;
  tipoPieza: string;
  estadoInventario:
    | "disponible"
    | "apartada"
    | "en_consigna"
    | "vendida"
    | "en_revision";
  fotoPrincipal: string | null;
  fotoHover?: string | null;
};

/** Tipo para la ficha de detalle de pieza. */
export type PiezaDetalle = PiezaCard & {
  descripcion: string | null;
  pesoGramos: number | null;
  fotos: { url: string; tipoToma: string }[];
};

/** Formateador de precios en MXN. */
export const formatoMXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Etiqueta de estado visible en la tarjeta. */
export function estadoLabel(
  estado: PiezaCard["estadoInventario"]
): string | null {
  if (estado === "vendida") return "Vendida";
  if (estado === "apartada") return "Apartada";
  return null;
}
