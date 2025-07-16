import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()), // { questionId: answerValue }
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attemptId = await params.id;
    const body = await req.json();
    const validation = submitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { answers: userAnswers } = validation.data;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId, userId: user.id },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!attempt || attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Attempt not found or already completed" },
        { status: 404 }
      );
    }

    let earnedPoints = 0;
    const totalPoints = attempt.quiz.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );

    type UserAnswerRecord = {
      questionId: string;
      selectedOptionId?: string;
      shortAnswer?: string;
      isCorrect: boolean;
      attemptId: string;
    };
    const userAnswerRecords: UserAnswerRecord[] = [];

    for (const question of attempt.quiz.questions) {
      const userAnswerValue = userAnswers[question.id];
      let isCorrect = false;

      if (
        question.questionType === "MULTIPLE_CHOICE" ||
        question.questionType === "TRUE_FALSE"
      ) {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        if (correctOption && correctOption.id === userAnswerValue) {
          isCorrect = true;
        }
        userAnswerRecords.push({
          questionId: question.id,
          selectedOptionId: userAnswerValue,
          isCorrect,
          attemptId,
        });
      } else if (question.questionType === "SHORT_ANSWER") {
        // [PERBAIKAN] Cari jawaban benar dari tabel options
        const correctAnswerOption = question.options.find(
          (opt) => opt.isCorrect
        );
        if (
          correctAnswerOption &&
          userAnswerValue?.trim().toLowerCase() ===
            correctAnswerOption.optionText.trim().toLowerCase()
        ) {
          isCorrect = true;
        }
        userAnswerRecords.push({
          questionId: question.id,
          shortAnswer: userAnswerValue, // Simpan jawaban teks di sini
          isCorrect,
          attemptId,
        });
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }
    }

    const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Transaksi untuk menyimpan semua jawaban dan mengupdate attempt
    await prisma.$transaction(async (tx) => {
      for (const record of userAnswerRecords) {
        await tx.userAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: record.attemptId,
              questionId: record.questionId,
            },
          },
          update: {
            selectedOptionId: record.selectedOptionId,
            shortAnswer: record.shortAnswer,
            isCorrect: record.isCorrect,
          },
          create: record,
        });
      }

      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: "COMPLETED",
          score: finalScore,
          completedAt: new Date(),
        },
      });
      await tx.quiz.update({
        where: { id: attempt.quizId },
        data: { takesCount: { increment: 1 } },
      });
    });

    const resultData = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        quiz: {
          include: {
            category: true,
            questions: { include: { options: true } },
          },
        },
      },
    });

    return NextResponse.json(resultData);
  } catch (error) {
    console.error("[QUIZ_SUBMIT_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
