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

// GET /api/products — Return all products ordered by displayOrder
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { displayOrder: "asc" },
    });

    const parsed = products.map((p) => ({
      ...p,
      images: parseJsonField<string[]>(p.images, []),
      sizes: parseJsonField<string[]>(p.sizes, []),
      tags: parseJsonField<string[]>(p.tags, []),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products — Create a new product (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      images,
      sizes,
      category,
      tags,
      isLimited,
      isFeatured,
      inStock,
      stockQty,
      displayOrder,
    } = body;

    if (!name || !slug || price === undefined) {
      return NextResponse.json(
        { error: "name, slug, and price are required" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description ?? "",
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        images: JSON.stringify(images ?? []),
        sizes: JSON.stringify(sizes ?? []),
        category: category ?? "t-shirts",
        tags: JSON.stringify(tags ?? []),
        isLimited: Boolean(isLimited),
        isFeatured: Boolean(isFeatured),
        inStock: Boolean(inStock),
        stockQty: Number(stockQty) || 0,
        displayOrder: Number(displayOrder) || 0,
      },
    });

    const parsed = {
      ...product,
      images: parseJsonField<string[]>(product.images, []),
      sizes: parseJsonField<string[]>(product.sizes, []),
      tags: parseJsonField<string[]>(product.tags, []),
    };

    return NextResponse.json(parsed, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/products] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
