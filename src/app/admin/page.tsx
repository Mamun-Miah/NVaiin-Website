'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────

interface DashboardData {
  totalProducts: number
  totalOrders: number
  totalSubscribers: number
  totalRevenue: number
  recentOrders: {
    id: string
    customerName: string
    email: string
    total: number
    status: string
    createdAt: string
  }[]
  topProducts: { name: string; slug: string; totalSold: number; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  ordersByDay: { date: string; count: number; revenue: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  categoryDistribution: { category: string; count: number }[]
  lowStockProducts: { id: string; name: string; slug: string; stockQty: number }[]
}

// ─── Constants ───────────────────────────────────────────────────

const GOLD = '#C9A84C'
const GOLD_LIGHT = 'rgba(201, 168, 76, 0.3)'
const FOG = '#6B6B6B'

const STATUS_COLORS: Record<string, string> = {
  pending: '#EAB308',
  confirmed: '#38BDF8',
  processing: '#3B82F6',
  shipped: '#A855F7',
  delivered: '#10B981',
  cancelled: '#EF4444',
  refunded: '#F97316',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  refunded: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

// ─── Custom Tooltip ──────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
  valueLabel?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-nv-concrete border border-nv-smoke p-3 rounded-sm">
      <p className="font-mono-brand text-xs text-nv-fog mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono-brand text-sm text-nv-white">
          {valueLabel ? `${valueLabel}: ` : ''}${typeof entry.value === 'number' && valueLabel?.toLowerCase().includes('revenue') ? `$${entry.value.toFixed(2)}` : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  format,
  trend,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  format: (v: number) => string
  trend?: 'up' | 'down' | null
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-nv-concrete border border-nv-smoke p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
            {label}
          </p>
          <p className="font-anton text-3xl text-nv-white mt-1">
            {format(value)}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span
                className={`font-mono-brand text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {trend === 'up' ? '+' : '-'}12.5%
              </span>
              <span className="font-mono-brand text-xs text-nv-fog ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-nv-gold" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Status Badge ────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ?? 'bg-nv-smoke text-nv-fog border-nv-smoke'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono-brand rounded-sm border ${style}`}
    >
      {status.toUpperCase()}
    </span>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse"
          >
            <div className="h-3 w-28 bg-nv-smoke rounded-sm mb-4" />
            <div className="h-8 w-24 bg-nv-smoke rounded-sm" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue chart skeleton */}
          <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
            <div className="h-4 w-44 bg-nv-smoke rounded-sm mb-6" />
            <div className="h-[280px] bg-nv-smoke/30 rounded-sm" />
          </div>
          {/* Orders chart skeleton */}
          <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
            <div className="h-4 w-44 bg-nv-smoke rounded-sm mb-6" />
            <div className="h-[240px] bg-nv-smoke/30 rounded-sm" />
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="space-y-6">
          {/* Status skeleton */}
          <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
            <div className="h-4 w-32 bg-nv-smoke rounded-sm mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-nv-smoke/30 rounded-sm" />
              ))}
            </div>
          </div>
          {/* Top products skeleton */}
          <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
            <div className="h-4 w-32 bg-nv-smoke rounded-sm mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 bg-nv-smoke/30 rounded-sm" />
              ))}
            </div>
          </div>
          {/* Recent orders skeleton */}
          <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
            <div className="h-4 w-32 bg-nv-smoke rounded-sm mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-nv-smoke/30 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard Page ─────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading || !data) return <DashboardSkeleton />

  // Format revenue chart data
  const revenueChartData = data.revenueByMonth.map((item) => ({
    ...item,
    revenue: Number(item.revenue.toFixed(2)),
  }))

  // Format orders by day for chart
  const ordersChartData = data.ordersByDay.map((item) => ({
    ...item,
    shortDate: item.date.slice(5), // MM-DD
  }))

  // Status data for bar chart
  const statusChartData = data.ordersByStatus.map((item) => ({
    ...item,
    fill: STATUS_COLORS[item.status] ?? FOG,
  }))

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── KPI Cards Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="TOTAL REVENUE"
          value={data.totalRevenue}
          icon={DollarSign}
          format={(v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend={data.totalRevenue > 0 ? 'up' : null}
        />
        <KpiCard
          label="TOTAL ORDERS"
          value={data.totalOrders}
          icon={ShoppingCart}
          format={(v) => v.toLocaleString()}
          trend={data.totalOrders > 0 ? 'up' : null}
        />
        <KpiCard
          label="TOTAL PRODUCTS"
          value={data.totalProducts}
          icon={Package}
          format={(v) => v.toLocaleString()}
        />
        <KpiCard
          label="SUBSCRIBERS"
          value={data.totalSubscribers}
          icon={Users}
          format={(v) => v.toLocaleString()}
        />
      </div>

      {/* ─── Low Stock Alert ─── */}
      {data.lowStockProducts.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bebas tracking-wider text-red-400 text-sm uppercase mb-2">
              LOW STOCK ALERT
            </p>
            <div className="flex flex-wrap gap-3">
              {data.lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-nv-smoke/50 border border-nv-smoke rounded-sm hover:border-nv-red transition-colors cursor-pointer"
                >
                  <span className="font-mono-brand text-xs text-nv-white">
                    {p.name}
                  </span>
                  <span className="font-mono-brand text-xs text-red-400 font-bold">
                    {p.stockQty} left
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Overview Chart */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-anton text-lg tracking-wider text-nv-gold">
                REVENUE OVERVIEW
              </h2>
              <BarChart3 className="h-4 w-4 text-nv-fog" />
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: FOG, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: FOG, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<CustomTooltip valueLabel="Revenue" />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={GOLD}
                    strokeWidth={2}
                    fill="url(#goldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Orders Trend Chart */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-anton text-lg tracking-wider text-nv-gold">
                ORDERS TREND
              </h2>
              <ShoppingCart className="h-4 w-4 text-nv-fog" />
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fill: FOG, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: FOG, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip valueLabel="Orders" />} />
                  <Bar dataKey="count" fill={GOLD} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Orders Table */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke"
          >
            <div className="p-5 border-b border-nv-smoke flex items-center justify-between">
              <h2 className="font-anton text-lg tracking-wider text-nv-white">
                RECENT ORDERS
              </h2>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1.5 font-mono-brand text-xs text-nv-gold hover:text-nv-white transition-colors cursor-pointer"
              >
                VIEW ALL
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data.recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingCart className="h-10 w-10 text-nv-fog mx-auto mb-3" />
                <p className="font-mono-brand text-nv-fog text-sm">
                  No orders yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-nv-smoke">
                      <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                        Order ID
                      </th>
                      <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3 hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                        Total
                      </th>
                      <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                        Status
                      </th>
                      <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3 hidden md:table-cell">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-nv-smoke/50 hover:bg-nv-smoke/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono-brand text-sm text-nv-gold hover:text-nv-white transition-colors"
                          >
                            {order.id.slice(0, 8)}...
                          </Link>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <div>
                            <p className="font-mono-brand text-sm text-nv-white">
                              {order.customerName || 'Unknown'}
                            </p>
                            <p className="font-mono-brand text-xs text-nv-fog">
                              {order.email || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono-brand text-sm text-nv-white">
                            ${Number(order.total).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={order.status || 'pending'} />
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="font-mono-brand text-xs text-nv-fog">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <h2 className="font-anton text-lg tracking-wider text-nv-white mb-4">
              ORDER STATUS
            </h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={statusChartData}
                  margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2A2A2A"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: FOG, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fill: FOG, fontSize: 11, fontFamily: "'Space Mono', monospace" }}
                    axisLine={{ stroke: '#2A2A2A' }}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      borderRadius: '2px',
                      fontSize: '12px',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {statusChartData.length === 0 && (
              <p className="font-mono-brand text-xs text-nv-fog text-center py-4">
                No orders to display
              </p>
            )}
          </motion.div>

          {/* Top Products */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <h2 className="font-anton text-lg tracking-wider text-nv-white mb-4">
              TOP PRODUCTS
            </h2>
            {data.topProducts.length === 0 ? (
              <div className="text-center py-6">
                <Package className="h-8 w-8 text-nv-fog mx-auto mb-2" />
                <p className="font-mono-brand text-xs text-nv-fog">
                  No product sales data yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.slug}
                    className="flex items-center gap-3"
                  >
                    <span className="font-anton text-sm text-nv-fog w-5 text-right shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-mono-brand text-xs text-nv-white truncate mr-2">
                          {product.name}
                        </p>
                        <span className="font-mono-brand text-xs text-nv-gold shrink-0">
                          ${product.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 h-1 bg-nv-smoke rounded-full mr-3">
                          <div
                            className="h-full bg-nv-gold rounded-full transition-all"
                            style={{
                              width: `${data.topProducts[0]?.revenue ? (product.revenue / data.topProducts[0].revenue) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono-brand text-[10px] text-nv-fog shrink-0">
                          {product.totalSold} sold
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <h2 className="font-anton text-lg tracking-wider text-nv-white mb-4">
              CATEGORIES
            </h2>
            <div className="space-y-3">
              {data.categoryDistribution.length === 0 ? (
                <p className="font-mono-brand text-xs text-nv-fog text-center py-4">
                  No categories yet
                </p>
              ) : (
                data.categoryDistribution.map((cat) => {
                  const maxCount = Math.max(
                    ...data.categoryDistribution.map((c) => c.count)
                  )
                  return (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="font-mono-brand text-xs text-nv-fog w-24 truncate shrink-0 capitalize">
                        {cat.category}
                      </span>
                      <div className="flex-1 h-1.5 bg-nv-smoke rounded-full">
                        <div
                          className="h-full bg-nv-gold/70 rounded-full transition-all"
                          style={{
                            width: `${maxCount ? (cat.count / maxCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono-brand text-xs text-nv-white shrink-0 w-6 text-right">
                        {cat.count}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
