'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  ArrowUpDown,
} from 'lucide-react';

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
  address: string | Record<string, string>;
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

const STATUS_DOT_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-yellow-400',
  processing: 'bg-blue-400',
  shipped: 'bg-purple-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-red-400',
  refunded: 'bg-red-400',
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

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest total' },
  { value: 'lowest', label: 'Lowest total' },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center font-bebas text-xs px-2.5 py-1 tracking-wider border rounded-sm ${
        STATUS_COLORS[status] || STATUS_COLORS.pending
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}

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
      <td className="p-4"><div className="h-4 w-10 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-16 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-5 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" /></td>
    </tr>
  );
}

function MobileSkeletonCard() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
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
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Status counts for summary bar
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      const mapped = STATUS_MAP[o.status] || 'PENDING';
      counts[mapped] = (counts[mapped] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // Filter by status
      if (activeFilter !== 'ALL' && STATUS_MAP[order.status] !== activeFilter) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (order.customerName || '').toLowerCase().includes(q);
        const emailMatch = (order.email || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        result.sort((a, b) => (b.total || 0) - (a.total || 0));
        break;
      case 'lowest':
        result.sort((a, b) => (a.total || 0) - (b.total || 0));
        break;
    }

    return result;
  }, [orders, activeFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-anton text-2xl md:text-3xl uppercase tracking-wider text-nv-white">
            ORDERS
          </h1>
          {!loading && (
            <p className="font-mono-brand text-sm text-nv-fog mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} · {filteredOrders.length} shown
            </p>
          )}
        </div>

        {/* Status Summary Bar */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {FILTERS.filter((f) => f !== 'ALL').map((filter) => {
              const count = statusCounts[filter] || 0;
              if (count === 0) return null;
              const dotColor =
                filter === 'PENDING'
                  ? 'bg-yellow-400'
                  : filter === 'PROCESSING'
                  ? 'bg-blue-400'
                  : filter === 'SHIPPED'
                  ? 'bg-purple-400'
                  : filter === 'DELIVERED'
                  ? 'bg-green-400'
                  : 'bg-red-400';
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex items-center gap-2 font-mono-brand text-xs text-nv-fog px-3 py-1.5 border border-nv-smoke rounded-sm transition-colors hover:border-nv-fog ${
                    activeFilter === filter
                      ? 'border-nv-gold text-nv-white bg-nv-smoke/50'
                      : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  {count} {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nv-fog" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-nv-concrete border border-nv-smoke text-nv-white font-mono-brand text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-nv-gold transition-colors placeholder:text-nv-fog/50 rounded-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Tabs */}
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-bebas tracking-wider text-sm px-4 py-2 border transition-colors rounded-sm cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-nv-gold text-nv-black border-nv-gold'
                    : 'text-nv-fog border-nv-smoke hover:border-nv-fog hover:text-nv-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-nv-fog shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-nv-concrete border border-nv-smoke text-nv-white font-mono-brand text-sm px-3 py-2.5 focus:outline-none focus:border-nv-gold transition-colors appearance-none pr-8 cursor-pointer rounded-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 pointer-events-none text-nv-fog">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-nv-concrete border border-nv-smoke overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Order ID
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Customer
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
                    <td colSpan={6} className="p-12 text-center">
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
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="border-b border-nv-smoke hover:bg-nv-smoke/30 transition-colors cursor-pointer"
                      >
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-gold text-sm">
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <span className="font-mono-brand text-nv-white text-sm block">
                              {order.customerName || '—'}
                            </span>
                            <span className="font-mono-brand text-nv-fog text-xs block truncate max-w-[200px]">
                              {order.email || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-white text-sm">
                            {order.items?.length ?? 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono-brand text-nv-white text-sm">
                            ${(order.total || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
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
                <MobileSkeletonCard key={i} />
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
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="block p-4 hover:bg-nv-smoke/30 transition-colors">
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
                              ${(order.total || 0).toFixed(2)}
                            </span>
                          </div>
                          <p className="font-mono-brand text-nv-fog text-xs mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    </div>
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
