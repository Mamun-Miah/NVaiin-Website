'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
}

export function QuantitySelector({ quantity, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-0">
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="w-12 h-12 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:border-nv-gold hover:text-nv-gold transition-colors duration-200 cursor-hover"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-14 h-12 flex items-center justify-center bg-nv-concrete border-y border-nv-smoke font-mono-brand text-sm">
        {quantity}
      </div>
      <button
        onClick={() => onChange(quantity + 1)}
        className="w-12 h-12 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:border-nv-gold hover:text-nv-gold transition-colors duration-200 cursor-hover"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
