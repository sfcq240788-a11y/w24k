-- ============================================================
-- Migración 040 — Storage bucket "piezas" + columnas en piezas_media
-- Idempotente y aditiva: no modifica ni elimina columnas existentes.
-- ============================================================

-- ── 1. Bucket público para imágenes de piezas ────────────────────────────────
-- Se usa ON CONFLICT DO UPDATE para que sea idempotente y actualice los
-- parámetros si el bucket ya existe con una configuración diferente.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'piezas',
  'piezas',
  true,
  10485760,  -- 10 MB
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. Columnas nuevas en piezas_media ───────────────────────────────────────
-- Aditivas: IF NOT EXISTS garantiza idempotencia.
-- Nullable para no romper las filas existentes que no tienen estas columnas.

-- Tipo de toma fotográfica: f=frontal, d=tres cuartos derecha,
-- i=tres cuartos izquierda, m=macro, e=escala.
-- CHECK permite NULL (filas antiguas) o uno de los valores válidos.
ALTER TABLE piezas_media
  ADD COLUMN IF NOT EXISTS tipo_toma text
    CONSTRAINT piezas_media_tipo_toma_check
    CHECK (tipo_toma IS NULL OR tipo_toma IN ('f', 'd', 'i', 'm', 'e'));

-- Ruta relativa en el bucket "piezas" para la variante 1200×1500.
ALTER TABLE piezas_media
  ADD COLUMN IF NOT EXISTS ruta_1200 text;

-- Ruta relativa en el bucket "piezas" para la variante 600×750.
ALTER TABLE piezas_media
  ADD COLUMN IF NOT EXISTS ruta_600 text;
