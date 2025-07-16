// app/api/my-quizzes/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  authorize,
  AuthError,
} from "@/lib/auth/permissions/serverSidePermission";
import { QuizStatus } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(req: Request) {
  try {
    // 1. Otorisasi: Memastikan hanya pengguna yang login yang bisa mengakses
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to create a quiz." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // 2. Membangun klausa 'where' untuk query Prisma
    const whereClause: Prisma.QuizWhereInput = {
      creatorId: user.id, // Hanya mengambil kuis milik pengguna ini
    };

    // Menambahkan filter status jika ada di query parameter
    if (status && Object.values(QuizStatus).includes(status as QuizStatus)) {
      whereClause.status = status as QuizStatus;
    }

    // 3. Mengambil data kuis dari database
    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        difficulty: true,
        isAiGenerated: true,
        duration: true,
        likesCount: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          // Menghitung jumlah soal
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Urutkan berdasarkan yang terakhir diupdate
      },
    });

    // --- Menghitung Peserta Unik ---
    const quizIds = quizzes.map((quiz) => quiz.id);
    let participantCounts: Record<string, number> = {};

    if (quizIds.length > 0) {
      // 4. Ambil semua percobaan kuis (attempt) yang unik berdasarkan userId dan quizId
      const distinctAttempts = await prisma.quizAttempt.findMany({
        where: {
          quizId: {
            in: quizIds,
          },
        },
        select: {
          quizId: true,
          userId: true,
        },
        distinct: ["quizId", "userId"],
      });

      // 5. Proses hasil untuk menghitung jumlah peserta unik per kuis
      participantCounts = distinctAttempts.reduce((acc, attempt) => {
        acc[attempt.quizId] = (acc[attempt.quizId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
    // ------------------------------------

    // 6. Memformat data akhir sesuai kebutuhan frontend
    const finalData = quizzes.map((quiz) => ({
      ...quiz,
      questionsCount: quiz._count.questions, // Meratakan nama properti
      takesCount: participantCounts[quiz.id] || 0, // Menggunakan hasil hitungan unik
      categoryName: quiz.category?.name || "Uncategorized",
    }));

    return NextResponse.json({ data: finalData });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    // Tangani error lainnya
    console.error("[MY_QUIZZES_GET]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
