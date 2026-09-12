"use server";

import { addToCart, removeFromCart } from "@/lib/data/cart";
import { revalidatePath } from "next/cache";

export async function addPieceToCart(formData: FormData) {
  const piezaId = formData.get("pieza_id") as string;
  if (!piezaId) return;

  await addToCart(piezaId);
  revalidatePath("/carrito");
  revalidatePath(`/pieza`);
}

export async function removePieceFromCart(formData: FormData) {
  const itemId = formData.get("item_id") as string;
  if (!itemId) return;

  await removeFromCart(itemId);
  revalidatePath("/carrito");
}
