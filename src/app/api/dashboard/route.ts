import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser(); // Mendeteksi pengguna yang login

    let recentAttemptsData = null;

    // --- 1. JIKA USER LOGIN: Ambil riwayat pengerjaan terakhir ---
    if (user) {
      const recentAttempts = await prisma.quizAttempt.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: "desc" },
        distinct: ["quizId"], // Hanya ambil pengerjaan unik per kuis
        take: 4,
        select: {
          id: true,
          status: true,
          score: true,
          quiz: {
            select: {
              id: true,
              title: true,
              duration: true,
              difficulty: true,
              _count: { select: { questions: true } }, // Total soal di kuis
            },
          },
          _count: {
            select: { answers: true }, // Soal yang sudah dijawab di attempt ini
          },
        },
      });

      // Format data dan hitung progress
      recentAttemptsData = recentAttempts.map((attempt) => {
        const totalQuestions = attempt.quiz._count.questions;
        const answeredQuestions = attempt._count.answers;
        const progress =
          totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

        return {
          attemptId: attempt.id,
          quizId: attempt.quiz.id,
          title: attempt.quiz.title,
          duration: attempt.quiz.duration,
          difficulty: attempt.quiz.difficulty,
          questions: totalQuestions,
          status: attempt.status,
          score: attempt.score,
          progress: Math.round(progress),
        };
      });
    }

    // --- 2. AMBIL SEMUA DATA UMUM (platform-wide) ---
    const popularQuizzesRaw: any[] = await prisma.$queryRaw`
      SELECT
        q.id, q.title, q.duration, q.difficulty, q.likesCount, c.name as categoryName,
        (SELECT COUNT(*) FROM \`Question\` WHERE \`quizId\` = q.id) as questionsCount,
        (SELECT COUNT(DISTINCT \`userId\`) FROM \`QuizAttempt\` WHERE \`quizId\` = q.id) as uniqueParticipants
      FROM \`Quiz\` AS q
      LEFT JOIN \`Category\` AS c ON q.categoryId = c.id
      WHERE q.status = 'PUBLISHED'
      ORDER BY uniqueParticipants DESC
      LIMIT 6
    `;

    // const [
    //   totalQuizzes,
    //   totalUsers,
    //   totalAttempts,
    //   categories,
    //   newestQuizzes,
    //   popularCategories, // [BARU]
    //   popularTags, // [BARU]
    // ] = await prisma.$transaction(
    //   [
    //     prisma.quiz.count({ where: { status: "PUBLISHED" } }),
    //     prisma.user.count(),
    //     prisma.quizAttempt.count(),
    //     prisma.category.findMany({
    //       select: { id: true, name: true },
    //       orderBy: { name: "asc" },
    //     }),
    //     prisma.quiz.findMany({
    //       where: { status: "PUBLISHED" },
    //       orderBy: { createdAt: "desc" },
    //       take: 4,
    //       select: {
    //         id: true,
    //         title: true,
    //         duration: true,
    //         difficulty: true,
    //         _count: { select: { questions: true } },
    //       },
    //     }),
    //     // Query untuk Kategori Populer
    //     prisma.category.findMany({
    //       select: {
    //         id: true,
    //         name: true,
    //         _count: { select: { quizzes: true } },
    //       },
    //       orderBy: { quizzes: { _count: "desc" } },
    //       take: 5,
    //     }),
    //     // Query untuk Tag Populer
    //     prisma.tag.findMany({
    //       select: {
    //         id: true,
    //         name: true,
    //         _count: { select: { quizzes: true } },
    //       },
    //       orderBy: { quizzes: { _count: "desc" } },
    //       take: 7,
    //     }),
    //   ],
    //   {
    //     timeout: 15000, // Beri waktu 15 detik
    //   }
    // );

    // --- 3. FORMAT DAN GABUNGKAN SEMUA DATA UNTUK RESPONSE ---

    const [
      totalQuizzes,
      totalUsers,
      totalAttempts,
      categories,
      newestQuizzes,
      popularCategories,
      popularTags,
    ] = await prisma.$transaction(
      async (tx) => {
        // 1. Kumpulkan semua query di dalam sebuah array, gunakan 'tx' bukan 'prisma'
        const allQueries = [
          tx.quiz.count({ where: { status: "PUBLISHED" } }),
          tx.user.count(),
          tx.quizAttempt.count(),
          tx.category.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          }),
          tx.quiz.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "desc" },
            take: 4,
            select: {
              id: true,
              title: true,
              duration: true,
              difficulty: true,
              _count: { select: { questions: true } },
            },
          }),
          tx.category.findMany({
            select: {
              id: true,
              name: true,
              _count: { select: { quizzes: true } },
            },
            orderBy: { quizzes: { _count: "desc" } },
            take: 5,
          }),
          tx.tag.findMany({
            select: {
              id: true,
              name: true,
              _count: { select: { quizzes: true } },
            },
            orderBy: { quizzes: { _count: "desc" } },
            take: 7,
          }),
        ];

        // 2. Jalankan semuanya secara paralel dengan Promise.all
        return await Promise.all(allQueries);
      },
      {
        timeout: 15000, // Opsi timeout sekarang valid
      }
    );

    const formattedPopularQuizzes = popularQuizzesRaw.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      duration: quiz.duration,
      difficulty: quiz.difficulty,
      category: quiz.categoryName || "Lainnya",
      questions: Number(quiz.questionsCount),
      participants: Number(quiz.uniqueParticipants),
      rating: quiz.likesCount,
    }));

    const formattedNewestQuizzes = newestQuizzes.map((quiz) => ({
      ...quiz,
      questions: quiz._count.questions,
    }));

    return NextResponse.json({
      // Data Statistik Umum
      statistics: { totalQuizzes, totalUsers, totalAttempts },
      categories,
      popularQuizzes: formattedPopularQuizzes,
      // Data Aktivitas: personal jika login, umum jika tidak
      recentActivity: recentAttemptsData ?? formattedNewestQuizzes,
      isUserActivity: !!recentAttemptsData, // Flag untuk frontend
      // Data Populer untuk Sidebar
      popularContent: {
        categories: popularCategories.map((c) => ({
          ...c,
          count: c._count.quizzes,
        })),
        tags: popularTags.map((t) => ({ ...t, count: t._count.quizzes })),
      },
    });
  } catch (error) {
    console.error("[HOME_STATS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
