import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/admin/faqs — Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category, displayOrder } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const faq = await db.faq.create({
      data: {
        question,
        answer,
        category: category ?? "General",
        displayOrder: Number(displayOrder) || 0,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/faqs] Error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/faqs — Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "FAQ id is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (fields.question !== undefined) updateData.question = fields.question;
    if (fields.answer !== undefined) updateData.answer = fields.answer;
    if (fields.category !== undefined) updateData.category = fields.category;
    if (fields.displayOrder !== undefined)
      updateData.displayOrder = Number(fields.displayOrder);

    const faq = await db.faq.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(faq);
  } catch (error: unknown) {
    console.error("[PUT /api/admin/faqs] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/faqs — Delete FAQ by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "FAQ id is required (query param)" },
        { status: 400 }
      );
    }

    await db.faq.delete({
      where: { id },
    });

    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/faqs] Error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
