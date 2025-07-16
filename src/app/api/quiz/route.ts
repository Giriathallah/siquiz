import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import {
  authorize,
  AuthError,
} from "@/lib/auth/permissions/serverSidePermission";
import { quizCreateSchema } from "@/lib/schemas";
import { Difficulty } from "@/generated/prisma";

const getValidEnum = <T extends object>(
  enumObj: T,
  value: unknown
): T[keyof T] | undefined => {
  if (Object.values(enumObj).includes(value as T[keyof T])) {
    return value as T[keyof T];
  }
  return undefined;
};

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");
    const difficulty = getValidEnum(Difficulty, searchParams.get("difficulty"));
    const tags = searchParams.get("tags")?.split(",");
    const sortBy = searchParams.get("sortBy") || "newest";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;
    const where: any = {
      status: "PUBLISHED",
    };
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { message: "Page and limit must be positive integers." },
        { status: 400 }
      );
    }

    if (search) {
      // [FIX] Menghapus `mode: "insensitive"` karena menggunakan MySQL
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { creator: { name: { contains: search } } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          id: {
            in: tags,
          },
        },
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "popular") orderBy = { attempts: { _count: "desc" } };
    if (sortBy === "duration") orderBy = { duration: "asc" };

    const [quizzes, total] = await prisma.$transaction([
      prisma.quiz.findMany({
        skip,
        take: limit,
        where,
        orderBy,
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
            select: { questions: true, likes: true, attempts: true },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    const quizIds = quizzes.map((quiz) => quiz.id);

    // save quiz
    // let savedQuizIds = new Set<string>();

    // if (user && quizIds.length > 0) {
    //   const userSavedQuizzes = await prisma.savedQuiz.findMany({
    //     where: {
    //       userId: user.id,
    //       quizId: {
    //         in: quizIds,
    //       },
    //     },
    //     select: {
    //       quizId: true,
    //     },
    //   });

    //   savedQuizIds = new Set(userSavedQuizzes.map((sq) => sq.quizId));
    // }
    // like quiz
    let savedQuizIds = new Set<string>();
    let likedQuizIds = new Set<string>(); // 1. Buat Set untuk ID kuis yang di-like

    if (user && quizIds.length > 0) {
      // Ambil data saved dan liked dalam satu Promise.all untuk efisiensi
      const [userSavedQuizzes, userLikes] = await Promise.all([
        prisma.savedQuiz.findMany({
          where: { userId: user.id, quizId: { in: quizIds } },
          select: { quizId: true },
        }),
        // 2. Ambil data Like untuk user dan daftar kuis yang ditampilkan
        prisma.quizLike.findMany({
          where: { userId: user.id, quizId: { in: quizIds } },
          select: { quizId: true },
        }),
      ]);

      savedQuizIds = new Set(userSavedQuizzes.map((sq) => sq.quizId));
      likedQuizIds = new Set(userLikes.map((like) => like.quizId)); // 3. Isi Set dengan ID kuis yang di-like
    }

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

    const participantCounts = distinctAttempts.reduce((acc, attempt) => {
      acc[attempt.quizId] = (acc[attempt.quizId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const finalQuizzes = quizzes.map((quiz) => ({
      ...quiz,
      _count: {
        ...quiz._count,
        participants: participantCounts[quiz.id] || 0,
      },

      isSaved: savedQuizIds.has(quiz.id),
      isLiked: likedQuizIds.has(quiz.id),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: finalQuizzes,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    console.error("[QUIZ_GET_ALL_DYNAMIC]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    authorize(user, "quiz:create");

    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in to create a quiz." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const body = quizCreateSchema.parse(json);

    const { tags, questions, isAiGenerated = false, ...quizData } = body;

    const tagOperations = tags?.map((tag) => {
      return {
        where: { name: tag.name },
        create: { name: tag.name },
      };
    });

    const newQuiz = await prisma.quiz.create({
      data: {
        ...quizData,
        creatorId: user.id,
        isAiGenerated,
        tags:
          tags && tags.length > 0
            ? {
                connectOrCreate: tagOperations,
              }
            : undefined,
        questions: {
          create: questions.map((question) => ({
            ...question,
            options: {
              create: question.options,
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[QUIZ_POST]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
