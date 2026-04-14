import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/orders — Return all orders ordered by createdAt desc
export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true, images: true },
            },
          },
        },
      },
    });

    const parsed = orders.map((order) => ({
      ...order,
      address: (() => {
        try { return JSON.parse(order.address) as Record<string, string>; }
        catch { return {}; }
      })(),
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: (() => {
                try { return JSON.parse(item.product.images) as string[]; }
                catch { return []; }
              })(),
            }
          : null,
      })),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, email, items } = body;

    if (!customerName || !email || !items || !items.length) {
      return NextResponse.json(
        { error: "Customer name, email, and items are required." },
        { status: 400 }
      );
    }

    const total = items.reduce((sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty, 0);

    const order = await db.order.create({
      data: {
        customerName,
        email,
        total,
        items: {
          create: items.map((item: { productId: string; name: string; size: string; qty: number; price: number }) => ({
            productId: item.productId,
            size: item.size,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json(
      { success: true, orderId: order.id, message: "Order placed successfully." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to place order." },
      { status: 500 }
    );
  }
}
