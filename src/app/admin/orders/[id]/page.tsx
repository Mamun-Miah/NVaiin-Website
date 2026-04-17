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
  MapPin,
  Copy,
  Check,
  CheckCircle2,
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
  address: string | Record<string, string>;
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

// Normal progression path
const NORMAL_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
// Terminal states
const TERMINAL_STATES = new Set(['cancelled', 'refunded', 'delivered']);

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  return (
    <span
      className={`inline-flex items-center font-bebas tracking-wider border rounded-sm ${
        large ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1'
      } ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function parseAddress(address: string | Record<string, string>): Record<string, string> {
  if (!address) return {};
  if (typeof address === 'object') return address;
  try {
    const parsed = JSON.parse(address);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

// Status Timeline Component
function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const isCancelled = currentStatus === 'cancelled';
  const isRefunded = currentStatus === 'refunded';
  const isTerminal = isCancelled || isRefunded;

  // Build the timeline steps
  const steps: { key: string; label: string; completed: boolean; current: boolean; isBreak?: boolean }[] = [];

  if (isTerminal) {
    // Show normal flow up to where it was, then cancelled/refunded
    const normalIdx = NORMAL_FLOW.indexOf(currentStatus);
    for (let i = 0; i < NORMAL_FLOW.length; i++) {
      const s = NORMAL_FLOW[i];
      steps.push({
        key: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
        completed: false,
        current: false,
      });
    }
    // Add cancelled/refunded as terminal
    steps.push({
      key: currentStatus,
      label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1),
      completed: true,
      current: false,
      isBreak: true,
    });
  } else {
    // Normal flow
    const currentIdx = NORMAL_FLOW.indexOf(currentStatus);
    for (let i = 0; i < NORMAL_FLOW.length; i++) {
      const s = NORMAL_FLOW[i];
      steps.push({
        key: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
        completed: i < currentIdx,
        current: i === currentIdx,
      });
    }
  }

  return (
    <div className="bg-nv-concrete border border-nv-smoke p-6">
      <h3 className="font-bebas tracking-wider text-nv-gold text-sm uppercase mb-6">
        ORDER TIMELINE
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div
          className={`absolute left-[11px] top-2 bottom-2 w-0.5 ${
            isTerminal ? 'bg-red-500/30' : 'bg-nv-gold/30'
          }`}
        />

        <div className="space-y-0">
          {steps.map((step, idx) => {
            const dotColor = step.completed
              ? isTerminal && step.isBreak
                ? 'bg-nv-red border-nv-red'
                : 'bg-nv-gold border-nv-gold'
              : step.current
              ? 'bg-nv-gold border-nv-gold'
              : 'bg-nv-black border-nv-fog';

            const lineColor =
              step.completed && !step.isBreak
                ? isTerminal
                  ? 'bg-red-500/30'
                  : 'bg-nv-gold/50'
                : 'bg-transparent';

            return (
              <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                {/* Dot */}
                <div className="relative z-10 mt-0.5">
                  {step.completed ? (
                    <div className={`w-6 h-6 rounded-full ${dotColor} flex items-center justify-center border-2`}>
                      <Check className="h-3 w-3 text-nv-black" />
                    </div>
                  ) : step.current ? (
                    <div className="relative">
                      <div className={`w-6 h-6 rounded-full ${dotColor} border-2`} />
                      <div className="absolute inset-0 w-6 h-6 rounded-full bg-nv-gold/30 animate-ping" />
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full ${dotColor} border-2`} />
                  )}
                </div>

                {/* Label */}
                <div className="pt-0.5">
                  <p
                    className={`font-bebas tracking-wider text-sm uppercase ${
                      step.current
                        ? 'text-nv-gold'
                        : step.completed
                        ? isTerminal && step.isBreak
                          ? 'text-nv-red'
                          : 'text-nv-white'
                        : 'text-nv-fog'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.current && (
                    <p className="font-mono-brand text-xs text-nv-gold/70 mt-0.5">
                      Current status
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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
  const [newStatus, setNewStatus] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data);
      setNewStatus(data.status);
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

  const handleCopyId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id).catch(() => {});
      setCopiedId(true);
      requestAnimationFrame(() => {
        setTimeout(() => setCopiedId(false), 2000);
      });
    }
  };

  const handleStatusChange = async () => {
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

  const parsedAddress = order ? parseAddress(order.address) : {};
  const inputClass =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50 rounded-sm';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 bg-nv-smoke animate-pulse rounded" />
          <div className="h-10 w-48 bg-nv-smoke animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-nv-concrete border border-nv-smoke p-6 space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-16 w-16 bg-nv-smoke rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-nv-smoke rounded" />
                    <div className="h-3 w-1/2 bg-nv-smoke rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-nv-concrete border border-nv-smoke p-6 space-y-3 animate-pulse">
                <div className="h-4 w-24 bg-nv-smoke rounded" />
                <div className="h-4 w-full bg-nv-smoke rounded" />
                <div className="h-4 w-3/4 bg-nv-smoke rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Package className="h-16 w-16 text-nv-fog" />
        <p className="font-mono-brand text-nv-fog text-sm">{error || 'Order not found'}</p>
        <Link
          href="/admin/orders"
          className="font-bebas tracking-wider text-nv-gold hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-nv-fog hover:text-nv-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-anton text-2xl md:text-3xl text-nv-white uppercase tracking-wider">
              ORDER #{order.id.slice(0, 8)}
            </h1>
            <p className="font-mono-brand text-nv-fog text-sm mt-0.5">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} large />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-nv-concrete border border-nv-smoke overflow-hidden">
            <div className="p-4 border-b border-nv-smoke">
              <h2 className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                ORDER ITEMS ({order.items.length})
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
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-nv-smoke hover:bg-nv-smoke/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <div className="h-12 w-12 bg-nv-smoke overflow-hidden flex-shrink-0 rounded-sm">
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
                          {item.product?.slug ? (
                            <Link
                              href={`/shop/${item.product.slug}`}
                              className="font-mono-brand text-nv-white text-sm hover:text-nv-gold transition-colors"
                            >
                              {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                            </Link>
                          ) : (
                            <span className="font-mono-brand text-nv-white text-sm">
                              {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                            </span>
                          )}
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
                        ${(order.total || 0).toFixed(2)}
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
                      <div className="h-16 w-16 bg-nv-smoke overflow-hidden flex-shrink-0 rounded-sm">
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
                  ${(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <StatusTimeline currentStatus={order.status} />
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-nv-concrete border border-nv-smoke p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-nv-gold" />
              <h3 className="font-bebas tracking-wider text-nv-gold text-sm uppercase">
                CUSTOMER
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-mono-brand text-nv-fog text-xs uppercase mb-1">Name</p>
                <p className="font-mono-brand text-nv-white text-sm">
                  {order.customerName || '—'}
                </p>
              </div>
              <div>
                <p className="font-mono-brand text-nv-fog text-xs uppercase mb-1">Email</p>
                {order.email ? (
                  <a
                    href={`mailto:${order.email}`}
                    className="font-mono-brand text-nv-gold text-sm hover:underline"
                  >
                    {order.email}
                  </a>
                ) : (
                  <p className="font-mono-brand text-nv-white text-sm">—</p>
                )}
              </div>
              {parsedAddress.phone && (
                <div>
                  <p className="font-mono-brand text-nv-fog text-xs uppercase mb-1">Phone</p>
                  <p className="font-mono-brand text-nv-white text-sm">
                    {parsedAddress.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-nv-concrete border border-nv-smoke p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-nv-gold" />
              <h3 className="font-bebas tracking-wider text-nv-gold text-sm uppercase">
                SHIPPING ADDRESS
              </h3>
            </div>
            {Object.keys(parsedAddress).length > 0 ? (
              <div className="font-mono-brand text-nv-white text-sm space-y-1">
                {parsedAddress.name && parsedAddress.name !== order.customerName && (
                  <p>{parsedAddress.name}</p>
                )}
                {parsedAddress.street && <p>{parsedAddress.street}</p>}
                {(parsedAddress.city || parsedAddress.state) && (
                  <p>
                    {[parsedAddress.city, parsedAddress.state].filter(Boolean).join(', ')}
                  </p>
                )}
                {parsedAddress.zip && <p>{parsedAddress.zip}</p>}
                {parsedAddress.country && <p>{parsedAddress.country}</p>}
              </div>
            ) : (
              <p className="font-mono-brand text-nv-fog text-sm">No address provided</p>
            )}
          </div>

          {/* Order Info Card */}
          <div className="bg-nv-concrete border border-nv-smoke p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-nv-gold" />
              <h3 className="font-bebas tracking-wider text-nv-gold text-sm uppercase">
                ORDER INFO
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-mono-brand text-nv-fog text-xs uppercase mb-1">Date Created</p>
                <p className="font-mono-brand text-nv-white text-sm">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="font-mono-brand text-nv-fog text-xs uppercase mb-1">Order ID</p>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 font-mono-brand text-nv-white text-sm hover:text-nv-gold transition-colors cursor-pointer group"
                >
                  <span className="truncate max-w-[200px]">{order.id}</span>
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-nv-gold flex-shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-nv-fog group-hover:text-nv-gold flex-shrink-0" />
                  )}
                </button>
              </div>
              {order.notes && (
                <div>
                  <p className="font-mono-brand text-nv-fog text-xs uppercase mb-1">Notes</p>
                  <p className="font-mono-brand text-nv-white text-sm whitespace-pre-line">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-nv-concrete border border-nv-smoke p-6">
            <h3 className="font-bebas tracking-wider text-nv-gold text-sm uppercase mb-4">
              UPDATE STATUS
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
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
              <button
                onClick={handleStatusChange}
                disabled={statusUpdating || newStatus === order.status}
                className="w-full bg-nv-gold text-nv-black font-anton text-sm tracking-wider uppercase py-3 hover:bg-nv-gold/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 rounded-sm"
              >
                {statusUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    UPDATING...
                  </>
                ) : (
                  'UPDATE STATUS'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
