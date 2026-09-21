"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageUrl, type MediaForUrl } from "@/lib/media-url";

type GalleryMedia = MediaForUrl & { tipo_toma?: string | null; orden?: number };

interface ProductGalleryProps {
  images: GalleryMedia[];
  alt: string;
}

/** Placeholder propio con paleta onyx — sin picsum */
function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 bg-onyx flex flex-col items-center justify-center gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 80"
        className="w-14 h-[70px] opacity-20"
        fill="none"
      >
        <path
          d="M32 12L52 24V56L32 68L12 56V24L32 12Z"
          stroke="#C9A86C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M32 12V40M52 24L32 40M12 24L32 40"
          stroke="#C9A86C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <p className="font-sans text-xs text-taupe uppercase tracking-widest opacity-60">
          {label}
        </p>
      )}
    </div>
  );
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay imágenes mostramos el placeholder en la galería principal
  if (images.length === 0) {
    return (
      <div className="flex flex-col-reverse lg:flex-row gap-6 h-full">
        <div className="relative w-full aspect-[4/5] bg-onyx border border-line border-opacity-20 overflow-hidden">
          <ImagePlaceholder label="Sin fotos disponibles" />
        </div>
      </div>
    );
  }

  const current = images[currentIndex];
  const mainUrl = resolveImageUrl(current, "1200");

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-6 h-full">
      {/* Miniaturas */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto w-full lg:w-24 flex-shrink-0">
        {images.map((img, idx) => {
          const thumbUrl = resolveImageUrl(img, "600");
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-20 lg:w-full aspect-[4/5] bg-white overflow-hidden border transition-colors ${
                currentIndex === idx
                  ? "border-gold"
                  : "border-transparent hover:border-line"
              }`}
            >
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 bg-onyx opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Imagen principal */}
      <div className="relative w-full aspect-[4/5] bg-white lg:flex-grow border border-line border-opacity-20 overflow-hidden group">
        {mainUrl ? (
          <Image
            src={mainUrl}
            alt={alt}
            fill
            // priority solo en la primera imagen visible (la de menor orden)
            priority={currentIndex === 0}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-150"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <ImagePlaceholder label="Imagen no disponible" />
        )}
      </div>
    </div>
  );
}
