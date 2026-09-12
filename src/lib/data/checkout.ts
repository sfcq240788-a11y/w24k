import { createClient } from "@/lib/supabase/server";
import { getCart } from "./cart";
import Stripe from "stripe";
import { getSiteUrl } from "@/lib/site-url";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function processCheckout(direccion: any) {
  const supabase = await createClient();
  const cart = await getCart();

  if (!cart || !cart.carrito_items || cart.carrito_items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Verificar que las piezas estén disponibles antes de armar el pedido
  for (const item of cart.carrito_items) {
    const { data: piece } = await supabase
      .from("piezas")
      .select("estado_publicacion")
      .eq("id", item.pieza_id)
      .single();

    // Asumimos que si no está 'publicada', no está disponible (ya se vendió)
    // El inventario fino lo manejará el webhook, pero esta es una capa preventiva
    if (!piece || piece.estado_publicacion !== "publicada") {
      throw new Error(`La pieza ${item.piezas.nombre} ya no está disponible.`);
    }
  }

  // Guardar dirección si es nueva
  const { data: newDir, error: dirError } = await supabase
    .from("direcciones")
    .insert({
      cliente_id: cart.cliente_id,
      ...direccion,
      es_predeterminada: true
    })
    .select()
    .single();
    
  if (dirError) {
    console.error("Error guardando direccion:", dirError);
  }

  // 1. Crear Pedido
  const total = cart.carrito_items.reduce((acc: number, item: any) => acc + item.piezas.precio, 0);

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: cart.cliente_id,
      tipo: "venta_directa",
      estado: "abierto",
      total_mxn: total,
      total_moneda_cotizada: total,
      moneda_cotizada: "mxn",
      direccion_id: newDir?.id || null,
      direccion_envio_snapshot: direccion, // Guardar Snapshot
    })
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  // 2. Crear Pedido Items
  const pedidoItems = cart.carrito_items.map((item: any) => ({
    pedido_id: pedido.id,
    pieza_id: item.pieza_id,
    precio_acordado: item.piezas.precio,
  }));

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .insert(pedidoItems);

  if (itemsError) throw itemsError;

  // 3. Crear Stripe Checkout Session
  const lineItems = cart.carrito_items.map((item: any) => {
    return {
      price_data: {
        currency: "mxn",
        product_data: {
          name: item.piezas.nombre,
          images: item.piezas.piezas_media?.length > 0 ? [item.piezas.piezas_media[0].url] : [],
        },
        unit_amount: Math.round(item.piezas.precio * 100),
      },
      quantity: 1,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getSiteUrl()}/carrito`,
    client_reference_id: pedido.id, // Muy importante para ligar el Webhook
    metadata: {
      pedido_id: pedido.id,
    },
  });

  return session.url;
}
