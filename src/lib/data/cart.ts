import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el carrito ACTIVO del usuario autenticado, con sus items.
 *
 * Esta función es de solo lectura (SELECT). No crea carritos.
 * La creación ocurre en addToCart, disparada por acción explícita del usuario,
 * para evitar inserciones en cada render del Server Component.
 *
 * Retorna null en dos casos:
 *   - El usuario no está autenticado.
 *   - El usuario está autenticado pero no tiene carrito en estado 'activo'.
 * El componente que consume getCart debe distinguir ambos casos comprobando
 * la sesión de forma independiente si necesita mensajes distintos.
 */
export async function getCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: cart } = await supabase
    .from("carritos")
    .select("*, carrito_items(*, piezas(id, nombre, precio, slug, piezas_media(url)))")
    .eq("cliente_id", user.id)
    .eq("estado", "activo")   // Solo carritos activos — no reutilizar convertidos ni abandonados
    .maybeSingle();           // maybeSingle: 0 filas → null, no error

  return cart ?? null;
}

export async function addToCart(
  piezaId: string,
  modoPago: "contado" | "consigna" = "contado"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Debes iniciar sesión para agregar al carrito.");

  // ── GUARD DE DISPONIBILIDAD ──────────────────────────────────────────────
  // Verificación de conveniencia: detecta el caso común donde la pieza ya no
  // está disponible antes de insertar el item al carrito.
  //
  // IMPORTANTE — condición de carrera: entre este SELECT y el INSERT de
  // carrito_items hay una ventana en la que otro cliente podría comprar la
  // pieza. Este guard NO garantiza exclusividad; su propósito es dar una
  // respuesta clara en el caso habitual (pieza ya vendida). La protección
  // real contra doble venta reside en el webhook (update atómico con
  // WHERE estado_inventario = 'disponible') y no debe debilitarse bajo ninguna
  // circunstancia asumiendo que este check la reemplaza.
  const { data: pieza } = await supabase
    .from("piezas")
    .select("estado_inventario")
    .eq("id", piezaId)
    .single();

  if (!pieza || pieza.estado_inventario !== "disponible") {
    throw new Error(
      "Esta pieza ya no está disponible. Es posible que alguien más la haya adquirido."
    );
  }

  // ── OBTENER O CREAR CARRITO ACTIVO ───────────────────────────────────────
  // Busca un carrito en estado 'activo'. Si no existe, crea uno nuevo.
  // Un cliente puede tener N carritos en estado 'convertido' o 'abandonado'
  // (historial de compras); aquí solo trabajamos con el activo.
  let { data: cart } = await supabase
    .from("carritos")
    .select("id")
    .eq("cliente_id", user.id)
    .eq("estado", "activo")
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error: cartError } = await supabase
      .from("carritos")
      .insert({ cliente_id: user.id, estado: "activo" })
      .select("id")
      .single();

    if (cartError || !newCart) {
      throw new Error(`No se pudo crear el carrito: ${cartError?.message}`);
    }
    cart = newCart;
  }

  // ── INSERTAR ITEM ────────────────────────────────────────────────────────
  const { error } = await supabase.from("carrito_items").insert({
    carrito_id: cart.id,
    pieza_id: piezaId,
    modo_pago: modoPago,
  });

  if (error) throw error;
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("carrito_items")
    .delete()
    .eq("id", itemId);

  if (error) throw error;
}
