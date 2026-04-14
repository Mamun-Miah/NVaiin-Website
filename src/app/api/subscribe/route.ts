import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/subscribe — Add email to subscribers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate
    const existing = await db.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You are already subscribed!", email: normalizedEmail },
        { status: 200 }
      );
    }

    await db.subscriber.create({
      data: { email: normalizedEmail },
    });

    return NextResponse.json(
      { message: "Successfully subscribed!", email: normalizedEmail },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/subscribe] Error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
