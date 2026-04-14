'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

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
  displayOrder: number;
  createdAt: string;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-nv-smoke">
      <td className="p-4"><div className="h-12 w-12 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-32 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" /></td>
    </tr>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-nv-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-anton text-3xl md:text-4xl text-nv-white uppercase tracking-tight">
            Products
          </h1>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-nv-gold text-nv-black font-bebas text-base tracking-wider uppercase px-6 py-3 hover:bg-nv-gold/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {/* Product Table */}
        <div className="bg-nv-concrete border border-nv-smoke overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Image
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Name
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Category
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Price
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Stock
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Status
                  </th>
                  <th className="p-4 text-right font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="h-12 w-12 text-nv-fog" />
                        <p className="font-mono-brand text-nv-fog text-sm">
                          No products yet
                        </p>
                        <Link
                          href="/admin/products/new"
                          className="text-nv-gold font-bebas tracking-wider text-sm hover:underline"
                        >
                          + Add your first product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {products.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-nv-smoke hover:bg-nv-smoke/50 transition-colors"
                      >
                        {/* Image */}
                        <td className="p-4">
                          <div className="h-12 w-12 bg-nv-smoke overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="h-12 w-12 flex items-center justify-center text-nv-fog text-xs">
                                N/A
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name + Badges */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono-brand text-nv-white text-sm font-medium">
                              {product.name}
                            </span>
                            <div className="flex gap-1.5">
                              {product.isLimited && (
                                <span className="bg-nv-red text-white font-bebas text-xs px-2 py-0.5 tracking-wider">
                                  LIMITED
                                </span>
                              )}
                              {product.isFeatured && (
                                <span className="bg-nv-gold text-black font-bebas text-xs px-2 py-0.5 tracking-wider">
                                  FEATURED
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-fog text-sm capitalize">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-mono-brand text-nv-white text-sm">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="font-mono-brand text-nv-fog text-xs line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-white text-sm">
                            {product.stockQty}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {product.inStock ? (
                            <span className="text-green-400 font-mono-brand text-sm">
                              Active
                            </span>
                          ) : (
                            <span className="text-nv-red font-mono-brand text-sm">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex items-center justify-center h-8 w-8 border border-nv-smoke text-nv-fog hover:text-nv-gold hover:border-nv-gold transition-colors"
                              title="Edit product"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deleting === product.id}
                              className="inline-flex items-center justify-center h-8 w-8 border border-nv-smoke text-nv-fog hover:text-nv-red hover:border-nv-red transition-colors disabled:opacity-50"
                              title="Delete product"
                            >
                              {deleting === product.id ? (
                                <div className="h-3.5 w-3.5 border-2 border-nv-red border-t-transparent animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-nv-smoke">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 bg-nv-smoke rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-nv-smoke rounded" />
                      <div className="h-3 w-1/2 bg-nv-smoke rounded" />
                      <div className="h-3 w-1/3 bg-nv-smoke rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Package className="h-12 w-12 text-nv-fog" />
                  <p className="font-mono-brand text-nv-fog text-sm">No products yet</p>
                  <Link
                    href="/admin/products/new"
                    className="text-nv-gold font-bebas tracking-wider text-sm hover:underline"
                  >
                    + Add your first product
                  </Link>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-nv-smoke/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 bg-nv-smoke overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center text-nv-fog text-xs">
                            N/A
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono-brand text-nv-white text-sm font-medium truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono-brand text-nv-gold text-sm">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-nv-fog text-xs">·</span>
                              <span className="font-mono-brand text-nv-fog text-xs capitalize">
                                {product.category}
                              </span>
                              <span className="text-nv-fog text-xs">·</span>
                              <span className="font-mono-brand text-nv-fog text-xs">
                                {product.stockQty} in stock
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {product.isLimited && (
                                <span className="bg-nv-red text-white font-bebas text-xs px-2 py-0.5 tracking-wider">
                                  LIMITED
                                </span>
                              )}
                              {product.isFeatured && (
                                <span className="bg-nv-gold text-black font-bebas text-xs px-2 py-0.5 tracking-wider">
                                  FEATURED
                                </span>
                              )}
                              <span
                                className={`font-mono-brand text-xs ${
                                  product.inStock ? 'text-green-400' : 'text-nv-red'
                                }`}
                              >
                                {product.inStock ? 'Active' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="inline-flex items-center justify-center h-8 w-8 border border-nv-smoke text-nv-fog hover:text-nv-gold hover:border-nv-gold transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deleting === product.id}
                              className="inline-flex items-center justify-center h-8 w-8 border border-nv-smoke text-nv-fog hover:text-nv-red hover:border-nv-red transition-colors disabled:opacity-50"
                            >
                              {deleting === product.id ? (
                                <div className="h-3.5 w-3.5 border-2 border-nv-red border-t-transparent animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Product count footer */}
          {!loading && products.length > 0 && (
            <div className="p-4 border-t border-nv-smoke">
              <p className="font-mono-brand text-nv-fog text-xs">
                {products.length} product{products.length !== 1 ? 's' : ''} total
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
