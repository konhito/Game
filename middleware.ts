import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Custom authentication middleware - check for custom auth cookies
  const { pathname } = request.nextUrl;

  // /api/payments/webhooks is a webhook endpoint that should be accessible without authentication
  if (pathname.startsWith("/api/payments/webhooks")) {
    return NextResponse.next();
  }

  // Check for custom authentication token in cookies
  const customAuthToken = request.cookies.get('custom_auth_token')?.value;
  const customUserData = request.cookies.get('custom_user_data')?.value;
  
  // User is authenticated if they have custom auth tokens
  const isAuthenticated = customAuthToken && customUserData;

  // If user is authenticated and trying to access sign-in/sign-up, redirect to dashboard
  if (isAuthenticated && ["/sign-in", "/sign-up"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is NOT authenticated and trying to access protected routes, redirect to sign-in
  if (!isAuthenticated && (
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/submit-image")
  )) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Special check for admin routes - only allow admin users
  if (pathname.startsWith("/admin") && isAuthenticated) {
    try {
      const userData = JSON.parse(customUserData);
      if (userData.role !== 'admin') {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/submit-image", "/sign-in", "/sign-up"],
};
