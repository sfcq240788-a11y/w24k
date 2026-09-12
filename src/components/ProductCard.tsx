import Image from 'next/image';
import Link from 'next/link';
import { PriceTag } from './PriceTag';

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  metal?: string | null;
  stone?: string | null;
}

export function ProductCard({ slug, name, price, imageUrl, metal, stone }: ProductCardProps) {
  // Use a picsum placeholder if imageUrl is missing (as per instructions)
  const displayImage = imageUrl || 'https://picsum.photos/400/500?random=' + slug;

  return (
    <Link href={`/pieza/${slug}`} className="group block">
      <div className="bg-ivory border border-transparent hover:border-gold hover:shadow-sm transition-all duration-300 ease-in-out h-full flex flex-col">
        {/* Image Container (4:5 ratio) */}
        <div className="relative w-full aspect-[4/5] bg-white overflow-hidden">
          <Image
            src={displayImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
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
