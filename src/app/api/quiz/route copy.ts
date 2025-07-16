/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/permissions/serverSidePermission";
import { QuizStatus, Difficulty, QuestionType } from "@/generated/prisma";

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

const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  status: z.nativeEnum(QuizStatus).optional(),
  creatorId: z.string().uuid().optional(),
});

// GET /api/quizzes - Get all quizzes with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "quiz:read:any");

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, search, categoryId, difficulty, status, creatorId } =
      query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (creatorId) where.creatorId = creatorId;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          _count: {
            select: { questions: true, attempts: true, likes: true },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    return NextResponse.json({
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch quizzes" },
      { status: (error as any).statusCode || 500 }
    );
  }
}

// POST /api/quizzes - Create new quiz
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request.cookies);
    authorize(user, "quiz:create");

    const body = await request.json();
    const validatedData = createQuizSchema.parse(body);

    const quiz = await prisma.quiz.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        duration: validatedData.duration,
        difficulty: validatedData.difficulty,
        shuffleQuestions: validatedData.shuffleQuestions,
        creatorId: user!.id,
        categoryId: validatedData.categoryId,
        tags: {
          connect: validatedData.tagIds.map((id) => ({ id })),
        },
        questions: {
          create: validatedData.questions.map((question) => ({
            questionText: question.questionText,
            questionType: question.questionType,
            points: question.points,
            explanation: question.explanation,
            options: {
              create: question.options,
            },
          })),
        },
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
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create quiz" },
      { status: error.statusCode || 500 }
    );
  }
}
