import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/faqs — Return all FAQs ordered by displayOrder
export async function GET() {
  try {
    const faqs = await db.faq.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("[GET /api/faqs] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
