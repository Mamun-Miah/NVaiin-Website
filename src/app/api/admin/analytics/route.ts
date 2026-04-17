import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/admin/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const now = new Date()
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
    const defaultTo = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const fromDate = fromParam ? new Date(fromParam + "T00:00:00") : defaultFrom
    const toDate = toParam ? new Date(toParam + "T23:59:59") : defaultTo

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      )
    }

    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lt: toDate,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
      },
    })

    // Basic stats
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

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

    // Daily orders
    const dayMap = new Map<string, { count: number; revenue: number }>()
    // Initialize all days in the range
    const current = new Date(fromDate)
    while (current < toDate) {
      const key = current.toISOString().split("T")[0]
      dayMap.set(key, { count: 0, revenue: 0 })
      current.setDate(current.getDate() + 1)
    }
    for (const order of orders) {
      const key = order.createdAt.toISOString().split("T")[0]
      const existing = dayMap.get(key)
      if (existing) {
        existing.count += 1
        existing.revenue += Number(order.total)
      }
    }
    const dailyOrders = Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
    }))

    // Top products
    const productMap = new Map<string, { name: string; totalSold: number; revenue: number }>()
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId
        const existing = productMap.get(key)
        const itemRevenue = item.qty * Number(item.price)
        const name = item.product?.name ?? "Unknown"
        if (existing) {
          existing.totalSold += item.qty
          existing.revenue += itemRevenue
        } else {
          productMap.set(key, { name, totalSold: item.qty, revenue: itemRevenue })
        }
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)

    // Customer stats
    const emailSet = new Set<string>()
    const emailCountMap = new Map<string, number>()
    for (const order of orders) {
      const email = order.email?.toLowerCase().trim()
      if (email) {
        emailSet.add(email)
        emailCountMap.set(email, (emailCountMap.get(email) ?? 0) + 1)
      }
    }
    const uniqueCustomers = emailSet.size
    const returningCustomers = Array.from(emailCountMap.values()).filter((count) => count > 1).length

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        email: o.email,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
      totalRevenue,
      totalOrders,
      avgOrderValue,
      ordersByStatus,
      dailyOrders,
      topProducts,
      customerStats: {
        uniqueCustomers,
        returningCustomers,
      },
    })
  } catch (error) {
    console.error("[GET /api/admin/analytics] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}
