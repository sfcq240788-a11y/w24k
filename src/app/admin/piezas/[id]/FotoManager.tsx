"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { resolveImageUrl, type MediaForUrl } from "@/lib/media-url";
import {
  uploadFotoAction,
  deleteFotoAction,
  reorderFotosAction,
} from "@/lib/data/media";
import { ChevronUp, ChevronDown, Trash2, Upload, Loader2 } from "lucide-react";

const TIPOS_TOMA = [
  { value: "f", label: "F — Frontal" },
  { value: "d", label: "D — Tres cuartos derecha" },
  { value: "i", label: "I — Tres cuartos izquierda" },
  { value: "m", label: "M — Macro" },
  { value: "e", label: "E — Escala" },
] as const;

const MAX_FILE_MB = 4;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

type MediaRow = MediaForUrl & {
  id: string;
  tipo_toma?: string | null;
  orden?: number;
};

interface FotoManagerProps {
  piezaId: string;
  initialFotos: MediaRow[];
}

export function FotoManager({ piezaId, initialFotos }: FotoManagerProps) {
  const [fotos, setFotos] = useState<MediaRow[]>(
    [...initialFotos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  );
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tipoToma, setTipoToma] = useState<string>("f");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function clearMessages() {
    setError(null);
    setSuccessMsg(null);
  }

  // ── Subir foto ────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    clearMessages();
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación client-side de tamaño (antes de enviar)
    if (file.size > MAX_FILE_BYTES) {
      setError(
        `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. ` +
          `El límite es ${MAX_FILE_MB} MB. Reduce el tamaño o exporta en menor resolución.`
      );
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo antes de subir.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(
        `El archivo excede ${MAX_FILE_MB} MB. Selecciona una imagen más pequeña.`
      );
      return;
    }

    const formData = new FormData();
    formData.set("pieza_id", piezaId);
    formData.set("tipo_toma", tipoToma);
    formData.set("foto", file);

    startTransition(async () => {
      const result = await uploadFotoAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccessMsg("Foto subida correctamente. Actualizando galería...");
      if (fileRef.current) fileRef.current.value = "";
      // Recargar la página para obtener las nuevas rutas de Storage
      window.location.reload();
    });
  }

  // ── Eliminar foto ─────────────────────────────────────────────────────────

  function handleDelete(mediaId: string) {
    clearMessages();
    startTransition(async () => {
      const result = await deleteFotoAction(mediaId);
      if (!result.ok) {
        setError(`Error al eliminar: ${result.error}`);
        return;
      }
      setFotos((prev) => prev.filter((f) => f.id !== mediaId));
      setSuccessMsg("Foto eliminada correctamente.");
    });
  }

  // ── Reordenar ─────────────────────────────────────────────────────────────

  function movePhoto(idx: number, direction: "up" | "down") {
    clearMessages();
    const newFotos = [...fotos];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newFotos.length) return;
    [newFotos[idx], newFotos[targetIdx]] = [newFotos[targetIdx], newFotos[idx]];
    setFotos(newFotos);

    startTransition(async () => {
      const result = await reorderFotosAction(
        piezaId,
        newFotos.map((f) => f.id)
      );
      if (!result.ok) {
        setError(`Error al reordenar: ${result.error}`);
        // Revertir en UI
        setFotos(fotos);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Banner de error */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 font-sans text-sm flex gap-3 items-start"
        >
          <span className="font-semibold shrink-0">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Banner de éxito */}
      {successMsg && (
        <div
          role="status"
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 font-sans text-sm"
        >
          {successMsg}
        </div>
      )}

      {/* Galería actual */}
      {fotos.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-sans text-xs uppercase tracking-widest text-taupe">
            Fotos ({fotos.length})
          </h3>
          <div className="space-y-2">
            {fotos.map((foto, idx) => {
              const thumbUrl = resolveImageUrl(foto, "600");
              return (
                <div
                  key={foto.id}
                  className="flex items-center gap-4 bg-white border border-line p-3"
                >
                  {/* Miniatura */}
                  <div className="relative w-14 h-[70px] flex-shrink-0 bg-ivory overflow-hidden">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={`Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-onyx opacity-40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow font-sans text-sm text-onyx">
                    <span className="uppercase tracking-widest text-xs text-taupe">
                      {TIPOS_TOMA.find((t) => t.value === foto.tipo_toma)?.label ??
                        foto.tipo_toma ??
                        "—"}
                    </span>
                    <p className="text-xs text-taupe mt-1">Orden: {idx + 1}</p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => movePhoto(idx, "up")}
                      disabled={idx === 0 || isPending}
                      className="p-1 text-taupe hover:text-onyx disabled:opacity-30 transition-colors"
                      title="Subir"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(idx, "down")}
                      disabled={idx === fotos.length - 1 || isPending}
                      className="p-1 text-taupe hover:text-onyx disabled:opacity-30 transition-colors"
                      title="Bajar"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Eliminar esta foto? Esta acción no se puede deshacer."
                          )
                        ) {
                          handleDelete(foto.id);
                        }
                      }}
                      disabled={isPending}
                      className="p-1 text-red-400 hover:text-red-700 disabled:opacity-30 transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="font-sans text-sm text-taupe">
          Esta pieza aún no tiene fotos.
        </p>
      )}

      {/* Formulario de subida */}
      <form
        onSubmit={handleUpload}
        className="bg-white border border-line p-6 space-y-4"
      >
        <h3 className="font-sans text-xs uppercase tracking-widest text-taupe mb-4">
          Agregar foto
        </h3>

        <div>
          <label className="text-xs font-sans text-taupe uppercase tracking-widest block mb-2">
            Tipo de toma
          </label>
          <select
            value={tipoToma}
            onChange={(e) => setTipoToma(e.target.value)}
            className="w-full border border-line p-2 font-sans text-sm focus:outline-none focus:border-gold bg-white"
            disabled={isPending}
          >
            {TIPOS_TOMA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-sans text-taupe uppercase tracking-widest block mb-2">
            Archivo (JPEG, PNG o WebP · Proporción 4:5 · Mínimo 1200 px de ancho · Máx. {MAX_FILE_MB} MB)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isPending}
            className="w-full border border-line p-2 font-sans text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-onyx file:text-ivory file:text-xs file:uppercase file:tracking-widest hover:file:bg-gold file:transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-onyx text-ivory uppercase font-sans tracking-widest text-sm px-6 py-3 hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Subir foto
            </>
          )}
        </button>
      </form>
    </div>
  );
}
