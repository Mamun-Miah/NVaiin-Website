import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/admin/dashboard
export async function GET() {
  try {
    const [products, orders, subscribers] = await Promise.all([
      db.product.findMany({ orderBy: { displayOrder: "asc" } }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { select: { name: true, slug: true, category: true } },
            },
          },
        },
      }),
      db.subscriber.count(),
    ])

    // Total Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)

    // Recent orders (last 10)
    const recentOrders = orders.slice(0, 10).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      email: o.email,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }))

    // Top products by revenue (aggregate from order items)
    const productMap = new Map<string, { name: string; slug: string; totalSold: number; revenue: number }>()
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId
        const existing = productMap.get(key)
        const itemRevenue = item.qty * Number(item.price)
        const name = item.product?.name ?? "Unknown"
        const slug = item.product?.slug ?? ""
        if (existing) {
          existing.totalSold += item.qty
          existing.revenue += itemRevenue
        } else {
          productMap.set(key, { name, slug, totalSold: item.qty, revenue: itemRevenue })
        }
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Orders by status
    const statusMap = new Map<string, number>()
    for (const order of orders) {
      const status = order.status || "pending"
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1)
    }
    const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }))

    // Orders by day (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
    const dayMap = new Map<string, { count: number; revenue: number }>()
    // Initialize all days
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split("T")[0]
      dayMap.set(key, { count: 0, revenue: 0 })
    }
    for (const order of orders) {
      if (order.createdAt >= thirtyDaysAgo) {
        const key = order.createdAt.toISOString().split("T")[0]
        const existing = dayMap.get(key)
        if (existing) {
          existing.count += 1
          existing.revenue += Number(order.total)
        }
      }
    }
    const ordersByDay = Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
    }))

    // Revenue by month (last 12 months)
    const monthMap = new Map<string, number>()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" })
      monthMap.set(key, 0)
    }
    for (const order of orders) {
      const key = order.createdAt.toLocaleString("en-US", { month: "short", year: "2-digit" })
      const existing = monthMap.get(key)
      if (existing !== undefined) {
        monthMap.set(key, existing + Number(order.total))
      }
    }
    const revenueByMonth = Array.from(monthMap.entries()).map(([month, revenue]) => ({
      month,
      revenue,
    }))

    // Category distribution
    const catMap = new Map<string, number>()
    for (const p of products) {
      const cat = p.category || "Other"
      catMap.set(cat, (catMap.get(cat) ?? 0) + 1)
    }
    const categoryDistribution = Array.from(catMap.entries()).map(([category, count]) => ({
      category,
      count,
    }))

    // Low stock products (stockQty <= 5 and inStock)
    const lowStockProducts = products
      .filter((p) => p.inStock && p.stockQty <= 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        stockQty: p.stockQty,
        inStock: p.inStock,
      }))

    return NextResponse.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalSubscribers: subscribers,
      totalRevenue,
      recentOrders,
      topProducts,
      ordersByStatus,
      ordersByDay,
      revenueByMonth,
      categoryDistribution,
      lowStockProducts,
    })
  } catch (error) {
    console.error("[GET /api/admin/dashboard] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
