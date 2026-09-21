import Image from 'next/image';
import Link from 'next/link';
import { PriceTag } from './PriceTag';
import { resolveImageUrl, type MediaForUrl } from '@/lib/media-url';

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  media?: MediaForUrl | null;
  /** @deprecated Pasa `media` en su lugar. Se mantiene para compatibilidad temporal. */
  imageUrl?: string;
  metal?: string | null;
  stone?: string | null;
  priority?: boolean;
}

export function ProductCard({
  slug,
  name,
  price,
  media,
  imageUrl,
  metal,
  stone,
  priority = false,
}: ProductCardProps) {
  // Usar resolveImageUrl si hay media con rutas de Storage.
  // Si solo viene imageUrl (código legado), usarlo directamente.
  const displayImage = media
    ? resolveImageUrl(media, "600")
    : imageUrl ?? null;

  return (
    <Link href={`/pieza/${slug}`} className="group block">
      <div className="bg-ivory border border-transparent hover:border-gold hover:shadow-sm transition-all duration-300 ease-in-out h-full flex flex-col">
        {/* Image Container (4:5 ratio) */}
        <div className="relative w-full aspect-[4/5] bg-white overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            /* Placeholder propio — fondo onyx, sin picsum */
            <div className="absolute inset-0 bg-onyx flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 80"
                className="w-12 h-14 opacity-20"
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
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col flex-grow items-center text-center">
          {/* Metadata */}
          <div className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.15em] text-taupe mb-2 flex items-center justify-center space-x-2">
            {metal && <span>{metal}</span>}
            {metal && stone && <span>&bull;</span>}
            {stone && <span>{stone}</span>}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg text-onyx font-semibold mb-4 flex-grow">
            {name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <span className="font-serif text-lg text-onyx font-semibold tracking-wide">
              ${price.toLocaleString('es-MX')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
