import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseRouteClient } from '@/lib/supabase/route';

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(200),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());

    const supabase = createSupabaseRouteClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { ok: false, error: error?.message || 'Login failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
