import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" || path === "/auth/login" || path === "/auth/signup";

  // Get the session cookie
  const session = request.cookies.get("session")?.value || "";

  // Redirect based on authentication status and requested path
  if (!isPublicPath && !session) {
    // Redirect to login if trying to access protected route while not authenticated
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPublicPath && session) {
    // Redirect to dashboard if already authenticated and trying to access public route
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Add paths that should be checked by the middleware
export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
