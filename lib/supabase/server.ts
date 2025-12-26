import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { requireSupabaseEnv } from './env';

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, anonKey } = requireSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Server Components can't set cookies; middleware refreshes session cookies.
      setAll() {},
    },
  });
}
