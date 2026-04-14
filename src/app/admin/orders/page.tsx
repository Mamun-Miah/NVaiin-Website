'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  size: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  address: Record<string, string>;
  items: OrderItem[];
  total: number;
  status: string;
  notes: string;
  createdAt: string;
}

const FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
type FilterType = (typeof FILTERS)[number];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_MAP: Record<string, FilterType> = {
  pending: 'PENDING',
  confirmed: 'PENDING',
  processing: 'PROCESSING',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  refunded: 'CANCELLED',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function SkeletonRow() {
  return (
    <tr className="border-b border-nv-smoke">
      <td className="p-4"><div className="h-4 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-28 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-36 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-12 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-5 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" /></td>
    </tr>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    return STATUS_MAP[order.status] === activeFilter;
  });

  return (
    <div className="min-h-screen bg-nv-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-anton text-3xl md:text-4xl text-nv-white uppercase tracking-tight">
            Orders
          </h1>
          {!loading && (
            <p className="font-mono-brand text-nv-fog text-sm mt-2">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
              {activeFilter !== 'ALL' && ` · ${filteredOrders.length} filtered`}
            </p>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`font-bebas tracking-wider text-sm px-4 py-2 border transition-colors ${
                activeFilter === filter
                  ? 'bg-nv-gold text-nv-black border-nv-gold'
                  : 'text-nv-fog border-nv-smoke hover:border-nv-fog hover:text-nv-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-nv-concrete border border-nv-smoke overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Order
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Customer
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Email
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Items
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Total
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Status
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ShoppingCart className="h-12 w-12 text-nv-fog" />
                        <p className="font-mono-brand text-nv-fog text-sm">
                          {activeFilter === 'ALL'
                            ? 'No orders yet'
                            : `No ${activeFilter.toLowerCase()} orders`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-nv-smoke hover:bg-nv-smoke/50 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono-brand text-nv-gold text-sm hover:underline"
                          >
                            #{order.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-white text-sm">
                            {order.customerName || '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-fog text-sm truncate block max-w-[200px]">
                            {order.email || '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-white text-sm">
                            {order.items?.length ?? 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-white text-sm">
                            ${order.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center font-bebas text-xs px-2.5 py-1 tracking-wider border ${
                              STATUS_COLORS[order.status] || STATUS_COLORS.pending
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-fog text-sm">
                            {formatDate(order.createdAt)}
                          </span>
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
                <div key={i} className="p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-nv-smoke rounded" />
                    <div className="h-5 w-20 bg-nv-smoke rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-nv-smoke rounded" />
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-nv-smoke rounded" />
                    <div className="h-4 w-16 bg-nv-smoke rounded" />
                  </div>
                </div>
              ))
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <ShoppingCart className="h-12 w-12 text-nv-fog" />
                  <p className="font-mono-brand text-nv-fog text-sm">
                    {activeFilter === 'ALL'
                      ? 'No orders yet'
                      : `No ${activeFilter.toLowerCase()} orders`}
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="block p-4 hover:bg-nv-smoke/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono-brand text-nv-gold text-sm">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="font-mono-brand text-nv-white text-sm mt-1">
                            {order.customerName || '—'}
                          </p>
                          <p className="font-mono-brand text-nv-fog text-xs mt-0.5">
                            {order.email || '—'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-mono-brand text-nv-fog text-xs">
                              {order.items?.length ?? 0} items
                            </span>
                            <span className="font-mono-brand text-nv-white text-sm font-medium">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <p className="font-mono-brand text-nv-fog text-xs mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center font-bebas text-xs px-2.5 py-1 tracking-wider border flex-shrink-0 ${
                            STATUS_COLORS[order.status] || STATUS_COLORS.pending
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
