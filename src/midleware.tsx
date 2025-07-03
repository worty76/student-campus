import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register"];
const protectedPaths = [
  "/home",
  "/community",
  "/settings",
  "/bookings",
  "/documents",
  "/friends",
  "/landing",
  "/messages",
  "/notifications",
  "/post",
  "/user",
];

function isJWTExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (protectedPaths.includes(pathname)) {
    const token = request.cookies.get("token")?.value;
    if (!token || isJWTExpired(token)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/community/:path*",
    "/settings/:path*",
    "/bookings/:path*",
    "/documents/:path*",
    "/friends/:path*",
    "/landing/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/post/:path*",
    "/user/:path*",
  ],
};