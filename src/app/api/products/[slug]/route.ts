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

// GET /api/products/[slug] — Return single product by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const parsed = {
      ...product,
      images: parseJsonField<string[]>(product.images, []),
      sizes: parseJsonField<string[]>(product.sizes, []),
      tags: parseJsonField<string[]>(product.tags, []),
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(`[GET /api/products/[slug]] Error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
