import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/lookbook — Return visible lookbook images ordered by displayOrder
export async function GET() {
  try {
    const images = await db.lookbookImage.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("[GET /api/lookbook] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lookbook images" },
      { status: 500 }
    );
  }
}
