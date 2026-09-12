"use server";

import { processCheckout } from "@/lib/data/checkout";
import { redirect } from "next/navigation";

export async function submitCheckout(formData: FormData) {
  const direccion = {
    destinatario: formData.get("destinatario") as string,
    calle: formData.get("calle") as string,
    numero_exterior: formData.get("numero_exterior") as string,
    numero_interior: (formData.get("numero_interior") as string) || null,
    colonia: formData.get("colonia") as string,
    ciudad: formData.get("ciudad") as string,
    estado: formData.get("estado") as string,
    codigo_postal: formData.get("codigo_postal") as string,
    pais: formData.get("pais") as string,
    referencias: (formData.get("referencias") as string) || null,
  };

  let sessionUrl = null;
  try {
    sessionUrl = await processCheckout(direccion);
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }

  if (sessionUrl) {
    redirect(sessionUrl);
  }
}
