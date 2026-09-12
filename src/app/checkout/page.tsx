import { getCart } from "@/lib/data/cart";
import { redirect } from "next/navigation";
import { submitCheckout } from "./actions";

export default async function CheckoutPage() {
  const cart = await getCart();

  if (!cart || !cart.carrito_items || cart.carrito_items.length === 0) {
    redirect("/carrito");
  }

  const total = cart.carrito_items.reduce((acc: number, item: any) => acc + item.piezas.precio, 0);

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto px-8 py-12 gap-12 min-h-screen">
      {/* Checkout Form */}
      <div className="flex-1">
        <h1 className="font-serif text-3xl mb-8 text-onyx border-b border-line pb-4">Dirección de Envío</h1>
        <form action={submitCheckout} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">Destinatario</label>
            <input required name="destinatario" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
          </div>
          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">Calle</label>
              <input required name="calle" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">No. Ext</label>
              <input required name="numero_exterior" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">No. Int</label>
              <input name="numero_interior" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">Colonia</label>
            <input required name="colonia" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">Ciudad</label>
              <input required name="ciudad" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">Estado</label>
              <input required name="estado" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">C.P.</label>
              <input required name="codigo_postal" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">País</label>
              <input required name="pais" defaultValue="México" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-1">Referencias (Opcional)</label>
            <textarea name="referencias" className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold" rows={2} />
          </div>

          <button type="submit" className="mt-6 w-full bg-onyx text-ivory uppercase font-sans tracking-widest py-4 hover:bg-gold transition-colors">
            Ir a Pagar
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="w-full md:w-80 bg-ivory p-6 h-fit border border-line">
        <h2 className="font-serif text-xl mb-4 text-onyx border-b border-line pb-2">Resumen</h2>
        <div className="flex flex-col gap-4 mb-6">
          {cart.carrito_items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm font-sans">
              <span className="text-onyx truncate max-w-[150px]">{item.piezas.nombre}</span>
              <span className="text-taupe">${item.piezas.precio.toLocaleString('es-MX')}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center font-serif text-lg text-onyx border-t border-line pt-4">
          <span>Total</span>
          <span>${total.toLocaleString('es-MX')}</span>
        </div>
      </div>
    </div>
  );
}
