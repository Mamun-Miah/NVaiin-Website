'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: { id: string }[];
}

interface Customer {
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  firstOrderDate: string;
  orders: Order[];
  isActive: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-red-500/20 text-red-400 border-red-500/30',
};

type SortOption = 'spent-desc' | 'spent-asc' | 'orders-desc' | 'orders-asc' | 'recent' | 'name';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'spent-desc', label: 'Most spent' },
  { value: 'spent-asc', label: 'Least spent' },
  { value: 'orders-desc', label: 'Most orders' },
  { value: 'orders-asc', label: 'Fewest orders' },
  { value: 'recent', label: 'Recent order' },
  { value: 'name', label: 'Name A-Z' },
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

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-nv-smoke">
      <td className="p-4"><div className="h-4 w-32 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-12 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-20 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-4 w-24 bg-nv-smoke animate-pulse rounded" /></td>
      <td className="p-4"><div className="h-5 w-16 bg-nv-smoke animate-pulse rounded" /></td>
    </tr>
  );
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('spent-desc');
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const orders: Order[] = Array.isArray(await res.json()) ? (await res.json()) : [];

      // Aggregate by email
      const customerMap = new Map<string, Customer>();

      for (const order of orders) {
        const email = order.email || 'unknown';
        const existing = customerMap.get(email);

        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += Number(order.total) || 0;
          existing.orders.push(order);

          // Update last/first order dates
          const orderDate = new Date(order.createdAt).getTime();
          if (orderDate > new Date(existing.lastOrderDate).getTime()) {
            existing.lastOrderDate = order.createdAt;
            // Keep the most recent name
            existing.name = order.customerName || existing.name;
          }
          if (orderDate < new Date(existing.firstOrderDate).getTime()) {
            existing.firstOrderDate = order.createdAt;
          }
        } else {
          customerMap.set(email, {
            email,
            name: order.customerName || 'Unknown',
            totalOrders: 1,
            totalSpent: Number(order.total) || 0,
            lastOrderDate: order.createdAt,
            firstOrderDate: order.createdAt,
            orders: [order],
            isActive: true,
          });
        }
      }

      // Calculate active status (last order within 30 days)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const customerList = Array.from(customerMap.values()).map((c) => ({
        ...c,
        isActive: new Date(c.lastOrderDate).getTime() > thirtyDaysAgo,
      }));

      setCustomers(customerList);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return {
      totalCustomers: customers.length,
      totalRevenue,
      avgOrderValue,
    };
  }, [customers]);

  // Filtered and sorted
  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'spent-desc':
        sorted.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'spent-asc':
        sorted.sort((a, b) => a.totalSpent - b.totalSpent);
        break;
      case 'orders-desc':
        sorted.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case 'orders-asc':
        sorted.sort((a, b) => a.totalOrders - b.totalOrders);
        break;
      case 'recent':
        sorted.sort(
          (a, b) =>
            new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
        );
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [customers, searchQuery, sortBy]);

  const toggleExpand = (email: string) => {
    setExpandedEmail((prev) => (prev === email ? null : email));
  };

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
            CUSTOMERS
          </h1>
          {!loading && (
            <p className="font-mono-brand text-sm text-nv-fog mt-1">
              {stats.totalCustomers} unique customer{stats.totalCustomers !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Stats Row */}
        {!loading && customers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Total Customers
                  </p>
                  <p className="font-anton text-3xl text-nv-white mt-2">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-nv-gold" />
                </div>
              </div>
            </div>
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Total Revenue
                  </p>
                  <p className="font-anton text-3xl text-nv-white mt-2">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-nv-gold" />
                </div>
              </div>
            </div>
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Avg Order Value
                  </p>
                  <p className="font-anton text-3xl text-nv-white mt-2">
                    {formatCurrency(stats.avgOrderValue)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-nv-gold" />
                </div>
              </div>
            </div>
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

        {/* Customers Table */}
        <div className="bg-nv-concrete border border-nv-smoke overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Customer
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Orders
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Total Spent
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Last Order
                  </th>
                  <th className="p-4 text-left font-bebas tracking-wider text-nv-fog text-sm uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-nv-fog" />
                        <p className="font-mono-brand text-nv-fog text-sm">
                          {searchQuery ? 'No customers match your search' : 'No customers yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredCustomers.map((customer) => (
                      <CustomerRow
                        key={customer.email}
                        customer={customer}
                        isExpanded={expandedEmail === customer.email}
                        onToggle={() => toggleExpand(customer.email)}
                        onOrderClick={(orderId) => router.push(`/admin/orders/${orderId}`)}
                      />
                    ))}
                  </>
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
                    <div className="h-4 w-28 bg-nv-smoke rounded" />
                    <div className="h-5 w-16 bg-nv-smoke rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-nv-smoke rounded" />
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-nv-smoke rounded" />
                    <div className="h-4 w-20 bg-nv-smoke rounded" />
                  </div>
                </div>
              ))
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Users className="h-12 w-12 text-nv-fog" />
                  <p className="font-mono-brand text-nv-fog text-sm">
                    {searchQuery ? 'No customers match your search' : 'No customers yet'}
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredCustomers.map((customer) => (
                  <CustomerMobileCard
                    key={customer.email}
                    customer={customer}
                    isExpanded={expandedEmail === customer.email}
                    onToggle={() => toggleExpand(customer.email)}
                    onOrderClick={(orderId) => router.push(`/admin/orders/${orderId}`)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CustomerRow({
  customer,
  isExpanded,
  onToggle,
  onOrderClick,
}: {
  customer: Customer;
  isExpanded: boolean;
  onToggle: () => void;
  onOrderClick: (orderId: string) => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-nv-smoke hover:bg-nv-smoke/30 transition-colors cursor-pointer"
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
              <span className="font-anton text-xs text-nv-gold">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <span className="font-mono-brand text-nv-white text-sm block truncate">
                {customer.name}
              </span>
              <span className="font-mono-brand text-nv-fog text-xs block truncate max-w-[200px]">
                {customer.email}
              </span>
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="font-mono-brand text-nv-white text-sm">
            {customer.totalOrders}
          </span>
        </td>
        <td className="p-4">
          <span className="font-mono-brand text-nv-white text-sm font-medium">
            {formatCurrency(customer.totalSpent)}
          </span>
        </td>
        <td className="p-4">
          <span className="font-mono-brand text-nv-fog text-sm">
            {formatDate(customer.lastOrderDate)}
          </span>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 font-mono-brand text-xs px-2 py-0.5 rounded-sm ${
                customer.isActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-nv-smoke text-nv-fog border border-nv-smoke'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${customer.isActive ? 'bg-green-400' : 'bg-nv-fog'}`} />
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-nv-fog" />
            ) : (
              <ChevronDown className="h-4 w-4 text-nv-fog" />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Order History */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-nv-smoke/20"
          >
            <td colSpan={5} className="p-0">
              <div className="p-4 pl-16">
                <p className="font-bebas tracking-wider text-nv-fog text-xs uppercase mb-3">
                  ORDER HISTORY ({customer.orders.length})
                </p>
                <div className="space-y-2">
                  {customer.orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderClick(order.id);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-nv-concrete border border-nv-smoke hover:border-nv-gold/50 transition-colors rounded-sm cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono-brand text-nv-gold text-xs flex-shrink-0">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="font-mono-brand text-nv-fog text-xs flex-shrink-0">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono-brand text-nv-white text-xs">
                          {formatCurrency(Number(order.total) || 0)}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

function CustomerMobileCard({
  customer,
  isExpanded,
  onToggle,
  onOrderClick,
}: {
  customer: Customer;
  isExpanded: boolean;
  onToggle: () => void;
  onOrderClick: (orderId: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div
        onClick={onToggle}
        className="block p-4 hover:bg-nv-smoke/30 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
              <span className="font-anton text-sm text-nv-gold">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-mono-brand text-nv-white text-sm font-medium truncate">
                {customer.name}
              </p>
              <p className="font-mono-brand text-nv-fog text-xs truncate">
                {customer.email}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono-brand text-nv-fog text-xs">
                  {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''}
                </span>
                <span className="font-mono-brand text-nv-white text-sm font-medium">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
              <p className="font-mono-brand text-nv-fog text-xs mt-1">
                Last: {formatDate(customer.lastOrderDate)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 font-mono-brand text-xs px-2 py-0.5 rounded-sm ${
                customer.isActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-nv-smoke text-nv-fog border border-nv-smoke'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${customer.isActive ? 'bg-green-400' : 'bg-nv-fog'}`} />
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-nv-fog" />
            ) : (
              <ChevronDown className="h-4 w-4 text-nv-fog" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-nv-smoke/20 border-t border-nv-smoke"
          >
            <div className="p-4 pl-16">
              <p className="font-bebas tracking-wider text-nv-fog text-xs uppercase mb-3">
                ORDER HISTORY ({customer.orders.length})
              </p>
              <div className="space-y-2">
                {customer.orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrderClick(order.id);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-nv-concrete border border-nv-smoke hover:border-nv-gold/50 transition-colors rounded-sm cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono-brand text-nv-gold text-xs flex-shrink-0">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="font-mono-brand text-nv-fog text-xs flex-shrink-0">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono-brand text-nv-white text-xs">
                        {formatCurrency(Number(order.total) || 0)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
