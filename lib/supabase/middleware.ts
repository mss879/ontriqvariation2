import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

export function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const env = getSupabaseEnv();
  if (!env) {
    return response;
  }
  const { url, anonKey } = env;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refresh session if needed.
  // NOTE: we intentionally ignore errors here; unauth will be handled by route guards.
  void supabase.auth.getUser();

  return response;
}
