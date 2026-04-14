'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string[]
  sizes: string[]
  category: string
  tags: string[]
  isLimited: boolean
  isFeatured: boolean
  inStock: boolean
  stockQty: number
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="bg-nv-concrete overflow-hidden group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-nv-smoke">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-nv-smoke">
            <span className="font-anton text-nv-fog text-lg">NO IMAGE</span>
          </div>
        )}
        {product.isLimited && (
          <div className="absolute top-3 left-3 bg-nv-red text-white font-bebas text-xs px-2 py-0.5 tracking-wider z-10">
            LIMITED
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <span className="font-anton text-2xl text-white uppercase">SOLD OUT</span>
          </div>
        )}
        {product.inStock && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <span className="font-bebas tracking-wider text-white text-lg uppercase hover:text-nv-gold transition-colors duration-200">
              VIEW PIECE
            </span>
          </div>
        )}
      </div>
      <div className="px-4 pt-3 pb-4">
        <h3 className="font-bebas text-lg tracking-wider text-nv-white truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono-brand text-nv-gold">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="font-mono-brand text-nv-fog text-sm line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const addItem = useCartStore((s) => s.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, allRes] = await Promise.all([
          fetch(`/api/products/${slug}`),
          fetch('/api/products'),
        ])

        if (productRes.ok) {
          const data = await productRes.json()
          setProduct(data)
          // Auto-select first size
          const sizes = Array.isArray(data.sizes) ? data.sizes : JSON.parse(data.sizes || '[]')
          if (sizes.length > 0) setSelectedSize(sizes[0])
        } else {
          setNotFound(true)
        }

        if (allRes.ok) {
          const allData = await allRes.json()
          setAllProducts(allData)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchData()
  }, [slug])

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast.error('Please select a size.')
      return
    }
    if (!product.inStock) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      size: selectedSize,
      qty,
    })
    toast.success(`${product.name} added to bag.`)
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product?.id)
    .slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-nv-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-32 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-nv-concrete animate-pulse" />
            <div className="space-y-6">
              <div className="h-4 bg-nv-concrete w-24 animate-pulse" />
              <div className="h-12 bg-nv-concrete w-3/4 animate-pulse" />
              <div className="h-8 bg-nv-concrete w-32 animate-pulse" />
              <div className="h-4 bg-nv-concrete w-48 animate-pulse mt-8" />
              <div className="h-12 bg-nv-concrete w-full animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-nv-black flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight mb-6">
            PRODUCT NOT FOUND
          </h1>
          <p className="font-mono-brand text-nv-fog text-sm mb-8">
            The piece you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-4 hover:bg-nv-white transition-colors duration-200"
          >
            BACK TO SHOP
          </Link>
        </div>
      </div>
    )
  }

  const sizes: string[] = Array.isArray(product.sizes)
    ? product.sizes
    : JSON.parse(product.sizes || '[]')

  return (
    <div className="min-h-screen bg-nv-black">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="px-4 sm:px-6 lg:px-10 pt-28"
      >
        <div className="flex items-center gap-2 font-mono-brand text-xs text-nv-fog">
          <Link href="/shop" className="hover:text-nv-gold transition-colors duration-200">
            SHOP
          </Link>
          <span>/</span>
          <span className="text-nv-white uppercase">{product.name}</span>
        </div>
      </motion.div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[3/4] bg-nv-concrete overflow-hidden"
          >
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-nv-fog" />
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                <span className="font-anton text-3xl text-white uppercase">SOLD OUT</span>
              </div>
            )}
          </motion.div>

          {/* Right — Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="pt-4 lg:pt-0"
          >
            {/* Category */}
            <p className="font-bebas tracking-[0.2em] text-nv-fog text-sm uppercase">
              {product.category || 'STREETWEAR'}
            </p>

            {/* Name */}
            <h1 className="font-anton text-3xl md:text-5xl uppercase mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl font-mono-brand text-nv-gold">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="line-through text-nv-fog text-sm font-mono-brand">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Limited Edition Label */}
            {product.isLimited && (
              <p className="text-nv-red font-bebas tracking-wider mt-2 text-sm">
                LIMITED EDITION
              </p>
            )}

            {/* Size Selector */}
            <div className="mt-8">
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase mb-3">
                SIZE
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 font-bebas tracking-wider text-sm transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-nv-gold text-nv-black'
                        : 'bg-nv-smoke text-nv-white border border-nv-smoke hover:border-nv-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase mb-3">
                QUANTITY
              </p>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:border-nv-gold hover:text-nv-gold transition-colors duration-200"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-14 h-12 flex items-center justify-center bg-nv-concrete border-y border-nv-smoke font-mono-brand text-sm">
                  {qty}
                </div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:border-nv-gold hover:text-nv-gold transition-colors duration-200"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full font-anton text-lg uppercase py-4 mt-6 transition-all duration-200 ${
                product.inStock
                  ? 'bg-nv-gold text-nv-black hover:bg-nv-gold/90'
                  : 'bg-nv-smoke text-nv-fog cursor-not-allowed'
              }`}
            >
              {!product.inStock ? 'SOLD OUT' : 'ADD TO CART'}
            </button>

            {/* Free Shipping Note */}
            <p className="font-mono-brand text-xs text-nv-fog mt-3">
              Free shipping on orders over $75
            </p>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase mb-3">
                  DESCRIPTION
                </p>
                <p className="font-mono-brand text-sm text-nv-fog leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* You Might Also Like */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-nv-smoke">
          <div className="px-4 sm:px-6 lg:px-10 pt-16 pb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-anton text-3xl md:text-4xl uppercase tracking-tight mb-10"
            >
              YOU MIGHT ALSO LIKE
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp, index) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard product={rp} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
