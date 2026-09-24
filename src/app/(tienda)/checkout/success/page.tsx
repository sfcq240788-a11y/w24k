import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <h1 className="font-serif text-4xl text-onyx mb-4">¡Pago Completado!</h1>
      <p className="font-sans text-taupe mb-8">Tu pedido ha sido procesado exitosamente. Recibirás un correo de confirmación en breve.</p>
      <Link href="/catalogo" className="bg-onyx text-ivory px-8 py-3 uppercase tracking-widest font-sans text-sm hover:bg-gold transition-colors">
        Seguir Comprando
      </Link>
    </div>
  );
}
