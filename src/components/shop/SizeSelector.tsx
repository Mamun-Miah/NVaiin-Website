'use client';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelectSize }: SizeSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSelectSize(size)}
          className={`py-3 font-bebas tracking-wider text-sm transition-all duration-200 cursor-hover ${
            selectedSize === size
              ? 'bg-nv-gold text-nv-black'
              : 'bg-nv-smoke text-nv-white border border-nv-smoke hover:border-nv-gold'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
