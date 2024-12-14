import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Log the request details to the console
  console.log(`[Middleware] Request: ${request.method} ${request.url}`);

  // You can optionally modify the request or response here if needed
  return NextResponse.next(); // Continue to the next middleware or the route handler
}

export const config = {
  matcher: [
    "/api/:path*", // Match all API routes
    "/explorer/:path*", // Match specific pages
    "/:path*", // Match all routes
  ],
};
