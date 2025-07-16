import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  authorize,
  AuthError,
} from "@/lib/auth/permissions/serverSidePermission"; // Impor helper otorisasi

// Skema validasi tidak berubah
const updateQuizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  shuffleQuestions: z.boolean(),
  categoryId: z.string().uuid().nullable(),
  tags: z.array(z.object({ name: z.string() })).optional(),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1, "Question text cannot be empty."),
        questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
        points: z.number().min(1),
        explanation: z.string().optional(),
        options: z
          .array(
            z.object({
              optionText: z.string().min(1, "Option text cannot be empty."),
              isCorrect: z.boolean(),
            })
          )
          .min(1, "Each question must have at least one option."),
      })
    )
    .min(1, "Quiz must have at least one question."),
});

// --- Handler GET (Mengambil data kuis untuk form edit) ---
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ambil data kuis terlebih dahulu
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: true,
        tags: true,
        questions: {
          orderBy: { createdAt: "asc" },
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    if (error instanceof AuthError) {
      return new NextResponse(error.message, { status: error.statusCode });
    }
    console.error("[QUIZ_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- Handler PUT (Memperbarui kuis) ---
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    // Ambil data kuis yang ada untuk memeriksa kepemilikan
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { creatorId: true }, // Cukup ambil creatorId untuk otorisasi
    });

    if (!existingQuiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Otorisasi: Cek apakah user boleh mengupdate kuis ini
    authorize(user, "quiz:update:any", existingQuiz);

    const body = await req.json();
    const validation = updateQuizSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { tags, questions, ...quizData } = validation.data;

    const updatedQuiz = await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { quizId: params.id } });
      const quizResult = await tx.quiz.update({
        where: { id: params.id },
        data: {
          ...quizData,
          tags: tags
            ? {
                set: [],
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag.name },
                  create: { name: tag.name },
                })),
              }
            : undefined,
          questions: {
            create: questions.map((q) => ({
              questionText: q.questionText,
              questionType: q.questionType,
              points: q.points,
              explanation: q.explanation,
              options: {
                create: q.options.map((opt) => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect,
                })),
              },
            })),
          },
        },
      });
      return quizResult;
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    if (error instanceof AuthError) {
      return new NextResponse(error.message, { status: error.statusCode });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    console.error("[QUIZ_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- Handler DELETE (Menghapus kuis) ---
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    // Ambil data kuis yang ada untuk memeriksa kepemilikan
    const quizToDelete = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { creatorId: true }, // Cukup ambil creatorId untuk otorisasi
    });

    if (!quizToDelete) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Otorisasi: Cek apakah user boleh menghapus kuis ini
    authorize(user, "quiz:delete:any", quizToDelete);

    // Hapus kuis. Relasi lain (questions, options, dll.) akan terhapus karena onDelete: Cascade
    await prisma.quiz.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    if (error instanceof AuthError) {
      return new NextResponse(error.message, { status: error.statusCode });
    }
    console.error("[QUIZ_DELETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
