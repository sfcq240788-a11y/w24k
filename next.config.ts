import type { NextConfig } from "next";

// Extraemos el hostname de Supabase de la variable de entorno para no escribirlo en duro.
// La URL tiene la forma https://<ref>.supabase.co — tomamos solo el host.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHostname = supabaseUrl
  ? new URL(supabaseUrl).hostname
  : "";

const nextConfig: NextConfig = {
  experimental: {
    // Sube el límite a 4 MB para las Server Actions de subida de imágenes.
    // Vercel impone un máximo de 4.5 MB por petición; dejamos margen para
    // los headers multipart (≈20 KB overhead típico).
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      // Supabase Storage — bucket "piezas" (imágenes reales de piezas)
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/piezas/**",
            },
          ]
        : []),
      // picsum.photos — se mantiene mientras existan piezas de prueba con estas URLs
      {
        protocol: "https" as const,
        hostname: "picsum.photos",
      },
      {
        protocol: "https" as const,
        hostname: "fastly.picsum.photos",
      },
    ],
  },
};

export default nextConfig;
