'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Calculator,
  Users,
  TrendingUp,
  ArrowRight,
  Package,
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
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────

interface AnalyticsData {
  orders: {
    id: string
    customerName: string
    email: string
    total: number
    status: string
    createdAt: string
  }[]
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  ordersByStatus: { status: string; count: number }[]
  dailyOrders: { date: string; count: number; revenue: number }[]
  topProducts: { name: string; totalSold: number; revenue: number }[]
  customerStats: {
    uniqueCustomers: number
    returningCustomers: number
  }
}

type DatePreset = '7d' | '30d' | '90d' | '1y'

interface DateRange {
  from: string
  to: string
  label: string
}

// ─── Constants ───────────────────────────────────────────────────

const GOLD = '#C9A84C'
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

function getDateRange(preset: DatePreset): DateRange {
  const now = new Date()
  const to = now.toISOString().split('T')[0]
  let from: Date

  switch (preset) {
    case '7d':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      return { from: from.toISOString().split('T')[0], to, label: 'Last 7 days' }
    case '30d':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
      return { from: from.toISOString().split('T')[0], to, label: 'Last 30 days' }
    case '90d':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89)
      return { from: from.toISOString().split('T')[0], to, label: 'Last 90 days' }
    case '1y':
      from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return { from: from.toISOString().split('T')[0], to, label: 'Last 12 months' }
  }
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '1y', label: '1Y' },
]

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

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-nv-concrete border border-nv-smoke p-3 rounded-sm">
      <p className="font-mono-brand text-xs text-nv-fog mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono-brand text-sm text-nv-white">
          {entry.dataKey === 'revenue'
            ? `Revenue: $${entry.value.toFixed(2)}`
            : `${entry.dataKey}: ${entry.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-48 bg-nv-smoke animate-pulse rounded-sm" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
          <div className="h-4 w-44 bg-nv-smoke rounded-sm mb-6" />
          <div className="h-[280px] bg-nv-smoke/30 rounded-sm" />
        </div>
        <div className="bg-nv-concrete border border-nv-smoke p-5 animate-pulse">
          <div className="h-4 w-44 bg-nv-smoke rounded-sm mb-6" />
          <div className="h-[280px] bg-nv-smoke/30 rounded-sm" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Analytics Page ─────────────────────────────────────────

export default function AnalyticsPage() {
  const [activePreset, setActivePreset] = useState<DatePreset>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const range = getDateRange(activePreset)

  const fetchAnalytics = useCallback(async (preset: DatePreset) => {
    setLoading(true)
    try {
      const { from, to } = getDateRange(preset)
      const res = await fetch(
        `/api/admin/analytics?from=${from}&to=${to}`
      )
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics(activePreset)
  }, [activePreset, fetchAnalytics])

  const handlePresetChange = (preset: DatePreset) => {
    setActivePreset(preset)
  }

  if (loading && !data) return <AnalyticsSkeleton />

  const currentData = data

  // Format chart data
  const revenueChartData = (currentData?.dailyOrders ?? []).map((item) => ({
    ...item,
    shortDate: item.date.slice(5),
    revenue: Number(item.revenue.toFixed(2)),
  }))

  const ordersChartData = (currentData?.dailyOrders ?? []).map((item) => ({
    ...item,
    shortDate: item.date.slice(5),
  }))

  // Status totals for percentage calculation
  const totalStatusCount = (currentData?.ordersByStatus ?? []).reduce(
    (sum, s) => sum + s.count,
    0
  )

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Header with Date Range ─── */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-anton text-xl tracking-wider text-nv-white">
            ANALYTICS
          </h2>
          <p className="font-mono-brand text-xs text-nv-fog mt-1">
            {range.from} — {range.to}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handlePresetChange(preset.key)}
              className={`px-3 py-1.5 font-mono-brand text-xs border rounded-sm transition-colors cursor-pointer ${
                activePreset === preset.key
                  ? 'bg-nv-gold text-nv-black border-nv-gold'
                  : 'bg-transparent text-nv-fog border-nv-smoke hover:border-nv-gold hover:text-nv-gold'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={fadeInUp}
          className="bg-nv-concrete border border-nv-smoke p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                TOTAL REVENUE
              </p>
              <p className="font-anton text-3xl text-nv-white mt-1">
                ${(currentData?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-nv-gold" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-nv-concrete border border-nv-smoke p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                TOTAL ORDERS
              </p>
              <p className="font-anton text-3xl text-nv-white mt-1">
                {(currentData?.totalOrders ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-5 w-5 text-nv-gold" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-nv-concrete border border-nv-smoke p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                AVG ORDER VALUE
              </p>
              <p className="font-anton text-3xl text-nv-white mt-1">
                ${(currentData?.avgOrderValue ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
              <Calculator className="h-5 w-5 text-nv-gold" />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-nv-concrete border border-nv-smoke p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
                UNIQUE CUSTOMERS
              </p>
              <p className="font-anton text-3xl text-nv-white mt-1">
                {(currentData?.customerStats.uniqueCustomers ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-nv-gold" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          variants={fadeInUp}
          className="bg-nv-concrete border border-nv-smoke p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-anton text-lg tracking-wider text-nv-gold">
              REVENUE TREND
            </h3>
            <TrendingUp className="h-4 w-4 text-nv-fog" />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient
                    id="analyticsGoldGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={GOLD}
                  strokeWidth={2}
                  fill="url(#analyticsGoldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Trend */}
        <motion.div
          variants={fadeInUp}
          className="bg-nv-concrete border border-nv-smoke p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-anton text-lg tracking-wider text-nv-gold">
              ORDERS TREND
            </h3>
            <BarChart3 className="h-4 w-4 text-nv-fog" />
          </div>
          <div className="h-[280px]">
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
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="count" fill={GOLD} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-2 bg-nv-concrete border border-nv-smoke"
        >
          <div className="p-5 border-b border-nv-smoke">
            <h3 className="font-anton text-lg tracking-wider text-nv-white">
              TOP PRODUCTS
            </h3>
          </div>
          {(!currentData?.topProducts || currentData.topProducts.length === 0) ? (
            <div className="p-12 text-center">
              <Package className="h-10 w-10 text-nv-fog mx-auto mb-3" />
              <p className="font-mono-brand text-nv-fog text-sm">
                No product sales data for this period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-nv-concrete z-10">
                  <tr className="border-b border-nv-smoke">
                    <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                      #
                    </th>
                    <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                      Product
                    </th>
                    <th className="text-right font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                      Units Sold
                    </th>
                    <th className="text-right font-bebas tracking-wider text-nv-fog text-xs uppercase px-5 py-3">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.topProducts.map((product, index) => (
                    <tr
                      key={index}
                      className="border-b border-nv-smoke/50 hover:bg-nv-smoke/30 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="font-anton text-sm text-nv-fog">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono-brand text-sm text-nv-white">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-mono-brand text-sm text-nv-fog">
                          {product.totalSold}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-mono-brand text-sm text-nv-gold">
                          ${product.revenue.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right side: Status + Customer Stats */}
        <div className="space-y-6">
          {/* Order Status Distribution */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <h3 className="font-anton text-lg tracking-wider text-nv-white mb-4">
              ORDER STATUS
            </h3>
            {(!currentData?.ordersByStatus || currentData.ordersByStatus.length === 0) ? (
              <p className="font-mono-brand text-xs text-nv-fog text-center py-4">
                No orders in this period
              </p>
            ) : (
              <div className="space-y-3">
                {currentData.ordersByStatus.map((status) => {
                  const pct =
                    totalStatusCount > 0
                      ? ((status.count / totalStatusCount) * 100).toFixed(1)
                      : '0'
                  const color = STATUS_COLORS[status.status] ?? FOG
                  return (
                    <div key={status.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-brand text-xs text-nv-white uppercase">
                          {status.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-brand text-xs text-nv-fog">
                            {status.count}
                          </span>
                          <span className="font-mono-brand text-xs text-nv-fog">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-nv-smoke rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Customer Stats */}
          <motion.div
            variants={fadeInUp}
            className="bg-nv-concrete border border-nv-smoke p-5"
          >
            <h3 className="font-anton text-lg tracking-wider text-nv-white mb-4">
              CUSTOMER STATS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-nv-smoke/50 border border-nv-smoke p-4 rounded-sm">
                <p className="font-bebas tracking-wider text-nv-fog text-xs uppercase mb-1">
                  UNIQUE
                </p>
                <p className="font-anton text-2xl text-nv-white">
                  {currentData?.customerStats.uniqueCustomers ?? 0}
                </p>
              </div>
              <div className="bg-nv-smoke/50 border border-nv-smoke p-4 rounded-sm">
                <p className="font-bebas tracking-wider text-nv-fog text-xs uppercase mb-1">
                  RETURNING
                </p>
                <p className="font-anton text-2xl text-nv-gold">
                  {currentData?.customerStats.returningCustomers ?? 0}
                </p>
              </div>
            </div>
            {(currentData?.customerStats.uniqueCustomers ?? 0) > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-brand text-xs text-nv-fog">
                    Retention rate
                  </span>
                  <span className="font-mono-brand text-xs text-nv-gold">
                    {currentData?.customerStats.uniqueCustomers
                      ? (
                          ((currentData.customerStats.returningCustomers /
                            currentData.customerStats.uniqueCustomers) *
                            100)
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-nv-smoke rounded-full">
                  <div
                    className="h-full bg-nv-gold rounded-full transition-all"
                    style={{
                      width: `${currentData?.customerStats.uniqueCustomers
                        ? ((currentData.customerStats.returningCustomers /
                            currentData.customerStats.uniqueCustomers) *
                            100)
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Loading overlay for preset changes */}
      {loading && data && (
        <div className="fixed inset-0 bg-nv-black/30 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-nv-concrete border border-nv-smoke p-4 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-nv-gold border-t-transparent rounded-full animate-spin" />
              <span className="font-mono-brand text-sm text-nv-fog">
                Loading analytics...
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
