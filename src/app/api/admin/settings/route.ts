import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/admin/settings — Update site settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      "storeName",
      "tagline",
      "contactEmail",
      "instagramUrl",
      "twitterUrl",
      "tiktokUrl",
      "freeShippingAmount",
      "announcementActive",
      "announcementText",
      "heroTagline",
      "heroSubheading",
      "manifestoText",
      "pullQuote",
      "metaTitle",
      "metaDescription",
      "googleAnalyticsId",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "freeShippingAmount") {
          updateData[field] = Number(body[field]);
        } else if (field === "announcementActive") {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = String(body[field]);
        }
      }
    }

    // Upsert the singleton settings record
    const settings = await db.siteSettings.upsert({
      where: { id: "singleton" },
      update: updateData,
      create: { id: "singleton", ...updateData },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[PUT /api/admin/settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
