import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth/session";
import {
  AuthError,
  authorize,
} from "@/lib/auth/permissions/serverSidePermission";
import { TagSchema } from "@/lib/schemas"; // Pastikan TagSchema diimpor dengan benar

const updateTagSchema = TagSchema.partial();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "tag:read");

    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error: unknown) {
    // Menggunakan unknown untuk penanganan error yang lebih aman
    console.error("Error fetching tag:", error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "tag:update");

    const body = await request.json();
    const validatedData = updateTagSchema.parse(body);

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    });

    return NextResponse.json(tag);
  } catch (error: unknown) {
    // Menggunakan unknown
    console.error("Error updating tag:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 409 }
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    if (error instanceof AuthError) {
      // Perbaikan penanganan AuthError
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "tag:delete");

    await prisma.tag.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error: unknown) {
    // Menggunakan unknown
    console.error("Error deleting tag:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    if (error instanceof AuthError) {
      // Perbaikan penanganan AuthError
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
