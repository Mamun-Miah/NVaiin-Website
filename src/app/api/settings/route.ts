import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/settings — Return site settings (singleton record)
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    // If no settings record exists yet, create default
    if (!settings) {
      settings = await db.siteSettings.create({
        data: { id: "singleton" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[GET /api/settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}
