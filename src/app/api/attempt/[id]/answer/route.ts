import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answerValue: z.string(),
});

export async function PATCH(
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
    const validation = answerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { questionId, answerValue } = validation.data;

    // Pastikan user hanya bisa mengubah attempt miliknya yang sedang berjalan
    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId: user.id, status: "IN_PROGRESS" },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found or has been completed." },
        { status: 404 }
      );
    }

    // Gunakan `upsert` untuk membuat jawaban jika belum ada, atau update jika sudah ada
    await prisma.userAnswer.upsert({
      where: {
        attemptId_questionId: {
          // Asumsi Anda menambahkan @@unique([attemptId, questionId]) di skema UserAnswer
          attemptId: attemptId,
          questionId: questionId,
        },
      },
      update: {
        selectedOptionId: answerValue, // Sesuaikan ini jika ada short answer
        shortAnswer: null, // atau sebaliknya
      },
      create: {
        attemptId: attemptId,
        questionId: questionId,
        selectedOptionId: answerValue, // Sesuaikan
        isCorrect: false, // Penilaian final tetap dilakukan saat submit
      },
    });

    return NextResponse.json({ message: "Answer saved." }, { status: 200 });
  } catch (error) {
    console.error("[ATTEMPT_ANSWER_PATCH]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
