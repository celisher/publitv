import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me-in-production'
);

const COOKIE_NAME = 'publitv_token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes (not /admin/login)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === '/admin/login') {
    // If already authenticated, redirect to dashboard
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/admin', req.url));
      } catch {
        // Token invalid, let them see login
      }
    }
    return NextResponse.next();
  }

  // Protect all other /admin/* routes
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL('/admin/login', req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
