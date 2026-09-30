# Decisiones de diseño — Workshop 24K

Este archivo manda sobre la referencia de v0. Si algo aquí contradice a v0,
gana este archivo. LEER ANTES DE CUALQUIER TAREA VISUAL. Ninguna decisión
registrada aquí se revierte sin instrucción explícita del dueño del proyecto.

## Base
- El diseño de v0 (carpeta v0-referencia) es la base visual de la tienda.
- Paleta: ivory #f7f4ee, onyx #181817, gold #d4a537, más los tokens surface-*,
  hero-fallback, dark-fallback y error definidos en globals.css. Cero hex
  sueltos en componentes.
- Fuentes: Playfair Display (font-serif), Cormorant Garamond (font-editorial),
  Inter (font-sans), cargadas con next/font.

## Tienda (desviaciones aprobadas de v0)
- Header: sin enlace "Colecciones" y sin botón de búsqueda.
- Menú de categorías: generado desde la base, en plural (nombre_plural), solo
  categorías con piezas disponibles. Orden en site-config con slugs
  singulares: anillo, collar, arete, pulsera, broche.
- Tarjetas y tiles: SIEMPRE fotos reales de las piezas. placeholder.svg solo
  como respaldo cuando no hay foto, nunca como valor fijo.
- Hero y bloque del taller en la landing: placeholder hasta tener foto propia.
- /taller: diseño centrado (items-center, grid 50/50). Se aparta de v0 a
  propósito.
- Ficha de pieza: banda "Pieza vendida" de v0. Botón de compra solo si
  COMPRA_EN_LINEA_HABILITADA está activo y la pieza está disponible.
- Sin fotos de Unsplash ni de terceros presentadas como propias del taller.

## Admin y login (no existen en v0)
- Admin: sidebar claro (bg-surface) con navegación Piezas y Cerrar sesión.
  Sin enlaces a secciones que no existen (ej. Pedidos).
- Login: split-screen con isotipo a la izquierda en desktop. Mensajes de
  error con el token --color-error.

## Pendiente de revisión visual
- /taller: los bloques de imagen usan logos como placeholder; revisar si se
  reemplazan por bloques de color liso.

## Registro de ajustes
(Una línea por ajuste aprobado: fecha — página — qué cambió.)
- 2026-09-25 — /taller — diseño centrado, desviación aprobada de v0.
- 2026-09-25 — admin y login — rediseño propio (no existían en v0).
- 2026-09-25 — tienda — se revierten placeholders fijos y botón de búsqueda.