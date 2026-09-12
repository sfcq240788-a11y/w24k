export function PriceTag({ price, className = '' }: { price: number; className?: string }) {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div
      className={`inline-flex items-center bg-onyx text-ivory py-1.5 px-3 relative rounded-r-xl rounded-l-sm ${className}`}
      style={{ boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}
    >
      {/* Decorative hole */}
      <div className="w-1.5 h-1.5 rounded-full bg-ivory opacity-80 absolute left-1.5 top-1/2 -translate-y-1/2"></div>
      
      <span className="font-serif font-semibold text-[15px] sm:text-[18px] ml-2 tracking-wide">
        {formattedPrice}
      </span>
    </div>
  );
}
