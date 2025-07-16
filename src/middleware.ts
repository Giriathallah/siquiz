// File: src/middleware.ts

import { NextResponse, type NextRequest } from "next/server";
import {
  getUserFromSession,
  updateUserSessionExpiration,
} from "./lib/auth/session-edge";

export async function middleware(request: NextRequest) {
  const authResponse = await middlewareAuth(request);
  const response = authResponse ?? NextResponse.next();

  await updateUserSessionExpiration({
    get: (key) => request.cookies.get(key),
    set: (key, value, options) => {
      response.cookies.set({ ...options, name: key, value });
    },
  });

  return response;
}

async function middlewareAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getUserFromSession(request.cookies);

  // Daftar rute yang tidak memerlukan autentikasi
  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/auth",
    "/api/auth",
    "/api/oauth",
    "/_next",
    "/favicon.ico",
  ];

  // Skip middleware untuk public routes dan static files
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    /\.(svg|png|jpg|jpeg|gif|webp|css|js)$/.test(pathname)
  ) {
    return null;
  }

  // Rute admin (dimulai dengan /admin)
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Rute user (dalam folder (user))
  const isUserRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/kuis") ||
    pathname.startsWith("/kuis-taking") ||
    pathname.startsWith("/my-kuis") ||
    pathname.startsWith("/profile");

  // Jika user sudah login
  if (user) {
    // Redirect dari public routes ke dashboard sesuai role
    if (
      pathname === "/" ||
      pathname === "/sign-in" ||
      pathname === "/sign-up"
    ) {
      const redirectPath = user.role === "admin" ? "/admin" : "/home";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Admin mencoba akses user route
    if (isUserRoute && user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // User biasa mencoba akses admin route
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  // Jika user belum login
  else {
    // Block akses ke admin routes
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Block akses ke user routes
    if (isUserRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Pengecekan untuk API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Tambahan pengecekan role untuk API admin
    if (pathname.startsWith("/api/admin") && user.role !== "admin") {
      return new NextResponse(
        JSON.stringify({ message: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return null;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
