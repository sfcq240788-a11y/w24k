-- diagnóstico: items colgando de carritos no activos
--
-- Identifica carrito_items asociados a carritos en estado != 'activo'.
-- Estos items son historial legítimo (p.ej. carrito b6b19f21 en estado
-- 'convertido') y NO deben borrarse sin decisión explícita.
--
-- Ejecutar en el SQL editor de Supabase (solo lectura).

SELECT
  ci.id          AS item_id,
  ci.carrito_id,
  ci.pieza_id,
  ci.created_at  AS item_created_at,
  c.estado       AS estado_carrito,
  c.updated_at   AS carrito_updated_at
FROM carrito_items ci
JOIN carritos c ON c.id = ci.carrito_id
WHERE c.estado <> 'activo'
ORDER BY c.estado, ci.created_at;

-- Resultado esperado hoy (pre-fix):
--   Al menos 1 fila: carrito b6b19f21 (estado 'convertido') con items
--   creados horas después de la compra.
--
-- Resultado esperado post-fix:
--   Las mismas filas históricas siguen aquí (no se borran).
--   No aparecen filas nuevas después de que addToCart fue corregido.

-- ── Consultas de criterios de aceptación ─────────────────────────────────────

-- 1. Nunca más de un carrito activo por cliente
SELECT cliente_id, count(*)
FROM carritos
WHERE estado = 'activo'
GROUP BY cliente_id
HAVING count(*) > 1;
-- esperado: 0 filas

-- 2. Ningún item nuevo colgando de un carrito convertido tras el deploy
SELECT ci.id, c.estado
FROM carrito_items ci
JOIN carritos c ON c.id = ci.carrito_id
WHERE c.estado = 'convertido'
  AND ci.created_at > c.updated_at;
-- esperado: 0 filas (el item del carrito b6b19f21 existente
-- tiene created_at > updated_at porque updated_at nunca se actualizó antes
-- del trigger — esa fila es historial, no un bug nuevo)
