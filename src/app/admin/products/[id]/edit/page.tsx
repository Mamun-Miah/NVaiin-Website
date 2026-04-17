'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Package,
  AlertTriangle,
  Trash2,
  ImageIcon,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'ONE SIZE'];
const CATEGORY_OPTIONS = [
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'sweatshirts', label: 'Sweatshirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'caps', label: 'Caps' },
];

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

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  sizes: string[];
  tags: string;
  imageUrls: string[];
  isLimited: boolean;
  isFeatured: boolean;
  inStock: boolean;
  stockQty: string;
  displayOrder: string;
}

const emptyForm: FormData = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: 't-shirts',
  sizes: [],
  tags: '',
  imageUrls: [],
  isLimited: false,
  isFeatured: false,
  inStock: true,
  stockQty: '0',
  displayOrder: '0',
};

// ── Shared Styles ─────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50';
const labelClass =
  'block font-bebas tracking-wider text-nv-fog text-sm uppercase mb-2';
const sectionLabelClass =
  'block font-anton text-base text-nv-white uppercase tracking-wider mb-4 pb-2 border-b border-nv-smoke';

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onCancel}
          />
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
                    Are you sure you want to permanently delete{' '}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch product ───────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data: Product[] = await res.json();
        const found = data.find((p) => p.id === id);
        if (!found) {
          setError('Product not found');
          return;
        }
        setProduct(found);
        setForm({
          name: found.name,
          slug: found.slug,
          description: found.description || '',
          price: String(found.price),
          compareAtPrice: found.compareAtPrice ? String(found.compareAtPrice) : '',
          category: found.category,
          sizes: Array.isArray(found.sizes) ? found.sizes : [],
          tags: Array.isArray(found.tags) ? found.tags.join(', ') : '',
          imageUrls: Array.isArray(found.images) ? [...found.images] : [],
          isLimited: found.isLimited,
          isFeatured: found.isFeatured,
          inStock: found.inStock,
          stockQty: String(found.stockQty),
          displayOrder: String(found.displayOrder),
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleBoolean = (field: 'isLimited' | 'isFeatured' | 'inStock') => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ── Image management ────────────────────────────────────────────────────

  const addImage = () => {
    const url = newImageUrl.trim();
    if (url && !form.imageUrls.includes(url)) {
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newUrls = [...form.imageUrls];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newUrls.length) return;
    [newUrls[index], newUrls[targetIndex]] = [newUrls[targetIndex], newUrls[index]];
    setForm((prev) => ({ ...prev, imageUrls: newUrls }));
  };

  // ── Tag management ──────────────────────────────────────────────────────

  const parsedTags = form.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const removeTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== tagToRemove)
        .join(', '),
    }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);

    try {
      const payload = {
        id: product.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        category: form.category,
        sizes: form.sizes,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: form.imageUrls,
        isLimited: form.isLimited,
        isFeatured: form.isFeatured,
        inStock: form.inStock,
        stockQty: parseInt(form.stockQty, 10) || 0,
        displayOrder: parseInt(form.displayOrder, 10) || 0,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update product');
      }

      router.push('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      alert(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-nv-black p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-5 w-5 bg-nv-smoke animate-pulse rounded" />
            <div className="h-8 w-48 bg-nv-smoke animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-nv-concrete border border-nv-smoke p-5 md:p-6 space-y-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" />
                    <div className="h-11 w-full bg-nv-smoke animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-nv-concrete border border-nv-smoke p-5 space-y-4">
                  <div className="h-5 w-32 bg-nv-smoke animate-pulse rounded" />
                  <div className="h-11 w-full bg-nv-smoke animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────

  if (error || !product) {
    return (
      <div className="min-h-screen bg-nv-black p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center gap-4 py-24">
          <div className="h-16 w-16 rounded-full bg-nv-smoke flex items-center justify-center">
            <Package className="h-8 w-8 text-nv-fog" />
          </div>
          <p className="font-mono-brand text-nv-fog text-sm">
            {error || 'Product not found'}
          </p>
          <Link
            href="/admin/products"
            className="font-bebas tracking-wider text-nv-gold hover:underline uppercase"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Formatted date ──────────────────────────────────────────────────────

  const formattedDate = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-nv-black p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="text-nv-fog hover:text-nv-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-anton text-2xl md:text-3xl text-nv-white uppercase tracking-wider">
                Edit Product
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono-brand text-xs text-nv-fog">
                  ID: {product.id.slice(0, 12)}
                </span>
                <span className="text-nv-fog/30">·</span>
                <span className="font-mono-brand text-xs text-nv-fog">
                  Created: {formattedDate}
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="font-bebas tracking-wider text-nv-fog text-sm hover:text-nv-gold transition-colors uppercase"
          >
            Cancel
          </Link>
        </div>

        {/* ── Two Column Layout ──────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Column: Main Fields ───────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-nv-concrete border border-nv-smoke p-5 md:p-6 space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Product Name <span className="text-nv-red">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Midnight Vortex Tee"
                    className={inputClass}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className={labelClass}>
                    URL Slug
                  </label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="product-slug"
                    className={`${inputClass} font-mono-brand text-xs`}
                  />
                  <p className="font-mono-brand text-nv-fog text-xs mt-1.5">
                    Edit if needed. Used in product URL.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, materials, fit, etc."
                    className={`${inputClass} resize-vertical`}
                    maxLength={2000}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="font-mono-brand text-nv-fog text-xs">
                      Supports plain text
                    </span>
                    <span className="font-mono-brand text-xs text-nv-fog">
                      {form.description.length} / 2000
                    </span>
                  </div>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="price" className={labelClass}>
                      Price <span className="text-nv-red">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brand text-sm text-nv-fog">
                        $
                      </span>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="compareAtPrice" className={labelClass}>
                      Compare at Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brand text-sm text-nv-fog">
                        $
                      </span>
                      <input
                        id="compareAtPrice"
                        name="compareAtPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.compareAtPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Right Column: Sidebar ──────────────────────────────────── */}
            <div className="space-y-6">
              {/* Product Images */}
              <div className="bg-nv-concrete border border-nv-smoke p-5 space-y-4">
                <label className={sectionLabelClass}>Product Images</label>

                {/* Existing images */}
                {form.imageUrls.length > 0 && (
                  <div className="space-y-2">
                    {form.imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-nv-smoke/50 border border-nv-smoke p-2"
                      >
                        <div className="h-12 w-12 bg-nv-black overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={url}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono-brand text-[10px] text-nv-fog truncate">
                            {url}
                          </p>
                          <p className="font-mono-brand text-[10px] text-nv-fog/50 mt-0.5">
                            Image {index + 1}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-nv-fog hover:text-nv-white disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === form.imageUrls.length - 1}
                            className="p-1.5 text-nv-fog hover:text-nv-white disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 text-nv-fog hover:text-nv-red transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add image input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                    placeholder="Paste image URL..."
                    className="flex-1 bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-xs px-3 py-2.5 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    disabled={!newImageUrl.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-nv-gold/10 border border-nv-gold/30 text-nv-gold font-bebas text-xs tracking-wider uppercase hover:bg-nv-gold/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                <p className="font-mono-brand text-nv-fog text-xs">
                  {form.imageUrls.length} image{form.imageUrls.length !== 1 ? 's' : ''} added
                </p>
              </div>

              {/* Sizes */}
              <div className="bg-nv-concrete border border-nv-smoke p-5 space-y-4">
                <label className={sectionLabelClass}>Sizes</label>
                <div className="grid grid-cols-4 gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-9 px-2 border font-bebas tracking-wider text-xs transition-colors ${
                        form.sizes.includes(size)
                          ? 'bg-nv-gold text-nv-black border-nv-gold'
                          : 'bg-nv-smoke text-nv-fog border-nv-smoke hover:border-nv-fog'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {form.sizes.length > 0 && (
                  <p className="font-mono-brand text-xs text-nv-fog">
                    {form.sizes.length} size{form.sizes.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="bg-nv-concrete border border-nv-smoke p-5 space-y-4">
                <label className={sectionLabelClass}>Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={handleChange}
                  name="tags"
                  placeholder="streetwear, limited, cotton"
                  className={inputClass}
                />
                <p className="font-mono-brand text-nv-fog text-xs">
                  Comma-separated tags
                </p>

                {/* Tag chips */}
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-nv-smoke border border-nv-smoke px-2.5 py-1 font-mono-brand text-xs text-nv-fog"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-nv-fog/50 hover:text-nv-red transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="bg-nv-concrete border border-nv-smoke p-5 space-y-4">
                <label className={sectionLabelClass}>Options</label>
                <div className="space-y-3">
                  {(
                    [
                      { key: 'isLimited' as const, label: 'Limited Edition' },
                      { key: 'isFeatured' as const, label: 'Featured Product' },
                      { key: 'inStock' as const, label: 'In Stock' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBoolean(key)}
                      className="flex items-center justify-between w-full"
                    >
                      <span className="font-mono-brand text-sm text-nv-white">
                        {label}
                      </span>
                      <div
                        className={`h-5 w-9 rounded-full flex items-center transition-colors cursor-pointer ${
                          form[key] ? 'bg-nv-gold' : 'bg-nv-smoke'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-nv-white shadow-sm transition-transform ${
                            form[key] ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock & Display */}
              <div className="bg-nv-concrete border border-nv-smoke p-5 space-y-4">
                <label className={sectionLabelClass}>Stock & Display</label>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="stockQty" className={labelClass}>
                      Stock Quantity
                    </label>
                    <input
                      id="stockQty"
                      name="stockQty"
                      type="number"
                      min="0"
                      value={form.stockQty}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="displayOrder" className={labelClass}>
                      Display Order
                    </label>
                    <input
                      id="displayOrder"
                      name="displayOrder"
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <p className="font-mono-brand text-nv-fog text-xs mt-1.5">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Actions (full width) ──────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-nv-smoke">
            <button
              type="submit"
              disabled={submitting || !form.name || !form.price}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-nv-gold text-nv-black font-anton text-base uppercase tracking-wider px-8 py-4 hover:bg-nv-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-transparent border border-nv-red text-nv-red font-anton text-base uppercase tracking-wider px-8 py-4 hover:bg-nv-red hover:text-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Product
            </button>
            <Link
              href="/admin/products"
              className="flex-1 sm:flex-none inline-flex items-center justify-center font-bebas tracking-wider uppercase px-8 py-4 border border-nv-smoke text-nv-fog hover:text-nv-white hover:border-nv-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>

      {/* ── Delete Confirm Dialog ────────────────────────────────────────── */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        productName={product.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        deleting={deleting}
      />
    </div>
  );
}
