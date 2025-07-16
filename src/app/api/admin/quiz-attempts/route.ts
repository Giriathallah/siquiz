import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  authorize,
  AuthError,
} from "@/lib/auth/permissions/serverSidePermission";

export const dynamic = "force-dynamic"; // Memastikan route ini tidak di-cache statis

export async function GET(request: Request) {
  try {
    // 1. Otorisasi: Pastikan hanya admin yang bisa mengakses
    const user = await getCurrentUser();
    authorize(user, "quiz_attempt:read:any");

    // 2. Ambil query params dari URL
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") ?? "startedAt";
    const order = (searchParams.get("order") as "asc" | "desc") ?? "desc";

    const orderBy: Prisma.QuizAttemptOrderByWithRelationInput = {};

    // 3. Mapping sort key ke object orderBy Prisma
    switch (sort) {
      case "user":
        orderBy.user = { name: order };
        break;
      case "quiz":
        orderBy.quiz = { title: order };
        break;
      case "score":
        orderBy.score = order;
        break;
      case "status":
        orderBy.status = order;
        break;
      case "completedAt":
        orderBy.completedAt = { sort: order, nulls: "last" };
        break;
      default:
        orderBy.startedAt = order;
    }

    // 4. Query database
    const attempts = await prisma.quizAttempt.findMany({
      include: {
        user: { select: { name: true, email: true } },
        quiz: { select: { title: true } },
      },
      orderBy,
    });

    // 5. Kembalikan response sebagai JSON
    return NextResponse.json(attempts);
  } catch (error) {
    if (error instanceof AuthError) {
      return new NextResponse(error.message, { status: error.statusCode });
    }

    // Fallback untuk error lainnya
    console.error("[ATTEMPTS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
