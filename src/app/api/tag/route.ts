import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth/session";
import {
  AuthError,
  authorize,
} from "@/lib/auth/permissions/serverSidePermission";
import { TagSchema } from "@/lib/schemas";

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "tag:read");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: { contains: search }, // Cukup gunakan 'contains'
        }
      : {};

    const validSortBy = ["name", "id", "createdAt", "updatedAt"]; // Tambahkan bidang yang bisa di-sort
    const validSortOrder = ["asc", "desc"];

    const orderBy: Record<string, "asc" | "desc"> = {};

    if (sortBy && validSortBy.includes(sortBy)) {
      orderBy[sortBy] = (
        sortOrder && validSortOrder.includes(sortOrder) ? sortOrder : "asc"
      ) as "asc" | "desc";
    } else {
      orderBy.name = "asc"; // Default sort
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { quizzes: true },
          },
        },
        orderBy,
      }),
      prisma.tag.count({ where }),
    ]);

    return NextResponse.json({
      data: tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "tag:create");

    const body = await request.json();
    const validatedData = TagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: validatedData,
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating tag:", error);
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
    return NextResponse.json(
      {
        error:
          (error as { message?: string }).message || "Failed to create tag",
      },
      { status: (error as { statusCode?: number }).statusCode || 500 }
    );
  }
}
