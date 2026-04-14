'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    isLimited: boolean;
    inStock: boolean;
  };
  index?: number;
  aspectRatio?: 'portrait' | 'square';
}

export function ProductCard({ product, index = 0, aspectRatio = 'portrait' }: ProductCardProps) {
  const aspectClass = aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-nv-concrete overflow-hidden group"
    >
      {/* Image Container */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className={`relative ${aspectClass} overflow-hidden bg-nv-smoke`}>
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-nv-smoke">
              <span className="font-anton text-nv-fog text-lg">NO IMAGE</span>
            </div>
          )}

          {/* Limited Badge */}
          {product.isLimited && (
            <div className="absolute top-3 left-3 bg-nv-red text-white font-bebas text-xs px-2.5 py-1 tracking-wider z-10">
              LIMITED
            </div>
          )}

          {/* Sold Out Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <span className="font-anton text-2xl md:text-3xl text-white uppercase">
                SOLD OUT
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          {product.inStock && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end z-10 pb-8">
              <span className="font-bebas tracking-[0.15em] text-white text-sm uppercase opacity-70 mb-1">
                {product.name}
              </span>
              <span className="font-bebas tracking-[0.2em] text-nv-gold text-lg uppercase">
                VIEW PIECE
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="font-bebas text-lg tracking-wider text-nv-white truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono-brand text-nv-gold">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="font-mono-brand text-nv-fog text-sm line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
