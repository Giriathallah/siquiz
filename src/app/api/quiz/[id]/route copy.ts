/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/permissions/serverSidePermission";
import { Difficulty, QuestionType } from "@/generated/prisma";

// Validation schemas
const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  difficulty: z.nativeEnum(Difficulty).default(Difficulty.MEDIUM),
  shuffleQuestions: z.boolean().default(false),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).default([]),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1, "Question text is required"),
        questionType: z.nativeEnum(QuestionType),
        points: z.number().min(1).default(1),
        explanation: z.string().optional(),
        options: z
          .array(
            z.object({
              optionText: z.string().min(1, "Option text is required"),
              isCorrect: z.boolean().default(false),
            })
          )
          .min(1, "At least one option is required"),
      })
    )
    .min(1, "At least one question is required"),
});

const updateQuizSchema = createQuizSchema.partial();

// GET /api/quizzes/[id] - Get quiz by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "quiz:read:any");

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { attempts: true, likes: true },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quiz" },
      { status: error.statusCode || 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request.cookies);

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    authorize(user, "quiz:update:any", { creatorId: quiz.creatorId });

    const body = await request.json();
    const validatedData = updateQuizSchema.parse(body);

    const updatedQuiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        tags: validatedData.tagIds
          ? {
              set: validatedData.tagIds.map((id) => ({ id })),
            }
          : undefined,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true },
        },
        tags: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error: any) {
    console.error("Error updating quiz:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update quiz" },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromSession(request.cookies);

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    authorize(user, "quiz:delete:any", { creatorId: quiz.creatorId });

    await prisma.quiz.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete quiz" },
      { status: error.statusCode || 500 }
    );
  }
}
