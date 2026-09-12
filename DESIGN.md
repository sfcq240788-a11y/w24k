# DESIGN.md — Taller de Joyería
### Sistema de diseño — leer antes de generar cualquier UI

> Este archivo es la única fuente de verdad visual del proyecto. No inventes colores, tipografías ni espaciados que no estén aquí — si algo no está cubierto, usa el token más cercano en vez de crear uno nuevo. Este es el mismo sistema ya validado en el moodboard de referencia del cliente (gama alta).

---

## 1. Tono y mood

Vitrina de joyería de alta gama — la referencia visual es James Allen / Blue Nile: precisión, fondos oscuros con luz puntual, sensación de "objeto valioso siendo exhibido", no una tienda genérica. El sitio debe sentirse **curado, no poblado** — más espacio en blanco (o en negro) del que un e-commerce normal usaría. Cuando dudes entre "más denso" o "más espacioso", elige espacioso.

Evita: sombras genéricas de Bootstrap/Material, bordes redondeados exagerados (border-radius > 8px salvo excepciones marcadas abajo), gradientes de colores brillantes, iconografía tipo emoji.

---

## 2. Paleta de color — tokens exactos

```css
--ivory:      #F6F1E6;   /* fondo base, secciones claras */
--onyx:       #15120E;   /* texto principal, fondos oscuros (hero, header) */
--gold:       #B9925A;   /* acento primario — precios, líneas activas, hover */
--gold-light: #E4C88F;   /* acento sobre fondo oscuro (texto/íconos en hero) */
--taupe:      #7B7264;   /* texto secundario, labels, metadatos */
--line:       #DCD2BE;   /* bordes, separadores — nunca gris puro */
--rose:       #C4988A;   /* uso puntual — badges de "destacada" o promociones */
```

**Regla de uso:** el dorado (`--gold`) es el único acento de color saturado en toda la interfaz — se usa para precios, CTAs, estados activos de filtro, y líneas decorativas. No introduzcas azules, verdes ni rojos salvo para estados de sistema (error/éxito), y en ese caso usa tonos apagados, nunca colores "de librería de componentes".

---

## 3. Tipografía

| Uso | Fuente | Peso | Notas |
|---|---|---|---|
| Títulos (H1-H3), nombres de pieza, precios | `Playfair Display` | 600-700 | Serif — es la voz "editorial/lujo" del sitio |
| Cuerpo de texto, UI, botones, labels | `Inter` | 400-600 | Sans — legibilidad en filtros, specs, formularios |
| Citas, subtítulos evocadores, mood copy | `Cormorant Garamond` (itálica) | 400-500 | Solo para frases cortas de tono editorial, nunca en UI funcional |

Escala tipográfica sugerida: H1 `clamp(32px, 5vw, 56px)`, H2 `26-30px`, H3 `15-18px` (uppercase, letter-spacing 0.04-0.1em para labels), body `14-15px`, precios destacados `18-22px` en Playfair Display.

---

## 4. Espaciado y layout

- Grid base de 8px (usa 8/16/24/32/48/64/96 — no valores arbitrarios como 13px o 22px)
- Contenedor máximo: 1180-1200px, con padding lateral de 24px en mobile, 48px+ en desktop
- Márgenes generosos entre secciones (64-96px verticales) — refuerza la sensación curada
- Bordes: 1px sólido en `--line`, casi nunca `box-shadow` difuso — si se necesita profundidad, usa un borde + un fondo ligeramente distinto, no una sombra suave genérica

---

## 5. Patrones de componente

**Tarjeta de pieza (catálogo):** imagen cuadrada o 4:5, fondo `--ivory` o blanco, sin borde visible hasta hover (hover = borde `--gold` 1px + leve elevación). Nombre en Playfair Display 16-18px, metadatos (metal/piedra) en Inter 12px uppercase color `--taupe`, precio en Playfair Display 600 color `--onyx`, con `--gold` solo si está en oferta o es precio de mayoreo.

**Etiqueta de precio ("price tag"):** fondo `--onyx`, texto `--ivory`, punto decorativo circular a la izquierda, esquinas con un lado recto y uno redondeado (8-14px) — evocando una etiqueta física colgante, no un badge de e-commerce genérico.

**Panel de filtros:** fondo `--ivory` sobre fondo blanco de catálogo, filtros básicos siempre visibles (tipo, metal, precio), filtros avanzados (piedra, corte, kilataje) en acordeón colapsado por default. Checkboxes/radios custom — nunca el estilo nativo del navegador.

**Hero/landing:** fondo oscuro (`--onyx` con gradiente radial sutil hacia un tono ligeramente más claro), tipografía en `--ivory`/`--gold-light`, una pieza destacada con foto grande, CTA hacia el catálogo en `--gold` sólido.

**Botones primarios:** fondo `--onyx`, texto `--ivory`, hover invierte a `--gold` de fondo con texto `--onyx`. Sin border-radius mayor a 4px — líneas limpias, no pill-shaped.

**Ficha de pieza:** galería a la izquierda (o arriba en mobile), specs a la derecha en tabla limpia (label en `--taupe` uppercase, valor en `--onyx`), precio prominente, certificación (si aplica) como línea con ícono simple, no un badge llamativo.

---

## 6. Imágenes — durante esta fase de prueba

Las fotos son **placeholders temporales** (servicio de imágenes de prueba) — no optimices el diseño alrededor del contenido específico de esas imágenes, trata cada una como si fuera a ser reemplazada por fotografía real de producto sobre fondo neutro. Mantén proporción consistente (cuadrada o 4:5) en todas las tarjetas del catálogo — es lo único que importa en esta fase.

---

## 7. Antes de generar cualquier pantalla

Revisa esta checklist:
- [ ] ¿Los colores usados están en la lista de la sección 2? (nada inventado)
- [ ] ¿Los títulos usan Playfair Display y el cuerpo usa Inter? (no mezclar)
- [ ] ¿El espaciado sigue la escala de 8px?
- [ ] ¿Hay más espacio en blanco del que se sentiría "normal" en un e-commerce genérico?
- [ ] ¿El único acento de color saturado es `--gold`?