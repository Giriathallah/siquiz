import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser({ withFullUser: true });

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // [OPTIMASI] Jalankan semua query database secara paralel
    const [
      profile,
      scoreStats,
      recentAttempts,
      createdQuizzes,
      savedQuizzesRaw,
      likedQuizzesRaw,
    ] = await Promise.all([
      // 1. Ambil data profil dasar dan jumlah relasi
      prisma.user.findUnique({
        where: { id: sessionUser.id },
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
              createdQuizzes: { where: { status: "PUBLISHED" } },
              quizAttempts: { where: { status: "COMPLETED" } },
              quizLikes: true,
              savedQuizzes: true,
            },
          },
        },
      }),
      // 2. Hitung agregat skor
      prisma.quizAttempt.aggregate({
        where: { userId: sessionUser.id, status: "COMPLETED" },
        _sum: { score: true },
        _avg: { score: true },
      }),
      // 3. Ambil riwayat kuis terbaru
      prisma.quizAttempt.findMany({
        where: { userId: sessionUser.id, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
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
              category: { select: { name: true } },
              questions: { select: { points: true } },
            },
          },
        },
      }),
      // 4. Ambil kuis yang dibuat pengguna
      prisma.quiz.findMany({
        where: { creatorId: sessionUser.id },
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, name: true, avatarUrl: true } },
          category: true,
          tags: true,
          _count: { select: { attempts: true, likes: true, questions: true } },
        },
      }),
      // 5. Ambil kuis yang disimpan pengguna
      prisma.savedQuiz.findMany({
        where: { userId: sessionUser.id },
        orderBy: { savedAt: "desc" },
        include: {
          quiz: {
            include: {
              creator: { select: { id: true, name: true, avatarUrl: true } },
              category: true,
              tags: true,
              _count: {
                select: { attempts: true, likes: true, questions: true },
              },
            },
          },
        },
      }),
      // 6. Ambil kuis yang disukai pengguna
      prisma.quizLike.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: "desc" },
        include: {
          quiz: {
            include: {
              creator: { select: { id: true, name: true, avatarUrl: true } },
              category: true,
              tags: true,
              _count: {
                select: { attempts: true, likes: true, questions: true },
              },
            },
          },
        },
      }),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // [FORMATTING] Siapkan data untuk dikirim ke frontend
    const likedQuizIds = new Set(likedQuizzesRaw.map((l) => l.quizId));
    const savedQuizIds = new Set(savedQuizzesRaw.map((s) => s.quizId));

    const formatQuizList = (
      items: any[],
      type: "created" | "saved" | "liked"
    ) => {
      return items.map((item) => {
        const quiz = type === "created" ? item : item.quiz;
        return {
          ...quiz,
          isLiked: likedQuizIds.has(quiz.id),
          isSaved: savedQuizIds.has(quiz.id),
          _count: {
            ...quiz._count,
            participants: quiz._count.attempts,
          },
        };
      });
    };

    const stats = {
      totalQuizzesCreated: profile._count.createdQuizzes,
      totalQuizzesTaken: profile._count.quizAttempts,
      totalQuizLikes: profile._count.quizLikes,
      totalSavedQuizzes: profile._count.savedQuizzes,
      totalScore: scoreStats._sum.score || 0,
      averageScore: scoreStats._avg.score || 0,
    };

    const formattedRecentQuizzes = recentAttempts.map((attempt) => {
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
      createdQuizzes: formatQuizList(createdQuizzes, "created"),
      savedQuizzes: formatQuizList(savedQuizzesRaw, "saved"),
      likedQuizzes: formatQuizList(likedQuizzesRaw, "liked"),
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
