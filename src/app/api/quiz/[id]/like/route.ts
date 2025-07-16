// app/api/quiz/[quizId]/like/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ZodError } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Otorisasi pengguna, pastikan hanya user yang login bisa like
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized. Silakan login terlebih dahulu.", {
        status: 401,
      });
    }

    const { id: quizId } = await params;

    if (!quizId) {
      return NextResponse.json(
        { message: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // 2. Cek apakah pengguna sudah pernah me-like kuis ini sebelumnya
    const existingLike = await prisma.quizLike.findUnique({
      where: {
        userId_quizId: {
          // Asumsi Anda punya unique constraint di schema Prisma
          userId: user.id,
          quizId: quizId,
        },
      },
    });

    let isLiked: boolean;
    let message: string;

    if (existingLike) {
      // 3a. Jika sudah ada, hapus like (unlike)
      await prisma.quizLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      isLiked = false;
      message = "Kuis berhasil di-unlike.";
    } else {
      // 3b. Jika belum ada, buat like baru
      await prisma.quizLike.create({
        data: {
          userId: user.id,
          quizId: quizId,
        },
      });
      isLiked = true;
      message = "Kuis berhasil di-like.";
    }

    // 4. Hitung kembali jumlah total like yang baru untuk kuis ini
    const newLikesCount = await prisma.quizLike.count({
      where: {
        quizId: quizId,
      },
    });

    // 5. Kembalikan respons dalam format yang diharapkan frontend
    return NextResponse.json({
      message,
      isLiked,
      newLikesCount,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error("[SAVE_QUIZ_ERROR]", error);
    return new NextResponse("Terjadi kesalahan internal server.", {
      status: 500,
    });
  }
}
