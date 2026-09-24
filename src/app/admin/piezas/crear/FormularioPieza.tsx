"use client";

import { useActionState } from "react";
import { createPieceAction } from "@/lib/data/admin";

interface Option {
  id: string;
  nombre: string;
}

interface FormularioPiezaProps {
  metales: Option[] | null;
  tipos: Option[] | null;
}

export default function FormularioPieza({ metales, tipos }: FormularioPiezaProps) {
  const [state, action, isPending] = useActionState(createPieceAction, undefined);

  return (
    <form
      action={action}
      className="flex flex-col gap-6 bg-white p-8 border border-line shadow-sm"
    >
      <div>
        <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
          Nombre
        </label>
        <input
          required
          name="nombre"
          className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Slug
          </label>
          <input
            required
            name="slug"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            SKU
          </label>
          <input
            required
            name="sku"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
          Descripción
        </label>
        <textarea
          required
          name="descripcion"
          rows={4}
          className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Precio MXN
          </label>
          <input
            required
            type="number"
            step="0.01"
            name="precio"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Precio Mayoreo MXN
          </label>
          <input
            required
            type="number"
            step="0.01"
            name="precio_mayoreo"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Peso (Gramos)
          </label>
          <input
            required
            type="number"
            step="0.01"
            name="peso_gramos"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Metal
          </label>
          <select
            required
            name="metal_id"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold bg-white"
          >
            <option value="">Selecciona...</option>
            {metales?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-sans text-taupe uppercase tracking-widest block mb-2">
            Tipo de Pieza
          </label>
          <select
            required
            name="tipo_pieza_id"
            className="w-full border border-line p-2 font-sans focus:outline-none focus:border-gold bg-white"
          >
            <option value="">Selecciona...</option>
            {tipos?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input type="hidden" name="estado_publicacion" value="borrador" />

      {state?.error && (
        <p className="text-sm font-sans text-red-600 bg-red-50 p-3 border border-red-200 rounded">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 bg-onyx text-ivory uppercase font-sans tracking-widest py-4 hover:bg-gold transition-colors disabled:opacity-50"
      >
        {isPending ? "Creando..." : "Crear y agregar fotos"}
      </button>
    </form>
  );
}
