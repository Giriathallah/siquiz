import { NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized. Silakan login terlebih dahulu.", {
        status: 401,
      });
    }

    const { id: quizId } = await params;

    const existingLike = await prisma.quizLike.findUnique({
      where: {
        userId_quizId: {
          userId: user.id,
          quizId: quizId,
        },
      },
    });

    const quizExists = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quizExists) {
      return new NextResponse("Kuis tidak ditemukan.", { status: 404 });
    }

    if (existingLike) {
      await prisma.$transaction([
        prisma.quizLike.delete({
          where: {
            userId_quizId: {
              userId: user.id,
              quizId: quizId,
            },
          },
        }),
        prisma.quiz.update({
          where: { id: quizId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json(
        { message: "Kuis berhasil di-unlike." },
        { status: 200 }
      );
    } else {
      await prisma.$transaction([
        prisma.quizLike.create({
          data: {
            userId: user.id,
            quizId: quizId,
          },
        }),
        prisma.quiz.update({
          where: { id: quizId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json(
        { message: "Kuis berhasil di-like." },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error("[LIKE_QUIZ_ERROR]", error);
    return new NextResponse("Terjadi kesalahan internal server.", {
      status: 500,
    });
  }
}
