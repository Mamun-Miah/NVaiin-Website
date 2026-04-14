'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Package } from 'lucide-react';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
  images: string;
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
  images: '',
  isLimited: false,
  isFeatured: false,
  inStock: true,
  stockQty: '0',
  displayOrder: '0',
};

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

  // Fetch product data
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
          description: found.description,
          price: String(found.price),
          compareAtPrice: found.compareAtPrice ? String(found.compareAtPrice) : '',
          category: found.category,
          sizes: Array.isArray(found.sizes) ? found.sizes : [],
          tags: Array.isArray(found.tags) ? found.tags.join(', ') : '',
          images: Array.isArray(found.images) ? found.images.join('\n') : '',
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
        images: form.images
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean),
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

  const inputClass =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50';
  const labelClass = 'block font-bebas tracking-wider text-nv-fog text-sm uppercase mb-2';

  if (loading) {
    return (
      <div className="min-h-screen bg-nv-black p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-5 w-5 bg-nv-smoke animate-pulse" />
            <div className="h-10 w-48 bg-nv-smoke animate-pulse" />
          </div>
          <div className="bg-nv-concrete border border-nv-smoke p-6 md:p-8 space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" />
                <div className="h-11 w-full bg-nv-smoke animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-nv-black p-4 md:p-8">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 py-24">
          <Package className="h-16 w-16 text-nv-fog" />
          <p className="font-mono-brand text-nv-fog text-sm">{error || 'Product not found'}</p>
          <Link
            href="/admin/products"
            className="font-bebas tracking-wider text-nv-gold hover:underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nv-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="text-nv-fog hover:text-nv-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-anton text-3xl md:text-4xl text-nv-white uppercase tracking-tight">
              Edit Product
            </h1>
          </div>
          <span className="font-mono-brand text-nv-fog text-xs">
            ID: {product.id.slice(0, 8)}...
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-nv-concrete border border-nv-smoke p-6 md:p-8 space-y-6"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Name <span className="text-nv-red">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              className={inputClass}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={form.slug}
              onChange={handleChange}
              placeholder="product-slug"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              placeholder="Product description..."
              className={`${inputClass} resize-vertical`}
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className={labelClass}>
                Price <span className="text-nv-red">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="44.99"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="compareAtPrice" className={labelClass}>
                Compare at Price
              </label>
              <input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice}
                onChange={handleChange}
                placeholder="59.99"
                className={inputClass}
              />
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
              <option value="t-shirts">T-Shirts</option>
              <option value="hoodies">Hoodies</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          {/* Sizes */}
          <div>
            <label className={labelClass}>Sizes</label>
            <div className="flex flex-wrap gap-3">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`h-10 min-w-[3rem] px-4 border font-bebas tracking-wider text-sm transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-nv-gold text-nv-black border-nv-gold'
                      : 'bg-nv-smoke text-nv-fog border-nv-smoke hover:border-nv-fog'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className={labelClass}>
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleChange}
              placeholder="streetwear, limited, cotton"
              className={inputClass}
            />
            <p className="font-mono-brand text-nv-fog text-xs mt-1.5">
              Comma-separated tags
            </p>
          </div>

          {/* Image URLs */}
          <div>
            <label htmlFor="images" className={labelClass}>
              Image URLs
            </label>
            <textarea
              id="images"
              name="images"
              rows={4}
              value={form.images}
              onChange={handleChange}
              placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
              className={`${inputClass} resize-vertical font-mono-brand text-xs`}
            />
            <p className="font-mono-brand text-nv-fog text-xs mt-1.5">
              One URL per line
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <label className={labelClass}>Options</label>
            <div className="space-y-3">
              {(
                [
                  { key: 'isLimited', label: 'Limited Edition' },
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'inStock', label: 'In Stock' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleBoolean(key)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div
                    className={`h-5 w-9 rounded-full flex items-center transition-colors ${
                      form[key] ? 'bg-nv-gold' : 'bg-nv-smoke'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-nv-white shadow-sm transition-transform ${
                        form[key] ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="font-mono-brand text-sm text-nv-white">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-nv-smoke">
            <button
              type="submit"
              disabled={submitting || !form.name || !form.price}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-nv-gold text-nv-black font-anton text-lg uppercase tracking-wider px-8 py-4 hover:bg-nv-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              {submitting ? 'Saving...' : 'Save Changes'}
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
    </div>
  );
}
