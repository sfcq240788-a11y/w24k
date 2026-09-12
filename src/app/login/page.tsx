import { login } from "../auth/actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolvedParams = await searchParams;
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Volver
      </Link>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <h1 className="font-serif text-3xl mb-6 text-onyx text-center">Iniciar Sesión</h1>
        
        <label className="text-md font-sans text-onyx" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 border-line font-sans focus:outline-none focus:border-gold"
          name="email"
          placeholder="tu@correo.com"
          required
        />
        
        <label className="text-md font-sans text-onyx" htmlFor="password">
          Contraseña
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 border-line font-sans focus:outline-none focus:border-gold"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button
          formAction={login}
          className="bg-onyx text-white rounded-md px-4 py-2 mb-2 font-sans hover:bg-gold transition-colors"
        >
          Entrar
        </button>
        
        <div className="text-center text-sm font-sans text-taupe mt-4">
          ¿No tienes cuenta? <Link href="/registro" className="text-gold underline hover:text-onyx">Regístrate</Link>
        </div>

        {resolvedParams?.message && (
          <p className="mt-4 p-4 bg-line/20 text-onyx text-center text-sm font-sans">
            {resolvedParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
