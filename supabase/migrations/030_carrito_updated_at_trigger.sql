-- Migración 030: Trigger BEFORE UPDATE para mantener updated_at en carritos
--
-- Problema:
--   La columna carritos.updated_at existe pero nunca se actualiza: cualquier
--   UPDATE sobre el carrito (p.ej. marcar como 'convertido' en el webhook)
--   deja updated_at con el valor de created_at.
--
-- Solución:
--   Trigger a nivel de base de datos en lugar de actualizarlo en el código.
--   Razón: hay múltiples rutas de escritura sobre carritos (webhook, Server
--   Actions, código admin futuro). Un trigger garantiza que ninguna las omita
--   sin requerir cambios en cada punto de escritura.
--
-- Idempotencia:
--   • CREATE OR REPLACE FUNCTION — seguro re-ejecutar.
--   • DROP TRIGGER IF EXISTS + CREATE — patrón canónico en PG (no existe
--     CREATE TRIGGER IF NOT EXISTS).
--
-- Seguridad:
--   • No borra, altera ni migra filas existentes.
--   • No afecta el carrito b6b19f21 (convertido) ni ningún otro historial.

-- ── 1. FUNCIÓN ───────────────────────────────────────────────────────────────
-- Reutilizable por cualquier tabla que tenga columna updated_at.
-- Creada en el esquema public para mantener consistencia con el resto del proyecto.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── 2. TRIGGER ───────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_carritos_updated_at ON public.carritos;

CREATE TRIGGER trg_carritos_updated_at
  BEFORE UPDATE ON public.carritos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
