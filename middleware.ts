import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export function middleware(request: NextRequest) {
  const response = updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Public admin login page.
  if (pathname === '/admin/login') {
    return response;
  }

  // Everything under /admin requires auth.
  if (pathname.startsWith('/admin')) {
    const hasAccessToken = request.cookies.get('sb-access-token');
    const hasAuthHelpersToken = request.cookies
      .getAll()
      .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));

    if (!hasAccessToken && !hasAuthHelpersToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
