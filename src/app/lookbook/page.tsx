'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface LookbookImage {
  id: string
  imageUrl: string
  title: string
  seasonLabel: string
  displayOrder: number
  isVisible: boolean
}

export default function LookbookPage() {
  const [images, setImages] = useState<LookbookImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLookbook() {
      try {
        const res = await fetch('/api/lookbook')
        if (res.ok) {
          const data = await res.json()
          setImages(data)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchLookbook()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-nv-black">
        <div className="pt-32 pb-8 px-4 sm:px-6 lg:px-10">
          <div className="h-20 bg-nv-concrete w-2/3 animate-pulse mb-4" />
          <div className="h-6 bg-nv-concrete w-1/3 animate-pulse" />
        </div>
        <div className="overflow-hidden pb-8">
          <div className="flex gap-4 px-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[85vw] md:min-w-[60vw] lg:min-w-[45vw] aspect-[4/5] bg-nv-concrete animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-nv-black flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight mb-6">
            LOOKBOOK
          </h1>
          <p className="font-mono-brand text-nv-fog text-sm">
            Coming soon. Stay tuned for Season 01.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nv-black">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-8 px-4 sm:px-6 lg:px-10"
      >
        <h1 className="font-anton text-7xl md:text-9xl uppercase tracking-tight">
          LOOKBOOK
        </h1>
        <p className="font-bebas text-nv-gold text-xl tracking-wider mt-2">
          — SEASON 01
        </p>
      </motion.div>

      {/* Horizontal Scroll Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="overflow-x-auto flex gap-4 snap-x snap-mandatory pb-8 px-4 scrollbar-thin"
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="min-w-[85vw] md:min-w-[60vw] lg:min-w-[45vw] flex-shrink-0 snap-start relative group"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-nv-concrete">
              <Image
                src={image.imageUrl}
                alt={image.title || `Lookbook ${index + 1}`}
                fill
                className="object-cover"
                sizes="85vw"
              />
              {/* Bottom Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                {image.title && (
                  <h2 className="font-anton text-2xl text-white uppercase tracking-tight">
                    {image.title}
                  </h2>
                )}
                {image.seasonLabel && (
                  <p className="font-bebas text-nv-gold tracking-wider mt-1">
                    {image.seasonLabel}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Grid Section */}
      <div className="px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={`grid-${image.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`relative group overflow-hidden bg-nv-concrete ${
                index === 0 ? 'md:col-span-2' : ''
              }`}
            >
              <div className={`relative ${index === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'} overflow-hidden`}>
                <Image
                  src={image.imageUrl}
                  alt={image.title || `Lookbook ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes={index === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    {image.title && (
                      <h3 className="font-anton text-2xl text-white uppercase tracking-tight">
                        {image.title}
                      </h3>
                    )}
                    {image.seasonLabel && (
                      <p className="font-bebas text-nv-gold tracking-wider mt-1">
                        {image.seasonLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
