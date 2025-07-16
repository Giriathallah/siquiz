import { QuizStatus } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser({ redirectIfNotFound: true });

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const myPage = parseInt(searchParams.get("myPage") || "1");
    const otherPage = parseInt(searchParams.get("otherPage") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as QuizStatus | null;

    const commonWhere = {
      title: { contains: search },
      ...(status ? { status } : {}),
    };

    const myQuizzesWhere = { ...commonWhere, creatorId: user.id };
    const otherQuizzesWhere = { ...commonWhere, creatorId: { not: user.id } };

    const [myQuizzes, totalMyQuizzes, otherQuizzes, totalOtherQuizzes] =
      await prisma.$transaction([
        prisma.quiz.findMany({
          where: myQuizzesWhere,
          include: {
            category: { select: { name: true } },
            _count: { select: { attempts: true, questions: true } },
          },
          orderBy: { updatedAt: "desc" },
          skip: (myPage - 1) * limit,
          take: limit,
        }),
        prisma.quiz.count({ where: myQuizzesWhere }),
        prisma.quiz.findMany({
          where: otherQuizzesWhere,
          include: {
            category: { select: { name: true } },
            creator: { select: { name: true } },
            _count: { select: { attempts: true, questions: true } },
          },
          orderBy: { updatedAt: "desc" },
          skip: (otherPage - 1) * limit,
          take: limit,
        }),
        prisma.quiz.count({ where: otherQuizzesWhere }),
      ]);

    return NextResponse.json({
      myQuizzes,
      otherQuizzes,
      totalMyQuizzes,
      totalOtherQuizzes,
    });
  } catch (error) {
    console.error("[ADMIN_QUIZZES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
