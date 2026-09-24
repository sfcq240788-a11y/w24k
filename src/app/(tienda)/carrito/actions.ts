"use server";

import { addToCart, removeFromCart } from "@/lib/data/cart";
import { revalidatePath } from "next/cache";

export async function addPieceToCart(formData: FormData) {
  const piezaId = formData.get("pieza_id") as string;
  if (!piezaId) return { error: "Pieza no especificada." };

  try {
    await addToCart(piezaId);
    revalidatePath("/carrito");
    revalidatePath("/pieza");
  } catch (error: any) {
    // Incluye el mensaje del guard de disponibilidad de addToCart
    // para que la UI pueda mostrarlo al usuario.
    return { error: error.message as string };
  }
}

export async function removePieceFromCart(formData: FormData) {
  const itemId = formData.get("item_id") as string;
  if (!itemId) return;

  await removeFromCart(itemId);
  revalidatePath("/carrito");
}
