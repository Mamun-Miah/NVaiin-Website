'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Package,
  Mail,
  User,
  Calendar,
  Save,
} from 'lucide-react';

interface OrderItemWithProduct {
  id: string;
  productId: string;
  size: string;
  qty: number;
  price: number;
  product: {
    name: string;
    slug: string;
    images: string[];
  } | null;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  address: Record<string, string>;
  items: OrderItemWithProduct[];
  total: number;
  status: string;
  notes: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status) return;
    setStatusUpdating(true);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setOrder(updated);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const inputClass =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50';
  const labelClass = 'block font-bebas tracking-wider text-nv-fog text-sm uppercase mb-2';

  if (loading) {
    return (
      <div className="min-h-screen bg-nv-black p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-5 w-5 bg-nv-smoke animate-pulse" />
            <div className="h-10 w-48 bg-nv-smoke animate-pulse" />
          </div>
          <div className="bg-nv-concrete border border-nv-smoke p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" />
                  <div className="h-10 w-full bg-nv-smoke animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="h-px bg-nv-smoke" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-16 w-16 bg-nv-smoke rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-nv-smoke rounded" />
                  <div className="h-3 w-1/2 bg-nv-smoke rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-nv-black p-4 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 py-24">
          <Package className="h-16 w-16 text-nv-fog" />
          <p className="font-mono-brand text-nv-fog text-sm">{error || 'Order not found'}</p>
          <Link
            href="/admin/orders"
            className="font-bebas tracking-wider text-nv-gold hover:underline"
          >
            Back to Orders
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
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/orders"
              className="text-nv-fog hover:text-nv-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-anton text-3xl md:text-4xl text-nv-white uppercase tracking-tight">
                Order Details
              </h1>
              <p className="font-mono-brand text-nv-fog text-sm mt-0.5">
                #{order.id}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center font-bebas text-xs px-3 py-1.5 tracking-wider border ${
              STATUS_COLORS[order.status] || STATUS_COLORS.pending
            }`}
          >
            {statusUpdating && (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            )}
            {order.status.toUpperCase()}
          </span>
        </div>

        {/* Order Info Card */}
        <div className="bg-nv-concrete border border-nv-smoke p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className={labelClass}>
                <User className="h-3.5 w-3.5 inline mr-1.5" />
                Customer
              </label>
              <p className="font-mono-brand text-nv-white text-sm">
                {order.customerName || '—'}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                Email
              </label>
              <p className="font-mono-brand text-nv-white text-sm">
                {order.email || '—'}
              </p>
            </div>

            {/* Date */}
            <div>
              <label className={labelClass}>
                <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                Date
              </label>
              <p className="font-mono-brand text-nv-white text-sm">
                {formatDate(order.createdAt)}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <div className="relative">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className={`${inputClass} appearance-none pr-10 cursor-pointer disabled:opacity-50`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-nv-fog">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Address */}
            {order.address && Object.keys(order.address).length > 0 && (
              <div className="md:col-span-2">
                <label className={labelClass}>Shipping Address</label>
                <p className="font-mono-brand text-nv-white text-sm whitespace-pre-line">
                  {Object.values(order.address).filter(Boolean).join('\n') || '—'}
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea
                rows={3}
                value={order.notes}
                readOnly
                className={`${inputClass} resize-vertical`}
                placeholder="No notes..."
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-nv-concrete border border-nv-smoke overflow-hidden mb-6">
          <div className="p-4 border-b border-nv-smoke">
            <h2 className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
              Line Items ({order.items.length})
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Product
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Size
                  </th>
                  <th className="p-4 text-center font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Qty
                  </th>
                  <th className="p-4 text-right font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Price
                  </th>
                  <th className="p-4 text-right font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-nv-smoke ${
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-nv-smoke/30'
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.product?.images?.[0] && (
                          <div className="h-12 w-12 bg-nv-smoke overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name || 'Product'}
                              width={48}
                              height={48}
                              className="h-12 w-12 object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="font-mono-brand text-nv-white text-sm">
                          {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono-brand text-nv-fog text-sm">
                        {item.size || '—'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono-brand text-nv-white text-sm">
                        {item.qty}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono-brand text-nv-white text-sm">
                        ${item.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono-brand text-nv-white text-sm font-medium">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-nv-gold/30">
                  <td colSpan={4} className="p-4 text-right">
                    <span className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                      Order Total
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-anton text-2xl text-nv-gold">
                      ${order.total.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-nv-smoke">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex gap-3">
                  {item.product?.images?.[0] && (
                    <div className="h-16 w-16 bg-nv-smoke overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name || 'Product'}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-brand text-nv-white text-sm font-medium truncate">
                      {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                    </p>
                    <p className="font-mono-brand text-nv-fog text-xs mt-0.5">
                      Size: {item.size || '—'} · Qty: {item.qty}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono-brand text-nv-white text-sm">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                    <p className="font-mono-brand text-nv-fog text-xs">
                      @ ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 border-t border-nv-gold/30 flex justify-between items-center">
              <span className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                Order Total
              </span>
              <span className="font-anton text-2xl text-nv-gold">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 font-bebas tracking-wider text-nv-fog text-sm hover:text-nv-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </motion.div>
    </div>
  );
}
