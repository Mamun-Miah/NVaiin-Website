'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  inStock?: boolean;
}

export function ImageGallery({ images, alt, inStock = true }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const safeImages = Array.isArray(images) ? images : [];

  const goToPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  const goTo = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  // Reset selected index when images change
  useEffect(() => {
    requestAnimationFrame(() => {
      setSelectedIndex(0);
    });
  }, [images]);

  if (safeImages.length === 0) {
    return (
      <div className="relative aspect-[3/4] bg-nv-concrete overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-nv-fog" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Main Image */}
      <div
        className="relative aspect-[3/4] bg-nv-concrete overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={goToNext}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={safeImages[selectedIndex]}
              alt={`${alt} - Image ${selectedIndex + 1}`}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={selectedIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Sold Out Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <span className="font-anton text-3xl text-white uppercase">SOLD OUT</span>
          </div>
        )}

        {/* Arrow Navigation */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-nv-white transition-all duration-200 cursor-hover ${
                isHovering
                  ? 'opacity-100 hover:bg-black/60'
                  : 'opacity-0'
              }`}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-nv-white transition-all duration-200 cursor-hover ${
                isHovering
                  ? 'opacity-100 hover:bg-black/60'
                  : 'opacity-0'
              }`}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 right-3 z-20 bg-black/50 px-2.5 py-1 rounded">
            <span className="font-mono-brand text-xs text-nv-fog">
              {selectedIndex + 1} / {safeImages.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-shrink-0 overflow-hidden border-2 transition-colors duration-200 cursor-hover ${
                i === selectedIndex
                  ? 'border-nv-gold'
                  : 'border-nv-smoke hover:border-nv-fog'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
