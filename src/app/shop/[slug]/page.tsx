'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import { ImageGallery } from '@/components/shop/ImageGallery';
import { ProductCard } from '@/components/shop/ProductCard';
import { SizeSelector } from '@/components/shop/SizeSelector';
import { QuantitySelector } from '@/components/shop/QuantitySelector';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sizes: string[];
  category: string;
  tags: string[];
  isLimited: boolean;
  isFeatured: boolean;
  inStock: boolean;
  stockQty: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, allRes] = await Promise.all([
          fetch(`/api/products/${slug}`),
          fetch('/api/products'),
        ]);

        if (productRes.ok) {
          const data = await productRes.json();
          setProduct(data);
          // Auto-select first size
          const sizes = Array.isArray(data.sizes) ? data.sizes : JSON.parse(data.sizes || '[]');
          if (sizes.length > 0) setSelectedSize(sizes[0]);
        } else {
          setNotFound(true);
        }

        if (allRes.ok) {
          const allData = await allRes.json();
          setAllProducts(allData);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    if (!product.inStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      size: selectedSize,
      qty,
    });
    toast.success(`${product.name} added to bag.`);
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product?.id)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-nv-black">
        {/* Breadcrumb skeleton */}
        <div className="px-4 sm:px-6 lg:px-10 pt-28">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 bg-nv-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-3 bg-nv-smoke animate-pulse rounded-sm" />
            <div className="h-3 w-32 bg-nv-smoke animate-pulse rounded-sm" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left — Image placeholder */}
            <div className="bg-nv-concrete animate-pulse aspect-[3/4]" />

            {/* Right — Detail skeleton */}
            <div className="pt-4 lg:pt-0 space-y-8">
              {/* Category label */}
              <div className="h-4 w-28 bg-nv-smoke animate-pulse rounded-sm" />

              {/* Product name */}
              <div className="space-y-2">
                <div className="h-10 md:h-12 w-3/4 bg-nv-smoke animate-pulse rounded-sm" />
                <div className="h-10 md:h-12 w-1/2 bg-nv-smoke animate-pulse rounded-sm" />
              </div>

              {/* Price row */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 bg-nv-smoke animate-pulse rounded-sm" />
                <div className="h-6 w-20 bg-nv-smoke animate-pulse rounded-sm" />
              </div>

              {/* Size section */}
              <div className="space-y-3">
                <div className="h-4 w-14 bg-nv-smoke animate-pulse rounded-sm" />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-full bg-nv-smoke animate-pulse rounded-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Quantity section */}
              <div className="space-y-3">
                <div className="h-4 w-24 bg-nv-smoke animate-pulse rounded-sm" />
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-nv-smoke animate-pulse rounded-sm" />
                  <div className="h-12 w-16 bg-nv-smoke animate-pulse rounded-sm" />
                  <div className="h-12 w-12 bg-nv-smoke animate-pulse rounded-sm" />
                </div>
              </div>

              {/* Add to cart button */}
              <div className="h-14 w-full bg-nv-smoke animate-pulse rounded-sm" />

              {/* Shipping note */}
              <div className="h-3 w-48 bg-nv-smoke animate-pulse rounded-sm" />

              {/* Description section */}
              <div className="space-y-3">
                <div className="h-4 w-28 bg-nv-smoke animate-pulse rounded-sm" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-nv-smoke animate-pulse rounded-sm" />
                  <div className="h-4 w-5/6 bg-nv-smoke animate-pulse rounded-sm" />
                  <div className="h-4 w-3/4 bg-nv-smoke animate-pulse rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
            className="inline-block bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-4 hover:bg-nv-white transition-colors duration-200 cursor-hover"
          >
            BACK TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  const sizes: string[] = Array.isArray(product.sizes)
    ? product.sizes
    : JSON.parse(product.sizes || '[]');

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
          <Link href="/shop" className="hover:text-nv-gold transition-colors duration-200 cursor-hover">
            SHOP
          </Link>
          <span>/</span>
          <span className="text-nv-white uppercase">{product.name}</span>
        </div>
      </motion.div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ImageGallery
              images={product.images || []}
              alt={product.name}
              inStock={product.inStock}
            />
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
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
              />
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase mb-3">
                QUANTITY
              </p>
              <QuantitySelector quantity={qty} onChange={setQty} />
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full font-anton text-lg uppercase py-4 mt-6 transition-all duration-200 cursor-hover ${
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
                <ProductCard
                  key={rp.id}
                  product={rp}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
