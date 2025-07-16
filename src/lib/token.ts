// lib/token.ts
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { redisClient as redis } from "@/redis/redis";

const VERIFICATION_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60; // 24 jam

export async function generateVerificationToken(userId: string) {
  const token = uuidv4();
  const expires = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRATION_SECONDS * 1000
  );

  await redis.set(`verification:${token}`, userId, {
    ex: VERIFICATION_TOKEN_EXPIRATION_SECONDS,
  });

  const dbToken = await prisma.verificationToken.create({
    data: {
      identifier: userId,
      token: token,
      expires: expires,
    },
  });

  return dbToken;
}

export async function verifyToken(token: string) {
  const userId = await redis.get(`verification:${token}`);

  if (userId) {
    // Jika ada di Redis, hapus dari Redis dan database
    await redis.del(`verification:${token}`);
    await prisma.verificationToken.deleteMany({
      where: { token: token, identifier: userId },
    });
    return userId;
  }

  // Jika tidak ada di Redis, coba ambil dari database
  const dbToken = await prisma.verificationToken.findUnique({
    where: { token: token },
  });

  if (dbToken && dbToken.expires > new Date()) {
    // Jika valid di database, hapus dari database
    await prisma.verificationToken.delete({
      where: { token: token },
    });
    return dbToken.identifier;
  }

  return null; // Token tidak valid atau kedaluwarsa
}
