import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@supabase/supabase-js';

const inquirySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().nullable(),
  message: z.string().min(1).max(5000),
  sourceUrl: z.string().max(2000).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = inquirySchema.parse(json);

    const { url, anonKey } = requireSupabaseEnv();
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from('inquiries').insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message,
      source_url: data.sourceUrl ?? null,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
