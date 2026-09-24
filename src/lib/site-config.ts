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
} as const;
