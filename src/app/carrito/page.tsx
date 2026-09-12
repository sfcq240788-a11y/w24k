import { getCart } from "@/lib/data/cart";
import { createClient } from "@/lib/supabase/server";
import { removePieceFromCart } from "./actions";
import Link from "next/link";
import Image from "next/image";

export default async function CarritoPage() {
  // Verificamos la sesión de forma independiente para distinguir dos casos
  // que getCart() no puede separar por sí solo (ambos devuelven null):
  //   1. Usuario no autenticado → invitación a iniciar sesión
  //   2. Usuario autenticado sin carrito activo → estado vacío con CTA al catálogo
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 justify-center items-center gap-4 mx-auto min-h-screen">
        <h1 className="font-serif text-3xl text-onyx">Tu Carrito</h1>
        <p className="font-sans text-taupe">
          Para ver tu carrito necesitas iniciar sesión.
        </p>
        <Link
          href="/login"
          className="bg-onyx text-white px-6 py-2 rounded hover:bg-gold transition-colors font-sans"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  // Usuario autenticado: buscamos su carrito activo.
  // getCart() retorna null si no existe ninguno en estado 'activo'.
  const cart = await getCart();
  const items = cart?.carrito_items ?? [];
  const total = items.reduce(
    (acc: number, item: any) => acc + (item.piezas?.precio || 0),
    0
  );

  return (
    <div className="flex flex-col w-full max-w-4xl px-8 py-12 mx-auto min-h-screen">
      <h1 className="font-serif text-3xl mb-8 text-onyx border-b border-line pb-4">
        Tu Carrito
      </h1>

      {items.length === 0 ? (
        // Usuario autenticado pero sin carrito activo o carrito vacío
        <div className="py-12 text-center text-taupe font-sans">
          Tu carrito está vacío.
          <br />
          <br />
          <Link href="/catalogo" className="text-gold hover:underline">
            Explorar el catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {items.map((item: any) => {
              const piece = item.piezas;
              const imageUrl =
                piece?.piezas_media?.[0]?.url ||
                `https://picsum.photos/400/500?random=${piece?.slug}`;

              return (
                <div
                  key={item.id}
                  className="flex gap-6 border border-line p-4 items-center bg-white shadow-sm"
                >
                  <div className="relative w-20 h-24 bg-ivory flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={piece?.nombre || "Pieza"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <Link
                      href={`/pieza/${piece?.slug}`}
                      className="font-serif text-lg text-onyx hover:text-gold transition-colors"
                    >
                      {piece?.nombre}
                    </Link>
                    <p className="font-sans text-sm text-taupe mt-1">
                      ${piece?.precio?.toLocaleString("es-MX")}
                    </p>
                    <p className="font-sans text-xs text-taupe mt-1 opacity-70">
                      Modalidad: {item.modo_pago}
                    </p>
                  </div>
                  <div>
                    <form action={removePieceFromCart}>
                      <input type="hidden" name="item_id" value={item.id} />
                      <button
                        type="submit"
                        className="text-sm font-sans text-taupe hover:text-red-700 underline"
                      >
                        Quitar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-end border-t border-line pt-6 mt-4 gap-4">
            <div className="font-serif text-2xl text-onyx">
              Total: ${total.toLocaleString("es-MX")}
            </div>
            <Link
              href="/checkout"
              className="bg-onyx text-ivory px-8 py-3 uppercase tracking-widest text-sm hover:bg-gold transition-colors"
            >
              Proceder al Pago
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
