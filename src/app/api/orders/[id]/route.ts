import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to safely parse JSON fields
function parseJsonField<T>(field: string, fallback: T): T {
  try {
    return JSON.parse(field) as T;
  } catch {
    return fallback;
  }
}

// GET /api/orders/[id] — Return single order with items
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
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

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const parsed = {
      ...order,
      address: parseJsonField<Record<string, string>>(order.address, {}),
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: parseJsonField<string[]>(item.product.images, []),
            }
          : null,
      })),
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[GET /api/orders/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] — Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
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

    const parsed = {
      ...order,
      address: parseJsonField<Record<string, string>>(order.address, {}),
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: parseJsonField<string[]>(item.product.images, []),
            }
          : null,
      })),
    };

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("[PUT /api/orders/[id]] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
