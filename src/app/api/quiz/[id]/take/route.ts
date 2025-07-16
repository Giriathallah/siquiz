import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser"; // Asumsi Anda punya ini

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = await params.id;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        status: "PUBLISHED",
      },
      include: {
        category: { select: { name: true } },
        tags: { select: { name: true } },
        _count: { select: { questions: true } },
        questions: {
          orderBy: { createdAt: "asc" }, // Pastikan urutan soal konsisten
          select: {
            id: true,
            questionText: true,
            questionType: true,
            points: true,
            options: {
              // SECURITY: Hanya pilih field yang aman dikirim ke client
              select: {
                id: true,
                optionText: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or not published" },
        { status: 404 }
      );
    }

    const inProgressAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId: quizId,
        userId: user.id,
        status: "IN_PROGRESS",
      },
      include: {
        answers: {
          // Ambil semua jawaban yang sudah tersimpan
          select: {
            questionId: true,
            selectedOptionId: true,
            shortAnswer: true,
          },
        },
      },
    });
    const responseData = {
      ...quiz,
      // Kirim jawaban yang sudah ada ke frontend
      inProgressAttempt: inProgressAttempt
        ? {
            attemptId: inProgressAttempt.id,
            startedAt: inProgressAttempt.startedAt,
            savedAnswers: inProgressAttempt.answers.reduce((acc, ans) => {
              acc[ans.questionId] =
                ans.selectedOptionId || ans.shortAnswer || "";
              return acc;
            }, {} as Record<string, string>),
          }
        : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[QUIZ_TAKE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
