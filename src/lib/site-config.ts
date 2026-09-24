/**
 * Configuración del sitio público.
 *
 * Valores vacíos ("") se ocultan automáticamente en los componentes
 * que los consumen. Nunca se publica "POR DEFINIR".
 */

export const siteConfig = {
  /** Correo de contacto público */
  email: "",
  /** Handle de Instagram (sin @) */
  instagram: "",
  /** Número de WhatsApp (formato internacional, ej. "521234567890") */
  whatsapp: "",
  /** Ciudad donde se ubica el taller */
  ciudad: "",
  /** Texto de la barra de anuncio en el header */
  textoBarraAnuncio: "Piezas hechas en nuestro taller",
  /** Texto al fondo del menú móvil */
  textoMenuMovil: "Diseñado y hecho a mano en México",
  /** Orden base de las categorías en menús y tiles */
  ordenCategorias: ["anillos", "collares", "aretes", "pulseras", "broches"],
  /** Rangos de precio del catálogo */
  rangosPrecio: [
    { slug: "menos-20000", nombre: "Menos de $20,000", min: 0, max: 19999 },
    { slug: "20000-40000", nombre: "$20,000 - $40,000", min: 20000, max: 40000 },
    { slug: "mas-40000", nombre: "Más de $40,000", min: 40001, max: Infinity },
  ],
} as const;
