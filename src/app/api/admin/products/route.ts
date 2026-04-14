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

// PUT /api/admin/products — Update a product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    // Build update data, stringifying array fields
    const updateData: Record<string, unknown> = {};

    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.slug !== undefined) updateData.slug = fields.slug;
    if (fields.description !== undefined) updateData.description = fields.description;
    if (fields.price !== undefined) updateData.price = Number(fields.price);
    if (fields.compareAtPrice !== undefined)
      updateData.compareAtPrice = fields.compareAtPrice ? Number(fields.compareAtPrice) : null;
    if (fields.images !== undefined) updateData.images = JSON.stringify(fields.images);
    if (fields.sizes !== undefined) updateData.sizes = JSON.stringify(fields.sizes);
    if (fields.category !== undefined) updateData.category = fields.category;
    if (fields.tags !== undefined) updateData.tags = JSON.stringify(fields.tags);
    if (fields.isLimited !== undefined) updateData.isLimited = Boolean(fields.isLimited);
    if (fields.isFeatured !== undefined) updateData.isFeatured = Boolean(fields.isFeatured);
    if (fields.inStock !== undefined) updateData.inStock = Boolean(fields.inStock);
    if (fields.stockQty !== undefined) updateData.stockQty = Number(fields.stockQty);
    if (fields.displayOrder !== undefined) updateData.displayOrder = Number(fields.displayOrder);

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    const parsed = {
      ...product,
      images: parseJsonField<string[]>(product.images, []),
      sizes: parseJsonField<string[]>(product.sizes, []),
      tags: parseJsonField<string[]>(product.tags, []),
    };

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("[PUT /api/admin/products] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
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
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products — Delete a product by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required (query param)" },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/products] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
