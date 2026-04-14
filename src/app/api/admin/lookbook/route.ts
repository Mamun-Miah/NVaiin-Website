import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/lookbook — List ALL lookbook images (including hidden)
export async function GET() {
  try {
    const images = await db.lookbookImage.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("[GET /api/admin/lookbook] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lookbook images" },
      { status: 500 }
    );
  }
}

// POST /api/admin/lookbook — Create lookbook image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, title, seasonLabel, displayOrder, isVisible } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const image = await db.lookbookImage.create({
      data: {
        imageUrl,
        title: title ?? "",
        seasonLabel: seasonLabel ?? "",
        displayOrder: Number(displayOrder) || 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/lookbook] Error:", error);
    return NextResponse.json(
      { error: "Failed to create lookbook image" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/lookbook — Update lookbook image
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Lookbook image id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (fields.imageUrl !== undefined) updateData.imageUrl = fields.imageUrl;
    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.seasonLabel !== undefined) updateData.seasonLabel = fields.seasonLabel;
    if (fields.displayOrder !== undefined)
      updateData.displayOrder = Number(fields.displayOrder);
    if (fields.isVisible !== undefined) updateData.isVisible = Boolean(fields.isVisible);

    const image = await db.lookbookImage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(image);
  } catch (error: unknown) {
    console.error("[PUT /api/admin/lookbook] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Lookbook image not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update lookbook image" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/lookbook — Delete lookbook image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Lookbook image id is required (query param)" },
        { status: 400 }
      );
    }

    await db.lookbookImage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Lookbook image deleted successfully" });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/lookbook] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Lookbook image not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete lookbook image" },
      { status: 500 }
    );
  }
}
