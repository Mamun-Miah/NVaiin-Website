'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  Mail,
  DollarSign,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalSubscribers: number
  totalRevenue: number
}

interface OrderRow {
  id: string
  customerName: string
  email: string
  total: number
  status: string
  createdAt: string
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

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  refunded: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
}

const KPIS = [
  {
    key: 'totalProducts' as const,
    label: 'TOTAL PRODUCTS',
    icon: Package,
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalOrders' as const,
    label: 'TOTAL ORDERS',
    icon: ShoppingCart,
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalSubscribers' as const,
    label: 'SUBSCRIBERS',
    icon: Mail,
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalRevenue' as const,
    label: 'REVENUE',
    icon: DollarSign,
    format: (v: number) => `$${v.toFixed(2)}`,
  },
] as const

function KpiCard({
  label,
  value,
  icon: Icon,
  format,
  index,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  format: (v: number) => string
  index: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-nv-concrete border border-nv-smoke p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bebas tracking-wider text-nv-fog text-sm uppercase">
            {label}
          </p>
          <p className="font-anton text-3xl text-nv-white mt-2">
            {format(value)}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-nv-gold" />
        </div>
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-nv-smoke text-nv-fog border-nv-smoke'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono-brand rounded-sm border ${style}`}
    >
      {status.toUpperCase()}
    </span>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalSubscribers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const [productsRes, ordersRes, subscribersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/newsletter'),
      ])

      const products = await productsRes.json()
      const orders: OrderRow[] = await ordersRes.json()
      const subscribers = await subscribersRes.json()

      const validProducts = Array.isArray(products) ? products : []
      const validOrders = Array.isArray(orders) ? orders : []
      const validSubscribers = Array.isArray(subscribers) ? subscribers : []

      setStats({
        totalProducts: validProducts.length,
        totalOrders: validOrders.length,
        totalSubscribers: validSubscribers.length,
        totalRevenue: validOrders.reduce(
          (sum: number, o: OrderRow) => sum + (Number(o.total) || 0),
          0
        ),
      })

      setRecentOrders(validOrders.slice(0, 8))
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* KPI skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-nv-concrete border border-nv-smoke p-6 animate-pulse"
            >
              <div className="h-3 w-24 bg-nv-smoke rounded-sm mb-4" />
              <div className="h-8 w-20 bg-nv-smoke rounded-sm" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-nv-concrete border border-nv-smoke p-6 animate-pulse">
          <div className="h-5 w-36 bg-nv-smoke rounded-sm mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-nv-smoke rounded-sm mb-2"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi, index) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={stats[kpi.key]}
            icon={kpi.icon}
            format={kpi.format}
            index={index}
          />
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        variants={fadeInUp}
        className="bg-nv-concrete border border-nv-smoke"
      >
        <div className="p-6 border-b border-nv-smoke flex items-center justify-between">
          <h2 className="font-anton text-xl tracking-wider text-nv-white">
            RECENT ORDERS
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 font-mono-brand text-xs text-nv-gold hover:text-nv-white transition-colors"
          >
            VIEW ALL
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-nv-fog mx-auto mb-3" />
            <p className="font-mono-brand text-nv-fog text-sm">
              No orders yet.
            </p>
            <p className="font-mono-brand text-nv-fog/60 text-xs mt-1">
              Orders will appear here once customers make purchases.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nv-smoke">
                  <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3">
                    Order ID
                  </th>
                  <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3 hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3">
                    Total
                  </th>
                  <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3">
                    Status
                  </th>
                  <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3 hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-nv-smoke/50 hover:bg-nv-smoke/30 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono-brand text-sm text-nv-gold hover:text-nv-white transition-colors"
                      >
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 hidden sm:table-cell">
                      <div>
                        <p className="font-mono-brand text-sm text-nv-white">
                          {order.customerName || 'Unknown'}
                        </p>
                        <p className="font-mono-brand text-xs text-nv-fog">
                          {order.email || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono-brand text-sm text-nv-white">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={order.status || 'pending'} />
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
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

      {/* Quick Actions */}
      <motion.div variants={fadeInUp}>
        <h2 className="font-anton text-xl tracking-wider text-nv-white mb-4">
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/products/new">
            <div className="bg-nv-smoke border border-nv-smoke p-4 flex items-center gap-4 hover:border-nv-gold transition-colors duration-200 cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
                <Plus className="h-5 w-5 text-nv-gold" />
              </div>
              <div>
                <p className="font-bebas tracking-wider text-nv-white text-sm group-hover:text-nv-gold transition-colors">
                  ADD PRODUCT
                </p>
                <p className="font-mono-brand text-xs text-nv-fog">
                  Create a new product listing
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="bg-nv-smoke border border-nv-smoke p-4 flex items-center gap-4 hover:border-nv-gold transition-colors duration-200 cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-5 w-5 text-nv-gold" />
              </div>
              <div>
                <p className="font-bebas tracking-wider text-nv-white text-sm group-hover:text-nv-gold transition-colors">
                  VIEW ALL ORDERS
                </p>
                <p className="font-mono-brand text-xs text-nv-fog">
                  Manage and track orders
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/newsletter">
            <div className="bg-nv-smoke border border-nv-smoke p-4 flex items-center gap-4 hover:border-nv-gold transition-colors duration-200 cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-nv-gold/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-nv-gold" />
              </div>
              <div>
                <p className="font-bebas tracking-wider text-nv-white text-sm group-hover:text-nv-gold transition-colors">
                  SEND NEWSLETTER
                </p>
                <p className="font-mono-brand text-xs text-nv-fog">
                  Compose and send to subscribers
                </p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
