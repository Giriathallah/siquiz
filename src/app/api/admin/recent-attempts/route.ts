import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser({ redirectIfNotFound: true });

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const recentAttempts = await prisma.quizAttempt.findMany({
      take: 5,
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        score: true,
        status: true,
        startedAt: true,
        completedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const formattedAttempts = recentAttempts.map((attempt) => ({
      id: attempt.id,
      user: attempt.user.name || attempt.user.email.split("@")[0],
      quiz: attempt.quiz.title,
      score: attempt.score,
      status: attempt.status,
      completedAt: attempt.completedAt?.toISOString() || null,
    }));

    return NextResponse.json(formattedAttempts);
  } catch (error) {
    console.error("[ADMIN_RECENT_ATTEMPTS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
