// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser({ withFullUser: true });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with stats
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            createdQuizzes: {
              where: { status: "PUBLISHED" },
            },
            quizAttempts: {
              where: { status: "COMPLETED" },
            },
            quizLikes: true,
            savedQuizzes: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calculate total score from completed attempts
    const totalScoreResult = await prisma.quizAttempt.aggregate({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      _sum: {
        score: true,
      },
      _avg: {
        score: true,
      },
    });

    // Get recent quiz attempts
    const recentQuizzes = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        score: true,
        completedAt: true,
        startedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            category: {
              select: {
                name: true,
              },
            },
            questions: {
              select: {
                points: true,
              },
            },
          },
        },
      },
    });

    // Get user's created quizzes
    const createdQuizzes = await prisma.quiz.findMany({
      where: {
        creatorId: user.id,
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        takesCount: true,
        likesCount: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalQuizzesCreated: profile._count.createdQuizzes,
      totalQuizzesTaken: profile._count.quizAttempts,
      totalQuizLikes: profile._count.quizLikes,
      totalSavedQuizzes: profile._count.savedQuizzes,
      totalScore: totalScoreResult._sum.score || 0,
      averageScore: totalScoreResult._avg.score || 0,
    };

    // Format recent quizzes
    const formattedRecentQuizzes = recentQuizzes.map((attempt) => {
      const maxScore = attempt.quiz.questions.reduce(
        (sum, q) => sum + q.points,
        0
      );
      const duration =
        attempt.completedAt && attempt.startedAt
          ? Math.floor(
              (new Date(attempt.completedAt).getTime() -
                new Date(attempt.startedAt).getTime()) /
                1000
            )
          : 0;

      return {
        id: attempt.id,
        title: attempt.quiz.title,
        category: attempt.quiz.category?.name || "Uncategorized",
        difficulty: attempt.quiz.difficulty,
        score: attempt.score,
        maxScore,
        duration,
        completedAt: attempt.completedAt,
      };
    });

    const profileData = {
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        joinDate: profile.createdAt,
      },
      stats,
      recentQuizzes: formattedRecentQuizzes,
      createdQuizzes: createdQuizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        category: quiz.category?.name || "Uncategorized",
        questionsCount: quiz._count.questions,
        takesCount: quiz.takesCount,
        likesCount: quiz.likesCount,
        createdAt: quiz.createdAt,
      })),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
