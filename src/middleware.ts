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
  "/premium",
];
const adminPaths = ["/dashboard", "/admin"];

function isJWTExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getUserRoleFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for admin routes
  if (adminPaths.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get("token")?.value;

    // Check if token exists and is not expired
    if (!token || isJWTExpired(token)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user has admin role
    const userRole = getUserRoleFromToken(token);
    if (userRole !== "admin") {
      // Redirect non-admin users to home page or show unauthorized page
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return NextResponse.next();
  }

  // Check for other protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
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
    "/premium/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
