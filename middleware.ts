import { NextRequest, NextResponse } from "next/server";

// List of routes that should only be accessible to guests (not logged in)
const GUEST_ONLY_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// List of routes that require authentication
const AUTH_REQUIRED_PATHS = [
  "/cart",
  "/checkout",
  "/orders",
  // add more protected routes as needed
];
const ADMIN_ONLY_PATHS = ["/dashboard"];

// Helper to check if path matches any in a list
function matchesPath(path: string, patterns: string[]) {
  return patterns.some((pattern) => path.startsWith(pattern));
}

// JWT verification is handled by the backend API
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rawToken =
    req.cookies.get("token")?.value ||
    req.cookies.get("auth_token")?.value ||
    req.cookies.get("jwt")?.value ||
    req.cookies.get("accessToken")?.value;
  
  // Simply check for presence of auth cookie - let client-side handle role verification
  const hasAuthCookie = !!rawToken;

  // 1. Redirect logged-in users away from guest-only pages
  if (hasAuthCookie && matchesPath(pathname, GUEST_ONLY_PATHS)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Require login for protected pages (basic check)
  if (!hasAuthCookie && matchesPath(pathname, AUTH_REQUIRED_PATHS)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  
  // 3. For admin pages, allow access if user has auth cookie - client will verify role
  if (matchesPath(pathname, ADMIN_ONLY_PATHS)) {
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // 4. Allow all other requests
  return NextResponse.next();
}

// Apply middleware to all routes except static, _next, and api
export const config = {
  matcher: ["/((?!_next|favicon.ico|api|public).*)"],
};
