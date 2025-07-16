import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser({ redirectIfNotFound: true });

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const recentQuizzes = await prisma.quiz.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        difficulty: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    // Hitung average score untuk setiap quiz
    const quizzesWithStats = await Promise.all(
      recentQuizzes.map(async (quiz) => {
        const avgScore = await prisma.quizAttempt.aggregate({
          _avg: { score: true },
          where: {
            quizId: quiz.id,
            status: "COMPLETED",
          },
        });

        return {
          id: quiz.id,
          title: quiz.title,
          category: quiz.category?.name || "Uncategorized",
          difficulty: quiz.difficulty,
          attempts: quiz._count.attempts,
          avgScore: Math.round(avgScore._avg.score || 0),
          status: quiz.status,
          updatedAt: quiz.updatedAt.toISOString(),
        };
      })
    );

    return NextResponse.json(quizzesWithStats);
  } catch (error) {
    console.error("[ADMIN_RECENT_QUIZZES_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
