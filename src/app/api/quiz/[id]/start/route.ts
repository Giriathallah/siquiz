import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = params.id;

    // Check jika ada attempt lain yang sedang berjalan untuk kuis ini oleh user ini
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    if (existingAttempt) {
      return NextResponse.json(
        { attemptId: existingAttempt.id },
        { status: 200 }
      );
    }

    const newAttempt = await prisma.quizAttempt.create({
      data: {
        score: 0, // Skor awal
        status: "IN_PROGRESS",
        user: { connect: { id: user.id } },
        quiz: { connect: { id: quizId } },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ attemptId: newAttempt.id }, { status: 201 });
  } catch (error) {
    console.error("[QUIZ_START_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
