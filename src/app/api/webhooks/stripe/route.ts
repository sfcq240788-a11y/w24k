import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Schema para validar el payload (metadata)
const metadataSchema = z.object({
  pedido_id: z.string().uuid(),
});

// ── PROCESAMIENTO COMPARTIDO ────────────────────────────────────────────────
// Invocado desde "checkout.session.completed" (solo cuando payment_status=paid)
// y desde "checkout.session.async_payment_succeeded".
// Ambos eventos confirman que el cobro ya ocurrió; la lógica de negocio es
// idéntica en los dos casos.
async function procesarPagoCompletado(
  session: Stripe.Checkout.Session
): Promise<NextResponse> {
  const paymentIntentId = session.payment_intent as string;

  // Validar metadata usando Zod
  const { pedido_id } = metadataSchema.parse(session.metadata);

  // Instanciar cliente de supabase con service role
  const supabase = createAdminClient();

  // ── 1. IDEMPOTENCIA ──────────────────────────────────────────────────────
  // Si este payment_intent ya fue registrado, Stripe está reintentando o
  // llegaron ambos eventos (completed + async_payment_succeeded) para el mismo
  // pago. Salimos con 200 sin escribir nada para evitar duplicados.
  const { data: pagoExistente } = await supabase
    .from("pagos")
    .select("id")
    .eq("referencia_externa", paymentIntentId)
    .eq("pasarela", "stripe")
    .maybeSingle();

  if (pagoExistente) {
    console.log(`Webhook idempotente: payment_intent ${paymentIntentId} ya procesado.`);
    return NextResponse.json({ received: true, status: "already_processed" });
  }

  // ── 2. REGISTRAR PAGO (el cobro ya ocurrió, se guarda pase lo que pase) ──
  const montoMxn = session.amount_total ? session.amount_total / 100 : 0;
  const moneda = (session.currency ?? "mxn") as "mxn" | "usd"; // Stripe devuelve minúsculas; moneda_enum es ('mxn','usd')

  const { data: pago, error: pagoError } = await supabase
    .from("pagos")
    .insert({
      pedido_id,
      monto: montoMxn,
      metodo: "tarjeta",              // metodo_pago_enum: 'tarjeta'
      pasarela: "stripe",             // pasarela_pago_enum: 'stripe' (default es 'manual')
      estado_pasarela: "completado",  // estado_pasarela_enum: 'completado'
      referencia_externa: paymentIntentId,
      moneda_pago: moneda,            // moneda_enum: 'mxn' | 'usd' (minúsculas, sin toUpperCase)
      monto_mxn_equivalente: montoMxn,
    })
    .select("id")
    .single();

  if (pagoError || !pago) {
    // Error 23505 = unique_violation: el índice parcial idx_pagos_stripe_referencia_externa
    // disparó porque este payment_intent ya fue registrado (Stripe está reintentando).
    // Respondemos 200 para que Stripe no siga reintentando.
    if (pagoError?.code === "23505") {
      console.log(`Webhook idempotente (DB constraint): payment_intent ${paymentIntentId} ya existe.`);
      return NextResponse.json({ received: true, status: "already_processed" });
    }
    throw new Error(`Error al insertar pago: ${pagoError?.message}`);
  }

  // ── 3. OBTENER ITEMS DEL PEDIDO ──────────────────────────────────────────
  const { data: pedidoItems, error: itemsError } = await supabase
    .from("pedido_items")
    .select("pieza_id, piezas(id, estado_inventario)")
    .eq("pedido_id", pedido_id);

  if (itemsError || !pedidoItems) {
    throw new Error("No se encontraron los items del pedido");
  }

  // ── 4. INTENTO ATÓMICO DE MARCAR CADA PIEZA ─────────────────────────────
  // UPDATE piezas SET estado_inventario='vendida'
  //   WHERE id=$1 AND estado_inventario='disponible'
  // count=0 → doble venta → reembolso + fila en reembolsos con pago_id
  for (const item of pedidoItems) {
    const { count, error: updateError } = await supabase
      .from("piezas")
      .update({ estado_inventario: "vendida" })
      .eq("id", item.pieza_id)
      .eq("estado_inventario", "disponible") // condición atómica
      .select("id", { count: "exact", head: true });

    if (updateError) {
      throw new Error(`Error actualizando pieza ${item.pieza_id}: ${updateError.message}`);
    }

    if (count === 0) {
      // Doble venta detectada: pieza ya no estaba disponible al confirmar
      console.warn(`Doble venta: pieza ${item.pieza_id} ya no disponible. Reembolsando.`);

      // Reembolso en Stripe
      if (paymentIntentId) {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: "duplicate",
        });
      }

      // Registrar reembolso enlazado al pago ya existente (pago_id not null, FK a pagos)
      await supabase.from("reembolsos").insert({
        pago_id: pago.id,
        monto_reembolsado: montoMxn,
        estado: "procesado",
        motivo: `Doble venta: pieza ${item.pieza_id} no disponible al confirmar pago`,
      });

      // Marcar pedido cancelado
      await supabase
        .from("pedidos")
        .update({
          estado: "cancelado",
          motivo: "Doble venta: pieza sin inventario al confirmar pago, reembolso procesado",
        })
        .eq("id", pedido_id);

      return NextResponse.json({ received: true, status: "refunded" });
    }

    // count > 0 → marcado exitoso → registrar movimiento de inventario
    await supabase.from("movimientos_inventario").insert({
      pieza_id: item.pieza_id,
      evento: "venta_confirmada",
      estado_anterior: (item.piezas as any)?.estado_inventario ?? "disponible",
      estado_nuevo: "vendida",
      pedido_id,
    });
  }

  // ── 5. CERRAR PEDIDO ─────────────────────────────────────────────────────
  // estado_pedido_enum: 'abierto' | 'cerrado' | 'cancelado' | 'devuelto'
  // Venta directa pagada completa = 'cerrado'
  await supabase
    .from("pedidos")
    .update({ estado: "cerrado" })
    .eq("id", pedido_id);

  // ── 6. MARCAR CARRITO COMO CONVERTIDO ────────────────────────────────────
  // No se borran carrito_items: el enum tiene 'convertido' exactamente para
  // preservar el historial de qué se compró y con qué modo_pago.
  // Un DELETE en cascada eliminaría ese registro de forma irreversible.
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("cliente_id")
    .eq("id", pedido_id)
    .single();

  if (pedido) {
    await supabase
      .from("carritos")
      .update({ estado: "convertido" })
      .eq("cliente_id", pedido.cliente_id)
      .eq("estado", "activo");
  }

  return NextResponse.json({ received: true });
}

// ── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // ── Checkout completado ────────────────────────────────────────────────
    // Con tarjeta: llega con payment_status="paid" → procesamos de inmediato.
    // Con métodos asíncronos (OXXO): llega con payment_status="unpaid" → solo
    // registramos el evento; el cobro real aún no ocurrió. El procesamiento se
    // dispara cuando llegue async_payment_succeeded.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        console.log(
          `checkout.session.completed recibido con payment_status="${session.payment_status}" ` +
          `(sesión ${session.id}). Esperando async_payment_succeeded para procesar.`
        );
        return NextResponse.json({ received: true, status: "awaiting_payment" });
      }

      try {
        return await procesarPagoCompletado(session);
      } catch (error: any) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // ── Pago asíncrono confirmado (OXXO, etc.) ────────────────────────────
    // El cliente pagó en tienda. Aquí sí ocurrió el cobro real.
    // Ejecuta exactamente el mismo procesamiento que completed+paid.
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        return await procesarPagoCompletado(session);
      } catch (error: any) {
        console.error("Error processing async_payment_succeeded:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // ── Pago asíncrono fallido (voucher vencido, fondos insuficientes, etc.) ─
    // TODO: Decidir qué hacer con el inventario.
    //   Opciones pendientes de definición de negocio:
    //   a) Liberar la pieza de vuelta a "disponible" (permite reventa inmediata,
    //      pero el cliente podría reintentar y ya no encontrar la pieza).
    //   b) Mantener la pieza en su estado actual durante un periodo de gracia y
    //      liberar solo tras N días sin pago confirmado (requiere job schedulado).
    //   c) Notificar al equipo para resolución manual.
    //   Mientras tanto, solo registramos el evento y respondemos 200.
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `Pago asíncrono fallido para sesión ${session.id}. ` +
        `Requiere decisión de negocio sobre liberación de inventario.`
      );
      return NextResponse.json({ received: true, status: "async_payment_failed" });
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
