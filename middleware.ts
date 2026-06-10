import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('sehatra-token')?.value;
  const { pathname } = request.nextUrl;
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);
  const isApiAuth = pathname.startsWith('/api/auth');

  if (isPublicPath || isApiAuth) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      const user = await verifyToken(token);
      if (user) return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  const user = await verifyToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('sehatra-token');
    return response;
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/monitoring/:path*', '/emergency/:path*', '/records/:path*', '/family/:path*', '/mental-health/:path*', '/detection/:path*', '/healthy-living/:path*', '/admin/:path*', '/login', '/register'],
};
