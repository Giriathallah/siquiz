import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser({ redirectIfNotFound: true });

    // This authorization check is correct.
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalQuizzes,
      totalUsers,
      totalAttempts,
      completedAttempts, // Get completed attempts count separately
      totalCategories,
      totalTags,
      activeQuizzes,
      avgScoreData,
    ] = await Promise.all([
      prisma.quiz.count(),
      prisma.user.count(),
      prisma.quizAttempt.count(), // This gets the total attempts
      prisma.quizAttempt.count({ where: { status: "COMPLETED" } }), // This gets only completed ones
      prisma.category.count(),
      prisma.tag.count(),
      prisma.quiz.count({ where: { status: "PUBLISHED" } }),
      prisma.quizAttempt.aggregate({
        _avg: { score: true },
        where: { status: "COMPLETED" },
      }),
    ]);

    // Calculate completion rate manually
    const avgCompletionRate =
      totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;

    const stats = {
      totalQuizzes,
      totalUsers,
      totalAttempts,
      totalCategories,
      totalTags,
      activeQuizzes,
      avgScore: Math.round(avgScoreData._avg.score || 0),
      // Use the new, correctly calculated value
      avgCompletionRate: Math.round(avgCompletionRate),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
