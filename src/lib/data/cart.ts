import { createClient } from "@/lib/supabase/server";

export async function getCart() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Buscar carrito activo
  let { data: cart } = await supabase
    .from("carritos")
    .select("*, carrito_items(*, piezas(id, nombre, precio, slug, piezas_media(url)))")
    .eq("cliente_id", user.id)
    .single();

  // Si no existe, crear uno
  if (!cart) {
    const { data: newCart, error } = await supabase
      .from("carritos")
      .insert({ cliente_id: user.id })
      .select("*, carrito_items(*, piezas(id, nombre, precio, slug, piezas_media(url)))")
      .single();

    if (error) {
      console.error(
        "Error creating cart:",
        `[${error.code}] ${error.message}`,
        error.details ? `| details: ${error.details}` : "",
        error.hint   ? `| hint: ${error.hint}`       : "",
      );
      return null;
    }
    cart = newCart;
  }

  return cart;
}

export async function addToCart(piezaId: string, modoPago: "contado" | "consigna" = "contado") {
  const supabase = await createClient();
  const cart = await getCart();
  if (!cart) throw new Error("No cart found and could not be created.");

  const { error } = await supabase
    .from("carrito_items")
    .insert({
      carrito_id: cart.id,
      pieza_id: piezaId,
      modo_pago: modoPago
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
