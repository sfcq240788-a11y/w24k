-- Migración 050: Configuración de Row Level Security (RLS) para Lanzamiento (Catálogo Público)
-- Fecha: 2026-09-24

-------------------------------------------------------------------------------
-- GRUPO A: Lectura Pública
-- Tablas con acceso de lectura (SELECT) para roles anon y authenticated.
-------------------------------------------------------------------------------

-- 1. piezas (SOLO publicadas)
ALTER TABLE piezas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de piezas publicadas" ON piezas;
CREATE POLICY "Lectura pública de piezas publicadas" ON piezas 
  FOR SELECT 
  USING (estado_publicacion = 'publicada');

-- 2. piezas_media
ALTER TABLE piezas_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de piezas_media" ON piezas_media;
CREATE POLICY "Lectura pública de piezas_media" ON piezas_media 
  FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM piezas WHERE piezas.id = piezas_media.pieza_id 
            AND piezas.estado_publicacion = 'publicada')
  );

-- 3. piezas_piedras
ALTER TABLE piezas_piedras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de piezas_piedras" ON piezas_piedras;
CREATE POLICY "Lectura pública de piezas_piedras" ON piezas_piedras 
  FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM piezas WHERE piezas.id = piezas_piedras.pieza_id 
            AND piezas.estado_publicacion = 'publicada')
  );

-- 4. metales
ALTER TABLE metales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de metales" ON metales;
CREATE POLICY "Lectura pública de metales" ON metales 
  FOR SELECT 
  USING (true);

-- 5. piedras
ALTER TABLE piedras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de piedras" ON piedras;
CREATE POLICY "Lectura pública de piedras" ON piedras 
  FOR SELECT 
  USING (true);

-- 6. tipos_pieza
ALTER TABLE tipos_pieza ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de tipos_pieza" ON tipos_pieza;
CREATE POLICY "Lectura pública de tipos_pieza" ON tipos_pieza 
  FOR SELECT 
  USING (true);

-- 7. tipos_cambio
ALTER TABLE tipos_cambio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de tipos_cambio" ON tipos_cambio;
CREATE POLICY "Lectura pública de tipos_cambio" ON tipos_cambio 
  FOR SELECT 
  USING (true);


-------------------------------------------------------------------------------
-- GRUPO B: Tablas Transaccionales y Privadas (Bloqueadas)
-- Habilitamos RLS SIN políticas. Esto deniega el acceso a anon y authenticated.
-- Solo service_role (usado en nuestras Server Actions) mantendrá el acceso.
-------------------------------------------------------------------------------

ALTER TABLE carrito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_historial_estatus ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_consignacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_consignacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_cuenta_consigna ENABLE ROW LEVEL SECURITY;
