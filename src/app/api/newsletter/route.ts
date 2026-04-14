import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/newsletter — Return all subscribers
export async function GET() {
  try {
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("[GET /api/newsletter] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

// POST /api/newsletter — Send newsletter (log + return success)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, body: newsletterBody } = body;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (
      !newsletterBody ||
      typeof newsletterBody !== "string" ||
      newsletterBody.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Newsletter body is required" },
        { status: 400 }
      );
    }

    // Count subscribers to log the sent count
    const subscriberCount = await db.subscriber.count();

    // Create a newsletter log entry
    const log = await db.newsletterLog.create({
      data: {
        subject: subject.trim(),
        body: newsletterBody.trim(),
        sentCount: subscriberCount,
      },
    });

    // In production, this is where you would send via Resend/email service
    console.log(
      `[Newsletter Sent] Subject: "${subject.trim()}" to ${subscriberCount} subscribers`
    );

    return NextResponse.json(
      {
        message: `Newsletter sent to ${subscriberCount} subscribers`,
        log,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/newsletter] Error:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
