"use client";

import { useActionState } from "react";
import { login } from "../auth/actions";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export function LoginForm({
  resolvedParams,
  compraHabilitada,
}: {
  resolvedParams?: { message?: string };
  compraHabilitada: boolean;
}) {
  const [state, action, isPending] = useActionState(
    async (prevState: { error: string } | undefined, formData: FormData) => {
      return await login(formData);
    },
    undefined
  );

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sección Izquierda: Imagen (Solo en Desktop) */}
      <div className="relative hidden w-1/2 md:block bg-surface-muted overflow-hidden">
        <Image
          src="/workshop24k-isotipo.svg"
          alt="Workshop 24K"
          fill
          priority
          className="absolute inset-0 object-contain p-12 grayscale-[15%] opacity-90"
        />
        <div className="absolute inset-0 bg-onyx/10" />
      </div>

      {/* Sección Derecha: Formulario */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:px-20 lg:px-32">
        <div className="absolute left-8 top-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-onyx/50 transition-colors hover:text-onyx"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Volver a la tienda
          </Link>
        </div>

        <form action={action} className="w-full max-w-sm animate-in flex-col gap-6 text-onyx">
          <div className="mb-12 text-center">
            <h1 className="font-editorial text-4xl leading-none text-onyx md:text-5xl">
              Bienvenido
            </h1>
            <p className="mt-4 text-xs tracking-widest text-onyx/50 uppercase">
              Accede a tu cuenta
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.15em] text-onyx/70" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                className="w-full border-b border-line bg-transparent px-0 py-2 text-sm text-onyx placeholder:text-onyx/30 focus:border-gold focus:outline-none transition-colors"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.15em] text-onyx/70" htmlFor="password">
                Contraseña
              </label>
              <input
                className="w-full border-b border-line bg-transparent px-0 py-2 text-sm text-onyx placeholder:text-onyx/30 focus:border-gold focus:outline-none transition-colors"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-10 flex w-full items-center justify-center bg-onyx px-4 py-4 text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold disabled:opacity-50"
          >
            {isPending ? "Autenticando..." : "Ingresar"}
          </button>
          
          {compraHabilitada && (
            <div className="mt-6 text-center text-xs text-onyx/50">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="text-gold transition-colors hover:text-onyx">
                Crear una cuenta
              </Link>
            </div>
          )}

          {state?.error && (
            <p className="mt-8 text-center text-[11px] text-error tracking-wider bg-error/10 py-3">
              {state.error}
            </p>
          )}

          {resolvedParams?.message && (
            <p className="mt-8 text-center text-[11px] text-onyx/70 tracking-wider bg-line/30 py-3">
              {resolvedParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
