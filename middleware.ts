import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("adminToken")?.value;
  const pathname = req.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/login/set_password"
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // If it's a public path and user has token, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If it's not a public path and no token, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL("/auth/login", req.url);
    // Add redirect URL for after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};