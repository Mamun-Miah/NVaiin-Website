'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

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

type ViewMode = 'grid' | 'table';
type SortKey = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
type CategoryFilter = 'all' | string;
type StatusFilter = 'all' | 'in-stock' | 'out-of-stock' | 'limited' | 'featured';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'T-Shirts', 'Hoodies', 'Sweatshirts', 'Pants', 'Accessories', 'Caps'];
const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
  { value: 'limited', label: 'Limited' },
  { value: 'featured', label: 'Featured' },
];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
];

// ── Skeleton Components ───────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-nv-concrete border border-nv-smoke overflow-hidden">
      <div className="aspect-[3/4] bg-nv-smoke animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-nv-smoke animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-nv-smoke animate-pulse rounded" />
        <div className="h-5 w-20 bg-nv-smoke animate-pulse rounded" />
        <div className="flex justify-between">
          <div className="h-3 w-12 bg-nv-smoke animate-pulse rounded" />
          <div className="h-3 w-16 bg-nv-smoke animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-nv-smoke">
      <td className="p-3"><div className="h-4 w-4 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-12 w-12 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-4 w-32 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-4 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-4 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-3"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
    </tr>
  );
}

// ── Delete Confirmation Dialog ────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  productName,
  onConfirm,
  onCancel,
  deleting,
}: {
  open: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onCancel}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-nv-concrete border border-nv-smoke w-full max-w-md p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-nv-red/10 border border-nv-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-nv-red" />
                </div>
                <div>
                  <h3 className="font-anton text-lg text-nv-white uppercase tracking-wider">
                    Delete Product
                  </h3>
                  <p className="font-mono-brand text-sm text-nv-fog mt-1">
                    Are you sure you want to delete{' '}
                    <span className="text-nv-white font-medium">&quot;{productName}&quot;</span>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  disabled={deleting}
                  className="px-5 py-2.5 font-bebas tracking-wider text-sm uppercase text-nv-fog border border-nv-smoke hover:text-nv-white hover:border-nv-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={deleting}
                  className="px-5 py-2.5 font-bebas tracking-wider text-sm uppercase bg-nv-red text-white hover:bg-nv-red/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-nv-smoke border border-nv-smoke text-nv-fog font-mono-brand text-xs hover:border-nv-fog transition-colors whitespace-nowrap"
      >
        <span className="hidden sm:inline text-nv-fog/60">{label}:</span>
        <span className="text-nv-white">{selectedOption?.label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1 bg-nv-concrete border border-nv-smoke z-50 min-w-[180px] py-1 shadow-xl"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-mono-brand text-xs transition-colors flex items-center justify-between ${
                    option.value === value
                      ? 'text-nv-gold bg-nv-gold/5'
                      : 'text-nv-fog hover:text-nv-white hover:bg-nv-smoke/50'
                  }`}
                >
                  {option.label}
                  {option.value === value && <Check className="h-3 w-3" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Product Grid Card ─────────────────────────────────────────────────────────

function ProductGridCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (p: Product) => void;
}) {
  const hasImage = product.images && product.images.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group bg-nv-concrete border border-nv-smoke overflow-hidden hover:border-nv-gold/50 transition-colors"
    >
      {/* Image */}
      <Link
        href={`/admin/products/${product.id}/edit`}
        className="block relative aspect-[3/4] bg-nv-smoke overflow-hidden"
      >
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-nv-fog/30" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isLimited && (
            <span className="bg-nv-red text-white font-bebas text-[10px] px-2 py-0.5 tracking-wider uppercase">
              Limited
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-nv-gold text-black font-bebas text-[10px] px-2 py-0.5 tracking-wider uppercase">
              Featured
            </span>
          )}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center text-nv-black hover:bg-nv-gold transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(product);
            }}
            className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center text-nv-black hover:bg-nv-red hover:text-white transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <span className="block font-mono-brand text-[10px] text-nv-fog uppercase tracking-wider">
          {product.category}
        </span>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="block font-mono-brand text-sm text-nv-white font-medium truncate hover:text-nv-gold transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-anton text-lg text-nv-gold">
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="font-mono-brand text-xs text-nv-fog line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono-brand text-[10px] text-nv-fog">
            {product.stockQty} in stock
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                product.inStock ? 'bg-green-500' : 'bg-nv-red'
              }`}
            />
            <span className="font-mono-brand text-[10px] text-nv-fog">
              {product.inStock ? 'Active' : 'Out'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Table bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

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

  // ── Filtered & sorted products ────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Category
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Status
    switch (statusFilter) {
      case 'in-stock':
        result = result.filter((p) => p.inStock);
        break;
      case 'out-of-stock':
        result = result.filter((p) => !p.inStock);
        break;
      case 'limited':
        result = result.filter((p) => p.isLimited);
        break;
      case 'featured':
        result = result.filter((p) => p.isFeatured);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy]);

  // ── Delete handlers ───────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Error bulk deleting:', err);
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Selection helpers ─────────────────────────────────────────────────────

  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));
  const someSelected = filteredProducts.some((p) => selectedIds.has(p.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasActiveFilters = searchQuery.trim() !== '' || categoryFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-nv-black p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-anton text-2xl md:text-3xl uppercase tracking-wider text-nv-white">
              Products
            </h1>
            {!loading && (
              <p className="font-mono-brand text-sm text-nv-fog mt-0.5">
                {filteredProducts.length === products.length
                  ? `${products.length} product${products.length !== 1 ? 's' : ''} total`
                  : `${filteredProducts.length} of ${products.length} products`}
              </p>
            )}
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-nv-gold text-nv-black font-anton text-sm uppercase tracking-wider px-5 py-3 hover:bg-nv-gold/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nv-fog" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm pl-10 pr-10 py-2.5 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nv-fog hover:text-nv-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Category"
              value={categoryFilter}
              options={CATEGORIES.map((c) => ({
                value: c === 'All' ? 'all' : c,
                label: c,
              }))}
              onChange={(v) => setCategoryFilter(v as CategoryFilter)}
            />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={STATUSES}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="Sort"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
            />
            <div className="flex-1" />
            {/* View toggle */}
            <div className="flex border border-nv-smoke">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-nv-gold/10 text-nv-gold border-r border-nv-gold/30'
                    : 'text-nv-fog hover:text-nv-white'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-nv-gold/10 text-nv-gold'
                    : 'text-nv-fog hover:text-nv-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-mono-brand text-xs text-nv-fog hover:text-nv-red transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Bulk Action Bar ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedIds.size > 0 && viewMode === 'table' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-nv-gold/10 border border-nv-gold/20 px-4 py-3 flex items-center justify-between">
                <span className="font-mono-brand text-sm text-nv-gold">
                  {selectedIds.size} selected
                </span>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="inline-flex items-center gap-2 bg-nv-red text-white font-bebas text-sm tracking-wider uppercase px-4 py-2 hover:bg-nv-red/90 transition-colors disabled:opacity-50"
                >
                  {bulkDeleting && (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin" />
                  )}
                  Delete Selected ({selectedIds.size})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="bg-nv-concrete border border-nv-smoke overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-nv-smoke">
                    <th className="p-3 w-10" />
                    <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                    <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                    <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                    <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                    <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                    <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                    <th className="p-3 text-right font-bebas tracking-wider text-nv-fog text-xs uppercase" />
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonTableRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredProducts.length === 0 ? (
          /* ── Empty State ────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-16 w-16 rounded-full bg-nv-smoke flex items-center justify-center">
              <Package className="h-8 w-8 text-nv-fog" />
            </div>
            <h2 className="font-anton text-xl text-nv-white uppercase tracking-wider">
              {products.length === 0 ? 'No products found' : 'No products match your filters'}
            </h2>
            <p className="font-mono-brand text-sm text-nv-fog text-center max-w-md">
              {products.length === 0
                ? 'Get started by adding your first product to the store.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {products.length === 0 ? (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 bg-nv-gold text-nv-black font-anton text-sm uppercase tracking-wider px-5 py-3 hover:bg-nv-gold/90 transition-colors mt-2"
              >
                <Plus className="h-4 w-4" />
                Add your first product
              </Link>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="font-mono-brand text-sm text-nv-gold hover:underline mt-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ─────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  onDelete={setDeleteTarget}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* ── Table View ────────────────────────────────────────────────── */
          <div className="bg-nv-concrete border border-nv-smoke overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-nv-smoke bg-nv-smoke text-nv-gold focus:ring-nv-gold focus:ring-offset-0 cursor-pointer accent-nv-gold"
                    />
                  </th>
                  <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase w-14">
                    Image
                  </th>
                  <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase">
                    Name
                  </th>
                  <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase">
                    Category
                  </th>
                  <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase">
                    Price
                  </th>
                  <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase">
                    Stock
                  </th>
                  <th className="p-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase">
                    Status
                  </th>
                  <th className="p-3 text-right font-bebas tracking-wider text-nv-fog text-xs uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b border-nv-smoke transition-colors ${
                        selectedIds.has(product.id)
                          ? 'bg-nv-gold/5'
                          : 'hover:bg-nv-smoke/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="h-4 w-4 rounded border-nv-smoke bg-nv-smoke text-nv-gold focus:ring-nv-gold focus:ring-offset-0 cursor-pointer accent-nv-gold"
                        />
                      </td>

                      {/* Image */}
                      <td className="p-3">
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
                            <div className="h-12 w-12 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-nv-fog/30" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name + Badges */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-mono-brand text-sm text-nv-white font-medium hover:text-nv-gold transition-colors truncate max-w-[200px]"
                          >
                            {product.name}
                          </Link>
                          <div className="flex gap-1.5">
                            {product.isLimited && (
                              <span className="bg-nv-red text-white font-bebas text-[10px] px-1.5 py-px tracking-wider uppercase">
                                Limited
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="bg-nv-gold text-black font-bebas text-[10px] px-1.5 py-px tracking-wider uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="font-mono-brand text-sm text-nv-fog capitalize">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-mono-brand text-sm text-nv-white">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="font-mono-brand text-xs text-nv-fog line-through">
                              ${product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="p-3">
                        <span className="font-mono-brand text-sm text-nv-white">
                          {product.stockQty}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              product.inStock ? 'bg-green-500' : 'bg-nv-red'
                            }`}
                          />
                          <span
                            className={`font-mono-brand text-sm ${
                              product.inStock ? 'text-green-400' : 'text-nv-red'
                            }`}
                          >
                            {product.inStock ? 'Active' : 'Out of Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex items-center justify-center h-8 w-8 border border-nv-smoke text-nv-fog hover:text-nv-gold hover:border-nv-gold transition-colors"
                            title="Edit product"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="inline-flex items-center justify-center h-8 w-8 border border-nv-smoke text-nv-fog hover:text-nv-red hover:border-nv-red transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer count ───────────────────────────────────────────────── */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-nv-smoke">
            <p className="font-mono-brand text-xs text-nv-fog">
              Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────── */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        productName={deleteTarget?.name || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting !== null}
      />
    </div>
  );
}
